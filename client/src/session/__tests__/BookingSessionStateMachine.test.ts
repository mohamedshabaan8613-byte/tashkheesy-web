/**
 * BookingSessionStateMachine.test.ts
 * Sprint 3.7.1 Phase 1 — 11 unit tests
 */

import { describe, it, expect, beforeEach } from "vitest";
import { BookingSessionStateMachine } from "../BookingSessionStateMachine";

describe("BookingSessionStateMachine", () => {
  let machine: BookingSessionStateMachine;

  beforeEach(() => {
    machine = new BookingSessionStateMachine();
  });

  // ── Initial state ──────────────────────────────────────────────────────────

  it("starts in IDLE", () => {
    expect(machine.state).toBe("IDLE");
  });

  // ── Happy-path transitions ─────────────────────────────────────────────────

  it("transitions IDLE → CREATED on CREATE", () => {
    expect(machine.transition("CREATE")).toBe(true);
    expect(machine.state).toBe("CREATED");
  });

  it("transitions through the full booking flow", () => {
    machine.transition("CREATE");
    machine.transition("SELECT_SPECIALIST");
    machine.transition("SELECT_SLOT");
    machine.transition("REVIEW");
    machine.transition("CONFIRM_START");
    machine.transition("CONFIRM_SUCCESS");
    expect(machine.state).toBe("CONFIRMED");
  });

  it("allows RESCHEDULE from CONFIRMED", () => {
    machine.transition("CREATE");
    machine.transition("SELECT_SPECIALIST");
    machine.transition("SELECT_SLOT");
    machine.transition("REVIEW");
    machine.transition("CONFIRM_START");
    machine.transition("CONFIRM_SUCCESS");
    expect(machine.transition("RESCHEDULE")).toBe(true);
    expect(machine.state).toBe("RESCHEDULED");
  });

  // ── Cancellation ──────────────────────────────────────────────────────────

  it("allows CANCEL from CREATED", () => {
    machine.transition("CREATE");
    expect(machine.transition("CANCEL")).toBe(true);
    expect(machine.state).toBe("CANCELLED");
  });

  it("allows EXPIRE from SLOT_SELECTION", () => {
    machine.transition("CREATE");
    machine.transition("SELECT_SPECIALIST");
    machine.transition("SELECT_SLOT");
    expect(machine.transition("EXPIRE")).toBe(true);
    expect(machine.state).toBe("EXPIRED");
  });

  // ── Invalid transitions ────────────────────────────────────────────────────

  it("rejects invalid transitions and returns false", () => {
    machine.transition("CREATE");
    expect(machine.transition("CONFIRM_SUCCESS")).toBe(false);
    expect(machine.state).toBe("CREATED"); // state unchanged
  });

  it("rejects any transition from terminal CANCELLED state", () => {
    machine.transition("CREATE");
    machine.transition("CANCEL");
    expect(machine.transition("CREATE")).toBe(false);
    expect(machine.state).toBe("CANCELLED");
  });

  // ── History ────────────────────────────────────────────────────────────────

  it("records transition history", () => {
    machine.transition("CREATE");
    machine.transition("SELECT_SPECIALIST");
    const h = machine.history;
    expect(h).toHaveLength(2);
    expect(h[0].from).toBe("IDLE");
    expect(h[0].to).toBe("CREATED");
    expect(h[1].from).toBe("CREATED");
    expect(h[1].to).toBe("SPECIALIST_SELECTION");
  });

  // ── syncToPhase ────────────────────────────────────────────────────────────

  it("syncToPhase aligns machine state to domain phase directly", () => {
    machine.syncToPhase("CONFIRMED");
    expect(machine.state).toBe("CONFIRMED");
  });

  // ── reset ──────────────────────────────────────────────────────────────────

  it("reset returns machine to IDLE and clears history", () => {
    machine.transition("CREATE");
    machine.transition("SELECT_SPECIALIST");
    machine.reset();
    expect(machine.state).toBe("IDLE");
    expect(machine.history).toHaveLength(0);
  });

  // ── Listeners ─────────────────────────────────────────────────────────────

  it("notifies listeners on transition", () => {
    const states: string[] = [];
    machine.subscribe(s => states.push(s));
    machine.transition("CREATE");
    machine.transition("SELECT_SPECIALIST");
    expect(states).toEqual(["CREATED", "SPECIALIST_SELECTION"]);
  });
});
