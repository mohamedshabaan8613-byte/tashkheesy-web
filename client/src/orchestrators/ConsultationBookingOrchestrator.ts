/**
 * ConsultationBookingOrchestrator.ts — Sprint 3.1 Priority 3
 *
 * Core orchestration layer — framework-agnostic و testable.
 *
 * ❌ لا يحتوي هذا الملف على:
 *   - React hooks
 *   - useContext / useEffect / useState
 *   - navigate() — الـ navigation في UI دائمًا
 *   - import من ConsultationContext
 *   - import من ConsultationBookingContext
 *
 * ✅ يحتوي فقط على:
 *   - Pure validation functions
 *   - Entitlement resolution logic
 *   - Domain payload building
 *   - BookingInitializationResult construction
 *   - nextRoute resolution (يُعيد للـ UI ليس ينتقل بنفسه)
 *
 * المسار:
 *   UI → useConsultationBooking() hook → orchestrator → BookingContext → Repository
 */

import type {
  BookingDenialReason,
  BookingEntitlementType,
  BookingEntryPoint,
  BookingInitializationResult,
  ConsultationBookingSession,
  ConsultationRoute,
  RecoveryAction,
  SpecialistRecommendation,
} from "../types/consultationBookingTypes";
import { CONSULTATION_ROUTES } from "../types/consultationBookingTypes";

// ─── Input Types ──────────────────────────────────────────────────────────

/**
 * بيانات التقييم المختصرة التي ترسلها ScreeningResult.
 * الـ orchestrator يبني payload الكامل داخليًا.
 */
export interface AssessmentBookingInput {
  consultationIntentId: string;
  assessmentSessionId: string;
  specialistRecommendation?: SpecialistRecommendation;
}

/**
 * بيانات دخول ConsultationIntroPage.
 * أبسط — لا assessment لديها.
 */
export interface IntroPageBookingInput {
  consultationIntentId: string;
}

/** دالة الحقن — تستقبلها الـ orchestrator بدل import مباشر للـ Context */
export type StartSessionFn = (params: {
  consultationIntentId: string;
  entryPoint: BookingEntryPoint;
  entitlementType: BookingEntitlementType;
  assessmentSessionId?: string;
  specialistRecommendation?: SpecialistRecommendation;
}) => ConsultationBookingSession;

// ─── Internal Helpers ───────────────────────────────────────────────────────

function resolveEntitlement(entryPoint: BookingEntryPoint): BookingEntitlementType {
  switch (entryPoint) {
    case "post_assessment":
    case "post_screening":
      return "free_first_consultation";
    default:
      return "paid_consultation";
  }
}

function resolveNextRoute(_entryPoint: BookingEntryPoint): ConsultationRoute {
  // Sprint 3.1: جميع المداخل تصل إلى booking page.
  // Sprint 3.3+: قد يتفرع بناءً على entitlementType (direct to payment etc.)
  return CONSULTATION_ROUTES.BOOKING;
}

function makeDenial(
  denialReason: BookingDenialReason,
  denialMessage: string,
  recoveryAction: RecoveryAction
): BookingInitializationResult {
  return { success: false, denialReason, denialMessage, recoveryAction };
}

function validateIntentId(id: string | undefined): string | null {
  if (!id?.trim()) return "يجب توفير consultationIntentId لبدء الحجز";
  return null;
}

// ─── Exported Core Functions (testable, framework-agnostic) ────────────────────────

/**
 * startFromAssessment — بدء حجز من ScreeningResult.
 *
 * قاعدة مهمة: ScreeningResult لا تبني BookingSessionPayload بنفسها.
 * ترسل AssessmentBookingInput فقط، orchestrator يبني الباقي.
 */
export function startFromAssessment(
  input: AssessmentBookingInput,
  startSession: StartSessionFn
): BookingInitializationResult {
  const err = validateIntentId(input.consultationIntentId);
  if (err) return makeDenial("validation_failed", err, "none");

  if (!input.assessmentSessionId?.trim()) {
    return makeDenial(
      "validation_failed",
      "يجب توفير assessmentSessionId للحجز بعد التقييم",
      "redirect_to_assessment"
    );
  }

  const entryPoint: BookingEntryPoint    = "post_assessment";
  const entitlementType                  = resolveEntitlement(entryPoint);
  const nextRoute                        = resolveNextRoute(entryPoint);

  const session = startSession({
    consultationIntentId: input.consultationIntentId,
    entryPoint,
    entitlementType,
    assessmentSessionId: input.assessmentSessionId,
    specialistRecommendation: input.specialistRecommendation,
  });

  return {
    success: true,
    bookingSessionId: session.sessionId,
    nextRoute,
    entitlementType,
    recoveryState: session.recoveryState,
  };
}

/**
 * startFromIntroPage — بدء حجز من ConsultationIntroPage.
 *
 * لا يحتاج assessment — مدخل مباشر.
 */
export function startFromIntroPage(
  input: IntroPageBookingInput,
  startSession: StartSessionFn
): BookingInitializationResult {
  const err = validateIntentId(input.consultationIntentId);
  if (err) return makeDenial("validation_failed", err, "none");

  const entryPoint: BookingEntryPoint    = "consultation_intro";
  const entitlementType                  = resolveEntitlement(entryPoint);
  const nextRoute                        = resolveNextRoute(entryPoint);

  const session = startSession({
    consultationIntentId: input.consultationIntentId,
    entryPoint,
    entitlementType,
  });

  return {
    success: true,
    bookingSessionId: session.sessionId,
    nextRoute,
    entitlementType,
    recoveryState: session.recoveryState,
  };
}

/**
 * النتيجة المتوقعة من دالة denialReason إلى recoveryAction.
 * يستخدمه الـ UI hook adapter لإظهار الرسالة الصحيحة.
 */
export function getRecoveryActionForDenial(reason: BookingDenialReason): RecoveryAction {
  const map: Record<BookingDenialReason, RecoveryAction> = {
    entitlement_expired:        "redirect_to_payment",
    already_active:             "resume_active_booking",
    validation_failed:          "none",
    assessment_expired:         "redirect_to_assessment",
    specialist_unavailable:     "show_retry_dialog",
    payment_required:           "redirect_to_payment",
    geo_restriction:            "contact_support",
    parental_consent_required:  "contact_support",
    unknown:                    "contact_support",
  };
  return map[reason];
}
