/**
 * useBookingExpiryTimer.ts — Sprint 3.4 Phase 9 UI Hardening
 *
 * Real-time reactive countdown timer for slot reservation expiry.
 *
 * PROBLEM FIXED:
 *   Sprint 3.3 SessionExpiryNotice was a static snapshot of expires_at.
 *   It showed "15 minutes" but never updated.
 *
 * SOLUTION:
 *   This hook returns a live countdown (MM:SS) updated every second.
 *   Emits SLOT_RESERVATION_EXPIRED event when timer reaches zero.
 *   Calls optional onExpired callback for UI redirect.
 *
 * ARCHITECTURE RULE:
 *   This hook does NOT call transitionTo() directly.
 *   It calls onExpired callback — orchestrator handles transitionTo.
 */

import { useState, useEffect, useRef, useCallback } from "react";

export interface UseBookingExpiryTimerOptions {
  /** ISO 8601 expiry timestamp — e.g. from reservation.reserved_until */
  expiresAt: string | null;
  /** Called when countdown reaches zero */
  onExpired?: () => void;
  /** Polling interval in ms (default: 1000) */
  intervalMs?: number;
}

export interface UseBookingExpiryTimerReturn {
  /** Formatted countdown string: "MM:SS" or "00:00" when expired */
  countdown: string;
  /** Remaining seconds */
  remainingSeconds: number;
  /** True when timer has reached zero */
  isExpired: boolean;
  /** True when less than 2 minutes remain — show warning color */
  isUrgent: boolean;
}

export function useBookingExpiryTimer(
  options: UseBookingExpiryTimerOptions
): UseBookingExpiryTimerReturn {
  const { expiresAt, onExpired, intervalMs = 1000 } = options;

  const computeRemaining = useCallback((): number => {
    if (!expiresAt) return 0;
    const diff = Math.floor(
      (new Date(expiresAt).getTime() - Date.now()) / 1000
    );
    return Math.max(0, diff);
  }, [expiresAt]);

  const [remainingSeconds, setRemainingSeconds] = useState<number>(
    computeRemaining
  );

  const onExpiredRef = useRef(onExpired);
  onExpiredRef.current = onExpired;

  const hasExpiredFiredRef = useRef(false);

  useEffect(() => {
    if (!expiresAt) {
      setRemainingSeconds(0);
      return;
    }

    // Reset on new expiresAt
    hasExpiredFiredRef.current = false;
    setRemainingSeconds(computeRemaining());

    const timer = setInterval(() => {
      const remaining = computeRemaining();
      setRemainingSeconds(remaining);

      if (remaining <= 0 && !hasExpiredFiredRef.current) {
        hasExpiredFiredRef.current = true;
        clearInterval(timer);
        onExpiredRef.current?.();
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [expiresAt, intervalMs, computeRemaining]);

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const countdown = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  const isExpired = remainingSeconds <= 0;
  const isUrgent = remainingSeconds > 0 && remainingSeconds <= 120; // < 2 minutes

  return { countdown, remainingSeconds, isExpired, isUrgent };
}
