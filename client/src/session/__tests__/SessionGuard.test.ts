/**
 * Unit Tests: SessionGuard
 * Sprint 3.7.1 — Phase 1
 */

import { BookingSessionStateMachine } from '../BookingSessionStateMachine';
import { SessionGuard } from '../SessionGuard';

function makeActiveSession(): { machine: BookingSessionStateMachine; guard: SessionGuard } {
  const machine = new BookingSessionStateMachine();
  machine.transitionTo('INITIALIZING');
  machine.transitionTo('ACTIVE');
  return { machine, guard: new SessionGuard(machine) };
}

describe('SessionGuard', () => {
  it('allows mutation from ACTIVE with matching versions', () => {
    const { guard } = makeActiveSession();
    const result = guard.check('RESCHEDULE', 1, 1);
    expect(result.allowed).toBe(true);
    expect(result.blockedReason).toBeNull();
  });

  it('blocks mutation when clientVersion is behind serverVersion', () => {
    const { guard } = makeActiveSession();
    const result = guard.check('RESCHEDULE', 1, 2);
    expect(result.allowed).toBe(false);
    expect(result.blockedReason).toBe('STALE_CLIENT_VERSION');
  });

  it('blocks mutation in STALE state', () => {
    const { machine, guard } = makeActiveSession();
    machine.transitionTo('STALE', 'SERVER_VERSION_AHEAD');
    const result = guard.check('RESCHEDULE', 1, 2);
    expect(result.allowed).toBe(false);
    expect(result.blockedReason).toBe('SESSION_STALE');
  });

  it('blocks duplicate submission while RESCHEDULING', () => {
    const { machine, guard } = makeActiveSession();
    machine.transitionTo('RESCHEDULING');
    const result = guard.check('RESCHEDULE', 1, 1);
    expect(result.allowed).toBe(false);
    expect(result.blockedReason).toBe('MUTATION_IN_FLIGHT');
  });

  it('blocks mutation in COMPLETED state', () => {
    const machine = new BookingSessionStateMachine();
    machine.transitionTo('INITIALIZING');
    machine.transitionTo('ACTIVE');
    machine.transitionTo('CONFIRMING');
    machine.transitionTo('COMPLETED');
    const guard = new SessionGuard(machine);
    const result = guard.check('RESCHEDULE', 2, 2);
    expect(result.allowed).toBe(false);
    expect(result.blockedReason).toBe('SESSION_COMPLETED');
  });

  it('blocks mutation in EXPIRED state', () => {
    const machine = new BookingSessionStateMachine();
    machine.transitionTo('INITIALIZING');
    machine.transitionTo('EXPIRED');
    const guard = new SessionGuard(machine);
    const result = guard.check('CONFIRM', 1, 1);
    expect(result.allowed).toBe(false);
    expect(result.blockedReason).toBe('SESSION_EXPIRED');
  });

  it('blocks mutation from IDLE (not yet active)', () => {
    const machine = new BookingSessionStateMachine();
    const guard = new SessionGuard(machine);
    const result = guard.check('RESCHEDULE', 1, 1);
    expect(result.allowed).toBe(false);
    expect(result.blockedReason).toBe('SESSION_NOT_ACTIVE');
  });

  it('assertAllowed throws when blocked', () => {
    const machine = new BookingSessionStateMachine();
    const guard = new SessionGuard(machine);
    expect(() => guard.assertAllowed('RESCHEDULE', 1, 1)).toThrow(
      "Mutation 'RESCHEDULE' blocked: SESSION_NOT_ACTIVE"
    );
  });
});
