/**
 * consultationBookingTypes.ts — Sprint 3.4 + 3.4.1 Build Stabilization
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * DUAL PURPOSE — DO NOT SPLIT
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * SECTION A — Runtime Session Types (Sprint 3.1 → 3.3)
 *   BookingPhase, ConsultationBookingSession, ConsultationBookingRepository,
 *   isSessionExpired(), isValidTransition(), calculateBookingExpiry(),
 *   generateBookingSessionId(), RECOVERABLE_PHASES, TERMINAL_PHASES,
 *   BookingRecoveryReason, BookingRecoveryState, RuntimeSafetyResult,
 *   SpecialistRecommendation, BookingEntitlementType, BookingEntryPoint
 *
 * SECTION B — DB Persistence Types (Sprint 3.4)
 *   ConsultationRecord, SlotReservationRecord, ConsultationEventRecord,
 *   all DTOs (ConfirmBookingInput, etc.)
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * SPRINT 3.4.1 BUILD FIX — Deploy 3 patch
 * ─────────────────────────────────────────────────────────────────────────────
 * ConsultationBookingContext.tsx imports:
 *   RECOVERABLE_PHASES, TERMINAL_PHASES, calculateBookingExpiry,
 *   generateBookingSessionId, isValidTransition, BookingPhase,
 *   BookingRecoveryState, RuntimeSafetyResult, SpecialistRecommendation
 *
 * None of these existed in the Deploy 2 patch. This patch adds them all.
 *
 * AUTHORITY RULES:
 *   BookingPhase            → single source: this file (canonical runtime alias)
 *   isSessionExpired        → single source: this file
 *   isValidTransition       → single source: this file
 *   RECOVERABLE_PHASES      → single source: this file
 *   TERMINAL_PHASES         → single source: this file
 *   calculateBookingExpiry  → single source: this file
 *   generateBookingSessionId → single source: this file
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ===========================================================================
// SECTION A — Runtime Session Types
// ===========================================================================

// ─── A1. BookingPhase — canonical runtime phase name ─────────────────────────

/**
 * BookingPhase — canonical name for the runtime booking state machine phase.
 *
 * Used throughout the runtime layer (Context, Repository, orchestrators).
 * BookingLifecyclePhase is an alias — prefer BookingPhase in new code.
 *
 * "CREATED" is the initial phase when a new session is started.
 */
export type BookingPhase =
  | "CREATED"
  | "IDLE"
  | "SPECIALIST_SELECTION"
  | "SLOT_SELECTION"
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

/**
 * BookingLifecyclePhase — legacy alias for BookingPhase.
 * Kept for backward compatibility with Sprint 3.1–3.3 code.
 * @deprecated Use BookingPhase in new code.
 */
export type BookingLifecyclePhase = BookingPhase;

// ─── A2. Phase Sets — state machine constants ─────────────────────────────────

/**
 * RECOVERABLE_PHASES — phases from which a session can be recovered on refresh.
 *
 * AUTHORITY RULE: single source — do not duplicate in components or hooks.
 *
 * A session is recoverable if:
 *   1. It hasn't expired (isSessionExpired() → false)
 *   2. Its phase is in this set
 */
export const RECOVERABLE_PHASES: ReadonlySet<BookingPhase> = new Set<BookingPhase>([
  "CREATED",
  "SPECIALIST_SELECTION",
  "SLOT_SELECTION",
  "SLOT_RESERVED",
  "REVIEW",
  "CONFIRMING",
  "CONFIRMATION_FAILED",
]);

/**
 * TERMINAL_PHASES — phases that cannot transition further.
 *
 * AUTHORITY RULE: single source — do not duplicate in components or hooks.
 *
 * Terminal sessions must not be recovered or reused.
 */
export const TERMINAL_PHASES: ReadonlySet<BookingPhase> = new Set<BookingPhase>([
  "CONFIRMED",
  "CANCELLED",
  "RESCHEDULED",
  "EXPIRED",
  "SESSION_TERMINATED",
]);

// ─── A3. State Machine — valid transitions ────────────────────────────────────

/**
 * VALID_TRANSITIONS — exhaustive map of allowed phase transitions.
 *
 * AUTHORITY RULE: single source — do not inline transition logic elsewhere.
 * Use isValidTransition() to check before calling transitionTo().
 */
const VALID_TRANSITIONS: Readonly<Record<BookingPhase, ReadonlyArray<BookingPhase>>> = {
  CREATED:                ["SPECIALIST_SELECTION", "SLOT_SELECTION", "SLOT_RESERVED", "REVIEW", "CANCELLED", "EXPIRED"],
  IDLE:                   ["SPECIALIST_SELECTION", "CANCELLED", "EXPIRED"],
  SPECIALIST_SELECTION:   ["SLOT_SELECTION", "CANCELLED", "EXPIRED"],
  SLOT_SELECTION:         ["SLOT_RESERVED", "SPECIALIST_SELECTION", "CANCELLED", "EXPIRED"],
  SLOT_RESERVED:          ["REVIEW", "SLOT_SELECTION", "CANCELLING", "EXPIRED"],
  REVIEW:                 ["CONFIRMING", "SLOT_SELECTION", "CANCELLING", "EXPIRED"],
  CONFIRMING:             ["CONFIRMED", "CONFIRMATION_FAILED", "EXPIRED"],
  CONFIRMED:              ["RESCHEDULE_REQUESTED", "CANCELLING"],
  CONFIRMATION_FAILED:    ["CONFIRMING", "CANCELLING", "EXPIRED"],
  CANCELLING:             ["CANCELLED", "CONFIRMED"],     // CONFIRMED = rollback on cancel failure
  CANCELLED:              [],
  RESCHEDULE_REQUESTED:   ["RESCHEDULE_IN_PROGRESS", "CONFIRMED", "CANCELLING"],
  RESCHEDULE_IN_PROGRESS: ["RESCHEDULED", "CONFIRMED", "CANCELLING"],
  RESCHEDULED:            ["RESCHEDULE_REQUESTED", "CANCELLING"],
  EXPIRED:                [],
  SESSION_TERMINATED:     [],
};

/**
 * isValidTransition — checks if a phase transition is allowed by the state machine.
 *
 * AUTHORITY RULE: single source — always use this before calling transitionTo().
 */
export function isValidTransition(from: BookingPhase, to: BookingPhase): boolean {
  return (VALID_TRANSITIONS[from] as ReadonlyArray<BookingPhase>).includes(to);
}

// ─── A4. Booking Entry Point ──────────────────────────────────────────────────

export type BookingEntryPoint =
  | "assessment_result"
  | "direct_booking"
  | "follow_up"
  | "returning_user";

// ─── A5. Booking Entitlement Type ─────────────────────────────────────────────

export type BookingEntitlementType =
  | "free_first_consultation"
  | "paid_consultation"
  | "package_session"
  | "follow_up";

// ─── A6. Booking Recovery Reason ─────────────────────────────────────────────

/**
 * BookingRecoveryReason — taxonomy of reasons for session invalidation.
 *
 * AUTHORITY RULE: always use this taxonomy — never raw strings.
 */
export type BookingRecoveryReason =
  | "ttl_expired"
  | "user_cancelled"
  | "eligibility_denied"
  | "payment_failed"
  | "confirmation_failed"
  | "session_ttl_exceeded"
  | "corrupt_payload"
  | "manual_invalidation"
  | "reschedule_failed"
  | "network_error"
  | "mount_ttl_check"      // checked at Provider mount
  | "expiration_poll"      // caught by polling interval
  | "page_refresh"         // session recovered after refresh
  | "unknown";

// ─── A7. Booking Recovery State ───────────────────────────────────────────────

/**
 * BookingRecoveryState — runtime recovery metadata stored on the session.
 *
 * Used by ConsultationBookingContext (recovery on mount).
 * BookingSessionRecoveryState is an alias.
 */
export interface BookingRecoveryState {
  status: "fresh" | "recovering" | "recovered" | "invalidated" | "expired";
  reason?: BookingRecoveryReason;
  recoveredAt?: string;
  recoveredPhase?: BookingPhase;
  auditNote?: string;
}

/** @deprecated Use BookingRecoveryState */
export type BookingSessionRecoveryState = BookingRecoveryState;

// ─── A8. Specialist Recommendation ───────────────────────────────────────────

/**
 * SpecialistRecommendation — optional pre-selection hint from assessment.
 *
 * Passed to startBookingSession() when coming from an assessment result.
 * Stored on the session for pre-filling the specialist selection step.
 */
export interface SpecialistRecommendation {
  specialistId: string;
  confidenceScore?: number;
  reason?: string;
}

// ─── A9. Consultation Booking Session ────────────────────────────────────────

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
 */
export interface ConsultationBookingSession {
  // ── Immutable Identity ──────────────────────────────────────────────────
  readonly sessionId: string;
  readonly sourceIntentId: string;
  /**
   * consultationIntentId — readonly alias for sourceIntentId.
   * Kept for backward compatibility with Sprint 3.1 code.
   * @deprecated Use sourceIntentId.
   */
  readonly consultationIntentId: string;
  readonly createdAt: string;
  readonly lifecycleVersion: "v1";

  // ── Lifecycle State ─────────────────────────────────────────────────────
  bookingFlowPhase: BookingPhase;
  bookingStatus: string;

  // ── Booking Data ────────────────────────────────────────────────────────
  entryPoint: BookingEntryPoint;
  entitlementType: BookingEntitlementType;
  selectedSpecialistId?: string | null;
  selectedSlotId?: string | null;
  reservationId?: string | null;
  specialistRecommendation?: SpecialistRecommendation;

  // ── Timestamps ──────────────────────────────────────────────────────────
  expiresAt: string;
  lastActivityAt: string;
  updatedAt?: string;

  // ── Recovery ────────────────────────────────────────────────────────────
  recoveryState: BookingRecoveryState;

  // ── Optional assessment context ─────────────────────────────────────────
  assessmentSessionId?: string;
}

// ─── A10. ConsultationBookingRepository interface ─────────────────────────────

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

// ─── A11. RuntimeSafetyResult ─────────────────────────────────────────────────

/**
 * RuntimeSafetyResult — return type of runtimeSafetyCheck().
 *
 * Returned by ConsultationBookingContext.runtimeSafetyCheck().
 * Used by pages before critical operations (confirm, cancel, etc.).
 */
export interface RuntimeSafetyResult {
  status: "valid" | "missing" | "expired" | "corrupt";
  currentPhase: BookingPhase | null;
  diagnosticNote: string;
}

// ─── A12. isSessionExpired ─────────────────────────────────────────────────────

/**
 * isSessionExpired — single authoritative TTL check.
 *
 * AUTHORITY RULE: do NOT duplicate this logic anywhere else.
 * Adds a 5-second grace period to account for clock skew.
 */
export function isSessionExpired(session: ConsultationBookingSession): boolean {
  const GRACE_PERIOD_MS = 5_000;
  const expiresAt = new Date(session.expiresAt).getTime();
  return Date.now() > expiresAt + GRACE_PERIOD_MS;
}

// ─── A13. calculateBookingExpiry ──────────────────────────────────────────────

/**
 * calculateBookingExpiry — computes session TTL timestamp.
 *
 * AUTHORITY RULE: single source — do not inline TTL math elsewhere.
 * Default TTL: 2 hours from now.
 */
export function calculateBookingExpiry(ttlMinutes = 120): string {
  return new Date(Date.now() + ttlMinutes * 60 * 1000).toISOString();
}

// ─── A14. generateBookingSessionId ───────────────────────────────────────────

/**
 * generateBookingSessionId — generates a new UUID for a booking session.
 *
 * AUTHORITY RULE: single source — do not inline UUID generation elsewhere.
 * Uses crypto.randomUUID() when available, falls back to Math.random().
 */
export function generateBookingSessionId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ===========================================================================
// SECTION B — DB Persistence Types
// Source of truth: Supabase table schema mirrors.
// ===========================================================================

// ─── B1. Enums — DB-level status values ──────────────────────────────────────

export type ConsultationStatus =
  | "DRAFT"
  | "SLOT_SELECTED"
  | "CONFIRMING"
  | "CONFIRMED"
  | "CONFIRMATION_FAILED"
  | "CANCELLING"
  | "CANCELLED"
  | "CANCELLATION_FAILED"
  | "RESCHEDULE_REQUESTED"
  | "RESCHEDULE_IN_PROGRESS"
  | "RESCHEDULED"
  | "EXPIRED"
  | "COMPLETED";

export type ReservationStatus =
  | "PENDING"
  | "RESERVED"
  | "CONFIRMED"
  | "RELEASED"
  | "EXPIRED";

/**
 * BookingFlowPhase — DB column `booking_phase`.
 * Mirrors the DB enum. For runtime use BookingPhase (above).
 */
export type BookingFlowPhase = BookingPhase;

// ─── B2. DB Record Types ──────────────────────────────────────────────────────

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
