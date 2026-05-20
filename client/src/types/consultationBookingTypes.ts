/**
 * consultationBookingTypes.ts
 *
 * Pre-Sprint 3.3 — Stabilization Phase
 *
 * ─── ARCHITECTURE RULES ────────────────────────────────────────────────────
 *
 * 1. BOOKING_CONTEXT_BOUNDARY
 *    BookingContext / BookingSession لا يملكان domain data من Assessment:
 *    ❌ assessment payload  ❌ clinical severity  ❌ recommendation engine data
 *    ❌ entitlement policy  ❌ subject metadata
 *    ✅ يملكان فقط: runtime booking state + lifecycle + timestamps + recovery
 *    Assessment data يبقى source-owned بالكامل داخل ConsultationIntent.
 *
 * 2. ORCHESTRATOR_BOUNDARY
 *    ConsultationBookingOrchestrator يحتوي فقط:
 *    ✅ validation  ✅ entitlement resolution  ✅ route resolution  ✅ session init
 *    ❌ analytics  ❌ tracking  ❌ UI copy  ❌ payment redirect  ❌ recommendation ranking
 *
 * 3. DENIAL_PRESENTATION_RULE
 *    BookingDenialReason هو domain code — لا يُعرض مباشرة للمستخدم.
 *
 * 4. SOURCE_INTENT_LINKAGE
 *    sourceIntentId هو الرابط الثابت بين BookingSession و ConsultationIntent.
 *    لا تُعدِّل sourceIntentId بعد إنشاء الجلسة — immutable بعد creation.
 *    consultationIntentId محفوظ كـ alias للتوافق مع الكود القائم.
 *
 * 5. TRANSITION_MUTATION_RULE (Sprint 3.3)
 *    transitionTo() هو المسار الوحيد لتغيير bookingFlowPhase.
 *    لا تُعدِّل bookingFlowPhase مباشرة من الـ UI.
 *    الـ UI يستدعي orchestrator → orchestrator يستدعي transitionTo().
 *    consultationIntentId محفوظ كـ readonly alias للتوافق.
 *
 * 5. TRANSITION_NAMING_RULE
 *    transitionTo(nextPhase) = describes resulting workflow state ✅
 *    advancePhase removed — was semantically incorrect (described past event).
 *    مثال: بعد اختيار specialist → transitionTo("SLOT_SELECTION")  ✅
 *
 * 6. BOOKING_PHASE_ALIAS
 *    BookingPhase = BookingLifecyclePhase — الاسم الكنسي الرسمي.
 *    استخدم BookingPhase في الكود الجديد.
 *    BookingLifecyclePhase محفوظ للتوافق مع الكود القائم.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── Lifecycle Future Marker ─────────────────────────────────────────────────
export const LIFECYCLE_NOTE = "simplified_sprint_3.1" as const;

// ─── Route Constants ──────────────────────────────────────────────────────────
export const CONSULTATION_ROUTES = {
  START:   "/consultation/start",
  BOOKING: "/consultation/booking",
  REVIEW:  "/consultation/review",
  BOOKING_GENERIC: "/booking",
} as const;

export type ConsultationRoute = typeof CONSULTATION_ROUTES[keyof typeof CONSULTATION_ROUTES];

// ─── Booking Phase ───────────────────────────────────────────────────────────
/**
 * BookingPhase — الاسم الكنسي الرسمي لحالة جلسة الحجز.
 *
 * TRANSITION_NAMING_RULE (Rule 5):
 *   transitionTo("SLOT_SELECTION")  ← اسم الحالة الناتجة ✅
 *   advancePhase("SPECIALIST_SELECTION") ← محذوف ❌
 *
 * الـ state machine:
 *   CREATED → SPECIALIST_SELECTION → SLOT_SELECTION → REVIEW → CONFIRMED
 *   CONFIRMED → RESCHEDULED → SLOT_SELECTION (إعادة جدولة)
 *   CONFIRMED / RESCHEDULED → CANCELLED / EXPIRED
 *   أي phase → ABANDONED
 */
export type BookingPhase =
  | "CREATED"
  | "SPECIALIST_SELECTION"
  | "SLOT_SELECTION"
  | "REVIEW"
  | "CONFIRMED"
  | "RESCHEDULED"
  | "COMPLETED"
  | "CANCELLED"
  | "EXPIRED"
  | "ABANDONED";

/**
 * BookingPhase — الاسم الكنسي الرسمي (Sprint 3.1+).
 * استخدم هذا في الكود الجديد.
 */
export type BookingPhase = BookingLifecyclePhase;

/**
 * @deprecated استخدم BookingPhase أو BookingLifecyclePhase.
 * محفوظ للتوافق — نفس النوع.
 */
export type BookingLifecyclePhaseAlias = BookingLifecyclePhase;

export const RECOVERABLE_PHASES: BookingLifecyclePhase[] = [
  "SPECIALIST_SELECTION",
  "SLOT_SELECTION",
  "REVIEW",
];

export const TERMINAL_PHASES: BookingPhase[] = [
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
  "EXPIRED",
  "ABANDONED",
];

// ─── Entry Points ────────────────────────────────────────────────────────────
export type BookingEntryPoint =
  | "post_assessment"
  | "post_screening"
  | "specialist_match"
  | "direct_navigation"
  | "consultation_intro";

// ─── Entitlement Types ───────────────────────────────────────────────────────
export type BookingEntitlementType =
  | "free_first_consultation"
  | "paid_consultation"
  | "package_session"
  | "follow_up";

// ─── Recovery Reason Taxonomy ────────────────────────────────────────────────
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
  | "expiration_poll";

// ─── Recovery Execution Mode ─────────────────────────────────────────────────
export type RecoveryExecution =
  | "AUTO"
  | "MANUAL"
  | "USER_CONFIRMATION_REQUIRED";

// ─── Recovery State ──────────────────────────────────────────────────────────
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
}

// ─── Booking Denial ───────────────────────────────────────────────────────────
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

// ─── BookingInitializationResult ─────────────────────────────────────────────
export type BookingInitializationResult =
  | {
      success: true;
      bookingSessionId: string;
      nextRoute: ConsultationRoute;
      entitlementType: BookingEntitlementType;
      recoveryState?: BookingRecoveryState;
    }
  | {
      success: false;
      denialReason: BookingDenialReason;
      denialMessage: string;
      recoveryAction: RecoveryAction;
    };

// ─── Specialist Recommendation ───────────────────────────────────────────────
export interface SpecialistRecommendation {
  specialistId: string;
  matchScore: number;
  matchReasons: string[];
  assessmentSessionId: string;
}

// ─── RuntimeSafetyStatus ─────────────────────────────────────────────────────
export type RuntimeSafetyStatus = "valid" | "expired" | "missing" | "corrupt";

export interface RuntimeSafetyResult {
  status: RuntimeSafetyStatus;
  currentPhase: BookingPhase | null;
  diagnosticNote: string;
}

// ─── Specialist Validation Result ────────────────────────────────────────────
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

// ─── ConsultationBookingSession (Domain Object) ──────────────────────────────
/**
 * ConsultationBookingSession — runtime booking state.
 *
 * BOOKING_CONTEXT_BOUNDARY:
 *   هذا الكائن يملك runtime booking data فقط.
 *
 * sourceIntentId — immutable (Rule 4):
 *   الرابط الدائم بين هذه الجلسة والـ ConsultationIntent الأصلي.
 *   لا تُعدِّل هذا الحقل بعد creation.
 *
 * consultationIntentId — readonly alias للتوافق.
 *   استخدم sourceIntentId في الكود الجديد.
 */
export interface ConsultationBookingSession {
  sessionId: string;

  /** sourceIntentId — immutable. الرابط الدائم مع ConsultationIntent. */
  sourceIntentId: string;

  /**
   * @deprecated استخدم sourceIntentId بدلاً منه.
   * محفوظ مؤقتًا للتوافق مع الكود القائم.
   * سيُزال في Sprint 3.4+.
   */
  consultationIntentId: string;
  /** @deprecated استخدم sourceIntentId. محفوظ للتوافق. */
  readonly consultationIntentId: string;

  bookingFlowPhase: BookingPhase;
  createdAt: string;
  lastActivityAt: string;
  expiresAt: string;

  /** v1 = Sprint 3.1 simplified machine. v2 = Sprint 3.2+ payment phases. */
  lifecycleVersion: "v1";

  entryPoint: BookingEntryPoint;
  assessmentSessionId?: string;
  entitlementType: BookingEntitlementType;
  recoveryState: BookingRecoveryState;
  selectedSpecialistId?: string;
  selectedSlotId?: string;
  specialistRecommendation?: SpecialistRecommendation;
  bookingStatus: BookingPhase;
}

// ─── Repository Interface ─────────────────────────────────────────────────────
export interface ConsultationBookingRepository {
  save(session: ConsultationBookingSession): void;
  load(sessionId: string): ConsultationBookingSession | null;
  setActive(sessionId: string): void;
  getActiveId(): string | null;
  loadActive(): ConsultationBookingSession | null;
  /** @deprecated استخدم loadActive() */
  loadLatest(): ConsultationBookingSession | null;
  invalidate(sessionId: string, reason: BookingRecoveryReason): void;
  clearActive(): void;
  clear(): void;
}

// ─── Lifecycle Transition Validation ────────────────────────────────────────
/**
 * ALLOWED_TRANSITIONS — export const (Sprint 3.1 hardening).
 *
 * قابل للاستيراد من خارج هذا الملف:
 *   import { ALLOWED_TRANSITIONS } from "../types/consultationBookingTypes";
 *
 * Sprint 3.3: يُستخدم من orchestrator للتحقق قبل transitionTo().
 */
export const ALLOWED_TRANSITIONS: Readonly<Partial<Record<BookingLifecyclePhase, BookingLifecyclePhase[]>>> = {
// ─── Lifecycle Transition Validation ─────────────────────────────────────────
/**
 * ALLOWED_TRANSITIONS — خريطة الانتقالات الصحيحة بين phases.
 *
 * exported const — يستخدمه:
 *   - ConsultationBookingContext: isValidTransition()
 *   - getAllowedNextPhases(): لمساعدة الـ UI في معرفة الانتقالات المتاحة
 *
 * TRANSITION_NAMING_RULE (Rule 5):
 *   المفتاح = الحالة الحالية (from)
 *   القيم  = الحالات المسموح بالانتقال إليها (to)
 */
export const ALLOWED_TRANSITIONS: Readonly<
  Partial<Record<BookingPhase, readonly BookingPhase[]>>
> = {
  CREATED:              ["SPECIALIST_SELECTION", "CANCELLED", "ABANDONED"],
  SPECIALIST_SELECTION: ["SLOT_SELECTION", "CANCELLED", "EXPIRED", "ABANDONED"],
  SLOT_SELECTION:       ["REVIEW", "SPECIALIST_SELECTION", "CANCELLED", "EXPIRED", "ABANDONED"],
  REVIEW:               ["CONFIRMED", "SLOT_SELECTION", "CANCELLED", "EXPIRED"],
  CONFIRMED:            ["RESCHEDULED", "COMPLETED", "CANCELLED"],
  RESCHEDULED:          ["SLOT_SELECTION", "CANCELLED", "EXPIRED"],
  COMPLETED:            [],
  CANCELLED:            [],
  EXPIRED:              [],
  ABANDONED:            [],
} as const;

/**
 * getAllowedNextPhases — ما هي الـ phases المتاحة من الحالة الحالية؟
 *
 * يستخدمه الـ UI لمنع عرض أزرار انتقال غير صالحة.
 * مثال:
 *   getAllowedNextPhases("SLOT_SELECTION")
 *   // → ["REVIEW", "SPECIALIST_SELECTION", "CANCELLED", "EXPIRED", "ABANDONED"]
 */
export function getAllowedNextPhases(from: BookingPhase): readonly BookingPhase[] {
  return ALLOWED_TRANSITIONS[from] ?? [];
}

/**
 * getAllowedNextPhases — utility للـ UI/orchestrator.
 * يُعيد قائمة الانتقالات المتاحة من phase معين.
 */
export function getAllowedNextPhases(from: BookingLifecyclePhase): BookingLifecyclePhase[] {
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
