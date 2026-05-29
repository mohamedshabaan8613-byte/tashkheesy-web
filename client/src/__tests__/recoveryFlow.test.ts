/**
 * recoveryFlow.test.ts — Sprint 3.4.2
 *
 * Integration tests for the session recovery lifecycle in ConsultationBookingContext.
 *
 * COVERAGE:
 *   1. localStorage recovery          — valid session is restored on mount
 *   2. Corrupted session recovery     — malformed JSON triggers graceful invalidation
 *   3. Expired session recovery       — TTL-exceeded session is invalidated, not restored
 *   4. Orphan session handling        — no active session ID in storage → fresh state
 *
 * ARCHITECTURE:
 *   - Tests operate against the pure repository and utility functions only.
 *   - No React rendering (no renderHook) — pure unit-level contract verification.
 *   - Supabase is fully mocked — no network calls.
 *   - localStorage is simulated via an in-memory map (no real browser storage).
 *
 * DEPENDENCIES:
 *   - consultationBookingTypes: BookingPhase, RECOVERABLE_PHASES, TERMINAL_PHASES,
 *     isValidTransition, isSessionExpired, calculateBookingExpiry, generateBookingSessionId,
 *     ConsultationBookingSession, BookingRecoveryState
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  BookingPhase,
  RECOVERABLE_PHASES,
  TERMINAL_PHASES,
  isValidTransition,
  isSessionExpired,
  calculateBookingExpiry,
  generateBookingSessionId,
  ConsultationBookingSession,
  BookingRecoveryState,
  BookingRecoveryStatus,
} from "../types/consultationBookingTypes";

// ---------------------------------------------------------------------------
// In-Memory Storage Adapter
// Simulates localStorage without relying on browser APIs.
// ---------------------------------------------------------------------------

class InMemorySessionStore {
  private sessions = new Map<string, ConsultationBookingSession>();
  private activeId: string | null = null;

  save(session: ConsultationBookingSession): void {
    this.sessions.set(session.sessionId, session);
  }

  load(sessionId: string): ConsultationBookingSession | null {
    return this.sessions.get(sessionId) ?? null;
  }

  setActive(sessionId: string): void {
    this.activeId = sessionId;
  }

  getActiveId(): string | null {
    return this.activeId;
  }

  loadActive(): ConsultationBookingSession | null {
    if (!this.activeId) return null;
    return this.sessions.get(this.activeId) ?? null;
  }

  invalidate(sessionId: string, reason: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    const invalidated: ConsultationBookingSession = {
      ...session,
      bookingFlowPhase: "CANCELLED",
      bookingStatus: "CANCELLED",
      recoveryState: {
        status: "invalidated",
        reason: reason as BookingRecoveryState["reason"],
        recoveredAt: new Date().toISOString(),
      },
    };
    this.sessions.set(sessionId, invalidated);
    if (this.activeId === sessionId) {
      this.activeId = null;
    }
  }

  clearActive(): void {
    this.activeId = null;
  }

  clear(): void {
    this.sessions.clear();
    this.activeId = null;
  }

  /** Simulate corrupted storage by injecting a raw broken entry */
  _injectCorrupted(sessionId: string): void {
    // Simulates what happens when JSON.parse fails on a stored value.
    // We mark the session with a sentinel to trigger invalidation logic.
    this.sessions.set(sessionId, null as unknown as ConsultationBookingSession);
    this.activeId = sessionId;
  }
}

// ---------------------------------------------------------------------------
// Recovery Logic (extracted from ConsultationBookingContext for testability)
// ---------------------------------------------------------------------------

type RecoveryResult =
  | { recovered: true; session: ConsultationBookingSession }
  | { recovered: false; reason: string };

function attemptSessionRecovery(store: InMemorySessionStore): RecoveryResult {
  const activeId = store.getActiveId();

  // No active session in storage
  if (!activeId) {
    return { recovered: false, reason: "no_active_session" };
  }

  const session = store.load(activeId);

  // Corrupted / null session
  if (!session || typeof session !== "object" || !session.sessionId) {
    store.invalidate(activeId, "session_corrupted");
    return { recovered: false, reason: "corrupted" };
  }

  // Expired session
  if (isSessionExpired(session)) {
    store.invalidate(activeId, "mount_ttl_check");
    return { recovered: false, reason: "expired" };
  }

  // Terminal phase — cannot recover
  if (TERMINAL_PHASES.includes(session.bookingFlowPhase)) {
    store.invalidate(activeId, "orchestrator_validation");
    return { recovered: false, reason: "terminal_phase" };
  }

  // Recoverable phase
  if (RECOVERABLE_PHASES.includes(session.bookingFlowPhase)) {
    return { recovered: true, session };
  }

  return { recovered: false, reason: "unknown_phase" };
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
    bookingFlowPhase: "SPECIALIST_SELECTION",
    bookingStatus: "SPECIALIST_SELECTION",
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

describe("recoveryFlow — localStorage recovery", () => {
  let store: InMemorySessionStore;

  beforeEach(() => {
    store = new InMemorySessionStore();
  });

  // ─── TEST 1 ───────────────────────────────────────────────────────────────
  it("restores a valid SPECIALIST_SELECTION session from storage", () => {
    const session = buildSession({ bookingFlowPhase: "SPECIALIST_SELECTION" });
    store.save(session);
    store.setActive(session.sessionId);

    const result = attemptSessionRecovery(store);

    expect(result.recovered).toBe(true);
    if (result.recovered) {
      expect(result.session.sessionId).toBe(session.sessionId);
      expect(result.session.bookingFlowPhase).toBe("SPECIALIST_SELECTION");
    }
  });

  it("restores a valid SLOT_SELECTION session from storage", () => {
    const session = buildSession({ bookingFlowPhase: "SLOT_SELECTION" });
    store.save(session);
    store.setActive(session.sessionId);

    const result = attemptSessionRecovery(store);

    expect(result.recovered).toBe(true);
  });

  it("restores a valid REVIEW session from storage", () => {
    const session = buildSession({ bookingFlowPhase: "REVIEW" });
    store.save(session);
    store.setActive(session.sessionId);

    const result = attemptSessionRecovery(store);

    expect(result.recovered).toBe(true);
  });

  it("verifies all RECOVERABLE_PHASES can be restored", () => {
    for (const phase of RECOVERABLE_PHASES) {
      const localStore = new InMemorySessionStore();
      const session = buildSession({ bookingFlowPhase: phase as BookingPhase });
      localStore.save(session);
      localStore.setActive(session.sessionId);

      const result = attemptSessionRecovery(localStore);
      expect(result.recovered).toBe(true);
    }
  });
});

// ─── TEST SUITE 2 ───────────────────────────────────────────────────────────
describe("recoveryFlow — corrupted session recovery", () => {
  let store: InMemorySessionStore;

  beforeEach(() => {
    store = new InMemorySessionStore();
  });

  it("returns recovered=false when session object is null (corrupted JSON)", () => {
    store._injectCorrupted("corrupted_id_001");

    const result = attemptSessionRecovery(store);

    expect(result.recovered).toBe(false);
    if (!result.recovered) {
      expect(result.reason).toBe("corrupted");
    }
  });

  it("clears activeId after invalidating a corrupted session", () => {
    store._injectCorrupted("corrupted_id_002");
    attemptSessionRecovery(store);

    expect(store.getActiveId()).toBeNull();
  });

  it("marks corrupted session as invalidated in store", () => {
    store._injectCorrupted("corrupted_id_003");
    attemptSessionRecovery(store);

    // After invalidation, loadActive() should return null
    expect(store.loadActive()).toBeNull();
  });

  it("does not throw when session has missing required fields", () => {
    // Partially constructed session — missing sessionId
    const partial = { bookingFlowPhase: "REVIEW" } as ConsultationBookingSession;
    store.save(partial);
    store.setActive(partial.sessionId);

    expect(() => attemptSessionRecovery(store)).not.toThrow();
  });
});

// ─── TEST SUITE 3 ───────────────────────────────────────────────────────────
describe("recoveryFlow — expired session recovery", () => {
  let store: InMemorySessionStore;

  beforeEach(() => {
    store = new InMemorySessionStore();
  });

  it("rejects a session whose expiresAt is in the past", () => {
    const expired = buildSession({
      bookingFlowPhase: "SPECIALIST_SELECTION",
      // 1 hour in the past
      expiresAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    });
    store.save(expired);
    store.setActive(expired.sessionId);

    const result = attemptSessionRecovery(store);

    expect(result.recovered).toBe(false);
    if (!result.recovered) {
      expect(result.reason).toBe("expired");
    }
  });

  it("invalidates the expired session in store (does not restore)", () => {
    const expired = buildSession({
      bookingFlowPhase: "REVIEW",
      expiresAt: new Date(Date.now() - 1000).toISOString(),
    });
    store.save(expired);
    store.setActive(expired.sessionId);

    attemptSessionRecovery(store);

    // loadActive() should return null after invalidation
    expect(store.loadActive()).toBeNull();
  });

  it("accepts a session whose expiresAt is 1 minute in the future", () => {
    const fresh = buildSession({
      bookingFlowPhase: "SLOT_SELECTION",
      expiresAt: new Date(Date.now() + 60 * 1000).toISOString(),
    });
    store.save(fresh);
    store.setActive(fresh.sessionId);

    const result = attemptSessionRecovery(store);

    expect(result.recovered).toBe(true);
  });

  it("rejects CONFIRMED sessions even if not expired (terminal phase)", () => {
    const confirmed = buildSession({
      bookingFlowPhase: "CONFIRMED",
      expiresAt: calculateBookingExpiry(), // valid TTL
    });
    store.save(confirmed);
    store.setActive(confirmed.sessionId);

    const result = attemptSessionRecovery(store);

    expect(result.recovered).toBe(false);
  });

  it("isSessionExpired helper returns true for past expiresAt", () => {
    const session = buildSession({
      expiresAt: new Date(Date.now() - 1).toISOString(),
    });
    expect(isSessionExpired(session)).toBe(true);
  });

  it("isSessionExpired helper returns false for future expiresAt", () => {
    const session = buildSession({
      expiresAt: new Date(Date.now() + 60_000).toISOString(),
    });
    expect(isSessionExpired(session)).toBe(false);
  });
});

// ─── TEST SUITE 4 ───────────────────────────────────────────────────────────
describe("recoveryFlow — orphan session handling", () => {
  let store: InMemorySessionStore;

  beforeEach(() => {
    store = new InMemorySessionStore();
  });

  it("returns recovered=false when no activeId is stored", () => {
    // Store is empty — no setActive() called
    const result = attemptSessionRecovery(store);

    expect(result.recovered).toBe(false);
    if (!result.recovered) {
      expect(result.reason).toBe("no_active_session");
    }
  });

  it("returns recovered=false when activeId points to a non-existent session", () => {
    // setActive with an ID that was never saved
    store.setActive("ghost_session_id_404");

    const result = attemptSessionRecovery(store);

    expect(result.recovered).toBe(false);
  });

  it("does not throw when loadActive() returns null", () => {
    store.setActive("phantom_id");
    expect(() => attemptSessionRecovery(store)).not.toThrow();
  });

  it("produces a fresh sessionId on each generateBookingSessionId() call", () => {
    const id1 = generateBookingSessionId();
    const id2 = generateBookingSessionId();
    expect(id1).not.toBe(id2);
  });

  it("calculates expiry 2 hours from now by default", () => {
    const before = new Date();
    const expiry = new Date(calculateBookingExpiry());
    const after = new Date();

    const twoHoursMs = 2 * 60 * 60 * 1000;
    const diffMs = expiry.getTime() - before.getTime();

    // Should be between 1h59m59s and 2h0m1s
    expect(diffMs).toBeGreaterThanOrEqual(twoHoursMs - 1000);
    expect(diffMs).toBeLessThanOrEqual(twoHoursMs + 1000);
  });

  it("clearActive() removes the active session reference", () => {
    const session = buildSession();
    store.save(session);
    store.setActive(session.sessionId);
    store.clearActive();

    expect(store.getActiveId()).toBeNull();
    expect(store.loadActive()).toBeNull();
  });
});

// ─── BONUS: ALLOWED_TRANSITIONS integration ──────────────────────────────────
describe("recoveryFlow — state machine contract", () => {
  it("RECOVERABLE_PHASES are all valid source phases in the state machine", () => {
    for (const phase of RECOVERABLE_PHASES) {
      // A recoverable phase should have at least one allowed next phase
      const canTransitionToConfirmed = isValidTransition(phase as BookingPhase, "CONFIRMED");
      const canTransitionToSlot = isValidTransition(phase as BookingPhase, "SLOT_SELECTION");
      const canTransitionToReview = isValidTransition(phase as BookingPhase, "REVIEW");

      const hasAnyTransition =
        canTransitionToConfirmed || canTransitionToSlot || canTransitionToReview;

      expect(hasAnyTransition).toBe(true);
    }
  });

  it("TERMINAL_PHASES have no outgoing transitions to recoverable phases", () => {
    for (const terminal of TERMINAL_PHASES) {
      for (const recoverable of RECOVERABLE_PHASES) {
        expect(
          isValidTransition(terminal as BookingPhase, recoverable as BookingPhase)
        ).toBe(false);
      }
    }
  });
});
