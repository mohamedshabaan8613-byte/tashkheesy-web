/**
 * consultationTypes.ts — Consultation Journey Type Definitions
 *
 * Sprint 3.0 Stabilization — Architecture Review
 *
 * تغييرات هذا الإصدار:
 *   • فصل ConsultationFlowPhase (حالة الرحلة الداخلية) عن ConsultationIntent (سياق الدخول)
 *   • CONSULTATION_ROUTES: معاد تصديره من constants/consultationRoutes — لا تعريف محلي
 *   • إضافة ConsultationNavigationState لطبقة الـ recovery
 *   • إضافة ConsultationFlowTransition للـ state machine guards
 *   • تعليم intent.confirmed كـ @deprecated
 *   • إضافة ResultSeverity type للتهيؤ لـ severity-aware UX (Sprint 3.1)
 *
 * المستخدمون:
 *   - ConsultationContext.tsx
 *   - useConsultationFlow.ts
 *   - consultationHydration.ts
 *   - ConsultationIntroPage.tsx
 *   - BookingPage.tsx (Sprint 3.0c)
 */

import type { PathType, AssessmentMode } from "../lib/assessmentTypes";

// ---------------------------------------------------------------------------
// Route Registry — مصدر وحيد لجميع consultation routes
// ---------------------------------------------------------------------------

/**
 * @deprecated — استخدم المصدر الرسمي:
 *   import { CONSULTATION_ROUTES } from "../constants/consultationRoutes";
 *
 * هذا re-export مؤقت لضمان التوافق مع المستهلكين الحاليين.
 * سيُحذف هذا الـ re-export في Sprint 3.4 بعد نقل جميع المستهلكين.
 *
 * Sprint 3.3 Phase 2 Fix:
 *   التعريف المحلي السابق (missing REVIEW) حُذف واستُبدل بـ re-export.
 * كل مستهلك يستورد من هنا سيحصل تلقائيًا على REVIEW.
 */
export { CONSULTATION_ROUTES } from "../constants/consultationRoutes";

/**
 * @deprecated — استخدم:
 *   import type { ConsultationRoute } from "../constants/consultationRoutes";
 */
export type { ConsultationRoute } from "../constants/consultationRoutes";

// ---------------------------------------------------------------------------
// Entry Point — من أين جاء المستخدم?
// ---------------------------------------------------------------------------

/**
 * من أين وصل المستخدم إلى شاشة الاستشارة?
 *
 * - assessment_result  : وصل مباشرة من نتيجة تقييم
 * - direct_booking     : ضغط "احجز استشارة" من nav أو landing
 * - follow_up          : لديه جلسة سابقة ويريد متابعة
 * - returning_user     : عاد للموقع وفتح consultation من dashboard
 */
export type ConsultationEntryPoint =
  | "assessment_result"
  | "direct_booking"
  | "follow_up"
  | "returning_user";

// ---------------------------------------------------------------------------
// ResultSeverity — خطورة نتيجة التقييم
// ---------------------------------------------------------------------------

/**
 * مستوى خطورة نتيجة التقييم.
 *
 * يُستخدم مستقبلًا لتحديد UX مختلف حسب النتيجة:
 *   - high_risk        → reassurance + urgency ("يجب التحرك الآن")
 *   - moderate         → guidance-oriented ("خطوات واضحة للأمام")
 *   - low_risk         → calming + educational ("أنت بخير — إليك ما تعرفه")
 *   - needs_evaluation → inquiry ("نحتاج معلومات أكثر")
 *
 * ⚠️ ARCHITECTURE NOTE:
 *   هذا النوع مُعدّ للـ Experience Layer فقط (consultationCopy.ts).
 *   يجب ألاّ يُستخدم في:
 *     - Runtime Layer (consultationStateMachine.ts)
 *     - Orchestration Layer (consultationBookingOrchestrator.ts)
 *     - Business Layer (entitlements / payments)
 *
 * @since Sprint 3.0e — severity-aware UX يُنفّذ في Sprint 3.1
 */
export type ResultSeverity =
  | "high_risk"
  | "moderate"
  | "low_risk"
  | "needs_evaluation";

// ---------------------------------------------------------------------------
// Assessment Result Payload
// ---------------------------------------------------------------------------

export interface AssessmentResultPayload {
  sessionId: string;
  pathType: PathType;
  assessmentMode: AssessmentMode;
  resultKey: string;
  subjectName: string;
  subjectAge?: number;
  childId?: string;
  completedAt: string;
  /**
   * مستوى خطورة النتيجة — اختياري حتى يكتمل Sprint 3.1.
   * عند توفره، يُستخدم في consultationCopy.ts لتحديد UX المناسب.
   * @since Sprint 3.0e
   */
  severity?: ResultSeverity;
}

// ---------------------------------------------------------------------------
// ConsultationIntent — السياق الثابت للرحلة (immutable after creation)
// ---------------------------------------------------------------------------

/**
 * ConsultationIntent يصف لماذا وصل المستخدم.
 * يجب أن يبقى immutable context — لا يخلط طبقات flow runtime.
 *
 * يُخزَّن في sessionStorage لضمان الاستمرارية عبر navigation.
 */
export interface ConsultationIntent {
  /** من أين وصل المستخدم */
  entryPoint: ConsultationEntryPoint;
    /** معرّف فريد للنية (UUID) */
  intentId: string;

  /** بيانات التقييم إذا كان entryPoint = "assessment_result" */
  assessmentResult?: AssessmentResultPayload;

  /** معرّف الاستشارة السابقة إذا كان entryPoint = "follow_up" */
  previousConsultationId?: string;

  /** ISO 8601 — وقت بدء هذه النية */
  initiatedAt: string;

  /**
   * @deprecated — لا تستخدم هذا الحقل لتحديد حالة الرحلة.
   * بقي مؤقتًا للتوافق مع sessionStorage القديم فقط.
   * حالة الرحلة من الآن تعيش داخل useConsultationFlow بواسطة:
   * @see ConsultationFlowPhase
   */
  confirmed?: boolean;
}

// ---------------------------------------------------------------------------
// ConsultationFlowPhase — حالة runtime للرحلة (SEPARATE from intent)
// ---------------------------------------------------------------------------

/**
 * حالة runtime للمستخدم داخل consultation journey.
 *
 * هذا هو التصحيح المعماري الحقيقي:
 * ConsultationIntent = لماذا جاء المستخدم (context)
 * ConsultationFlowPhase = أين أصبح داخل الرحلة (runtime state)
 *
 * State Machine:
 * IDLE → INTRO → BOOKING → SUCCESS
 *            ⇓          ⇓
 *          EXITED      EXITED
 *            ⇓
 *          ERROR
 */
export type ConsultationFlowPhase =
  | "IDLE"     // لا توجد نية نشطة
  | "INTRO"    // في شاشة intro
  | "BOOKING"  // في شاشة الحجز
  | "SUCCESS"  // تم تأكيد الحجز
  | "EXITED"   // غادر الرحلة
  | "ERROR";   // خطأ في أحد الخطوات

/**
 * @deprecated — استخدم ConsultationFlowPhase بدلاً من هذا.
 * محتفظ به مؤقتًا لتجنب breaking changes.
 */
export type ConsultationFlowState =
  | "idle"
  | "intro"
  | "booking"
  | "confirmed"
  | "error";

// ---------------------------------------------------------------------------
// State Machine Guards
// ---------------------------------------------------------------------------

/**
 * Transitions صالحة بين الحالات.
 * تستخدم لاتخاذ قرارات التنقل داخل useConsultationFlow.
 */
export type ConsultationFlowTransition =
  | { from: "IDLE";    to: "INTRO" }
  | { from: "INTRO";   to: "BOOKING" }
  | { from: "INTRO";   to: "EXITED" }
  | { from: "BOOKING"; to: "SUCCESS" }
  | { from: "BOOKING"; to: "EXITED" }
  | { from: "BOOKING"; to: "ERROR" };

// ---------------------------------------------------------------------------
// Navigation Recovery State
// ---------------------------------------------------------------------------

/**
 * حالة التنقل تستخدم لطبقة الـ recovery.
 * تعبّر عن السياق الكامل للمستخدم عند أي نقطة.
 */
export interface ConsultationNavigationState {
  /** الحالة الحالية */
  phase: ConsultationFlowPhase;

  /** مصدر النية عند استعادة التشغيل */
  intentSource: "session" | "url" | "fresh" | "none";

  /**
   * هل تم استعادة الحالة بعد انقطاع مثل refresh أو redirect?
   */
  wasRecovered: boolean;

  /** URL الذي كان فيه المستخدم قبل الانقطاع */
  previousPath?: string;
}

// ---------------------------------------------------------------------------
// Context Value
// ---------------------------------------------------------------------------

export interface ConsultationContextValue {
  intent: ConsultationIntent | null;
  setIntent: (intent: ConsultationIntent) => void;
  clearIntent: () => void;
  isFromAssessment: boolean;
  hasActiveIntent: boolean;

  /**
   * عمر النية بالثواني — null إذا لا توجد نية
   * يُستخدم لاكتشاف النيات المنتهية الصلاحية
   */
  intentAgeSeconds: number | null;

  /**
   * مصدر النية عند mount — للـ analytics والـ debugging
   */
  intentSource: "session" | "url" | "fresh" | "none";
}
