/**
 * consultationBookingTypes.ts — Sprint 3.7.1 Phase 3
 *
 * CONFLICT RESOLUTION (PR #72):
 *   Accepted main (BASE) as the authoritative version.
 *   main contains the complete runtime contract restored in the Sprint 3.4.1 fix,
 *   including all symbols consumed by ConsultationBookingContext:
 *     BookingPhase, RECOVERABLE_PHASES, TERMINAL_PHASES, isValidTransition(),
 *     calculateBookingExpiry(), generateBookingSessionId(), BookingRecoveryState,
 *     RuntimeSafetyResult, SpecialistRecommendation, ConsultationBookingSession.
 *
 * ─── Sprint 3.7.1 Phase 3 additions ────────────────────────────────────────
 *
 * Gap A fix:
 *   + CONFIRMING added to BookingPhase union
 *   + CONFIRMATION_FAILED added to BookingPhase union
 *   Reason: BookingConfirmationOrchestrator calls transitionTo("CONFIRMING")
 *   and transitionTo("CONFIRMATION_FAILED") — both must be valid BookingPhase
 *   values or isValidTransition() will reject them at the type level.
 *
 * Gap B fix:
 *   + CONFIRMING added to ALLOWED_TRANSITIONS["REVIEW"]
 *   + CONFIRMATION_FAILED added to ALLOWED_TRANSITIONS["CONFIRMING"]
 *   + CONFIRMED added to ALLOWED_TRANSITIONS["CONFIRMING"]
 *   Reason: Without this, transitionTo("CONFIRMING") from REVIEW and
 *   transitionTo("CONFIRMED") from CONFIRMING both fail isValidTransition()
 *   silently — the orchestrator's 9-step chain breaks at step 1.
 *
 * Root-1 fix (backward-compat aliases — no logic change):
 *   + ConsultationEntryPoint      → alias to BookingEntryPoint
 *   + BookingInterruptionReason   → alias to BookingRecoveryReason
 *   + BOOKING_RECOVERABLE_PHASES  → re-export of RECOVERABLE_PHASES
 *   + BOOKING_TERMINAL_PHASES     → re-export of TERMINAL_PHASES
 *   + BookingRecoveryState.wasRecovered     (optional boolean)
 *   + BookingRecoveryState.recoveryAttempts (optional number)
 *   These aliases allow consultationBookingRepository.ts to compile without
 *   any changes to the consumer file.
 *
 * ARCHITECTURE RULE:
 *   These types mirror the Supabase DB schema exactly.
 *   Runtime state machine types remain in consultationTypes.ts.
 *   Do NOT mix UI state with persistence types.
 *
 * ─── SPRINT 3.4 NOTE ────────────────────────────────────────────────────────
 * The bottom section of this file preserves the runtime session types and
 * utility functions that were present before Sprint 3.4. These are required
 * by 6 consumer files across the codebase. They will be extracted to a
 * dedicated file (consultationBookingSessionTypes.ts) in Sprint 3.5.
 * ────────────────────────────────────────────────────────────────────────────
 */

// ===========================================================================
// SECTION A — DB Persistence Types (Sprint 3.4 additions)
// ===========================================================================

/** Status progression for a consultation booking */
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

/** Reservation lifecycle for slot ownership */
export type ReservationStatus =
  | "PENDING"
  | "RESERVED"
  | "CONFIRMED"
  | "RELEASED"
  | "EXPIRED";

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

/**
 * ConsultationRecord — mirrors `consultations` table
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
 * SlotReservationRecord — mirrors `slot_reservations` table
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
 * ConsultationEventRecord — mirrors `consultation_events` table
 * Append-only audit log.
 */
export interface ConsultationEventRecord {
  id: string;
  consultation_id: string;
  event_type: ConsultationAuditEventType;
  payload: Record<string, unknown>;
  created_at: string;
}

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

// ===========================================================================
// SECTION B — Runtime Session Types (preserved from Sprint 3.3)
// Sprint 3.5 TODO: extract to consultationBookingSessionTypes.ts
// ===========================================================================

export const LIFECYCLE_NOTE = "simplified_sprint_3.1" as const;

/**
 * BookingPhase — الاسم الكنسي الرسمي لحالة جلسة الحجز.
 *
 * Sprint 3.7.1 Phase 3:
 *   + CONFIRMING         — optimistic phase during orchestration (step 1 of 9)
 *   + CONFIRMATION_FAILED — rollback phase when any orchestration step fails
 *
 * Both phases are required by BookingConfirmationOrchestrator:
 *   transitionTo("CONFIRMING")          — called at orchestration start
 *   transitionTo("CONFIRMATION_FAILED") — called on any failure path
 *   transitionTo("CONFIRMED")           — called on success (step 9)
 */
export type BookingPhase =
  | "CREATED"
  | "SPECIALIST_SELECTION"
  | "SLOT_SELECTION"
  | "REVIEW"
  | "CONFIRMING"
  | "CONFIRMATION_FAILED"
  | "CONFIRMED"
  | "RESCHEDULED"
  | "COMPLETED"
  | "CANCELLED"
  | "EXPIRED"
  | "ABANDONED";

/**
 * BookingLifecyclePhase — alias لـ BookingPhase للتوافق مع الكود القائم.
 * استخدم BookingPhase في الكود الجديد.
 */
export type BookingLifecyclePhase = BookingPhase;

export const RECOVERABLE_PHASES: BookingPhase[] = [
  "SPECIALIST_SELECTION",
  "SLOT_SELECTION",
  "REVIEW",
  "CONFIRMATION_FAILED", // قابل للاسترداد — يسمح للمستخدم بإعادة المحاولة
];

export const TERMINAL_PHASES: BookingPhase[] = [
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
  "EXPIRED",
  "ABANDONED",
];

export type BookingEntryPoint =
  | "post_assessment"
  | "post_screening"
  | "specialist_match"
  | "direct_navigation"
  | "consultation_intro";

export type BookingEntitlementType =
  | "free_first_consultation"
  | "paid_consultation"
  | "package_session"
  | "follow_up";

export type BookingRecoveryReason =
  | "page_refresh"
  | "browser_back"
  | "tab_restore"
  | "ttl_expired"
  | "specialist_removed"
  | "specialist_unavailable"
  | "entitlement_invalidated"
  | "entitlement_expired"
  | "session_corrupted"
  | "user_cancelled"
  | "inactivity_timeout"
  | "orchestrator_validation"
  | "mount_ttl_check"
  | "expiration_poll"
  | "session_ttl_exceeded"
  | "guard_expired";

export type RecoveryExecution =
  | "AUTO"
  | "MANUAL"
  | "USER_CONFIRMATION_REQUIRED";

export type BookingRecoveryStatus =
  | "fresh"
  | "recovered"
  | "invalidated"
  | "rerouted"
  | "partial"
  | "failed";

export interface BookingRecoveryState {
  status: BookingRecoveryStatus;
  reason?: BookingRecoveryReason;
  recoveredAt?: string;
  recoveredPhase?: BookingPhase;
  auditNote?: string;
  /**
   * wasRecovered — backward-compat field for consultationBookingRepository.ts
   * Root-1 fix: added in Sprint 3.7.1 to resolve TS2353.
   * Derived from status === "recovered" when not explicitly set.
   */
  wasRecovered?: boolean;
  /**
   * recoveryAttempts — backward-compat field for consultationBookingRepository.ts
   * Root-1 fix: added in Sprint 3.7.1 to resolve TS2339.
   */
  recoveryAttempts?: number;
}

export type BookingDenialReason =
  | "entitlement_expired"
  | "already_active"
  | "validation_failed"
  | "assessment_expired"
  | "specialist_unavailable"
  | "payment_required"
  | "geo_restriction"
  | "parental_consent_required"
  | "unknown";

export type RecoveryAction =
  | "redirect_to_assessment"
  | "redirect_to_payment"
  | "show_retry_dialog"
  | "resume_active_booking"
  | "contact_support"
  | "none";

export type BookingInitializationResult =
  | {
      success: true;
      bookingSessionId: string;
      nextRoute: string;
      entitlementType: BookingEntitlementType;
      recoveryState?: BookingRecoveryState;
    }
  | {
      success: false;
      denialReason: BookingDenialReason;
      denialMessage: string;
      recoveryAction: RecoveryAction;
    };

export interface SpecialistRecommendation {
  specialistId: string;
  matchScore: number;
  matchReasons: string[];
  assessmentSessionId: string;
}

export type RuntimeSafetyStatus = "valid" | "expired" | "missing" | "corrupt";

export interface RuntimeSafetyResult {
  status: RuntimeSafetyStatus;
  currentPhase: BookingPhase | null;
  diagnosticNote: string;
}

export type SpecialistValidationStatus =
  | "valid"
  | "not_found"
  | "unavailable"
  | "entitlement_mismatch"
  | "blocked";

export interface SpecialistValidationResult {
  status: SpecialistValidationStatus;
  specialistId: string | null;
  diagnosticNote: string;
}

/**
 * ConsultationBookingSession — runtime booking state domain object.
 */
export interface ConsultationBookingSession {
  sessionId: string;
  sourceIntentId: string;
  /** @deprecated use sourceIntentId */
  readonly consultationIntentId: string;
  bookingFlowPhase: BookingPhase;
  bookingStatus: BookingPhase;
  createdAt: string;
  lastActivityAt: string;
  expiresAt: string;
  lifecycleVersion: "v1";
  entryPoint: BookingEntryPoint;
  assessmentSessionId?: string;
  entitlementType: BookingEntitlementType;
  recoveryState: BookingRecoveryState;
  selectedSpecialistId?: string;
  selectedSlotId?: string;
  specialistRecommendation?: SpecialistRecommendation;
  /** reservationId — set by SlotReservationOrchestrator on slot selection */
  reservationId?: string;
}

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

/**
 * ALLOWED_TRANSITIONS — Sprint 3.7.1 Phase 3 additions:
 *
 *   REVIEW → CONFIRMING          — orchestrator step 1 (optimistic transition)
 *   CONFIRMING → CONFIRMED        — orchestrator step 9 (success)
 *   CONFIRMING → CONFIRMATION_FAILED — orchestrator failure path
 *   CONFIRMATION_FAILED → REVIEW  — user retry (back to review boundary)
 *   CONFIRMATION_FAILED → CANCELLED — user cancels after failure
 *   CONFIRMATION_FAILED → EXPIRED  — TTL expired while in failed state
 */
export const ALLOWED_TRANSITIONS: Readonly<
  Partial<Record<BookingPhase, readonly BookingPhase[]>>
> = {
  CREATED:              ["SPECIALIST_SELECTION", "CANCELLED", "ABANDONED"],
  SPECIALIST_SELECTION: ["SLOT_SELECTION", "CANCELLED", "EXPIRED", "ABANDONED"],
  SLOT_SELECTION:       ["REVIEW", "SPECIALIST_SELECTION", "CANCELLED", "EXPIRED", "ABANDONED"],
  REVIEW:               ["CONFIRMING", "CONFIRMED", "SLOT_SELECTION", "CANCELLED", "EXPIRED"],
  CONFIRMING:           ["CONFIRMED", "CONFIRMATION_FAILED"],
  CONFIRMATION_FAILED:  ["REVIEW", "CANCELLED", "EXPIRED"],
  CONFIRMED:            ["RESCHEDULED", "COMPLETED", "CANCELLED"],
  RESCHEDULED:          ["SLOT_SELECTION", "CANCELLED", "EXPIRED"],
  COMPLETED:            [],
  CANCELLED:            [],
  EXPIRED:              [],
  ABANDONED:            [],
} as const;

export function isValidTransition(from: BookingPhase, to: BookingPhase): boolean {
  const allowed = ALLOWED_TRANSITIONS[from];
  return allowed ? (allowed as readonly BookingPhase[]).includes(to) : false;
}

export function getAllowedNextPhases(from: BookingPhase): readonly BookingPhase[] {
  return ALLOWED_TRANSITIONS[from] ?? [];
}

export function generateBookingSessionId(): string {
  return `bks_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function calculateBookingExpiry(fromDate = new Date()): string {
  return new Date(fromDate.getTime() + 2 * 60 * 60 * 1000).toISOString();
}

export function isSessionExpired(session: ConsultationBookingSession): boolean {
  return new Date(session.expiresAt) < new Date();
}

// ===========================================================================
// SECTION C — Backward-Compat Aliases (Root-1 fix — Sprint 3.7.1)
//
// These aliases allow legacy consumer files to compile without any changes.
// They map old names → canonical names defined above.
// DO NOT use these aliases in new code — use the canonical names directly.
// These will be removed when all consumers are migrated (Sprint 3.8 target).
// ===========================================================================

/**
 * @deprecated use BookingEntryPoint
 * Alias kept for consultationBookingRepository.ts compatibility.
 */
export type ConsultationEntryPoint = BookingEntryPoint;

/**
 * @deprecated use BookingRecoveryReason
 * Alias kept for consultationBookingRepository.ts compatibility.
 */
export type BookingInterruptionReason = BookingRecoveryReason;

/**
 * @deprecated use RECOVERABLE_PHASES
 * Re-export kept for consultationBookingRepository.ts compatibility.
 */
export const BOOKING_RECOVERABLE_PHASES: BookingPhase[] = RECOVERABLE_PHASES;

/**
 * @deprecated use TERMINAL_PHASES
 * Re-export kept for consultationBookingRepository.ts compatibility.
 */
export const BOOKING_TERMINAL_PHASES: BookingPhase[] = TERMINAL_PHASES;
