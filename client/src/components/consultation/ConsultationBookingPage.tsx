/**
 * ConsultationBookingPage.tsx — Contextual Booking Route
 *
 * Sprint 3.0c | Phase 1 — Runtime Completion
 *
 * هذه الصفحة هي:
 *   - الـ route الرسمي لـ /consultation/booking
 *   - تقرأ intent من ConsultationContext
 *   - تتحقق من صحة intent قبل السماح بالحجز
 *   - تُظهر سياق التقييم إن وُجد
 *   - تفوّض الـ rendering للـ Booking component الموجود
 *
 * الفرق عن /booking:
 *   /booking           → Generic, لا context، للزيارات المباشرة
 *   /consultation/booking → Contextual، مربوط بـ ConsultationIntent
 */

import { lazy, Suspense, useEffect } from "react";
import { useLocation } from "wouter";
import { useConsultationContext } from "../../contexts/ConsultationContext";
import { CONSULTATION_ROUTES } from "../../types/consultationTypes";
import { isIntentStillValid } from "../../lib/consultationHydration";
import PageSkeleton from "../PageSkeleton";

const Booking = lazy(() => import("../booking/Booking"));

// ---------------------------------------------------------------------------
// ConsultationBookingPage
// ---------------------------------------------------------------------------

export default function ConsultationBookingPage() {
  const [, setLocation] = useLocation();
  const { intent, isFromAssessment } = useConsultationContext();

  // ── Guard: إذا لا يوجد intent صالح، أعد للـ generic booking
  useEffect(() => {
    if (!isIntentStillValid(intent)) {
      setLocation(CONSULTATION_ROUTES.BOOKING_GENERIC, { replace: true });
    }
  }, [intent, setLocation]);

  // لا تُظهر شيئًا حتى يُحسم الـ guard
  if (!isIntentStillValid(intent)) {
    return <PageSkeleton />;
  }

  return (
    <div className="consultation-booking-wrapper">
      {/* ── Context Banner: يظهر فقط إذا جاء من تقييم ── */}
      {isFromAssessment && intent?.assessmentResult && (
        <ConsultationContextBanner
          subjectName={intent.assessmentResult.subjectName}
          resultKey={intent.assessmentResult.resultKey}
          pathType={intent.assessmentResult.pathType}
        />
      )}

      {/* ── Booking Component ── */}
      <Suspense fallback={<PageSkeleton />}>
        <Booking />
      </Suspense>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Context Banner
// ---------------------------------------------------------------------------

interface ContextBannerProps {
  subjectName: string;
  resultKey: string;
  pathType: string;
}

function ConsultationContextBanner({
  subjectName,
  resultKey,
  pathType,
}: ContextBannerProps) {
  const isChild = pathType === "child_assessment";

  return (
    <div
      className="consultation-context-banner"
      role="status"
      aria-live="polite"
    >
      <div className="consultation-context-banner__inner">
        <span className="consultation-context-banner__icon" aria-hidden="true">
          {isChild ? "👦" : "🧑"}
        </span>
        <div className="consultation-context-banner__text">
          <p className="consultation-context-banner__title">
            {isChild
              ? `حجز استشارة لـ ${subjectName}`
              : `حجز استشارة — ${subjectName}`}
          </p>
          <p className="consultation-context-banner__subtitle">
            بناءً على نتيجة{" "}
            <span className="consultation-context-banner__result">
              {resultKey}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
