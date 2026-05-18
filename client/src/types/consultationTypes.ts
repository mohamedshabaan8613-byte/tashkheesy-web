/**
 * consultationTypes.ts — Consultation Journey Type Definitions
 *
 * Sprint 3.0a | Issue #55 — ConsultationContext type definition
 *
 * هذا الملف هو المصدر الوحيد لكل أنواع consultation journey.
 * يجب ألا تُعرَّف هذه الأنواع في أي مكان آخر.
 *
 * المستخدمون:
 *   - ConsultationContext.tsx
 *   - useConsultationFlow.ts
 *   - ConsultationIntroPage.tsx (Sprint 3.0b)
 *   - BookingPage.tsx (Sprint 3.0c)
 */

import type { PathType, AssessmentMode } from "../lib/assessmentTypes";

// ---------------------------------------------------------------------------
// نقطة دخول المستخدم إلى consultation
// ---------------------------------------------------------------------------

/**
 * من أين وصل المستخدم إلى شاشة الاستشارة؟
 *
 * - assessment_result  : وصل مباشرة من نتيجة تقييم ذاتي أو تقييم طفل
 * - direct_booking     : ضغط "احجز استشارة" من nav أو landing مباشرة
 * - follow_up          : لديه جلسة سابقة ويريد متابعة
 * - returning_user     : عاد للموقع وفتح consultation من dashboard
 */
export type ConsultationEntryPoint =
  | "assessment_result"
  | "direct_booking"
  | "follow_up"
  | "returning_user";

// ---------------------------------------------------------------------------
// بيانات نتيجة التقييم التي تُمرَّر للـ consultation
// ---------------------------------------------------------------------------

/**
 * Payload كامل يصف نتيجة تقييم معيّن.
 * يُستخدم لتخصيص شاشة ConsultationIntro بناءً على السياق.
 */
export interface AssessmentResultPayload {
  /** معرّف الجلسة من screening_analytics أو localStorage */
  sessionId: string;

  /** نوع المسار: تعلّم أو ADHD */
  pathType: PathType;

  /** وضع التقييم: ذاتي / والد / legacy */
  assessmentMode: AssessmentMode;

  /**
   * مفتاح النتيجة كما هو في resultConfig
   * مثال: "high_adhd", "mild_learning", "low_concern"
   */
  resultKey: string;

  /** اسم المُقيَّم (المستخدم نفسه أو الطفل) */
  subjectName: string;

  /**
   * عمر المُقيَّم بالسنوات (undefined للمستخدم البالغ غير المُدخَل)
   */
  subjectAge?: number;

  /**
   * معرّف الطفل إذا كان التقييم لطفل (mode = parent)
   * undefined إذا كان التقييم ذاتياً
   */
  childId?: string;

  /** ISO 8601 — وقت اكتمال التقييم */
  completedAt: string;
}

// ---------------------------------------------------------------------------
// نيّة الحجز — القلب المعماري لـ Sprint 3.0
// ---------------------------------------------------------------------------

/**
 * ConsultationIntent يصف سبب وصول المستخدم لشاشة الاستشارة
 * وكل المعلومات السياقية اللازمة لتخصيص التجربة.
 *
 * يُخزَّن في sessionStorage لضمان الاستمرارية عبر navigation
 * دون الاعتماد على URL params أو React state الزائل.
 */
export interface ConsultationIntent {
  /** من أين وصل المستخدم */
  entryPoint: ConsultationEntryPoint;

  /**
   * بيانات التقييم إذا كان entryPoint = "assessment_result"
   * undefined في حالات الحجز المباشر
   */
  assessmentResult?: AssessmentResultPayload;

  /**
   * معرّف الاستشارة السابقة إذا كان entryPoint = "follow_up"
   */
  previousConsultationId?: string;

  /** ISO 8601 — وقت بدء هذه النية (للـ analytics) */
  initiatedAt: string;

  /**
   * هل تم تأكيد النية وانتقل المستخدم لخطوة الحجز الفعلية؟
   * false = في شاشة intro، true = انتقل لـ booking
   */
  confirmed: boolean;
}

// ---------------------------------------------------------------------------
// قيمة الـ Context
// ---------------------------------------------------------------------------

/**
 * ما يُعرضه ConsultationContext لكل consumer.
 */
export interface ConsultationContextValue {
  /** النية الحالية — null إذا لم تُعيَّن بعد */
  intent: ConsultationIntent | null;

  /**
   * يعيّن النية ويحفظها في sessionStorage.
   * يُستدعى من: نتيجة التقييم، زر الحجز المباشر، صفحة المتابعة.
   */
  setIntent: (intent: ConsultationIntent) => void;

  /**
   * يمسح النية بعد اكتمال الحجز أو مغادرة المستخدم.
   */
  clearIntent: () => void;

  /**
   * Helper: هل وصل المستخدم من تقييم؟
   */
  isFromAssessment: boolean;

  /**
   * Helper: هل توجد نية نشطة غير منتهية؟
   */
  hasActiveIntent: boolean;
}

// ---------------------------------------------------------------------------
// حالة التدفق الداخلية لـ useConsultationFlow
// ---------------------------------------------------------------------------

/**
 * الحالات الممكنة لرحلة المستخدم داخل consultation flow.
 */
export type ConsultationFlowState =
  | "idle"           // لا توجد نية نشطة
  | "intro"          // في شاشة intro (بعد assessment أو direct)
  | "booking"        // في شاشة الحجز الفعلية
  | "confirmed"      // تم تأكيد الحجز
  | "error";         // خطأ في أحد الخطوات
