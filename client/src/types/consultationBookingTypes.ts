/**
 * consultationBookingTypes.ts — Sprint 3.4 Transactional Booking Types
 *
 * PHASE 1: Complete domain type definitions for:
 *   - ConsultationRecord (consultations table)
 *   - SlotReservationRecord (slot_reservations table)
 *   - ConsultationEventRecord (consultation_events table)
 *
 * ARCHITECTURE RULE:
 *   These types mirror the Supabase DB schema exactly.
 *   Runtime state machine types remain in consultationTypes.ts.
 *   Do NOT mix UI state with persistence types.
 */

// ---------------------------------------------------------------------------
// Enums — DB-level status values
// ---------------------------------------------------------------------------

/** Status progression for a consultation booking */
export type ConsultationStatus =
  | "DRAFT"           // intent created, not yet booked
  | "SLOT_SELECTED"   // specialist + slot chosen
  | "CONFIRMING"      // confirmation in progress
  | "CONFIRMED"       // transactional entity — persisted
  | "CONFIRMATION_FAILED" // confirmation attempt failed
  | "CANCELLING"      // cancellation in progress
  | "CANCELLED"       // cancelled, audit trail preserved
  | "CANCELLATION_FAILED"
  | "RESCHEDULE_REQUESTED"
  | "RESCHEDULE_IN_PROGRESS"
  | "RESCHEDULED"     // slot changed, same booking entity
  | "EXPIRED"         // TTL exceeded without confirmation
  | "COMPLETED";      // consultation took place

/** Reservation lifecycle for slot ownership */
export type ReservationStatus =
  | "PENDING"    // reservation initiated
  | "RESERVED"   // slot locked for this user
  | "CONFIRMED"  // booking confirmed — slot permanently assigned
  | "RELEASED"   // slot released (cancel/reschedule)
  | "EXPIRED";   // TTL exceeded without confirmation

/** Booking lifecycle phases — runtime state machine */
export type BookingFlowPhase =
  | "IDLE"
  | "SELECTING"
  | "SLOT_RESERVED"
  | "REVIEW"
  | "CONFIRMING"
  | "CONFIRMED"
  | "CONFIRMATION_FAILED"
  | "CANCELLING"
  | "CANCELLED"
  | "RESCHEDULE_REQUESTED"
  | "RESCHEDULE_IN_PROGRESS"
  | "RESCHEDULED"
  | "EXPIRED"
  | "SESSION_TERMINATED";

// ---------------------------------------------------------------------------
// DB Record Types — mirror Supabase table columns exactly
// ---------------------------------------------------------------------------

/**
 * ConsultationRecord — mirrors `consultations` table
 * Primary transactional entity after confirmation.
 */
export interface ConsultationRecord {
  id: string;
  user_id: string;
  status: ConsultationStatus;
  booking_phase: BookingFlowPhase;
  reservation_status: ReservationStatus | null;
  specialist_id: string | null;
  slot_id: string | null;
  created_at: string;        // ISO 8601
  updated_at: string;        // ISO 8601
  expires_at: string | null; // ISO 8601 — TTL for reservation
  confirmed_at: string | null;
  cancelled_at: string | null;
  rescheduled_from: string | null; // previous slot_id for audit
  is_free_consultation: boolean;   // one-free-consultation policy
  cancellation_reason: string | null;
  reschedule_count: number;        // audit: how many times rescheduled
  ownership_token: string | null;  // multi-tab safety
}

/**
 * SlotReservationRecord — mirrors `slot_reservations` table
 * Separate from booking — prevents double-booking at DB level.
 */
export interface SlotReservationRecord {
  id: string;
  slot_id: string;
  user_id: string;
  consultation_id: string | null; // null until booking confirmed
  status: ReservationStatus;
  reserved_until: string;  // ISO 8601 — TTL
  released_at: string | null;
  created_at: string;
}

/**
 * ConsultationEventRecord — mirrors `consultation_events` table
 * Append-only audit log. Never update, only insert.
 */
export interface ConsultationEventRecord {
  id: string;
  consultation_id: string;
  event_type: ConsultationAuditEventType;
  payload: Record<string, unknown>;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Audit Event Types — all trackable mutations
// ---------------------------------------------------------------------------

export type ConsultationAuditEventType =
  | "BOOKING_STARTED"
  | "SPECIALIST_SELECTED"
  | "SLOT_SELECTED"
  | "SLOT_RESERVED"
  | "SLOT_RELEASED"
  | "SLOT_RESERVATION_EXPIRED"
  | "BOOKING_REVIEW_REACHED"
  | "BOOKING_CONFIRMED"
  | "BOOKING_CONFIRMATION_FAILED"
  | "BOOKING_CANCELLED"
  | "BOOKING_CANCELLATION_FAILED"
  | "BOOKING_RESCHEDULED"
  | "BOOKING_RESCHEDULE_FAILED"
  | "BOOKING_EXPIRED"
  | "BOOKING_RECOVERED"
  | "NOTIFICATION_QUEUED"
  | "NOTIFICATION_SENT"
  | "NOTIFICATION_FAILED";

// ---------------------------------------------------------------------------
// Service Input/Output DTOs
// ---------------------------------------------------------------------------

/** Input for reserving a slot */
export interface ReserveSlotInput {
  slotId: string;
  userId: string;
  consultationId?: string;
  ttlMinutes?: number; // default: 15
}

/** Input for confirming a booking */
export interface ConfirmBookingInput {
  consultationId: string;
  userId: string;
  reservationId: string;
  ownershipToken: string;
}

/** Input for cancelling a booking */
export interface CancelBookingInput {
  consultationId: string;
  userId: string;
  reason?: string;
}

/** Input for rescheduling a booking */
export interface RescheduleBookingInput {
  consultationId: string;
  userId: string;
  newSlotId: string;
  currentReservationId: string;
}

/** Result of eligibility check */
export interface EligibilityResult {
  eligible: boolean;
  reason: EligibilityDenialReason | null;
  existingConsultationId: string | null;
  canReschedule: boolean;
}

export type EligibilityDenialReason =
  | "FREE_CONSULTATION_ALREADY_USED"
  | "ACTIVE_BOOKING_EXISTS"
  | "USER_BANNED"
  | "UNKNOWN";

/** Notification queue entry */
export interface NotificationQueueEntry {
  id: string;
  consultation_id: string;
  user_id: string;
  notification_type: NotificationType;
  payload: Record<string, unknown>;
  queued_at: string;
  sent_at: string | null;
  failed_at: string | null;
  retry_count: number;
}

export type NotificationType =
  | "BOOKING_CONFIRMED_EMAIL"
  | "BOOKING_CONFIRMED_SMS"
  | "BOOKING_CANCELLED_EMAIL"
  | "BOOKING_RESCHEDULED_EMAIL"
  | "REMINDER_24H"
  | "REMINDER_1H";

// ---------------------------------------------------------------------------
// Specialist & Slot types (read models)
// ---------------------------------------------------------------------------

/** Specialist display model for BookingReviewPage */
export interface SpecialistDisplayModel {
  id: string;
  name: string;
  title: string;
  avatarUrl: string | null;
}

/** Slot display model for BookingReviewPage */
export interface SlotDisplayModel {
  id: string;
  datetime: string;      // ISO 8601
  durationMinutes: number;
  isOnline: boolean;
  locationLabel: string | null;
}
