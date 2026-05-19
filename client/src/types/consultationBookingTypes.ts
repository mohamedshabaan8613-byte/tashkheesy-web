/**
 * consultationBookingTypes.ts — Sprint 3.1 Priority 2
 *
 * Domain types لـ Consultation Booking.
 * مستقلة تمامًا عن generic booking system.
 *
 * المبدأ: ConsultationBookingSession هو domain object كامل،
 * وليس مجرد state مبعثرة في React.
 */

// ─── Booking Lifecycle Phases ──────────────────────────────────────────────
/**
 * BookingLifecyclePhase — آلة حالة الحجز
 *
 * الانتقالات المسموحة:
 *   CREATED → SPECIALIST_SELECTION
 *   SPECIALIST_SELECTION → SLOT_SELECTION
 *   SLOT_SELECTION → REVIEW
 *   REVIEW → CONFIRMED
 *   CONFIRMED → COMPLETED
 *
 *   أي phase → CANCELLED | EXPIRED | ABANDONED
 */
export type BookingLifecyclePhase =
  | "CREATED"               // تم إنشاء الجلسة، لم يبدأ بعد
  | "SPECIALIST_SELECTION"  // المستخدم يختار الأخصائي
  | "SLOT_SELECTION"        // المستخدم يختار الموعد
  | "REVIEW"                // مراجعة الاختيارات قبل التأكيد
  | "CONFIRMED"             // تم تأكيد الحجز
  | "COMPLETED"             // اكتملت الجلسة
  | "CANCELLED"             // ألغاه المستخدم
  | "EXPIRED"               // انتهت صلاحية الجلسة أو entitlement
  | "ABANDONED";            // غادر بدون إكمال (no interaction timeout)

/** الفازات التي يمكن استئناف recovery منها */
export const RECOVERABLE_PHASES: BookingLifecyclePhase[] = [
  "SPECIALIST_SELECTION",
  "SLOT_SELECTION",
  "REVIEW",
];

/** الفازات النهائية التي لا يمكن الاستئناف منها */
export const TERMINAL_PHASES: BookingLifecyclePhase[] = [
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
  "EXPIRED",
  "ABANDONED",
];

// ─── Entry Points ──────────────────────────────────────────────────────────
/**
 * من أين دخل المستخدم إلى consultation booking.
 * يُستخدم لتخصيص المحتوى وتتبع قمع التحويل.
 */
export type BookingEntryPoint =
  | "post_assessment"         // بعد إنهاء التقييم مباشرة
  | "post_screening"          // بعد نتيجة الفحص
  | "specialist_match"        // من صفحة مطابقة الأخصائيين
  | "direct_navigation"       // دخل مباشرة على الرابط
  | "consultation_intro";     // من ConsultationIntroPage

// ─── Entitlement Types ─────────────────────────────────────────────────────
/**
 * نوع الاستحقاق — ماذا يحق للمستخدم حجزه.
 * مؤقت الآن، سيُوسَّع عند ربط نظام الدفع.
 */
export type BookingEntitlementType =
  | "free_first_consultation"  // الجلسة الأولى المجانية
  | "paid_consultation"        // جلسة مدفوعة
  | "package_session"          // ضمن باقة
  | "follow_up";               // متابعة بعد تقييم

// ─── Booking Recovery State ───────────────────────────────────────────────
/**
 * حالة الاسترداد — ماذا يفعل النظام عند refresh أو عودة المستخدم.
 */
export type BookingRecoveryStatus =
  | "fresh"           // جلسة جديدة، لا يوجد شيء للاسترداد
  | "recovered"       // تم استرداد الجلسة بنجاح
  | "invalidated"     // انتهى entitlement أثناء الحجز
  | "rerouted"        // أُعيد التوجيه بسبب specialist unavailable
  | "partial"         // استرداد جزئي (بعض البيانات فُقدت)
  | "failed";         // فشل الاسترداد تماماً

export interface BookingRecoveryState {
  status: BookingRecoveryStatus;
  recoveredAt?: string;        // ISO timestamp
  recoveredPhase?: BookingLifecyclePhase;
  failureReason?: string;
}

// ─── Specialist Recommendation ────────────────────────────────────────────
/**
 * توصية الأخصائي — تأتي من نتيجة التقييم.
 * قراءة فقط في booking context، لا يُعدَّل هنا.
 */
export interface SpecialistRecommendation {
  specialistId: string;
  matchScore: number;          // 0–100
  matchReasons: string[];      // أسباب المطابقة من التقييم
  assessmentSessionId: string; // الجلسة التي أنتجت التوصية
}

// ─── ConsultationBookingSession (Domain Object) ───────────────────────────
/**
 * ConsultationBookingSession — الـ domain object المركزي.
 *
 * هذا ليس React state — يُخزَّن في repository مستقل
 * ويعيش طوال دورة حياة الحجز حتى بعد page refresh.
 */
export interface ConsultationBookingSession {
  // ── Identity ──────────────────────────────────────────
  sessionId: string;              // UUID فريد لهذه الجلسة
  consultationIntentId: string;   // يربطها بـ ConsultationContext intent

  // ── Lifecycle ─────────────────────────────────────────
  bookingFlowPhase: BookingLifecyclePhase;
  createdAt: string;              // ISO timestamp
  lastActivityAt: string;         // آخر نشاط — يُستخدم لـ ABANDONED detection
  expiresAt: string;              // TTL — 2 ساعة من الإنشاء

  // ── Entry Context ─────────────────────────────────────
  entryPoint: BookingEntryPoint;
  assessmentSessionId?: string;   // إذا جاء من تقييم
  entitlementType: BookingEntitlementType;

  // ── Recovery ──────────────────────────────────────────
  recoveryState: BookingRecoveryState;

  // ── Selections ────────────────────────────────────────
  selectedSpecialistId?: string;
  selectedSlotId?: string;
  specialistRecommendation?: SpecialistRecommendation;

  // ── Status ────────────────────────────────────────────
  bookingStatus: BookingLifecyclePhase; // alias لـ bookingFlowPhase للوضوح
}

// ─── Repository Interface ─────────────────────────────────────────────────
/**
 * ConsultationBookingRepository — الواجهة الرسمية للتخزين.
 *
 * السبب: لا تجعل الـ booking يعيش داخل React state فقط.
 * حتى لو كانت الـ implementation الأولى sessionStorage،
 * الواجهة مستعدة للترقية إلى Supabase لاحقًا.
 */
export interface ConsultationBookingRepository {
  save(session: ConsultationBookingSession): void;
  load(sessionId: string): ConsultationBookingSession | null;
  loadLatest(): ConsultationBookingSession | null;
  invalidate(sessionId: string, reason: string): void;
  clear(): void;
}

// ─── Lifecycle Transition Validation ─────────────────────────────────────
const ALLOWED_TRANSITIONS: Partial<Record<BookingLifecyclePhase, BookingLifecyclePhase[]>> = {
  CREATED: ["SPECIALIST_SELECTION", "CANCELLED", "ABANDONED"],
  SPECIALIST_SELECTION: ["SLOT_SELECTION", "CANCELLED", "EXPIRED", "ABANDONED"],
  SLOT_SELECTION: ["REVIEW", "SPECIALIST_SELECTION", "CANCELLED", "EXPIRED", "ABANDONED"],
  REVIEW: ["CONFIRMED", "SLOT_SELECTION", "CANCELLED", "EXPIRED"],
  CONFIRMED: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
  EXPIRED: [],
  ABANDONED: [],
};

/**
 * يتحقق من أن الانتقال بين فازتين مسموح به.
 * يمنع الانتقالات غير الصحيحة قبل حدوثها.
 */
export function isValidTransition(
  from: BookingLifecyclePhase,
  to: BookingLifecyclePhase
): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

/**
 * يُنشئ sessionId فريد (UUID v4 آمن).
 */
export function generateBookingSessionId(): string {
  return `bks_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * يحسب تاريخ انتهاء صلاحية الجلسة (2 ساعة).
 */
export function calculateBookingExpiry(fromDate = new Date()): string {
  const expiry = new Date(fromDate.getTime() + 2 * 60 * 60 * 1000);
  return expiry.toISOString();
}

/**
 * يتحقق من أن الجلسة لم تنته صلاحيتها.
 */
export function isSessionExpired(session: ConsultationBookingSession): boolean {
  return new Date(session.expiresAt) < new Date();
}
