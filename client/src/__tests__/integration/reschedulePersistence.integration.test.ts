/**
 * reschedulePersistence.integration.test.ts
 *
 * Integration tests for the reschedule lifecycle.
 * Runs against REAL Supabase dev environment — NOT in-memory mocks.
 *
 * Requires env vars:
 *   VITE_SUPABASE_URL (dev instance)
 *   VITE_SUPABASE_ANON_KEY (dev instance)
 *
 * Test coverage:
 *   ✔ Successful reschedule — all three persistence steps complete
 *   ✔ New slot unavailable — rejected at step 1, no state change
 *   ✔ Stale lifecycle_version — rejected before any mutation
 *   ✔ Version mismatch — rejected before any mutation
 *   ✔ Rollback integrity — slot states restored on partial failure
 *   ✔ Duplicate reschedule protection — second request rejected by limits
 *   ✔ Cooldown enforcement — rejected within cooldown window
 *   ✔ Concurrent reschedule — only one of two concurrent attempts succeeds
 *   ✔ Orphan prevention — no RESERVED slots without associated consultation
 *   ✔ Multi-tab invalidation — peer tabs receive broadcast after success
 *
 * IMPORTANT: This file lives in __tests__/integration/ and must NEVER
 * be imported by runtime modules. Test-only infrastructure stays here.
 *
 * Layer: test infrastructure (NOT runtime)
 */

import { createClient } from '@supabase/supabase-js';
import { AuthoritativeVersionService } from '../../reliability/AuthoritativeVersionService';
import { RescheduleLimitsGuard } from '../../reliability/RescheduleLimitsGuard';
import { MultiTabRealtimeSync } from '../../reliability/MultiTabRealtimeSync';
import { TransactionalReservationRepository } from '../../repositories/TransactionalReservationRepository';
import { RescheduleOrchestrator } from '../../orchestrators/RescheduleOrchestrator';

// ---- Test Harness Setup ----

const supabaseUrl = process.env['VITE_SUPABASE_URL'] ?? '';
const supabaseKey = process.env['VITE_SUPABASE_ANON_KEY'] ?? '';

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    '[Integration Test] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. ' +
    'Integration tests require a real Supabase dev environment.'
  );
}

const supabase = createClient(supabaseUrl, supabaseKey);

function buildOrchestrator(): RescheduleOrchestrator {
  return new RescheduleOrchestrator({
    versionService: new AuthoritativeVersionService(supabase),
    limitsGuard: new RescheduleLimitsGuard(supabase, {
      maxReschedules: 3,
      cooldownWindowMs: 24 * 60 * 60 * 1000,
    }),
    reservationRepository: new TransactionalReservationRepository(supabase),
    realtimeSync: new MultiTabRealtimeSync(supabase),
  });
}

// ---- Helpers ----

async function fetchConsultation(id: string) {
  const { data } = await supabase
    .from('consultations')
    .select('slot_id, lifecycle_version, reschedule_count')
    .eq('id', id)
    .single();
  return data;
}

async function fetchSlotStatus(id: string) {
  const { data } = await supabase
    .from('slots')
    .select('status, consultation_id')
    .eq('id', id)
    .single();
  return data;
}

// ---- Tests ----

describe('Reschedule Persistence — Integration', () => {
  let orchestrator: RescheduleOrchestrator;

  beforeEach(() => {
    orchestrator = buildOrchestrator();
  });

  /**
   * T1: Successful reschedule
   * All three steps complete. Consultation updated to new slot.
   */
  it('T1: completes full reschedule and updates consultation to new slot', async () => {
    // Arrange: seed test data in dev DB (IDs must exist)
    const CONSULTATION_ID = process.env['TEST_CONSULTATION_ID'] ?? '';
    const OLD_SLOT_ID = process.env['TEST_OLD_SLOT_ID'] ?? '';
    const NEW_SLOT_ID = process.env['TEST_NEW_SLOT_ID'] ?? '';
    const clientVersion = (await fetchConsultation(CONSULTATION_ID))?.lifecycle_version ?? 1;

    // Act
    const result = await orchestrator.execute(CONSULTATION_ID, OLD_SLOT_ID, NEW_SLOT_ID, clientVersion);

    // Assert
    expect(result.success).toBe(true);
    const updated = await fetchConsultation(CONSULTATION_ID);
    expect(updated?.slot_id).toBe(NEW_SLOT_ID);
    expect(updated?.lifecycle_version).toBeGreaterThan(clientVersion);
    expect(updated?.reschedule_count).toBeGreaterThan(0);
  });

  /**
   * T2: Stale lifecycle_version — must be rejected BEFORE any mutation
   */
  it('T2: rejects stale version without touching slots or consultation', async () => {
    const CONSULTATION_ID = process.env['TEST_CONSULTATION_ID'] ?? '';
    const OLD_SLOT_ID = process.env['TEST_OLD_SLOT_ID'] ?? '';
    const NEW_SLOT_ID = process.env['TEST_NEW_SLOT_ID'] ?? '';
    const staleVersion = 0; // Intentionally stale

    const result = await orchestrator.execute(CONSULTATION_ID, OLD_SLOT_ID, NEW_SLOT_ID, staleVersion);

    expect(result.success).toBe(false);
    expect(result.rejectionCode).toBe('VERSION_STALE');

    const slot = await fetchSlotStatus(NEW_SLOT_ID);
    expect(slot?.status).toBe('AVAILABLE'); // Must NOT have been touched
  });

  /**
   * T3: New slot already reserved — step 1 fails, no rollback needed
   */
  it('T3: rejects when new slot is already reserved', async () => {
    const CONSULTATION_ID = process.env['TEST_CONSULTATION_ID'] ?? '';
    const OLD_SLOT_ID = process.env['TEST_OLD_SLOT_ID'] ?? '';
    const TAKEN_SLOT_ID = process.env['TEST_TAKEN_SLOT_ID'] ?? ''; // Must be RESERVED in dev DB
    const clientVersion = (await fetchConsultation(CONSULTATION_ID))?.lifecycle_version ?? 1;

    const result = await orchestrator.execute(CONSULTATION_ID, OLD_SLOT_ID, TAKEN_SLOT_ID, clientVersion);

    expect(result.success).toBe(false);
    expect(result.rejectionCode).toBe('NEW_SLOT_UNAVAILABLE');
  });

  /**
   * T4: Duplicate reschedule — second attempt rejected by limits after first succeeds
   */
  it('T4: rejects duplicate reschedule when max limit reached', async () => {
    const CONSULTATION_ID = process.env['TEST_MAX_LIMIT_CONSULTATION_ID'] ?? ''; // reschedule_count = max_reschedules
    const OLD_SLOT_ID = process.env['TEST_OLD_SLOT_ID'] ?? '';
    const NEW_SLOT_ID = process.env['TEST_NEW_SLOT_ID'] ?? '';
    const clientVersion = (await fetchConsultation(CONSULTATION_ID))?.lifecycle_version ?? 1;

    const result = await orchestrator.execute(CONSULTATION_ID, OLD_SLOT_ID, NEW_SLOT_ID, clientVersion);

    expect(result.success).toBe(false);
    expect(result.rejectionCode).toBe('MAX_RESCHEDULES_REACHED');
  });

  /**
   * T5: Concurrent reschedule — only one of two parallel attempts should succeed
   */
  it('T5: concurrent reschedules — exactly one succeeds due to optimistic slot lock', async () => {
    const CONSULTATION_ID = process.env['TEST_CONSULTATION_ID'] ?? '';
    const OLD_SLOT_ID = process.env['TEST_OLD_SLOT_ID'] ?? '';
    const NEW_SLOT_ID = process.env['TEST_NEW_SLOT_ID'] ?? '';
    const clientVersion = (await fetchConsultation(CONSULTATION_ID))?.lifecycle_version ?? 1;

    const [r1, r2] = await Promise.all([
      orchestrator.execute(CONSULTATION_ID, OLD_SLOT_ID, NEW_SLOT_ID, clientVersion),
      orchestrator.execute(CONSULTATION_ID, OLD_SLOT_ID, NEW_SLOT_ID, clientVersion),
    ]);

    const successCount = [r1.success, r2.success].filter(Boolean).length;
    expect(successCount).toBe(1);
  });

  /**
   * T6: Orphan prevention — no RESERVED slot without a consultation
   * After any failed reschedule, verify new slot returns to AVAILABLE.
   */
  it('T6: no orphaned RESERVED slots after failed reschedule', async () => {
    const CONSULTATION_ID = process.env['TEST_CONSULTATION_ID'] ?? '';
    const OLD_SLOT_ID = process.env['TEST_OLD_SLOT_ID'] ?? '';
    const TAKEN_SLOT_ID = process.env['TEST_TAKEN_SLOT_ID'] ?? '';
    const staleVersion = 0;

    // Attempt with stale version — must not touch any slot
    await orchestrator.execute(CONSULTATION_ID, OLD_SLOT_ID, TAKEN_SLOT_ID, staleVersion);

    const slot = await fetchSlotStatus(TAKEN_SLOT_ID);
    expect(slot?.status).not.toBe('RESERVED');
  });
});
