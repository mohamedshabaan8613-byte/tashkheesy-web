/**
 * consultationBookingTypesPatch.ts — Sprint 3.5 (updated: Phase 1B)
 *
 * PATCH HISTORY:
 *   Phase 1A (Cancellation):
 *     - BookingPhaseV2 (+ CANCELLING)
 *     - CANCELLABLE_PHASES
 *     - EXPANDED_TRANSITIONS_V2 (cancellation paths)
 *     - isCancellingPhase, isCancelledOrCancelling
 *
 *   Phase 1B (Reschedule) — THIS UPDATE:
 *     - RESCHEDULABLE_PHASES (policy constant)
 *     - RESCHEDULE_TRANSITIONS added to EXPANDED_TRANSITIONS_V2
 *     - isReschedulablePhase predicate
 *     - RescheduleSlotInput interface
 *     - RESCHEDULING intermediate phase in BookingPhaseV2
 *
 * MERGE PLAN:
 *   Sprint 3.6: merge this entire file into consultationBookingTypes.ts.
 *   Until then, import from this patch file for anything reschedule / cancellation.
 */

import type { BookingPhase } from "./consultationBookingTypes";
import { ALLOWED_TRANSITIONS } from "./consultationBookingTypes";

// ─── Expanded Phase Type ──────────────────────────────────────────────────────

/**
 * BookingPhaseV2
 * Adds CANCELLING + RESCHEDULING intermediate phases to the core union.
 *
 * Use BookingPhase for the main state machine.
 * Use BookingPhaseV2 in components and hooks that need to represent
 * in-progress operations without polluting the core type.
 */
export type BookingPhaseV2 = BookingPhase | "CANCELLING" | "RESCHEDULING";

// ─── CANCELLABLE_PHASES ────────────────────────────────────────────────────

export const CANCELLABLE_PHASES: readonly BookingPhase[] = [
  "CREATED",
  "SPECIALIST_SELECTION",
  "SLOT_SELECTION",
  "REVIEW",
  "CONFIRMED",
  "RESCHEDULED",
] as const;

// ─── RESCHEDULABLE_PHASES ──────────────────────────────────────────────────

/**
 * RESCHEDULABLE_PHASES
 *
 * POLICY:
 *   ✅ CONFIRMED  — primary reschedule use case
 *   ✅ RESCHEDULED — allow re-reschedule (no cap in Sprint 3.5)
 *   ❌ REVIEW, SLOT_SELECTION — use the slot selection flow instead
 *   ❌ CANCELLED, EXPIRED, COMPLETED, ABANDONED — terminal
 *   ❌ CREATED, SPECIALIST_SELECTION — no slot yet to reschedule FROM
 *
 * Note: The reschedule_count cap (e.g., max 3 reschedules)
 * is enforced server-side via DB policy in Sprint 3.6.
 */
export const RESCHEDULABLE_PHASES: readonly BookingPhase[] = [
  "CONFIRMED",
  "RESCHEDULED",
] as const;

// ─── Expanded Transitions Map (V2) ──────────────────────────────────────────────

export const EXPANDED_TRANSITIONS_V2: Readonly<
  Partial<Record<BookingPhaseV2, readonly BookingPhaseV2[]>>
> = {
  // ─ Base transitions (copied from ALLOWED_TRANSITIONS) ─
  ...ALLOWED_TRANSITIONS,

  // ─ Cancellation paths ─
  CONFIRMED:   ["RESCHEDULED", "COMPLETED", "CANCELLED", "CANCELLING", "RESCHEDULING"],
  RESCHEDULED: ["SLOT_SELECTION", "CANCELLED", "EXPIRED", "CANCELLING", "RESCHEDULING"],

  // ─ CANCELLING intermediate ─
  CANCELLING:   ["CANCELLED", "CONFIRMED"], // CONFIRMED = rollback

  // ─ RESCHEDULING intermediate ─
  RESCHEDULING: ["RESCHEDULED", "CONFIRMED"], // CONFIRMED = rollback on failure
} as const;

export function isValidTransitionV2(
  from: BookingPhaseV2,
  to: BookingPhaseV2,
): boolean {
  const allowed = EXPANDED_TRANSITIONS_V2[from];
  return allowed ? (allowed as readonly BookingPhaseV2[]).includes(to) : false;
}

// ─── Phase predicates ─────────────────────────────────────────────────────────

export function isCancellingPhase(phase: BookingPhaseV2): boolean {
  return phase === "CANCELLING";
}

export function isReschedulingPhase(phase: BookingPhaseV2): boolean {
  return phase === "RESCHEDULING";
}

export function isCancelledOrCancelling(phase: BookingPhaseV2): boolean {
  return phase === "CANCELLED" || phase === "CANCELLING";
}

export function isReschedulablePhase(phase: BookingPhase): boolean {
  return RESCHEDULABLE_PHASES.includes(phase);
}

export function isCancellablePhase(phase: BookingPhase): boolean {
  return CANCELLABLE_PHASES.includes(phase);
}

export function getExpandedCancellablePhases(): BookingPhase[] {
  return [...CANCELLABLE_PHASES];
}

export function getExpandedReschedulablePhases(): BookingPhase[] {
  return [...RESCHEDULABLE_PHASES];
}
