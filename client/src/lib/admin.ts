/**
 * admin.ts — Sprint 6B
 *
 * Client-side helpers for admin authorization and dashboard data.
 *
 * Design principles:
 * - Never throws to UI.
 * - Uses isSupabaseConfigured guard.
 * - Uses supabase.auth.getUser() — never accepts user_id from caller.
 * - No service_role key usage — relies on RLS policies.
 * - Does not fetch result_json or raw screening payloads.
 * - Limits latest lists to 10 rows.
 * - Never logs full payloads.
 */

import { supabase, isSupabaseConfigured } from "./supabaseClient";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AdminCheckResult {
  ok: boolean;
  isAdmin: boolean;
  reason?: string;
}

export interface AdminTotals {
  totalScreenings: number;
  childScreenings: number;
  selfAssessments: number;
  learningScreenings: number;
  adhdScreenings: number;
  totalBookings: number;
  bookingsAfterResult: number;
  conversionRate: number; // percentage 0–100, rounded to 1 decimal
}

export interface LatestScreeningRow {
  id: string;
  completed_at: string | null;
  created_at: string;
  subject_type: string;
  path_type: string;
  result_level: string | null;
  risk_level: string | null;
  booked_after_result: boolean;
}

export interface LatestBookingRow {
  id: string;
  created_at: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  service_title: string | null;
  specialist_name: string | null;
  booked_after_result: boolean;
}

export interface AdminDashboardData {
  totals: AdminTotals;
  latestScreenings: LatestScreeningRow[];
  latestBookings: LatestBookingRow[];
}

// ─── isCurrentUserAdmin ───────────────────────────────────────────────────────

/**
 * Returns { ok: true, isAdmin: boolean } if the check succeeds.
 * Returns { ok: false, isAdmin: false, reason } on any failure.
 * Never throws.
 */
export async function isCurrentUserAdmin(): Promise<AdminCheckResult> {
  if (!isSupabaseConfigured) {
    return { ok: false, isAdmin: false, reason: "supabase_not_configured" };
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.id) {
      return { ok: true, isAdmin: false, reason: "not_authenticated" };
    }

    const { data, error } = await supabase
      .from("admin_users")
      .select("id, is_active")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .maybeSingle();

    if (error) {
      console.error("[admin] isCurrentUserAdmin error:", error.code);
      return { ok: false, isAdmin: false, reason: error.code ?? "query_failed" };
    }

    return { ok: true, isAdmin: !!data };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    console.error("[admin] isCurrentUserAdmin unexpected error:", msg);
    return { ok: false, isAdmin: false, reason: "unexpected_error" };
  }
}

// ─── fetchAdminDashboardData ──────────────────────────────────────────────────

/**
 * Fetches all data needed for the admin dashboard.
 * Requires the caller to already be verified as admin (RLS enforces this).
 *
 * Returns AdminDashboardData on success, null on any failure.
 * Never throws.
 */
export async function fetchAdminDashboardData(): Promise<AdminDashboardData | null> {
  if (!isSupabaseConfigured) return null;

  try {
    // ── 1. Fetch all screening_analytics rows for aggregate counts ────────────
    // We only select the fields needed for KPI calculation — no result_json.
    const { data: analyticsRows, error: analyticsError } = await supabase
      .from("screening_analytics")
      .select("id, subject_type, path_type, booked_after_result");

    if (analyticsError) {
      console.error("[admin] fetchAdminDashboardData analytics error:", analyticsError.code);
      return null;
    }

    const rows = analyticsRows ?? [];

    // ── 2. Fetch latest 10 screenings for the table ───────────────────────────
    const { data: latestAnalytics, error: latestAnalyticsError } = await supabase
      .from("screening_analytics")
      .select("id, completed_at, created_at, subject_type, path_type, result_level, risk_level, booked_after_result")
      .order("created_at", { ascending: false })
      .limit(10);

    if (latestAnalyticsError) {
      console.error("[admin] fetchAdminDashboardData latestAnalytics error:", latestAnalyticsError.code);
      return null;
    }

    // ── 3. Fetch all booking_requests rows for aggregate counts ───────────────
    const { data: bookingRows, error: bookingCountError } = await supabase
      .from("booking_requests")
      .select("id, booked_after_result");

    if (bookingCountError) {
      console.error("[admin] fetchAdminDashboardData bookingCount error:", bookingCountError.code);
      return null;
    }

    const bookings = bookingRows ?? [];

    // ── 4. Fetch latest 10 bookings for the table ─────────────────────────────
    const { data: latestBookings, error: latestBookingsError } = await supabase
      .from("booking_requests")
      .select("id, created_at, full_name, email, phone, service_title, specialist_name, booked_after_result")
      .order("created_at", { ascending: false })
      .limit(10);

    if (latestBookingsError) {
      console.error("[admin] fetchAdminDashboardData latestBookings error:", latestBookingsError.code);
      return null;
    }

    // ── 5. Compute totals ─────────────────────────────────────────────────────
    const totalScreenings     = rows.length;
    const childScreenings     = rows.filter(r => r.subject_type === "child").length;
    const selfAssessments     = rows.filter(r => r.subject_type === "self").length;
    const learningScreenings  = rows.filter(r => r.path_type === "learning").length;
    const adhdScreenings      = rows.filter(r => r.path_type === "adhd").length;
    const totalBookings       = bookings.length;
    const bookingsAfterResult = bookings.filter(b => b.booked_after_result === true).length;
    const conversionRate      = totalScreenings > 0
      ? Math.round((bookingsAfterResult / totalScreenings) * 1000) / 10
      : 0;

    return {
      totals: {
        totalScreenings,
        childScreenings,
        selfAssessments,
        learningScreenings,
        adhdScreenings,
        totalBookings,
        bookingsAfterResult,
        conversionRate,
      },
      latestScreenings: (latestAnalytics ?? []) as LatestScreeningRow[],
      latestBookings:   (latestBookings ?? []) as LatestBookingRow[],
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    console.error("[admin] fetchAdminDashboardData unexpected error:", msg);
    return null;
  }
}
