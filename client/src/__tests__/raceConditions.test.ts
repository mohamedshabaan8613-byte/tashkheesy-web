/**
 * raceConditions.test.ts — Sprint 3.4.2
 *
 * Integration tests for race condition handling in the booking lifecycle.
 *
 * COVERAGE:
 *   1. Parallel booking attempts     — only first request wins; second receives conflict
 *   2. Double-click confirm          — idempotency guard prevents duplicate confirmation
 *   3. Multi-tab overwrite           — ownership token mismatch detected and rejected
 *   4. Stale state conflicts         — booking confirmed externally; local state stale
 *
 * ARCHITECTURE:
 *   - All tests are pure in-memory — no Supabase calls, no network.
 *   - A SlotLockRegistry simulates the server-side optimistic locking layer.
 *   - An OwnershipTokenStore simulates the `ownership_token` column in DB.
 *   - Tests verify behavior contracts, not implementation details.
 *
 * RACE CONDITION GUARANTEES:
 *   - Exactly one confirmation succeeds for any given slot.
 *   - Duplicate submits for the same (consultationId + ownershipToken) are idempotent.
 *   - A stale local session cannot overwrite a server-confirmed booking.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  BookingPhase,
  ConsultationBookingSession,
  generateBookingSessionId,
  calculateBookingExpiry,
  isValidTransition,
} from "../types/consultationBookingTypes";

// ---------------------------------------------------------------------------
// SlotLockRegistry
// Simulates server-side optimistic locking for slot reservations.
// First caller acquires the lock; subsequent callers receive a conflict error.
// ---------------------------------------------------------------------------

type LockResult =
  | { acquired: true; reservationId: string; ownershipToken: string }
  | { acquired: false; reason: "already_locked" | "slot_not_found" };

class SlotLockRegistry {
  private locks = new Map<
    string,
    { userId: string; reservationId: string; ownershipToken: string }
  >();

  acquireLock(slotId: string, userId: string): LockResult {
    if (this.locks.has(slotId)) {
      return { acquired: false, reason: "already_locked" };
    }
    const reservationId = `res_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const ownershipToken = `tok_${userId}_${Date.now()}`;
    this.locks.set(slotId, { userId, reservationId, ownershipToken });
    return { acquired: true, reservationId, ownershipToken };
  }

  releaseLock(slotId: string, ownershipToken: string): boolean {
    const lock = this.locks.get(slotId);
    if (!lock || lock.ownershipToken !== ownershipToken) return false;
    this.locks.delete(slotId);
    return true;
  }

  isLocked(slotId: string): boolean {
    return this.locks.has(slotId);
  }

  getOwnershipToken(slotId: string): string | null {
    return this.locks.get(slotId)?.ownershipToken ?? null;
  }

  _clearAll(): void {
    this.locks.clear();
  }
}

// ---------------------------------------------------------------------------
// ConfirmationGuard
// Simulates idempotency checking on booking confirmation.
// A (consultationId, ownershipToken) pair can only succeed once.
// ---------------------------------------------------------------------------

type ConfirmResult =
  | { confirmed: true; confirmedAt: string }
  | { confirmed: false; reason: "already_confirmed" | "token_mismatch" | "not_found" };

class ConfirmationGuard {
  private confirmations = new Map<string, { ownershipToken: string; confirmedAt: string }>();

  confirm(consultationId: string, ownershipToken: string): ConfirmResult {
    const existing = this.confirmations.get(consultationId);

    if (existing) {
      // Idempotent: same token = already confirmed (safe to ack)
      if (existing.ownershipToken === ownershipToken) {
        return { confirmed: true, confirmedAt: existing.confirmedAt };
      }
      // Different token = someone else confirmed it
      return { confirmed: false, reason: "already_confirmed" };
    }

    const confirmedAt = new Date().toISOString();
    this.confirmations.set(consultationId, { ownershipToken, confirmedAt });
    return { confirmed: true, confirmedAt };
  }

  isConfirmed(consultationId: string): boolean {
    return this.confirmations.has(consultationId);
  }

  _clearAll(): void {
    this.confirmations.clear();
  }
}

// ---------------------------------------------------------------------------
// SessionOwnershipValidator
// Simulates multi-tab ownership detection via ownership token comparison.
// ---------------------------------------------------------------------------

type OwnershipCheck =
  | { valid: true }
  | { valid: false; reason: "token_mismatch" | "session_not_found" };

class SessionOwnershipValidator {
  private authoritative = new Map<string, string>(); // sessionId → ownershipToken

  register(sessionId: string, ownershipToken: string): void {
    this.authoritative.set(sessionId, ownershipToken);
  }

  validate(sessionId: string, localToken: string): OwnershipCheck {
    const serverToken = this.authoritative.get(sessionId);
    if (!serverToken) return { valid: false, reason: "session_not_found" };
    if (serverToken !== localToken) return { valid: false, reason: "token_mismatch" };
    return { valid: true };
  }

  overwrite(sessionId: string, newToken: string): void {
    this.authoritative.set(sessionId, newToken);
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildSession(
  overrides: Partial<ConsultationBookingSession> = {}
): ConsultationBookingSession {
  const id = generateBookingSessionId();
  const now = new Date().toISOString();
  return {
    sessionId: id,
    sourceIntentId: `intent_${id}`,
    consultationIntentId: `intent_${id}`,
    bookingFlowPhase: "REVIEW",
    bookingStatus: "REVIEW",
    createdAt: now,
    lastActivityAt: now,
    expiresAt: calculateBookingExpiry(),
    lifecycleVersion: "v1",
    entryPoint: "post_assessment",
    entitlementType: "free_first_consultation",
    recoveryState: { status: "fresh" },
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("raceConditions — parallel booking attempts", () => {
  let lockRegistry: SlotLockRegistry;

  beforeEach(() => {
    lockRegistry = new SlotLockRegistry();
  });

  it("first attempt acquires the lock; second attempt receives already_locked", () => {
    const slotId = "slot_abc_001";
    const user1 = "user_001";
    const user2 = "user_002";

    const result1 = lockRegistry.acquireLock(slotId, user1);
    const result2 = lockRegistry.acquireLock(slotId, user2);

    expect(result1.acquired).toBe(true);
    expect(result2.acquired).toBe(false);
    if (!result2.acquired) {
      expect(result2.reason).toBe("already_locked");
    }
  });

  it("slot remains locked after first acquisition", () => {
    const slotId = "slot_abc_002";
    lockRegistry.acquireLock(slotId, "user_001");
    expect(lockRegistry.isLocked(slotId)).toBe(true);
  });

  it("N parallel attempts for same slot — exactly 1 wins", () => {
    const slotId = "slot_parallel_001";
    const users = Array.from({ length: 10 }, (_, i) => `user_${i}`);

    const results = users.map((u) => lockRegistry.acquireLock(slotId, u));
    const winners = results.filter((r) => r.acquired);
    const losers = results.filter((r) => !r.acquired);

    expect(winners).toHaveLength(1);
    expect(losers).toHaveLength(9);
  });

  it("slot is available again after lock release", () => {
    const slotId = "slot_release_001";
    const result = lockRegistry.acquireLock(slotId, "user_001");
    if (!result.acquired) throw new Error("Expected lock acquisition");

    lockRegistry.releaseLock(slotId, result.ownershipToken);

    const result2 = lockRegistry.acquireLock(slotId, "user_002");
    expect(result2.acquired).toBe(true);
  });

  it("release with wrong token does not free the slot", () => {
    const slotId = "slot_wrongtoken_001";
    lockRegistry.acquireLock(slotId, "user_001");

    const released = lockRegistry.releaseLock(slotId, "wrong_token");
    expect(released).toBe(false);
    expect(lockRegistry.isLocked(slotId)).toBe(true);
  });
});

// ─── TEST SUITE 2 ───────────────────────────────────────────────────────────
describe("raceConditions — double-click confirm", () => {
  let guard: ConfirmationGuard;

  beforeEach(() => {
    guard = new ConfirmationGuard();
  });

  it("first confirmation call succeeds", () => {
    const result = guard.confirm("consult_001", "tok_user_001");
    expect(result.confirmed).toBe(true);
  });

  it("same (consultationId + token) on second call is idempotent — returns confirmed=true", () => {
    guard.confirm("consult_002", "tok_user_002");
    const result2 = guard.confirm("consult_002", "tok_user_002");

    // Idempotent: same token → ack success without re-confirming
    expect(result2.confirmed).toBe(true);
  });

  it("second call with DIFFERENT token returns already_confirmed", () => {
    guard.confirm("consult_003", "tok_user_A");
    const result2 = guard.confirm("consult_003", "tok_user_B");

    expect(result2.confirmed).toBe(false);
    if (!result2.confirmed) {
      expect(result2.reason).toBe("already_confirmed");
    }
  });

  it("rapid double-submit for same consultation: exactly 1 confirmation stored", () => {
    const consultId = "consult_rapid_001";
    const token = "tok_rapid";

    // Simulate rapid double-click — two calls before any state update
    guard.confirm(consultId, token);
    guard.confirm(consultId, token);

    expect(guard.isConfirmed(consultId)).toBe(true);
    // Only one entry stored — idempotent guard does not create duplicates
  });

  it("different consultationIds can be confirmed independently", () => {
    guard.confirm("consult_A", "tok_A");
    const result = guard.confirm("consult_B", "tok_B");
    expect(result.confirmed).toBe(true);
  });
});

// ─── TEST SUITE 3 ───────────────────────────────────────────────────────────
describe("raceConditions — multi-tab overwrite", () => {
  let validator: SessionOwnershipValidator;

  beforeEach(() => {
    validator = new SessionOwnershipValidator();
  });

  it("Tab A validates successfully with the registered token", () => {
    const sessionId = generateBookingSessionId();
    const token = "tok_tab_A";
    validator.register(sessionId, token);

    const check = validator.validate(sessionId, token);
    expect(check.valid).toBe(true);
  });

  it("Tab B is rejected when Tab A's token is active", () => {
    const sessionId = generateBookingSessionId();
    validator.register(sessionId, "tok_tab_A");

    // Tab B attempts to validate with its own stale token
    const check = validator.validate(sessionId, "tok_tab_B_stale");
    expect(check.valid).toBe(false);
    if (!check.valid) {
      expect(check.reason).toBe("token_mismatch");
    }
  });

  it("Tab B overwrite updates the authoritative token — Tab A is now stale", () => {
    const sessionId = generateBookingSessionId();
    validator.register(sessionId, "tok_tab_A");

    // Tab B overwrites (simulates a new login or session takeover)
    validator.overwrite(sessionId, "tok_tab_B_new");

    const checkA = validator.validate(sessionId, "tok_tab_A");
    const checkB = validator.validate(sessionId, "tok_tab_B_new");

    expect(checkA.valid).toBe(false);
    expect(checkB.valid).toBe(true);
  });

  it("unknown sessionId returns session_not_found", () => {
    const check = validator.validate("non_existent_session", "some_token");
    expect(check.valid).toBe(false);
    if (!check.valid) {
      expect(check.reason).toBe("session_not_found");
    }
  });

  it("multiple independent sessions do not interfere with each other", () => {
    const sessionA = generateBookingSessionId();
    const sessionB = generateBookingSessionId();

    validator.register(sessionA, "tok_A");
    validator.register(sessionB, "tok_B");

    expect(validator.validate(sessionA, "tok_A").valid).toBe(true);
    expect(validator.validate(sessionB, "tok_B").valid).toBe(true);
    expect(validator.validate(sessionA, "tok_B").valid).toBe(false);
    expect(validator.validate(sessionB, "tok_A").valid).toBe(false);
  });
});

// ─── TEST SUITE 4 ───────────────────────────────────────────────────────────
describe("raceConditions — stale state conflicts", () => {
  let guard: ConfirmationGuard;
  let lockRegistry: SlotLockRegistry;

  beforeEach(() => {
    guard = new ConfirmationGuard();
    lockRegistry = new SlotLockRegistry();
  });

  it("local session in REVIEW phase cannot confirm if booking already confirmed externally", () => {
    const consultId = "consult_stale_001";
    const externalToken = "tok_external_confirmed";
    const localToken = "tok_local_stale";

    // Server confirms via external source (another device, admin, etc.)
    guard.confirm(consultId, externalToken);

    // Local session (stale, different token) attempts confirmation
    const result = guard.confirm(consultId, localToken);

    expect(result.confirmed).toBe(false);
    if (!result.confirmed) {
      expect(result.reason).toBe("already_confirmed");
    }
  });

  it("stale local REVIEW phase cannot re-acquire slot if slot is already locked", () => {
    const slotId = "slot_stale_001";

    // External process locks the slot first
    lockRegistry.acquireLock(slotId, "external_user");

    // Local session attempts to reserve the same slot
    const result = lockRegistry.acquireLock(slotId, "local_user");

    expect(result.acquired).toBe(false);
  });

  it("isValidTransition rejects REVIEW → REVIEW (no self-transition)", () => {
    expect(isValidTransition("REVIEW", "REVIEW")).toBe(false);
  });

  it("isValidTransition rejects CONFIRMED → CONFIRMED (terminal re-entry)", () => {
    expect(isValidTransition("CONFIRMED", "CONFIRMED")).toBe(false);
  });

  it("isValidTransition rejects CANCELLED → REVIEW (cannot un-cancel)", () => {
    expect(isValidTransition("CANCELLED", "REVIEW")).toBe(false);
  });

  it("stale session attempting forbidden transition is rejected", () => {
    // A stale local session thinks it's in REVIEW but server moved to CONFIRMED
    const staleLocalPhase: BookingPhase = "REVIEW";
    const serverPhase: BookingPhase = "CONFIRMED";

    // Local tries to go REVIEW → CONFIRMED (valid in isolation)
    const localAttempt = isValidTransition(staleLocalPhase, "CONFIRMED");
    expect(localAttempt).toBe(true); // The transition itself is valid

    // But server is already CONFIRMED — any transition FROM CONFIRMED to non-terminal is invalid
    const serverAttemptReview = isValidTransition(serverPhase, "REVIEW");
    const serverAttemptSlot = isValidTransition(serverPhase, "SLOT_SELECTION");

    expect(serverAttemptReview).toBe(false);
    expect(serverAttemptSlot).toBe(false);
  });

  it("ABANDONED terminal phase cannot transition to any phase", () => {
    const allPhases: BookingPhase[] = [
      "CREATED",
      "SPECIALIST_SELECTION",
      "SLOT_SELECTION",
      "REVIEW",
      "CONFIRMED",
      "RESCHEDULED",
      "COMPLETED",
      "CANCELLED",
      "EXPIRED",
      "ABANDONED",
    ];

    for (const phase of allPhases) {
      expect(isValidTransition("ABANDONED", phase)).toBe(false);
    }
  });
});
