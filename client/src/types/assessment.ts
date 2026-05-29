/**
 * assessment.ts — Shared Assessment Types
 *
 * Sprint 2.2 — Step 6 Pre-work
 *
 * تم نقل هذه الأنواع من SelfAssessment.tsx إلى هنا
 * لتجنب type drift بعد استخراج AssessmentHistory.
 *
 * المستخدمون:
 *   - SelfAssessment.tsx
 *   - AssessmentHistory.tsx
 *   - AssessmentForm.tsx (مستقبلاً)
 */

/**
 * ملخص تقييم ذاتي واحد محفوظ في localStorage أو Supabase.
 * يُستخدم في: سجل التقييمات، بطاقة آخر نتيجة، التنقل للنتيجة.
 */
export interface SelfAssessmentSummary {
  id: string;
  sessionId: string;
  name: string;
  age: string | number;
  mode?: string;
  pathType: "learning" | "adhd";
  screeningType?: string;
  completedAt: string;
  resultKey: string;
}
