/**
 * useCancelBooking.ts — Sprint 3.5
 *
 * React hook encapsulating the full cancellation flow:
 *   1. Acquire confirm action lock (prevents double-click)
 *   2. Check lifecycleVersion against authoritative (in-memory for now)
 *   3. Call orchestrateCancellation()
 *   4. On success: call onCancelled() callback
 *   5. On failure: expose cancelError for UI
 *
 * USAGE:
 *   const { cancel, isCancelling, cancelError, resetError } = useCancelBooking(
 *     session,
 *     () => navigate(CONSULTATION_ROUTES.START, { replace: true })
 *   );
 *
 * DESIGN:
 *   - Uses useConfirmActionLock() for lock management.
 *   - authoritativeVersion is pulled from session.lifecycleVersion in Sprint 3.5
 *     (full server verification in Sprint 3.6).
 *   - transitionTo is pulled from useConsultationBooking() context.
 *   - Does NOT navigate directly. Caller owns navigation via onCancelled.
 */

import { useState, useCallback } from "react";
import { useConsultationBooking } from "../contexts/ConsultationBookingContext";
import {
  orchestrateCancellation,
  type CancellationFailureReason,
} from "../orchestrators/CancellationOrchestrator";
import { useConfirmActionLock } from "../reliability/confirmActionLock";
import type { ConsultationBookingSession } from "../types/consultationBookingTypes";

export interface UseCancelBookingReturn {
  /** Execute cancellation. Idempotent while lock is held. */
  cancel: () => Promise<void>;
  /** True while cancellation is in-flight. */
  isCancelling: boolean;
  /** Failure reason from last failed attempt. Null if none / cleared. */
  cancelError: CancellationFailureReason | null;
  /** Reset the error state (e.g., user wants to retry). */
  resetError: () => void;
}

export function useCancelBooking(
  session: ConsultationBookingSession,
  onCancelled: () => void,
): UseCancelBookingReturn {
  const { transitionTo } = useConsultationBooking();
  const lock = useConfirmActionLock();
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<CancellationFailureReason | null>(null);

  const cancel = useCallback(async () => {
    // Idempotency guard — lock prevents double-click / rapid-submit
    if (!lock.acquire()) return;
    setIsCancelling(true);
    setCancelError(null);

    try {
      const result = await orchestrateCancellation(
        {
          session,
          ownershipToken: session.sessionId, // ownershipToken = sessionId in v1
          reason: "user_requested",
          // Sprint 3.5: use local version as both local + authoritative
          // (full server check lands in Sprint 3.6)
          authoritativeVersion: session.lifecycleVersion,
        },
        {
          transitionTo: (phase) =>
            transitionTo(phase as Parameters<typeof transitionTo>[0]),
        },
      );

      if (result.success) {
        onCancelled();
      } else {
        setCancelError(result.reason);
      }
    } catch (err) {
      // Unexpected exception — surface as unknown_error
      setCancelError("unknown_error");
      console.error("[useCancelBooking] unexpected error:", err);
    } finally {
      lock.release();
      setIsCancelling(false);
    }
  }, [session, transitionTo, lock, onCancelled]);

  const resetError = useCallback(() => {
    setCancelError(null);
  }, []);

  return { cancel, isCancelling, cancelError, resetError };
}
