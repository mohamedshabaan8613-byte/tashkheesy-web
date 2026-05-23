/**
 * SessionGuard
 *
 * Sprint 3.7.1 — Phase 1: Session Runtime
 *
 * Enforces session state preconditions BEFORE any mutation reaches
 * an orchestrator or repository.
 *
 * Rules:
 *   - Mutations are only allowed from ACTIVE state.
 *   - STALE state blocks ALL mutations and demands forceRefresh.
 *   - RESCHEDULING / CONFIRMING block duplicate submissions.
 *   - clientVersion must match serverVersion (checked at guard boundary).
 *
 * This class has ZERO Supabase / network dependencies.
 * It is a pure domain guard.
 */

import { BookingSessionStateMachine, BookingSessionState } from './BookingSessionStateMachine';

export type MutationType = 'RESCHEDULE' | 'CONFIRM' | 'CANCEL';

export interface GuardResult {
  allowed:       boolean;
  blockedReason: SessionGuardBlockReason | null;
}

export type SessionGuardBlockReason =
  | 'SESSION_NOT_ACTIVE'
  | 'SESSION_STALE'
  | 'MUTATION_IN_FLIGHT'
  | 'SESSION_EXPIRED'
  | 'SESSION_COMPLETED'
  | 'SESSION_ERROR'
  | 'STALE_CLIENT_VERSION';

export class SessionGuard {
  constructor(
    private readonly machine: BookingSessionStateMachine
  ) {}

  /**
   * Main guard check.
   * Call this BEFORE dispatching any mutation to an orchestrator.
   *
   * @param clientVersion  The version the client believes is current.
   * @param serverVersion  The authoritative version from the last DB fetch.
   */
  check(
    mutation: MutationType,
    clientVersion: number,
    serverVersion: number
  ): GuardResult {
    const state: BookingSessionState = this.machine.state;

    // ── Terminal / blocked states ────────────────────────────────
    if (state === 'COMPLETED') {
      return { allowed: false, blockedReason: 'SESSION_COMPLETED' };
    }
    if (state === 'EXPIRED') {
      return { allowed: false, blockedReason: 'SESSION_EXPIRED' };
    }
    if (state === 'ERROR') {
      return { allowed: false, blockedReason: 'SESSION_ERROR' };
    }

    // ── Stale state ───────────────────────────────────────────────
    if (state === 'STALE') {
      return { allowed: false, blockedReason: 'SESSION_STALE' };
    }

    // ── Mutation already in flight ───────────────────────────────
    if (state === 'RESCHEDULING' || state === 'CONFIRMING') {
      return { allowed: false, blockedReason: 'MUTATION_IN_FLIGHT' };
    }

    // ── Must be ACTIVE to proceed ────────────────────────────────
    if (state !== 'ACTIVE') {
      return { allowed: false, blockedReason: 'SESSION_NOT_ACTIVE' };
    }

    // ── Optimistic version check ─────────────────────────────────
    // Note: the RPC performs the authoritative check server-side.
    // This is a fast-fail client-side pre-check only.
    if (clientVersion < serverVersion) {
      return { allowed: false, blockedReason: 'STALE_CLIENT_VERSION' };
    }

    return { allowed: true, blockedReason: null };
  }

  /**
   * Convenience: throws if mutation is blocked.
   * Use in orchestrators that prefer exception flow.
   */
  assertAllowed(
    mutation: MutationType,
    clientVersion: number,
    serverVersion: number
  ): void {
    const result = this.check(mutation, clientVersion, serverVersion);
    if (!result.allowed) {
      throw new Error(
        `[SessionGuard] Mutation '${mutation}' blocked: ${result.blockedReason}`
      );
    }
  }
}
