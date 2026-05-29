/**
 * staleSessionInvalidator.ts — Sprint 3.4.3
 *
 * PURPOSE:
 *   Immediately invalidates sessions that are:
 *     - expired (expiresAt in the past)
 *     - corrupted (missing required fields / malformed)
 *     - ownership-mismatched (ownershipToken doesn't match expected)
 *
 * MOTIVATION:
 *   Instead of leaving an invalid session in state (causing undefined behavior
 *   in the UI and orchestrators), we invalidate eagerly and transition the
 *   booking to a terminal/safe state immediately.
 *
 * CONTRACT:
 *   invalidateSession() returns a typed InvalidationResult.
 *   Callers (ConsultationBookingContext, BookingReviewPage) inspect the result
 *   and trigger appropriate navigation or state cleanup.
 *
 * DESIGN:
 *   - Pure function — no side effects beyond returning a result.
 *   - Does NOT call navigate() or cancelBooking() directly — those are
 *     injected by callers to preserve separation of concerns.
 *   - Supports three invalidation reasons as distinct union members.
 *
 * SCOPE:
 *   ✅ Expired, corrupted, ownership-mismatch invalidation
 *   ✅ Called on mount (recovery guard) and pre-mutation
 *   ❌ Does NOT write to Supabase (owner: orchestrators)
 *   ❌ Does NOT call transitionTo() directly
 */

import type { ConsultationBookingSession } from "../types/consultationBookingTypes";
import { isSessionExpired } from "../types/consultationBookingTypes";

// ─── Result types ───────────────────────────────────────────────────────────

export type InvalidationReason =
  | "session_expired"
  | "session_corrupted"
  | "ownership_mismatch"
  | "missing_required_fields";

export type InvalidationResult =
  | { invalidated: false }
  | { invalidated: true; reason: InvalidationReason; details?: string };

// ─── Required session fields (minimum for a valid session) ──────────────────

const REQUIRED_FIELDS: ReadonlyArray<keyof ConsultationBookingSession> = [
  "sessionId",
  "sourceIntentId",
  "bookingFlowPhase",
  "expiresAt",
  "lifecycleVersion",
  "entitlementType",
  "recoveryState",
];

// ─── Core function ───────────────────────────────────────────────────────────

/**
 * checkSessionValidity
 *
 * Pure validator — returns an InvalidationResult without any side effects.
 * Does NOT mutate state. Callers decide what to do with the result.
 *
 * @param session          — the session object to validate (may be null)
 * @param expectedOwnToken — the ownership token the current tab holds;
 *                           pass null to skip ownership check
 *
 * @example
 * const result = checkSessionValidity(session, currentTabToken);
 * if (result.invalidated) {
 *   invalidateSession(result.reason);  // context method
 *   navigate(CONSULTATION_ROUTES.START, { replace: true });
 * }
 */
export function checkSessionValidity(
  session: ConsultationBookingSession | null | undefined,
  expectedOwnToken: string | null = null,
): InvalidationResult {
  // ── 1. Null / undefined ────────────────────────────────────────────────────
  if (!session) {
    return { invalidated: true, reason: "session_corrupted", details: "session_is_null" };
  }

  // ── 2. Missing required fields ────────────────────────────────────────────
  for (const field of REQUIRED_FIELDS) {
    if (session[field] === undefined || session[field] === null) {
      return {
        invalidated: true,
        reason: "missing_required_fields",
        details: `field_missing:${field}`,
      };
    }
  }

  // ── 3. Corrupted sessionId ────────────────────────────────────────────────
  if (typeof session.sessionId !== "string" || session.sessionId.trim() === "") {
    return { invalidated: true, reason: "session_corrupted", details: "invalid_session_id" };
  }

  // ── 4. Expired ────────────────────────────────────────────────────────────
  if (isSessionExpired(session)) {
    return { invalidated: true, reason: "session_expired" };
  }

  // ── 5. Ownership mismatch ─────────────────────────────────────────────────
  if (expectedOwnToken !== null) {
    const sessionToken = ((session as unknown) as Record<string, unknown>).ownershipToken as string | undefined;
    if (sessionToken && sessionToken !== expectedOwnToken) {
      return {
        invalidated: true,
        reason: "ownership_mismatch",
        details: `expected:${expectedOwnToken} actual:${sessionToken}`,
      };
    }
  }

  return { invalidated: false };
}

/**
 * buildInvalidationSummary
 *
 * Human-readable summary of an invalidation result.
 * Used in error banners and dev-mode logs.
 */
export function buildInvalidationSummary(result: InvalidationResult): string {
  if (!result.invalidated) return "session_valid";
  const base = result.reason;
  const detail = result.details ? ` (${result.details})` : "";
  return `${base}${detail}`;
}

/**
 * isSessionCorrupted
 *
 * Convenience check — true if the session has structural corruption
 * (null, missing fields, invalid sessionId).
 * Does NOT check expiry or ownership.
 */
export function isSessionCorrupted(
  session: ConsultationBookingSession | null | undefined,
): boolean {
  if (!session) return true;
  for (const field of REQUIRED_FIELDS) {
    if (session[field] === undefined || session[field] === null) return true;
  }
  return typeof session.sessionId !== "string" || session.sessionId.trim() === "";
}
