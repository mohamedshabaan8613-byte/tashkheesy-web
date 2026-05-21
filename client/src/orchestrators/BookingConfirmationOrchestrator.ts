/**
 * BookingConfirmationOrchestrator.ts — Sprint 3.4 Phase 3
 *
 * Confirmation Lifecycle Orchestrator.
 *
 * RESPONSIBILITY:
 *   Full confirmation transaction in correct order:
 *     1. Validate ownership token
 *     2. Validate reservation not expired
 *     3. Check eligibility (one-free-consultation policy)
 *     4. Update consultation status → CONFIRMING (optimistic)
 *     5. Confirm slot reservation → CONFIRMED
 *     6. Persist consultation → CONFIRMED
 *     7. Queue notifications
 *     8. Track audit event
 *     9. Emit BOOKING_CONFIRMED domain event
 *
 *   On any failure:
 *     - Emit BOOKING_CONFIRMATION_FAILED
 *     - Return failure result with retryable flag
 *
 * ARCHITECTURE RULE:
 *   This orchestrator calls transitionTo() via the provided callback.
 *   It does NOT import or reference ConsultationBookingContext directly.
 *   transitionTo remains the only authority for phase mutations.
 */

import { ConsultationRepository } from "../repositories/ConsultationRepository";
import { SlotReservationRepository } from "../repositories/SlotReservationRepository";
import { ConsultationEligibilityService } from "../services/ConsultationEligibilityService";
import { ConsultationAuditService } from "../services/ConsultationAuditService";
import { NotificationQueueService } from "../services/NotificationQueueService";
import {
  bookingEventBus,
  generateEventId,
} from "../types/bookingDomainEvents";
import type { ConfirmBookingInput } from "../types/consultationBookingTypes";

export interface ConfirmationResult {
  success: boolean;
  consultationId: string;
  reason?: string;
  retryable?: boolean;
}

export interface ConfirmationOrchestratorDeps {
  /** Provided by ConsultationBookingContext — the ONLY path to phase mutation */
  transitionTo: (phase: string) => void;
}

export async function orchestrateBookingConfirmation(
  input: ConfirmBookingInput,
  deps: ConfirmationOrchestratorDeps
): Promise<ConfirmationResult> {
  const { consultationId, userId, reservationId, ownershipToken } = input;
  const { transitionTo } = deps;

  // ── Step 1: Transition to CONFIRMING (optimistic UI update)
  transitionTo("CONFIRMING");

  try {
    // ── Step 2: Validate reservation ownership + expiry
    const reservation = await SlotReservationRepository.getReservationById(
      reservationId,
      userId
    );

    if (!reservation) {
      bookingEventBus.emit({
        id: generateEventId(),
        type: "BOOKING_CONFIRMATION_FAILED",
        consultationId,
        userId,
        timestamp: new Date().toISOString(),
        payload: { reason: "reservation_not_owned", retryable: false },
      });
      transitionTo("CONFIRMATION_FAILED");
      return { success: false, consultationId, reason: "reservation_not_owned", retryable: false };
    }

    if (new Date(reservation.reserved_until) < new Date()) {
      bookingEventBus.emit({
        id: generateEventId(),
        type: "BOOKING_CONFIRMATION_FAILED",
        consultationId,
        userId,
        timestamp: new Date().toISOString(),
        payload: { reason: "reservation_expired", retryable: false },
      });
      transitionTo("CONFIRMATION_FAILED");
      return { success: false, consultationId, reason: "reservation_expired", retryable: false };
    }

    // ── Step 3: Check eligibility
    const eligibility = await ConsultationEligibilityService.checkEligibility(userId);

    if (!eligibility.eligible) {
      bookingEventBus.emit({
        id: generateEventId(),
        type: "BOOKING_CONFIRMATION_FAILED",
        consultationId,
        userId,
        timestamp: new Date().toISOString(),
        payload: { reason: "eligibility_denied", retryable: false },
      });
      transitionTo("CONFIRMATION_FAILED");
      return { success: false, consultationId, reason: eligibility.reason ?? "eligibility_denied", retryable: false };
    }

    // ── Step 4: Confirm slot reservation → CONFIRMED
    await SlotReservationRepository.confirmReservation(
      reservationId,
      userId,
      consultationId
    );

    // ── Step 5: Persist consultation → CONFIRMED
    const confirmed = await ConsultationRepository.confirmBooking({
      consultationId,
      userId,
      reservationId,
      ownershipToken,
    });

    // ── Step 6: Queue notifications (non-fatal)
    NotificationQueueService.queueBookingConfirmedNotifications(
      consultationId,
      userId,
      {
        specialistName: confirmed.specialist_id ?? "",
        slotDatetime: confirmed.confirmed_at ?? "",
        isOnline: true,
      }
    ).catch(() => {}); // non-fatal

    // ── Step 7: Track audit (non-fatal)
    ConsultationAuditService.trackBookingConfirmed(
      consultationId,
      confirmed.specialist_id ?? "",
      confirmed.slot_id ?? "",
      confirmed.is_free_consultation
    ).catch(() => {}); // non-fatal

    // ── Step 8: Emit BOOKING_CONFIRMED domain event
    bookingEventBus.emit({
      id: generateEventId(),
      type: "BOOKING_CONFIRMED",
      consultationId,
      userId,
      timestamp: new Date().toISOString(),
      payload: {
        reservationId,
        specialistId: confirmed.specialist_id ?? "",
        slotId: confirmed.slot_id ?? "",
        slotDatetime: confirmed.confirmed_at ?? "",
        isFreeConsultation: confirmed.is_free_consultation,
        confirmedAt: confirmed.confirmed_at ?? new Date().toISOString(),
      },
    });

    // ── Step 9: Transition to CONFIRMED
    transitionTo("CONFIRMED");

    return { success: true, consultationId };
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown_error";
    const retryable = message.includes("network") || message.includes("timeout");

    bookingEventBus.emit({
      id: generateEventId(),
      type: "BOOKING_CONFIRMATION_FAILED",
      consultationId,
      userId,
      timestamp: new Date().toISOString(),
      payload: { reason: retryable ? "network_error" : "db_error", retryable },
    });

    transitionTo("CONFIRMATION_FAILED");
    return { success: false, consultationId, reason: message, retryable };
  }
}
