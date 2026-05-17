/**
 * assessmentAnalytics.ts
 * Sprint 2.2 — Funnel Tracking Placeholder
 *
 * هذا الملف فارغ عمداً في Sprint 2.2.
 * تم إنشاؤه الآن لأن الـ decomposition الحالي هو
 * perfect insertion point قبل استخراج UI components.
 *
 * يُمكّن في Sprints قادمة:
 * - funnel tracking
 * - abandonment detection
 * - hesitation timing
 * - completion analytics
 * - path-specific events
 *
 * القاعدة: لا imports من React هنا — pure event dispatchers فقط.
 */

import type { PathType, AssessmentMode } from "./assessmentTypes";

// ─── Assessment Funnel Events ─────────────────────────────────────────────────

/** يُطلق عند بدء المستخدم تعبئة الـ form لأول مرة */
export function trackFormStart(pathType: PathType, mode: AssessmentMode): void {
  // TODO: analytics.track('assessment_form_start', { pathType, mode });
  void pathType;
  void mode;
}

/** يُطلق عند submit ناجح وانتقال المستخدم للـ screening */
export function trackFormSubmit(pathType: PathType, mode: AssessmentMode): void {
  // TODO: analytics.track('assessment_form_submit', { pathType, mode });
  void pathType;
  void mode;
}

/** يُطلق عند مغادرة المستخدم صفحة التقييم بدون إتمام */
export function trackAbandonment(step: "form" | "screening" | "result"): void {
  // TODO: analytics.track('assessment_abandoned', { step });
  void step;
}

/** يُطلق عند وصول المستخدم لصفحة النتيجة (completion) */
export function trackCompletion(pathType: PathType, durationMs: number): void {
  // TODO: analytics.track('assessment_completed', { pathType, durationMs });
  void pathType;
  void durationMs;
}

/**
 * يُطلق عند توقف المستخدم عن الكتابة لأكثر من 3 ثوانٍ في حقل معين
 * (إشارة تردد محتملة — مفيدة لـ UX research)
 */
export function trackHesitation(fieldName: string, delayMs: number): void {
  // TODO: analytics.track('assessment_hesitation', { fieldName, delayMs });
  void fieldName;
  void delayMs;
}

/** يُطلق عند استعراض المستخدم لتقييم سابق من السجل */
export function trackHistoryView(pathType: PathType): void {
  // TODO: analytics.track('assessment_history_viewed', { pathType });
  void pathType;
}
