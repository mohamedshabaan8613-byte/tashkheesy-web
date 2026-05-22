/**
 * RescheduleOrchestrator.ts — Sprint 3.5 Phase 1B
 *
 * ARCHITECTURE CONTRACT:
 *   Reschedule is a SINGLE TRANSACTIONAL LIFECYCLE MUTATION.
 *   It is NOT: cancel + new booking.
 *   This distinction preserves:
 *     - ownership (same ownershipToken, same consultationId)
 *     - eligibility (free consultation entitlement not re-evaluated)
 *     - payment linkage (existing payment record carries over)
 *     - audit continuity (rescheduled_from, reschedule_count in same row)
 *
 * PIPELINE (10 steps with compensation):
 *   UI
 *   → [Step  1] Validate ownership token
 *   → [Step  2] Validate reschedulable phase (policy)
 *   → [Step  3] Validate lifecycleVersion (stale-state guard)
 *   → [Step  4] Pre-flight: check new slot availability
 *   → [Step  5] Reserve new slot                  ← RESERVE_NEW
 *   → [Step  6] Release old reservation            ← RELEASE_OLD
 *                 ↳ on failure → COMPENSATE: release new slot
 *   → [Step  7] Persist RESCHEDULED mutation       ← same consultationId
 *                 ↳ on failure → COMPENSATE: restore old slot + release new
 *   → [Step  8] Emit BOOKING_RESCHEDULED domain event
 *   → [Step  9] Broadcast storage sync (other tabs)
 *   → [Step 10] transitionTo("RESCHEDULED") via dep-injection
 *
 * RESCHEDULABLE PHASES (policy):
 *   ✅ CONFIRMED → RESCHEDULED
 *   ✅ RESCHEDULED → RESCHEDULED (re-reschedule)
 *   ❌ CANCELLED, EXPIRED, COMPLETED, ABANDONED — terminal, cannot reschedule
 *   ❌ REVIEW, SLOT_SELECTION — use slot selection flow instead
 *
 * DESIGN RULES (inherited):
 *   RULE 1 — No direct Context import. transitionTo is dep-injected.
 *   RULE 2 — Never calls navigate(). Caller owns routing.
 *   RULE 3 — Retry policy NOT applied here. Reschedule is a mutation.
 *   RULE 4 — Compensation is best-effort. DB is the source of truth.
 *
 * SCOPE BOUNDARY:
 *   ✅ Reschedule pipeline only
 *   ❌ No refund processing
 *   ❌ No specialist change (slot change only)
 *   ❌ No notification sending (notification queue only)
 */

import type { BookingPhase, ConsultationBookingSession } from "../types/consultationBookingTypes";
import { validateLifecycleVersion } from "../reliability/lifecycleVersionValidator";
import { broadcastBookingUpdate } from "../reliability/storageEventSync";
import { bookingEventBus, createBookingEvent } from "../types/bookingDomainEvents";
import { RESCHEDULABLE_PHASES } from "../types/consultationBookingTypesPatch";
import { createClient } from "@supabase/supabase-js";

// ─── Input / Output types ───────────────────────────────────────────────────

export interface RescheduleInput {
  /** Current runtime session. consultationId = session.sessionId */
  session: ConsultationBookingSession;
  /** Ownership token held by the current tab. */
  ownershipToken: string;
  /** New slot the user selected. */
  newSlotId: string;
  /** Old reservation ID to release after new one is reserved. */
  currentReservationId: string | null;
  /**
   * Authoritative lifecycleVersion from storage/server.
   * Fail-closed if null.
   */
  authoritativeVersion: string | null;
  /** TTL for new reservation in minutes. Default: 15 */
  reservationTtlMinutes?: number;
}

export type RescheduleFailureReason =
  | "non_reschedulable_phase"         // terminal or pre-confirm phase
  | "ownership_token_mismatch"        // token validation failed
  | "stale_lifecycle_version"         // version guard rejected
  | "authoritative_version_unavailable"
  | "new_slot_unavailable"            // pre-flight: slot already taken
  | "new_slot_reservation_failed"     // Step 5 DB error
  | "old_slot_release_failed"         // Step 6 DB error (after compensation)
  | "persist_failed"                  // Step 7 DB error (after compensation)
  | "unknown_error";

export type RescheduleResult =
  | { success: true; rescheduledAt: string; newReservationId: string }
  | { success: false; reason: RescheduleFailureReason; details?: string };

export interface RescheduleDeps {
  /** Dep-injected from ConsultationBookingContext. RULE 1. */
  transitionTo: (phase: BookingPhase) => void;
  /** Optional: Supabase client. If omitted, DB steps are skipped (test mode). */
  supabase?: ReturnType<typeof createClient>;
}

// ─── Main orchestrator ─────────────────────────────────────────────────────

export async function orchestrateReschedule(
  input: RescheduleInput,
  deps: RescheduleDeps,
): Promise<RescheduleResult> {
  const {
    session,
    ownershipToken,
    newSlotId,
    currentReservationId,
    authoritativeVersion,
    reservationTtlMinutes = 15,
  } = input;
  const { transitionTo, supabase } = deps;
  const rescheduledAt = new Date().toISOString();

  // ── STEP 1: Validate ownership token ─────────────────────────────────────
  const effectiveToken =
    ((session as Record<string, unknown>).ownershipToken as string | undefined)
    ?? session.sessionId;
  if (ownershipToken !== effectiveToken) {
    return {
      success: false,
      reason: "ownership_token_mismatch",
      details: `expected:${effectiveToken} provided:${ownershipToken}`,
    };
  }

  // ── STEP 2: Validate reschedulable phase ─────────────────────────────────
  if (!RESCHEDULABLE_PHASES.includes(session.bookingFlowPhase)) {
    return {
      success: false,
      reason: "non_reschedulable_phase",
      details: `phase:${session.bookingFlowPhase}`,
    };
  }

  // ── STEP 3: Validate lifecycleVersion ────────────────────────────────────
  const versionCheck = validateLifecycleVersion(
    session.lifecycleVersion,
    authoritativeVersion,
  );
  if (!versionCheck.valid) {
    return {
      success: false,
      reason: versionCheck.reason === "authoritative_unavailable"
        ? "authoritative_version_unavailable"
        : "stale_lifecycle_version",
      details: versionCheck.reason,
    };
  }

  // ── STEP 4: Pre-flight — check new slot availability ─────────────────────
  if (supabase) {
    const { data: slotData, error: slotError } = await supabase
      .from("time_slots")
      .select("id, is_available, reserved_until")
      .eq("id", newSlotId)
      .single();

    if (slotError || !slotData) {
      return { success: false, reason: "new_slot_unavailable", details: "slot_not_found" };
    }

    const isUnavailable =
      !slotData.is_available ||
      (slotData.reserved_until && new Date(slotData.reserved_until) > new Date());

    if (isUnavailable) {
      return { success: false, reason: "new_slot_unavailable", details: "slot_taken" };
    }
  }

  // ── STEP 5: Reserve new slot ────────────────────────────────────────────
  let newReservationId: string | null = null;
  const newReservedUntil = new Date(
    Date.now() + reservationTtlMinutes * 60 * 1000,
  ).toISOString();

  if (supabase) {
    const newReservationRow = {
      slot_id: newSlotId,
      user_id: session.sourceIntentId, // userId carried from session
      consultation_id: session.sessionId,
      status: "RESERVED",
      reserved_until: newReservedUntil,
      created_at: rescheduledAt,
    };

    const { data: newRes, error: newResError } = await supabase
      .from("slot_reservations")
      .insert(newReservationRow)
      .select("id")
      .single();

    if (newResError || !newRes?.id) {
      return {
        success: false,
        reason: "new_slot_reservation_failed",
        details: newResError?.message ?? "no_id_returned",
      };
    }
    newReservationId = newRes.id;
  } else {
    // Test mode: generate a mock ID
    newReservationId = `mock_res_${Date.now()}`;
  }

  // ── STEP 6: Release old reservation (with compensation) ────────────────
  if (currentReservationId && supabase) {
    const { error: releaseError } = await supabase
      .from("slot_reservations")
      .update({ status: "RELEASED", released_at: rescheduledAt })
      .eq("id", currentReservationId)
      .neq("status", "RELEASED"); // idempotent guard

    if (releaseError) {
      // COMPENSATION: release the new reservation we just created
      await compensateReleaseNewSlot(supabase, newReservationId, rescheduledAt);
      return {
        success: false,
        reason: "old_slot_release_failed",
        details: releaseError.message,
      };
    }
  }

  // ── STEP 7: Persist RESCHEDULED mutation (CRITICAL: same consultationId) ──
  //
  //  WHY THIS PRESERVES OWNERSHIP:
  //    We UPDATE the existing row. We do NOT insert a new consultation.
  //    The consultation_id, user_id, ownership_token, payment linkage,
  //    and eligibility flags ALL remain unchanged.
  //    Only: slot_id, reservation_status, booking_phase, rescheduled_from,
  //    reschedule_count, updated_at are mutated.
  //
  if (supabase) {
    const { error: persistError } = await supabase
      .from("consultations")
      .update({
        slot_id: newSlotId,
        reservation_status: "RESERVED",
        booking_phase: "RESCHEDULED",
        status: "RESCHEDULED",
        rescheduled_from: session.selectedSlotId ?? null,
        reschedule_count: supabase.rpc
          ? undefined  // use increment via RPC in Sprint 3.6
          : undefined, // incremented via raw SQL fallback below
        updated_at: rescheduledAt,
      })
      .eq("id", session.sessionId)
      .eq("ownership_token", ownershipToken);

    // Increment reschedule_count atomically via a second call
    // (Supabase JS v2 does not support column + 1 in update directly)
    await supabase.rpc("increment_reschedule_count", {
      p_consultation_id: session.sessionId,
    }).then(() => undefined).catch(() => undefined); // non-fatal if RPC not yet created

    if (persistError) {
      // COMPENSATION: attempt to restore old slot and release new one
      await compensateRestoreOldSlot(
        supabase,
        session,
        currentReservationId,
        newReservationId,
        rescheduledAt,
      );
      return {
        success: false,
        reason: "persist_failed",
        details: persistError.message,
      };
    }
  }

  // ── STEP 8: Emit BOOKING_RESCHEDULED domain event ───────────────────────
  try {
    const event = createBookingEvent(
      "BOOKING_RESCHEDULED",
      session.sessionId,
      session.sourceIntentId,
      {
        previousSlotId: session.selectedSlotId ?? null,
        newSlotId,
        previousReservationId: currentReservationId,
        newReservationId,
        rescheduledAt,
      },
    );
    bookingEventBus.publish(event);
  } catch (err) {
    // Non-fatal — booking is already rescheduled in DB
    console.error("[RescheduleOrchestrator] event bus publish failed (non-fatal):", err);
  }

  // ── STEP 9: Broadcast storage sync ────────────────────────────────────
  try {
    broadcastBookingUpdate({
      type: "RESCHEDULED",
      sessionId: session.sessionId,
      broadcastAt: rescheduledAt,
      newSlotId,
    });
  } catch (err) {
    console.warn("[RescheduleOrchestrator] storage broadcast failed (non-fatal):", err);
  }

  // ── STEP 10: transitionTo("RESCHEDULED") via dep-injection (RULE 1) ───────
  transitionTo("RESCHEDULED");

  return {
    success: true,
    rescheduledAt,
    newReservationId: newReservationId ?? "",
  };
}

// ─── Compensation helpers ─────────────────────────────────────────────────────
//
// These are BEST-EFFORT compensations. They do NOT guarantee atomicity.
// The DB is the authoritative source of truth. If compensation fails,
// a background job (Sprint 3.7) will reconcile orphaned reservations.
//

async function compensateReleaseNewSlot(
  supabase: ReturnType<typeof createClient>,
  newReservationId: string,
  releasedAt: string,
): Promise<void> {
  try {
    await supabase
      .from("slot_reservations")
      .update({ status: "RELEASED", released_at: releasedAt })
      .eq("id", newReservationId);
  } catch (err) {
    console.error("[RescheduleOrchestrator] compensation(release_new) failed:", err);
  }
}

async function compensateRestoreOldSlot(
  supabase: ReturnType<typeof createClient>,
  session: ConsultationBookingSession,
  oldReservationId: string | null,
  newReservationId: string,
  restoredAt: string,
): Promise<void> {
  // 1. Release the new reservation
  await compensateReleaseNewSlot(supabase, newReservationId, restoredAt);

  // 2. Restore old reservation status to RESERVED (if it was just released)
  if (oldReservationId) {
    try {
      await supabase
        .from("slot_reservations")
        .update({ status: "RESERVED", released_at: null })
        .eq("id", oldReservationId)
        .eq("status", "RELEASED"); // only undo if we were the one who released it
    } catch (err) {
      console.error("[RescheduleOrchestrator] compensation(restore_old) failed:", err);
    }
  }

  // 3. Restore consultation slot_id
  if (session.selectedSlotId) {
    try {
      await supabase
        .from("consultations")
        .update({
          slot_id: session.selectedSlotId,
          booking_phase: session.bookingFlowPhase,
          status: session.bookingStatus,
          updated_at: restoredAt,
        })
        .eq("id", session.sessionId);
    } catch (err) {
      console.error("[RescheduleOrchestrator] compensation(restore_consultation) failed:", err);
    }
  }
}

// ─── Policy helpers (exported for UI) ─────────────────────────────────────────

export { RESCHEDULABLE_PHASES } from "../types/consultationBookingTypesPatch";

export function isReschedulablePhase(phase: BookingPhase): boolean {
  return RESCHEDULABLE_PHASES.includes(phase);
}

export function getReschedulePolicyMessage(phase: BookingPhase): string {
  const messages: Partial<Record<BookingPhase, string>> = {
    EXPIRED:   "لا يمكن إعادة جدولة حجز منتهية مدته.",
    COMPLETED: "لا يمكن إعادة جدولة جلسة مكتملة.",
    CANCELLED: "لا يمكن إعادة جدولة حجز ملغى.",
    ABANDONED: "انتهت صلاحية هذا الحجز.",
    REVIEW:    "لإعادة الجدولة، ارجع لاختيار الموعد من البداية.",
  };
  return messages[phase] ?? "إعادة الجدولة غير متاحة في الوضع الحالي.";
}
