/**
 * RescheduleOrchestrator
 *
 * Single responsibility: Coordinate the reschedule lifecycle steps.
 * This is a THIN orchestrator — it validates, delegates, and transitions.
 * It does NOT own any persistence logic, DB queries, or sync internals.
 *
 * Dependency flow (strict):
 *   RescheduleOrchestrator
 *     → AuthoritativeVersionService   (reliability)
 *     → RescheduleLimitsGuard         (reliability)
 *     → TransactionalReservationRepository (repositories)
 *     → MultiTabRealtimeSync          (reliability, post-success broadcast)
 *
 * The orchestrator MUST NOT:
 * — contain SQL or Supabase client calls directly.
 * — implement retry engines.
 * — implement synchronization internals.
 * — contain test logic or persistence simulation.
 * — call window.location, alert(), or localStorage.
 *
 * Layer: orchestrators
 */

import { AuthoritativeVersionService } from '../reliability/AuthoritativeVersionService';
import { RescheduleLimitsGuard } from '../reliability/RescheduleLimitsGuard';
import { MultiTabRealtimeSync } from '../reliability/MultiTabRealtimeSync';
import { TransactionalReservationRepository } from '../repositories/TransactionalReservationRepository';

export type RescheduleRejectionCode =
  | 'VERSION_STALE'
  | 'VERSION_MISMATCH'
  | 'VERSION_NOT_FOUND'
  | 'MAX_RESCHEDULES_REACHED'
  | 'COOLDOWN_ACTIVE'
  | 'LIMITS_INVALID_STATE'
  | 'NEW_SLOT_UNAVAILABLE'
  | 'OLD_SLOT_RELEASE_FAILED'
  | 'CONSULTATION_UPDATE_FAILED'
  | 'EXCEPTION';

export interface RescheduleResult {
  success: boolean;
  rejectionCode?: RescheduleRejectionCode;
  newServerVersion?: number;
}

export interface RescheduleDeps {
  versionService: AuthoritativeVersionService;
  limitsGuard: RescheduleLimitsGuard;
  reservationRepository: TransactionalReservationRepository;
  realtimeSync: MultiTabRealtimeSync;
}

export class RescheduleOrchestrator {
  constructor(private readonly deps: RescheduleDeps) {}

  /**
   * Execute a full protected reschedule.
   *
   * Step order (mandatory):
   * 1. Assert DB-authoritative version (reject stale clients).
   * 2. Assert reschedule limits (max count + cooldown).
   * 3. Persist reschedule via repository (compensated transaction).
   * 4. Increment reschedule count (reliability post-mutation).
   * 5. Increment lifecycle version (DB-driven, not local++).
   * 6. Broadcast invalidation to peer tabs.
   */
  async execute(
    consultationId: string,
    oldSlotId: string,
    newSlotId: string,
    clientVersion: number
  ): Promise<RescheduleResult> {
    // Step 1: Version authority check
    const versionCheck = await this.deps.versionService.assertVersionBeforeMutation(
      consultationId,
      clientVersion
    );

    if (!versionCheck.valid) {
      return {
        success: false,
        rejectionCode: this.mapVersionRejection(versionCheck.rejectionReason),
      };
    }

    // Step 2: Business limits check
    const limitsCheck = await this.deps.limitsGuard.assertReschedulable(consultationId);

    if (!limitsCheck.allowed) {
      return {
        success: false,
        rejectionCode: this.mapLimitsRejection(limitsCheck.rejectionReason),
      };
    }

    // Step 3: Persist (repository owns all DB writes)
    const persistResult = await this.deps.reservationRepository.executeReschedule(
      consultationId,
      oldSlotId,
      newSlotId
    );

    if (!persistResult.success) {
      return {
        success: false,
        rejectionCode: persistResult.failureReason as RescheduleRejectionCode,
      };
    }

    // Step 4: Increment business counter
    await this.deps.limitsGuard.incrementRescheduleCount(consultationId);

    // Step 5: Increment server version (DB-driven)
    const newVersion = await this.deps.versionService.incrementServerVersion(consultationId);

    // Step 6: Broadcast to peer tabs
    if (newVersion !== null) {
      await this.deps.realtimeSync.broadcastInvalidation({
        consultationId,
        newServerVersion: newVersion,
        action: 'RESCHEDULED',
        timestamp: Date.now(),
      });
    }

    return { success: true, newServerVersion: newVersion ?? undefined };
  }

  private mapVersionRejection(reason?: string): RescheduleRejectionCode {
    if (reason === 'STALE_VERSION') return 'VERSION_STALE';
    if (reason === 'VERSION_MISMATCH') return 'VERSION_MISMATCH';
    return 'VERSION_NOT_FOUND';
  }

  private mapLimitsRejection(reason?: string): RescheduleRejectionCode {
    if (reason === 'MAX_RESCHEDULES_REACHED') return 'MAX_RESCHEDULES_REACHED';
    if (reason === 'COOLDOWN_ACTIVE') return 'COOLDOWN_ACTIVE';
    return 'LIMITS_INVALID_STATE';
  }
}
