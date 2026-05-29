/**
 * NotificationQueueService.ts — Sprint 3.4 Phase 7
 *
 * Queue-ready notification architecture.
 * No real sends in Sprint 3.4 — inserts to notification_queue only.
 * Actual sending handled by background worker in Sprint 3.5.
 *
 * TYPES:
 *   BOOKING_CONFIRMED_EMAIL
 *   BOOKING_CONFIRMED_SMS
 *   BOOKING_CANCELLED_EMAIL
 *   BOOKING_RESCHEDULED_EMAIL
 *   REMINDER_24H
 *   REMINDER_1H
 *
 * ARCHITECTURE RULE:
 *   This service does NOT send notifications directly.
 *   It queues them for async processing.
 *   Orchestrator calls this after successful confirmation.
 */

import { supabase } from "../lib/supabase";
import type { NotificationType, NotificationQueueEntry } from "../types/consultationBookingTypes";
import { generateEventId } from "../types/bookingDomainEvents";

export const NotificationQueueService = {
  /**
   * queueNotification — insert a notification into the queue.
   * Non-fatal: notification failures do NOT block booking flow.
   */
  async queueNotification(
    consultationId: string,
    userId: string,
    notificationType: NotificationType,
    payload: Record<string, unknown> = {}
  ): Promise<NotificationQueueEntry | null> {
    try {
      const { data, error } = await supabase
        .from("notification_queue")
        .insert({
          id: generateEventId(),
          consultation_id: consultationId,
          user_id: userId,
          notification_type: notificationType,
          payload,
          queued_at: new Date().toISOString(),
          sent_at: null,
          failed_at: null,
          retry_count: 0,
        })
        .select()
        .single();

      if (error) {
        console.warn(
          `NotificationQueueService.queueNotification [${notificationType}] failed:`,
          error.message
        );
        return null;
      }

      return data as NotificationQueueEntry;
    } catch (err) {
      // Non-fatal
      console.warn(`NotificationQueueService.queueNotification exception:`, err);
      return null;
    }
  },

  /**
   * queueBookingConfirmedNotifications — queue email + SMS on confirmation.
   * Called by orchestrator after successful confirmBooking().
   */
  async queueBookingConfirmedNotifications(
    consultationId: string,
    userId: string,
    payload: {
      specialistName: string;
      slotDatetime: string;
      isOnline: boolean;
    }
  ): Promise<void> {
    await Promise.allSettled([
      NotificationQueueService.queueNotification(
        consultationId,
        userId,
        "BOOKING_CONFIRMED_EMAIL",
        payload
      ),
      NotificationQueueService.queueNotification(
        consultationId,
        userId,
        "BOOKING_CONFIRMED_SMS",
        { slotDatetime: payload.slotDatetime }
      ),
    ]);
  },

  /**
   * queueBookingCancelledNotification
   */
  async queueBookingCancelledNotification(
    consultationId: string,
    userId: string,
    reason: string
  ): Promise<void> {
    await NotificationQueueService.queueNotification(
      consultationId,
      userId,
      "BOOKING_CANCELLED_EMAIL",
      { reason }
    );
  },

  /**
   * queueRescheduledNotification
   */
  async queueRescheduledNotification(
    consultationId: string,
    userId: string,
    payload: {
      previousSlotDatetime: string;
      newSlotDatetime: string;
    }
  ): Promise<void> {
    await NotificationQueueService.queueNotification(
      consultationId,
      userId,
      "BOOKING_RESCHEDULED_EMAIL",
      payload
    );
  },
};
