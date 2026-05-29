/**
 * lifecycleVersionValidator.ts — Sprint 3.4.3
 *
 * PURPOSE:
 *   Prevents stale tab / overwritten state / old session mutation
 *   by comparing session.lifecycleVersion before any mutation.
 *
 * PROBLEM BEING SOLVED:
 *   Tab A opens booking → goes to REVIEW (lifecycleVersion: "v1")
 *   Tab B simultaneously changes the same session → increments version
 *   Tab A tries to confirm with stale v1 → MUST be rejected
 *
 * CONTRACT:
 *   Every mutation that changes booking state MUST call
 *   validateLifecycleVersion() before proceeding.
 *   If it returns { valid: false }, the mutation is aborted.
 *
 * DESIGN:
 *   - Versions are compared as strings ("v1", "v2", ...) — simple and
 *     decoupled from session schema. Numeric comparison added as utility.
 *   - authoritative version comes from storage (the last persisted write).
 *   - localVersion is what the component currently holds in memory.
 *   - If they differ, local is stale → reject mutation → trigger recovery.
 *
 * SCOPE:
 *   ✅ Pre-mutation version check in orchestrators and context
 *   ✅ Works with any string-versioned session
 *   ❌ Does NOT auto-increment versions (owner: ConsultationBookingContext)
 *   ❌ Does NOT implement distributed locking
 */

export type LifecycleVersion = string; // "v1", "v2", etc.

export type VersionValidationResult =
  | { valid: true }
  | { valid: false; reason: "version_mismatch" | "missing_version" | "authoritative_unavailable" };

/**
 * validateLifecycleVersion
 *
 * Compares the local session version against the authoritative (server/storage) version.
 *
 * @param localVersion    — version held by the current tab/component
 * @param authoritativeVersion — version from storage or server response;
 *                              pass null if it couldn't be fetched.
 * @returns VersionValidationResult
 *
 * @example
 * const result = validateLifecycleVersion(
 *   session.lifecycleVersion,
 *   storedSession?.lifecycleVersion ?? null,
 * );
 * if (!result.valid) {
 *   // abort mutation, trigger recovery
 *   return;
 * }
 */
export function validateLifecycleVersion(
  localVersion: LifecycleVersion | undefined | null,
  authoritativeVersion: LifecycleVersion | null,
): VersionValidationResult {
  // If local version is missing, this session was created without versioning
  if (!localVersion) {
    return { valid: false, reason: "missing_version" };
  }

  // If we couldn't retrieve the authoritative version (e.g., offline),
  // we allow the mutation to proceed with a warning (fail-open for reads).
  // For confirm mutations, callers MUST treat this as a soft-reject.
  if (authoritativeVersion === null) {
    return { valid: false, reason: "authoritative_unavailable" };
  }

  if (localVersion !== authoritativeVersion) {
    return { valid: false, reason: "version_mismatch" };
  }

  return { valid: true };
}

/**
 * extractVersionNumber
 *
 * Parses the numeric suffix from a version string.
 * "v1" → 1, "v12" → 12, "abc" → NaN
 */
export function extractVersionNumber(version: LifecycleVersion): number {
  const match = version.match(/^v(\d+)$/);
  return match ? parseInt(match[1], 10) : NaN;
}

/**
 * isNewerVersion
 *
 * Returns true if `candidate` is strictly newer than `baseline`.
 * Useful for deciding whether to accept an incoming storage update.
 *
 * @example
 * if (isNewerVersion(incomingVersion, session.lifecycleVersion)) {
 *   // accept incoming update from storage event
 * }
 */
export function isNewerVersion(
  candidate: LifecycleVersion,
  baseline: LifecycleVersion,
): boolean {
  const cNum = extractVersionNumber(candidate);
  const bNum = extractVersionNumber(baseline);
  if (isNaN(cNum) || isNaN(bNum)) return false;
  return cNum > bNum;
}

/**
 * incrementVersion
 *
 * Produces the next version string.
 * "v1" → "v2", "v9" → "v10"
 * Non-conforming versions reset to "v1".
 */
export function incrementVersion(current: LifecycleVersion): LifecycleVersion {
  const num = extractVersionNumber(current);
  if (isNaN(num)) return "v1";
  return `v${num + 1}`;
}

/**
 * LifecycleVersionGuard
 *
 * Stateful wrapper used inside orchestrators.
 * Holds the local version and provides a typed check before mutations.
 *
 * @example
 * const guard = new LifecycleVersionGuard(session.lifecycleVersion);
 *
 * // Before mutation:
 * const check = guard.checkAgainst(storedVersion);
 * if (!check.valid) throw new StaleSessionError(check.reason);
 */
export class LifecycleVersionGuard {
  constructor(private readonly localVersion: LifecycleVersion) {}

  checkAgainst(authoritativeVersion: LifecycleVersion | null): VersionValidationResult {
    return validateLifecycleVersion(this.localVersion, authoritativeVersion);
  }

  get version(): LifecycleVersion {
    return this.localVersion;
  }
}
