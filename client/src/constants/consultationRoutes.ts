/**
 * consultationRoutes.ts — Sprint 3.3 Fix N4
 *
 * CONSULTATION_ROUTES: المصدر الوحيد لمسارات الاستشارة.
 *
 * ─── لماذا هذا الملف موجود؟ ───────────────────────────────────────────────
 *
 * قبل هذا الملف:
 *   كل navigate() وكل <Route path="..."> كانت strings مكتوبة يدويًا.
 *   تغيير مسار واحد = بحث يدوي في كل الـ codebase.
 *   لا يوجد compile-time safety.
 *
 * بعد هذا الملف:
 *   كل Route في App.tsx → CONSULTATION_ROUTES.START
 *   كل navigate() في الصفحات → CONSULTATION_ROUTES.REVIEW
 *   تغيير مسار = تغيير في هذا الملف فقط.
 *   TypeScript يضمن استخدام قيم صحيحة.
 *
 * ─── قواعد الاستخدام ──────────────────────────────────────────────────────
 *
 * ✅ استخدم في:
 *   - App.tsx: <Route path={CONSULTATION_ROUTES.START} .../>
 *   - أي navigate() داخل صفحات الاستشارة
 *   - أي Link أو href داخل funnel الاستشارة
 *
 * ❌ لا تستخدم:
 *   - strings مباشرة مثل "/consultation/review" في أي مكان
 *   - بناء المسارات يدويًا بـ string concatenation
 *
 * ─── إضافة مسار جديد ─────────────────────────────────────────────────────
 *
 * أضفه هنا فقط. لا تضيف strings في أي ملف آخر.
 * مثال:
 *   CONFIRMATION: "/consultation/confirmation",
 */

export const CONSULTATION_ROUTES = {
  /** صفحة البداية — نقطة الدخول الأولى للـ funnel */
  START: "/consultation/start",

  /** صفحة اختيار الأخصائي والموعد */
  BOOKING: "/consultation/booking",

  /**
   * صفحة مراجعة الحجز — UX boundary قبل persistence commit.
   *
   * Sprint 3.3 Phase 1: عرض فقط.
   * Sprint 3.3 Phase 4: سيضاف تأكيد عبر orchestrator.
   */
  REVIEW: "/consultation/review",
} as const;

/** Type مشتق لضمان استخدام قيم CONSULTATION_ROUTES فقط */
export type ConsultationRoute =
  (typeof CONSULTATION_ROUTES)[keyof typeof CONSULTATION_ROUTES];
