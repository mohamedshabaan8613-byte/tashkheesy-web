/**
 * useSessionLifecycle
 *
 * Sprint 3.7.1 — Phase 1: Session Runtime
 *
 * React hook that:
 *   1. Creates and owns a BookingSessionStateMachine instance.
 *   2. Exposes current state + transition helpers to the component tree.
 *   3. Integrates with MultiTabRealtimeSync to detect STALE state.
 *   4. Provides forceRefresh() to recover from STALE → ACTIVE.
 *   5. Provides guardCheck() pre-mutation validation.
 *
 * This hook does NOT own network calls or business logic.
 * It owns session state ONLY.
 *
 * Usage:
 *   const session = useSessionLifecycle(consultationId, clientVersion, serverVersion);
 *   if (!session.guardCheck('RESCHEDULE').allowed) { ... }
 *   session.transitionTo('RESCHEDULING');
 */

import { useEffect, useRef, useCallback, useSyncExternalStore } from 'react';
import { BookingSessionStateMachine, BookingSessionState } from './BookingSessionStateMachine';
import { SessionGuard, MutationType, GuardResult } from './SessionGuard';

export interface UseSessionLifecycleReturn {
  /** Current authoritative session state. */
  state:         BookingSessionState;

  /** Whether the session is in ACTIVE state (mutations allowed). */
  isActive:      boolean;

  /** Whether the session is STALE (server ahead, mutations blocked). */
  isStale:       boolean;

  /** Whether a mutation is currently in flight (RESCHEDULING | CONFIRMING). */
  isMutating:    boolean;

  /** Transition the session state machine. Throws on invalid edge. */
  transitionTo:  (next: BookingSessionState, reason?: string) => void;

  /** Hard reset to IDLE (unmount / logout). */
  reset:         () => void;

  /**
   * Pre-mutation guard check.
   * Call BEFORE dispatching to any orchestrator.
   */
  guardCheck:    (mutation: MutationType) => GuardResult;

  /**
   * Force an authoritative state refresh.
   * Transitions: STALE → INITIALIZING (triggers re-fetch in the consumer).
   * The consumer (context/page) owns the actual re-fetch.
   * This hook emits the event via onForceRefresh callback.
   */
  forceRefresh:  () => void;
}

interface UseSessionLifecycleOptions {
  consultationId: string | null;
  clientVersion:  number;
  serverVersion:  number;
  /**
   * Called when forceRefresh() is invoked.
   * The consumer (ConsultationBookingContext) owns the actual DB fetch.
   */
  onForceRefresh?: () => void;
  /**
   * Called on every state transition.
   * Useful for analytics / debugging.
   */
  onTransition?: (from: BookingSessionState, to: BookingSessionState, reason?: string) => void;
}

export function useSessionLifecycle({
  consultationId,
  clientVersion,
  serverVersion,
  onForceRefresh,
  onTransition,
}: UseSessionLifecycleOptions): UseSessionLifecycleReturn {

  // ── Stable refs ───────────────────────────────────────────────
  const machineRef = useRef<BookingSessionStateMachine | null>(null);
  if (!machineRef.current) {
    machineRef.current = new BookingSessionStateMachine();
  }
  const machine = machineRef.current;

  const guardRef = useRef<SessionGuard | null>(null);
  if (!guardRef.current) {
    guardRef.current = new SessionGuard(machine);
  }
  const guard = guardRef.current;

  // ── Stable version refs (avoid stale closure in callbacks) ────
  const clientVersionRef = useRef(clientVersion);
  const serverVersionRef = useRef(serverVersion);
  useEffect(() => { clientVersionRef.current = clientVersion; }, [clientVersion]);
  useEffect(() => { serverVersionRef.current = serverVersion; }, [serverVersion]);

  // ── useSyncExternalStore for React 18 concurrent safety ───────
  const state = useSyncExternalStore<BookingSessionState>(
    useCallback((callback) => machine.subscribe(() => callback()), [machine]),
    () => machine.state,
    () => 'IDLE' as BookingSessionState  // server snapshot
  );

  // ── Auto-detect STALE when serverVersion advances ─────────────
  useEffect(() => {
    if (
      machine.is('ACTIVE') &&
      serverVersionRef.current > clientVersionRef.current
    ) {
      machine.transitionTo('STALE', 'SERVER_VERSION_AHEAD');
    }
  }, [serverVersion, machine]);

  // ── Transition callback ───────────────────────────────────────
  useEffect(() => {
    if (!onTransition) return;
    const unsub = machine.subscribe((event) => {
      onTransition(event.from, event.to, event.reason);
    });
    return unsub;
  }, [machine, onTransition]);

  // ── Session init: IDLE → INITIALIZING when consultationId set ─
  useEffect(() => {
    if (consultationId && machine.is('IDLE')) {
      machine.transitionTo('INITIALIZING', 'CONSULTATION_LOADED');
    }
  }, [consultationId, machine]);

  // ── Cleanup on unmount ────────────────────────────────────────
  useEffect(() => {
    return () => {
      machine.reset();
    };
  }, [machine]);

  // ── Public API ────────────────────────────────────────────────
  const transitionTo = useCallback(
    (next: BookingSessionState, reason?: string) => {
      machine.transitionTo(next, reason);
    },
    [machine]
  );

  const reset = useCallback(() => machine.reset(), [machine]);

  const guardCheck = useCallback(
    (mutation: MutationType): GuardResult =>
      guard.check(mutation, clientVersionRef.current, serverVersionRef.current),
    [guard]
  );

  const forceRefresh = useCallback(() => {
    if (machine.is('STALE')) {
      machine.transitionTo('INITIALIZING', 'FORCE_REFRESH');
    }
    onForceRefresh?.();
  }, [machine, onForceRefresh]);

  return {
    state,
    isActive:   state === 'ACTIVE',
    isStale:    state === 'STALE',
    isMutating: state === 'RESCHEDULING' || state === 'CONFIRMING',
    transitionTo,
    reset,
    guardCheck,
    forceRefresh,
  };
}
