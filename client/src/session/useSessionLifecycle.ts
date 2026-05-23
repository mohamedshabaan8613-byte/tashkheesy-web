/**
 * useSessionLifecycle.ts — Sprint 3.7.1 Phase 1
 *
 * React hook that exposes the BookingSessionStateMachine state
 * to components via useSyncExternalStore.
 *
 * Phase 2: consumers can now also read `isStale` and call `forceRefresh`
 * directly from useConsultationBooking() — this hook is for components
 * that need to observe the raw machine state (e.g. debug panels, tests).
 */

import { useCallback, useSyncExternalStore } from "react";
import type { BookingSessionStateMachine, SessionMachineState } from "./BookingSessionStateMachine";

export interface SessionLifecycleSnapshot {
  machineState: SessionMachineState;
  isTerminal: boolean;
  isActive: boolean;
}

const TERMINAL_STATES: ReadonlySet<SessionMachineState> = new Set([
  "CANCELLED",
  "EXPIRED",
]);

const ACTIVE_STATES: ReadonlySet<SessionMachineState> = new Set([
  "CREATED",
  "SPECIALIST_SELECTION",
  "SLOT_SELECTION",
  "REVIEW",
  "CONFIRMING",
  "CONFIRMED",
  "RESCHEDULED",
]);

export function useSessionLifecycle(
  machine: BookingSessionStateMachine,
): SessionLifecycleSnapshot {
  const subscribe = useCallback(
    (cb: () => void) => machine.subscribe(() => cb()),
    [machine],
  );

  const getSnapshot = useCallback(
    (): SessionMachineState => machine.state,
    [machine],
  );

  const machineState = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return {
    machineState,
    isTerminal: TERMINAL_STATES.has(machineState),
    isActive:   ACTIVE_STATES.has(machineState),
  };
}
