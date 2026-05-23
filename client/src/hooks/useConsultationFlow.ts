/**
 * useConsultationFlow.ts — Consultation Journey Orchestration Hook
 *
 * Sprint 3.3 Fix — CTA Bug Resolution
 *
 * تغييرات هذا الإصدار:
 *   • [FIX] confirmAndBook → CONSULTATION_ROUTES.BOOKING (كان BOOKING_GENERIC الخاطئ)
 *   • [FIX] buildDirectBookingUrl → CONSULTATION_ROUTES.BOOKING
 *   • [FIX] navigateToBookingDirect → CONSULTATION_ROUTES.BOOKING
 *   • [FIX] حُذف BOOKING_GENERIC نهائيًا من هذا الملف
 *   • [FIX] canConfirm: يُحسب من intent وجوده فقط (أكثر مرونة ضد hydration race)
 *   • كل الـ routes تستخدم CONSULTATION_ROUTES registry (المصدر الوحيد)
 *   • confirmAndBook يستدعي setLocation مباشرة — لا useEffect side-channel
 *   • إضافة canConfirm / canExit guards
 *
 * Sprint 3.7.1 Fix:
 *   • [FIX] canExit: حذف مقارنة "SUCCESS" و"EXITED" — غير موجودتين في
 *     ConsultationFlowPhase. الحالات الصحيحة: IDLE | INTRO | BOOKING | ERROR
 */
import { useCallback, useMemo } from "react";
import { useLocation } from "wouter";
import { useConsultationContext } from "../contexts/ConsultationContext";
import { CONSULTATION_ROUTES } from "../constants/consultationRoutes";
import type {
  AssessmentResultPayload,
  ConsultationEntryPoint,
  ConsultationFlowPhase,
  ConsultationFlowState,
  ConsultationIntent,
} from "../types/consultationTypes";

// ---------------------------------------------------------------------------
// URL builders — centralized, use CONSULTATION_ROUTES only
// ---------------------------------------------------------------------------

export function buildDirectBookingUrl(): string {
  return CONSULTATION_ROUTES.BOOKING;
}

export function buildConsultationStartUrl(): string {
  return CONSULTATION_ROUTES.START;
}

export function buildAssessmentResultUrl(
  payload: Pick<AssessmentResultPayload, "pathType" | "assessmentMode">
): string {
  const params = new URLSearchParams({
    from: "assessment",
    path: payload.pathType,
    mode: payload.assessmentMode,
  });
  return `${CONSULTATION_ROUTES.START}?${params.toString()}`;
}

export function buildFollowUpUrl(previousConsultationId: string): string {
  const params = new URLSearchParams({
    from: "follow_up",
    ref: previousConsultationId,
  });
  return `${CONSULTATION_ROUTES.START}?${params.toString()}`;
}

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
// Hook return type
// ---------------------------------------------------------------------------

export interface UseConsultationFlowReturn {
  navigateToConsultation: (
    options: Omit<ConsultationIntent, "initiatedAt" | "confirmed">
  ) => void;
  exitFlow: () => void;
  confirmAndBook: () => void;
  /** @deprecated — استخدم flowPhase بدلاً */
  flowState: ConsultationFlowState;
  /** حالة الرحلة الحقيقية */
  flowPhase: ConsultationFlowPhase;
  /** جاهز للتأكيد — false فقط إذا لا يوجد intent نهائيًا */
  canConfirm: boolean;
  /** جاهز للخروج — false عند IDLE و ERROR */
  canExit: boolean;
  /** Emergency fallback */
  navigateToBookingDirect: () => void;
  buildDirectBookingUrl: typeof buildDirectBookingUrl;
  buildAssessmentResultUrl: typeof buildAssessmentResultUrl;
  buildConsultationStartUrl: typeof buildConsultationStartUrl;
  buildFollowUpUrl: typeof buildFollowUpUrl;
  resolveEntryPoint: typeof resolveEntryPoint;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useConsultationFlow(): UseConsultationFlowReturn {
  const [, setLocation] = useLocation();
  const { intent, setIntent, clearIntent } = useConsultationContext();

  const flowPhase: ConsultationFlowPhase = useMemo(() => {
    if (!intent) return "IDLE";
    if (intent.confirmed) return "BOOKING";
    return "INTRO";
  }, [intent]);

  const flowState: ConsultationFlowState = useMemo(() => {
    if (!intent) return "idle";
    if (intent.confirmed) return "booking";
    return "intro";
  }, [intent]);

  const canConfirm = useMemo(() => intent !== null, [intent]);

  /**
   * canExit
   *
   * [FIXED Sprint 3.7.1]
   * ConsultationFlowPhase = "IDLE" | "INTRO" | "BOOKING" | "ERROR"
   * السابق كان يقارن بـ "SUCCESS" و"EXITED" — لا وجود لهما في النوع.
   * الإصلاح: false فقط عند IDLE أو ERROR.
   */
  const canExit = useMemo(
    () => flowPhase !== "IDLE" && flowPhase !== "ERROR",
    [flowPhase]
  );

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

  const confirmAndBook = useCallback(() => {
    if (intent) {
      setIntent({ ...intent, confirmed: true });
    } else {
      setIntent({
        entryPoint: "direct_booking",
        initiatedAt: new Date().toISOString(),
        confirmed: true,
      });
    }
    setLocation(CONSULTATION_ROUTES.BOOKING);
  }, [intent, setIntent, setLocation]);

  const exitFlow = useCallback(() => {
    clearIntent();
  }, [clearIntent]);

  const navigateToBookingDirect = useCallback(() => {
    setLocation(CONSULTATION_ROUTES.BOOKING);
  }, [setLocation]);

  return {
    navigateToConsultation,
    exitFlow,
    confirmAndBook,
    navigateToBookingDirect,
    flowState,
    flowPhase,
    canConfirm,
    canExit,
    buildDirectBookingUrl,
    buildAssessmentResultUrl,
    buildConsultationStartUrl,
    buildFollowUpUrl,
    resolveEntryPoint,
  };
}
