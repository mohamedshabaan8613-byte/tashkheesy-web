/**
 * CancellationOrchestrator.ts — Sprint 3.5
 *
 * FULL PIPELINE:
 *   UI
 *   → orchestrateCancellation()
 *   → [Step 1] Validate ownership token
 *   → [Step 2] Validate cancellable phase (policy enforcement)
 *   → [Step 3] Validate lifecycleVersion (stale-state guard)
 *   → [Step 4] Release slot reservation (if one exists)
 *   → [Step 5] Persist CANCELLED status to Supabase
 *   → [Step 6] Emit BOOKING_CANCELLED domain event
 *   → [Step 7] Broadcast storage sync to other tabs
 *   → [Step 8] transitionTo("CANCELLED") via dep-injection
 *
 * CANCELLATION POLICIES:
 *   ❌ Cannot cancel EXPIRED session
 *   ❌ Cannot cancel COMPLETED session
 *   ❌ Cannot cancel already CANCELLED session
 *   ❌ Cannot cancel ABANDONED session
 *   ❌ Ownership token required
 *   ❌ Stale lifecycleVersion rejected
 *   ✅ CONFIRMED → CANCELLED (confirmed but not yet completed)
 *   ✅ REVIEW → CANCELLED (pre-confirm cancellation)
 *   ✅ SLOT_SELECTION → CANCELLED
 *   ✅ SPECIALIST_SELECTION → CANCELLED
 *
 * DESIGN RULES (inherited from Sprint 3.4):
 *   RULE 1 — No direct Context import. transitionTo is dep-injected.
 *   RULE 2 — Never calls navigate() — caller owns routing.
 *   RULE 3 — All side effects are sequenced; partial failures return typed errors.
 *   RULE 4 — Retry policy: NOT applied here. Cancellation is a mutation.
 *
 * SCOPE BOUNDARY:
 *   ✅ Cancellation pipeline only
 *   ❌ No reschedule logic
 *   ❌ No payment refund processing
 *   ❌ No email sending (notification queue only)
 */

import type { BookingPhase, ConsultationBookingSession } from "../types/consultationBookingTypes";
import { isValidTransition, CANCELLABLE_PHASES } from "../types/consultationBookingTypes";
import { validateLifecycleVersion } from "../reliability/lifecycleVersionValidator";
import { broadcastBookingUpdate } from "../reliability/storageEventSync";
import { bookingEventBus, createBookingEvent } from "../types/bookingDomainEvents";
import { createClient } from "@supabase/supabase-js";

// ─── Input / Output types ─────────────────────────────────────────────────────

export interface CancellationInput {
  /** The runtime session to cancel. */
  session: ConsultationBookingSession;
  /** Ownership token held by the current tab. Must match session token. */
  ownershipToken: string;
  /** Human-readable reason (stored in DB for audit). */
  reason?: string;
  /**
   * Authoritative lifecycleVersion from storage/server.
   * Pass null if unavailable (will result in soft-reject for safety).
   */
  authoritativeVersion: string | null;
}

export type CancellationFailureReason =
  | "non_cancellable_phase"        // EXPIRED, COMPLETED, CANCELLED, ABANDONED
  | "ownership_token_mismatch"     // token doesn't match
  | "stale_lifecycle_version"      // version mismatch
  | "authoritative_version_unavailable" // cannot verify version
  | "reservation_release_failed"   // slot release had DB error
  | "persist_failed"               // CANCELLED status not written to DB
  | "unknown_error";

export type CancellationResult =
  | { success: true; cancelledAt: string }
  | { success: false; reason: CancellationFailureReason; details?: string };

export interface CancellationDeps {
  /** Dep-injected from ConsultationBookingContext. RULE 1. */
  transitionTo: (phase: BookingPhase) => void;
  /** Optional: Supabase client. If omitted, DB steps are skipped (test mode). */
  supabase?: ReturnType<typeof createClient>;
}

// ─── Main orchestrator ─────────────────────────────────────────────────────────

export async function orchestrateCancellation(
  input: CancellationInput,
  deps: CancellationDeps,
): Promise<CancellationResult> {
  const { session, ownershipToken, reason = "user_requested", authoritativeVersion } = input;
  const { transitionTo, supabase } = deps;

  // ── STEP 1: Validate ownership token ─────────────────────────────────────
  const sessionToken = (session as Record<string, unknown>).ownershipToken as string | undefined;
  // ownershipToken = sessionId in v1 (Sprint 3.5). Full token column in Sprint 3.6.
  const effectiveSessionToken = sessionToken ?? session.sessionId;
  if (ownershipToken !== effectiveSessionToken) {
    return {
      success: false,
      reason: "ownership_token_mismatch",
      details: `expected:${effectiveSessionToken} provided:${ownershipToken}`,
    };
  }

  // ── STEP 2: Validate cancellable phase (Policy Enforcement) ─────────────
  if (!CANCELLABLE_PHASES.includes(session.bookingFlowPhase)) {
    return {
      success: false,
      reason: "non_cancellable_phase",
      details: `phase:${session.bookingFlowPhase}`,
    };
  }

  if (!isValidTransition(session.bookingFlowPhase, "CANCELLED")) {
    return {
      success: false,
      reason: "non_cancellable_phase",
      details: `no_transition_from:${session.bookingFlowPhase}`,
    };
  }

  // ── STEP 3: Validate lifecycleVersion (Stale-state guard) ───────────────
  const versionCheck = validateLifecycleVersion(
    session.lifecycleVersion,
    authoritativeVersion,
  );
  if (!versionCheck.valid) {
    if (versionCheck.reason === "authoritative_unavailable") {
      // Fail-closed for mutations: if we can't verify, reject.
      return { success: false, reason: "authoritative_version_unavailable" };
    }
    return { success: false, reason: "stale_lifecycle_version", details: versionCheck.reason };
  }

  // ── STEP 4: Release slot reservation (if exists) ────────────────────────
  const reservationId = (session as Record<string, unknown>).reservationId as string | undefined;
  if (reservationId && supabase) {
    try {
      const { error: releaseError } = await supabase
        .from("slot_reservations")
        .update({ status: "RELEASED", released_at: new Date().toISOString() })
        .eq("id", reservationId)
        .eq("status", "RESERVED");

      if (releaseError) {
        // Non-fatal: log and continue — reservation release failure
        // should not block the cancellation of a booking the user
        // explicitly requested. The slot will expire via TTL.
        console.error(
          "[CancellationOrchestrator] slot release failed (non-fatal):",
          releaseError,
        );
      }
    } catch (err) {
      console.error(
        "[CancellationOrchestrator] slot release exception (non-fatal):",
        err,
      );
    }
  }

  // ── STEP 5: Persist CANCELLED status ────────────────────────────────────
  const cancelledAt = new Date().toISOString();
  if (supabase) {
    try {
      const { error: updateError } = await supabase
        .from("consultations")
        .update({
          status: "CANCELLED",
          booking_phase: "CANCELLED",
          cancelled_at: cancelledAt,
          cancellation_reason: reason,
          updated_at: cancelledAt,
        })
        .eq("id", session.sessionId)
        .eq("ownership_token", ownershipToken);

      if (updateError) {
        return {
          success: false,
          reason: "persist_failed",
          details: updateError.message,
        };
      }
    } catch (err) {
      return {
        success: false,
        reason: "persist_failed",
        details: err instanceof Error ? err.message : "unknown_db_error",
      };
    }
  }

  // ── STEP 6: Emit BOOKING_CANCELLED domain event ───────────────────────
  try {
    const event = createBookingEvent(
      "BOOKING_CANCELLED",
      session.sessionId,
      session.sourceIntentId,
      {
        reason,
        cancelledAt,
        previousPhase: session.bookingFlowPhase,
        reservationId: reservationId ?? null,
      },
    );
    bookingEventBus.publish(event);
  } catch (err) {
    // Domain event failure is non-fatal — booking is already cancelled in DB
    console.error("[CancellationOrchestrator] event bus publish failed (non-fatal):", err);
  }

  // ── STEP 7: Broadcast storage sync to other tabs ─────────────────────
  try {
    broadcastBookingUpdate({
      type: "CANCELLED",
      sessionId: session.sessionId,
      broadcastAt: cancelledAt,
      reason,
    });
  } catch (err) {
    // Non-fatal — other tabs will detect stale state on next interaction
    console.warn("[CancellationOrchestrator] storage broadcast failed (non-fatal):", err);
  }

  // ── STEP 8: Transition to CANCELLED via dep-injection (RULE 1) ──────────
  transitionTo("CANCELLED");

  return { success: true, cancelledAt };
}

// ─── Cancellation policy helpers ──────────────────────────────────────────────────

/**
 * isCancellablePhase
 *
 * Returns true if the given phase allows cancellation.
 * Use this for UI button disabled state.
 *
 * @example
 * <button disabled={!isCancellablePhase(currentPhase)}>إلغاء الحجز</button>
 */
export function isCancellablePhase(phase: BookingPhase): boolean {
  return CANCELLABLE_PHASES.includes(phase);
}

/**
 * getCancellationPolicyMessage
 *
 * Returns an Arabic explanation of why a phase is non-cancellable.
 * Used in tooltip / error UI.
 */
export function getCancellationPolicyMessage(phase: BookingPhase): string {
  const messages: Partial<Record<BookingPhase, string>> = {
    EXPIRED: "لا يمكن إلغاء حجز منتهية مدته.",
    COMPLETED: "لا يمكن إلغاء جلسة مكتملة.",
    CANCELLED: "الحجز ملغى بالفعل.",
    CANCELLING: "جاري تنفيذ الإلغاء...",
    ABANDONED: "انتهت صلاحية هذا الحجز.",
  };
  return messages[phase] ?? "الإلغاء غير متاح في الوضع الحالي.";
}
