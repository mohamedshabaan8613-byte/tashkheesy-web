/**
 * formatDate.ts — Shared Date Formatting Utilities
 *
 * Sprint 2.2 — Step 6 Pre-work
 *
 * تم نقل formatArabicDate من SelfAssessment.tsx إلى هنا
 * لتجنب تكرار الدالة بعد استخراج AssessmentHistory.
 *
 * المستخدمون:
 *   - SelfAssessment.tsx
 *   - AssessmentHistory.tsx
 */

/**
 * تنسيق تاريخ ISO بالتقويم الهجري العربي.
 * مثال: "2024-03-15T10:00:00Z" → "١٥ مارس ١٤٤٠"
 *
 * @param isoString - تاريخ ISO 8601
 * @returns تاريخ منسَّق بالعربية، أو النص الأصلي إن فشل التحليل
 */
export function formatArabicDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return isoString;
  }
}
