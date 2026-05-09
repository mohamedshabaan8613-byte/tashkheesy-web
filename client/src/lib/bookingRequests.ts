/**
 * bookingRequests.ts — Sprint 6A
 *
 * Helper for persisting successful booking submissions to Supabase
 * public.booking_requests.
 *
 * Design principles:
 * - Never throws to UI.
 * - Fire-and-forget safe: always call with void.
 * - Uses isSupabaseConfigured guard.
 * - Uses supabase.auth.getUser() — never accepts user_id from caller.
 * - Only runs for authenticated users (anonymous bookings skip Supabase,
 *   Formspree remains the source of truth for all bookings).
 * - Does not log full payload — only error codes.
 * - Only called after Formspree returns res.ok.
 * - Does not block or affect the booking UX in any way.
 */

import { supabase, isSupabaseConfigured } from "./supabaseClient";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BookingRequestPayload {
  // Contact
  full_name: string;
  email: string;
  phone?: string;
  notes?: string;

  // Service
  service_id?: string;
  service_title?: string;
  service_price?: string;
  service_duration?: string;

  // Schedule
  selected_date?: string;
  selected_time_id?: string;
  selected_time_label?: string;

  // Specialist
  specialist_id?: string;
  specialist_name?: string;
  specialist_title?: string;
  specialist_specialty?: string;

  // URL context
  source_url?: string;
  url_session_id?: string;
  url_path_type?: string;
  url_child?: string;
  url_service_id?: string;
  url_specialist_id?: string;

  // Screening context (summarized only — no raw result JSON)
  screening_session_id?: string;
  screening_path_type?: string;
  screening_type?: string;
  screening_mode?: string;
  screening_subject_name?: string;
  screening_subject_age?: string;
  screening_score?: string;
  screening_level?: string;
  screening_risk_level?: string;
  screening_completed_at?: string;
  screening_summary?: string;
  screening_context_found?: string;
  screening_context_source?: string;

  // Formspree status
  formspree_status?: string;
  formspree_ok?: boolean;

  // Booking flags
  booked_after_result?: boolean;
}

// ─── Helper: get current authenticated user id ───────────────────────────────

async function getCurrentUserId(): Promise<string | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id ?? null;
  } catch {
    return null;
  }
}

// ─── saveBookingRequest ───────────────────────────────────────────────────────

/**
 * Persists a successful booking request to Supabase public.booking_requests.
 *
 * Only runs for authenticated users. Anonymous bookings are silently skipped —
 * Formspree remains the source of truth for all bookings.
 *
 * Fire-and-forget safe: call with `void saveBookingRequest(payload)`.
 * Returns { ok: boolean; reason?: string } — never throws.
 */
export async function saveBookingRequest(
  payload: BookingRequestPayload
): Promise<{ ok: boolean; reason?: string }> {
  if (!isSupabaseConfigured) {
    return { ok: false, reason: "supabase_not_configured" };
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    // Anonymous booking — Formspree already captured it. Skip Supabase silently.
    return { ok: false, reason: "not_authenticated" };
  }

  const row = {
    user_id: userId,

    // Contact
    full_name: payload.full_name ?? null,
    email: payload.email ?? null,
    phone: payload.phone ?? null,
    notes: payload.notes ?? null,

    // Service
    service_id: payload.service_id ?? null,
    service_title: payload.service_title ?? null,
    service_price: payload.service_price ?? null,
    service_duration: payload.service_duration ?? null,

    // Schedule
    selected_date: payload.selected_date ?? null,
    selected_time_id: payload.selected_time_id ?? null,
    selected_time_label: payload.selected_time_label ?? null,

    // Specialist
    specialist_id: payload.specialist_id ?? null,
    specialist_name: payload.specialist_name ?? null,
    specialist_title: payload.specialist_title ?? null,
    specialist_specialty: payload.specialist_specialty ?? null,

    // URL context
    source_url: payload.source_url ?? null,
    url_session_id: payload.url_session_id ?? null,
    url_path_type: payload.url_path_type ?? null,
    url_child: payload.url_child ?? null,
    url_service_id: payload.url_service_id ?? null,
    url_specialist_id: payload.url_specialist_id ?? null,

    // Screening context
    screening_session_id: payload.screening_session_id ?? null,
    screening_path_type: payload.screening_path_type ?? null,
    screening_type: payload.screening_type ?? null,
    screening_mode: payload.screening_mode ?? null,
    screening_subject_name: payload.screening_subject_name ?? null,
    screening_subject_age: payload.screening_subject_age ?? null,
    screening_score: payload.screening_score ?? null,
    screening_level: payload.screening_level ?? null,
    screening_risk_level: payload.screening_risk_level ?? null,
    screening_completed_at: payload.screening_completed_at ?? null,
    screening_summary: payload.screening_summary ?? null,
    screening_context_found: payload.screening_context_found ?? null,
    screening_context_source: payload.screening_context_source ?? null,

    // Formspree status
    formspree_status: payload.formspree_status ?? null,
    formspree_ok: payload.formspree_ok ?? false,

    // Booking flags
    booked_after_result: payload.booked_after_result ?? false,
  };

  try {
    const { error } = await supabase
      .from("booking_requests")
      .insert(row);

    if (error) {
      console.error("[bookingRequests] insert error:", error.code, error.message);
      return { ok: false, reason: error.code ?? "insert_failed" };
    }
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    console.error("[bookingRequests] unexpected error:", msg);
    return { ok: false, reason: "unexpected_error" };
  }
}
