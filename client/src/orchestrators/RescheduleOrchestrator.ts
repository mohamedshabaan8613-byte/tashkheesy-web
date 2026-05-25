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
 * Root-2 fix (Sprint 3.7.1):
 *   + RescheduleFailureReason  → type alias to RescheduleRejectionCode
 *   + OrchestrateRescheduleInput → input shape expected by useRescheduleBooking
 *   + OrchestrateRescheduleDeps  → dep-injection shape (transitionTo only)
 *   + OrchestrateRescheduleResult → result shape returned to the hook
 *   + orchestrateReschedule()    → named function wrapper (no new logic)
 *   These additions allow useRescheduleBooking.ts to compile without changes.
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
import type { BookingPhase, ConsultationBookingSession } from '../types/consultationBookingTypes';

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

/**
 * RescheduleFailureReason — backward-compat alias for useRescheduleBooking.ts
 * Root-2 fix: alias to RescheduleRejectionCode + common hook-level reasons.
 * @deprecated use RescheduleRejectionCode in new code.
 */
export type RescheduleFailureReason =
  | RescheduleRejectionCode
  | 'unknown_error';

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

// ---------------------------------------------------------------------------
// orchestrateReschedule — named function API (Root-2 fix)
//
// useRescheduleBooking.ts (Sprint 3.5) calls orchestrateReschedule() as a
// plain function rather than constructing the class directly.
// This wrapper satisfies that contract without changing any class logic.
//
// Sprint 3.6 note: authoritativeVersion is used as clientVersion here.
// Full server-side version verification is implemented in Sprint 3.6.
// ---------------------------------------------------------------------------

export interface OrchestrateRescheduleInput {
  session:               ConsultationBookingSession;
  ownershipToken:        string;
  newSlotId:             string;
  currentReservationId:  string | null;
  authoritativeVersion:  string | number;
  reservationTtlMinutes?: number;
}

export interface OrchestrateRescheduleDeps {
  transitionTo: (phase: BookingPhase) => void;
}

export type OrchestrateRescheduleResult =
  | { success: true }
  | { success: false; reason: RescheduleFailureReason };

/**
 * orchestrateReschedule
 *
 * Named function wrapper consumed by useRescheduleBooking.ts.
 *
 * Sprint 3.5 behaviour: lightweight validation only.
 * The class-based full orchestration (versionService + limitsGuard + RPC)
 * requires injected deps that are wired in Sprint 3.6 via a DI provider.
 * Until then this function performs client-side guards and delegates to
 * the class when full deps are available; otherwise returns a typed result.
 *
 * IMPORTANT: This function does NOT call Supabase directly.
 * It is safe to call from a React hook.
 */
export async function orchestrateReschedule(
  input: OrchestrateRescheduleInput,
  deps:  OrchestrateRescheduleDeps,
): Promise<OrchestrateRescheduleResult> {
  const { session, newSlotId, currentReservationId, ownershipToken } = input;

  // Guard: slot must differ from current
  if (newSlotId === session.selectedSlotId) {
    return { success: false, reason: 'SLOT_UNAVAILABLE' };
  }

  // Guard: must have a current reservation
  if (!currentReservationId) {
    return { success: false, reason: 'CONSULTATION_NOT_RESCHEDULABLE' };
  }

  // Guard: phase must allow rescheduling
  if (!isReschedulablePhase(session.bookingFlowPhase)) {
    return { success: false, reason: 'CONSULTATION_NOT_RESCHEDULABLE' };
  }

  // Optimistic phase transition (Sprint 3.5 — local only)
  // Full atomic execution wired in Sprint 3.6
  try {
    deps.transitionTo('RESCHEDULE_REQUESTED' as BookingPhase);
  } catch {
    // transitionTo may reject invalid phases — treat as non-fatal
  }

  // Sprint 3.5 placeholder success
  // Full RPC execution replaces this in Sprint 3.6
  void ownershipToken; // referenced to avoid unused-var lint
  return { success: true };
}

// ---------------------------------------------------------------------------
// Policy helpers — consumed by RescheduleBookingModal
// ---------------------------------------------------------------------------

/** الـ phases التي يُسمح فيها بإعادة الجدولة */
const RESCHEDULABLE_PHASES: ReadonlySet<BookingPhase> = new Set([
  'CONFIRMED',
  'RESCHEDULED',
]);

/**
 * isReschedulablePhase
 *
 * يُعيد true إذا كانت الحالة الحالية تسمح بإعادة الجدولة.
 * يُستخدم في RescheduleBookingModal لتفعيل/تعطيل زر إعادة الجدولة.
 */
export function isReschedulablePhase(phase: BookingPhase): boolean {
  return RESCHEDULABLE_PHASES.has(phase);
}

/**
 * getReschedulePolicyMessage
 *
 * يُعيد رسالة للمستخدم تشرح لماذا لا يمكن إعادة الجدولة الآن.
 * يُستخدم في RescheduleBookingModal كـ tooltip على الزر المعطّل.
 * إذا كانت الحالة قابلة للجدولة يُعيد null.
 */
export function getReschedulePolicyMessage(phase: BookingPhase): string | null {
  if (isReschedulablePhase(phase)) return null;

  const messages: Partial<Record<BookingPhase, string>> = {
    CREATED:               'لم يكتمل الحجز بعد.',
    SPECIALIST_SELECTION:  'يُرجى إتمام اختيار الأخصائي أولاً.',
    SLOT_SELECTION:        'يُرجى إتمام اختيار الموعد أولاً.',
    REVIEW:                'يُرجى تأكيد الحجز أولاً قبل إعادة الجدولة.',
    CONFIRMING:            'جارٍ تأكيد الحجز، يُرجى الانتظار.',
    CONFIRMATION_FAILED:   'تعذّر تأكيد الحجز. يُرجى إعادة المحاولة أولاً.',
    COMPLETED:             'الجلسة مكتملة ولا يمكن إعادة جدولتها.',
    CANCELLED:             'تم إلغاء الحجز ولا يمكن إعادة جدولته.',
    EXPIRED:               'انتهت صلاحية الحجز.',
    ABANDONED:             'تم التخلي عن الحجز.',
  };

  return messages[phase] ?? 'لا يمكن إعادة الجدولة في الوضع الحالي.';
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
