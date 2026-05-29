/**
 * RescheduleOrchestrator
 *
 * Single responsibility: Coordinate the reschedule lifecycle steps.
 * This is a THIN orchestrator — it validates inputs, coordinates services,
 * delegates persistence, and emits domain events.
 *
 * Sprint 3.7 note:
 *   The repository layer now calls a single atomic_reschedule RPC.
 *   Orchestrator no longer needs to call versionService or limitsGuard
 *   separately — the RPC enforces those atomically server-side.
 *   However, we retain the pre-checks here as a CLIENT-SIDE fast-fail
 *   to avoid unnecessary network round-trips to the DB (UX optimisation).
 *   The DB remains the authoritative enforcer regardless.
 *
 * Dependency flow (strict):
 *   RescheduleOrchestrator
 *     → AuthoritativeVersionService   (reliability) [pre-check / fast-fail]
 *     → RescheduleLimitsGuard         (reliability) [pre-check / fast-fail]
 *     → TransactionalReservationRepository (repositories) [single atomic RPC]
 *     → MultiTabRealtimeSync          (reliability) [post-success broadcast]
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
import { RescheduleLimitsGuard }       from '../reliability/RescheduleLimitsGuard';
import { MultiTabRealtimeSync }        from '../reliability/MultiTabRealtimeSync';
import { TransactionalReservationRepository } from '../repositories/TransactionalReservationRepository';

export type RescheduleRejectionCode =
  | 'VERSION_STALE'
  | 'VERSION_MISMATCH'
  | 'VERSION_NOT_FOUND'
  | 'MAX_RESCHEDULES_REACHED'
  | 'COOLDOWN_ACTIVE'
  | 'LIMITS_INVALID_STATE'
  | 'SLOT_UNAVAILABLE'
  | 'SLOT_NOT_FOUND'
  | 'OLD_SLOT_NOT_FOUND'
  | 'CONSULTATION_NOT_FOUND'
  | 'CONSULTATION_NOT_RESCHEDULABLE'
  | 'INVALID_OWNERSHIP'
  | 'INTERNAL_ERROR'
  | 'RPC_ERROR';

export interface RescheduleResult {
  success: boolean;
  rejectionCode?: RescheduleRejectionCode;
  newServerVersion?: number;
  cooldownExpiresAt?: string;
}

export interface RescheduleDeps {
  versionService:        AuthoritativeVersionService;
  limitsGuard:           RescheduleLimitsGuard;
  reservationRepository: TransactionalReservationRepository;
  realtimeSync:          MultiTabRealtimeSync;
}

export class RescheduleOrchestrator {
  constructor(private readonly deps: RescheduleDeps) {}

  /**
   * Execute a fully protected atomic reschedule.
   *
   * Client-side pre-checks (fast-fail, not authoritative):
   *   1. Version freshness check against DB.
   *   2. Business limits check (count + cooldown) against DB.
   *
   * Authoritative atomic execution (server-side):
   *   3. Single RPC call — ALL validations + ALL mutations in one transaction.
   *
   * Post-success:
   *   4. Broadcast realtime invalidation to peer tabs.
   */
  async execute(
    consultationId: string,
    oldSlotId:      string,
    newSlotId:      string,
    ownershipToken: string,
    clientVersion:  number
  ): Promise<RescheduleResult> {
    // ----------------------------------------------------------------
    // Step 1: Client-side version pre-check (fast-fail, UX optimisation).
    // The atomic RPC will re-enforce this server-side.
    // ----------------------------------------------------------------
    const versionCheck = await this.deps.versionService.assertVersionBeforeMutation(
      consultationId,
      clientVersion
    );

    if (!versionCheck.valid) {
      return {
        success:       false,
        rejectionCode: this.mapVersionRejection(versionCheck.rejectionReason),
      };
    }

    // ----------------------------------------------------------------
    // Step 2: Client-side limits pre-check (fast-fail, UX optimisation).
    // The atomic RPC will re-enforce this server-side.
    // ----------------------------------------------------------------
    const limitsCheck = await this.deps.limitsGuard.assertReschedulable(consultationId);

    if (!limitsCheck.allowed) {
      return {
        success:       false,
        rejectionCode: this.mapLimitsRejection(limitsCheck.rejectionReason),
      };
    }

    // ----------------------------------------------------------------
    // Step 3: Atomic server-side execution via single RPC.
    // Repository is now a thin adapter — no compensation, no rollback code.
    // ----------------------------------------------------------------
    const persistResult = await this.deps.reservationRepository.executeReschedule(
      consultationId,
      oldSlotId,
      newSlotId,
      ownershipToken,
      clientVersion
    );

    if (!persistResult.success) {
      return {
        success:          false,
        rejectionCode:    persistResult.failureReason as RescheduleRejectionCode,
        cooldownExpiresAt: persistResult.cooldownExpiresAt,
      };
    }

    // ----------------------------------------------------------------
    // Step 4: Broadcast invalidation to peer tabs using the authoritative
    // lifecycle_version returned by the RPC (never a local increment).
    // ----------------------------------------------------------------
    const newVersion = persistResult.newServerVersion;
    if (newVersion !== undefined) {
      await this.deps.realtimeSync.broadcastInvalidation({
        consultationId,
        newServerVersion: newVersion,
        action:           'RESCHEDULED',
        timestamp:        Date.now(),
      });
    }

    return { success: true, newServerVersion: newVersion };
  }

  // ---- Private mapping helpers ----

  private mapVersionRejection(reason?: string): RescheduleRejectionCode {
    if (reason === 'STALE_VERSION')    return 'VERSION_STALE';
    if (reason === 'VERSION_MISMATCH') return 'VERSION_MISMATCH';
    return 'VERSION_NOT_FOUND';
  }

  private mapLimitsRejection(reason?: string): RescheduleRejectionCode {
    if (reason === 'MAX_RESCHEDULES_REACHED') return 'MAX_RESCHEDULES_REACHED';
    if (reason === 'COOLDOWN_ACTIVE')         return 'COOLDOWN_ACTIVE';
    return 'LIMITS_INVALID_STATE';
  }
}

// ─── Compatibility Shims ──────────────────────────────────────────────────────
// These exports provide a functional API used by useRescheduleBooking and
// RescheduleBookingModal. They are additive compatibility shims — Sprint 3.7.1.

/**
 * RescheduleFailureReason — alias for RescheduleRejectionCode.
 * Used by useRescheduleBooking for typed error state.
 */
export type RescheduleFailureReason = RescheduleRejectionCode | "unknown_error";

/**
 * RescheduleInput — functional API input shape expected by useRescheduleBooking.
 */
export interface RescheduleInput {
  session: import("../types/consultationBookingTypes").ConsultationBookingSession;
  ownershipToken: string;
  newSlotId: string;
  currentReservationId: string | null;
  authoritativeVersion: string;
  reservationTtlMinutes?: number;
}

/**
 * RescheduleCallbacks — dep-injected callbacks for functional API.
 */
export interface RescheduleCallbacks {
  transitionTo: (phase: import("../types/consultationBookingTypes").BookingPhase) => void;
}

/**
 * RescheduleFunctionalResult — result shape expected by useRescheduleBooking.
 */
export interface RescheduleFunctionalResult {
  success: boolean;
  reason?: RescheduleFailureReason;
  rejectionCode?: RescheduleRejectionCode;
}

/**
 * orchestrateReschedule — functional wrapper for useRescheduleBooking.
 * Sprint 3.7.1: stub implementation — full Supabase integration in Sprint 3.8.
 */
export async function orchestrateReschedule(
  _input: RescheduleInput,
  _callbacks: RescheduleCallbacks,
): Promise<RescheduleFunctionalResult> {
  // Sprint 3.7.1 stub: returns failure with clear reason until full integration
  console.warn("[orchestrateReschedule] stub — full integration in Sprint 3.8");
  return { success: false, reason: "INTERNAL_ERROR" };
}

/**
 * isReschedulablePhase — returns true if the given booking phase allows reschedule.
 * Used by RescheduleBookingModal for UI gating.
 */
export function isReschedulablePhase(
  phase: import("../types/consultationBookingTypes").BookingPhase | null | undefined,
): boolean {
  return phase === "CONFIRMED" || phase === "RESCHEDULED";
}

/**
 * getReschedulePolicyMessage — returns a user-facing message for non-reschedulable phases.
 * Used by RescheduleBookingModal for UI copy.
 */
export function getReschedulePolicyMessage(
  phase: import("../types/consultationBookingTypes").BookingPhase | null | undefined,
): string {
  if (!phase) return "لا يمكن إعادة الجدولة في الوقت الحالي.";
  const messages: Partial<Record<import("../types/consultationBookingTypes").BookingPhase, string>> = {
    CREATED:              "لم يتم تأكيد الحجز بعد.",
    SPECIALIST_SELECTION: "يرجى إكمال اختيار الأخصائي أولاً.",
    SLOT_SELECTION:       "يرجى إكمال اختيار الموعد أولاً.",
    REVIEW:               "يرجى مراجعة وتأكيد الحجز أولاً.",
    COMPLETED:            "لا يمكن إعادة جدولة استشارة مكتملة.",
    CANCELLED:            "لا يمكن إعادة جدولة حجز ملغى.",
    EXPIRED:              "انتهت صلاحية هذا الحجز.",
    ABANDONED:            "تم التخلي عن هذا الحجز.",
  };
  return messages[phase] ?? "لا يمكن إعادة الجدولة في الوقت الحالي.";
}
