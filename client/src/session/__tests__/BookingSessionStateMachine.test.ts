/**
 * Unit Tests: BookingSessionStateMachine
 * Sprint 3.7.1 — Phase 1
 */

import { BookingSessionStateMachine } from '../BookingSessionStateMachine';

describe('BookingSessionStateMachine', () => {
  let machine: BookingSessionStateMachine;

  beforeEach(() => {
    machine = new BookingSessionStateMachine();
  });

  it('starts in IDLE state', () => {
    expect(machine.state).toBe('IDLE');
  });

  it('transitions IDLE → INITIALIZING', () => {
    machine.transitionTo('INITIALIZING');
    expect(machine.state).toBe('INITIALIZING');
  });

  it('transitions INITIALIZING → ACTIVE', () => {
    machine.transitionTo('INITIALIZING');
    machine.transitionTo('ACTIVE');
    expect(machine.state).toBe('ACTIVE');
  });

  it('transitions ACTIVE → STALE', () => {
    machine.transitionTo('INITIALIZING');
    machine.transitionTo('ACTIVE');
    machine.transitionTo('STALE', 'SERVER_VERSION_AHEAD');
    expect(machine.state).toBe('STALE');
  });

  it('transitions ACTIVE → RESCHEDULING', () => {
    machine.transitionTo('INITIALIZING');
    machine.transitionTo('ACTIVE');
    machine.transitionTo('RESCHEDULING');
    expect(machine.state).toBe('RESCHEDULING');
  });

  it('transitions RESCHEDULING → ACTIVE on success', () => {
    machine.transitionTo('INITIALIZING');
    machine.transitionTo('ACTIVE');
    machine.transitionTo('RESCHEDULING');
    machine.transitionTo('ACTIVE', 'RESCHEDULE_SUCCESS');
    expect(machine.state).toBe('ACTIVE');
  });

  it('transitions ACTIVE → CONFIRMING → COMPLETED', () => {
    machine.transitionTo('INITIALIZING');
    machine.transitionTo('ACTIVE');
    machine.transitionTo('CONFIRMING');
    machine.transitionTo('COMPLETED');
    expect(machine.state).toBe('COMPLETED');
  });

  it('throws on invalid transition', () => {
    expect(() => machine.transitionTo('ACTIVE')).toThrow(
      'Invalid transition: IDLE → ACTIVE'
    );
  });

  it('throws on transition from COMPLETED (terminal)', () => {
    machine.transitionTo('INITIALIZING');
    machine.transitionTo('ACTIVE');
    machine.transitionTo('CONFIRMING');
    machine.transitionTo('COMPLETED');
    expect(() => machine.transitionTo('ACTIVE')).toThrow('Invalid transition');
  });

  it('records full transition history', () => {
    machine.transitionTo('INITIALIZING');
    machine.transitionTo('ACTIVE');
    expect(machine.history).toHaveLength(2);
    expect(machine.history[0].from).toBe('IDLE');
    expect(machine.history[0].to).toBe('INITIALIZING');
  });

  it('notifies subscriber on each transition', () => {
    const events: string[] = [];
    machine.subscribe((e) => events.push(`${e.from}→${e.to}`));
    machine.transitionTo('INITIALIZING');
    machine.transitionTo('ACTIVE');
    expect(events).toEqual(['IDLE→INITIALIZING', 'INITIALIZING→ACTIVE']);
  });

  it('unsubscribes correctly', () => {
    const events: string[] = [];
    const unsub = machine.subscribe((e) => events.push(e.to));
    machine.transitionTo('INITIALIZING');
    unsub();
    machine.transitionTo('ACTIVE');
    expect(events).toEqual(['INITIALIZING']); // ACTIVE not recorded
  });

  it('reset() returns to IDLE from any state', () => {
    machine.transitionTo('INITIALIZING');
    machine.transitionTo('ACTIVE');
    machine.transitionTo('RESCHEDULING');
    machine.reset();
    expect(machine.state).toBe('IDLE');
  });
});
