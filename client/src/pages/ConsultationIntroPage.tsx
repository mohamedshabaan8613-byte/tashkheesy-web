/**
 * ConsultationIntroPage.tsx — Sprint 3.1 Priority 3 Wiring
 *
 * ─── WIRING RULES ─────────────────────────────────────────────────────────
 * ✅ مسموح:
 *   - startFromIntroPage()  ← من useConsultationBookingAdapter
 *   - navigate(result.nextRoute)  ← بناءً على ما يُعيده orchestrator
 *   - useConsultationContext()  ← لقراءة intent وتحديد المحتوى السياقي
 *   - resolveBookingDenialPresentation()  ← لتحويل domain code → UX copy
 *
 * ❌ ممنوع:
 *   - booking initialization logic في الصفحة
 *   - استدعاء startBookingSession() مباشرة
 *   - بناء BookingSessionPayload يدوياً
 *   - Supabase / payments / AI matching
 * ──────────────────────────────────────────────────────────────────────────
 *
 * المحتوى السياقي:
 *   - from assessment  → يُبرز التوصية وأهمية الاستشارة
 *   - direct / follow_up → محتوى عام عن الاستشارة
 *   - no intent         → redirect للبداية
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useConsultationContext } from "../contexts/ConsultationContext";
import {
  resolveBookingDenialPresentation,
  useConsultationBookingAdapter,
} from "../hooks/useConsultationBooking";
import type { BookingDenialPresentation } from "../hooks/useConsultationBooking";

// ─── Content by Entry Point ────────────────────────────────────────────────

type IntroContent = {
  headline: string;
  subline: string;
  ctaLabel: string;
  badge?: string;
};

function resolveIntroContent(entryPoint: string | undefined): IntroContent {
  switch (entryPoint) {
    case "assessment_result":
      return {
        badge: "موصى به بناءً على تقييمك",
        headline: "أنت على خطوة واحدة من الدعم المتخصص",
        subline:
          "نتائج تقييمك تُشير إلى أن الحديث مع أخصائي سيكون مفيداً جداً. احجز استشارتك الآن.",
        ctaLabel: "ابدأ الحجز",
      };
    case "follow_up":
      return {
        badge: "متابعة",
        headline: "مرحباً بك مجدداً",
        subline: "نحن سعداء بمتابعتك. احجز جلسة متابعة مع أخصائيك.",
        ctaLabel: "احجز جلسة متابعة",
      };
    default:
      return {
        headline: "استشارة متخصصة لدعم طفلك",
        subline:
          "فريقنا من الأخصائيين المعتمدين جاهز لمساعدتك. احجز استشارتك الأولى اليوم.",
        ctaLabel: "احجز الآن",
      };
  }
}

// ─── Guard ─────────────────────────────────────────────────────────────────

function useIntroGuard() {
  const { intent, hasActiveIntent } = useConsultationContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!hasActiveIntent) {
      navigate("/consultation/start", { replace: true });
    }
  }, [hasActiveIntent, navigate]);

  return {
    intent,
    isReady: hasActiveIntent,
    entryPoint: intent?.entryPoint,
  };
}

// ─── Benefit Items ─────────────────────────────────────────────────────────

const BENEFITS = [
  { icon: "🎓", text: "أخصائيون معتمدون ومرخصون" },
  { icon: "🔒", text: "جلسة سرية وآمنة تماماً" },
  { icon: "📱", text: "عبر الإنترنت — من أي مكان" },
  { icon: "⚡", text: "حجز في دقائق، جلسة خلال 48 ساعة" },
] as const;

// ─── Main Component ────────────────────────────────────────────────────────

export default function ConsultationIntroPage() {
  const navigate = useNavigate();
  const { intent, isReady, entryPoint } = useIntroGuard();
  const { startFromIntroPage } = useConsultationBookingAdapter();

  const [isStarting, setIsStarting] = useState(false);
  const [denial, setDenial]         = useState<BookingDenialPresentation | null>(null);

  const content = resolveIntroContent(entryPoint);

  // Guard
  if (!isReady || !intent) return null;

  // ─ Start Booking ─────────────────────────────────────────────────────
  /**
   * handleStartBooking — النقطة الوحيدة لبدء الحجز في هذه الصفحة.
   *
   * ✅ يستدعي startFromIntroPage() فقط — لا booking logic هنا.
   * ✅ navigate() بناءً على result.nextRoute من orchestrator.
   */
  function handleStartBooking() {
    if (!intent?.intentId) return;

    setIsStarting(true);
    setDenial(null);

    const result = startFromIntroPage({
      consultationIntentId: intent.intentId,
    });

    if (result.success) {
      navigate(result.nextRoute);
      return;
    }

    const presentation = resolveBookingDenialPresentation(result.denialReason);
    setDenial(presentation);
    setIsStarting(false);
  }

  // ─ Recovery ──────────────────────────────────────────────────────────
  function handleRecoveryAction(presentation: BookingDenialPresentation) {
    switch (presentation.recoveryAction) {
      case "redirect_to_assessment":
        navigate("/assessment");
        break;
      case "resume_active_booking":
        navigate("/consultation/booking");
        break;
      case "redirect_to_payment":
        navigate("/consultation/start");
        break;
      case "contact_support":
        navigate("/contact");
        break;
      default:
        setDenial(null);
    }
  }

  // ─ Render ─────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 dark:bg-gray-950">
      <div className="mx-auto max-w-xl">

        {/* Badge */}
        {content.badge && (
          <div className="mb-6 text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-100 px-4 py-1.5 text-xs font-semibold text-teal-700 dark:bg-teal-900/50 dark:text-teal-300">
              <span aria-hidden>✦</span>
              {content.badge}
            </span>
          </div>
        )}

        {/* Headline */}
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold leading-snug text-gray-900 dark:text-white">
            {content.headline}
          </h1>
          <p className="mt-3 text-base text-gray-600 dark:text-gray-400">
            {content.subline}
          </p>
        </header>

        {/* Benefits */}
        <ul
          aria-label="مميزات الاستشارة"
          className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2"
        >
          {BENEFITS.map(({ icon, text }) => (
            <li
              key={text}
              className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900"
            >
              <span aria-hidden className="text-2xl">{icon}</span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{text}</span>
            </li>
          ))}
        </ul>

        {/* Denial Card */}
        {denial && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 p-5 dark:border-red-800 dark:bg-red-950"
          >
            {denial.title && (
              <p className="mb-1 font-semibold text-red-800 dark:text-red-200">
                {denial.title}
              </p>
            )}
            <p className="text-sm text-red-700 dark:text-red-300">{denial.userMessage}</p>
            {denial.actionLabel && denial.recoveryAction !== "none" && (
              <button
                onClick={() => handleRecoveryAction(denial)}
                className="mt-3 text-sm font-medium text-red-600 underline underline-offset-2 hover:text-red-700 dark:text-red-400"
              >
                {denial.actionLabel}
              </button>
            )}
          </div>
        )}

        {/* CTA */}
        <div className="text-center">
          <button
            onClick={handleStartBooking}
            disabled={isStarting}
            aria-busy={isStarting}
            className="w-full rounded-xl bg-teal-600 px-8 py-4 text-base font-semibold text-white shadow-sm transition hover:bg-teal-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 disabled:cursor-not-allowed disabled:opacity-60"
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
            ) : (
              content.ctaLabel
            )}
          </button>

          <p className="mt-4 text-xs text-gray-400">
            بالمتابعة، أنت توافق على{" "}
            <a href="/terms" className="underline underline-offset-2 hover:text-gray-600">
              شروط الاستخدام
            </a>
          </p>
        </div>

      </div>
    </main>
  );
}
