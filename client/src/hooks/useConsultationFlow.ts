/**
 * useConsultationFlow.ts — Consultation Journey Orchestration Hook
 *
 * Sprint 3.0 Stabilization — Architecture Review
 *
 * تغييرات هذا الإصدار:
 *   • كل الـ routes أصبحت تستخدم CONSULTATION_ROUTES registry
 *   • إضافة flowPhase (ConsultationFlowPhase) منفصلة عن flowState
 *   • confirmAndBook يستدعي setLocation مباشرة — لا useEffect side-channel
 *   • إضافة canConfirm / canExit guards
 *   • إضافة navigateToBookingDirect() للـ emergency fallback
 */
import { useCallback, useMemo } from "react";
import { useLocation } from "wouter";
import { useConsultationContext } from "../contexts/ConsultationContext";
import {
  CONSULTATION_ROUTES,
  type AssessmentResultPayload,
  type ConsultationEntryPoint,
  type ConsultationFlowPhase,
  type ConsultationFlowState,
  type ConsultationIntent,
} from "../types/consultationTypes";

// ---------------------------------------------------------------------------
// URL builders — centralized, use CONSULTATION_ROUTES only
// ---------------------------------------------------------------------------

export function buildDirectBookingUrl(): string {
  return CONSULTATION_ROUTES.BOOKING_GENERIC;
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
  /** حالة الرحلة الحقيقية — تستخدم هذا بدلاً من flowState */
  flowPhase: ConsultationFlowPhase;
  /** جاهز للتأكيد — false إذا لا توجد نية نشطة */
  canConfirm: boolean;
  /** جاهز للخروج — false عند IDLE و SUCCESS و EXITED */
  canExit: boolean;
  /** Emergency fallback: ينقل لـ /booking بدون تعديل intent */
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

  // ─ flowPhase — حالة runtime منفصلة عن intent
  const flowPhase: ConsultationFlowPhase = useMemo(() => {
    if (!intent) return "IDLE";
    if (intent.confirmed) return "BOOKING";
    return "INTRO";
  }, [intent]);

  // ─ flowState (محتفظ للتوافق الخلفي)
  const flowState: ConsultationFlowState = useMemo(() => {
    if (!intent) return "idle";
    if (intent.confirmed) return "booking";
    return "intro";
  }, [intent]);

  const canConfirm = useMemo(
    () => flowPhase === "INTRO" && intent !== null,
    [flowPhase, intent]
  );

  const canExit = useMemo(
    () =>
      flowPhase !== "IDLE" &&
      flowPhase !== "SUCCESS" &&
      flowPhase !== "EXITED",
    [flowPhase]
  );

  // ─ navigateToConsultation
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

  // ─ confirmAndBook — يستدعي setLocation مباشرة
  const confirmAndBook = useCallback(() => {
    if (intent) {
      setIntent({ ...intent, confirmed: true });
    }
    // التنقل مباشرة — لا نعتمد على useEffect
    setLocation(CONSULTATION_ROUTES.BOOKING_GENERIC);
  }, [intent, setIntent, setLocation]);

  // ─ exitFlow
  const exitFlow = useCallback(() => {
    clearIntent();
  }, [clearIntent]);

  // ─ navigateToBookingDirect — emergency fallback
  const navigateToBookingDirect = useCallback(() => {
    setLocation(CONSULTATION_ROUTES.BOOKING_GENERIC);
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
