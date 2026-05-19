/**
 * useConsultationBooking.ts — Sprint 3.1 Priority 3 (Post-hardening)
 *
 * React adapter layer — الجسر بين UI وـ orchestration.
 *
 * هذا ليس:
 *   - God Hook
 *   - Orchestrator
 *   - Context
 *
 * هذا هو React adapter فقط:
 *   ✅ يستدعي useConsultationBooking() من BookingContext
 *   ✅ يحقن startSession في orchestrator core functions
 *   ✅ يُعيد BookingInitializationResult للـ component
 *   ✅ يوفر resolveBookingDenialPresentation() للـ UI
 *   ❌ لا يستدعي navigate()
 *   ❌ لا يضم entitlement / analytics / payment logic
 *
 * الاستخدام الصحيح:
 * ```tsx
 * const { startFromAssessment, resolveBookingDenialPresentation } =
 *   useConsultationBookingAdapter();
 *
 * const result = startFromAssessment({ consultationIntentId, assessmentSessionId });
 *
 * if (result.success) {
 *   navigate(result.nextRoute);        // navigation في component
 * } else {
 *   const presentation = resolveBookingDenialPresentation(result.denialReason);
 *   toast.error(presentation.userMessage);  // UX copy من presentation layer
 * }
 * ```
 *
 * ❌ لا تفعل:
 * ```tsx
 * showError(result.denialReason); // domain code ≠ UX copy
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
import type {
  BookingDenialReason,
  BookingInitializationResult,
  RecoveryAction,
  RecoveryExecution,
} from "../types/consultationBookingTypes";

// ─── Denial Presentation Layer (Point 3) ─────────────────────────────────────
/**
 * BookingDenialPresentation — ما يراه المستخدم عند الرفض.
 *
 * RULE: BookingDenialReason هو domain code.
 * هذا الكائن هو UX copy — لا تعرض domain code للمستخدم أبدًا.
 */
export interface BookingDenialPresentation {
  /** الرسالة التي تُعرض للمستخدم — بالعربية */
  userMessage: string;
  /** عنوان Dialog/Toast إن وُجد */
  title?: string;
  /** نص زر الإجراء إن وُجد */
  actionLabel?: string;
  /** الإجراء المقابل */
  recoveryAction: RecoveryAction;
  /** كيف يتم تنفيذ الإجراء */
  recoveryExecution: RecoveryExecution;
}

/**
 * resolveBookingDenialPresentation — يحوّل domain code إلى UX copy.
 *
 * ❌ لا تستخدم result.denialReason مباشرة في UI.
 * ✅ استخدم هذه الدالة دائمًا.
 */
export function resolveBookingDenialPresentation(
  reason: BookingDenialReason
): BookingDenialPresentation {
  const presentations: Record<BookingDenialReason, BookingDenialPresentation> = {
    entitlement_expired: {
      title: "انتهت صلاحية الجلسة",
      userMessage: "انتهت صلاحية جلسة الحجز، يرجى بدء الحجز مرة أخرى",
      actionLabel: "بدء الحجز",
      recoveryAction: "redirect_to_payment",
      recoveryExecution: "MANUAL",
    },
    already_active: {
      title: "يوجد حجز نشط",
      userMessage: "لديك جلسة حجز نشطة بالفعل، هل تريد الاستمرار فيها؟",
      actionLabel: "استمر في الحجز",
      recoveryAction: "resume_active_booking",
      recoveryExecution: "USER_CONFIRMATION_REQUIRED",
    },
    validation_failed: {
      userMessage: "حدث خطأ في بيانات الحجز، يرجى المحاولة مرة أخرى",
      actionLabel: "حاول مجددًا",
      recoveryAction: "none",
      recoveryExecution: "MANUAL",
    },
    assessment_expired: {
      title: "انتهت صلاحية التقييم",
      userMessage: "انتهت صلاحية نتائج التقييم، يرجى إعادة التقييم أولاً",
      actionLabel: "إعادة التقييم",
      recoveryAction: "redirect_to_assessment",
      recoveryExecution: "MANUAL",
    },
    specialist_unavailable: {
      title: "الأخصائي غير متاح",
      userMessage: "الأخصائي المقترح غير متاح حالياً، يمكنك اختيار أخصائي آخر",
      actionLabel: "اختر أخصائيًا آخر",
      recoveryAction: "show_retry_dialog",
      recoveryExecution: "USER_CONFIRMATION_REQUIRED",
    },
    payment_required: {
      title: "الدفع مطلوب",
      userMessage: "هذه الجلسة تتطلب الدفع للمتابعة",
      actionLabel: "إتمام الدفع",
      recoveryAction: "redirect_to_payment",
      recoveryExecution: "MANUAL",
    },
    geo_restriction: {
      title: "الخدمة غير متاحة",
      userMessage: "عذرًا، هذه الخدمة غير متاحة في منطقتك حالياً",
      actionLabel: "تواصل مع الدعم",
      recoveryAction: "contact_support",
      recoveryExecution: "MANUAL",
    },
    parental_consent_required: {
      title: "موافقة ولي الأمر مطلوبة",
      userMessage: "يتطلب حجز هذه الجلسة موافقة ولي الأمر",
      actionLabel: "تواصل مع الدعم",
      recoveryAction: "contact_support",
      recoveryExecution: "USER_CONFIRMATION_REQUIRED",
    },
    unknown: {
      userMessage: "حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى أو التواصل مع الدعم",
      actionLabel: "تواصل مع الدعم",
      recoveryAction: "contact_support",
      recoveryExecution: "MANUAL",
    },
  };

  return presentations[reason] ?? presentations.unknown;
}

// ─── useConsultationBookingAdapter ────────────────────────────────────────────
/**
 * useConsultationBookingAdapter — hook الرسمي للصفحات.
 *
 * لا تحتاج import من ConsultationContext أبدًا.
 * لا تحتاج navigate() — استخدم result.nextRoute في component.
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
    /** يحوّل domain denial reason إلى UX copy — لا تعرض denialReason مباشرة */
    resolveBookingDenialPresentation,
  };
}
