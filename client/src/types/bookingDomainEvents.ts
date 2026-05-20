/**
 * bookingDomainEvents.ts — Sprint 3.3 PHASE 1
 *
 * Domain Event System — Rule 7
 *
 * كل mutation مهم يُصدر domain event.
 * الأنظمة المستقبلية (analytics, notifications, CRM, audit) تستهلك هذه Events.
 * لا يُعرض BookingDomainEvent مباشرة للـ UI.
 *
 * RULE: الـ UI لا يستمع لهذه Events مباشرة.
 *       الـ Events للأنظمة الداخلية فقط.
 */

import type { BookingLifecyclePhase, BookingEntryPoint, BookingEntitlementType } from "./consultationBookingTypes";

// ─── Event Taxonomy ───────────────────────────────────────────────────────────
export type BookingEventType =
  | "BOOKING_SESSION_CREATED"
  | "BOOKING_PHASE_TRANSITIONED"
  | "SPECIALIST_SELECTED"
  | "SLOT_SELECTED"
  | "BOOKING_REVIEW_REACHED"
  | "BOOKING_CONFIRMED"
  | "BOOKING_CANCELLED"
  | "BOOKING_EXPIRED"
  | "BOOKING_ABANDONED"
  | "BOOKING_RECOVERED"
  | "SLOT_RESERVED"
  | "SLOT_RESERVATION_EXPIRED"
  | "PAYMENT_STARTED"
  | "PAYMENT_COMPLETED"
  | "PAYMENT_FAILED"
  | "BOOKING_RESCHEDULED"
  | "NOTIFICATION_QUEUED"
  | "NOTIFICATION_DELIVERED"
  | "NOTIFICATION_FAILED";

// ─── Base Event Shape ─────────────────────────────────────────────────────────
export interface BookingDomainEvent<
  T extends BookingEventType = BookingEventType,
  P extends Record<string, unknown> = Record<string, unknown>,
> {
  readonly eventType: T;
  readonly eventId: string;
  readonly sessionId: string;
  readonly sourceIntentId: string;
  readonly occurredAt: string;
  readonly payload: P;
}

// ─── Specific Event Shapes ────────────────────────────────────────────────────
export type BookingSessionCreatedEvent = BookingDomainEvent<
  "BOOKING_SESSION_CREATED",
  {
    entryPoint: BookingEntryPoint;
    entitlementType: BookingEntitlementType;
    assessmentSessionId?: string;
  }
>;

export type BookingPhaseTransitionedEvent = BookingDomainEvent<
  "BOOKING_PHASE_TRANSITIONED",
  {
    fromPhase: BookingLifecyclePhase;
    toPhase: BookingLifecyclePhase;
    triggeredBy: "orchestrator" | "recovery" | "expiration";
  }
>;

export type SpecialistSelectedEvent = BookingDomainEvent<
  "SPECIALIST_SELECTED",
  { specialistId: string; matchScore?: number }
>;

export type SlotSelectedEvent = BookingDomainEvent<
  "SLOT_SELECTED",
  { slotId: string; specialistId: string }
>;

export type BookingReviewReachedEvent = BookingDomainEvent<
  "BOOKING_REVIEW_REACHED",
  { specialistId: string; slotId: string; entitlementType: BookingEntitlementType }
>;

export type BookingConfirmedEvent = BookingDomainEvent<
  "BOOKING_CONFIRMED",
  {
    specialistId: string;
    slotId: string;
    reservationId: string;
    entitlementType: BookingEntitlementType;
    confirmedAt: string;
  }
>;

export type BookingCancelledEvent = BookingDomainEvent<
  "BOOKING_CANCELLED",
  { reason: string; cancelledAt: string; fromPhase: BookingLifecyclePhase }
>;

export type BookingExpiredEvent = BookingDomainEvent<
  "BOOKING_EXPIRED",
  { expiredAt: string; fromPhase: BookingLifecyclePhase; reason: string }
>;

export type BookingRecoveredEvent = BookingDomainEvent<
  "BOOKING_RECOVERED",
  { recoveredPhase: BookingLifecyclePhase; recoveredAt: string }
>;

// ─── Union of All Events ──────────────────────────────────────────────────────
export type AnyBookingEvent =
  | BookingSessionCreatedEvent
  | BookingPhaseTransitionedEvent
  | SpecialistSelectedEvent
  | SlotSelectedEvent
  | BookingReviewReachedEvent
  | BookingConfirmedEvent
  | BookingCancelledEvent
  | BookingExpiredEvent
  | BookingRecoveredEvent;

// ─── Event Bus (in-memory, async-safe) ───────────────────────────────────────
/**
 * BookingEventBus — pub/sub داخلي للـ domain events.
 *
 * RULE: المشتركون (subscribers) يجب أن يكونوا:
 *   - analytics pipeline
 *   - notification queue
 *   - audit logger
 *   - CRM sync (مستقبلاً)
 *
 * لا يُشترك الـ UI مباشرة — الـ UI يُحدَّث عبر Context state.
 * الـ EventBus للأنظمة الخلفية فقط.
 */
class BookingEventBus {
  private readonly handlers = new Map<BookingEventType, Array<(event: AnyBookingEvent) => void>>();

  subscribe<T extends BookingEventType>(
    eventType: T,
    handler: (event: Extract<AnyBookingEvent, { eventType: T }>) => void,
  ): () => void {
    const list = this.handlers.get(eventType) ?? [];
    const typedHandler = handler as (event: AnyBookingEvent) => void;
    list.push(typedHandler);
    this.handlers.set(eventType, list);
    return () => {
      const updated = (this.handlers.get(eventType) ?? []).filter((h) => h !== typedHandler);
      this.handlers.set(eventType, updated);
    };
  }

  publish(event: AnyBookingEvent): void {
    // async-safe: لا يبلوك booking flow
    queueMicrotask(() => {
      const handlers = this.handlers.get(event.eventType) ?? [];
      for (const handler of handlers) {
        try {
          handler(event);
        } catch (err) {
          console.error(`[BookingEventBus] Handler error for ${event.eventType}:`, err);
        }
      }
    });
  }

  clear(): void {
    this.handlers.clear();
  }
}

export const bookingEventBus = new BookingEventBus();

// ─── Event Factory ────────────────────────────────────────────────────────────
function generateEventId(): string {
  return `bev_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function createBookingEvent<
  T extends BookingEventType,
  P extends Record<string, unknown>,
>(
  eventType: T,
  sessionId: string,
  sourceIntentId: string,
  payload: P,
): BookingDomainEvent<T, P> {
  return {
    eventType,
    eventId: generateEventId(),
    sessionId,
    sourceIntentId,
    occurredAt: new Date().toISOString(),
    payload,
  };
}
