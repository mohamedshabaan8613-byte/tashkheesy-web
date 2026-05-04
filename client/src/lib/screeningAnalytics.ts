/**
 * screeningAnalytics.ts — Sprint 4
 *
 * Lightweight analytics helper: upserts a completed screening result
 * into public.screening_analytics in Supabase.
 *
 * Rules:
 * - Never throws to the UI.
 * - Never blocks rendering.
 * - Never stores raw result JSON, AI explanation, or recommendations.
 * - Only inserts when user is authenticated.
 * - Upserts by session_id to prevent duplicate rows.
 * - Logs only safe error code/message (no sensitive payload).
 */

import { isSupabaseConfigured, supabase } from "./supabaseClient";

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Safe field extractors ────────────────────────────────────────────────────

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

// ─── Main helper ─────────────────────────────────────────────────────────────

// ─── Booking update helper ───────────────────────────────────────────────────

/**
 * Marks a screening_analytics row as booked_after_result = true.
 *
 * Called only after Formspree booking submission succeeds.
 * Uses session_id + user_id guard — never touches other users' rows.
 * Returns { ok: true } on success or { ok: false, reason } on failure.
 * Never throws.
 */
export async function markScreeningBookedAfterResult(
  sessionId: string
): Promise<{ ok: boolean; reason?: string }> {
  // Guard 1: Supabase must be configured
  if (!isSupabaseConfigured) {
    return { ok: false, reason: "supabase_not_configured" };
  }

  // Guard 2: sessionId is required
  if (!sessionId || sessionId.trim() === "") {
    return { ok: false, reason: "missing_session_id" };
  }

  // Guard 3: user must be authenticated
  let userId: string | null = null;
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userId = user?.id ?? null;
  } catch {
    return { ok: false, reason: "auth_check_failed" };
  }

  if (!userId) {
    // Booking is public — unauthenticated booking is valid; analytics update is skipped silently.
    return { ok: false, reason: "not_authenticated" };
  }

  // Update the matching row — user_id guard ensures only own rows are updated
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
      console.error(
        "[screeningAnalytics] markBooked error:",
        error.code,
        error.message
      );
      return { ok: false, reason: error.code ?? "update_failed" };
    }

    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    console.error("[screeningAnalytics] markBooked unexpected error:", msg);
    return { ok: false, reason: "unexpected_error" };
  }
}

// ─── Upsert helper ───────────────────────────────────────────────────────────

/**
 * Upserts a completed screening result into public.screening_analytics.
 *
 * Supports nested result structure:
 * {
 *   sessionId, childName, childAge, screeningType, completedAt,
 *   result: { percentage, riskLevel, riskLabel, score, ... }
 * }
 *
 * Returns { ok: true } on success or { ok: false, reason } on failure.
 * Never throws.
 */
export async function upsertScreeningResultAnalytics(
  params: ScreeningAnalyticsParams
): Promise<AnalyticsResult> {
  // Guard 1: Supabase must be configured
  if (!isSupabaseConfigured) {
    return { ok: false, reason: "supabase_not_configured" };
  }

  // Guard 2: sessionId is required
  if (!params.sessionId) {
    return { ok: false, reason: "missing_session_id" };
  }

  // Guard 3: user must be authenticated
  let userId: string | null = null;
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userId = user?.id ?? null;
  } catch {
    return { ok: false, reason: "auth_check_failed" };
  }

  if (!userId) {
    return { ok: false, reason: "not_authenticated" };
  }

  // ─── Extract safe fields ──────────────────────────────────────────────────

  const r = params.result ?? {};
  // Support nested result structure: { ..., result: { percentage, riskLevel, ... } }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const inner: Record<string, any> =
    r.result && typeof r.result === "object" ? r.result : {};

  const score = safeNum(
    r.score ?? r.totalScore ?? r.resultScore ?? inner.score ?? inner.totalScore
  );

  const percentage = safeNum(
    r.percentage ?? inner.percentage ?? r.result?.percentage
  );

  const riskLevel = safeStr(
    r.riskLevel ?? inner.riskLevel ?? r.result?.riskLevel
  );

  const riskLabel = safeStr(
    r.riskLabel ?? inner.riskLabel ?? r.result?.riskLabel
  );

  const resultLevel = safeStr(
    r.level ??
      r.category ??
      inner.riskLabel ??
      inner.riskLevel ??
      r.result?.riskLabel ??
      r.result?.riskLevel
  );

  const completedAt =
    params.completedAt ??
    safeStr(
      r.completedAt ?? r.completed_at ?? r.createdAt ?? r.timestamp
    ) ??
    new Date().toISOString();

  const pathType = safeStr(
    params.pathType ?? r.pathType ?? r.screeningType
  ) ?? "unknown";

  const subjectAge = safeStr(
    params.subjectAge ??
    r.childAge ?? r.age ?? r.subjectAge ??
    inner.age ?? inner.childAge
  );

  const subjectName = safeStr(
    params.subjectName ??
    r.childName ?? r.name ?? r.userName ??
    inner.name ?? inner.childName
  );

  // ─── Build upsert payload ─────────────────────────────────────────────────

  const payload = {
    user_id: userId,
    session_id: params.sessionId,
    local_child_id: safeStr(params.localChildId) ?? null,
    subject_type: params.subjectType ?? "unknown",
    subject_name: subjectName,
    subject_age: subjectAge,
    mode: safeStr(params.mode ?? r.mode ?? r.assessmentMode) ?? null,
    path_type: pathType,
    screening_type: safeStr(
      params.screeningType ?? r.screeningType ?? r.type ?? r.pathType
    ) ?? null,
    score,
    percentage,
    risk_level: riskLevel,
    risk_label: riskLabel,
    result_level: resultLevel,
    completed_at: completedAt,
    source: params.source ?? "screening_result_page",
    // booked_after_result defaults to false in DB
  };

  // ─── Upsert (on session_id conflict: update all fields) ──────────────────

  try {
    const { error } = await supabase
      .from("screening_analytics")
      .upsert(payload, {
        onConflict: "session_id",
        ignoreDuplicates: false,
      });

    if (error) {
      // Log only safe diagnostic info — no sensitive payload
      console.error(
        "[screeningAnalytics] upsert error:",
        error.code,
        error.message
      );
      return { ok: false, reason: error.code ?? "upsert_failed" };
    }

    return { ok: true };
  } catch (err) {
    // Catch any unexpected error — never propagate to UI
    const msg = err instanceof Error ? err.message : "unknown";
    console.error("[screeningAnalytics] unexpected error:", msg);
    return { ok: false, reason: "unexpected_error" };
  }
}
