/**
 * bookingDomainEvents.ts — Sprint 3.4 Complete Domain Events
 *
 * PHASE 1 + PHASE 2 + PHASE 3:
 *   Complete AnyBookingEvent union with ALL typed event shapes.
 *
 * Sprint 3.3 gap closed:
 *   Previously missing typed shapes:
 *     SLOT_RESERVED, SLOT_RELEASED, SLOT_RESERVATION_EXPIRED,
 *     BOOKING_CONFIRMED, BOOKING_CONFIRMATION_FAILED,
 *     BOOKING_CANCELLED, BOOKING_RESCHEDULED,
 *     NOTIFICATION_QUEUED, NOTIFICATION_SENT, NOTIFICATION_FAILED,
 *     PAYMENT_STARTED, PAYMENT_COMPLETED, PAYMENT_FAILED
 *
 * ARCHITECTURE RULE:
 *   All events are emitted via bookingEventBus only.
 *   No direct phase mutations from event handlers.
 *   transitionTo() is the only authority for bookingFlowPhase changes.
 */

// ---------------------------------------------------------------------------
// Base
// ---------------------------------------------------------------------------

export interface BaseBookingEvent {
  id: string;             // unique event ID — crypto.randomUUID()
  consultationId: string;
  userId: string;
  timestamp: string;      // ISO 8601
}

// ---------------------------------------------------------------------------
// Session Events
// ---------------------------------------------------------------------------

export interface BookingSessionStartedEvent extends BaseBookingEvent {
  type: "BOOKING_SESSION_STARTED";
  payload: {
    entryPoint: string;
    ownershipToken: string;
  };
}

export interface BookingSessionTerminatedEvent extends BaseBookingEvent {
  type: "SESSION_TERMINATED";
  payload: {
    reason: "user_cancel" | "expiry" | "recovery_override" | "manual";
  };
}

export interface BookingSessionRecoveredEvent extends BaseBookingEvent {
  type: "BOOKING_SESSION_RECOVERED";
  payload: {
    recoveredFromPhase: string;
    ownershipToken: string;
  };
}

// ---------------------------------------------------------------------------
// Selection Events
// ---------------------------------------------------------------------------

export interface SpecialistSelectedEvent extends BaseBookingEvent {
  type: "SPECIALIST_SELECTED";
  payload: {
    specialistId: string;
    specialistName: string;
  };
}

export interface SlotSelectedEvent extends BaseBookingEvent {
  type: "SLOT_SELECTED";
  payload: {
    slotId: string;
    slotDatetime: string; // ISO 8601
  };
}

// ---------------------------------------------------------------------------
// PHASE 2 — Slot Reservation Events
// ---------------------------------------------------------------------------

export interface SlotReservedEvent extends BaseBookingEvent {
  type: "SLOT_RESERVED";
  payload: {
    reservationId: string;
    slotId: string;
    reservedUntil: string; // ISO 8601 — TTL expiry
  };
}

export interface SlotReleasedEvent extends BaseBookingEvent {
  type: "SLOT_RELEASED";
  payload: {
    reservationId: string;
    slotId: string;
    reason: "user_cancel" | "reschedule" | "expiry" | "recovery_override";
  };
}

export interface SlotReservationExpiredEvent extends BaseBookingEvent {
  type: "SLOT_RESERVATION_EXPIRED";
  payload: {
    reservationId: string;
    slotId: string;
    expiredAt: string; // ISO 8601
  };
}

// ---------------------------------------------------------------------------
// PHASE 3 — Confirmation Events
// ---------------------------------------------------------------------------

export interface BookingConfirmedEvent extends BaseBookingEvent {
  type: "BOOKING_CONFIRMED";
  payload: {
    reservationId: string;
    specialistId: string;
    slotId: string;
    slotDatetime: string;
    isFreeConsultation: boolean;
    confirmedAt: string; // ISO 8601
  };
}

export interface BookingConfirmationFailedEvent extends BaseBookingEvent {
  type: "BOOKING_CONFIRMATION_FAILED";
  payload: {
    reason:
      | "reservation_expired"
      | "reservation_not_owned"
      | "eligibility_denied"
      | "db_error"
      | "network_error";
    retryable: boolean;
  };
}

// ---------------------------------------------------------------------------
// PHASE 5 — Reschedule Events
// ---------------------------------------------------------------------------

export interface BookingRescheduledEvent extends BaseBookingEvent {
  type: "BOOKING_RESCHEDULED";
  payload: {
    previousSlotId: string;
    newSlotId: string;
    newSlotDatetime: string; // ISO 8601
    newReservationId: string;
    rescheduleCount: number;
  };
}

export interface BookingRescheduleFailedEvent extends BaseBookingEvent {
  type: "BOOKING_RESCHEDULE_FAILED";
  payload: {
    reason: "new_slot_unavailable" | "reservation_failed" | "db_error";
    retryable: boolean;
  };
}

// ---------------------------------------------------------------------------
// PHASE 6 — Cancellation Events
// ---------------------------------------------------------------------------

export interface BookingCancelledEvent extends BaseBookingEvent {
  type: "BOOKING_CANCELLED";
  payload: {
    reservationId: string | null;
    reason: string;
    cancelledAt: string; // ISO 8601
  };
}

export interface BookingCancellationFailedEvent extends BaseBookingEvent {
  type: "BOOKING_CANCELLATION_FAILED";
  payload: {
    reason: "db_error" | "network_error";
    retryable: boolean;
  };
}

// ---------------------------------------------------------------------------
// PHASE 7 — Notification Events
// ---------------------------------------------------------------------------

export interface NotificationQueuedEvent extends BaseBookingEvent {
  type: "NOTIFICATION_QUEUED";
  payload: {
    notificationId: string;
    notificationType: string;
  };
}

export interface NotificationSentEvent extends BaseBookingEvent {
  type: "NOTIFICATION_SENT";
  payload: {
    notificationId: string;
    sentAt: string; // ISO 8601
  };
}

export interface NotificationFailedEvent extends BaseBookingEvent {
  type: "NOTIFICATION_FAILED";
  payload: {
    notificationId: string;
    reason: string;
    retryCount: number;
  };
}

// ---------------------------------------------------------------------------
// Payment Events (infrastructure-ready, Sprint 3.5 implementation)
// ---------------------------------------------------------------------------

export interface PaymentStartedEvent extends BaseBookingEvent {
  type: "PAYMENT_STARTED";
  payload: {
    amount: number;
    currency: string;
    paymentProvider: string;
  };
}

export interface PaymentCompletedEvent extends BaseBookingEvent {
  type: "PAYMENT_COMPLETED";
  payload: {
    transactionId: string;
    amount: number;
    paidAt: string; // ISO 8601
  };
}

export interface PaymentFailedEvent extends BaseBookingEvent {
  type: "PAYMENT_FAILED";
  payload: {
    reason: string;
    retryable: boolean;
    failedAt: string; // ISO 8601
  };
}

// ---------------------------------------------------------------------------
// BookingEventType — all valid event type strings
// ---------------------------------------------------------------------------

export type BookingEventType =
  | "BOOKING_SESSION_STARTED"
  | "SESSION_TERMINATED"
  | "BOOKING_SESSION_RECOVERED"
  | "SPECIALIST_SELECTED"
  | "SLOT_SELECTED"
  | "SLOT_RESERVED"
  | "SLOT_RELEASED"
  | "SLOT_RESERVATION_EXPIRED"
  | "BOOKING_CONFIRMED"
  | "BOOKING_CONFIRMATION_FAILED"
  | "BOOKING_RESCHEDULED"
  | "BOOKING_RESCHEDULE_FAILED"
  | "BOOKING_CANCELLED"
  | "BOOKING_CANCELLATION_FAILED"
  | "BOOKING_EXPIRED"
  | "NOTIFICATION_QUEUED"
  | "NOTIFICATION_SENT"
  | "NOTIFICATION_FAILED"
  | "PAYMENT_STARTED"
  | "PAYMENT_COMPLETED"
  | "PAYMENT_FAILED";

// ---------------------------------------------------------------------------
// AnyBookingEvent — complete discriminated union (Sprint 3.4: COMPLETE)
// ---------------------------------------------------------------------------

export type AnyBookingEvent =
  | BookingSessionStartedEvent
  | BookingSessionTerminatedEvent
  | BookingSessionRecoveredEvent
  | SpecialistSelectedEvent
  | SlotSelectedEvent
  | SlotReservedEvent
  | SlotReleasedEvent
  | SlotReservationExpiredEvent
  | BookingConfirmedEvent
  | BookingConfirmationFailedEvent
  | BookingRescheduledEvent
  | BookingRescheduleFailedEvent
  | BookingCancelledEvent
  | BookingCancellationFailedEvent
  | NotificationQueuedEvent
  | NotificationSentEvent
  | NotificationFailedEvent
  | PaymentStartedEvent
  | PaymentCompletedEvent
  | PaymentFailedEvent;

// ---------------------------------------------------------------------------
// BookingEventBus — singleton event bus
// ---------------------------------------------------------------------------

type EventHandler<T extends AnyBookingEvent = AnyBookingEvent> = (
  event: T
) => void;

class BookingEventBus {
  private readonly handlers = new Map<string, Set<EventHandler>>();

  subscribe<T extends AnyBookingEvent>(
    eventType: T["type"],
    handler: EventHandler<T>
  ): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler as EventHandler);

    // Return unsubscribe function
    return () => {
      this.handlers.get(eventType)?.delete(handler as EventHandler);
    };
  }

  emit(event: AnyBookingEvent): void {
    // queueMicrotask for safe async dispatch — prevents re-render loops
    queueMicrotask(() => {
      const handlers = this.handlers.get(event.type);
      if (!handlers) return;
      handlers.forEach((handler) => {
        try {
          handler(event);
        } catch (err) {
          console.error(`[BookingEventBus] Handler error for ${event.type}:`, err);
        }
      });
    });
  }

  /** Clear all handlers — use in tests only */
  _clearAll(): void {
    this.handlers.clear();
  }
}

/** Singleton — one bus per application lifetime */
export const bookingEventBus = new BookingEventBus();

/** Stable event ID generator */
export function generateEventId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `evt_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}
