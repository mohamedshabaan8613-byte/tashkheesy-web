/**
 * useConsultationFlow.ts — Consultation Journey Orchestration Hook
 *
 * Sprint 3.0a | Issue #56 — useConsultationFlow hook
 *
 * هذا الـ hook هو الواجهة الوحيدة للتنقل داخل consultation journey.
 * يجمع ConsultationContext + react-router-dom navigate في مكان واحد.
 *
 * الاستخدام:
 *   // من صفحة نتيجة التقييم
 *   const flow = useConsultationFlow();
 *   flow.navigateToConsultation({
 *     entryPoint: "assessment_result",
 *     assessmentResult: { ... }
 *   });
 *
 *   // من زر الحجز المباشر
 *   flow.navigateToConsultation({ entryPoint: "direct_booking" });
 *
 *   // من صفحة المتابعة
 *   flow.navigateToConsultation({
 *     entryPoint: "follow_up",
 *     previousConsultationId: "abc-123"
 *   });
 */

import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useConsultationContext } from "../contexts/ConsultationContext";
import type {
  AssessmentResultPayload,
  ConsultationEntryPoint,
  ConsultationFlowState,
  ConsultationIntent,
} from "../types/consultationTypes";

// ---------------------------------------------------------------------------
// URL builders — centralized route logic
// ---------------------------------------------------------------------------

/**
 * بناء URL الحجز المباشر (بدون سياق تقييم)
 */
export function buildDirectBookingUrl(): string {
  return "/consultation";
}

/**
 * بناء URL intro بعد نتيجة تقييم
 * يُمرَّر pathType كـ query param للتخصيص البصري للصفحة.
 */
export function buildAssessmentResultUrl(
  payload: Pick<AssessmentResultPayload, "pathType" | "assessmentMode">
): string {
  const params = new URLSearchParams({
    from: "assessment",
    path: payload.pathType,
    mode: payload.assessmentMode,
  });
  return `/consultation?${params.toString()}`;
}

/**
 * بناء URL متابعة جلسة سابقة
 */
export function buildFollowUpUrl(previousConsultationId: string): string {
  const params = new URLSearchParams({
    from: "follow_up",
    ref: previousConsultationId,
  });
  return `/consultation?${params.toString()}`;
}

/**
 * استخراج EntryPoint من URL params الحالية
 * (مفيد لـ ConsultationIntroPage عند reload)
 */
export function resolveEntryPoint(
  searchParams: URLSearchParams
): ConsultationEntryPoint {
  const from = searchParams.get("from");
  switch (from) {
    case "assessment":
      return "assessment_result";
    case "follow_up":
      return "follow_up";
    default:
      return "direct_booking";
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export interface UseConsultationFlowReturn {
  /**
   * الطريقة الرئيسية — تعيّن النية وتنقل لشاشة consultation.
   *
   * @param options - بيانات النية (entryPoint + بيانات اختيارية)
   */
  navigateToConsultation: (
    options: Omit<ConsultationIntent, "initiatedAt" | "confirmed">
  ) => void;

  /**
   * ينهي رحلة الاستشارة ويمسح النية.
   * يُستدعى بعد اكتمال الحجز أو إلغاء المستخدم.
   */
  exitFlow: () => void;

  /**
   * يُحدِّث النية الحالية بـ confirmed: true ثم ينقل لشاشة الحجز.
   */
  confirmAndBook: () => void;

  /**
   * الحالة الحالية للـ flow مشتقة من intent
   */
  flowState: ConsultationFlowState;

  // Re-export URL builders للاستخدام المباشر من الـ components
  buildDirectBookingUrl: typeof buildDirectBookingUrl;
  buildAssessmentResultUrl: typeof buildAssessmentResultUrl;
  buildFollowUpUrl: typeof buildFollowUpUrl;
  resolveEntryPoint: typeof resolveEntryPoint;
}

export function useConsultationFlow(): UseConsultationFlowReturn {
  const navigate = useNavigate();
  const { intent, setIntent, clearIntent } = useConsultationContext();

  // -------------------------------------------------------------------------
  // Derive flowState from intent
  // -------------------------------------------------------------------------

  let flowState: ConsultationFlowState = "idle";
  if (intent) {
    flowState = intent.confirmed ? "booking" : "intro";
  }

  // -------------------------------------------------------------------------
  // navigateToConsultation
  // -------------------------------------------------------------------------

  const navigateToConsultation = useCallback(
    (options: Omit<ConsultationIntent, "initiatedAt" | "confirmed">) => {
      const newIntent: ConsultationIntent = {
        ...options,
        initiatedAt: new Date().toISOString(),
        confirmed: false,
      };

      setIntent(newIntent);

      // Navigate to correct URL based on entry point
      switch (options.entryPoint) {
        case "assessment_result": {
          const payload = options.assessmentResult;
          if (payload) {
            void navigate(
              buildAssessmentResultUrl({
                pathType: payload.pathType,
                assessmentMode: payload.assessmentMode,
              })
            );
          } else {
            void navigate(buildDirectBookingUrl());
          }
          break;
        }
        case "follow_up": {
          if (options.previousConsultationId) {
            void navigate(buildFollowUpUrl(options.previousConsultationId));
          } else {
            void navigate(buildDirectBookingUrl());
          }
          break;
        }
        case "direct_booking":
        case "returning_user":
        default:
          void navigate(buildDirectBookingUrl());
          break;
      }
    },
    [navigate, setIntent]
  );

  // -------------------------------------------------------------------------
  // confirmAndBook — يُستدعى من زر التأكيد في ConsultationIntroPage
  // -------------------------------------------------------------------------

  const confirmAndBook = useCallback(() => {
    if (!intent) return;
    setIntent({ ...intent, confirmed: true });
    // الـ navigate لـ booking step يحدث في ConsultationIntroPage
    // عبر useEffect يراقب intent.confirmed
  }, [intent, setIntent]);

  // -------------------------------------------------------------------------
  // exitFlow
  // -------------------------------------------------------------------------

  const exitFlow = useCallback(() => {
    clearIntent();
  }, [clearIntent]);

  return {
    navigateToConsultation,
    exitFlow,
    confirmAndBook,
    flowState,
    buildDirectBookingUrl,
    buildAssessmentResultUrl,
    buildFollowUpUrl,
    resolveEntryPoint,
  };
}
