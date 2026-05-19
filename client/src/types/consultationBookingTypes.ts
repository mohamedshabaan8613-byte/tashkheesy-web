/**
 * consultationBookingTypes.ts — Sprint 3.1 Priority 3 (Post-hardening)
 * Updated: Pre-Sprint 3.3 — transitionTo() semantic fix + RESCHEDULED phase
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
 *    استخدم resolveBookingDenialPresentation() في useConsultationBooking.ts.
 *
 * 4. SOURCE_INTENT_LINKAGE
 *    sourceIntentId هو الرابط الثابت بين BookingSession و ConsultationIntent.
 *    لا تُعدِّل sourceIntentId بعد إنشاء الجلسة — immutable بعد creation.
 *    consultationIntentId محفوظ كـ alias للتوافق مع الكود القائم.
 *
 * 5. TRANSITION_NAMING_RULE
 *    transitionTo(nextPhase) = describes resulting workflow state ✅
 *    advancePhase(eventName) = describes past action (ambiguous)  ❌
 *    الاسم الصحيح دائمًا هو الحالة الناتجة، وليس الحدث السابق.
 *    مثال: بعد اختيار specialist → transitionTo("SLOT_SELECTION")  ✅
 *    وليس:                          advancePhase("SPECIALIST_SELECTION") ❌
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── Lifecycle Future Marker ─────────────────────────────────────────────────
/**
 * NOTE — Lifecycle intentionally simplified for Sprint 3.1.
 *
 * المراحل التي ستُضاف في Sprint 3.2+:
 *   CONFIRMED → PENDING_PAYMENT → PAID → SCHEDULED → COMPLETED
 *
 * لا تغيّر هذا الملف — أنشئ types/consultationBookingPaymentTypes.ts
 */
export const LIFECYCLE_NOTE = "simplified_sprint_3.1" as const;

// ─── Route Constants ──────────────────────────────────────────────────────────
/**
 * CONSULTATION_ROUTES — ثوابت الروابط لـ booking flow.
 *
 * المبدأ: orchestrator يُعيد nextRoute، والـ UI يستدعي navigate().
 * الـ navigation لا تحدث أبدًا داخل orchestrator.
 */
export const CONSULTATION_ROUTES = {
  START:   "/consultation/start",
  BOOKING: "/consultation/booking",
} as const;

export type ConsultationRoute = typeof CONSULTATION_ROUTES[keyof typeof CONSULTATION_ROUTES];

// ─── Booking Lifecycle Phases ────────────────────────────────────────────────
/**
 * BookingLifecyclePhase — الحالة الحالية لجلسة الحجز.
 *
 * TRANSITION_NAMING_RULE (Rule 5):
 *   transitionTo("SLOT_SELECTION")  ← اسم الحالة الناتجة ✅
 *   advancePhase("SPECIALIST_SELECTION") ← اسم الحدث السابق (ambiguous) ❌
 *
 * الـ state machine الكاملة:
 *   CREATED → SPECIALIST_SELECTION → SLOT_SELECTION → REVIEW → CONFIRMED
 *   CONFIRMED → RESCHEDULED → SLOT_SELECTION (إعادة جدولة)
 *   CONFIRMED / RESCHEDULED → CANCELLED / EXPIRED
 *   أي phase → ABANDONED (abandon عند أي نقطة)
 */
export type BookingLifecyclePhase =
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

export const RECOVERABLE_PHASES: BookingLifecyclePhase[] = [
  "SPECIALIST_SELECTION",
  "SLOT_SELECTION",
  "REVIEW",
];

export const TERMINAL_PHASES: BookingLifecyclePhase[] = [
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
  | "expiration_poll";   // مضاف: polling-triggered expiration

// ─── Recovery Execution Mode (Point 4) ──────────────────────────────────────
/**
 * RecoveryExecution — كيف يتم تنفيذ RecoveryAction.
 *
 * AUTO:                     يتم تلقائيًا بدون تدخل المستخدم.
 * MANUAL:                   يتطلب تدخل المستخدم (navigate, click).
 * USER_CONFIRMATION_REQUIRED: يتطلب موافقة صريحة قبل التنفيذ.
 */
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
  recoveredPhase?: BookingLifecyclePhase;
  auditNote?: string;
}

// ─── Booking Denial ───────────────────────────────────────────────────────────
/**
 * BookingDenialReason — لماذا رُفض الحجز.
 *
 * RULE: هذا domain code — لا يُعرض مباشرة للمستخدم أبدًا.
 * استخدم resolveBookingDenialPresentation() في useConsultationBooking.ts.
 */
export type BookingDenialReason =
  | "entitlement_expired"       // انتهى الاستحقاق
  | "already_active"            // يوجد حجز نشط بالفعل
  | "validation_failed"         // بيانات ناقصة أو خاطئة
  | "assessment_expired"        // انتهت صلاحية التقييم (Sprint 3.2+)
  | "specialist_unavailable"    // لا يوجد أخصائي متاح (Sprint 3.3+)
  | "payment_required"          // يجب الدفع أولاً (Sprint 3.2+)
  | "geo_restriction"           // قيود جغرافية (Sprint 4+)
  | "parental_consent_required" // موافقة ولي الأمر مطلوبة (Sprint 4+)
  | "unknown";                   // خطأ غير متوقع

/**
 * RecoveryAction — ماذا يفعل النظام عند الرفض.
 */
export type RecoveryAction =
  | "redirect_to_assessment"
  | "redirect_to_payment"
  | "show_retry_dialog"
  | "resume_active_booking"
  | "contact_support"
  | "none";

// ─── BookingInitializationResult ─────────────────────────────────────────────
/**
 * BookingInitializationResult — نتيجة initBooking().
 *
 * المبدأ:
 *   - success: الـ UI يعرف nextRoute ويستدعي navigate()
 *   - failure: الـ UI يعرف denialReason ويتصرف بناءً عليه
 *
 * الـ navigation لا تحدث أبدًا داخل orchestrator.
 */
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

// ─── RuntimeSafetyStatus ────────────────────────────────────────────────────
/**
 * RuntimeSafetyStatus — نتيجة runtimeSafetyCheck().
 *
 * يُستدعى من الصفحات للتحقق من صحة الجلسة الحالية قبل أي عملية.
 *
 * valid:   الجلسة نشطة وصالحة وغير منتهية.
 * expired: انتهت صلاحية الجلسة (TTL مضى).
 * missing: لا توجد جلسة نشطة.
 * corrupt: الجلسة موجودة لكن بياناتها غير متسقة.
 */
export type RuntimeSafetyStatus = "valid" | "expired" | "missing" | "corrupt";

export interface RuntimeSafetyResult {
  status: RuntimeSafetyStatus;
  /** الـ phase الحالية — null إذا لم تكن الجلسة صالحة */
  currentPhase: BookingLifecyclePhase | null;
  /** وصف مختصر للتشخيص */
  diagnosticNote: string;
}

// ─── Specialist Validation Result (Point 2 — specialistId validation) ────────
/**
 * SpecialistValidationResult — نتيجة التحقق من specialistId في URL.
 *
 * Sprint 3.3: يستخدمه SpecialistSelectionPage قبل render slots.
 */
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
 *   لا يملك: assessment payload / clinical severity / entitlement policy.
 *
 * sourceIntentId — immutable linkage (Point 5):
 *   الرابط الثابت بين هذه الجلسة والـ ConsultationIntent الذي أنشأها.
 *   لا تُعدِّل هذا الحقل بعد creation.
 */
export interface ConsultationBookingSession {
  sessionId: string;

  /**
   * sourceIntentId — immutable.
   * الرابط الدائم بين هذه الجلسة والـ ConsultationIntent الأصلي.
   */
  sourceIntentId: string;

  /**
   * @deprecated استخدم sourceIntentId بدلاً منه.
   * محفوظ مؤقتًا للتوافق مع الكود القائم.
   * سيُزال في Sprint 3.3+.
   */
  consultationIntentId: string;

  bookingFlowPhase: BookingLifecyclePhase;
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
  bookingStatus: BookingLifecyclePhase;
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
 * ALLOWED_TRANSITIONS — خريطة الانتقالات الصحيحة بين phases.
 *
 * TRANSITION_NAMING_RULE (Rule 5):
 *   المفتاح = الحالة الحالية (from)
 *   القيم  = الحالات المسموح بالانتقال إليها (to)
 *
 *   استخدام صحيح:
 *     transitionTo("SLOT_SELECTION")   ← بعد اختيار specialist ✅
 *     transitionTo("REVIEW")           ← بعد اختيار slot ✅
 *     transitionTo("RESCHEDULED")      ← من CONFIRMED عند إعادة الجدولة ✅
 */
const ALLOWED_TRANSITIONS: Partial<Record<BookingLifecyclePhase, BookingLifecyclePhase[]>> = {
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
};

export function isValidTransition(from: BookingLifecyclePhase, to: BookingLifecyclePhase): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
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
