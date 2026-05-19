/**
 * ConsultationIntroPage.tsx — Contextual Consultation Intro
 *
 * Sprint 3.0d | Phase 2 — Experience Layer
 *
 * صفحة كاملة سياقية ل /consultation/start.
 *
 * ما تغيّر:
 *   - تعيد contextual rendering بالكامل بناءً على consultationCopy.ts
 *   - assessment-aware: يظهر ResultSummaryCard عند قدومه من تقييم
 *   - emotional UX: emotionalCue تظهر أسفل العنوان مباشرة
 *   - CTA differentiation: نص الزر يتغيّر حسب entryPoint
 *   - contextual back: يعود لـ screening-result إن وُجد sessionId
 *   - WhatToExpectCard: 3 خطوات تتكيّف مع entryPoint
 *
 * لا يحتوي على: entitlements, payment, billing, credits
 */

import { useEffect } from "react";
import { useConsultationContext } from "../../contexts/ConsultationContext";
import { useConsultationFlow } from "../../hooks/useConsultationFlow";
import {
  resolveIntroCopy,
  resolveCtaLabel,
  resolveSteps,
  resolveResultSummary,
  type ResultSummaryCopy,
  type StepCopy,
} from "../../lib/consultationCopy";
import type { AssessmentResultPayload } from "../../types/consultationTypes";

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ConsultationIntroPage() {
  const { intent, setIntent, hasActiveIntent } = useConsultationContext();
  const { confirmAndBook, resolveEntryPoint, canConfirm } =
    useConsultationFlow();

  // ── Hydration guard: إعادة بناء intent من URL عند reload / direct link
  useEffect(() => {
    if (hasActiveIntent) return;

    const search =
      typeof window !== "undefined" ? window.location.search : "";
    const entryPoint = resolveEntryPoint(new URLSearchParams(search));

    setIntent({
      entryPoint,
      initiatedAt: new Date().toISOString(),
    });
  }, [hasActiveIntent, resolveEntryPoint, setIntent]);

  // ── Copy resolution
  const copy = resolveIntroCopy(intent);
  const ctaLabel = resolveCtaLabel(intent?.entryPoint);
  const steps = resolveSteps(intent?.entryPoint);
  const assessmentResult = intent?.assessmentResult;
  const isFromAssessment =
    intent?.entryPoint === "assessment_result" &&
    assessmentResult !== undefined;

  // ── Back handler
  const handleBack = () => {
    if (assessmentResult?.sessionId) {
      window.location.href = `/screening-result/${assessmentResult.sessionId}`;
      return;
    }
    window.history.back();
  };

  return (
    <main
      className="min-h-screen bg-[#f7f6f2] px-4 py-12"
      dir="rtl"
      aria-labelledby="consultation-intro-heading"
    >
      <div className="mx-auto max-w-3xl space-y-6">

        {/* ── Assessment Result Summary Card — يظهر فقط إن جاء من تقييم ── */}
        {isFromAssessment && assessmentResult && (
          <ResultSummaryCard result={assessmentResult} />
        )}

        {/* ── Main Card ── */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">

          {/* Badge */}
          <span className="mb-4 inline-flex rounded-full bg-teal-50 px-4 py-2 text-sm font-medium text-teal-700">
            {copy.badge}
          </span>

          {/* Heading */}
          <h1
            id="consultation-intro-heading"
            className="mb-2 text-2xl font-bold text-slate-900 leading-snug"
          >
            {copy.title}
          </h1>

          {/* Emotional Cue — Phase 2 addition */}
          <p className="mb-5 text-sm font-medium text-teal-700">
            {copy.emotionalCue}
          </p>

          {/* Description */}
          <p className="mb-8 text-base leading-7 text-slate-600">
            {copy.description}
          </p>

          {/* What to Expect Steps */}
          <WhatToExpectCard steps={steps} />

          {/* CTAs */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={confirmAndBook}
              disabled={!canConfirm}
              aria-disabled={!canConfirm}
              className="rounded-2xl bg-[#0f766e] px-6 py-3 text-base font-semibold text-white transition hover:bg-[#115e59] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {ctaLabel}
            </button>
            <button
              type="button"
              onClick={handleBack}
              className="rounded-2xl border border-slate-300 px-6 py-3 text-base font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              رجوع
            </button>
          </div>

          {/* Privacy Notice */}
          <PrivacyNotice />
        </div>

      </div>
    </main>
  );
}

// ---------------------------------------------------------------------------
// ResultSummaryCard — بطاقة تلخيص نتيجة التقييم
// ---------------------------------------------------------------------------

function ResultSummaryCard({ result }: { result: AssessmentResultPayload }) {
  const summary: ResultSummaryCopy = resolveResultSummary(result);

  return (
    <div
      className="rounded-2xl border border-teal-100 bg-teal-50 px-6 py-5"
      role="status"
      aria-label="ملخص نتيجة التقييم"
    >
      <div className="flex items-start gap-4">
        <span className="text-3xl" aria-hidden="true">
          {summary.icon}
        </span>
        <div>
          <p className="text-sm font-semibold text-teal-800">{summary.label}</p>
          <p className="mt-1 text-sm text-slate-700 leading-6">
            {summary.resultDescription}
          </p>
          {result.subjectAge && (
            <p className="mt-2 text-xs text-slate-500">
              العمر: {result.subjectAge} سنوات
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// WhatToExpectCard — خطوات الرحلة
// ---------------------------------------------------------------------------

function WhatToExpectCard({ steps }: { steps: StepCopy[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {steps.map((step, index) => (
        <div key={index} className="rounded-2xl bg-slate-50 p-4">
          <p className="mb-2 text-sm font-semibold text-slate-900">
            <span className="mr-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white">
              {index + 1}
            </span>{" "}
            {step.title}
          </p>
          <p className="text-sm text-slate-600">{step.description}</p>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// PrivacyNotice
// ---------------------------------------------------------------------------

function PrivacyNotice() {
  return (
    <p className="mt-6 text-center text-sm text-slate-500">
      <span aria-hidden="true">🔒</span>{" "}
      جميع بياناتك محمية وسرية بالكامل
    </p>
  );
}
