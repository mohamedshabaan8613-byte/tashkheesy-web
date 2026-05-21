/**
 * consultationBookingTypesPatch.ts — Sprint 3.5
 *
 * STATE MACHINE EXPANSION:
 *
 * Problem: consultationBookingTypes.ts has BookingPhase without "CANCELLING".
 * Solution: This patch file adds the new phase and expands ALLOWED_TRANSITIONS
 *   WITHOUT touching the core types file (to prevent merge conflicts).
 *   Sprint 3.6: Merge this back into consultationBookingTypes.ts.
 *
 * NEW TRANSITIONS ADDED:
 *   CONFIRMED → CANCELLING         (user cancels a confirmed booking)
 *   CANCELLING → CANCELLED         (cancellation persisted successfully)
 *   CANCELLING → CONFIRMED         (rollback if cancellation fails)
 *   REVIEW → CANCELLED             (pre-confirm cancellation — already in ALLOWED_TRANSITIONS)
 *   SLOT_SELECTION → CANCELLED     (already in ALLOWED_TRANSITIONS)
 *   SPECIALIST_SELECTION → CANCELLED (already in ALLOWED_TRANSITIONS)
 *
 * CANCELLABLE_PHASES:
 *   The definitive list of phases from which cancellation is permitted.
 *   Exported and used by CancellationOrchestrator and UI components.
 *
 * USAGE:
 *   import { CANCELLABLE_PHASES, isCancellingPhase } from "../types/consultationBookingTypesPatch";
 *   import type { BookingPhaseV2 } from "../types/consultationBookingTypesPatch";
 */

import type { BookingPhase } from "./consultationBookingTypes";
import { ALLOWED_TRANSITIONS, isValidTransition as baseIsValidTransition } from "./consultationBookingTypes";

// ─── Expanded Phase Type ──────────────────────────────────────────────────────

/**
 * BookingPhaseV2 adds CANCELLING to the core BookingPhase union.
 * Consumers that need the in-progress cancellation state should use this.
 * Core consumers (Context, Orchestrators) still use BookingPhase for now.
 */
export type BookingPhaseV2 = BookingPhase | "CANCELLING";

// ─── CANCELLABLE_PHASES ────────────────────────────────────────────────────

/**
 * CANCELLABLE_PHASES
 *
 * Definitive list of BookingPhases from which a cancellation is permitted.
 *
 * POLICY:
 *   - EXPIRED: ❌ cannot cancel — already terminal
 *   - COMPLETED: ❌ cannot cancel — session ended
 *   - CANCELLED: ❌ cannot cancel — already cancelled
 *   - ABANDONED: ❌ cannot cancel — stale terminal state
 *   - All others: ✅ allowed
 *
 * Re-exported from consultationBookingTypes.ts in Sprint 3.6.
 */
export const CANCELLABLE_PHASES: readonly BookingPhase[] = [
  "CREATED",
  "SPECIALIST_SELECTION",
  "SLOT_SELECTION",
  "REVIEW",
  "CONFIRMED",
  "RESCHEDULED",
] as const;

// ─── Expanded Transitions Map ──────────────────────────────────────────────────

/**
 * EXPANDED_TRANSITIONS_V2
 *
 * Extends ALLOWED_TRANSITIONS with Sprint 3.5 cancellation paths.
 *
 * New paths:
 *   CONFIRMED → CANCELLING   — optimistic UI: enter in-progress state
 *   CANCELLING → CANCELLED   — DB write succeeded
 *   CANCELLING → CONFIRMED   — rollback on DB write failure
 *
 * Existing paths (REVIEW, SLOT_SELECTION, SPECIALIST_SELECTION → CANCELLED)
 * are already present in the base ALLOWED_TRANSITIONS.
 */
export const EXPANDED_TRANSITIONS_V2: Readonly<
  Partial<Record<BookingPhaseV2, readonly BookingPhaseV2[]>>
> = {
  // Copy all existing transitions
  ...ALLOWED_TRANSITIONS,
  // Expand CONFIRMED to include CANCELLING intermediate step
  CONFIRMED: ["RESCHEDULED", "COMPLETED", "CANCELLED", "CANCELLING"],
  // New CANCELLING transitions
  CANCELLING: ["CANCELLED", "CONFIRMED"],
} as const;

/**
 * isValidTransitionV2
 *
 * Version of isValidTransition that understands CANCELLING phase.
 */
export function isValidTransitionV2(
  from: BookingPhaseV2,
  to: BookingPhaseV2,
): boolean {
  const allowed = EXPANDED_TRANSITIONS_V2[from];
  return allowed ? (allowed as readonly BookingPhaseV2[]).includes(to) : false;
}

// ─── Phase predicates ─────────────────────────────────────────────────────────

/** True if the phase represents an in-progress cancellation attempt. */
export function isCancellingPhase(phase: BookingPhaseV2): boolean {
  return phase === "CANCELLING";
}

/** True if the phase is any terminal cancellation state. */
export function isCancelledOrCancelling(phase: BookingPhaseV2): boolean {
  return phase === "CANCELLED" || phase === "CANCELLING";
}

/**
 * getExpandedCancellablePhases
 *
 * Returns CANCELLABLE_PHASES as a mutable array for runtime use.
 */
export function getExpandedCancellablePhases(): BookingPhase[] {
  return [...CANCELLABLE_PHASES];
}
