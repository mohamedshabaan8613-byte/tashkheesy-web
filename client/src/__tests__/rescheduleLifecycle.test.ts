/**
 * Sprint 3.6 — Reschedule Lifecycle Tests
 * Zero-dependency tests using in-memory classes
 * Server Authoritative Version Check implementation
 */

import { describe, it, expect, beforeEach } from 'vitest';

// ========================================
// In-Memory Classes (Zero Dependencies)
// ========================================

class RescheduleVersionGuard {
  private serverVersion: number = 0;
  private clientVersions: Map<string, number> = new Map();

  setServerVersion(version: number): void {
    this.serverVersion = version;
  }

  registerClientVersion(sessionId: string, version: number): void {
    this.clientVersions.set(sessionId, version);
  }

  validateReschedule(sessionId: string, clientVersion: number): { valid: boolean; reason?: string } {
    if (clientVersion < this.serverVersion) {
      return { valid: false, reason: 'STALE_CLIENT_VERSION' };
    }
    if (clientVersion > this.serverVersion) {
      return { valid: false, reason: 'FUTURE_VERSION_REJECTED' };
    }
    return { valid: true };
  }

  getServerVersion(): number {
    return this.serverVersion;
  }
}

class RescheduleLock {
  private locks: Map<string, { sessionId: string; expiresAt: number }> = new Map();

  acquire(bookingId: string, sessionId: string, ttlMs: number = 30000): boolean {
    const now = Date.now();
    const existing = this.locks.get(bookingId);

    if (existing && existing.expiresAt > now) {
      return existing.sessionId === sessionId; // Already locked by same session
    }

    this.locks.set(bookingId, { sessionId, expiresAt: now + ttlMs });
    return true;
  }

  release(bookingId: string, sessionId: string): boolean {
    const existing = this.locks.get(bookingId);
    if (existing && existing.sessionId === sessionId) {
      this.locks.delete(bookingId);
      return true;
    }
    return false;
  }

  isLocked(bookingId: string): boolean {
    const now = Date.now();
    const existing = this.locks.get(bookingId);
    return existing ? existing.expiresAt > now : false;
  }
}

class RescheduleStateValidator {
  private validTransitions: Map<string, string[]> = new Map([
    ['CONFIRMED', ['RESCHEDULING', 'CANCELLED']],
    ['RESCHEDULING', ['CONFIRMED', 'CANCELLED']],
    ['CANCELLED', []],
  ]);

  canReschedule(currentState: string, targetState: string): { valid: boolean; reason?: string } {
    const allowedTransitions = this.validTransitions.get(currentState);

    if (!allowedTransitions) {
      return { valid: false, reason: 'INVALID_CURRENT_STATE' };
    }

    if (!allowedTransitions.includes(targetState)) {
      return { valid: false, reason: 'INVALID_TRANSITION' };
    }

    return { valid: true };
  }
}

// ========================================
// Test Suites
// ========================================

describe('Sprint 3.6 — Reschedule Lifecycle', () => {
  let versionGuard: RescheduleVersionGuard;
  let rescheduleLock: RescheduleLock;
  let stateValidator: RescheduleStateValidator;

  beforeEach(() => {
    versionGuard = new RescheduleVersionGuard();
    rescheduleLock = new RescheduleLock();
    stateValidator = new RescheduleStateValidator();
  });

  describe('🔒 Server Authoritative Version Check', () => {
    it('should reject stale client versions', () => {
      versionGuard.setServerVersion(5);
      const result = versionGuard.validateReschedule('session-1', 3);

      expect(result.valid).toBe(false);
      expect(result.reason).toBe('STALE_CLIENT_VERSION');
    });

    it('should reject future client versions', () => {
      versionGuard.setServerVersion(5);
      const result = versionGuard.validateReschedule('session-1', 7);

      expect(result.valid).toBe(false);
      expect(result.reason).toBe('FUTURE_VERSION_REJECTED');
    });

    it('should accept matching client versions', () => {
      versionGuard.setServerVersion(5);
      const result = versionGuard.validateReschedule('session-1', 5);

      expect(result.valid).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('should track server version updates', () => {
      versionGuard.setServerVersion(1);
      expect(versionGuard.getServerVersion()).toBe(1);

      versionGuard.setServerVersion(2);
      expect(versionGuard.getServerVersion()).toBe(2);
    });
  });

  describe('🔐 Reschedule Lock Management', () => {
    it('should acquire lock for new booking', () => {
      const acquired = rescheduleLock.acquire('booking-1', 'session-1');
      expect(acquired).toBe(true);
      expect(rescheduleLock.isLocked('booking-1')).toBe(true);
    });

    it('should prevent concurrent reschedule by different session', () => {
      rescheduleLock.acquire('booking-1', 'session-1');
      const secondAttempt = rescheduleLock.acquire('booking-1', 'session-2');

      expect(secondAttempt).toBe(false);
    });

    it('should allow same session to re-acquire lock', () => {
      rescheduleLock.acquire('booking-1', 'session-1');
      const reacquired = rescheduleLock.acquire('booking-1', 'session-1');

      expect(reacquired).toBe(true);
    });

    it('should release lock successfully', () => {
      rescheduleLock.acquire('booking-1', 'session-1');
      const released = rescheduleLock.release('booking-1', 'session-1');

      expect(released).toBe(true);
      expect(rescheduleLock.isLocked('booking-1')).toBe(false);
    });

    it('should expire lock after TTL', (done) => {
      rescheduleLock.acquire('booking-1', 'session-1', 50); // 50ms TTL
      expect(rescheduleLock.isLocked('booking-1')).toBe(true);

      setTimeout(() => {
        expect(rescheduleLock.isLocked('booking-1')).toBe(false);
        done();
      }, 60);
    });
  });

  describe('🔄 State Transition Validation', () => {
    it('should allow CONFIRMED → RESCHEDULING', () => {
      const result = stateValidator.canReschedule('CONFIRMED', 'RESCHEDULING');
      expect(result.valid).toBe(true);
    });

    it('should allow RESCHEDULING → CONFIRMED', () => {
      const result = stateValidator.canReschedule('RESCHEDULING', 'CONFIRMED');
      expect(result.valid).toBe(true);
    });

    it('should reject CANCELLED → RESCHEDULING', () => {
      const result = stateValidator.canReschedule('CANCELLED', 'RESCHEDULING');
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('INVALID_TRANSITION');
    });

    it('should reject invalid current state', () => {
      const result = stateValidator.canReschedule('INVALID_STATE', 'RESCHEDULING');
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('INVALID_CURRENT_STATE');
    });
  });

  describe('🔗 Integrated Reschedule Lifecycle', () => {
    it('should complete full reschedule lifecycle', () => {
      // Setup
      versionGuard.setServerVersion(1);

      // Step 1: Version check
      const versionCheck = versionGuard.validateReschedule('session-1', 1);
      expect(versionCheck.valid).toBe(true);

      // Step 2: Acquire lock
      const lockAcquired = rescheduleLock.acquire('booking-1', 'session-1');
      expect(lockAcquired).toBe(true);

      // Step 3: Validate state transition
      const stateCheck = stateValidator.canReschedule('CONFIRMED', 'RESCHEDULING');
      expect(stateCheck.valid).toBe(true);

      // Step 4: Complete reschedule
      const confirmCheck = stateValidator.canReschedule('RESCHEDULING', 'CONFIRMED');
      expect(confirmCheck.valid).toBe(true);

      // Step 5: Release lock
      const lockReleased = rescheduleLock.release('booking-1', 'session-1');
      expect(lockReleased).toBe(true);
    });

    it('should reject reschedule with stale version + locked', () => {
      versionGuard.setServerVersion(2);
      rescheduleLock.acquire('booking-1', 'session-1');

      // Stale version should fail before lock check
      const versionCheck = versionGuard.validateReschedule('session-2', 1);
      expect(versionCheck.valid).toBe(false);
      expect(versionCheck.reason).toBe('STALE_CLIENT_VERSION');
    });
  });
});
