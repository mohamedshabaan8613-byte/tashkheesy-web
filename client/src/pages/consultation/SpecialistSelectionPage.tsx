/**
 * SpecialistSelectionPage.tsx — Sprint 3.2
 *
 * ─── SPECIALIST_SELECTION_BOUNDARY ─────────────────────────────────────────
 *
 * هذه الصفحة مسؤولة عن:
 *   ✅ عرض الأخصائيين المتاحين
 *   ✅ إبراز الأخصائي الموصى به (من session.specialistRecommendation)
 *   ✅ استقبال اختيار المستخدم وتسجيله في booking session
 *   ✅ الانتقال إلى SlotSelectionPage عند الاختيار
 *   ✅ recovery UI عند انتهاء الجلسة أو خطأ ownership
 *
 * هذه الصفحة لا تملك:
 *   ❌ entitlement logic — من يحق له الحجز ليس هنا
 *   ❌ pricing logic — سعر الجلسة ليس هنا
 *   ❌ clinical severity — درجة الخطورة ليست هنا
 *   ❌ recommendation ranking — ترتيب الأخصائيين ليس هنا
 *
 * Guards المدمجة:
 *   useBookingOwnershipGuard() — يتحقق من ownership قبل الـ render
 *   useRuntimeSafetyCheck()    — يكتشف orphaned/mismatch/expired sessions
 *   useBookingSessionHydration() — يتحقق من صلاحية الـ phase
 */

import { useCallback, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { useConsultationBooking } from "../../contexts/ConsultationBookingContext";
import { useBookingOwnershipGuard } from "../../utils/bookingOwnership";
import { useRuntimeSafetyCheck } from "../../utils/runtimeSafety";
import { useBookingSessionHydration } from "../../hooks/useBookingSessionHydration";
import { consultationBookingRepository } from "../../repositories/ConsultationBookingRepository";
import {
  resolveAvailableSpecialists,
} from "../../utils/specialistAvailability";
import type { SpecialistProfile } from "../../types/specialistAvailabilityTypes";

// ─── Recovery Screen ─────────────────────────────────────────────────────────
// inline — لا يُنقل خارج هذا الملف حتى Sprint 3.3

interface RecoveryScreenProps {
  reason: "expired" | "missing" | "ownership_failed" | "safety_violation";
  onRetry: () => void;
}

function RecoveryScreen({ reason, onRetry }: RecoveryScreenProps) {
  const [, setLocation] = useLocation();

  const content = {
    expired: {
      title: "انتهت جلسة الحجز",
      body: "انتهت صلاحية جلستك. يمكنك البدء من جديد بدون أي بيانات مفقودة.",
      cta: "البدء من جديد",
      action: () => setLocation("/consultation/start"),
    },
    missing: {
      title: "لا توجد جلسة حجز نشطة",
      body: "يبدو أنك وصلت إلى هذه الصفحة بشكل مباشر. ابدأ من استشارة جديدة.",
      cta: "بدء استشارة",
      action: () => setLocation("/consultation/start"),
    },
    ownership_failed: {
      title: "تعذّر التحقق من جلستك",
      body: "لم نتمكن من التحقق من ملكية جلسة الحجز. يمكنك المحاولة مجددًا أو البدء من جديد.",
      cta: "المحاولة مجددًا",
      action: onRetry,
    },
    safety_violation: {
      title: "حدث خطأ في جلسة الحجز",
      body: "اكتشفنا تعارضًا في بيانات جلستك. للحفاظ على سلامة بياناتك، نحتاج إعادة البدء.",
      cta: "إعادة البدء",
      action: () => setLocation("/consultation/start"),
    },
  }[reason];

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-sm w-full text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
          <span className="text-2xl" role="img" aria-label="تحذير">⚠️</span>
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-semibold text-foreground">{content.title}</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">{content.body}</p>
        </div>
        <button
          onClick={content.action}
          className="w-full py-3 px-6 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          {content.cta}
        </button>
      </div>
    </div>
  );
}

// ─── Hydration Loading Screen ─────────────────────────────────────────────────

function HydrationLoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 mx-auto rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <p className="text-sm text-muted-foreground">جاري التحقق من جلستك…</p>
      </div>
    </div>
  );
}

// ─── Specialist Card ──────────────────────────────────────────────────────────

interface SpecialistCardProps {
  specialist: SpecialistProfile;
  isRecommended: boolean;
  onSelect: (specialistId: string) => void;
}

function SpecialistCard({ specialist, isRecommended, onSelect }: SpecialistCardProps) {
  const formatLabels: Record<string, string> = {
    video: "مرئي",
    audio: "صوتي",
    chat: "نصي",
  };

  const specializationLabels: Record<string, string> = {
    adhd: "نقص الانتباه",
    dyslexia: "عسر القراءة",
    learning_disabilities: "صعوبات التعلم",
    child_psychology: "علم نفس الطفل",
    educational_psychology: "علم النفس التربوي",
    speech_therapy: "علاج النطق",
  };

  return (
    <div
      className={[
        "relative rounded-2xl border p-5 space-y-4 transition-all cursor-pointer",
        isRecommended
          ? "border-primary/40 bg-primary/5 shadow-sm"
          : "border-border bg-card hover:border-primary/20 hover:shadow-sm",
      ].join(" ")}
      onClick={() => onSelect(specialist.specialistId)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onSelect(specialist.specialistId)}
      aria-label={`اختيار ${specialist.displayName}`}
    >
      {isRecommended && (
        <div className="absolute -top-2.5 right-4 px-3 py-0.5 bg-primary text-primary-foreground text-xs rounded-full font-medium">
          موصى به
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <span className="text-sm font-semibold text-primary" aria-hidden="true">
            {specialist.avatarInitials}
          </span>
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-foreground text-sm leading-tight">{specialist.displayName}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{specialist.titleAr}</p>
        </div>
        <div className="mr-auto shrink-0">
          <span
            className={[
              "text-xs px-2 py-0.5 rounded-full font-medium",
              specialist.isAvailableToday
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : "bg-muted text-muted-foreground",
            ].join(" ")}
          >
            {specialist.nextAvailableLabel}
          </span>
        </div>
      </div>

      {/* Specializations */}
      <div className="flex flex-wrap gap-1.5">
        {specialist.specializations.slice(0, 3).map((sp) => (
          <span
            key={sp}
            className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full"
          >
            {specializationLabels[sp] ?? sp}
          </span>
        ))}
      </div>

      {/* Meta */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{specialist.yearsExperience} سنوات خبرة</span>
        <span>{specialist.sessionDurationMinutes} دقيقة</span>
        <span>
          {specialist.sessionFormats.map((f) => formatLabels[f] ?? f).join(" · ")}
        </span>
      </div>

      {/* CTA */}
      <button
        className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
        onClick={(e) => { e.stopPropagation(); onSelect(specialist.specialistId); }}
        aria-label={`اختيار ${specialist.displayName}`}
      >
        اختيار هذا الأخصائي
      </button>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptySpecialistsState() {
  const [, setLocation] = useLocation();
  return (
    <div className="text-center py-16 px-4 space-y-4">
      <div className="w-14 h-14 mx-auto rounded-full bg-muted flex items-center justify-center">
        <span className="text-2xl" role="img" aria-label="لا يوجد">👩‍⚕️</span>
      </div>
      <h2 className="text-base font-semibold text-foreground">لا يوجد أخصائيون متاحون الآن</h2>
      <p className="text-sm text-muted-foreground max-w-xs mx-auto">
        جميع الأخصائيين مشغولون في الوقت الحالي. حاول مجددًا بعد قليل.
      </p>
      <button
        onClick={() => setLocation("/consultation/start")}
        className="mt-2 py-2.5 px-6 border border-border rounded-xl text-sm text-foreground hover:bg-muted transition-colors"
      >
        العودة للبداية
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SpecialistSelectionPage() {
  const [, setLocation] = useLocation();
  const { session, selectSpecialist, advancePhase } = useConsultationBooking();

  // ── Guard 1: Ownership ───────────────────────────────────────────────
  // GUARD_HOOK_BOUNDARY:
  //   ✅ validates session ownership
  //   ❌ لا analytics, لا hydration, لا UI decisions
  const ownershipGuard = useBookingOwnershipGuard(
    session?.sessionId ?? null,
    (id) => consultationBookingRepository.load(id)
  );

  // ── Guard 2: Runtime Safety ──────────────────────────────────────────
  // GUARD_HOOK_BOUNDARY:
  //   ✅ orphaned session / intent mismatch / expired session
  //   ❌ لا recovery logic, لا navigation
  const [safetyViolation, setSafetyViolation] = useState<string | null>(null);
  useRuntimeSafetyCheck(
    null,
    session ?? null,
    (violation) => setSafetyViolation(violation.violations[0] ?? "unknown")
  );

  // ── Guard 3: Hydration ───────────────────────────────────────────────
  // HYDRATION_BOUNDARY: hydration ≠ recovery
  const hydration = useBookingSessionHydration(["CREATED", "SPECIALIST_SELECTION"]);

  // ── Availability Data ────────────────────────────────────────────────
  const availabilityResult = useMemo(() => {
    return resolveAvailableSpecialists({
      entryPoint: session?.entryPoint ?? "direct_navigation",
      recommendedSpecialistId: session?.specialistRecommendation?.specialistId,
    });
  }, [session]);

  // ── Select Handler ───────────────────────────────────────────────────
  const handleSelectSpecialist = useCallback(
    (specialistId: string) => {
      selectSpecialist(specialistId);
      // TRANSITION_NAMING_RULE: الاسم يصف الحالة الناتجة — بعد اختيار specialist ننتقل إلى SLOT_SELECTION
      const advanced = advancePhase("SLOT_SELECTION");
      if (advanced) {
        setLocation(`/consultation/booking/slots?specialistId=${specialistId}`);
      }
    },
    [selectSpecialist, advancePhase, setLocation]
  );

  // ── Recovery States ──────────────────────────────────────────────────
  if (safetyViolation) {
    return <RecoveryScreen reason="safety_violation" onRetry={() => setSafetyViolation(null)} />;
  }

  if (ownershipGuard.isChecking || hydration.status === "checking") {
    return <HydrationLoadingScreen />;
  }

  if (!ownershipGuard.isOwned) {
    const reason =
      ownershipGuard.ownershipStatus === "EXPIRED" ? "expired" :
      ownershipGuard.ownershipStatus === "NOT_FOUND" ? "missing" : "ownership_failed";
    return <RecoveryScreen reason={reason} onRetry={() => window.location.reload()} />;
  }

  if (hydration.status === "expired") {
    return <RecoveryScreen reason="expired" onRetry={() => setLocation("/consultation/start")} />;
  }

  if (hydration.status === "missing") {
    return <RecoveryScreen reason="missing" onRetry={() => setLocation("/consultation/start")} />;
  }

  // ── Happy Path ───────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => setLocation("/consultation/start")}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="رجوع"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
          <div>
            <h1 className="text-base font-semibold text-foreground">اختيار الأخصائي</h1>
            <p className="text-xs text-muted-foreground">خطوة ١ من ٣</p>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-muted">
          <div className="h-1 bg-primary transition-all" style={{ width: "33%" }} />
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Context header */}
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-foreground">
            {session?.specialistRecommendation
              ? "لديك توصية بناءً على التقييم"
              : "اختر الأخصائي المناسب"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {session?.specialistRecommendation
              ? "الأخصائي الموصى به مُبرز أدناه بناءً على نتائج تقييمك."
              : "اختر من قائمة الأخصائيين المتاحين حسب تخصصك المطلوب."}
          </p>
        </div>

        {/* Specialists list */}
        {availabilityResult.status === "empty" || availabilityResult.specialists.length === 0 ? (
          <EmptySpecialistsState />
        ) : (
          <div className="space-y-4">
            {availabilityResult.specialists.map((specialist) => (
              <SpecialistCard
                key={specialist.specialistId}
                specialist={specialist}
                isRecommended={
                  specialist.specialistId === availabilityResult.recommendedSpecialistId
                }
                onSelect={handleSelectSpecialist}
              />
            ))}
          </div>
        )}

        {/* Session info footer */}
        {session && (
          <p className="text-center text-xs text-muted-foreground pb-4">
            جلسة الحجز صالحة حتى{" "}
            {new Date(session.expiresAt).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}
          </p>
        )}
      </main>
    </div>
  );
}

