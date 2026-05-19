/**
 * consultationEntitlements.ts — Consultation Entitlement Domain Types
 *
 * Sprint 3.1 — Business Layer Foundation
 * Priority 1: Entitlement Architecture
 *
 * هذا الملف يعرّف كامل نظام الصلاحيات والاستحقاق
 * للاستشارات في منصة تشخيصي.
 *
 * الترتيب المعماري:
 *   types (هنا) → lib/consultationEntitlements.ts → context → UI
 *
 * لا يجب استيراد هذا الملف في مكونات UI مباشرة.
 * استخدم دوال lib/consultationEntitlements.ts بدلاً من ذلك.
 */

// ---------------------------------------------------------------------------
// Core Entitlement Type
// ---------------------------------------------------------------------------

/**
 * الحالات الممكنة لاستحقاق المستخدم في الاستشارة.
 *
 * FREE_CONSULTATION  — حق في استشارة مجانية (أول مرة / عرض)
 * PAID_CONSULTATION  — دفع مسبق، الاستشارة متاحة
 * FOLLOW_UP         — متابعة لاستشارة سابقة
 * EXPIRED           — انتهت صلاحية الاستحقاق
 * BLOCKED           — محظور مؤقتاً أو دائماً
 */
export type ConsultationEntitlement =
  | "FREE_CONSULTATION"
  | "PAID_CONSULTATION"
  | "FOLLOW_UP"
  | "EXPIRED"
  | "BLOCKED";

// ---------------------------------------------------------------------------
// Entitlement Status
// ---------------------------------------------------------------------------

/**
 * حالة الاستحقاق الكاملة مع metadata.
 */
export interface EntitlementStatus {
  /** نوع الاستحقاق */
  entitlement: ConsultationEntitlement;

  /** هل المستخدم مؤهل للوصول الآن؟ */
  isEligible: boolean;

  /** هل هذا الاستحقاق مجاني؟ */
  isFree: boolean;

  /** هل هو متابعة لاستشارة سابقة؟ */
  isFollowUp: boolean;

  /** عدد الاستشارات المتبقية (null = غير محدود أو غير معروف) */
  remainingSessionsCount: number | null;

  /** معرّف الاستشارة السابقة (لحالة FOLLOW_UP) */
  previousConsultationId?: string;

  /** تاريخ انتهاء الاستحقاق (null = لا ينتهي) */
  expiresAt: string | null;

  /** مصدر الاستحقاق */
  source: EntitlementSource;
}

/**
 * مصدر الاستحقاق — من أين جاء هذا الحق.
 */
export type EntitlementSource =
  | "assessment_completion"   // أُعطي بعد إتمام فحص
  | "payment"                 // دفع مباشر
  | "promotional"             // عرض ترويجي
  | "follow_up"               // متابعة تلقائية
  | "admin_grant"             // منح يدوي من الإدارة
  | "unknown";                // غير محدد (حالة افتراضية)

// ---------------------------------------------------------------------------
// Entitlement Check Result
// ---------------------------------------------------------------------------

/**
 * نتيجة فحص الاستحقاق.
 * تُرجع من canAccessConsultation().
 */
export interface EntitlementCheckResult {
  /** هل يمكن الوصول؟ */
  canAccess: boolean;

  /** سبب القرار (للـ logging والـ UI) */
  reason: EntitlementDenyReason | null;

  /** هل يجب توجيه المستخدم لصفحة أخرى؟ */
  shouldRedirect: boolean;

  /** الصفحة التي يجب التوجيه إليها (إن وجدت) */
  redirectTo?: string;

  /** رسالة للمستخدم (يمكن عرضها في UI) */
  userMessage?: string;
}

/**
 * أسباب الرفض الممكنة.
 */
export type EntitlementDenyReason =
  | "no_intent"               // لا توجد نية استشارة
  | "invalid_intent"          // النية غير صالحة أو منتهية
  | "entitlement_expired"     // انتهى الاستحقاق
  | "user_blocked"            // المستخدم محظور
  | "session_active"          // يوجد جلسة نشطة بالفعل
  | "insufficient_balance"    // رصيد غير كافٍ
  | "no_eligible_specialist"; // لا يوجد متخصص مناسب حاليًا

// ---------------------------------------------------------------------------
// Booking Eligibility Result
// ---------------------------------------------------------------------------

/**
 * نتيجة فحص الأهلية للحجز.
 * تُرجع من resolveBookingEligibility().
 */
export interface BookingEligibilityResult {
  /** هل يمكن الحجز؟ */
  canBook: boolean;

  /** سبب عدم الأهلية (إن وجد) */
  ineligibilityReason?: BookingIneligibilityReason;

  /** الاستحقاق المكتشف */
  resolvedEntitlement: ConsultationEntitlement;

  /** هل الحجز مجاني؟ */
  isBookingFree: boolean;

  /** هل يحتاج المستخدم لإجراء إضافي قبل الحجز؟ */
  requiresPreBookingAction: boolean;

  /** الإجراء المطلوب قبل الحجز (إن وجد) */
  preBookingAction?: PreBookingAction;

  /** metadata إضافي لـ analytics */
  meta: BookingEligibilityMeta;
}

/**
 * أسباب عدم أهلية الحجز.
 */
export type BookingIneligibilityReason =
  | "expired_entitlement"
  | "blocked_user"
  | "no_assessment_context"    // محتاج نتيجة فحص للحجز من هذا المسار
  | "assessment_too_old"       // الفحص قديم جداً
  | "duplicate_booking"        // حجز مكرر نفس اليوم
  | "specialist_unavailable";  // المتخصص المطلوب غير متاح

/**
 * إجراءات مطلوبة قبل الحجز.
 */
export type PreBookingAction =
  | "complete_assessment"      // أكمل الفحص أولاً
  | "confirm_payment"          // أكد الدفع
  | "select_specialist"        // اختر متخصصاً
  | "verify_identity";         // تحقق من الهوية

/**
 * Metadata لـ analytics وتتبع قرارات الحجز.
 */
export interface BookingEligibilityMeta {
  /** هل القرار استُنتج من نتيجة فحص؟ */
  derivedFromAssessment: boolean;

  /** معرّف الجلسة المرتبطة */
  linkedSessionId?: string;

  /** وقت اتخاذ القرار */
  resolvedAt: string;

  /** الـ entryPoint الذي أطلق الطلب */
  entryPoint?: string;

  /** عمر النية بالثواني */
  intentAgeSeconds?: number;
}

// ---------------------------------------------------------------------------
// Access Policy Decision
// ---------------------------------------------------------------------------

/**
 * قرار سياسة الوصول — يُستخدم لتحديد ما يجب عرضه في UI.
 * تُرجع من getAccessPolicyDecision().
 */
export interface AccessPolicyDecision {
  /** هل يُعرض زر الحجز؟ */
  showBookingCTA: boolean;

  /** هل زر الحجز مفعّل (وإلا يكون disabled)؟ */
  bookingCTAEnabled: boolean;

  /** نص البديل لزر الحجز (عند الـ disabled) */
  bookingCTADisabledLabel?: string;

  /** هل يُعرض badge "مجاني"؟ */
  showFreeBadge: boolean;

  /** هل يُعرض banner تحذيري؟ */
  showWarningBanner: boolean;

  /** نص الـ banner التحذيري */
  warningBannerMessage?: string;

  /** هل يجب تفريغ الـ intent والبدء من جديد؟ */
  requiresFreshIntent: boolean;
}

// ---------------------------------------------------------------------------
// Entitlement Configuration
// ---------------------------------------------------------------------------

/**
 * إعدادات مركزية للـ entitlement system.
 * تُقرأ من ENTITLEMENT_CONFIG في lib/consultationEntitlements.ts.
 */
export interface EntitlementConfig {
  /** مدة صلاحية الاستحقاق المجاني (بالساعات) */
  freeEntitlementValidityHours: number;

  /** أقصى عمر للفحص لاعتباره صالحاً للحجز (بالساعات) */
  maxAssessmentAgeForBookingHours: number;

  /** هل الاستشارة الأولى مجانية دائماً؟ */
  firstConsultationAlwaysFree: boolean;

  /** هل تُتيح نتيجة الفحص استشارة مجانية تلقائياً؟ */
  assessmentCompletionGrantsFreeConsultation: boolean;
}
