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

const TERMINAL_STATES: ReadonlySet<SessionMachineState> = new Set<SessionMachineState>([
  "CANCELLED",
  "EXPIRED",
]);

const ACTIVE_STATES: ReadonlySet<SessionMachineState> = new Set<SessionMachineState>([
  "CREATED",
  "SPECIALIST_SELECTION",
  "SLOT_SELECTION",
  "REVIEW",
  "CONFIRMING",
  "CONFIRMED",
  "RESCHEDULED",
]);

export function useSessionLifecycle(
  machine: BookingSessionStateMachine
): SessionLifecycleSnapshot {
  const subscribe = useCallback(
    (onStoreChange: () => void) => machine.subscribe(onStoreChange),
    [machine]
  );

  const getSnapshot = useCallback((): SessionLifecycleSnapshot => {
    const machineState = machine.getState();
    return {
      machineState,
      isTerminal: TERMINAL_STATES.has(machineState),
      isActive: ACTIVE_STATES.has(machineState),
    };
  }, [machine]);

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
