/**
 * ConsultationIntroPage — Entry point for contextual consultation flow
 *
 * Sprint 3.0b | Contextual Journey Foundation (Epic 1)
 *
 * هذه الصفحة هي بوابة دخول consultation journey، وليس بوابة دخول الفحص.
 * السلوك الصحيح:
 *   Assessment Result → /consultation/start (هذه الصفحة) → /booking
 *
 * ⚠️ هذه الصفحة يجب أن تنقل المستخدم إلى الأمام (booking)،
 *    وليس إلى الخلف (screening re-entry).
 */
import { useEffect } from "react";
import { useConsultationContext } from "../../contexts/ConsultationContext";
import { useConsultationFlow } from "../../hooks/useConsultationFlow";

export default function ConsultationIntroPage() {
  const { intent, setIntent, isFromAssessment, hasActiveIntent } =
    useConsultationContext();
  const { confirmAndBook, resolveEntryPoint } = useConsultationFlow();

  // ── Hydration guard: إعادة بناء intent من URL إذا فُقد (reload / direct link)
  useEffect(() => {
    if (hasActiveIntent) return;

    const search =
      typeof window !== "undefined" ? window.location.search : "";
    const entryPoint = resolveEntryPoint(new URLSearchParams(search));

    setIntent({
      entryPoint,
      initiatedAt: new Date().toISOString(),
      confirmed: false,
    });
  }, [hasActiveIntent, resolveEntryPoint, setIntent]);

  // ── Content — يتغير بناءً على entryPoint من context
  const assessmentName = intent?.assessmentResult?.subjectName;

  const title = isFromAssessment
    ? `الخطوة التالية: الاستشارة المناسبة لـ${assessmentName ? ` ${assessmentName}` : "نتيجة التقييم"}`
    : "ابدأ استشارتك مع المتخصص المناسب";

  const description = isFromAssessment
    ? "بناءً على نتيجة التقييم، سنوجّهك إلى الاستشارة المناسبة مع المتخصص الأنسب لحالتك، دون الحاجة للرجوع لبداية الرحلة."
    : "يمكنك البدء بجلسة أولية لفهم احتياجاتك واختيار التخصص الأنسب قبل إكمال الحجز.";

  const badge = isFromAssessment
    ? "مسار سياقي — بعد التقييم"
    : "دخول مباشر للاستشارة";

  const handleBack = () => {
    const sessionId = intent?.assessmentResult?.sessionId;
    if (sessionId) {
      window.location.href = `/screening-result/${sessionId}`;
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
      <div className="mx-auto max-w-3xl">
        {/* ── Card ── */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">

          {/* Badge */}
          <span className="mb-6 inline-flex rounded-full bg-teal-50 px-4 py-2 text-sm font-medium text-teal-700">
            {badge}
          </span>

          {/* Heading */}
          <h1
            id="consultation-intro-heading"
            className="mb-4 text-2xl font-bold text-slate-900 leading-snug"
          >
            {title}
          </h1>

          {/* Description */}
          <p className="mb-8 text-base leading-7 text-slate-600">
            {description}
          </p>

          {/* Steps */}
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <StepItem
              number={1}
              title="فهم الحالة"
              description="مراجعة سياق الرحلة قبل الحجز."
            />
            <StepItem
              number={2}
              title="اختيار المتخصص"
              description="ننقلك لصفحة الحجز مع السياق المناسب."
            />
            <StepItem
              number={3}
              title="تأكيد الموعد"
              description="إكمال الحجز وتأكيد الجلسة الأولى."
            />
          </div>

          {/* CTAs */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={confirmAndBook}
              className="rounded-2xl bg-[#0f766e] px-6 py-3 text-base font-semibold text-white transition hover:bg-[#115e59] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
            >
              متابعة إلى الحجز
            </button>
            <button
              type="button"
              onClick={handleBack}
              className="rounded-2xl border border-slate-300 px-6 py-3 text-base font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              رجوع
            </button>
          </div>

          {/* Privacy notice */}
          <p className="mt-6 text-sm text-slate-500 text-center">
            جميع بياناتك محمية وسرية بالكامل
          </p>
        </div>
      </div>
    </main>
  );
}

// ── Helper: step preview ─────────────────────────────────────────────────────
function StepItem({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="mb-2 text-sm font-semibold text-slate-900">
        <span className="mr-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white">
          {number}
        </span>{" "}
        {title}
      </p>
      <p className="text-sm text-slate-600">{description}</p>
    </div>
  );
}
