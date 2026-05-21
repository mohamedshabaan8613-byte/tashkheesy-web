/**
 * TransactionalReservationRepository
 *
 * Single responsibility: Thin persistence adapter for the reschedule lifecycle.
 * Delegates ALL mutations to the server-side atomic_reschedule RPC.
 *
 * Transactional classification: TRUE ATOMIC TRANSACTION (Sprint 3.7).
 * — All mutations execute inside a single server-side BEGIN/COMMIT block.
 * — No distributed compensation. No client-side rollback orchestration.
 * — Any failure inside the RPC automatically rolls back every step.
 *
 * Sprint 3.6 → 3.7 migration complete:
 *   Distributed compensation pipeline (3 sequential DB calls + manual rollback)
 *   is fully replaced by: supabase.rpc('atomic_reschedule', { ... })
 *
 * Layer: repositories
 * Depends on: Supabase client only.
 * Must NOT import: orchestrators, reliability services, React, UI.
 */

import { SupabaseClient } from '@supabase/supabase-js';

export interface RescheduleExecutionResult {
  success: boolean;
  newServerVersion?: number;
  newRescheduleCount?: number;
  rescheduledAt?: string;
  failureReason?:
    | 'CONSULTATION_NOT_FOUND'
    | 'CONSULTATION_NOT_RESCHEDULABLE'
    | 'INVALID_OWNERSHIP'
    | 'STALE_VERSION'
    | 'MAX_RESCHEDULES_REACHED'
    | 'COOLDOWN_ACTIVE'
    | 'SLOT_NOT_FOUND'
    | 'SLOT_UNAVAILABLE'
    | 'OLD_SLOT_NOT_FOUND'
    | 'INTERNAL_ERROR'
    | 'RPC_ERROR';
  serverVersion?: number; // present on STALE_VERSION rejection so caller can refresh
  cooldownExpiresAt?: string; // present on COOLDOWN_ACTIVE rejection
}

export class TransactionalReservationRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Execute an atomic reschedule via the server-side RPC.
   *
   * The RPC enforces atomically:
   *   1. Ownership token validation
   *   2. Lifecycle version check (stale rejection)
   *   3. Reschedule limit + cooldown enforcement
   *   4. New slot availability check (with FOR UPDATE lock)
   *   5. Reserve new slot
   *   6. Release old slot
   *   7. Update consultation (slot_id, lifecycle_version, reschedule_count, timestamps)
   *
   * On ANY failure the DB rolls back everything. No orphan states possible.
   */
  async executeReschedule(
    consultationId: string,
    oldSlotId: string,
    newSlotId: string,
    ownershipToken: string,
    clientVersion: number
  ): Promise<RescheduleExecutionResult> {
    const { data, error } = await this.supabase.rpc('atomic_reschedule', {
      p_consultation_id: consultationId,
      p_old_slot_id:     oldSlotId,
      p_new_slot_id:     newSlotId,
      p_ownership_token: ownershipToken,
      p_client_version:  clientVersion,
    });

    // Network/RPC-level failure (not a business rejection).
    if (error) {
      console.error('[TransactionalReservationRepository] RPC transport error:', error);
      return { success: false, failureReason: 'RPC_ERROR' };
    }

    // RPC returned a business rejection.
    if (!data?.success) {
      const code = data?.error_code as RescheduleExecutionResult['failureReason'];
      return {
        success:          false,
        failureReason:    code ?? 'INTERNAL_ERROR',
        serverVersion:    data?.server_version,
        cooldownExpiresAt: data?.cooldown_expires_at,
      };
    }

    // Atomic success: return authoritative state from server.
    return {
      success:            true,
      newServerVersion:   data.new_lifecycle_version,
      newRescheduleCount: data.new_reschedule_count,
      rescheduledAt:      data.rescheduled_at,
    };
  }
}
