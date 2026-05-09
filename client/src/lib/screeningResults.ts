/**
 * screeningResults.ts — Sprint 5
 *
 * Helper functions for persisting and fetching self-assessment results
 * in Supabase public.screening_results.
 *
 * Design principles:
 * - Never throws to UI.
 * - Logs only error.code or short safe message (no full payload).
 * - Uses isSupabaseConfigured guard.
 * - Requires authenticated user (auth.uid() = user_id).
 * - Upserts by session_id (unique index added in migration 005).
 * - localStorage remains the primary source; Supabase is additive.
 */

import { supabase, isSupabaseConfigured } from "./supabaseClient";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SelfAssessmentResultPayload {
  sessionId: string;
  subjectName: string;
  subjectAge: string | number;
  mode: "self";
  pathType: "learning" | "adhd";
  screeningType?: string;
  resultJson: Record<string, unknown>;
  resultSummary?: {
    score?: number;
    percentage?: number;
    riskLevel?: string;
    riskLabel?: string;
  };
  completedAt: string;
}

export interface RemoteSelfAssessmentSummary {
  sessionId: string;
  subjectName: string | null;
  subjectAge: string | null;
  pathType: string;
  screeningType: string | null;
  completedAt: string | null;
  resultSummary: Record<string, unknown> | null;
}

export interface RemoteResultFull {
  sessionId: string;
  subjectName: string | null;
  subjectAge: string | null;
  pathType: string;
  screeningType: string | null;
  mode: string | null;
  completedAt: string | null;
  resultJson: Record<string, unknown> | null;
  resultSummary: Record<string, unknown> | null;
}

type HelperResult<T> =
  | { ok: true; data: T }
  | { ok: false; reason: string };

// ─── 1. getCurrentUserId ─────────────────────────────────────────────────────

export async function getCurrentUserId(): Promise<string | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id ?? null;
  } catch {
    return null;
  }
}

// ─── 2. upsertRemoteScreeningResult ──────────────────────────────────────────
/**
 * Upserts a self-assessment result into public.screening_results.
 * Fire-and-forget safe: never throws, returns { ok, reason }.
 */
export async function upsertRemoteScreeningResult(
  payload: SelfAssessmentResultPayload
): Promise<{ ok: boolean; reason?: string }> {
  if (!isSupabaseConfigured) {
    return { ok: false, reason: "supabase_not_configured" };
  }
  if (!payload.sessionId) {
    return { ok: false, reason: "missing_session_id" };
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    return { ok: false, reason: "not_authenticated" };
  }

  const row = {
    user_id: userId,
    session_id: payload.sessionId,
    child_id: null,
    local_child_id: null,
    child_name: payload.subjectName ?? null,
    subject_type: "self",
    subject_name: payload.subjectName ?? null,
    subject_age: payload.subjectAge ? String(payload.subjectAge) : null,
    mode: "self",
    path_type: payload.pathType,
    screening_type: payload.screeningType ?? null,
    result_json: payload.resultJson,
    result_summary: payload.resultSummary ?? null,
    completed_at: payload.completedAt,
  };

  try {
    const { error } = await supabase
      .from("screening_results")
      .upsert(row, {
        onConflict: "session_id",
        ignoreDuplicates: false,
      });

    if (error) {
      console.error("[screeningResults] upsert error:", error.code, error.message);
      return { ok: false, reason: error.code ?? "upsert_failed" };
    }
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    console.error("[screeningResults] upsert unexpected error:", msg);
    return { ok: false, reason: "unexpected_error" };
  }
}

// ─── 3. fetchRemoteScreeningResultBySessionId ─────────────────────────────────
/**
 * Fetches a single screening result by sessionId.
 * Returns the full result_json if found.
 */
export async function fetchRemoteScreeningResultBySessionId(
  sessionId: string
): Promise<HelperResult<RemoteResultFull>> {
  if (!isSupabaseConfigured) {
    return { ok: false, reason: "supabase_not_configured" };
  }
  if (!sessionId) {
    return { ok: false, reason: "missing_session_id" };
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    return { ok: false, reason: "not_authenticated" };
  }

  try {
    const { data, error } = await supabase
      .from("screening_results")
      .select(
        "session_id, subject_name, subject_age, path_type, screening_type, mode, completed_at, result_json, result_summary"
      )
      .eq("session_id", sessionId)
      .eq("user_id", userId)
      .eq("subject_type", "self")
      .maybeSingle();

    if (error) {
      console.error("[screeningResults] fetch by sessionId error:", error.code);
      return { ok: false, reason: error.code ?? "fetch_failed" };
    }
    if (!data) {
      return { ok: false, reason: "not_found" };
    }

    return {
      ok: true,
      data: {
        sessionId: data.session_id,
        subjectName: data.subject_name,
        subjectAge: data.subject_age,
        pathType: data.path_type,
        screeningType: data.screening_type,
        mode: data.mode,
        completedAt: data.completed_at,
        resultJson: data.result_json as Record<string, unknown> | null,
        resultSummary: data.result_summary as Record<string, unknown> | null,
      },
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    console.error("[screeningResults] fetch unexpected error:", msg);
    return { ok: false, reason: "unexpected_error" };
  }
}

// ─── 4. fetchRemoteSelfAssessmentResults ─────────────────────────────────────
/**
 * Fetches all self-assessment result summaries for the current user.
 * Optionally filtered by pathType.
 * Returns lightweight summaries (no full result_json).
 */
export async function fetchRemoteSelfAssessmentResults(
  pathType?: "learning" | "adhd"
): Promise<HelperResult<RemoteSelfAssessmentSummary[]>> {
  if (!isSupabaseConfigured) {
    return { ok: false, reason: "supabase_not_configured" };
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    return { ok: false, reason: "not_authenticated" };
  }

  try {
    let query = supabase
      .from("screening_results")
      .select(
        "session_id, subject_name, subject_age, path_type, screening_type, completed_at, result_summary"
      )
      .eq("user_id", userId)
      .eq("subject_type", "self")
      .order("completed_at", { ascending: false });

    if (pathType) {
      query = query.eq("path_type", pathType);
    }

    const { data, error } = await query;

    if (error) {
      console.error("[screeningResults] fetchAll error:", error.code);
      return { ok: false, reason: error.code ?? "fetch_failed" };
    }

    const results: RemoteSelfAssessmentSummary[] = (data ?? []).map((row) => ({
      sessionId: row.session_id,
      subjectName: row.subject_name,
      subjectAge: row.subject_age,
      pathType: row.path_type,
      screeningType: row.screening_type,
      completedAt: row.completed_at,
      resultSummary: row.result_summary as Record<string, unknown> | null,
    }));

    return { ok: true, data: results };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    console.error("[screeningResults] fetchAll unexpected error:", msg);
    return { ok: false, reason: "unexpected_error" };
  }
}

// ─── 5. syncLocalSelfAssessmentsToSupabase ───────────────────────────────────
/**
 * Silently syncs existing localStorage self-assessment results to Supabase.
 * Fire-and-forget: never blocks UI, never shows errors to user.
 * Only syncs if user is logged in.
 */
export async function syncLocalSelfAssessmentsToSupabase(): Promise<void> {
  if (!isSupabaseConfigured) return;

  const userId = await getCurrentUserId();
  if (!userId) return;

  try {
    const SELF_KEY = "tashkheesy_self_assessments";
    const raw = localStorage.getItem(SELF_KEY);
    if (!raw) return;

    const list: Array<{
      sessionId: string;
      name?: string;
      age?: string | number;
      pathType?: string;
      screeningType?: string;
      completedAt?: string;
      resultKey?: string;
    }> = JSON.parse(raw);

    if (!Array.isArray(list) || list.length === 0) return;

    for (const entry of list) {
      if (!entry.sessionId) continue;

      // Read full result from localStorage
      const resultRaw = entry.resultKey
        ? localStorage.getItem(entry.resultKey)
        : localStorage.getItem(`result_${entry.sessionId}`);

      let resultJson: Record<string, unknown> = {};
      if (resultRaw) {
        try {
          resultJson = JSON.parse(resultRaw);
        } catch {
          // skip malformed
          continue;
        }
      }

      // Extract summary
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const inner: Record<string, any> =
        resultJson.result && typeof resultJson.result === "object"
          ? (resultJson.result as Record<string, unknown>)
          : {};

      const resultSummary = {
        score: inner.score ?? resultJson.score ?? null,
        percentage: inner.percentage ?? resultJson.percentage ?? null,
        riskLevel: inner.riskLevel ?? resultJson.riskLevel ?? null,
        riskLabel: inner.riskLabel ?? resultJson.riskLabel ?? null,
      };

      // Fire-and-forget upsert
      void upsertRemoteScreeningResult({
        sessionId: entry.sessionId,
        subjectName: entry.name ?? "",
        subjectAge: entry.age ?? "",
        mode: "self",
        pathType: (entry.pathType as "learning" | "adhd") ?? "learning",
        screeningType: entry.screeningType,
        resultJson,
        resultSummary,
        completedAt: entry.completedAt ?? new Date().toISOString(),
      });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    console.error("[screeningResults] syncLocal unexpected error:", msg);
  }
}
