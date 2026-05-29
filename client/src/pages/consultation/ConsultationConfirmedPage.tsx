/**
 * ConsultationConfirmedPage.tsx — Sprint 3.3
 *
 * ─── CONFIRMED_BOUNDARY ──────────────────────────────────────────────────────
 *
 * هذه الصفحة هي نهاية funnel الحجز.
 * تُعرض بعد نجاح orchestrator confirmation.
 *
 * هذه الصفحة لا تملك:
 *   ❌ persistence logic — التأكيد تم قبل الوصول هنا
 *   ❌ session mutation — الجلسة في حالة CONFIRMED
 *   ❌ booking orchestration — الـ orchestrator أنهى عمله
 *
 * Sprint 3.3: عرض فقط — minimal implementation.
 * Sprint 3.4+: يمكن إضافة booking summary وcalendar export.
 */

import { useLocation } from "wouter";
import { CONSULTATION_ROUTES } from "../../constants/consultationRoutes";

export default function ConsultationConfirmedPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4" dir="rtl">
      <div className="max-w-sm w-full text-center space-y-6">
        {/* Success icon */}
        <div className="w-16 h-16 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-green-600 dark:text-green-400"
            aria-hidden="true"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h1 className="text-xl font-semibold text-foreground">تم تأكيد حجزك</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            سيصلك تأكيد على بريدك الإلكتروني قريبًا. يمكنك إدارة مواعيدك من حسابك.
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={() => setLocation(CONSULTATION_ROUTES.START)}
          className="w-full py-3 px-6 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          العودة للرئيسية
        </button>
      </div>
    </div>
  );
}
