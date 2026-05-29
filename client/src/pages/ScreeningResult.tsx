/**
 * ScreeningResult.tsx — Sprint 3.1 Post-Hardening (6 Points)
 *
 * ─── WIRING RULES ──────────────────────────────────────────────────────────────
 * ✅ مسموح:
 *   - startFromAssessment()  ← من useConsultationBookingAdapter
 *   - setLocation(result.nextRoute)  ← بناءً على ما يُعيده orchestrator
 *   - resolveBookingDenialPresentation()  ← لتحويل domain code → UX copy
 *   - useConsultationContext()  ← لقراءة intent فقط
 *
 * ❌ ممنوع:
 *   - بناء BookingSessionPayload يدوياً
 *   - حساب entitlementType
 *   - تحديد route يدوياً
 *   - Supabase / payments / AI matching
 *
 * ─── GUARD_HOOK_BOUNDARY (Point 1) ────────────────────────────────────────────
 * useAssessmentGuard() يحتوي فقط:
 * ✅ validate intent presence
 * ✅ validate entryPoint === "assessment_result"
 * ✅ redirect invalid access → /consultation/start
 *
 * ❌ ممنوع داخل useAssessmentGuard():
 * ❌ analytics / tracking
 * ❌ hydration / session restoration
 * ❌ booking recovery logic
 * ❌ UI copy decisions
 * ❌ entitlement checks
 * ──────────────────────────────────────────────────────────────────────────
 */

import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useConsultationContext } from "../contexts/ConsultationContext";
import {
  resolveBookingDenialPresentation,
  useConsultationBookingAdapter,
} from "../hooks/useConsultationBooking";
import type { BookingDenialPresentation } from "../hooks/useConsultationBooking";
import { resolveRecoveryPolicy } from "../utils/recoveryPolicy";

// ─── GUARD_HOOK_BOUNDARY (Point 1) ───────────────────────────────────────────
/**
 * useAssessmentGuard — guard محدود المسؤولية.
 *
 * مسموح فقط:
 *   ✅ validate intent presence
 *   ✅ validate entryPoint === "assessment_result"
 *   ✅ redirect invalid access
 *
 * ممنوع إضافة مستقبلاً:
 *   ❌ analytics events
 *   ❌ booking session hydration
 *   ❌ entitlement resolution
 *   ❌ recovery logic
 *   ❌ UI state decisions
 *
 * إذا كبيرت هذه الدالة عن 3-4 سطور —
 * أنت تُضيف شيئًا خارج مسؤوليته.
 */
function useAssessmentGuard() {
  const { intent, hasActiveIntent } = useConsultationContext();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!hasActiveIntent || intent?.entryPoint !== "assessment_result") {
      setLocation("/consultation/start");
    }
  }, [hasActiveIntent, intent, setLocation]);

  return {
    intent,
    isReady: hasActiveIntent && intent?.entryPoint === "assessment_result",
  };
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function DenialCard({ presentation, onAction }: {
  presentation: BookingDenialPresentation;
  onAction: () => void;
}) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-950">
      {presentation.title && (
        <h3 className="mb-2 text-lg font-semibold text-red-800 dark:text-red-200">
          {presentation.title}
        </h3>
      )}
      <p className="mb-4 text-sm text-red-700 dark:text-red-300">
        {presentation.userMessage}
      </p>
      {presentation.actionLabel && presentation.recoveryAction !== "none" && (
        <button
          onClick={onAction}
          className="rounded-lg bg-red-600 px-5 py-2 text-sm font-medium text-white hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
        >
          {presentation.actionLabel}
        </button>
      )}
    </div>
  );
}

function ConfirmResumeDialog({ presentation, onConfirm, onDismiss }: {
  presentation: BookingDenialPresentation;
  onConfirm: () => void;
  onDismiss: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="resume-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
        <h2 id="resume-dialog-title" className="mb-3 text-lg font-semibold">
          {presentation.title ?? "تأكيد"}
        </h2>
        <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
          {presentation.userMessage}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className="flex-1 rounded-lg bg-teal-600 py-2 text-sm font-medium text-white hover:bg-teal-700"
          >
            {presentation.actionLabel ?? "تأكيد"}
          </button>
          <button
            onClick={onDismiss}
            className="flex-1 rounded-lg border border-gray-200 py-2 text-sm font-medium dark:border-gray-700"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ScreeningResult() {
  const [, setLocation] = useLocation();
  const { intent, isReady } = useAssessmentGuard();
  const { startFromAssessment } = useConsultationBookingAdapter();

  const [isStarting, setIsStarting]   = useState(false);
  const [denial, setDenial]           = useState<BookingDenialPresentation | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  if (!isReady || !intent) return null;

  const assessmentResult    = intent.assessmentResult;
  const assessmentSessionId = intent.assessmentSessionId ?? "";

  // ─── Start Booking ────────────────────────────────────────────────────────
  function handleStartBooking() {
    if (!intent?.intentId || !assessmentSessionId) return;

    setIsStarting(true);
    setDenial(null);

    const result = startFromAssessment({
      consultationIntentId: intent.intentId ?? "",
      assessmentSessionId,
      specialistRecommendation: intent.specialistRecommendation,
    });

    if (result.success) {
      // ✅ Point 2: navigate بناءً على result.nextRoute من orchestrator
      // nextRoute مقيد بـ ConsultationRoute type — لا hardcoded strings
      setLocation(result.nextRoute);
      return;
    }

    const presentation = resolveBookingDenialPresentation(result.denialReason);

    // ✅ Point 5: استخدام RecoveryPolicy لتحديد UX pattern
    const policy = resolveRecoveryPolicy(presentation.recoveryAction, null);

    if (policy.execution === "USER_CONFIRMATION_REQUIRED") {
      setShowConfirm(true);
      setDenial(presentation);
      setIsStarting(false);
      return;
    }

    setDenial(presentation);
    setIsStarting(false);
  }

  // ─── Recovery ────────────────────────────────────────────────────────────
  function handleRecoveryAction(presentation: BookingDenialPresentation) {
    switch (presentation.recoveryAction) {
      case "redirect_to_assessment":  setLocation("/assessment"); break;
      case "redirect_to_payment":     setLocation("/consultation/start"); break;
      case "resume_active_booking":   setLocation("/consultation/booking"); break;
      case "show_retry_dialog":       setDenial(null); break;
      case "contact_support":         setLocation("/contact"); break;
      default:                        setDenial(null);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 dark:bg-gray-950">
      <div className="mx-auto max-w-2xl">

        <header className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900">
            <svg aria-hidden="true" className="h-8 w-8 text-teal-600 dark:text-teal-300"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            نتائج التقييم
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            استناداً إلى إجاباتك، فيما يلي ملخص نتائج التقييم
          </p>
        </header>

        {assessmentResult && (
          <section
            aria-label="ملخص نتائج التقييم"
            className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900"
          >
            {assessmentResult.severityLevel && (
              <div className="mb-4">
                <span className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  مستوى الأعراض
                </span>
                <p className="mt-1 text-lg font-semibold capitalize text-gray-900 dark:text-white">
                  {assessmentResult.severityLevel}
                </p>
              </div>
            )}
            {assessmentResult.summary && (
              <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                {assessmentResult.summary}
              </p>
            )}
          </section>
        )}

        {denial && !showConfirm && (
          <div className="mb-6">
            <DenialCard
              presentation={denial}
              onAction={() => handleRecoveryAction(denial)}
            />
          </div>
        )}

        <div className="text-center">
          <button
            onClick={handleStartBooking}
            disabled={isStarting}
            aria-busy={isStarting}
            className="w-full rounded-xl bg-teal-600 px-8 py-4 text-base font-semibold text-white shadow-sm transition hover:bg-teal-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {isStarting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10"
                    stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                جاري التحضير...
              </span>
            ) : "احجز استشارتك المجانية الآن"}
          </button>
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            سيتم اختيار الأخصائي الأنسب بناءً على نتائج تقييمك
          </p>
        </div>

      </div>

      {showConfirm && denial && (
        <ConfirmResumeDialog
          presentation={denial}
          onConfirm={() => { setShowConfirm(false); handleRecoveryAction(denial); }}
          onDismiss={() => { setShowConfirm(false); setDenial(null); }}
        />
      )}
    </main>
  );
}
