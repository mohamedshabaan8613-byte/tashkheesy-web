/**
 * useSessionLifecycle.integration.test.tsx
 * Sprint 3.7.1 Phase 2 — Integration: hook + machine
 *
 * Verifies that useSessionLifecycle correctly reflects machine state
 * using useSyncExternalStore.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { BookingSessionStateMachine } from "../BookingSessionStateMachine";
import { useSessionLifecycle } from "../useSessionLifecycle";

describe("useSessionLifecycle (integration)", () => {
  let machine: BookingSessionStateMachine;

  beforeEach(() => {
    machine = new BookingSessionStateMachine();
  });

  it("reflects initial IDLE state", () => {
    const { result } = renderHook(() => useSessionLifecycle(machine));
    expect(result.current.machineState).toBe("IDLE");
    expect(result.current.isTerminal).toBe(false);
    expect(result.current.isActive).toBe(false);
  });

  it("updates snapshot when machine transitions", () => {
    const { result } = renderHook(() => useSessionLifecycle(machine));

    act(() => { machine.transition("CREATE"); });
    expect(result.current.machineState).toBe("CREATED");
    expect(result.current.isActive).toBe(true);
  });

  it("marks isTerminal when machine reaches CANCELLED", () => {
    const { result } = renderHook(() => useSessionLifecycle(machine));

    act(() => {
      machine.transition("CREATE");
      machine.transition("CANCEL");
    });

    expect(result.current.isTerminal).toBe(true);
    expect(result.current.isActive).toBe(false);
  });

  it("marks isTerminal when machine reaches EXPIRED", () => {
    const { result } = renderHook(() => useSessionLifecycle(machine));

    act(() => {
      machine.syncToPhase("EXPIRED");
    });

    expect(result.current.isTerminal).toBe(true);
  });

  it("reflects syncToPhase updates immediately", () => {
    const { result } = renderHook(() => useSessionLifecycle(machine));

    act(() => { machine.syncToPhase("CONFIRMED"); });
    expect(result.current.machineState).toBe("CONFIRMED");
    expect(result.current.isActive).toBe(true);
    expect(result.current.isTerminal).toBe(false);
  });

  it("reflects reset back to IDLE", () => {
    const { result } = renderHook(() => useSessionLifecycle(machine));

    act(() => {
      machine.transition("CREATE");
      machine.transition("SELECT_SPECIALIST");
      machine.reset();
    });

    expect(result.current.machineState).toBe("IDLE");
    expect(result.current.isActive).toBe(false);
  });
});
