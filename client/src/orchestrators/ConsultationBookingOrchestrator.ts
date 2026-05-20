/**
 * ConsultationBookingOrchestrator.ts — Sprint 3.1 Priority 3 (Post-hardening)
 *
 * ─── ORCHESTRATOR_BOUNDARY ──────────────────────────────────────────────────
 * هذا الملف يحتوي فقط على:
 *   ✅ Input validation
 *   ✅ Entitlement resolution (placeholder → Sprint 3.2 backend)
 *   ✅ Route resolution
 *   ✅ Session initialization payload building
 *   ✅ BookingInitializationResult construction
 *
 * ❌ ممنوع إضافة هذه داخل هذا الملف أبدًا:
 *   ❌ analytics / tracking / telemetry
 *   ❌ UX copy / error messages للمستخدم
 *   ❌ navigate() أو أي routing مباشر
 *   ❌ payment redirect logic
 *   ❌ recommendation ranking
 *   ❌ UI dialogs / toasts
 *   ❌ React hooks / useContext / useEffect
 *   ❌ import من ConsultationContext أو ConsultationBookingContext
 *
 * الـ navigation يحدث دائمًا في UI بناءً على result.nextRoute.
 * ────────────────────────────────────────────────────────────────────────────
 *
 * المسار:
 *   UI → useConsultationBookingAdapter() hook → orchestrator → BookingContext → Repository
 */

import { CONSULTATION_ROUTES } from "../constants/consultationRoutes";
import type { ConsultationRoute } from "../constants/consultationRoutes";
import type {
  BookingDenialReason,
  BookingEntitlementType,
  BookingEntryPoint,
  BookingInitializationResult,
  ConsultationBookingSession,
  RecoveryAction,
  SpecialistRecommendation,
} from "../types/consultationBookingTypes";

// ─── Input Types ──────────────────────────────────────────────────────────────

/**
 * AssessmentBookingInput — ما يرسله ScreeningResult فقط.
 *
 * RULE: ScreeningResult لا تبني BookingSessionPayload بنفسها.
 * ترسل هذا الـ input فقط، والـ orchestrator يبني الباقي داخليًا.
 */
export interface AssessmentBookingInput {
  /** من ConsultationContext.intent.intentId — يُخزَّن كـ sourceIntentId */
  consultationIntentId: string;
  assessmentSessionId: string;
  specialistRecommendation?: SpecialistRecommendation;
}

/**
 * IntroPageBookingInput — ما يرسله ConsultationIntroPage فقط.
 * لا assessment لديه.
 */
export interface IntroPageBookingInput {
  /** من ConsultationContext.intent.intentId — يُخزَّن كـ sourceIntentId */
  consultationIntentId: string;
}

/**
 * StartSessionFn — دالة الحقن من BookingContext.
 *
 * الـ orchestrator يستقبل هذه الدالة بدل import مباشر للـ Context،
 * محافظًا على framework-agnostic design.
 */
export type StartSessionFn = (params: {
  consultationIntentId: string;
  sourceIntentId: string;
  entryPoint: BookingEntryPoint;
  entitlementType: BookingEntitlementType;
  assessmentSessionId?: string;
  specialistRecommendation?: SpecialistRecommendation;
}) => ConsultationBookingSession;

// ─── Internal Pure Helpers ────────────────────────────────────────────────────

function resolveEntitlement(entryPoint: BookingEntryPoint): BookingEntitlementType {
  // Sprint 3.1: بسيط بناءً على entryPoint.
  // Sprint 3.2+: سيُربط بـ backend entitlement check.
  switch (entryPoint) {
    case "post_assessment":
    case "post_screening":
      return "free_first_consultation";
    default:
      return "paid_consultation";
  }
}

function resolveNextRoute(_entryPoint: BookingEntryPoint): ConsultationRoute {
  // Sprint 3.1: جميع المداخل → booking page.
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
  if (!id?.trim()) return "consultationIntentId مطلوب لبدء الحجز";
  return null;
}

// ─── Exported Core Functions (testable, framework-agnostic) ──────────────────

/**
 * startFromAssessment — بدء حجز من ScreeningResult.
 *
 * consultationIntentId يُخزَّن كـ sourceIntentId (immutable linkage).
 */
export function startFromAssessment(
  input: AssessmentBookingInput,
  startSession: StartSessionFn
): BookingInitializationResult {
  const intentErr = validateIntentId(input.consultationIntentId);
  if (intentErr) return makeDenial("validation_failed", intentErr, "none");

  if (!input.assessmentSessionId?.trim()) {
    return makeDenial(
      "validation_failed",
      "يجب توفير assessmentSessionId للحجز بعد التقييم",
      "redirect_to_assessment"
    );
  }

  const entryPoint      = "post_assessment" as const;
  const entitlementType = resolveEntitlement(entryPoint);
  const nextRoute       = resolveNextRoute(entryPoint);

  const session = startSession({
    consultationIntentId: input.consultationIntentId,
    sourceIntentId:       input.consultationIntentId, // immutable linkage
    entryPoint,
    entitlementType,
    assessmentSessionId:       input.assessmentSessionId,
    specialistRecommendation:  input.specialistRecommendation,
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
 * consultationIntentId يُخزَّن كـ sourceIntentId (immutable linkage).
 */
export function startFromIntroPage(
  input: IntroPageBookingInput,
  startSession: StartSessionFn
): BookingInitializationResult {
  const intentErr = validateIntentId(input.consultationIntentId);
  if (intentErr) return makeDenial("validation_failed", intentErr, "none");

  const entryPoint      = "consultation_intro" as const;
  const entitlementType = resolveEntitlement(entryPoint);
  const nextRoute       = resolveNextRoute(entryPoint);

  const session = startSession({
    consultationIntentId: input.consultationIntentId,
    sourceIntentId:       input.consultationIntentId, // immutable linkage
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
 * getRecoveryActionForDenial — ماذا يجب أن يفعل الـ UI عند الرفض.
 * يستخدمه useConsultationBookingAdapter.
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
