/**
 * ConsultationAuditService.ts — Sprint 3.4 Phase 8
 *
 * Analytics & Audit Layer.
 * Appends events to consultation_events table (append-only).
 *
 * RULES:
 *   - Never update events — only INSERT
 *   - Non-fatal: audit failures do NOT block booking flow
 *   - All major mutations must be tracked
 *
 * TRACKED EVENTS:
 *   BOOKING_STARTED, SPECIALIST_SELECTED, SLOT_SELECTED,
 *   SLOT_RESERVED, SLOT_RELEASED, SLOT_RESERVATION_EXPIRED,
 *   BOOKING_REVIEW_REACHED, BOOKING_CONFIRMED, BOOKING_CONFIRMATION_FAILED,
 *   BOOKING_CANCELLED, BOOKING_RESCHEDULED, BOOKING_EXPIRED,
 *   NOTIFICATION_QUEUED, NOTIFICATION_SENT, NOTIFICATION_FAILED
 */

import { supabase } from "../lib/supabase";
import type { ConsultationAuditEventType } from "../types/consultationBookingTypes";
import { generateEventId } from "../types/bookingDomainEvents";

export const ConsultationAuditService = {
  /**
   * trackEvent — append an event to consultation_events.
   * Non-fatal: catch all errors and log without throwing.
   */
  async trackEvent(
    consultationId: string,
    eventType: ConsultationAuditEventType,
    payload: Record<string, unknown> = {}
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from("consultation_events")
        .insert({
          id: generateEventId(),
          consultation_id: consultationId,
          event_type: eventType,
          payload,
        });

      if (error) {
        // Non-fatal: log but do not throw
        console.warn(
          `ConsultationAuditService.trackEvent [${eventType}] failed:`,
          error.message
        );
      }
    } catch (err) {
      // Non-fatal: audit must never break the booking flow
      console.warn(`ConsultationAuditService.trackEvent [${eventType}] exception:`, err);
    }
  },

  /**
   * trackBookingStarted — convenience wrapper
   */
  async trackBookingStarted(
    consultationId: string,
    userId: string,
    entryPoint: string
  ): Promise<void> {
    return ConsultationAuditService.trackEvent(consultationId, "BOOKING_STARTED", {
      userId,
      entryPoint,
    });
  },

  /**
   * trackSpecialistSelected — convenience wrapper
   */
  async trackSpecialistSelected(
    consultationId: string,
    specialistId: string,
    specialistName: string
  ): Promise<void> {
    return ConsultationAuditService.trackEvent(consultationId, "SPECIALIST_SELECTED", {
      specialistId,
      specialistName,
    });
  },

  /**
   * trackSlotSelected — convenience wrapper
   */
  async trackSlotSelected(
    consultationId: string,
    slotId: string,
    slotDatetime: string
  ): Promise<void> {
    return ConsultationAuditService.trackEvent(consultationId, "SLOT_SELECTED", {
      slotId,
      slotDatetime,
    });
  },

  /**
   * trackBookingConfirmed — convenience wrapper
   */
  async trackBookingConfirmed(
    consultationId: string,
    specialistId: string,
    slotId: string,
    isFreeConsultation: boolean
  ): Promise<void> {
    return ConsultationAuditService.trackEvent(consultationId, "BOOKING_CONFIRMED", {
      specialistId,
      slotId,
      isFreeConsultation,
      confirmedAt: new Date().toISOString(),
    });
  },

  /**
   * trackBookingCancelled — convenience wrapper
   */
  async trackBookingCancelled(
    consultationId: string,
    reason: string
  ): Promise<void> {
    return ConsultationAuditService.trackEvent(consultationId, "BOOKING_CANCELLED", {
      reason,
      cancelledAt: new Date().toISOString(),
    });
  },

  /**
   * trackBookingRescheduled — convenience wrapper
   */
  async trackBookingRescheduled(
    consultationId: string,
    previousSlotId: string,
    newSlotId: string,
    rescheduleCount: number
  ): Promise<void> {
    return ConsultationAuditService.trackEvent(consultationId, "BOOKING_RESCHEDULED", {
      previousSlotId,
      newSlotId,
      rescheduleCount,
      rescheduledAt: new Date().toISOString(),
    });
  },
};
