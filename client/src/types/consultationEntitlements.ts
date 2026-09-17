/**
 * consultationEntitlements.ts — Consultation Entitlement Domain Types
 *
 * Sprint 3.1 — Business Layer Foundation
 * Priority 1: Entitlement Architecture (Patched)
 *
 * ─── fix/entitlement-type-separation ────────────────────────────────────────
 *
 * ARCHITECTURE FIX: فصل نوعَي الـ entitlement
 *
 * المشكلة:
 *   consultationBookingRepository.create() كان يقبل ConsultationEntitlement
 *   مباشرةً كنوع لـ entitlementType داخل ConsultationBookingSession.
 *   هذا خطأ معماري لأن ConsultationEntitlement تحتوي "EXPIRED" و"BLOCKED"
 *   اللتين لا معنى لهما داخل session نشطة.
 *
 * الحل:
 *   ConsultationEntitlement  = حالة الـ entitlement الكاملة (تشمل EXPIRED/BLOCKED)
 *                               تُستخدم في: فحص الأهلية، policy decisions
 *
 *   ActiveBookingEntitlement = subset من ConsultationEntitlement
 *                               القيم الصالحة للحجز فقط (بدون EXPIRED/BLOCKED)
 *                               تُستخدم في: repository.create(), session creation
 *
 *   isActiveBookingEntitlement() = type guard
 *                               يُستخدم قبل كل create() call للتحقق
 *
 * المستهلكون بعد الإصلاح:
 *   - consultationBookingRepository.ts → يستخدم ActiveBookingEntitlement
 *   - lib/consultationEntitlements.ts  → يُخرج ConsultationEntitlement (كما كان)
 *   - ConsultationBookingContext       → يُمرر ActiveBookingEntitlement فقط
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
 * ConsultationEntitlement — الحالات الكاملة الممكنة لاستحقاق المستخدم.
 *
 * ⚠️  IMPORTANT: هذا النوع يصف حالة الـ entitlement — ليس نوع الحجز.
 *
 *   FREE_CONSULTATION  — حق في استشارة مجانية (أول مرة / عرض)
 *   PAID_CONSULTATION  — دفع مسبق، الاستشارة متاحة
 *   FOLLOW_UP          — متابعة لاستشارة سابقة
 *   EXPIRED            — ❌ انتهت صلاحية الاستحقاق — لا يجوز حجز جديد
 *   BLOCKED            — ❌ محظور مؤقتاً أو دائماً — لا يجوز حجز جديد
 *
 * للحجز: استخدم ActiveBookingEntitlement بدلاً من هذا النوع مباشرة.
 * @see ActiveBookingEntitlement
 */
export type ConsultationEntitlement =
  | "FREE_CONSULTATION"
  | "PAID_CONSULTATION"
  | "FOLLOW_UP"
  | "EXPIRED"
  | "BLOCKED";

// ---------------------------------------------------------------------------
// Active Booking Entitlement — subset صالح للحجز فقط
// ---------------------------------------------------------------------------

/**
 * ActiveBookingEntitlement — القيم الصالحة لإنشاء جلسة حجز جديدة.
 *
 * هذا النوع هو subset صارم من ConsultationEntitlement:
 *   ✅  FREE_CONSULTATION  — مسموح بالحجز
 *   ✅  PAID_CONSULTATION  — مسموح بالحجز
 *   ✅  FOLLOW_UP          — مسموح بالحجز
 *   ❌  EXPIRED            — محذوف — لا يجوز تمريره لـ session
 *   ❌  BLOCKED            — محذوف — لا يجوز تمريره لـ session
 *
 * يُستخدم حصراً في:
 *   - consultationBookingRepository.create()
 *   - ConsultationBookingContext session initialization
 *
 * للحصول على ActiveBookingEntitlement من ConsultationEntitlement:
 *   @see isActiveBookingEntitlement
 */
export type ActiveBookingEntitlement = Exclude<
  ConsultationEntitlement,
  "EXPIRED" | "BLOCKED"
>;

// ---------------------------------------------------------------------------
// Type Guard
// ---------------------------------------------------------------------------

/**
 * isActiveBookingEntitlement — type guard للتحقق قبل إنشاء session.
 *
 * يجب استدعاؤه في كل مكان يُحوَّل فيه ConsultationEntitlement
 * إلى ActiveBookingEntitlement.
 *
 * @example
 * const entitlement = resolveEntitlement(user);
 * if (!isActiveBookingEntitlement(entitlement)) {
 *   // وجّه المستخدم — لا يمكن الحجز
 *   return;
 * }
 * repository.create(intentId, entryPoint, entitlement);
 */
export function isActiveBookingEntitlement(
  value: ConsultationEntitlement
): value is ActiveBookingEntitlement {
  return value !== "EXPIRED" && value !== "BLOCKED";
}

// ---------------------------------------------------------------------------
// Entitlement Status
// ---------------------------------------------------------------------------

/**
 * حالة الاستحقاق الكاملة مع metadata.
 *
 * ملاحظة على entitlementId / consumedAt / remainingSessions:
 *   nullable حالياً — ستُملأ من قاعدة البيانات في Sprint 3.1 Priority 3 (Persistence Layer).
 *   تم تعريفها الآن لمنع كسر types مستقبلاً.
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

  // -------------------------------------------------------------------------
  // Persistence Contract Fields — Sprint 3.1 Priority 3 (Persistence Layer)
  // الحقول التالية nullable حالياً.
  // ستُملأ من قاعدة البيانات بعد بناء Persistence Layer.
  // تم تعريفها الآن لمنع breaking changes لاحقاً.
  // -------------------------------------------------------------------------

  /**
   * معرّف الاستحقاق من قاعدة البيانات.
   * null حالياً (inference مؤقت).
   * في Sprint 3.2+: يجب أن يكون UUID حقيقي من جدول entitlements.
   */
  entitlementId: string | null;

  /**
   * تاريخ استهلاك الاستحقاق (بعد الحجز الفعلي).
   * null حالياً — يمنع إعادة استخدام نفس الاستحقاق لاحقاً.
   */
  consumedAt: string | null;

  /**
   * عدد الجلسات المتبقية (للمستقبل — multi-session packages).
   * null حالياً.
   */
  remainingSessions: number | null;
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
 * أسباب الرفض من الوصول.
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
// Booking Denial Taxonomy — مركزي وشامل
// ---------------------------------------------------------------------------

/**
 * أسباب رفض الحجز — taxonomy كاملة وموحدة.
 *
 * المجموعتان:
 *   المجموعة A: نشطة حالياً (intent / entitlement / session state)
 *   المجموعة B: لاحقة (geographic / parental) — معرّفة الآن لمنع breaking changes.
 *
 * Sprint status:
 *   intent_expired          → نشطة (Sprint 3.1)
 *   entitlement_expired     → نشطة (Sprint 3.1)
 *   session_consumed        → نشطة (Sprint 3.1 Priority 3)
 *   blocked                 → نشطة (Sprint 3.1)
 *   assessment_too_old      → نشطة (Sprint 3.1)
 *   specialist_unavailable  → نشطة (Sprint 3.1)
 *   payment_required        → نشطة (Sprint 3.1)
 *   geographic_restriction  → معرّفة / غير مفعّلة (لاحقاً)
 *   parental_consent_required → معرّفة / غير مفعّلة (لاحقاً)
 */
export type BookingDenialReason =
  // --- المجموعة A: نشطة ---
  | "intent_expired"              // انتهت صلاحية النية (4 ساعات)
  | "entitlement_expired"         // انتهى الاستحقاق
  | "session_consumed"            // تم استهلاك الجلسة — سيُفعّل في Priority 3
  | "blocked"                     // محظور
  | "assessment_too_old"          // الفحص قديم (أكثر من 7 أيام)
  | "specialist_unavailable"      // لا يوجد متخصص متاح
  | "payment_required"            // يجب الدفع أولاً
  // --- المجموعة B: معرّفة / غير مفعّلة (لاحقاً) ---
  | "geographic_restriction"      // TODO Sprint 4+: قيود جغرافية
  | "parental_consent_required";  // TODO Sprint 4+: موافقة ولي الأمر

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

  /** سبب عدم الأهلية — من BookingDenialReason */
  ineligibilityReason?: BookingDenialReason;

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
 *
 * ============================================================
 * ⚠️  POLICY OUTPUT ONLY
 * هذا الكائن يخرج قرارات سياسة — ليس بيانات عرض.
 * مسموح: showBookingCTA, bookingCTAEnabled, showFreeBadge,
 *            showWarningBanner, warningBannerMessage, requiresFreshIntent
 * غير مسموح: buttonColor, bannerVariant, iconName, className
 * الفاصل: هل هذا قرار domain أم تفضيل عرض؟
 *          إذا كان تفضيل عرض → انتقل إلى component مستوى.
 * ============================================================
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
