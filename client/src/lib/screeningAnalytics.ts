/**
 * screeningAnalytics.ts
 * Sprint 2.2 — Step 7a + Step 7b + Step 7c: Funnel Instrumentation Library
 *
 * Exports:
 *   FunnelSession, FunnelStep, PathType
 *   trackFunnelStart
 *   trackFunnelSubmit
 *   trackFunnelAbandonment
 *   trackFunnelPathSelected
 *   trackHistoryView
 *   markScreeningBookedAfterResult
 *   upsertScreeningResultAnalytics   ← NEW (fixes ScreeningPage.tsx build error)
 */

import { supabase } from "@/lib/supabaseClient";
import { getCurrentUserId } from "./accountData";

// ─── Types ───────────────────────────────────────────────────────────────────

export type FunnelStep =
  | "self_assessment_form"
  | "child_assessment_form"
  | "choose_child_path"
  | "screening_intro"
  | "screening_questions"
  | "screening_result";

export type PathType = "learning" | "adhd";

// ─── FunnelSession ───────────────────────────────────────────────────────────

export class FunnelSession {
  private _sessionId: string;
  readonly pathType: PathType | "choose";
  readonly startedAt: number;
  submittedAt: number | null = null;
  hesitationCount: number = 0;
  deviceType: "mobile" | "tablet" | "desktop";
  historyViewed: boolean = false;

  constructor(sessionId: string, pathType: PathType | "choose") {
    this._sessionId = sessionId;
    this.pathType   = pathType;
    this.startedAt  = Date.now();
    this.deviceType = detectDevice();
  }

  get sessionId(): string {
    return this._sessionId;
  }

  attachRealSessionId(realId: string): void {
    if (!this._sessionId.startsWith("pending-")) return;
    this._sessionId = realId;
  }

  onHesitation(): void { this.hesitationCount++; }
  onHistoryView(): void { this.historyViewed = true; }
  getTimeOnForm(): number { return Math.round((Date.now() - this.startedAt) / 1000); }
}

// ─── Device Detection ────────────────────────────────────────────────────────

function detectDevice(): "mobile" | "tablet" | "desktop" {
  const w = window.innerWidth;
  if (w < 768)  return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}

// ─── trackFunnelStart ────────────────────────────────────────────────────────

export async function trackFunnelStart(
  session: FunnelSession
): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) return;
  await supabase.from("screening_analytics").upsert(
    {
      session_id:      session.sessionId,
      user_id:         userId,
      path_type:       session.pathType,
      form_started_at: new Date().toISOString(),
      device_type:     session.deviceType,
    },
    { onConflict: "session_id" }
  );
}

// ─── trackFunnelSubmit ───────────────────────────────────────────────────────

export async function trackFunnelSubmit(
  session: FunnelSession
): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) return;
  session.submittedAt = Date.now();
  const timeOnForm = session.getTimeOnForm();
  await supabase.from("screening_analytics").upsert(
    {
      session_id:        session.sessionId,
      user_id:           userId,
      path_type:         session.pathType,
      form_submitted_at: new Date().toISOString(),
      time_on_form_sec:  timeOnForm,
      hesitation_count:  session.hesitationCount,
      device_type:       session.deviceType,
      history_viewed:    session.historyViewed,
      is_abandoned:      false,
    },
    { onConflict: "session_id" }
  );
}

// ─── trackFunnelAbandonment ──────────────────────────────────────────────────

export async function trackFunnelAbandonment(
  session: FunnelSession,
  abandonedAtStep: FunnelStep
): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) return;
  const timeOnForm = session.getTimeOnForm();
  await supabase.from("screening_analytics").upsert(
    {
      session_id:         session.sessionId,
      user_id:            userId,
      path_type:          session.pathType,
      is_abandoned:       true,
      abandoned_at:       new Date().toISOString(),
      abandoned_at_step:  abandonedAtStep,
      time_on_form_sec:   timeOnForm,
      hesitation_count:   session.hesitationCount,
      device_type:        session.deviceType,
    },
    { onConflict: "session_id" }
  );
}

// ─── trackFunnelPathSelected ─────────────────────────────────────────────────

export async function trackFunnelPathSelected(
  session: FunnelSession,
  pathType: PathType,
  childId: string
): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) return;
  session.attachRealSessionId(childId);
  await supabase.from("screening_analytics").upsert(
    {
      session_id:      session.sessionId,
      user_id:         userId,
      path_type:       pathType,
      form_started_at: new Date().toISOString(),
      device_type:     session.deviceType,
      is_abandoned:    false,
    },
    { onConflict: "session_id" }
  );
}

// ─── trackHistoryView ────────────────────────────────────────────────────────

export async function trackHistoryView(
  sessionId: string
): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) return;
  await supabase
    .from("screening_analytics")
    .update({ history_viewed: true })
    .eq("session_id", sessionId);
}

// ─── markScreeningBookedAfterResult ───────────────────────────────────────────
//
// يُستدعى من Booking.tsx بعد إتمام الحجز بنجاح.
// مؤشر Funnel → Booked في الـ analytics.

export async function markScreeningBookedAfterResult(
  sessionId: string,
  serviceId: string,
  specialistId: string
): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) return;
  await supabase.from("screening_analytics").upsert(
    {
      session_id:           sessionId,
      user_id:              userId,
      booked_after_result:  true,
      booked_service_id:    serviceId,
      booked_specialist_id: specialistId,
      booked_at:            new Date().toISOString(),
    },
    { onConflict: "session_id" }
  );
}

// ─── upsertScreeningResultAnalytics ──────────────────────────────────────────
//
// يُستدعى من ScreeningPage.tsx عند اكتمال الفحص (handleComplete).
// يحفظ ملخص النتيجة + معلومات الجلسة في جدول screening_analytics.
// fire-and-forget — لا يحجب التنقل أو UI.

export interface ScreeningResultAnalyticsPayload {
  sessionId:    string;
  pathType:     string;      // "learning" | "adhd"
  screeningType: string;     // "dyslexia" | "adhd" | "general" | "autism"
  mode?:        string;      // "self" | undefined (child mode)
  subjectType:  "self" | "child";
  subjectName:  string;
  subjectAge:   string;      // string لأن URL searchParam
  result:       Record<string, unknown>;
  completedAt:  string;
  source:       string;      // e.g. "screening_page_complete"
}

export async function upsertScreeningResultAnalytics(
  payload: ScreeningResultAnalyticsPayload
): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) return;

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

  // استخراج ملخص النتيجة بشكل آمن (resultقد يكون nested)
  const r = (result?.result ?? result) as Record<string, unknown> | null;
  const percentage  = typeof r?.percentage  === "number" ? r.percentage  : null;
  const riskLevel   = typeof r?.riskLevel   === "string"  ? r.riskLevel   : null;
  const riskLabel   = typeof r?.riskLabel   === "string"  ? r.riskLabel   : null;

  await supabase.from("screening_analytics").upsert(
    {
      session_id:        sessionId,
      user_id:           userId,
      path_type:         pathType,
      screening_type:    screeningType,
      subject_type:      subjectType,
      subject_name:      subjectName,
      subject_age:       subjectAge,
      mode:              mode ?? null,
      result_percentage: percentage,
      result_risk_level: riskLevel,
      result_risk_label: riskLabel,
      result_json:       result,
      form_submitted_at: completedAt,
      completed_at:      completedAt,
      is_abandoned:      false,
      analytics_source:  source,
    },
    { onConflict: "session_id" }
  );
}
