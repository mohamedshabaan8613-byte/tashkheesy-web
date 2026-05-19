/**
 * consultationEntitlements.ts — Consultation Entitlement Business Logic
 *
 * Sprint 3.1 — Business Layer Foundation
 * Priority 1: Entitlement Architecture (Patched)
 *
 * هذا الملف يحتوي على كامل منطق الأعمال للاستحقاق.
 * Pure business logic — قابل للاختبار بشكل مستقل.
 */

import type { ConsultationIntent } from "../types/consultationTypes";
import type {
  AccessPolicyDecision,
  BookingDenialReason,
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
  freeEntitlementValidityHours: 48,
  maxAssessmentAgeForBookingHours: 7 * 24,
  firstConsultationAlwaysFree: true,
  assessmentCompletionGrantsFreeConsultation: true,
};

// ---------------------------------------------------------------------------
// Intent Age Helpers
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
 * ════════════════════════════════════════════════════════════════════
 * ⚠️  TEMPORARY INFERENCE LAYER — لا تعتمد عليه في production logic.
 *
 * المشكلة:
 *   entryPoint ≠ entitlement.
 *   نفس entryPoint (مثل assessment_result) يمكن أن يؤدي إلى FREE أو PAID أو BLOCKED
 *   حسب المستخدم — وهذا لا يمكن معرفته من الـ entryPoint وحده.
 *
 * TODO Sprint 3.2+:
 *   يجب استبدال هذا الاستنتاج بـ:
 *   • نتيجة حقيقية من جدول entitlements في قاعدة البيانات
 *   • أو session token موقّع من الـ backend بعد إتمام الفحص
 *   • entryPoint يبقى navigation context فقط — ليس مصدر استحقاق
 * ════════════════════════════════════════════════════════════════════
 */
export function getEntitlementFromIntent(
  intent: ConsultationIntent
): ConsultationEntitlement {
  const intentAgeHours = getIntentAgeHours(intent);
  if (intentAgeHours > 4) {
    return "EXPIRED";
  }

  switch (intent.entryPoint) {
    case "follow_up":
      return "FOLLOW_UP";

    case "assessment_result":
      if (ENTITLEMENT_CONFIG.assessmentCompletionGrantsFreeConsultation) {
        return "FREE_CONSULTATION";
      }
      return "PAID_CONSULTATION";

    case "direct_booking":
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
 * حقول Persistence (entitlementId, consumedAt, remainingSessions) nullable حالياً.
 */
export function buildEntitlementStatus(
  intent: ConsultationIntent
): EntitlementStatus {
  const entitlement = getEntitlementFromIntent(intent);
  const isFree =
    entitlement === "FREE_CONSULTATION" || entitlement === "FOLLOW_UP";
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
    expiresAt: null,
    source:
      intent.entryPoint === "follow_up"
        ? "follow_up"
        : intent.entryPoint === "assessment_result"
        ? "assessment_completion"
        : "unknown",
    // Persistence fields — nullable حتى Sprint 3.1 Priority 3
    entitlementId: null,
    consumedAt: null,
    remainingSessions: null,
  };
}

// ---------------------------------------------------------------------------
// canAccessConsultation
// ---------------------------------------------------------------------------

/**
 * Access policy guard — الباب الأول.
 */
export function canAccessConsultation(
  intent: ConsultationIntent | null,
  entitlement?: ConsultationEntitlement
): EntitlementCheckResult {
  if (!intent) {
    return {
      canAccess: false,
      reason: "no_intent",
      shouldRedirect: true,
      redirectTo: "/start",
      userMessage: "لم يتم العثور على سياق الاستشارة. يرجى البدء من جديد.",
    };
  }

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

  const resolvedEntitlement = entitlement ?? getEntitlementFromIntent(intent);

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

  return { canAccess: true, reason: null, shouldRedirect: false };
}

// ---------------------------------------------------------------------------
// resolveBookingEligibility
// ---------------------------------------------------------------------------

interface ResolveBookingEligibilityParams {
  intent: ConsultationIntent | null;
  entitlement?: ConsultationEntitlement;
  intentAgeSeconds?: number;
}

/**
 * Booking Eligibility Resolver — الباب الثاني.
 * ineligibilityReason من BookingDenialReason الآن (ليس BookingIneligibilityReason).
 */
export function resolveBookingEligibility(
  params: ResolveBookingEligibilityParams
): BookingEligibilityResult {
  const { intent, entitlement } = params;
  const resolvedAt = new Date().toISOString();

  const buildMeta = (
    override?: Partial<BookingEligibilityMeta>
  ): BookingEligibilityMeta => ({
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

  if (!intent) {
    return {
      canBook: false,
      ineligibilityReason: "intent_expired" satisfies BookingDenialReason,
      resolvedEntitlement: "EXPIRED",
      isBookingFree: false,
      requiresPreBookingAction: true,
      preBookingAction: "complete_assessment",
      meta: buildMeta(),
    };
  }

  const resolvedEntitlement = entitlement ?? getEntitlementFromIntent(intent);

  if (resolvedEntitlement === "BLOCKED") {
    return {
      canBook: false,
      ineligibilityReason: "blocked" satisfies BookingDenialReason,
      resolvedEntitlement,
      isBookingFree: false,
      requiresPreBookingAction: false,
      meta: buildMeta(),
    };
  }

  if (resolvedEntitlement === "EXPIRED") {
    return {
      canBook: false,
      ineligibilityReason: "entitlement_expired" satisfies BookingDenialReason,
      resolvedEntitlement,
      isBookingFree: false,
      requiresPreBookingAction: false,
      meta: buildMeta(),
    };
  }

  if (
    intent.entryPoint === "assessment_result" &&
    intent.assessmentResult?.completedAt
  ) {
    const assessmentAgeHours =
      (Date.now() - new Date(intent.assessmentResult.completedAt).getTime()) /
      3600000;

    if (assessmentAgeHours > ENTITLEMENT_CONFIG.maxAssessmentAgeForBookingHours) {
      return {
        canBook: false,
        ineligibilityReason: "assessment_too_old" satisfies BookingDenialReason,
        resolvedEntitlement,
        isBookingFree: false,
        requiresPreBookingAction: true,
        preBookingAction: "complete_assessment",
        meta: buildMeta(),
      };
    }
  }

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
 * يحوّل نتائج canAccessConsultation + resolveBookingEligibility
 * إلى قرارات UI مباشرة جاهزة.
 */
export function getAccessPolicyDecision(
  intent: ConsultationIntent | null,
  entitlement?: ConsultationEntitlement
): AccessPolicyDecision {
  const accessCheck = canAccessConsultation(intent, entitlement);
  const eligibility = resolveBookingEligibility({ intent, entitlement });

  if (!accessCheck.canAccess) {
    return {
      showBookingCTA: false,
      bookingCTAEnabled: false,
      showFreeBadge: false,
      showWarningBanner: true,
      warningBannerMessage: accessCheck.userMessage,
      requiresFreshIntent:
        accessCheck.reason === "no_intent" ||
        accessCheck.reason === "invalid_intent",
    };
  }

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

  return {
    showBookingCTA: true,
    bookingCTAEnabled: true,
    showFreeBadge: eligibility.isBookingFree,
    showWarningBanner: false,
    requiresFreshIntent: false,
  };
}
