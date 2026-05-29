/**
 * useRescheduleBooking.ts — Sprint 3.5 Phase 1B
 *
 * React hook encapsulating the full reschedule flow:
 *   1. Acquire action lock (prevents double-submit)
 *   2. Call orchestrateReschedule() with dep-injected transitionTo
 *   3. On success: call onRescheduled(newSlotId) callback
 *   4. On failure: expose rescheduleError for UI
 *
 * USAGE:
 *   const { reschedule, isRescheduling, rescheduleError, resetError } =
 *     useRescheduleBooking(
 *       session,
 *       currentReservationId,
 *       (newSlotId) => navigate(`${CONSULTATION_ROUTES.ACTIVE}?slot=${newSlotId}`)
 *     );
 *
 * DESIGN:
 *   - transitionTo dep-injected from useConsultationBooking() — RULE 1.
 *   - authoritativeVersion = session.lifecycleVersion in Sprint 3.5.
 *     Full server verification in Sprint 3.6.
 *   - Caller owns navigation via onRescheduled.
 */

import { useState, useCallback } from "react";
import { useConsultationBooking } from "../contexts/ConsultationBookingContext";
import {
  orchestrateReschedule,
  type RescheduleFailureReason,
} from "../orchestrators/RescheduleOrchestrator";
import { useConfirmActionLock } from "../reliability/confirmActionLock";
import type { ConsultationBookingSession } from "../types/consultationBookingTypes";

export interface UseRescheduleBookingReturn {
  /** Execute reschedule with the given new slot. Idempotent while lock is held. */
  reschedule: (newSlotId: string) => Promise<void>;
  /** True while reschedule is in-flight. */
  isRescheduling: boolean;
  /** Failure reason from last failed attempt. */
  rescheduleError: RescheduleFailureReason | null;
  /** Reset error state for retry. */
  resetError: () => void;
}

export function useRescheduleBooking(
  session: ConsultationBookingSession,
  currentReservationId: string | null,
  onRescheduled: (newSlotId: string) => void,
): UseRescheduleBookingReturn {
  const { transitionTo } = useConsultationBooking();
  const lock = useConfirmActionLock();
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [rescheduleError, setRescheduleError] = useState<RescheduleFailureReason | null>(null);

  const reschedule = useCallback(
    async (newSlotId: string) => {
      if (!lock.acquire()) return; // double-submit guard
      setIsRescheduling(true);
      setRescheduleError(null);

      try {
        const result = await orchestrateReschedule(
          {
            session,
            ownershipToken: session.sessionId,
            newSlotId,
            currentReservationId,
            // Sprint 3.5: local version used as authoritative
            // Full server check in Sprint 3.6
            authoritativeVersion: session.lifecycleVersion,
            reservationTtlMinutes: 15,
          },
          {
            transitionTo: (phase) =>
              transitionTo(phase as Parameters<typeof transitionTo>[0]),
          },
        );

        if (result.success) {
          onRescheduled(newSlotId);
        } else {
          setRescheduleError(result.reason ?? "INTERNAL_ERROR");
        }
      } catch (err) {
        setRescheduleError("unknown_error");
        console.error("[useRescheduleBooking] unexpected error:", err);
      } finally {
        lock.release();
        setIsRescheduling(false);
      }
    },
    [session, currentReservationId, transitionTo, lock, onRescheduled],
  );

  const resetError = useCallback(() => setRescheduleError(null), []);

  return { reschedule, isRescheduling, rescheduleError, resetError };
}
