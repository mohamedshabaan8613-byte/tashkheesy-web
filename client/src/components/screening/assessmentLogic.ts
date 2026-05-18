/**
 * assessmentLogic.ts
 * Sprint 2.2 — Step 3: Pure business logic
 * Sprint 2.2 — Step 7b: Added saveChildProfile + ageGroup to buildIntroUrl
 *
 * دوال خالصة (pure functions) لا تعتمد على React state.
 * قابلة للاختبار بشكل مستقل تماماً.
 *
 * القاعدة: لا imports من React أو lucide هنا.
 */

import type {
  SelfAssessmentSummary,
  SelfAssessmentProfile,
  PathType,
  AssessmentMode,
  RemoteAssessmentResult,
} from "./assessmentTypes";
import { SELF_ASSESSMENTS_KEY, AGE_MIN, AGE_MAX } from "./assessmentContent";

// ─── Normalization Layer — نقطة الدخول الوحيدة لبيانات DB/localStorage ────────────

export function normalizePathType(raw: string | null | undefined): PathType {
  if (raw === "adhd" || raw === "learning") return raw;
  return "learning";
}

export function normalizeMode(raw: string | null | undefined): AssessmentMode {
  if (raw === "self" || raw === "parent") return raw;
  return "legacy";
}

// ─── توليد session ID جديد (collision-safe) ────────────────────────────────────
export function generateSelfId(): string {
  return `self_${crypto.randomUUID()}`;
}

// ─── قراءة سجل التقييمات من localStorage ─────────────────────────────────
export function loadSelfHistory(): SelfAssessmentSummary[] {
  try {
    const raw = localStorage.getItem(SELF_ASSESSMENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as SelfAssessmentSummary[];
  } catch {
    return [];
  }
}

// ─── حفظ بروفايل جلسة self في localStorage ──────────────────────────────────
export function saveSelfProfile(
  selfId: string,
  name: string,
  age: number,
  mode: AssessmentMode,
  pathType: PathType,
): void {
  const profile: SelfAssessmentProfile = {
    id: selfId,
    name,
    age,
    mode,
    pathType,
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(`self_profile_${selfId}`, JSON.stringify(profile));
}

// ─── حفظ بروفايل جلسة child في localStorage (Step 7b) ────────────────────────
//
// childId يأتي من ChildrenPage — ليس مُولَّداً هنا.
// idempotent: آمن إذا نُودي مرتين لنفس childId.
export function saveChildProfile(
  childId: string,
  childName: string,
  childAge: number,
  pathType: PathType,
  ageGroup: string,
): void {
  const profile = {
    id: childId,
    name: childName,
    age: childAge,
    mode: "child" as AssessmentMode,
    pathType,
    ageGroup,
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(`child_profile_${childId}`, JSON.stringify(profile));
}

// ─── دمج النتائج البعيدة مع المحلية (dedup by sessionId) ─────────────────
export function mergeRemoteResults(
  local: SelfAssessmentSummary[],
  remote: RemoteAssessmentResult[],
): SelfAssessmentSummary[] {
  const localIds = new Set(local.map((item) => item.sessionId));
  const newRemote: SelfAssessmentSummary[] = remote
    .filter((r) => !localIds.has(r.sessionId))
    .map((r) => ({
      id: r.sessionId,
      sessionId: r.sessionId,
      name: r.subjectName ?? "",
      age: r.subjectAge ?? "",
      mode: normalizeMode(r.mode),
      pathType: normalizePathType(r.pathType),
      screeningType: r.screeningType ?? undefined,
      completedAt: r.completedAt ?? new Date().toISOString(),
      resultKey: `result_${r.sessionId}`,
    }));

  if (newRemote.length === 0) return local;
  return sortByDate([...local, ...newRemote]);
}

// ─── ترتيب النتائج تنازلياً بالتاريخ ───────────────────────────────────────
export function sortByDate(items: SelfAssessmentSummary[]): SelfAssessmentSummary[] {
  return [...items].sort(
    (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
  );
}

// ─── تصفية النتائج حسب المسار ──────────────────────────────────────────
export function filterByPath(
  items: SelfAssessmentSummary[],
  pathType: PathType,
): { current: SelfAssessmentSummary[]; others: SelfAssessmentSummary[] } {
  return {
    current: items.filter((item) => item.pathType === pathType),
    others:  items.filter((item) => item.pathType !== pathType),
  };
}

// ─── التحقق من صحة مدخلات الـ form ────────────────────────────────────
export interface FormValidationResult {
  valid: boolean;
  nameError: string;
  ageError: string;
}

export function validateForm(
  name: string,
  age: string,
  copy: {
    nameError: string;
    ageErrorEmpty: string;
    ageErrorMin: string;
    ageErrorMax: string;
  },
): FormValidationResult {
  let valid = true;
  let nameError = "";
  let ageError = "";

  if (!name.trim()) {
    nameError = copy.nameError;
    valid = false;
  }

  const ageNum = parseInt(age, 10);
  if (!age || isNaN(ageNum)) {
    ageError = copy.ageErrorEmpty;
    valid = false;
  } else if (ageNum < AGE_MIN) {
    ageError = copy.ageErrorMin;
    valid = false;
  } else if (ageNum > AGE_MAX) {
    ageError = copy.ageErrorMax;
    valid = false;
  }

  return { valid, nameError, ageError };
}

// ─── تنسيق التاريخ بالعربية ─────────────────────────────────────────────────
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

// ─── بناء redirect URL آمن ─────────────────────────────────────────────────────
export function buildSafeRedirect(pathname: string, search: string): string {
  const currentPath = pathname + search;
  return currentPath.startsWith("/") && !currentPath.startsWith("//")
    ? currentPath
    : "/self-assessment";
}

// ─── بناء navigation URL للنتيجة ─────────────────────────────────────────────
export function buildResultUrl(sessionId: string, name: string, pathType: PathType): string {
  return `/screening-result/${sessionId}?name=${encodeURIComponent(name)}&pathType=${pathType}`;
}

// ─── بناء navigation URL للـ screening-intro ──────────────────────────────────────
//
// ageGroup اختياري — backward compatible.
// مسار self: لا يمرر ageGroup → لا تغيير.
// مسار child: يمرر ageGroup → يُضاف &ageGroup=... للـ URL.
export function buildIntroUrl(
  selfId: string,
  name: string,
  age: number,
  mode: string,
  pathType: PathType,
  ageGroup?: string,
): string {
  const base = `/screening-intro/${selfId}?name=${encodeURIComponent(name)}&age=${age}&mode=${mode}&pathType=${pathType}`;
  return ageGroup ? `${base}&ageGroup=${encodeURIComponent(ageGroup)}` : base;
}
