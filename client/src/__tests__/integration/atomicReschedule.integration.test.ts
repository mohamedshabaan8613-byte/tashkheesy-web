/**
 * Integration Test: Atomic Reschedule RPC
 *
 * Sprint: 3.7 — Transactional Integrity Finalization
 *
 * Tests REAL transactional behavior against the Supabase dev environment.
 * NOT in-memory simulation. All assertions probe actual DB state.
 *
 * Prerequisites:
 *   • SUPABASE_URL and SUPABASE_SERVICE_KEY set in environment.
 *   • Migration 012_atomic_reschedule_transaction.sql applied to dev DB.
 *   • Test fixtures (consultation + slots) created by beforeAll / cleaned by afterAll.
 *
 * Scenarios covered:
 *   1. Successful atomic reschedule — verify all 7 DB mutations committed.
 *   2. Rollback on slot unavailable — verify no partial state.
 *   3. No orphan reservations after failure.
 *   4. Stale version rejection.
 *   5. Concurrent mutation rejection (optimistic lock via lifecycle_version).
 *   6. Invalid ownership token rejection.
 *   7. Cancelled consultation rejection.
 *   8. Exceeded reschedule limits rejection.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { TransactionalReservationRepository } from '../../repositories/TransactionalReservationRepository';

// ----------------------------------------------------------------
// Test environment guard.
// ----------------------------------------------------------------
const SUPABASE_URL  = process.env.SUPABASE_URL;
const SUPABASE_KEY  = process.env.SUPABASE_SERVICE_KEY; // service role for test setup

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error(
    '[atomicReschedule.integration.test] SUPABASE_URL and SUPABASE_SERVICE_KEY must be set. '
    + 'These tests run against the REAL Supabase dev environment.'
  );
}

// ----------------------------------------------------------------
// Fixture helpers.
// ----------------------------------------------------------------
const OWNERSHIP_TOKEN = 'test-ownership-token-sprint37';
let supabase: SupabaseClient;
let repo: TransactionalReservationRepository;

// IDs populated by beforeAll.
let consultationId: string;
let oldSlotId: string;
let newSlotId: string;
let unavailableSlotId: string;

beforeAll(async () => {
  supabase = createClient(SUPABASE_URL!, SUPABASE_KEY!);
  repo     = new TransactionalReservationRepository(supabase);

  // Create test slots.
  const { data: slotsData } = await supabase
    .from('slots')
    .insert([
      { status: 'RESERVED',  consultation_id: null }, // will be assigned as old_slot
      { status: 'AVAILABLE', consultation_id: null }, // target new slot
      { status: 'RESERVED',  consultation_id: null }, // unavailable target for rejection test
    ])
    .select('id');

  oldSlotId         = slotsData![0].id;
  newSlotId         = slotsData![1].id;
  unavailableSlotId = slotsData![2].id;

  // Create test consultation.
  const { data: consultData } = await supabase
    .from('consultations')
    .insert({
      status:             'CONFIRMED',
      slot_id:            oldSlotId,
      lifecycle_version:  1,
      reschedule_count:   0,
      ownership_token:    OWNERSHIP_TOKEN,
      rescheduled_at:     null,
    })
    .select('id')
    .single();

  consultationId = consultData!.id;

  // Link old slot to consultation.
  await supabase
    .from('slots')
    .update({ consultation_id: consultationId, status: 'RESERVED' })
    .eq('id', oldSlotId);
});

afterAll(async () => {
  // Clean up test fixtures.
  if (consultationId) {
    await supabase.from('consultations').delete().eq('id', consultationId);
  }
  const slotIds = [oldSlotId, newSlotId, unavailableSlotId].filter(Boolean);
  if (slotIds.length) {
    await supabase.from('slots').delete().in('id', slotIds);
  }
});

// ----------------------------------------------------------------
// Helper: fetch current consultation state.
// ----------------------------------------------------------------
async function fetchConsultation() {
  const { data } = await supabase
    .from('consultations')
    .select('*')
    .eq('id', consultationId)
    .single();
  return data;
}

async function fetchSlot(id: string) {
  const { data } = await supabase.from('slots').select('*').eq('id', id).single();
  return data;
}

// ================================================================
// SCENARIO 1: Successful atomic reschedule.
// ================================================================
describe('Scenario 1: Successful atomic reschedule', () => {
  it('should commit all 7 mutations atomically', async () => {
    const result = await repo.executeReschedule(
      consultationId, oldSlotId, newSlotId, OWNERSHIP_TOKEN, 1
    );

    expect(result.success).toBe(true);
    expect(result.newServerVersion).toBe(2);
    expect(result.newRescheduleCount).toBe(1);
    expect(result.rescheduledAt).toBeTruthy();

    // Verify DB state: new slot reserved.
    const newSlot = await fetchSlot(newSlotId);
    expect(newSlot.status).toBe('RESERVED');
    expect(newSlot.consultation_id).toBe(consultationId);

    // Verify DB state: old slot released.
    const oldSlot = await fetchSlot(oldSlotId);
    expect(oldSlot.status).toBe('AVAILABLE');
    expect(oldSlot.consultation_id).toBeNull();

    // Verify DB state: consultation updated.
    const consultation = await fetchConsultation();
    expect(consultation.slot_id).toBe(newSlotId);
    expect(consultation.lifecycle_version).toBe(2);
    expect(consultation.reschedule_count).toBe(1);
    expect(consultation.rescheduled_at).toBeTruthy();

    // Swap for next scenarios.
    [oldSlotId, newSlotId] = [newSlotId, oldSlotId];
    // Re-make new slot available for further tests.
    await supabase.from('slots').update({ status: 'AVAILABLE', consultation_id: null }).eq('id', newSlotId);
  });
});

// ================================================================
// SCENARIO 2: Slot unavailable — rollback, no partial state.
// ================================================================
describe('Scenario 2: Slot unavailable — atomic rollback', () => {
  it('should reject and leave DB unchanged', async () => {
    const before = await fetchConsultation();

    const result = await repo.executeReschedule(
      consultationId, oldSlotId, unavailableSlotId, OWNERSHIP_TOKEN, before.lifecycle_version
    );

    expect(result.success).toBe(false);
    expect(result.failureReason).toBe('SLOT_UNAVAILABLE');

    // Verify: consultation unchanged.
    const after = await fetchConsultation();
    expect(after.lifecycle_version).toBe(before.lifecycle_version);
    expect(after.slot_id).toBe(before.slot_id);
    expect(after.reschedule_count).toBe(before.reschedule_count);

    // Verify: no orphan on old slot.
    const old = await fetchSlot(oldSlotId);
    expect(old.status).toBe('RESERVED');
    expect(old.consultation_id).toBe(consultationId);
  });
});

// ================================================================
// SCENARIO 3: Stale version rejection.
// ================================================================
describe('Scenario 3: Stale version rejection', () => {
  it('should reject mutation with STALE_VERSION and return server version', async () => {
    const current = await fetchConsultation();
    const staleVersion = current.lifecycle_version - 1;

    const result = await repo.executeReschedule(
      consultationId, oldSlotId, newSlotId, OWNERSHIP_TOKEN, staleVersion
    );

    expect(result.success).toBe(false);
    expect(result.failureReason).toBe('STALE_VERSION');
    expect(result.serverVersion).toBe(current.lifecycle_version);
  });
});

// ================================================================
// SCENARIO 4: Invalid ownership token.
// ================================================================
describe('Scenario 4: Invalid ownership token rejection', () => {
  it('should reject with INVALID_OWNERSHIP', async () => {
    const current = await fetchConsultation();

    const result = await repo.executeReschedule(
      consultationId, oldSlotId, newSlotId, 'wrong-token-xyz', current.lifecycle_version
    );

    expect(result.success).toBe(false);
    expect(result.failureReason).toBe('INVALID_OWNERSHIP');
  });
});

// ================================================================
// SCENARIO 5: Cancelled consultation rejection.
// ================================================================
describe('Scenario 5: Cancelled consultation rejection', () => {
  it('should reject reschedule on CANCELLED consultation', async () => {
    // Temporarily cancel the consultation.
    await supabase.from('consultations').update({ status: 'CANCELLED' }).eq('id', consultationId);
    const current = await fetchConsultation();

    const result = await repo.executeReschedule(
      consultationId, oldSlotId, newSlotId, OWNERSHIP_TOKEN, current.lifecycle_version
    );

    expect(result.success).toBe(false);
    expect(result.failureReason).toBe('CONSULTATION_NOT_RESCHEDULABLE');

    // Restore for further tests.
    await supabase.from('consultations').update({ status: 'CONFIRMED' }).eq('id', consultationId);
  });
});

// ================================================================
// SCENARIO 6: Max reschedule limit exceeded.
// ================================================================
describe('Scenario 6: Max reschedule limit exceeded', () => {
  it('should reject with MAX_RESCHEDULES_REACHED', async () => {
    // Drive reschedule_count to limit (3).
    await supabase.from('consultations').update({ reschedule_count: 3 }).eq('id', consultationId);
    const current = await fetchConsultation();

    const result = await repo.executeReschedule(
      consultationId, oldSlotId, newSlotId, OWNERSHIP_TOKEN, current.lifecycle_version
    );

    expect(result.success).toBe(false);
    expect(result.failureReason).toBe('MAX_RESCHEDULES_REACHED');

    // Restore.
    await supabase.from('consultations').update({ reschedule_count: 1 }).eq('id', consultationId);
  });
});

// ================================================================
// SCENARIO 7: No orphan reservations after cascading failure.
// ================================================================
describe('Scenario 7: No orphan reservations', () => {
  it('should leave no orphaned slots after any rejection', async () => {
    // Use unavailable slot to trigger rejection, then verify slot states.
    const current = await fetchConsultation();
    await repo.executeReschedule(
      consultationId, oldSlotId, unavailableSlotId, OWNERSHIP_TOKEN, current.lifecycle_version
    );

    // Old slot must still be owned by the consultation (not released).
    const old = await fetchSlot(oldSlotId);
    expect(old.consultation_id).toBe(consultationId);
    expect(old.status).toBe('RESERVED');

    // Unavailable slot must remain unavailable (not accidentally changed).
    const unavail = await fetchSlot(unavailableSlotId);
    expect(unavail.status).toBe('RESERVED');
    expect(unavail.consultation_id).not.toBe(consultationId);
  });
});

// ================================================================
// SCENARIO 8: Concurrent mutation rejection (optimistic lock simulation).
// ================================================================
describe('Scenario 8: Concurrent mutation rejection', () => {
  it('should reject the second concurrent reschedule attempt', async () => {
    const current    = await fetchConsultation();
    const extraSlot  = (await supabase
      .from('slots')
      .insert({ status: 'AVAILABLE', consultation_id: null })
      .select('id')
      .single()).data!;

    // Fire two concurrent reschedules with the same clientVersion.
    const [r1, r2] = await Promise.all([
      repo.executeReschedule(
        consultationId, oldSlotId, newSlotId, OWNERSHIP_TOKEN, current.lifecycle_version
      ),
      repo.executeReschedule(
        consultationId, oldSlotId, extraSlot.id, OWNERSHIP_TOKEN, current.lifecycle_version
      ),
    ]);

    // Exactly one must succeed; the other must be rejected.
    const successes = [r1, r2].filter(r => r.success).length;
    const failures  = [r1, r2].filter(r => !r.success).length;
    expect(successes).toBe(1);
    expect(failures).toBe(1);

    // The failure must be a recognisable rejection code.
    const failed = [r1, r2].find(r => !r.success)!;
    expect(['STALE_VERSION', 'SLOT_UNAVAILABLE']).toContain(failed.failureReason);

    // Cleanup extra slot.
    await supabase.from('slots').delete().eq('id', extraSlot.id);
  });
});
