/**
 * BookingSessionStateMachine.ts — Sprint 3.7.1 Phase 1
 *
 * Deterministic state machine for the booking session lifecycle.
 * Fail-closed: any unrecognised transition is rejected silently.
 *
 * States:
 *   IDLE → CREATED → SPECIALIST_SELECTION → SLOT_SELECTION
 *       → REVIEW → CONFIRMING → CONFIRMED → RESCHEDULED
 *       → CANCELLED | EXPIRED
 *
 * Phase 2 addition: syncToPhase(phase) — allows the Provider to align
 * the machine after a domain-level transition without going through the
 * machine's own transition graph (used during recovery and transitionTo).
 */

export type SessionMachineState =
  | "IDLE"
  | "CREATED"
  | "SPECIALIST_SELECTION"
  | "SLOT_SELECTION"
  | "REVIEW"
  | "CONFIRMING"
  | "CONFIRMED"
  | "RESCHEDULED"
  | "CANCELLED"
  | "EXPIRED";

export type SessionMachineEvent =
  | "CREATE"
  | "SELECT_SPECIALIST"
  | "SELECT_SLOT"
  | "REVIEW"
  | "CONFIRM_START"
  | "CONFIRM_SUCCESS"
  | "RESCHEDULE"
  | "CANCEL"
  | "EXPIRE";

/** Mutations that consumers can request — used by SessionGuard */
export type SessionMutationType =
  | "SELECT_SPECIALIST"
  | "SELECT_SLOT"
  | "CONFIRM"
  | "RESCHEDULE"
  | "CANCEL";

// ─── Transition table ─────────────────────────────────────────────────────────
type TransitionMap = Partial<Record<SessionMachineState, Partial<Record<SessionMachineEvent, SessionMachineState>>>>;

const TRANSITIONS: TransitionMap = {
  IDLE: {
    CREATE: "CREATED",
  },
  CREATED: {
    SELECT_SPECIALIST: "SPECIALIST_SELECTION",
    CANCEL:            "CANCELLED",
    EXPIRE:            "EXPIRED",
  },
  SPECIALIST_SELECTION: {
    SELECT_SLOT:       "SLOT_SELECTION",
    CANCEL:            "CANCELLED",
    EXPIRE:            "EXPIRED",
  },
  SLOT_SELECTION: {
    REVIEW:            "REVIEW",
    CANCEL:            "CANCELLED",
    EXPIRE:            "EXPIRED",
  },
  REVIEW: {
    CONFIRM_START:     "CONFIRMING",
    CANCEL:            "CANCELLED",
    EXPIRE:            "EXPIRED",
  },
  CONFIRMING: {
    CONFIRM_SUCCESS:   "CONFIRMED",
    CANCEL:            "CANCELLED",
    EXPIRE:            "EXPIRED",
  },
  CONFIRMED: {
    RESCHEDULE:        "RESCHEDULED",
    EXPIRE:            "EXPIRED",
  },
  RESCHEDULED: {
    CONFIRM_START:     "CONFIRMING",
    CANCEL:            "CANCELLED",
    EXPIRE:            "EXPIRED",
  },
  // Terminal states — no outbound transitions
  CANCELLED: {},
  EXPIRED:   {},
};

/** Phases from which the machine can be forcefully synced (recovery path) */
const SYNCABLE_PHASES: Partial<Record<string, SessionMachineState>> = {
  CREATED:              "CREATED",
  SPECIALIST_SELECTION: "SPECIALIST_SELECTION",
  SLOT_SELECTION:       "SLOT_SELECTION",
  REVIEW:               "REVIEW",
  CONFIRMING:           "CONFIRMING",
  CONFIRMED:            "CONFIRMED",
  RESCHEDULED:          "RESCHEDULED",
  CANCELLED:            "CANCELLED",
  EXPIRED:              "EXPIRED",
};

export class BookingSessionStateMachine {
  private _state: SessionMachineState = "IDLE";
  private _history: Array<{ from: SessionMachineState; event: SessionMachineEvent; to: SessionMachineState; at: string }> = [];
  private _listeners: Set<(state: SessionMachineState) => void> = new Set();

  get state(): SessionMachineState {
    return this._state;
  }

  get history() {
    return [...this._history];
  }

  // ── transition ─────────────────────────────────────────────────────────────
  transition(event: SessionMachineEvent): boolean {
    const possible = TRANSITIONS[this._state];
    if (!possible) return false;
    const next = possible[event];
    if (!next) {
      console.warn(`[StateMachine] No transition: ${this._state} --${event}--> ?`);
      return false;
    }
    const from = this._state;
    this._state = next;
    this._history.push({ from, event, to: next, at: new Date().toISOString() });
    this._notify();
    return true;
  }

  // ── syncToPhase — Phase 2 addition ─────────────────────────────────────────
  //
  // Used by Provider after a domain-level transitionTo() or recovery.
  // Bypasses the transition graph — sets state directly.
  // Only call this when the domain layer has already validated the transition.
  //
  syncToPhase(domainPhase: string): void {
    const machineState = SYNCABLE_PHASES[domainPhase];
    if (!machineState) {
      console.warn(`[StateMachine] syncToPhase: unknown domain phase "${domainPhase}"`);
      return;
    }
    this._state = machineState;
    this._notify();
  }

  // ── reset ───────────────────────────────────────────────────────────────────
  reset(): void {
    this._state = "IDLE";
    this._history = [];
    this._notify();
  }

  // ── subscribe / unsubscribe ─────────────────────────────────────────────────
  subscribe(listener: (state: SessionMachineState) => void): () => void {
    this._listeners.add(listener);
    return () => this._listeners.delete(listener);
  }

  private _notify(): void {
    this._listeners.forEach(l => l(this._state));
  }
}
