/**
 * consultationBookingOrchestrator.ts — Booking Orchestration Isolation
 *
 * Sprint 3.0c | Phase 1 — Runtime Completion
 *
 * يفصل booking logic تمامًا عن consultation flow logic.
 * يقرر:
 *   - هل يتجه لـ /consultation/booking أو /booking ؟
 *   - هل intent صالح للحجز؟
 *   - ما هو السياق الذي يُمرَّر لصفحة الحجز؟
 */

import type { ConsultationIntent } from "../types/consultationTypes";
import { CONSULTATION_ROUTES } from "../types/consultationTypes";
import { isIntentStillValid } from "./consultationHydration";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type BookingRouteDecision =
  | { type: "contextual"; route: typeof CONSULTATION_ROUTES.BOOKING }
  | { type: "generic"; route: typeof CONSULTATION_ROUTES.BOOKING_GENERIC }
  | { type: "blocked"; reason: string };

export interface BookingContext {
  /** هل هذا حجز سياقي مرتبط بتقييم؟ */
  isContextual: boolean;
  /** اسم المريض/الطفل إن وُجد */
  subjectName?: string;
  /** نتيجة التقييم إن وُجدت */
  resultKey?: string;
  /** نوع المسار */
  pathType?: string;
  /** نوع نقطة الدخول */
  entryPoint: ConsultationIntent["entryPoint"];
}

export interface BookingValidationResult {
  isValid: boolean;
  reason?: string;
}

// ---------------------------------------------------------------------------
// resolveBookingRoute
// ---------------------------------------------------------------------------

/**
 * يقرر أي route يستخدم للحجز بناءً على حالة intent.
 *
 * القواعد:
 *   - intent صالح + entryPoint = assessment_result → contextual route
 *   - intent صالح + أي entryPoint آخر → contextual route (للاستمرارية)
 *   - لا intent أو intent منتهي → generic route
 */
export function resolveBookingRoute(
  intent: ConsultationIntent | null
): BookingRouteDecision {
  if (!isIntentStillValid(intent)) {
    return {
      type: "generic",
      route: CONSULTATION_ROUTES.BOOKING_GENERIC,
    };
  }

  return {
    type: "contextual",
    route: CONSULTATION_ROUTES.BOOKING,
  };
}

// ---------------------------------------------------------------------------
// buildBookingContext
// ---------------------------------------------------------------------------

/**
 * يبني BookingContext من intent للاستخدام في analytics / UX rendering.
 */
export function buildBookingContext(
  intent: ConsultationIntent | null
): BookingContext {
  if (!intent) {
    return {
      isContextual: false,
      entryPoint: "direct_booking",
    };
  }

  const assessmentResult = intent.assessmentResult;

  return {
    isContextual:
      intent.entryPoint === "assessment_result" &&
      assessmentResult !== undefined,
    subjectName: assessmentResult?.subjectName,
    resultKey: assessmentResult?.resultKey,
    pathType: assessmentResult?.pathType,
    entryPoint: intent.entryPoint,
  };
}

// ---------------------------------------------------------------------------
// validateBookingEntry
// ---------------------------------------------------------------------------

/**
 * يتحقق من أن الدخول لصفحة الحجز مسموح به.
 *
 * الحالات المرفوضة:
 *   - لا يوجد intent على الإطلاق
 *   - intent منتهي الصلاحية
 *   - intent بدون entryPoint
 */
export function validateBookingEntry(
  intent: ConsultationIntent | null
): BookingValidationResult {
  if (!intent) {
    return {
      isValid: false,
      reason: "no_intent",
    };
  }

  if (!isIntentStillValid(intent)) {
    return {
      isValid: false,
      reason: "intent_expired",
    };
  }

  if (!intent.entryPoint) {
    return {
      isValid: false,
      reason: "missing_entry_point",
    };
  }

  return { isValid: true };
}
