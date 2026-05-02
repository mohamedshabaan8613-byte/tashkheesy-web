/**
 * accountData.ts — Sprint 2: Supabase Account Data Helpers
 *
 * Provides typed helpers for persisting child profiles and screening results
 * to Supabase tables linked to the authenticated user.
 *
 * Security rules:
 * - Always uses current authenticated user id (auth.uid() via RLS).
 * - Never writes without a valid user id.
 * - Uses anon key only through the existing Supabase client.
 * - Does NOT bypass RLS or use service role.
 * - Does NOT log sensitive child data or full result JSON.
 */

import { supabase, isSupabaseConfigured } from "./supabaseClient";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RemoteChild {
  id: string;               // Supabase UUID (remote id)
  user_id: string;
  local_child_id?: string | null;
  name: string;
  date_of_birth?: string | null;
  gender?: "male" | "female" | null;
  grade_level?: string | null;
  school_name?: string | null;
  notes?: string | null;
  avatar_emoji?: string | null;
  age_years?: number | null;
  age_group?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface RemoteScreeningResult {
  id?: string;
  user_id?: string;
  child_id?: string | null;
  local_child_id?: string | null;
  session_id: string;
  path_type?: "learning" | "adhd" | null;
  screening_type?: string | null;
  mode?: "child" | "self";
  child_name?: string | null;
  result_json: Record<string, unknown>;
  result_summary?: Record<string, unknown> | null;
  completed_at?: string;
}

// ─── getCurrentUserId ─────────────────────────────────────────────────────────

/**
 * Returns the current authenticated Supabase user id, or null if not logged in.
 */
export async function getCurrentUserId(): Promise<string | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const { data } = await supabase.auth.getUser();
    return data?.user?.id ?? null;
  } catch {
    return null;
  }
}

// ─── Children ─────────────────────────────────────────────────────────────────

/**
 * Fetch all children for the current authenticated user from Supabase.
 * Returns empty array if not authenticated or on error.
 */
export async function fetchRemoteChildren(): Promise<RemoteChild[]> {
  if (!isSupabaseConfigured) return [];
  try {
    const userId = await getCurrentUserId();
    if (!userId) return [];

    const { data, error } = await supabase
      .from("children")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("[accountData] fetchRemoteChildren error:", error.code);
      return [];
    }
    return (data ?? []) as RemoteChild[];
  } catch {
    return [];
  }
}

/**
 * Upsert a child to Supabase.
 * Uses unique(user_id, local_child_id) to prevent duplicates.
 * Returns the upserted row or null on failure.
 */
export async function upsertRemoteChild(
  child: Omit<RemoteChild, "id" | "user_id" | "created_at" | "updated_at">
): Promise<RemoteChild | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const userId = await getCurrentUserId();
    if (!userId) return null;

    const payload = {
      user_id: userId,
      local_child_id: child.local_child_id ?? null,
      name: child.name,
      date_of_birth: child.date_of_birth ?? null,
      gender: child.gender ?? null,
      grade_level: child.grade_level ?? null,
      school_name: child.school_name ?? null,
      notes: child.notes ?? null,
      avatar_emoji: child.avatar_emoji ?? null,
      age_years: child.age_years ?? null,
      age_group: child.age_group ?? null,
    };

    const { data, error } = await supabase
      .from("children")
      .upsert(payload, {
        onConflict: "user_id,local_child_id",
        ignoreDuplicates: false,
      })
      .select()
      .single();

    if (error) {
      console.error("[accountData] upsertRemoteChild error:", error.code);
      return null;
    }
    return data as RemoteChild;
  } catch {
    return null;
  }
}

/**
 * Update an existing remote child by its Supabase UUID.
 */
export async function updateRemoteChild(
  remoteId: string,
  updates: Partial<Omit<RemoteChild, "id" | "user_id" | "created_at">>
): Promise<RemoteChild | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const userId = await getCurrentUserId();
    if (!userId) return null;

    const { data, error } = await supabase
      .from("children")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", remoteId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      console.error("[accountData] updateRemoteChild error:", error.code);
      return null;
    }
    return data as RemoteChild;
  } catch {
    return null;
  }
}

/**
 * Delete a remote child by its Supabase UUID.
 * Returns true on success.
 */
export async function deleteRemoteChild(remoteId: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const userId = await getCurrentUserId();
    if (!userId) return false;

    const { error } = await supabase
      .from("children")
      .delete()
      .eq("id", remoteId)
      .eq("user_id", userId);

    if (error) {
      console.error("[accountData] deleteRemoteChild error:", error.code);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Sync local children (from localStorage) to Supabase.
 * Uses upsert with unique(user_id, local_child_id) to prevent duplicates.
 * Returns the number of successfully upserted children.
 */
export async function syncLocalChildrenToSupabase(
  localChildren: Array<{
    id: string;
    name: string;
    dateOfBirth?: string;
    gender?: string;
    gradeLevel?: string;
    schoolName?: string;
    notes?: string;
    avatarEmoji?: string;
    ageYears?: number;
    ageGroup?: string;
  }>
): Promise<number> {
  if (!isSupabaseConfigured) return 0;
  const userId = await getCurrentUserId();
  if (!userId) return 0;

  let count = 0;
  for (const child of localChildren) {
    const result = await upsertRemoteChild({
      local_child_id: child.id,
      name: child.name,
      date_of_birth: child.dateOfBirth ?? null,
      gender: (child.gender as "male" | "female") ?? null,
      grade_level: child.gradeLevel ?? null,
      school_name: child.schoolName ?? null,
      notes: child.notes ?? null,
      avatar_emoji: child.avatarEmoji ?? null,
      age_years: child.ageYears ?? null,
      age_group: child.ageGroup ?? null,
    });
    if (result) count++;
  }
  return count;
}

// ─── Screening Results ────────────────────────────────────────────────────────

/**
 * Upsert a screening result to Supabase.
 * Uses unique(user_id, session_id) to prevent duplicates.
 * Returns true on success.
 */
export async function upsertRemoteScreeningResult(
  result: RemoteScreeningResult
): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const userId = await getCurrentUserId();
    if (!userId) return false;

    const payload = {
      user_id: userId,
      child_id: result.child_id ?? null,
      local_child_id: result.local_child_id ?? null,
      session_id: result.session_id,
      path_type: result.path_type ?? null,
      screening_type: result.screening_type ?? null,
      mode: result.mode ?? "child",
      child_name: result.child_name ?? null,
      result_json: result.result_json,
      result_summary: result.result_summary ?? null,
      completed_at: result.completed_at ?? new Date().toISOString(),
    };

    const { error } = await supabase
      .from("screening_results")
      .upsert(payload, {
        onConflict: "user_id,session_id",
        ignoreDuplicates: false,
      });

    if (error) {
      console.error("[accountData] upsertRemoteScreeningResult error:", error.code);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Fetch all screening results for a given child (by local_child_id or remote child_id).
 * Returns empty array if not authenticated or on error.
 */
export async function fetchRemoteScreeningResultsForChild(
  childId: string,
  useRemoteId = false
): Promise<RemoteScreeningResult[]> {
  if (!isSupabaseConfigured) return [];
  try {
    const userId = await getCurrentUserId();
    if (!userId) return [];

    const column = useRemoteId ? "child_id" : "local_child_id";

    const { data, error } = await supabase
      .from("screening_results")
      .select("*")
      .eq("user_id", userId)
      .eq(column, childId)
      .order("completed_at", { ascending: false });

    if (error) {
      console.error("[accountData] fetchRemoteScreeningResultsForChild error:", error.code);
      return [];
    }
    return (data ?? []) as RemoteScreeningResult[];
  } catch {
    return [];
  }
}

/**
 * Fetch the latest screening result for a child (by local_child_id).
 * Returns null if not found or on error.
 */
export async function fetchLatestRemoteScreeningResultForChild(
  localChildId: string
): Promise<RemoteScreeningResult | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const userId = await getCurrentUserId();
    if (!userId) return null;

    const { data, error } = await supabase
      .from("screening_results")
      .select("*")
      .eq("user_id", userId)
      .eq("local_child_id", localChildId)
      .order("completed_at", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      // PGRST116 = no rows found — not a real error
      if (error.code === "PGRST116") return null;
      console.error("[accountData] fetchLatestRemoteScreeningResultForChild error:", error.code);
      return null;
    }
    return data as RemoteScreeningResult;
  } catch {
    return null;
  }
}

/**
 * Fetch a single screening result by session_id.
 * Used by ScreeningResult page for cross-device access.
 */
export async function fetchRemoteScreeningResultBySessionId(
  sessionId: string
): Promise<RemoteScreeningResult | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const userId = await getCurrentUserId();
    if (!userId) return null;

    const { data, error } = await supabase
      .from("screening_results")
      .select("*")
      .eq("user_id", userId)
      .eq("session_id", sessionId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      console.error("[accountData] fetchRemoteScreeningResultBySessionId error:", error.code);
      return null;
    }
    return data as RemoteScreeningResult;
  } catch {
    return null;
  }
}
