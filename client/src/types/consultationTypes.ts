/**
 * consultationTypes.ts — Consultation Journey Type Definitions
 *
 * Sprint 3.0 Stabilization — Architecture Review
 *
 * تغييرات هذا الإصدار:
 *   • فصل ConsultationFlowPhase (حالة الرحلة الداخلية) عن ConsultationIntent (سياق الدخول)
 *   • إضافة CONSULTATION_ROUTES registry للقضاء على hardcoded routes
 *   • إضافة ConsultationNavigationState لطبقة الـ recovery
 *   • إضافة ConsultationFlowTransition للـ state machine guards
 *   • تعليم intent.confirmed كـ @deprecated
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
 * Route Registry لكل consultation routes.
 *
 * أي تغيير في مسار يجب أن يتم هنا فقط — وينعكس تلقائياً على كل الـ hook، context،
 * والـ URL builders.
 *
 * ⚠️ يجب أن تتطابق هذه القيم مع Routes المعرفة في App.tsx
 */
export const CONSULTATION_ROUTES = {
  /** شاشة intro السياقي بعد التقييم أو الدخول المباشر */
  START: "/consultation/start",
  /** صفحة الحجز السياقي (مستقبل — Sprint 3.0c) */
  BOOKING: "/consultation/booking",
  /** صفحة الحجز العام (generic fallback) */
  BOOKING_GENERIC: "/booking",
  /** صفحة نجاح الحجز (مستقبل — Sprint 3.1) */
  SUCCESS: "/consultation/success",
} as const;

export type ConsultationRoute =
  (typeof CONSULTATION_ROUTES)[keyof typeof CONSULTATION_ROUTES];

// ---------------------------------------------------------------------------
// Entry Point — من أين جاء المستخدم?
// ---------------------------------------------------------------------------

/**
 * من أين وصل المستخدم إلى شاشة الاستشارة?
 *
 * - assessment_result  : وصل مباشرة من نتيجة تقييم
 * - direct_booking     : ضغط “احجز استشارة” من nav أو landing
 * - follow_up          : لديه جلسة سابقة ويريد متابعة
 * - returning_user     : عاد للموقع وفتح consultation من dashboard
 */
export type ConsultationEntryPoint =
  | "assessment_result"
  | "direct_booking"
  | "follow_up"
  | "returning_user";

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

  /** بيانات التقييم إذا كان entryPoint = "assessment_result" */
  assessmentResult?: AssessmentResultPayload;

  /** معرّف الاستشارة السابقة إذا كان entryPoint = "follow_up" */
  previousConsultationId?: string;

  /** ISO 8601 — وقت بدء هذه النية */
  initiatedAt: string;

  /**
   * @deprecated — لا تستخدم هذا الحقل لتحديد حالة الرحلة.
   * بقي مؤقتاً للتوافق مع sessionStorage القديم فقط.
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
 * محتفظ به مؤقتاً لتجنب breaking changes.
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
   * هل تم استعادة الحالة بعد انقطاع مثل refresh أو redirect؟
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
