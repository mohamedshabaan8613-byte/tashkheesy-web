/**
 * SessionGuard.test.ts
 * Sprint 3.7.1 Phase 1 — 8 unit tests
 */

import { describe, it, expect, beforeEach } from "vitest";
import { BookingSessionStateMachine } from "../BookingSessionStateMachine";
import { SessionGuard } from "../SessionGuard";

describe("SessionGuard", () => {
  let machine: BookingSessionStateMachine;
  let guard: SessionGuard;

  beforeEach(() => {
    machine = new BookingSessionStateMachine();
    guard = new SessionGuard(machine);
  });

  const v1 = "2024-01-01T10:00:00.000Z";
  const v2 = "2024-01-01T11:00:00.000Z"; // v2 > v1

  // ── STALE ──────────────────────────────────────────────────────────────────

  it("blocks when clientVersion < serverVersion (STALE)", () => {
    machine.transition("CREATE");
    const r = guard.check("SELECT_SPECIALIST", v1, v2);
    expect(r.allowed).toBe(false);
    if (!r.allowed) expect(r.reason).toBe("STALE");
  });

  it("allows when clientVersion === serverVersion", () => {
    machine.transition("CREATE");
    const r = guard.check("SELECT_SPECIALIST", v1, v1);
    expect(r.allowed).toBe(true);
  });

  it("allows when both versions are null (first operation)", () => {
    machine.transition("CREATE");
    const r = guard.check("SELECT_SPECIALIST", null, null);
    expect(r.allowed).toBe(true);
  });

  // ── CONCURRENT ─────────────────────────────────────────────────────────────

  it("blocks when an operation is in-flight (CONCURRENT)", () => {
    machine.transition("CREATE");
    guard.beginOperation();
    const r = guard.check("SELECT_SPECIALIST", v1, v1);
    expect(r.allowed).toBe(false);
    if (!r.allowed) expect(r.reason).toBe("CONCURRENT");
    guard.endOperation();
  });

  it("allows after endOperation clears the in-flight flag", () => {
    machine.transition("CREATE");
    guard.beginOperation();
    guard.endOperation();
    const r = guard.check("SELECT_SPECIALIST", v1, v1);
    expect(r.allowed).toBe(true);
  });

  // ── INVALID_STATE ──────────────────────────────────────────────────────────

  it("blocks CONFIRM from CREATED state (INVALID_STATE)", () => {
    machine.transition("CREATE");
    const r = guard.check("CONFIRM", v1, v1);
    expect(r.allowed).toBe(false);
    if (!r.allowed) expect(r.reason).toBe("INVALID_STATE");
  });

  it("allows CONFIRM from REVIEW state", () => {
    machine.syncToPhase("REVIEW");
    const r = guard.check("CONFIRM", v1, v1);
    expect(r.allowed).toBe(true);
  });

  // ── Terminal state ─────────────────────────────────────────────────────────

  it("blocks all mutations from CANCELLED terminal state", () => {
    machine.syncToPhase("CANCELLED");
    const mutations: Array<import("../BookingSessionStateMachine").SessionMutationType> =
      ["SELECT_SPECIALIST", "SELECT_SLOT", "CONFIRM", "RESCHEDULE", "CANCEL"];
    for (const m of mutations) {
      const r = guard.check(m, v1, v1);
      expect(r.allowed).toBe(false);
    }
  });
});
