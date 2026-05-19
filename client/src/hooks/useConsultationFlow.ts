/**
 * useConsultationFlow.ts — Consultation Journey Orchestration Hook
 *
 * Sprint 3.0a | Issue #56 — useConsultationFlow hook
 *
 * هذا الـ hook هو الواجهة الوحيدة للتنقل داخل consultation journey.
 * يجمع ConsultationContext + wouter navigate في مكان واحد.
 *
 * الاستخدام:
 * // من صفحة نتيجة التقييم
 * const flow = useConsultationFlow();
 * flow.navigateToConsultation({
 *   entryPoint: "assessment_result",
 *   assessmentResult: { ... }
 * });
 *
 * // من زر الحجز المباشر
 * flow.navigateToConsultation({ entryPoint: "direct_booking" });
 */
import { useCallback } from "react";
import { useLocation } from "wouter";
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
 * بناء URL الحجز المباشر (الوجهة النهائية بعد تأكيد النية)
 */
export function buildDirectBookingUrl(): string {
  return "/booking";
}

/**
 * بناء URL intro بعد نتيجة تقييم.
 * يُمرَّر pathType + mode كـ query params للتخصيص البصري للصفحة.
 *
 * ⚠️ يجب أن يتطابق مع Route الموجود في App.tsx:
 * <Route path="/consultation/start" />
 */
export function buildAssessmentResultUrl(
  payload: Pick<AssessmentResultPayload, "pathType" | "assessmentMode">
): string {
  const params = new URLSearchParams({
    from: "assessment",
    path: payload.pathType,
    mode: payload.assessmentMode,
  });
  return `/consultation/start?${params.toString()}`;
}

/**
 * بناء URL intro للدخول المباشر بدون سياق تقييم
 */
export function buildConsultationStartUrl(): string {
  return "/consultation/start";
}

/**
 * بناء URL متابعة جلسة سابقة
 */
export function buildFollowUpUrl(previousConsultationId: string): string {
  const params = new URLSearchParams({
    from: "follow_up",
    ref: previousConsultationId,
  });
  return `/consultation/start?${params.toString()}`;
}

/**
 * استخراج EntryPoint من URL params الحالية
 * (مفيد لـ ConsultationIntroPage عند reload أو direct URL access)
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
   * الطريقة الرئيسية — تعيّن النية وتنقل لشاشة consultation intro.
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
   * يُحدِّث النية بـ confirmed: true وينقل مباشرة لـ /booking.
   * يُستدعى من زر "متابعة إلى الحجز" في ConsultationIntroPage.
   */
  confirmAndBook: () => void;

  /** الحالة الحالية للـ flow مشتقة من intent */
  flowState: ConsultationFlowState;

  // Re-export URL builders للاستخدام المباشر من الـ components
  buildDirectBookingUrl: typeof buildDirectBookingUrl;
  buildAssessmentResultUrl: typeof buildAssessmentResultUrl;
  buildConsultationStartUrl: typeof buildConsultationStartUrl;
  buildFollowUpUrl: typeof buildFollowUpUrl;
  resolveEntryPoint: typeof resolveEntryPoint;
}

export function useConsultationFlow(): UseConsultationFlowReturn {
  const [, setLocation] = useLocation();
  const { intent, setIntent, clearIntent } = useConsultationContext();

  // -------------------------------------------------------------------------
  // Derive flowState from intent
  // -------------------------------------------------------------------------
  let flowState: ConsultationFlowState = "idle";
  if (intent) {
    flowState = intent.confirmed ? "booking" : "intro";
  }

  // -------------------------------------------------------------------------
  // navigateToConsultation — sets intent + navigates to /consultation/start
  // -------------------------------------------------------------------------
  const navigateToConsultation = useCallback(
    (options: Omit<ConsultationIntent, "initiatedAt" | "confirmed">) => {
      const newIntent: ConsultationIntent = {
        ...options,
        initiatedAt: new Date().toISOString(),
        confirmed: false,
      };

      setIntent(newIntent);

      switch (options.entryPoint) {
        case "assessment_result": {
          const payload = options.assessmentResult;
          setLocation(
            payload
              ? buildAssessmentResultUrl({
                  pathType: payload.pathType,
                  assessmentMode: payload.assessmentMode,
                })
              : buildConsultationStartUrl()
          );
          break;
        }
        case "follow_up": {
          setLocation(
            options.previousConsultationId
              ? buildFollowUpUrl(options.previousConsultationId)
              : buildConsultationStartUrl()
          );
          break;
        }
        case "direct_booking":
        case "returning_user":
        default:
          setLocation(buildConsultationStartUrl());
          break;
      }
    },
    [setLocation, setIntent]
  );

  // -------------------------------------------------------------------------
  // confirmAndBook — الخطوة الأخيرة: من intro إلى /booking
  // -------------------------------------------------------------------------
  const confirmAndBook = useCallback(() => {
    if (!intent) {
      // Fallback: direct navigation even without intent
      setLocation(buildDirectBookingUrl());
      return;
    }
    setIntent({ ...intent, confirmed: true });
    setLocation(buildDirectBookingUrl());
  }, [intent, setIntent, setLocation]);

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
    buildConsultationStartUrl,
    buildFollowUpUrl,
    resolveEntryPoint,
  };
}
