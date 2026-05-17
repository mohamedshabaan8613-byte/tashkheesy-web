/**
 * assessmentTypes.ts
 * Sprint 2.2 — Step 1: Static type definitions
 *
 * يحتوي على كل الأنواع المشتركة بين طبقات الـ assessment.
 * لا يحتوي على أي منطق أو JSX.
 */

// ─── مسارات الفحص ─────────────────────────────────────────────────────────────
export type PathType = "learning" | "adhd";
export type AssessmentMode = "self" | "parent";

// ─── ملخص تقييم ذاتي (يُخزن في localStorage وSupabase) ──────────────────────
export interface SelfAssessmentSummary {
  id: string;
  sessionId: string;
  name: string;
  age: string | number;
  mode?: AssessmentMode | string;
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
  mode: AssessmentMode | string;
  pathType: PathType;
  createdAt: string;
}

// ─── نتيجة fetch بعيدة من Supabase ──────────────────────────────────────────
export interface RemoteAssessmentResult {
  sessionId: string;
  subjectName?: string | null;
  subjectAge?: string | number | null;
  pathType?: string | null;
  screeningType?: string | null;
  completedAt?: string | null;
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
