/**
 * screeningAnalytics.ts
 * Sprint 2.2 — Step 7a + Step 7b + Step 7c + Step 7d (audit fixes)
 * Sprint 2.3 — Issue #46: Anonymous Funnel Tracking
 *
 * Exports:
 *   FunnelSession, FunnelStep
 *   trackFunnelStart
 *   trackFunnelSubmit
 *   trackFunnelAbandonment
 *   trackFunnelPathSelected
 *   trackHistoryView
 *   markScreeningBookedAfterResult
 *   upsertScreeningResultAnalytics
 *
 * AUDIT FIXES (2026-05-18):
 *   #1 — attachRealSessionId: استبدال prefix-check بـ boolean flag (_realIdAttached)
 *   #4 — session_id alignment: trackFunnelPathSelected يكتب session_id = childId ("funnel_child_{childId}")
 *        ليتطابق مع ما تستخدمه ScreeningPage + useChildAssessmentState.
 *   #6 — PathType: حُذف من هنا — يُستورد من assessmentTypes.ts مصدر الحقيقة الوحيد.
 *
 * ISSUE #46 — Anonymous Tracking (Sprint 2.3):
 *   — بدلاً من if (!userId) return; نستخدم anonymous fallback
 *   — غير المسجل يحصل على anon_{uuid} من sessionStorage
 *   — is_anonymous: true يُضاف لكل row anonymous
 *   — يسمح بتتبع funnel drop-offs قبل التسجيل
 */
import { supabase } from "@/lib/supabaseClient";
import { getCurrentUserId } from "./accountData";
import { getOrCreateAnonId, isAnonId } from "./anonymousSession";
import type { PathType } from "@/components/screening/assessmentTypes";
// PathType re-exported للـ consumers الذين يستوردونه من هنا (backward compat)
export type { PathType } from "@/components/screening/assessmentTypes";

// ─── Types ───────────────────────────────────────────────────────────────────
export type FunnelStep =
  | "self_assessment_form"
  | "child_assessment_form"
  | "choose_child_path"
  | "screening_intro"
  | "screening_questions"
  | "screening_result";

// ─── getEffectiveUserId ───────────────────────────────────────────────────────
// Issue #46: يُرجع auth uid إذا مسجّل، وإلا anon_{uuid} من sessionStorage.
// لا يُرجع null أبداً — يضمن كتابة كل funnel event في DB.
async function getEffectiveUserId(): Promise<{ id: string; isAnon: boolean }> {
  const userId = await getCurrentUserId();
  if (userId) return { id: userId, isAnon: false };
  const anonId = getOrCreateAnonId();
  return { id: anonId, isAnon: true };
}

// ─── FunnelSession ───────────────────────────────────────────────────────────
export class FunnelSession {
  private _sessionId: string;
  // FIX #1: boolean flag بدلاً من prefix-check — يمنع أي race condition
  private _realIdAttached: boolean = false;
  readonly pathType: PathType | "choose";
  readonly startedAt: number;
  submittedAt: number | null = null;
  hesitationCount: number = 0;
  deviceType: "mobile" | "tablet" | "desktop";
  historyViewed: boolean = false;

  constructor(sessionId: string, pathType: PathType | "choose") {
    this._sessionId = sessionId;
    this.pathType = pathType;
    this.startedAt = Date.now();
    this.deviceType = detectDevice();
  }

  get sessionId(): string {
    return this._sessionId;
  }

  /** آمن ضد الاستدعاء المزدوج وضد childId يبدأ بـ "pending-" */
  attachRealSessionId(realId: string): void {
    if (this._realIdAttached) return; // FIX #1: guard حقيقي
    if (!realId || realId === this._sessionId) return;
    this._sessionId = realId;
    this._realIdAttached = true;
  }

  get isRealIdAttached(): boolean {
    return this._realIdAttached;
  }

  onHesitation(): void {
    this.hesitationCount++;
  }
  onHistoryView(): void {
    this.historyViewed = true;
  }
  getTimeOnForm(): number {
    return Math.round((Date.now() - this.startedAt) / 1000);
  }
}

// ─── Device Detection ────────────────────────────────────────────────────────
function detectDevice(): "mobile" | "tablet" | "desktop" {
  const w = window.innerWidth;
  if (w < 768) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}

// ─── buildChildFunnelSessionId ────────────────────────────────────────────────
// FIX #4: توليد session_id موحّد لمسار الطفل.
export function buildChildFunnelSessionId(childId: string): string {
  return `funnel_child_${childId}`;
}

// ─── trackFunnelStart ────────────────────────────────────────────────────────
// Issue #46: يعمل للمسجّل وغير المسجّل — is_anonymous يُحدد النوع.
export async function trackFunnelStart(
  session: FunnelSession
): Promise<void> {
  const { id: userId, isAnon } = await getEffectiveUserId();
  await supabase.from("screening_analytics").upsert(
    {
      session_id: session.sessionId,
      user_id: userId,
      path_type: session.pathType,
      form_started_at: new Date().toISOString(),
      device_type: session.deviceType,
      is_anonymous: isAnon,
    },
    { onConflict: "session_id" }
  );
}

// ─── trackFunnelSubmit ───────────────────────────────────────────────────────
// Issue #46: anonymous users يمكنهم submit — بعد التسجيل is_anonymous = false.
export async function trackFunnelSubmit(
  session: FunnelSession
): Promise<void> {
  const { id: userId, isAnon } = await getEffectiveUserId();
  session.submittedAt = Date.now();
  const timeOnForm = session.getTimeOnForm();
  await supabase.from("screening_analytics").upsert(
    {
      session_id: session.sessionId,
      user_id: userId,
      path_type: session.pathType,
      form_submitted_at: new Date().toISOString(),
      time_on_form_sec: timeOnForm,
      hesitation_count: session.hesitationCount,
      device_type: session.deviceType,
      history_viewed: session.historyViewed,
      is_abandoned: false,
      is_anonymous: isAnon,
    },
    { onConflict: "session_id" }
  );
}

// ─── trackFunnelAbandonment ──────────────────────────────────────────────────
// Issue #46: anonymous abandonment يُسجَّل — هذا هو المقياس الأهم للـ drop-off.
export async function trackFunnelAbandonment(
  session: FunnelSession,
  abandonedAtStep: FunnelStep
): Promise<void> {
  // لا نُسجّل abandonment إذا لم تبدأ جلسة حقيقية بعد (pending)
  // الاستثناء: anonymous session — تبدأ من أول زيارة حتى بدون submit
  const { id: userId, isAnon } = await getEffectiveUserId();
  // للمستخدم المسجّل: نحتاج realId مرتبط أو submitted
  if (!isAnon && !session.isRealIdAttached && session.submittedAt === null) return;
  if (session.submittedAt !== null) return; // بالفعل submitted
  const timeOnForm = session.getTimeOnForm();
  await supabase.from("screening_analytics").upsert(
    {
      session_id: session.sessionId,
      user_id: userId,
      path_type: session.pathType,
      is_abandoned: true,
      abandoned_at: new Date().toISOString(),
      abandoned_at_step: abandonedAtStep,
      time_on_form_sec: timeOnForm,
      hesitation_count: session.hesitationCount,
      device_type: session.deviceType,
      is_anonymous: isAnon,
    },
    { onConflict: "session_id" }
  );
}

// ─── trackFunnelPathSelected ─────────────────────────────────────────────────
// FIX #4: يستخدم buildChildFunnelSessionId(childId) كـ session_id
export async function trackFunnelPathSelected(
  session: FunnelSession,
  pathType: PathType,
  childId: string
): Promise<void> {
  const { id: userId, isAnon } = await getEffectiveUserId();
  const unifiedId = buildChildFunnelSessionId(childId);
  session.attachRealSessionId(unifiedId);
  await supabase.from("screening_analytics").upsert(
    {
      session_id: session.sessionId, // = unifiedId
      user_id: userId,
      path_type: pathType,
      form_started_at: new Date().toISOString(),
      device_type: session.deviceType,
      is_abandoned: false,
      is_anonymous: isAnon,
    },
    { onConflict: "session_id" }
  );
}

// ─── trackHistoryView ────────────────────────────────────────────────────────
export async function trackHistoryView(
  sessionId: string
): Promise<void> {
  const { id: userId } = await getEffectiveUserId();
  await supabase
    .from("screening_analytics")
    .update({ history_viewed: true })
    .eq("session_id", sessionId);
  // userId captured for potential future use (auditing)
  void userId;
}

// ─── markScreeningBookedAfterResult ───────────────────────────────────────────
export async function markScreeningBookedAfterResult(
  sessionId: string,
  serviceId: string,
  specialistId: string
): Promise<void> {
  const { id: userId, isAnon } = await getEffectiveUserId();
  await supabase.from("screening_analytics").upsert(
    {
      session_id: sessionId,
      user_id: userId,
      booked_after_result: true,
      booked_service_id: serviceId,
      booked_specialist_id: specialistId,
      booked_at: new Date().toISOString(),
      is_anonymous: isAnon,
    },
    { onConflict: "session_id" }
  );
}

// ─── upsertScreeningResultAnalytics ──────────────────────────────────────────
export interface ScreeningResultAnalyticsPayload {
  sessionId: string;
  pathType: string;
  screeningType: string;
  mode?: string;
  subjectType: "self" | "child";
  subjectName: string;
  subjectAge: string;
  result: Record<string, unknown>;
  completedAt: string;
  source: string;
}
export async function upsertScreeningResultAnalytics(
  payload: ScreeningResultAnalyticsPayload
): Promise<void> {
  const { id: userId, isAnon } = await getEffectiveUserId();
  const {
    sessionId,
    pathType,
    screeningType,
    mode,
    subjectType,
    subjectName,
    subjectAge,
    result,
    completedAt,
    source,
  } = payload;
  const r = (result?.result ?? result) as Record<string, unknown> | null;
  const percentage = typeof r?.percentage === "number" ? (r as any).percentage : null;
  const riskLevel = typeof r?.riskLevel === "string" ? (r as any).riskLevel : null;
  const riskLabel = typeof r?.riskLabel === "string" ? (r as any).riskLabel : null;

  await supabase.from("screening_analytics").upsert(
    {
      session_id: sessionId,
      user_id: userId,
      path_type: pathType,
      screening_type: screeningType,
      subject_type: subjectType,
      subject_name: subjectName,
      subject_age: subjectAge,
      mode: mode ?? null,
      result_percentage: percentage,
      result_risk_level: riskLevel,
      result_risk_label: riskLabel,
      result_json: result,
      form_submitted_at: completedAt,
      completed_at: completedAt,
      is_abandoned: false,
      analytics_source: source,
      is_anonymous: isAnon,
    },
    { onConflict: "session_id" }
  );
}
