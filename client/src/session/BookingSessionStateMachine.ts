/**
 * BookingSessionStateMachine
 *
 * Sprint 3.7.1 — Phase 1: Session Runtime
 *
 * Authoritative state machine for the booking session lifecycle.
 * Owns ALL valid state transitions. Nothing outside this class
 * may transition session state directly.
 *
 * States:
 *   IDLE          → No active session.
 *   INITIALIZING  → Session setup in progress (auth + slot fetch).
 *   ACTIVE        → Session live, mutations allowed.
 *   STALE         → Server version ahead of client — mutations BLOCKED.
 *   RESCHEDULING  → Atomic reschedule RPC in flight.
 *   CONFIRMING    → Booking confirmation in flight.
 *   COMPLETED     → Terminal success state.
 *   EXPIRED       → Auth token or slot reservation expired.
 *   ERROR         → Unrecoverable error state.
 *
 * Transition rules are exhaustive and fail-closed.
 * Any attempt to transition via an invalid edge throws.
 */

export type BookingSessionState =
  | 'IDLE'
  | 'INITIALIZING'
  | 'ACTIVE'
  | 'STALE'
  | 'RESCHEDULING'
  | 'CONFIRMING'
  | 'COMPLETED'
  | 'EXPIRED'
  | 'ERROR';

export interface SessionTransitionEvent {
  from: BookingSessionState;
  to:   BookingSessionState;
  at:   number; // epoch ms
  reason?: string;
}

// Valid directed edges in the state graph.
const VALID_TRANSITIONS: Record<BookingSessionState, BookingSessionState[]> = {
  IDLE:         ['INITIALIZING'],
  INITIALIZING: ['ACTIVE', 'EXPIRED', 'ERROR'],
  ACTIVE:       ['STALE', 'RESCHEDULING', 'CONFIRMING', 'EXPIRED', 'ERROR'],
  STALE:        ['ACTIVE', 'EXPIRED', 'ERROR'],           // ACTIVE after forceRefresh
  RESCHEDULING: ['ACTIVE', 'STALE', 'EXPIRED', 'ERROR'],  // ACTIVE on success
  CONFIRMING:   ['COMPLETED', 'ACTIVE', 'EXPIRED', 'ERROR'],
  COMPLETED:    [],                                        // terminal
  EXPIRED:      ['INITIALIZING'],                         // re-auth path
  ERROR:        ['IDLE', 'INITIALIZING'],                 // explicit reset
};

export class BookingSessionStateMachine {
  private _state: BookingSessionState = 'IDLE';
  private _history: SessionTransitionEvent[] = [];
  private _listeners: Array<(event: SessionTransitionEvent) => void> = [];

  // ── Read ──────────────────────────────────────────────────────

  get state(): BookingSessionState {
    return this._state;
  }

  get history(): Readonly<SessionTransitionEvent[]> {
    return this._history;
  }

  is(state: BookingSessionState): boolean {
    return this._state === state;
  }

  canTransitionTo(target: BookingSessionState): boolean {
    return VALID_TRANSITIONS[this._state].includes(target);
  }

  // ── Mutations ─────────────────────────────────────────────────

  /**
   * Attempt a state transition.
   * Throws if the transition is not valid for the current state.
   * Fails closed — invalid edge = exception, never silent skip.
   */
  transitionTo(next: BookingSessionState, reason?: string): void {
    if (!this.canTransitionTo(next)) {
      throw new Error(
        `[BookingSessionStateMachine] Invalid transition: ${this._state} → ${next}. ` +
        `Valid targets: [${VALID_TRANSITIONS[this._state].join(', ')}]`
      );
    }
    const event: SessionTransitionEvent = {
      from:   this._state,
      to:     next,
      at:     Date.now(),
      reason,
    };
    this._state = next;
    this._history.push(event);
    this._notifyListeners(event);
  }

  /**
   * Hard reset to IDLE — only for explicit teardown (unmount / logout).
   * Does NOT go through normal transition validation.
   */
  reset(): void {
    const event: SessionTransitionEvent = {
      from:   this._state,
      to:     'IDLE',
      at:     Date.now(),
      reason: 'HARD_RESET',
    };
    this._state = 'IDLE';
    this._history.push(event);
    this._notifyListeners(event);
  }

  // ── Observers ─────────────────────────────────────────────────

  subscribe(listener: (event: SessionTransitionEvent) => void): () => void {
    this._listeners.push(listener);
    return () => {
      this._listeners = this._listeners.filter(l => l !== listener);
    };
  }

  private _notifyListeners(event: SessionTransitionEvent): void {
    for (const listener of this._listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('[BookingSessionStateMachine] Listener threw:', err);
      }
    }
  }
}
