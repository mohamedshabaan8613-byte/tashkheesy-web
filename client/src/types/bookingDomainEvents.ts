/**
 * bookingDomainEvents.ts — Sprint 3.4.1 Resolved
 *
 * CONFLICT RESOLUTION (PR #72):
 *   HEAD  added: BookingReviewReachedEvent, BOOKING_REVIEW_REACHED in union
 *   BASE (main) had: BookingExpiredEvent, BOOKING_EXPIRED in union
 *   RESOLVED: superset — both are included.
 *
 * Sprint 3.4.1 additions:
 *   + BookingReviewReachedEvent     — emitted by BookingReviewPage on mount
 *   + BOOKING_REVIEW_REACHED        — added to BookingEventType union
 *   + BookingSessionCreatedEvent    — emitted by startBookingSession()
 *   + BookingRecoveredEvent         — emitted by recovery on mount
 *   + BookingPhaseTransitionedEvent — emitted by transitionTo()
 *   + BookingExpiredEvent           — emitted by expireBooking() / expiration poll
 *   + publish() alias               — alias for emit()
 *   + createBookingEvent<T>()       — typed factory helper
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

/**
 * BookingSessionCreatedEvent — emitted by startBookingSession() in Context.
 * Distinct from BOOKING_SESSION_STARTED which is for the legacy event shape.
 */
export interface BookingSessionCreatedEvent extends BaseBookingEvent {
  type: "BOOKING_SESSION_CREATED";
  payload: {
    entryPoint: string;
    entitlementType: string;
    assessmentSessionId?: string;
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

/**
 * BookingRecoveredEvent — emitted by ConsultationBookingContext on mount recovery.
 */
export interface BookingRecoveredEvent extends BaseBookingEvent {
  type: "BOOKING_RECOVERED";
  payload: {
    recoveredPhase: string;
    recoveredAt: string; // ISO 8601
  };
}

/**
 * BookingExpiredEvent — emitted by expireBooking() / expiration poll.
 */
export interface BookingExpiredEvent extends BaseBookingEvent {
  type: "BOOKING_EXPIRED";
  payload: {
    expiredPhase: string;
    expiredAt: string; // ISO 8601
  };
}

/**
 * BookingPhaseTransitionedEvent — emitted by transitionTo() in Context.
 * Single authoritative event for all lifecycle phase changes.
 */
export interface BookingPhaseTransitionedEvent extends BaseBookingEvent {
  type: "BOOKING_PHASE_TRANSITIONED";
  payload: {
    fromPhase: string;
    toPhase: string;
    triggeredBy: "orchestrator" | "recovery" | "expiration";
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
// Review Events — Sprint 3.4.1 Addition
// ---------------------------------------------------------------------------

/**
 * BookingReviewReachedEvent — emitted by BookingReviewPage on mount.
 *
 * Signals that the user has reached the review boundary with a valid
 * specialist + slot selection. Used by analytics and audit trail.
 *
 * ARCHITECTURE NOTE:
 *   This is an OBSERVATION event — it does NOT trigger a phase transition.
 *   The phase is already REVIEW when this page renders.
 *   transitionTo("REVIEW") is called by the orchestrator upstream.
 */
export interface BookingReviewReachedEvent extends BaseBookingEvent {
  type: "BOOKING_REVIEW_REACHED";
  payload: {
    specialistId: string;
    slotId: string;
    entitlementType: string;
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
  | "BOOKING_SESSION_CREATED"
  | "SESSION_TERMINATED"
  | "BOOKING_SESSION_RECOVERED"
  | "BOOKING_RECOVERED"
  | "BOOKING_EXPIRED"
  | "BOOKING_PHASE_TRANSITIONED"
  | "SPECIALIST_SELECTED"
  | "SLOT_SELECTED"
  | "BOOKING_REVIEW_REACHED"
  | "SLOT_RESERVED"
  | "SLOT_RELEASED"
  | "SLOT_RESERVATION_EXPIRED"
  | "BOOKING_CONFIRMED"
  | "BOOKING_CONFIRMATION_FAILED"
  | "BOOKING_RESCHEDULED"
  | "BOOKING_RESCHEDULE_FAILED"
  | "BOOKING_CANCELLED"
  | "BOOKING_CANCELLATION_FAILED"
  | "NOTIFICATION_QUEUED"
  | "NOTIFICATION_SENT"
  | "NOTIFICATION_FAILED"
  | "PAYMENT_STARTED"
  | "PAYMENT_COMPLETED"
  | "PAYMENT_FAILED";

// ---------------------------------------------------------------------------
// AnyBookingEvent — complete discriminated union (Sprint 3.4.1: COMPLETE)
// ---------------------------------------------------------------------------

export type AnyBookingEvent =
  | BookingSessionStartedEvent
  | BookingSessionCreatedEvent
  | BookingSessionTerminatedEvent
  | BookingSessionRecoveredEvent
  | BookingRecoveredEvent
  | BookingExpiredEvent
  | BookingPhaseTransitionedEvent
  | SpecialistSelectedEvent
  | SlotSelectedEvent
  | BookingReviewReachedEvent
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

  /**
   * publish() — alias for emit().
   *
   * ConsultationBookingContext and BookingReviewPage call publish().
   * Both emit() and publish() dispatch through the same queueMicrotask pipeline.
   * Use publish() in application code — emit() is the internal implementation.
   */
  publish(event: AnyBookingEvent): void {
    this.emit(event);
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

/**
 * createBookingEvent<T>() — typed event factory.
 *
 * Creates a fully-typed AnyBookingEvent with a stable ID and ISO timestamp.
 * Consumed by:
 *   - ConsultationBookingContext (startBookingSession, transitionTo, recoverSession)
 *   - BookingReviewPage (BOOKING_REVIEW_REACHED)
 *
 * Usage:
 *   const event = createBookingEvent("BOOKING_REVIEW_REACHED", sessionId, userId, {
 *     specialistId, slotId, entitlementType,
 *   });
 *   bookingEventBus.publish(event);
 *
 * TYPE CONTRACT:
 *   The payload parameter type is inferred from T["payload"].
 *   TypeScript will error at call site if the payload shape is wrong.
 */
export function createBookingEvent<T extends AnyBookingEvent>(
  type: T["type"],
  consultationId: string,
  userId: string,
  payload: T["payload"]
): T {
  return {
    id: generateEventId(),
    type,
    consultationId,
    userId,
    timestamp: new Date().toISOString(),
    payload,
  } as T;
}
