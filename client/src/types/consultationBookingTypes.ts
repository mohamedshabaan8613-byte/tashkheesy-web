/**
 * consultationBookingTypes.ts — Sprint 3.1 Priority 3 (Post-hardening)
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
export type BookingLifecyclePhase =
  | "CREATED"
  | "SPECIALIST_SELECTION"
  | "SLOT_SELECTION"
  | "REVIEW"
  | "CONFIRMED"
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
  | "mount_ttl_check";

// ─── Recovery Execution Mode (Point 4) ──────────────────────────────────────
/**
 * RecoveryExecution — كيف يتم تنفيذ RecoveryAction.
 *
 * AUTO:                     يتم تلقائيًا بدون تدخل المستخدم.
 *                           مثال: resume_active_booking إذا كانت الجلسة نشطة.
 * MANUAL:                   يتطلب تدخل المستخدم (navigate, click).
 *                           مثال: redirect_to_payment.
 * USER_CONFIRMATION_REQUIRED: يتطلب موافقة صريحة قبل التنفيذ.
 *                             مثال: resume_active_booking إذا كانت الجلسة قديمة.
 *
 * Sprint 3.2+: استخدم هذا لتحديد UX pattern في recovery screens.
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
 * يُحوَّل في UI إلى فعل بناءً على الحالة.
 */
export type RecoveryAction =
  | "redirect_to_assessment"    // أعد التقييم
  | "redirect_to_payment"       // ادفع أولاً
  | "show_retry_dialog"         // أعد المحاولة
  | "resume_active_booking"     // استأنف الحجز النشط
  | "contact_support"           // تواصل مع الدعم
  | "none";                     // لا إجراء ممكن

// ─── BookingInitializationResult ─────────────────────────────────────────────
/**
 * BookingInitializationResult — نتيجة initBooking().
 *
 * المبدأ:
 *   - success: الـ UI يعرف nextRoute ويستدعي navigate()
 *   - failure: الـ UI يعرف denialReason ويتصرف بناءً عليه
 *
 * الـ navigation لا تحدث أبدًا داخل orchestrator.
 * orchestrator يعرف nextRoute لكنه لا يتنقل بنفسه.
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
 *   يُستخدم لـ: analytics correlation / CRM sync / audit trail / abandonment recovery.
 *
 * consultationIntentId — alias محفوظ للتوافق مع الكود القائم.
 */
export interface ConsultationBookingSession {
  sessionId: string;

  /**
   * sourceIntentId — immutable.
   * الرابط الدائم بين هذه الجلسة والـ ConsultationIntent الأصلي.
   * لا تُعدِّل هذا الحقل أبدًا بعد إنشاء الجلسة.
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
const ALLOWED_TRANSITIONS: Partial<Record<BookingLifecyclePhase, BookingLifecyclePhase[]>> = {
  CREATED:              ["SPECIALIST_SELECTION", "CANCELLED", "ABANDONED"],
  SPECIALIST_SELECTION: ["SLOT_SELECTION", "CANCELLED", "EXPIRED", "ABANDONED"],
  SLOT_SELECTION:       ["REVIEW", "SPECIALIST_SELECTION", "CANCELLED", "EXPIRED", "ABANDONED"],
  REVIEW:               ["CONFIRMED", "SLOT_SELECTION", "CANCELLED", "EXPIRED"],
  CONFIRMED:            ["COMPLETED", "CANCELLED"],
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
