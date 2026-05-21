/**
 * consultationBookingTypes.ts — Sprint 3.4 + 3.4.1 Build Stabilization
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * DUAL PURPOSE — DO NOT SPLIT
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * This file is the authoritative source for TWO domains:
 *
 * SECTION A — Runtime Session Types (Sprint 3.1 → 3.3)
 *   ConsultationBookingSession, ConsultationBookingRepository,
 *   isSessionExpired(), BookingRecoveryReason, BookingLifecyclePhase,
 *   BookingEntitlementType, BookingEntryPoint
 *
 *   Used by:
 *     - ConsultationBookingRepository.ts (repositories/)
 *     - ConsultationBookingContext.tsx (contexts/)
 *     - BookingReviewPage.tsx (pages/)
 *     - bookingPersistenceTypes.ts (types/)
 *
 * SECTION B — DB Persistence Types (Sprint 3.4)
 *   ConsultationRecord, SlotReservationRecord, ConsultationEventRecord,
 *   all DTOs (ConfirmBookingInput, etc.)
 *
 *   Used by:
 *     - ConsultationRepository.ts (repositories/)
 *     - SlotReservationRepository.ts (repositories/)
 *     - BookingConfirmationOrchestrator.ts (orchestrators/)
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * SPRINT 3.4.1 BUILD FIX
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Sprint 3.4 rewrote this file as a DB schema mirror, inadvertently removing
 * all runtime session types. This caused build error:
 *   "isSessionExpired is not exported by consultationBookingTypes.ts"
 *
 * This patch restores the runtime types (SECTION A) alongside DB types (SECTION B).
 * isSessionExpired() is the SINGLE authoritative implementation.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ===========================================================================
// SECTION A — Runtime Session Types
// Source of truth: all runtime booking session shapes live here.
// ===========================================================================

// ─── A1. Booking Lifecycle Phase (runtime state machine) ─────────────────────

/**
 * BookingLifecyclePhase — runtime workflow phase of the booking session.
 *
 * ARCHITECTURE NOTE:
 *   This is the state machine phase lived in React Context + sessionStorage.
 *   Separate from BookingFlowPhase (below) which mirrors the DB column.
 *
 * Used by:
 *   - ConsultationBookingContext (transitionTo)
 *   - bookingPersistenceTypes.ts (workflowPhase field)
 *   - BookingConfirmationOrchestrator
 */
export type BookingLifecyclePhase =
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

// ─── A2. Booking Entry Point ──────────────────────────────────────────────────

/**
 * BookingEntryPoint — how the user arrived at the booking flow.
 *
 * Used by:
 *   - ConsultationBookingSession (entryPoint field)
 *   - bookingPersistenceTypes.ts (AuthoritativeBookingRecord.entryPoint)
 */
export type BookingEntryPoint =
  | "assessment_result"
  | "direct_booking"
  | "follow_up"
  | "returning_user";

// ─── A3. Booking Entitlement Type ─────────────────────────────────────────────

/**
 * BookingEntitlementType — what kind of consultation the user is entitled to.
 *
 * Used by:
 *   - ConsultationBookingSession (entitlementType field)
 *   - bookingPersistenceTypes.ts (AuthoritativeBookingRecord.entitlementType)
 *   - BookingReviewPage (EntitlementBadge)
 */
export type BookingEntitlementType =
  | "free_first_consultation"
  | "paid_consultation"
  | "package_session"
  | "follow_up";

// ─── A4. Booking Recovery Reason ─────────────────────────────────────────────

/**
 * BookingRecoveryReason — taxonomy of reasons for session invalidation.
 *
 * ARCHITECTURE RULE:
 *   Always use this taxonomy — never raw strings.
 *   Enables structured audit trail + analytics.
 *
 * Used by:
 *   - ConsultationBookingRepository.invalidate()
 *   - ConsultationBookingSession.recoveryState.reason
 *   - ConsultationBookingContext.expireBooking()
 */
export type BookingRecoveryReason =
  | "ttl_expired"              // session exceeded TTL
  | "user_cancelled"           // user explicitly cancelled
  | "eligibility_denied"       // eligibility check failed mid-flow
  | "payment_failed"           // payment step failed
  | "confirmation_failed"      // orchestrator confirmation failed
  | "session_ttl_exceeded"     // session storage TTL hit
  | "corrupt_payload"          // JSON parse failed
  | "manual_invalidation"      // admin/system forced invalidation
  | "reschedule_failed"        // reschedule attempt failed
  | "network_error"            // network failure during critical step
  | "unknown";                 // fallback

// ─── A5. Session Recovery State ──────────────────────────────────────────────

export interface BookingSessionRecoveryState {
  /** Current recovery posture */
  status: "fresh" | "recovering" | "recovered" | "invalidated" | "expired";
  /** Reason — only set when status !== 'fresh' */
  reason?: BookingRecoveryReason;
  /** ISO 8601 timestamp of last recovery attempt */
  recoveredAt?: string;
  /** Human-readable audit note */
  auditNote?: string;
}

// ─── A6. Consultation Booking Session ────────────────────────────────────────

/**
 * ConsultationBookingSession — the runtime session shape.
 *
 * Lives in sessionStorage via ConsultationBookingRepository.
 * Hydrated into React Context via ConsultationBookingContext.
 *
 * ARCHITECTURE RULES:
 *   - Immutable after creation: sessionId, sourceIntentId, createdAt
 *   - Mutable fields updated through orchestrator only
 *   - bookingFlowPhase is the runtime state machine phase
 *   - bookingStatus mirrors DB status (set after persistence)
 *
 * Sprint 3.4.1:
 *   reservationId added — set by SlotReservationOrchestrator.
 */
export interface ConsultationBookingSession {
  // ── Immutable Identity ──────────────────────────────────────────────────
  readonly sessionId: string;       // UUID — matches active booking record id
  readonly sourceIntentId: string;  // ConsultationIntent.id
  readonly createdAt: string;       // ISO 8601

  // ── Lifecycle State ─────────────────────────────────────────────────────
  bookingFlowPhase: BookingLifecyclePhase;
  bookingStatus: "DRAFT" | "SLOT_SELECTED" | "CONFIRMING" | "CONFIRMED"
               | "CONFIRMATION_FAILED" | "CANCELLING" | "CANCELLED"
               | "RESCHEDULE_REQUESTED" | "RESCHEDULED" | "EXPIRED";

  // ── Booking Data ────────────────────────────────────────────────────────
  entryPoint: BookingEntryPoint;
  entitlementType: BookingEntitlementType;
  selectedSpecialistId: string | null;
  selectedSlotId: string | null;

  /**
   * Slot reservation ID — set by SlotReservationOrchestrator.
   * Required by BookingConfirmationOrchestrator for confirmation.
   * null until slot is successfully reserved.
   */
  reservationId: string | null;

  // ── Timestamps ──────────────────────────────────────────────────────────
  expiresAt: string;    // ISO 8601 — session TTL
  updatedAt: string;    // ISO 8601

  // ── Recovery ────────────────────────────────────────────────────────────
  recoveryState: BookingSessionRecoveryState;

  // ── Optional assessment context ─────────────────────────────────────────
  assessmentSessionId?: string;
}

// ─── A7. ConsultationBookingRepository interface ─────────────────────────────

/**
 * ConsultationBookingRepository — contract for session storage implementation.
 *
 * Sprint 3.3: repositories/ConsultationBookingRepository.ts implements this.
 * lib/consultationBookingRepository.ts is the legacy implementation.
 */
export interface ConsultationBookingRepository {
  save(session: ConsultationBookingSession): void;
  load(sessionId: string): ConsultationBookingSession | null;
  setActive(sessionId: string): void;
  getActiveId(): string | null;
  loadActive(): ConsultationBookingSession | null;
  /** @deprecated use loadActive() */
  loadLatest(): ConsultationBookingSession | null;
  invalidate(sessionId: string, reason: BookingRecoveryReason): void;
  clearActive(): void;
  clear(): void;
}

// ─── A8. isSessionExpired ─────────────────────────────────────────────────────

/**
 * isSessionExpired — single authoritative implementation.
 *
 * AUTHORITY RULE:
 *   This is the ONLY place where session TTL is evaluated.
 *   Do NOT duplicate this logic anywhere else.
 *
 * Returns true if the session's expiresAt timestamp has passed.
 * Adds a 5-second grace period to account for clock skew.
 *
 * Used by:
 *   - repositories/ConsultationBookingRepository.ts (load method)
 *   - contexts/ConsultationBookingContext.tsx (expiry guard)
 *   - pages/BookingReviewPage.tsx (expiry redirect guard)
 */
export function isSessionExpired(session: ConsultationBookingSession): boolean {
  const GRACE_PERIOD_MS = 5_000; // 5 seconds — guards against clock skew
  const expiresAt = new Date(session.expiresAt).getTime();
  return Date.now() > expiresAt + GRACE_PERIOD_MS;
}

// ===========================================================================
// SECTION B — DB Persistence Types
// Source of truth: Supabase table schema mirrors.
// ===========================================================================

// ─── B1. Enums — DB-level status values ──────────────────────────────────────

/** Status progression for a consultation booking */
export type ConsultationStatus =
  | "DRAFT"           // intent created, not yet booked
  | "SLOT_SELECTED"   // specialist + slot chosen
  | "CONFIRMING"      // confirmation in progress
  | "CONFIRMED"       // transactional entity — persisted
  | "CONFIRMATION_FAILED"
  | "CANCELLING"
  | "CANCELLED"
  | "CANCELLATION_FAILED"
  | "RESCHEDULE_REQUESTED"
  | "RESCHEDULE_IN_PROGRESS"
  | "RESCHEDULED"
  | "EXPIRED"
  | "COMPLETED";

/** Reservation lifecycle for slot ownership */
export type ReservationStatus =
  | "PENDING"
  | "RESERVED"
  | "CONFIRMED"
  | "RELEASED"
  | "EXPIRED";

/**
 * BookingFlowPhase — DB column `booking_phase`.
 *
 * NOTE: This mirrors the DB enum. For runtime state machine use BookingLifecyclePhase (above).
 * They are intentionally identical in shape — kept separate to allow future divergence.
 */
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

// ─── B2. DB Record Types ──────────────────────────────────────────────────────

/**
 * ConsultationRecord — mirrors `consultations` table.
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
  created_at: string;
  updated_at: string;
  expires_at: string | null;
  confirmed_at: string | null;
  cancelled_at: string | null;
  rescheduled_from: string | null;
  is_free_consultation: boolean;
  cancellation_reason: string | null;
  reschedule_count: number;
  ownership_token: string | null;
}

/**
 * SlotReservationRecord — mirrors `slot_reservations` table.
 */
export interface SlotReservationRecord {
  id: string;
  slot_id: string;
  user_id: string;
  consultation_id: string | null;
  status: ReservationStatus;
  reserved_until: string;
  released_at: string | null;
  created_at: string;
}

/**
 * ConsultationEventRecord — mirrors `consultation_events` table.
 * Append-only audit log.
 */
export interface ConsultationEventRecord {
  id: string;
  consultation_id: string;
  event_type: ConsultationAuditEventType;
  payload: Record<string, unknown>;
  created_at: string;
}

// ─── B3. Audit Event Types ─────────────────────────────────────────────────────

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

// ─── B4. Service Input/Output DTOs ───────────────────────────────────────────

export interface ReserveSlotInput {
  slotId: string;
  userId: string;
  consultationId?: string;
  ttlMinutes?: number;
}

export interface ConfirmBookingInput {
  consultationId: string;
  userId: string;
  reservationId: string;
  ownershipToken: string;
}

export interface CancelBookingInput {
  consultationId: string;
  userId: string;
  reason?: string;
}

export interface RescheduleBookingInput {
  consultationId: string;
  userId: string;
  newSlotId: string;
  currentReservationId: string;
}

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

// ─── B5. Specialist & Slot read models ────────────────────────────────────────

export interface SpecialistDisplayModel {
  id: string;
  name: string;
  title: string;
  avatarUrl: string | null;
}

export interface SlotDisplayModel {
  id: string;
  datetime: string;
  durationMinutes: number;
  isOnline: boolean;
  locationLabel: string | null;
}
