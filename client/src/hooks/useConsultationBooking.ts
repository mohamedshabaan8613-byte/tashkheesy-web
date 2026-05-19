/**
 * useConsultationBooking.ts — Sprint 3.1 Priority 3
 *
 * React adapter layer — الجسر بين UI و orchestration.
 *
 * هذا ليس:
 *   - God Hook
 *   - Orchestrator
 *   - Context
 *
 * هذا هو React adapter فقط:
 *   - يستدعي useConsultationBooking() من BookingContext
 *   - يحقن startSession في orchestrator core functions
 *   - يُعيد BookingInitializationResult للـ component
 *   - لا يستدعي navigate() — التنقل في الـ component
 *   - لا يضم entitlement / analytics / payment لوجيك
 *
 * الاستخدام الصحيح:
 * ```tsx
 * // في ScreeningResult.tsx:
 * const { startFromAssessment } = useConsultationBookingAdapter();
 *
 * const result = startFromAssessment({
 *   consultationIntentId: intent.intentId,
 *   assessmentSessionId:  session.id,
 *   specialistRecommendation: recommendation,
 * });
 *
 * if (result.success) {
 *   navigate(result.nextRoute); // navigate هنا في component
 * } else {
 *   showError(result.denialReason);
 * }
 * ```
 *
 * ❌ لا تفعل هكذا:
 * ```tsx
 * // Anti-pattern: UI تبني payload بنفسها
 * const { startBookingSession } = useConsultationBooking();
 * startBookingSession({ consultationIntentId, entryPoint, entitlementType, ... });
 * navigate("/consultation/booking");
 * ```
 */

import { useCallback } from "react";
import { useConsultationBooking as useBookingContext } from "../contexts/ConsultationBookingContext";
import {
  startFromAssessment as coreStartFromAssessment,
  startFromIntroPage  as coreStartFromIntroPage,
} from "../orchestrators/ConsultationBookingOrchestrator";
import type {
  AssessmentBookingInput,
  IntroPageBookingInput,
} from "../orchestrators/ConsultationBookingOrchestrator";
import type { BookingInitializationResult } from "../types/consultationBookingTypes";

/**
 * useConsultationBookingAdapter — hook الرسمي للصفحات.
 *
 * لا تحتاج import من ConsultationContext أبدًا.
 * لا تحتاج navigate() — استخدم result.nextRoute في الـ component.
 */
export function useConsultationBookingAdapter() {
  const { startBookingSession } = useBookingContext();

  /**
   * startFromAssessment — لـ ScreeningResult.
   * لا تبن payload في الـ component.
   */
  const startFromAssessment = useCallback(
    (input: AssessmentBookingInput): BookingInitializationResult =>
      coreStartFromAssessment(input, startBookingSession),
    [startBookingSession]
  );

  /**
   * startFromIntroPage — لـ ConsultationIntroPage.
   * لا assessment لديها.
   */
  const startFromIntroPage = useCallback(
    (input: IntroPageBookingInput): BookingInitializationResult =>
      coreStartFromIntroPage(input, startBookingSession),
    [startBookingSession]
  );

  return {
    startFromAssessment,
    startFromIntroPage,
  };
}
