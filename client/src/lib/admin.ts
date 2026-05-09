/**
 * admin.ts — Sprint 6A
 *
 * Client-side helpers for admin authorization checks.
 *
 * Design principles:
 * - Never throws to UI.
 * - Uses isSupabaseConfigured guard.
 * - Uses supabase.auth.getUser() — never accepts user_id from caller.
 * - No service_role key usage — relies on RLS policies in admin_users table.
 * - Admin check reads the current user's own admin_users row via RLS.
 * - fetchAdminStats() is a placeholder for future dashboard use.
 */

import { supabase, isSupabaseConfigured } from "./supabaseClient";

// ─── isCurrentUserAdmin ───────────────────────────────────────────────────────

/**
 * Returns true if the currently authenticated user has an active row in
 * public.admin_users.
 *
 * Uses the RLS policy "admin_users: own row select" — no service_role needed.
 * Returns false for unauthenticated users, non-admins, and on any error.
 * Never throws.
 */
export async function isCurrentUserAdmin(): Promise<boolean> {
  if (!isSupabaseConfigured) return false;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.id) return false;

    const { data, error } = await supabase
      .from("admin_users")
      .select("id, is_active")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .maybeSingle();

    if (error) {
      console.error("[admin] isCurrentUserAdmin error:", error.code);
      return false;
    }

    return !!data;
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    console.error("[admin] isCurrentUserAdmin unexpected error:", msg);
    return false;
  }
}

// ─── fetchAdminStats (placeholder for future dashboard) ──────────────────────

/**
 * Placeholder for future admin dashboard statistics.
 * Not implemented in Sprint 6A — returns null.
 * Will be expanded when the admin dashboard UI is built.
 */
export async function fetchAdminStats(): Promise<null> {
  // TODO: Sprint 6B — implement admin stats queries
  return null;
}
