/**
 * TransactionalReservationRepository
 *
 * Single responsibility: ALL slot and consultation persistence for the
 * reschedule lifecycle. This is the ONLY layer allowed to write to
 * slots and consultations tables in the reschedule path.
 *
 * Transactional classification: COMPENSATED TRANSACTION (not true DB txn).
 * — Steps are sequential with explicit rollback compensation.
 * — A true atomic transaction requires a single Supabase RPC (Sprint 3.7 target).
 * — Current risk window: crash between step 2 and step 3 leaves orphaned state.
 * — This is explicitly documented and acceptable for Sprint 3.6.
 *
 * Sprint 3.7 migration target:
 *   Replace executeReschedule() body with a single RPC call:
 *   supabase.rpc('atomic_reschedule', { consultation_id, old_slot_id, new_slot_id })
 *   that wraps all three steps in BEGIN...COMMIT server-side.
 *
 * Layer: repositories
 * Depends on: Supabase client only.
 * Must NOT import: orchestrators, reliability services, React, UI.
 */

import { SupabaseClient } from '@supabase/supabase-js';

export interface RescheduleExecutionResult {
  success: boolean;
  newSlotReserved: boolean;
  oldSlotReleased: boolean;
  consultationUpdated: boolean;
  rollbackExecuted: boolean;
  failureReason?: 'NEW_SLOT_UNAVAILABLE' | 'OLD_SLOT_RELEASE_FAILED' | 'CONSULTATION_UPDATE_FAILED' | 'EXCEPTION';
}

export class TransactionalReservationRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Execute the three-step reschedule persistence sequence:
   * 1. Reserve new slot (optimistic lock: only if AVAILABLE)
   * 2. Release old slot
   * 3. Update consultation record
   *
   * On any failure, compensation rollback is attempted.
   * Classification: COMPENSATED TRANSACTION — not a true DB transaction.
   * True atomicity is Sprint 3.7 scope (single server-side RPC).
   */
  async executeReschedule(
    consultationId: string,
    oldSlotId: string,
    newSlotId: string
  ): Promise<RescheduleExecutionResult> {
    let newSlotReserved = false;
    let oldSlotReleased = false;
    let consultationUpdated = false;

    try {
      // Step 1: Reserve new slot (optimistic locking — eq status='AVAILABLE')
      const { error: reserveError } = await this.supabase
        .from('slots')
        .update({ status: 'RESERVED', consultation_id: consultationId })
        .eq('id', newSlotId)
        .eq('status', 'AVAILABLE');

      if (reserveError) {
        return this.buildResult(false, newSlotReserved, oldSlotReleased, consultationUpdated, false, 'NEW_SLOT_UNAVAILABLE');
      }
      newSlotReserved = true;

      // Step 2: Release old slot
      const { error: releaseError } = await this.supabase
        .from('slots')
        .update({ status: 'AVAILABLE', consultation_id: null })
        .eq('id', oldSlotId);

      if (releaseError) {
        await this.compensateReservedSlot(newSlotId);
        return this.buildResult(false, newSlotReserved, oldSlotReleased, consultationUpdated, true, 'OLD_SLOT_RELEASE_FAILED');
      }
      oldSlotReleased = true;

      // Step 3: Update consultation record
      const { error: updateError } = await this.supabase
        .from('consultations')
        .update({
          slot_id: newSlotId,
          rescheduled_at: new Date().toISOString(),
        })
        .eq('id', consultationId);

      if (updateError) {
        await this.compensateFullReschedule(newSlotId, oldSlotId, consultationId);
        return this.buildResult(false, newSlotReserved, oldSlotReleased, consultationUpdated, true, 'CONSULTATION_UPDATE_FAILED');
      }
      consultationUpdated = true;

      return this.buildResult(true, newSlotReserved, oldSlotReleased, consultationUpdated, false);
    } catch (err) {
      console.error('[TransactionalReservationRepository] Unexpected exception:', err);
      if (newSlotReserved) {
        await this.compensateFullReschedule(newSlotId, oldSlotId, consultationId);
      }
      return this.buildResult(false, newSlotReserved, oldSlotReleased, consultationUpdated, true, 'EXCEPTION');
    }
  }

  // ---- Private compensation methods ----

  private async compensateReservedSlot(newSlotId: string): Promise<void> {
    await this.supabase
      .from('slots')
      .update({ status: 'AVAILABLE', consultation_id: null })
      .eq('id', newSlotId);
  }

  private async compensateFullReschedule(
    newSlotId: string,
    oldSlotId: string,
    consultationId: string
  ): Promise<void> {
    await this.compensateReservedSlot(newSlotId);
    await this.supabase
      .from('slots')
      .update({ status: 'RESERVED', consultation_id: consultationId })
      .eq('id', oldSlotId);
  }

  private buildResult(
    success: boolean,
    newSlotReserved: boolean,
    oldSlotReleased: boolean,
    consultationUpdated: boolean,
    rollbackExecuted: boolean,
    failureReason?: RescheduleExecutionResult['failureReason']
  ): RescheduleExecutionResult {
    return { success, newSlotReserved, oldSlotReleased, consultationUpdated, rollbackExecuted, failureReason };
  }
}
