/**
 * screeningAnalytics.ts — Sprint 4 + Sprint 2.2 Step 7a
 *
 * Lightweight analytics helper for Supabase public.screening_analytics.
 *
 * طبقات هذا الملف:
 *   1. upsertScreeningResultAnalytics() — عند اكتمال الفحص (Sprint 4)
 *   2. markScreeningBookedAfterResult() — عند الحجز (Sprint 4)
 *   3. FunnelSession                    — حافظ حالة الفنل (Step 7a)
 *   4. trackFunnelStart()               — أول interaction بالفورم (Step 7a)
 *   5. trackFunnelSubmit()              — submit الفورم (Step 7a)
 *   6. trackFunnelAbandonment()         — مغادرة بدون إتمام (Step 7a)
 *   7. trackHistoryView()               — فتح سجل التقييمات (Step 7a)
 *
 * قواعد ثابتة (Rules):
 *   • Never throws to the UI
 *   • Never blocks rendering
 *   • Never stores raw result JSON, AI explanation, or recommendations
 *   • Only upserts when user is authenticated
 *   • All writes use upsert on session_id — no duplicate rows
 *   • Each function makes at most ONE Supabase call
 */

import { isSupabaseConfigured, supabase } from "./supabaseClient";

// ───────────────────────────────────────────────────────────────────────────────
// Types (Sprint 4)
// ───────────────────────────────────────────────────────────────────────────────

export interface ScreeningAnalyticsParams {
  sessionId: string;
  pathType?: string;
  screeningType?: string;
  mode?: string;
  subjectType?: "self" | "child" | "unknown";
  subjectName?: string;
  subjectAge?: string | number;
  localChildId?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  result?: Record<string, any>;
  completedAt?: string;
  /** Override the source field (default: 'screening_result_page') */
  source?: string;
}

export interface AnalyticsResult {
  ok: boolean;
  reason?: string;
}

// ───────────────────────────────────────────────────────────────────────────────
// Step 7a — Funnel Types
// ───────────────────────────────────────────────────────────────────────────────

export type DeviceType = "mobile" | "tablet" | "desktop";

export type AbandonedAtStep =
  | "self_assessment_form"
  | "screening_intro"
  | "screening_questions";

/**
 * حالة الفنل لجلسة واحدة.
 * تُحفظ في الذاكرة فقط — لا localStorage، لا IndexedDB.
 * تُستخدم من طرف AssessmentForm و AssessmentHistory.
 */
export class FunnelSession {
  readonly sessionId: string;
  readonly pathType: string;
  readonly deviceType: DeviceType;
  readonly startedAt: Date;

  private _submittedAt: Date | null = null;
  private _hesitationCount = 0;
  private _historyViewed = false;
  private _blurredFields = new Set<string>();

  constructor(sessionId: string, pathType: string) {
    this.sessionId   = sessionId;
    this.pathType    = pathType;
    this.deviceType  = detectDeviceType();
    this.startedAt   = new Date();
  }

  /** يُسجَّل blur على حقل — blur ثاني = hesitation */
  onFieldBlur(fieldName: string) {
    if (this._blurredFields.has(fieldName)) {
      this._hesitationCount++;
    } else {
      this._blurredFields.add(fieldName);
    }
  }

  onSubmit() {
    this._submittedAt = new Date();
  }

  onHistoryView() {
    this._historyViewed = true;
  }

  get submittedAt()     { return this._submittedAt; }
  get hesitationCount() { return this._hesitationCount; }
  get historyViewed()   { return this._historyViewed; }

  get timeToSubmitSecs(): number | null {
    if (!this._submittedAt) return null;
    return Math.round((this._submittedAt.getTime() - this.startedAt.getTime()) / 1000);
  }
}

// ───────────────────────────────────────────────────────────────────────────────
// Step 7a — Device Helper
// ───────────────────────────────────────────────────────────────────────────────

/**
 * كشف نوع الجهاز بناءً على عرض الشاشة.
 * متاح للاستخدام في FunnelSession و في أي مكان آخر.
 */
export function detectDeviceType(): DeviceType {
  if (typeof window === "undefined") return "desktop";
  const w = window.innerWidth;
  if (w < 768)  return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}

// ───────────────────────────────────────────────────────────────────────────────
// Internal Auth Helper
// ───────────────────────────────────────────────────────────────────────────────

async function getCurrentUserId(): Promise<string | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id ?? null;
  } catch {
    return null;
  }
}

// ───────────────────────────────────────────────────────────────────────────────
// Step 7a — Funnel Tracking Functions
// ───────────────────────────────────────────────────────────────────────────────

/**
 * ط
 * trackFunnelStart — يُرسل عند أول interaction بالفورم
 *
 * متى يُطلب: onFocus على حقل الاسم أو العمر
 * ماذا يفعل: upsert بجلسة جديدة مع form_started_at + device_type
 * سبب upsert (ليس insert): إذا كان المستخدم فتح الصفحة أكثر من مرة
 */
export async function trackFunnelStart(
  session: FunnelSession
): Promise<AnalyticsResult> {
  if (!isSupabaseConfigured) return { ok: false, reason: "supabase_not_configured" };

  const userId = await getCurrentUserId();
  if (!userId) return { ok: false, reason: "not_authenticated" };

  try {
    const { error } = await supabase
      .from("screening_analytics")
      .upsert(
        {
          user_id:         userId,
          session_id:      session.sessionId,
          path_type:       session.pathType,
          form_started_at: session.startedAt.toISOString(),
          device_type:     session.deviceType,
          source:          "self_assessment_form",
        },
        { onConflict: "session_id", ignoreDuplicates: false }
      );

    if (error) {
      console.error("[funnelAnalytics] trackFunnelStart error:", error.code, error.message);
      return { ok: false, reason: error.code ?? "upsert_failed" };
    }
    return { ok: true };
  } catch (err) {
    console.error("[funnelAnalytics] trackFunnelStart unexpected:", err instanceof Error ? err.message : "unknown");
    return { ok: false, reason: "unexpected_error" };
  }
}

/**
 * trackFunnelSubmit — يُحدّث بيانات التقديم على الصف الموجود
 *
 * متى يُطلب: فور نجاح handleSubmit (validation pass)
 * ماذا يفعل: يحدت form_submitted_at + time_to_submit_secs + hesitation_count
 */
export async function trackFunnelSubmit(
  session: FunnelSession
): Promise<AnalyticsResult> {
  if (!isSupabaseConfigured) return { ok: false, reason: "supabase_not_configured" };

  const userId = await getCurrentUserId();
  if (!userId) return { ok: false, reason: "not_authenticated" };

  session.onSubmit();

  try {
    const { error } = await supabase
      .from("screening_analytics")
      .update({
        form_submitted_at:   new Date().toISOString(),
        time_to_submit_secs: session.timeToSubmitSecs,
        hesitation_count:    session.hesitationCount,
        updated_at:          new Date().toISOString(),
      })
      .eq("session_id", session.sessionId)
      .eq("user_id",    userId);

    if (error) {
      console.error("[funnelAnalytics] trackFunnelSubmit error:", error.code, error.message);
      return { ok: false, reason: error.code ?? "update_failed" };
    }
    return { ok: true };
  } catch (err) {
    console.error("[funnelAnalytics] trackFunnelSubmit unexpected:", err instanceof Error ? err.message : "unknown");
    return { ok: false, reason: "unexpected_error" };
  }
}

/**
 * trackFunnelAbandonment — يُرسل عند مغادرة المستخدم بعد بدء التفاعل
 *
 * متى يُطلب: beforeunload event (route leave أو tab close)
 * ماذا يفعل:
 *   • إذا لم يكن هناك session_id موجود = upsert جديد (partial row)
 *   • إذا كان موجود = update فقط
 */
export async function trackFunnelAbandonment(
  session: FunnelSession,
  atStep: AbandonedAtStep = "self_assessment_form"
): Promise<AnalyticsResult> {
  if (!isSupabaseConfigured) return { ok: false, reason: "supabase_not_configured" };

  const userId = await getCurrentUserId();
  if (!userId) return { ok: false, reason: "not_authenticated" };

  try {
    const { error } = await supabase
      .from("screening_analytics")
      .upsert(
        {
          user_id:          userId,
          session_id:       session.sessionId,
          path_type:        session.pathType,
          form_started_at:  session.startedAt.toISOString(),
          device_type:      session.deviceType,
          hesitation_count: session.hesitationCount,
          abandoned:        true,
          abandoned_at_step: atStep,
          source:           "self_assessment_form",
          updated_at:       new Date().toISOString(),
        },
        { onConflict: "session_id", ignoreDuplicates: false }
      );

    if (error) {
      console.error("[funnelAnalytics] trackFunnelAbandonment error:", error.code, error.message);
      return { ok: false, reason: error.code ?? "upsert_failed" };
    }
    return { ok: true };
  } catch (err) {
    console.error("[funnelAnalytics] trackFunnelAbandonment unexpected:", err instanceof Error ? err.message : "unknown");
    return { ok: false, reason: "unexpected_error" };
  }
}

/**
 * trackHistoryView — يُحدّث الصف عند فتح AssessmentHistory
 *
 * متى يُطلب: onToggleHistory() في SelfAssessment عند فتح السجل
 * ملاحظة: يحتاج لـ session_id من FunnelSession لتحديد الصف الصحيح
 */
export async function trackHistoryView(
  sessionId: string
): Promise<AnalyticsResult> {
  if (!isSupabaseConfigured) return { ok: false, reason: "supabase_not_configured" };

  const userId = await getCurrentUserId();
  if (!userId) return { ok: false, reason: "not_authenticated" };

  try {
    const { error } = await supabase
      .from("screening_analytics")
      .update({
        history_viewed: true,
        updated_at:     new Date().toISOString(),
      })
      .eq("session_id", sessionId)
      .eq("user_id",    userId);

    if (error) {
      console.error("[funnelAnalytics] trackHistoryView error:", error.code, error.message);
      return { ok: false, reason: error.code ?? "update_failed" };
    }
    return { ok: true };
  } catch (err) {
    console.error("[funnelAnalytics] trackHistoryView unexpected:", err instanceof Error ? err.message : "unknown");
    return { ok: false, reason: "unexpected_error" };
  }
}

// ───────────────────────────────────────────────────────────────────────────────
// Sprint 4 — Original Functions (unchanged)
// ───────────────────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function safeNum(value: any): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return isNaN(n) ? null : n;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function safeStr(value: any): string | null {
  if (value === null || value === undefined) return null;
  const s = String(value).trim();
  return s === "" ? null : s;
}

/**
 * Marks a screening_analytics row as booked_after_result = true.
 * (Sprint 4 — unchanged)
 */
export async function markScreeningBookedAfterResult(
  sessionId: string
): Promise<{ ok: boolean; reason?: string }> {
  if (!isSupabaseConfigured) return { ok: false, reason: "supabase_not_configured" };
  if (!sessionId || sessionId.trim() === "") return { ok: false, reason: "missing_session_id" };

  const userId = await getCurrentUserId();
  if (!userId) return { ok: false, reason: "not_authenticated" };

  try {
    const { error } = await supabase
      .from("screening_analytics")
      .update({
        booked_after_result: true,
        updated_at: new Date().toISOString(),
      })
      .eq("session_id", sessionId)
      .eq("user_id", userId);

    if (error) {
      console.error("[screeningAnalytics] markBooked error:", error.code, error.message);
      return { ok: false, reason: error.code ?? "update_failed" };
    }
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    console.error("[screeningAnalytics] markBooked unexpected error:", msg);
    return { ok: false, reason: "unexpected_error" };
  }
}

/**
 * Upserts a completed screening result into public.screening_analytics.
 * (Sprint 4 — unchanged)
 */
export async function upsertScreeningResultAnalytics(
  params: ScreeningAnalyticsParams
): Promise<AnalyticsResult> {
  if (!isSupabaseConfigured) return { ok: false, reason: "supabase_not_configured" };
  if (!params.sessionId)       return { ok: false, reason: "missing_session_id" };

  const userId = await getCurrentUserId();
  if (!userId) return { ok: false, reason: "not_authenticated" };

  const r = params.result ?? {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const inner: Record<string, any> =
    r.result && typeof r.result === "object" ? r.result : {};

  const score      = safeNum(r.score ?? r.totalScore ?? r.resultScore ?? inner.score ?? inner.totalScore);
  const percentage = safeNum(r.percentage ?? inner.percentage ?? r.result?.percentage);
  const riskLevel  = safeStr(r.riskLevel  ?? inner.riskLevel  ?? r.result?.riskLevel);
  const riskLabel  = safeStr(r.riskLabel  ?? inner.riskLabel  ?? r.result?.riskLabel);
  const resultLevel = safeStr(
    r.level ?? r.category ?? inner.riskLabel ?? inner.riskLevel ?? r.result?.riskLabel ?? r.result?.riskLevel
  );
  const completedAt = params.completedAt ?? safeStr(
    r.completedAt ?? r.completed_at ?? r.createdAt ?? r.timestamp
  ) ?? new Date().toISOString();
  const pathType    = safeStr(params.pathType ?? r.pathType ?? r.screeningType) ?? "unknown";
  const subjectAge  = safeStr(params.subjectAge  ?? r.childAge ?? r.age ?? r.subjectAge ?? inner.age ?? inner.childAge);
  const subjectName = safeStr(params.subjectName ?? r.childName ?? r.name ?? r.userName  ?? inner.name ?? inner.childName);

  const payload = {
    user_id:        userId,
    session_id:     params.sessionId,
    local_child_id: safeStr(params.localChildId) ?? null,
    subject_type:   params.subjectType ?? "unknown",
    subject_name:   subjectName,
    subject_age:    subjectAge,
    mode:           safeStr(params.mode ?? r.mode ?? r.assessmentMode) ?? null,
    path_type:      pathType,
    screening_type: safeStr(params.screeningType ?? r.screeningType ?? r.type ?? r.pathType) ?? null,
    score,
    percentage,
    risk_level:   riskLevel,
    risk_label:   riskLabel,
    result_level: resultLevel,
    completed_at: completedAt,
    source:       params.source ?? "screening_result_page",
  };

  try {
    const { error } = await supabase
      .from("screening_analytics")
      .upsert(payload, { onConflict: "session_id", ignoreDuplicates: false });

    if (error) {
      console.error("[screeningAnalytics] upsert error:", error.code, error.message);
      return { ok: false, reason: error.code ?? "upsert_failed" };
    }
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    console.error("[screeningAnalytics] unexpected error:", msg);
    return { ok: false, reason: "unexpected_error" };
  }
}
