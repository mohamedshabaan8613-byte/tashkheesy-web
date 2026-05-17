/**
 * assessmentTypes.ts
 * Sprint 2.2 — Step 1: Static type definitions
 *
 * يحتوي على كل الأنواع المشتركة بين طبقات الـ assessment.
 * لا يحتوي على أي منطق أو JSX.
 */

// ─── مسارات الفحص ─────────────────────────────────────────────────────────────
export type PathType = "learning" | "adhd";

/**
 * AssessmentMode — strict union بدون | string.
 * "legacy" تُستخدم كـ fallback لقيم قديمة في Supabase/localStorage.
 * normalizeMode() في assessmentLogic.ts هي نقطة الدخول الوحيدة.
 */
export type AssessmentMode = "self" | "parent" | "legacy";

// ─── ملخص تقييم ذاتي (يُخزن في localStorage وSupabase) ──────────────────────
export interface SelfAssessmentSummary {
  id: string;
  sessionId: string;
  name: string;
  age: string | number;
  mode?: AssessmentMode;        // لا | string — استخدم normalizeMode() عند الإدخال
  pathType: PathType;
  screeningType?: string;
  completedAt: string;
  resultKey: string;
}

// ─── ملف بروفايل الجلسة (يُخزن في localStorage) ─────────────────────────────
export interface SelfAssessmentProfile {
  id: string;
  name: string;
  age: number;
  mode: AssessmentMode;         // لا | string — normalizeMode() قبل الحفظ
  pathType: PathType;
  createdAt: string;
}

// ─── نتيجة fetch بعيدة من Supabase ──────────────────────────────────────────
// pathType و mode هنا string | null عمداً — البيانات الخام من DB.
// normalizePathType() و normalizeMode() في assessmentLogic.ts هما نقطة التطهير.
export interface RemoteAssessmentResult {
  sessionId: string;
  subjectName?: string | null;
  subjectAge?: string | number | null;
  pathType?: string | null;     // raw DB value — طبّق normalizePathType() قبل الاستخدام
  screeningType?: string | null;
  completedAt?: string | null;
  mode?: string | null;         // raw DB value — طبّق normalizeMode() قبل الاستخدام
}

// ─── حالة الـ form ────────────────────────────────────────────────────────────
export interface AssessmentFormState {
  name: string;
  age: string;
  nameError: string;
  ageError: string;
}

// ─── حالة الـ UI العامة ───────────────────────────────────────────────────────
export interface AssessmentUIState {
  visible: boolean;
  showAllHistory: boolean;
}
