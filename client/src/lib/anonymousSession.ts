/**
 * anonymousSession.ts
 * Sprint 2.3 — Issue #46: Anonymous Funnel Tracking
 *
 * يوفر anonymous_session_id ثابتاً لكل زيارة (sessionStorage)
 * حتى يمكن تتبع funnel drop-offs لغير المسجلين.
 *
 * المبدأ:
 *   - المستخدم المسجّل  → يُستخدم auth.uid() من Supabase
 *   - المستخدم غير المسجل → يُستخدم anon_{uuid} من sessionStorage
 *
 * الخصائص:
 *   - sessionStorage (وليس localStorage) → يُحذف عند إغلاق التبويب
 *   - idempotent: نفس الـ id في نفس الجلسة
 *   - prefix "anon_" يميّزه في DB عن IDs الحقيقية
 *   - لا يُخزَّن أي بيانات شخصية
 */

const ANON_SESSION_KEY = "tashkheesy_anon_session_id";

/**
 * getOrCreateAnonId
 * يُرجع anonymous session id للزيارة الحالية.
 * يُنشئه لأول مرة إذا لم يكن موجوداً.
 */
export function getOrCreateAnonId(): string {
  try {
    const existing = sessionStorage.getItem(ANON_SESSION_KEY);
    if (existing) return existing;

    const newId = `anon_${crypto.randomUUID()}`;
    sessionStorage.setItem(ANON_SESSION_KEY, newId);
    return newId;
  } catch {
    // SSR أو بيئة بدون sessionStorage — نُولّد id مؤقت (لن يُحفظ)
    return `anon_${crypto.randomUUID()}`;
  }
}

/**
 * isAnonId
 * يُرجع true إذا كان الـ id anonymous (وليس auth uid حقيقي).
 * مفيد في screeningAnalytics لتحديد حقل is_anonymous.
 */
export function isAnonId(id: string): boolean {
  return id.startsWith("anon_");
}

/**
 * clearAnonSession
 * يُستدعى بعد تسجيل الدخول لحذف الـ anon id
 * (الجلسة الآن مرتبطة بـ auth uid حقيقي).
 */
export function clearAnonSession(): void {
  try {
    sessionStorage.removeItem(ANON_SESSION_KEY);
  } catch {
    // تجاهل أخطاء sessionStorage
  }
}
