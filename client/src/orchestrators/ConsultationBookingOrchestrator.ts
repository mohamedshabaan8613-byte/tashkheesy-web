/**
 * ConsultationBookingOrchestrator.ts — Sprint 3.1 Pre-Priority-3
 *
 * طبقة orchestration بين UI و ConsultationBookingContext.
 *
 * المبدأ:
 *   UI → Orchestrator → BookingContext → Repository
 *
 *   وليس:
 *   UI → startBookingSession() مباشرة
 *
 * لماذا orchestrator وليس UI مباشرة؟
 *   - في Sprint 3.2+: entitlement check سيكون هنا، ليس في button click
 *   - في Sprint 3.3+: specialist availability check هنا
 *   - في Sprint 3.4+: backend validation هنا
 *   - الـ UI لا يعرف هذه التفاصيل — يرسل payload فقط
 *
 * ❌ لا يحتوي هذا الملف على:
 *   - React hooks
 *   - استدعاء أي Context
 *   - UI لوجيك
 *
 * ✅ يحتوي فقط على:
 *   - Validation logic
 *   - Entitlement check (placeholder الآن)
 *   - Session creation payload building
 *   - تحويل النتيجة للـ hook المستخدم
 */

import type {
  BookingEntitlementType,
  BookingEntryPoint,
  ConsultationBookingSession,
  SpecialistRecommendation,
} from "../types/consultationBookingTypes";

// ─── Orchestrator Input ─────────────────────────────────────────────────
/**
 * ما يرسله الـ UI إلى الـ orchestrator.
 * لا يحتوي على أي نتائج — فقط وصف النية.
 */
export interface BookingInitPayload {
  /** من ConsultationContext.intent.intentId */
  consultationIntentId: string;
  /** من أين دخل المستخدم */
  entryPoint: BookingEntryPoint;
  /** إذا جاء من تقييم */
  assessmentSessionId?: string;
  /** إذا كانت التوصية جاهزة من التقييم */
  specialistRecommendation?: SpecialistRecommendation;
}

// ─── Orchestrator Result ───────────────────────────────────────────────
export type BookingInitResult =
  | { ok: true;  session: ConsultationBookingSession }
  | { ok: false; reason: "entitlement_expired" | "already_active" | "validation_failed"; message: string };

// ─── Entitlement Resolution (placeholder Sprint 3.1) ─────────────────────
/**
 * يحدد نوع الاستحقاق بناءً على المدخل.
 *
 * الآن (Sprint 3.1): بسيط — كل مدخل post_assessment يحصل free_first_consultation.
 * Sprint 3.2+: سيُربط بنظام الاشتراكات والدفع.
 */
function resolveEntitlement(payload: BookingInitPayload): BookingEntitlementType {
  switch (payload.entryPoint) {
    case "post_assessment":
    case "post_screening":
      return "free_first_consultation";
    case "specialist_match":
    case "consultation_intro":
      return "paid_consultation";
    case "direct_navigation":
      return "paid_consultation";
    default:
      return "paid_consultation";
  }
}

// ─── Validation ─────────────────────────────────────────────────────────
function validatePayload(payload: BookingInitPayload): string | null {
  if (!payload.consultationIntentId?.trim()) {
    return "consultationIntentId مطلوب لبدء جلسة الحجز";
  }
  if (!payload.entryPoint) {
    return "entryPoint مطلوب لـ orchestration";
  }
  return null;
}

// ─── createBookingSession ──────────────────────────────────────────────
/**
 * createBookingSession — نقطة الدخول الوحيدة لإنشاء جلسة حجز.
 *
 * يستدعى هذا من useConsultationBookingOrchestrator hook
 * الذي يجسّر بين الـ payload و startBookingSession().
 *
 * التحققات التي يجريها:
 *   1. تحقق payload (consultationIntentId + entryPoint)
 *   2. وضع entitlementType بناءً على entryPoint
 *   3. يحوّل النتيجة إلى BookingInitResult
 *
 * Sprint 3.2+:
 *   أضف هنا:
 *     - checkEntitlementFromBackend(userId)
 *     - checkSpecialistAvailability(specialistId)
 *     - debitEntitlement()
 */
export function createBookingSession(
  payload: BookingInitPayload,
  startSession: (params: {
    consultationIntentId: string;
    entryPoint: BookingEntryPoint;
    entitlementType: BookingEntitlementType;
    assessmentSessionId?: string;
    specialistRecommendation?: SpecialistRecommendation;
  }) => ConsultationBookingSession
): BookingInitResult {
  // 1. Validation
  const validationError = validatePayload(payload);
  if (validationError) {
    return { ok: false, reason: "validation_failed", message: validationError };
  }

  // 2. Entitlement resolution
  const entitlementType = resolveEntitlement(payload);

  // 3. Create session via context
  const session = startSession({
    consultationIntentId: payload.consultationIntentId,
    entryPoint: payload.entryPoint,
    entitlementType,
    assessmentSessionId: payload.assessmentSessionId,
    specialistRecommendation: payload.specialistRecommendation,
  });

  return { ok: true, session };
}

// ─── useConsultationBookingOrchestrator (hook مساعد) ──────────────────────
/**
 * useConsultationBookingOrchestrator — hook تستخدمه صفحات الدخول.
 *
 * يجسّر بين الـ UI و orchestration layer.
 * الـ UI لا تستدعي startBookingSession() مباشرة.
 *
 * الاستخدام:
 * ```tsx
 * const { initBooking } = useConsultationBookingOrchestrator();
 *
 * const result = initBooking({
 *   consultationIntentId: intent.intentId,
 *   entryPoint: "post_assessment",
 *   assessmentSessionId: session.id,
 * });
 *
 * if (!result.ok) {
 *   showError(result.message);
 *   return;
 * }
 *
 * navigate("/consultation/booking");
 * ```
 */
export function useConsultationBookingOrchestrator() {
  // نتجنب import مباشر لـ ConsultationBookingContext هنا
  // لذلك نستخدم dynamic import موجود في React core
  const { useConsultationBooking } = require("../contexts/ConsultationBookingContext") as
    { useConsultationBooking: () => { startBookingSession: (p: Parameters<typeof createBookingSession>[1]) => ConsultationBookingSession } };

  const { startBookingSession } = useConsultationBooking();

  return {
    /**
     * initBooking — نقطة الدخول الوحيدة من الـ UI.
     * تستدعي هذا بدل startBookingSession() مباشرة.
     */
    initBooking: (payload: BookingInitPayload): BookingInitResult =>
      createBookingSession(payload, startBookingSession),
  };
}
