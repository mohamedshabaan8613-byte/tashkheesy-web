/**
 * SessionGuard.ts — Sprint 3.7.1 Phase 1
 *
 * Guards every booking mutation.
 * Consults BookingSessionStateMachine for state validity.
 * Version-compares client vs server timestamp to detect stale sessions.
 *
 * Phase 2 addition: GuardCheckResult is now exported for use in Context.
 */

import type { BookingSessionStateMachine, SessionMutationType } from "./BookingSessionStateMachine";

export type GuardBlockedReason =
  | "STALE"        // client version behind server
  | "CONCURRENT"   // another operation is in-flight
  | "EXPIRED"      // session TTL exceeded
  | "INVALID_STATE"; // state machine doesn't allow this mutation

export type GuardCheckResult =
  | { allowed: true }
  | { allowed: false; reason: GuardBlockedReason; detail?: string };

// Mutations allowed per machine state
const ALLOWED_MUTATIONS: Partial<Record<string, SessionMutationType[]>> = {
  CREATED:              ["SELECT_SPECIALIST", "CANCEL"],
  SPECIALIST_SELECTION: ["SELECT_SPECIALIST", "CANCEL"],
  SLOT_SELECTION:       ["SELECT_SLOT", "CANCEL"],
  REVIEW:               ["CONFIRM", "CANCEL"],
  CONFIRMING:           ["CANCEL"],
  CONFIRMED:            ["RESCHEDULE"],
  RESCHEDULED:          ["CONFIRM", "CANCEL"],
};

export class SessionGuard {
  private _inFlight = false;

  constructor(private readonly machine: BookingSessionStateMachine) {}

  /**
   * check() — pre-flight validation.
   *
   * @param mutation    The mutation the caller wants to perform.
   * @param clientVersion  ISO timestamp from context session (lastActivityAt).
   * @param serverVersion  ISO timestamp from repository session (lastActivityAt).
   */
  check(
    mutation: SessionMutationType,
    clientVersion: string | null,
    serverVersion: string | null,
  ): GuardCheckResult {
    // 1. Stale check — client behind server
    if (
      clientVersion !== null &&
      serverVersion !== null &&
      clientVersion < serverVersion
    ) {
      return { allowed: false, reason: "STALE", detail: `client=${clientVersion} server=${serverVersion}` };
    }

    // 2. Concurrency check
    if (this._inFlight) {
      return { allowed: false, reason: "CONCURRENT" };
    }

    // 3. State machine check
    const currentState = this.machine.state;
    const allowed = ALLOWED_MUTATIONS[currentState];
    if (!allowed || !allowed.includes(mutation)) {
      return {
        allowed: false,
        reason: "INVALID_STATE",
        detail: `state=${currentState} does not allow mutation=${mutation}`,
      };
    }

    return { allowed: true };
  }

  /** Mark an async operation as in-flight to block concurrent mutations */
  beginOperation(): void  { this._inFlight = true; }
  endOperation():   void  { this._inFlight = false; }
}
