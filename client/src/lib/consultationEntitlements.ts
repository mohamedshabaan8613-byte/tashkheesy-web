/**
 * consultationEntitlements.ts — Consultation Entitlement Business Logic
 *
 * Sprint 3.1 — Business Layer Foundation
 * Priority 1: Entitlement Architecture
 *
 * هذا الملف يحتوي على كامل منطق الأعمال للاستحقاق:
 *   • canAccessConsultation()      — access policy guard
 *   • resolveBookingEligibility()  — booking eligibility resolver
 *   • getEntitlementFromIntent()   — intent → entitlement inference
 *   • getAccessPolicyDecision()    — UI decision helper
 *   • ENTITLEMENT_CONFIG           — centralised config
 *
 * لا يعتمد هذا الملف على React أو أي مكوّن UI.
 * Pure business logic — قابل للاختبار بشكل مستقل.
 */

import type { ConsultationIntent } from "../types/consultationTypes";
import type {
  AccessPolicyDecision,
  BookingEligibilityMeta,
  BookingEligibilityResult,
  ConsultationEntitlement,
  EntitlementCheckResult,
  EntitlementConfig,
  EntitlementStatus,
} from "../types/consultationEntitlements";

// ---------------------------------------------------------------------------
// Centralised Configuration
// ---------------------------------------------------------------------------

export const ENTITLEMENT_CONFIG: EntitlementConfig = {
  /** استشارة مجانية صالحة لمدة 48 ساعة من منح الاستحقاق */
  freeEntitlementValidityHours: 48,

  /** الفحص صالح للحجز لمدة 7 أيام */
  maxAssessmentAgeForBookingHours: 7 * 24,

  /** الاستشارة الأولى مجانية دائماً */
  firstConsultationAlwaysFree: true,

  /** إتمام الفحص يمنح استشارة مجانية تلقائياً */
  assessmentCompletionGrantsFreeConsultation: true,
};

// ---------------------------------------------------------------------------
// Intent Age Helper
// ---------------------------------------------------------------------------

function getIntentAgeSeconds(intent: ConsultationIntent): number {
  try {
    return Math.floor(
      (Date.now() - new Date(intent.initiatedAt).getTime()) / 1000
    );
  } catch {
    return Infinity;
  }
}

function getIntentAgeHours(intent: ConsultationIntent): number {
  return getIntentAgeSeconds(intent) / 3600;
}

// ---------------------------------------------------------------------------
// getEntitlementFromIntent
// ---------------------------------------------------------------------------

/**
 * يستنتج ConsultationEntitlement من ConsultationIntent.
 *
 * المنطق:
 * 1. إذا كانت النية من follow_up → FOLLOW_UP
 * 2. إذا كانت النية من assessment_result → FREE_CONSULTATION
 *    (إتمام الفحص يمنح استشارة مجانية تلقائياً)
 * 3. إذا كانت النية من direct_booking → PAID_CONSULTATION
 *    (لا فحص مرتبط — يفترض الدفع)
 * 4. إذا كانت النية منتهية الصلاحية → EXPIRED
 *
 * ملاحظة: هذا inference مبدئي.
 * في المستقبل سيُستبدل بـ database lookup فعلي.
 */
export function getEntitlementFromIntent(
  intent: ConsultationIntent
): ConsultationEntitlement {
  // فحص انتهاء الصلاحية أولاً (4 ساعات — نفس Intent expiry)
  const intentAgeHours = getIntentAgeHours(intent);
  if (intentAgeHours > 4) {
    return "EXPIRED";
  }

  switch (intent.entryPoint) {
    case "follow_up":
      return "FOLLOW_UP";

    case "assessment_result":
      // إتمام الفحص يمنح FREE_CONSULTATION
      if (ENTITLEMENT_CONFIG.assessmentCompletionGrantsFreeConsultation) {
        return "FREE_CONSULTATION";
      }
      return "PAID_CONSULTATION";

    case "direct_booking":
      // حجز مباشر بدون فحص — يفترض الدفع
      // إذا كانت الاستشارة الأولى مجانية → FREE_CONSULTATION
      if (ENTITLEMENT_CONFIG.firstConsultationAlwaysFree) {
        return "FREE_CONSULTATION";
      }
      return "PAID_CONSULTATION";

    default:
      return "PAID_CONSULTATION";
  }
}

// ---------------------------------------------------------------------------
// buildEntitlementStatus
// ---------------------------------------------------------------------------

/**
 * يبني EntitlementStatus كاملاً من Intent.
 */
export function buildEntitlementStatus(
  intent: ConsultationIntent
): EntitlementStatus {
  const entitlement = getEntitlementFromIntent(intent);
  const isFree =
    entitlement === "FREE_CONSULTATION" ||
    entitlement === "FOLLOW_UP";
  const isFollowUp = entitlement === "FOLLOW_UP";
  const isEligible =
    entitlement !== "EXPIRED" && entitlement !== "BLOCKED";

  return {
    entitlement,
    isEligible,
    isFree,
    isFollowUp,
    remainingSessionsCount: isFree ? 1 : null,
    previousConsultationId: intent.previousConsultationId,
    expiresAt: null, // يُحسب من قاعدة البيانات مستقبلاً
    source:
      intent.entryPoint === "assessment_completion"
        ? "assessment_completion"
        : intent.entryPoint === "follow_up"
        ? "follow_up"
        : intent.entryPoint === "assessment_result"
        ? "assessment_completion"
        : "unknown",
  };
}

// ---------------------------------------------------------------------------
// canAccessConsultation
// ---------------------------------------------------------------------------

/**
 * Access policy guard — الباب الأول.
 *
 * يفحص:
 * 1. هل يوجد intent صالح؟
 * 2. هل الاستحقاق يسمح بالوصول؟
 * 3. هل انتهت صلاحية النية؟
 *
 * @param intent — النية الحالية (null إذا لم توجد)
 * @param entitlement — الاستحقاق (optional، يُحسب من intent إذا لم يُعطَ)
 */
export function canAccessConsultation(
  intent: ConsultationIntent | null,
  entitlement?: ConsultationEntitlement
): EntitlementCheckResult {
  // 1. لا توجد نية
  if (!intent) {
    return {
      canAccess: false,
      reason: "no_intent",
      shouldRedirect: true,
      redirectTo: "/start",
      userMessage: "لم يتم العثور على سياق الاستشارة. يرجى البدء من جديد.",
    };
  }

  // 2. فحص انتهاء الصلاحية (4 ساعات)
  const intentAgeHours = getIntentAgeHours(intent);
  if (intentAgeHours > 4) {
    return {
      canAccess: false,
      reason: "invalid_intent",
      shouldRedirect: true,
      redirectTo: "/start",
      userMessage:
        "انتهت صلاحية جلسة الاستشارة. يرجى البدء من جديد أو استئناف من آخر نقطة.",
    };
  }

  // 3. حساب الاستحقاق إذا لم يُعطَ
  const resolvedEntitlement = entitlement ?? getEntitlementFromIntent(intent);

  // 4. فحص الاستحقاق
  if (resolvedEntitlement === "EXPIRED") {
    return {
      canAccess: false,
      reason: "entitlement_expired",
      shouldRedirect: false,
      userMessage: "انتهت صلاحية استحقاق الاستشارة. يرجى التواصل معنا للتجديد.",
    };
  }

  if (resolvedEntitlement === "BLOCKED") {
    return {
      canAccess: false,
      reason: "user_blocked",
      shouldRedirect: false,
      userMessage:
        "حسابك غير مؤهل حالياً للاستشارة. يرجى التواصل مع فريق الدعم.",
    };
  }

  // 5. كل الفحوصات نجحت
  return {
    canAccess: true,
    reason: null,
    shouldRedirect: false,
  };
}

// ---------------------------------------------------------------------------
// resolveBookingEligibility
// ---------------------------------------------------------------------------

interface ResolveBookingEligibilityParams {
  intent: ConsultationIntent | null;
  entitlement?: ConsultationEntitlement;
  /** عمر النية بالثواني (optional، يُحسب إذا لم يُعطَ) */
  intentAgeSeconds?: number;
}

/**
 * Booking Eligibility Resolver — الباب الثاني.
 *
 * يفحص ما إذا كان يمكن للمستخدم إتمام الحجز الفعلي.
 * أكثر تفصيلاً من canAccessConsultation — يفحص:
 * - صلاحية سياق الفحص
 * - عمر الفحص
 * - وجود إجراءات مسبقة مطلوبة
 *
 * @returns BookingEligibilityResult مع كامل التفاصيل
 */
export function resolveBookingEligibility(
  params: ResolveBookingEligibilityParams
): BookingEligibilityResult {
  const { intent, entitlement } = params;

  const resolvedAt = new Date().toISOString();

  // بناء meta مشترك
  const buildMeta = (override?: Partial<BookingEligibilityMeta>): BookingEligibilityMeta => ({
    derivedFromAssessment:
      intent?.entryPoint === "assessment_result" ||
      !!intent?.assessmentResult,
    linkedSessionId: intent?.assessmentResult?.sessionId,
    resolvedAt,
    entryPoint: intent?.entryPoint,
    intentAgeSeconds:
      params.intentAgeSeconds ??
      (intent ? getIntentAgeSeconds(intent) : undefined),
    ...override,
  });

  // 1. لا توجد نية
  if (!intent) {
    return {
      canBook: false,
      ineligibilityReason: "no_assessment_context",
      resolvedEntitlement: "EXPIRED",
      isBookingFree: false,
      requiresPreBookingAction: true,
      preBookingAction: "complete_assessment",
      meta: buildMeta(),
    };
  }

  const resolvedEntitlement = entitlement ?? getEntitlementFromIntent(intent);

  // 2. محظور
  if (resolvedEntitlement === "BLOCKED") {
    return {
      canBook: false,
      ineligibilityReason: "blocked_user",
      resolvedEntitlement,
      isBookingFree: false,
      requiresPreBookingAction: false,
      meta: buildMeta(),
    };
  }

  // 3. منتهي الصلاحية
  if (resolvedEntitlement === "EXPIRED") {
    return {
      canBook: false,
      ineligibilityReason: "expired_entitlement",
      resolvedEntitlement,
      isBookingFree: false,
      requiresPreBookingAction: false,
      meta: buildMeta(),
    };
  }

  // 4. فحص: هل الفحص المرتبط قديم جداً؟
  if (
    intent.entryPoint === "assessment_result" &&
    intent.assessmentResult?.completedAt
  ) {
    const assessmentAgeHours =
      (Date.now() - new Date(intent.assessmentResult.completedAt).getTime()) /
      3600000;

    if (
      assessmentAgeHours >
      ENTITLEMENT_CONFIG.maxAssessmentAgeForBookingHours
    ) {
      return {
        canBook: false,
        ineligibilityReason: "assessment_too_old",
        resolvedEntitlement,
        isBookingFree: false,
        requiresPreBookingAction: true,
        preBookingAction: "complete_assessment",
        meta: buildMeta(),
      };
    }
  }

  // 5. كل الفحوصات نجحت — يمكن الحجز
  const isFree =
    resolvedEntitlement === "FREE_CONSULTATION" ||
    resolvedEntitlement === "FOLLOW_UP";

  return {
    canBook: true,
    resolvedEntitlement,
    isBookingFree: isFree,
    requiresPreBookingAction: false,
    meta: buildMeta(),
  };
}

// ---------------------------------------------------------------------------
// getAccessPolicyDecision
// ---------------------------------------------------------------------------

/**
 * UI Decision Helper.
 *
 * يحوّل نتائج canAccessConsultation + resolveBookingEligibility
 * إلى قرارات UI مباشرة وجاهزة للاستخدام في المكوّنات.
 *
 * @param intent — النية الحالية
 * @param entitlement — الاستحقاق (optional)
 * @returns AccessPolicyDecision جاهز للـ UI
 */
export function getAccessPolicyDecision(
  intent: ConsultationIntent | null,
  entitlement?: ConsultationEntitlement
): AccessPolicyDecision {
  const accessCheck = canAccessConsultation(intent, entitlement);
  const eligibility = resolveBookingEligibility({ intent, entitlement });

  // لا يمكن الوصول أصلاً
  if (!accessCheck.canAccess) {
    return {
      showBookingCTA: false,
      bookingCTAEnabled: false,
      showFreeBadge: false,
      showWarningBanner: true,
      warningBannerMessage: accessCheck.userMessage,
      requiresFreshIntent: accessCheck.reason === "no_intent" ||
        accessCheck.reason === "invalid_intent",
    };
  }

  // يمكن الوصول لكن لا يمكن الحجز
  if (!eligibility.canBook) {
    const isExpiredAssessment =
      eligibility.ineligibilityReason === "assessment_too_old";

    return {
      showBookingCTA: true,
      bookingCTAEnabled: false,
      bookingCTADisabledLabel: isExpiredAssessment
        ? "الفحص قديم — أعد الفحص أولاً"
        : "غير مؤهل للحجز حالياً",
      showFreeBadge: false,
      showWarningBanner: isExpiredAssessment,
      warningBannerMessage: isExpiredAssessment
        ? "الفحص الذي أجريته تجاوز مدة الصلاحية للحجز (7 أيام). يرجى إجراء فحص جديد."
        : undefined,
      requiresFreshIntent: false,
    };
  }

  // يمكن الوصول والحجز
  return {
    showBookingCTA: true,
    bookingCTAEnabled: true,
    showFreeBadge: eligibility.isBookingFree,
    showWarningBanner: false,
    requiresFreshIntent: false,
  };
}
