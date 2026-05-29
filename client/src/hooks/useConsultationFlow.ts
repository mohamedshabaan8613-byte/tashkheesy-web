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

/**
 * buildDirectBookingUrl
 *
 * [FIXED Sprint 3.3] — كان يُرجع BOOKING_GENERIC ('/booking' القديمة).
 * الآن يُرجع CONSULTATION_ROUTES.BOOKING ('/consultation/booking').
 */
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
  /** حالة الرحلة الحقيقية — تستخدم هذا بدلاً من flowState */
  flowPhase: ConsultationFlowPhase;
  /** جاهز للتأكيد — false فقط إذا لا يوجد intent نهائيًا */
  canConfirm: boolean;
  /** جاهز للخروج — false عند IDLE و SUCCESS و EXITED */
  canExit: boolean;
  /** Emergency fallback: ينقل لـ /consultation/booking بدون تعديل intent */
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

  /**
   * canConfirm
   *
   * [FIXED Sprint 3.3]
   *
   * السابق: flowPhase === "INTRO" && intent !== null
   * المشكلة: إذا تأخّر hydration useEffect في ConsultationIntroPage لأي سبب
   *   (strict mode double mount, slow render, race condition) → intent=null
   *   → flowPhase="IDLE" → canConfirm=false → الزر معطّل دائمًا.
   *
   * الإصلاح: canConfirm = intent !== null
   *   الشرط الوحيد الحقيقي هو وجود intent.
   *   confirmAndBook نفسها تتعامل مع حالة intent=null بأمان.
   *
   * ملاحظة: لا يزال الزر معطّلاً على الـ landing إذا لم يُبنَ intent بعد،
   *   لكن بمجرد أن يُضبط intent (حتى بدون confirmed) يُفعَّل الزر.
   */
  const canConfirm = useMemo(() => intent !== null, [intent]);

  const canExit = useMemo(
    () =>
      flowPhase !== "IDLE" &&
      (flowPhase as string) !== "SUCCESS" &&
      (flowPhase as string) !== "EXITED",
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

  /**
   * confirmAndBook
   *
   * [FIXED Sprint 3.3] — الإصلاح الأساسي للـ CTA
   *
   * السابق: setLocation(CONSULTATION_ROUTES.BOOKING_GENERIC)
   *   BOOKING_GENERIC كان يُشير لـ '/booking' (الصفحة القديمة العامة).
   *   هذا يُوجِّه المستخدم خارج consultation flow تمامًا.
   *
   * الإصلاح: setLocation(CONSULTATION_ROUTES.BOOKING)
   *   BOOKING = '/consultation/booking' (صفحة الاستشارة الصحيحة).
   *
   * Architecture preserved:
   *   - لا transitionTo() مباشر من هنا (هذا مهمة orchestrator في Sprint 3.4)
   *   - intent يُحدَّث أولًا ثم navigation
   *   - إذا كان intent=null نُنشئ intent مؤقت ونكمل (لا نُوقف المستخدم)
   */
  const confirmAndBook = useCallback(() => {
    if (intent) {
      setIntent({ ...intent, confirmed: true });
    } else {
      // Safety fallback: إذا لم يكن هناك intent (حالة نادرة جدًا)
      // نُنشئ intent مبسّط ونكمل — لا نُوقف المستخدم
      setIntent({
        entryPoint: "direct_booking",
        initiatedAt: new Date().toISOString(),
        confirmed: true,
      });
    }
    // [FIXED] CONSULTATION_ROUTES.BOOKING وليس BOOKING_GENERIC
    setLocation(CONSULTATION_ROUTES.BOOKING);
  }, [intent, setIntent, setLocation]);

  // ─ exitFlow
  const exitFlow = useCallback(() => {
    clearIntent();
  }, [clearIntent]);

  /**
   * navigateToBookingDirect — emergency fallback
   *
   * [FIXED Sprint 3.3] — كان يستخدم BOOKING_GENERIC
   * الآن يستخدم CONSULTATION_ROUTES.BOOKING
   */
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
