/**
 * confirmActionLock.ts — Sprint 3.4.3
 *
 * PURPOSE:
 *   Prevents double-click / rapid-submit / duplicate confirm mutations
 *   at the BookingReviewPage entry point.
 *
 * USAGE:
 *   const lock = createConfirmActionLock();
 *
 *   // Before calling orchestrateBookingConfirmation:
 *   if (!lock.acquire()) return;   // already in-flight — bail out
 *
 *   try {
 *     await orchestrateBookingConfirmation(...);
 *   } finally {
 *     lock.release();
 *   }
 *
 * DESIGN:
 *   - Two complementary guards work together:
 *       isConfirmingRef  — tracks UI async in-flight state (renders spinner)
 *       confirmationLockRef — hard boolean lock, survives React re-renders
 *   - The lock is intentionally NOT a useState to avoid triggering renders
 *     during the acquire/release cycle.
 *   - acquire() is idempotent: calling it while locked returns false
 *     without throwing — callers just bail out.
 *   - reset() exists for error recovery paths (e.g., network failure).
 *
 * SCOPE:
 *   ✅ Prevents double-click / rapid-submit in UI
 *   ✅ Guards orchestrator entry-point
 *   ❌ Does NOT replace server-side idempotency checks
 *   ❌ Does NOT persist across page navigations (intentional — session-scoped)
 */

export interface ConfirmActionLock {
  /** Returns true if lock was acquired; false if already locked. */
  acquire(): boolean;
  /** Releases the lock. Safe to call even if not currently locked. */
  release(): void;
  /** Resets all lock state. Use after unrecoverable error. */
  reset(): void;
  /** Read-only: true if a confirmation is currently in-flight. */
  readonly isConfirming: boolean;
}

/**
 * createConfirmActionLock
 *
 * Returns a mutable lock object backed by plain booleans.
 * Designed to be stored in a useRef() at the component level.
 *
 * @example
 * // Inside BookingReviewPage:
 * const lockRef = useRef(createConfirmActionLock());
 *
 * const handleConfirm = useCallback(async () => {
 *   if (!lockRef.current.acquire()) return;
 *   setConfirmState({ status: "confirming" });
 *   try {
 *     const result = await orchestrateBookingConfirmation(...);
 *     ...
 *   } finally {
 *     lockRef.current.release();
 *   }
 * }, []);
 */
export function createConfirmActionLock(): ConfirmActionLock {
  // isConfirmingRef — mirrors UI state (used for aria-busy / spinner)
  let _isConfirming = false;
  // confirmationLockRef — hard guard, prevents concurrent acquisition
  let _locked = false;

  return {
    acquire(): boolean {
      if (_locked) return false;
      _locked = true;
      _isConfirming = true;
      return true;
    },

    release(): void {
      _locked = false;
      _isConfirming = false;
    },

    reset(): void {
      _locked = false;
      _isConfirming = false;
    },

    get isConfirming(): boolean {
      return _isConfirming;
    },
  };
}

/**
 * useConfirmActionLock
 *
 * React hook wrapping createConfirmActionLock() in a stable useRef.
 * Returns the same lock instance across renders.
 *
 * Usage (inside functional component):
 *   const lock = useConfirmActionLock();
 *   if (!lock.acquire()) return;
 *
 * NOTE: This is a ref-based hook — it does NOT trigger re-renders.
 *   Pair it with a separate useState<ConfirmState> for UI feedback.
 */
import { useRef } from "react";

export function useConfirmActionLock(): ConfirmActionLock {
  const lockRef = useRef<ConfirmActionLock | null>(null);
  if (!lockRef.current) {
    lockRef.current = createConfirmActionLock();
  }
  return lockRef.current;
}
