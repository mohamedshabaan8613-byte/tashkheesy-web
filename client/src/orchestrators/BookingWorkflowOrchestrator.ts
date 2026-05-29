/**
 * BookingWorkflowOrchestrator.ts — Sprint 3.7.1 TRACK 2.3
 *
 * Thin Semantic Orchestrator for Booking Workflow Phase Transitions.
 *
 * RESPONSIBILITY:
 *   Restore mutation governance for the canonical booking workflow:
 *     CREATED → SPECIALIST_SELECTION → SLOT_SELECTION → REVIEW → CONFIRMED
 *
 *   Each function represents a single semantic transition intent.
 *   transitionTo is received via dep-injection — NOT imported directly.
 *
 * ARCHITECTURE RULE:
 *   UI → orchestrator → transitionTo
 *   UI MUST NOT call transitionTo or advancePhase directly.
 *
 * NOT RESPONSIBLE FOR:
 *   - Persistence logic
 *   - Hydration mutation
 *   - Routing ownership
 *   - Async orchestration
 *   - Retry handling
 *   - Side-effect expansion
 *   - Repository interaction
 */

import type { BookingPhase } from "../types/consultationBookingTypes";

// ─── Dependency Type ────────────────────────────────────────────────────────

export type TransitionFn = (
  to: BookingPhase,
  triggeredBy?: "orchestrator" | "recovery" | "expiration",
) => boolean;

// ─── TARGET A: Specialist Selection → Slot Selection ────────────────────────

/**
 * Orchestrates the transition from SPECIALIST_SELECTION to SLOT_SELECTION.
 *
 * Called by SpecialistSelectionPage after a specialist is selected.
 * Semantic intent: "specialist has been chosen, advance to slot selection."
 */
export function orchestrateSpecialistConfirmed(
  transitionTo: TransitionFn,
): boolean {
  return transitionTo("SLOT_SELECTION", "orchestrator");
}

// ─── TARGET B: Slot Selection → Review ──────────────────────────────────────

/**
 * Orchestrates the transition from SLOT_SELECTION to REVIEW.
 *
 * Called by SlotSelectionPage after a time slot is selected.
 * Semantic intent: "slot has been chosen, advance to review."
 */
export function orchestrateSlotConfirmed(
  transitionTo: TransitionFn,
): boolean {
  return transitionTo("REVIEW", "orchestrator");
}
