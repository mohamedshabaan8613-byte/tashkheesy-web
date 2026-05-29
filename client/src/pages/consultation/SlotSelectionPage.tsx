/**
 * SlotSelectionPage.tsx — Sprint 3.2
 *
 * ─── SLOT_SELECTION_BOUNDARY ────────────────────────────────────────────────
 *
 * هذه الصفحة مسؤولة عن:
 *   ✅ عرض المواعيد المتاحة لأخصائي محدد
 *   ✅ إبراز الموعد الموصى به (isRecommended)
 *   ✅ تسجيل اختيار الموعد في booking session
 *   ✅ السماح بالرجوع لـ SpecialistSelectionPage
 *   ✅ recovery UI عند انتهاء الجلسة أو فقدان specialistId
 *
 * هذه الصفحة لا تملك:
 *   ❌ payment logic
 *   ❌ specialist ranking
 *   ❌ entitlement checks
 *
 * Guards:
 *   useBookingOwnershipGuard() — ownership
 *   useRuntimeSafetyCheck()    — orphaned/mismatch/expired
 *   useBookingSessionHydration() — phase validation
 */

import { useCallback, useMemo, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { useConsultationBooking } from "../../contexts/ConsultationBookingContext";
import { useBookingOwnershipGuard } from "../../utils/bookingOwnership";
import { useRuntimeSafetyCheck } from "../../utils/runtimeSafety";
import { consultationBookingRepository } from "../../repositories/ConsultationBookingRepository";
import { useBookingSessionHydration } from "../../hooks/useBookingSessionHydration";
import {
  resolveAvailableSlots,
  resolveSpecialistById,
} from "../../utils/specialistAvailability";
import type { AvailableSlot } from "../../types/specialistAvailabilityTypes";

// ─── Recovery Screen ─────────────────────────────────────────────────────────

interface RecoveryScreenProps {
  reason: "expired" | "missing" | "ownership_failed" | "safety_violation" | "no_specialist";
  onRetry: () => void;
}

function RecoveryScreen({ reason, onRetry }: RecoveryScreenProps) {
  const [, setLocation] = useLocation();

  const content = {
    expired: {
      title: "انتهت جلسة الحجز",
      body: "انتهت صلاحية جلستك. يمكنك البدء من جديد.",
      cta: "البدء من جديد",
      action: () => setLocation("/consultation/start"),
    },
    missing: {
      title: "لا توجد جلسة حجز نشطة",
      body: "ابدأ من استشارة جديدة.",
      cta: "بدء استشارة",
      action: () => setLocation("/consultation/start"),
    },
    ownership_failed: {
      title: "تعذّر التحقق من جلستك",
      body: "لم نتمكن من التحقق من ملكية جلسة الحجز.",
      cta: "المحاولة مجددًا",
      action: onRetry,
    },
    safety_violation: {
      title: "حدث خطأ في جلسة الحجز",
      body: "اكتشفنا تعارضًا في بيانات جلستك. نحتاج إعادة البدء.",
      cta: "إعادة البدء",
      action: () => setLocation("/consultation/start"),
    },
    no_specialist: {
      title: "لم يُحدَّد الأخصائي",
      body: "لم يتم اختيار أخصائي بعد. يرجى العودة واختيار أخصائي أولاً.",
      cta: "اختيار أخصائي",
      action: () => setLocation("/consultation/booking/specialists"),
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

// ─── Loading Screen ───────────────────────────────────────────────────────────

function HydrationLoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 mx-auto rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <p className="text-sm text-muted-foreground">جاري تحميل المواعيد المتاحة…</p>
      </div>
    </div>
  );
}

// ─── Slot Card ────────────────────────────────────────────────────────────────

interface SlotCardProps {
  slot: AvailableSlot;
  onSelect: (slotId: string) => void;
}

function SlotCard({ slot, onSelect }: SlotCardProps) {
  const formatLabel: Record<string, string> = {
    video: "مكالمة مرئية",
    audio: "مكالمة صوتية",
    chat: "محادثة نصية",
  };

  const isUnavailable = slot.status === "unavailable";

  return (
    <div
      className={[
        "relative rounded-xl border p-4 transition-all",
        slot.isRecommended ? "border-primary/40 bg-primary/5" : "border-border bg-card",
        isUnavailable
          ? "opacity-50 cursor-not-allowed"
          : "cursor-pointer hover:border-primary/20 hover:shadow-sm",
      ].join(" ")}
      onClick={() => !isUnavailable && onSelect(slot.slotId)}
      role="button"
      tabIndex={isUnavailable ? -1 : 0}
      onKeyDown={(e) => !isUnavailable && e.key === "Enter" && onSelect(slot.slotId)}
      aria-label={`موعد ${slot.timeLabel} — ${slot.dayLabel} ${slot.dateLabel}`}
      aria-disabled={isUnavailable}
    >
      {slot.isRecommended && (
        <div className="absolute -top-2.5 right-3 px-2.5 py-0.5 bg-primary text-primary-foreground text-xs rounded-full font-medium">
          موصى به
        </div>
      )}
      {slot.status === "tentative" && (
        <div className="absolute -top-2.5 left-3 px-2.5 py-0.5 bg-amber-500 text-white text-xs rounded-full font-medium">
          محجوز مؤقتًا
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <p className="font-semibold text-foreground text-sm">{slot.timeLabel}</p>
          <p className="text-xs text-muted-foreground">
            {slot.dayLabel} {slot.dateLabel}
          </p>
        </div>
        <div className="text-left space-y-0.5">
          <p className="text-xs text-muted-foreground">{formatLabel[slot.format] ?? slot.format}</p>
          <p className="text-xs text-muted-foreground">{slot.durationMinutes} دقيقة</p>
        </div>
      </div>
    </div>
  );
}

// ─── Empty Slots State ────────────────────────────────────────────────────────

function EmptySlotsState({ onBack }: { onBack: () => void }) {
  return (
    <div className="text-center py-16 px-4 space-y-4">
      <div className="w-14 h-14 mx-auto rounded-full bg-muted flex items-center justify-center">
        <span className="text-2xl" role="img" aria-label="لا مواعيد">📅</span>
      </div>
      <h2 className="text-base font-semibold text-foreground">لا توجد مواعيد متاحة</h2>
      <p className="text-sm text-muted-foreground max-w-xs mx-auto">
        لا توجد مواعيد متاحة لهذا الأخصائي حاليًا. يمكنك اختيار أخصائي آخر.
      </p>
      <button
        onClick={onBack}
        className="mt-2 py-2.5 px-6 border border-border rounded-xl text-sm text-foreground hover:bg-muted transition-colors"
      >
        اختيار أخصائي آخر
      </button>
    </div>
  );
}

// ─── Slots grouped by day ─────────────────────────────────────────────────────

function groupSlotsByDay(slots: AvailableSlot[]): Record<string, AvailableSlot[]> {
  return slots.reduce<Record<string, AvailableSlot[]>>((acc, slot) => {
    const key = `${slot.dayLabel} ${slot.dateLabel}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(slot);
    return acc;
  }, {});
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SlotSelectionPage() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const specialistId = searchParams.get("specialistId");

  const { session, selectSlot, advancePhase } = useConsultationBooking();

  // ── Guard 1: Ownership ───────────────────────────────────────────────
  const ownershipGuard = useBookingOwnershipGuard(
    session?.sessionId ?? null,
    (id) => consultationBookingRepository.load(id)
  );

  // ── Guard 2: Runtime Safety ──────────────────────────────────────────
  const [safetyViolation, setSafetyViolation] = useState<string | null>(null);
  useRuntimeSafetyCheck(
    null,
    session ?? null,
    (violation) => setSafetyViolation(violation.violations[0] ?? "unknown")
  );

  // ── Guard 3: Hydration ───────────────────────────────────────────────
  const hydration = useBookingSessionHydration(["SPECIALIST_SELECTION", "SLOT_SELECTION"]);

  // ── Availability Data ────────────────────────────────────────────────
  const slotResult = useMemo(() => {
    if (!specialistId) return null;
    return resolveAvailableSlots(specialistId);
  }, [specialistId]);

  const specialist = useMemo(() => {
    if (!specialistId) return null;
    return resolveSpecialistById(specialistId);
  }, [specialistId]);

  const groupedSlots = useMemo(() => {
    if (!slotResult?.slots.length) return {};
    return groupSlotsByDay(slotResult.slots);
  }, [slotResult]);

  // ── Select Handler ───────────────────────────────────────────────────
  const handleSelectSlot = useCallback(
    (slotId: string) => {
      selectSlot(slotId);
      const advanced = advancePhase("SLOT_SELECTION");
      if (advanced) {
        setLocation("/consultation/booking/review");
      }
    },
    [selectSlot, advancePhase, setLocation]
  );

  const handleBack = useCallback(() => {
    setLocation("/consultation/booking/specialists");
  }, [setLocation]);

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

  if (hydration.status === "missing" || hydration.status === "stale") {
    return <RecoveryScreen reason="missing" onRetry={() => setLocation("/consultation/booking/specialists")} />;
  }

  if (!specialistId) {
    return <RecoveryScreen reason="no_specialist" onRetry={handleBack} />;
  }

  // ── Happy Path ───────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={handleBack}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="رجوع لاختيار الأخصائي"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
          <div>
            <h1 className="text-base font-semibold text-foreground">اختيار الموعد</h1>
            <p className="text-xs text-muted-foreground">
              {specialist ? `مع ${specialist.displayName}` : "خطوة ٢ من ٣"}
            </p>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-muted">
          <div className="h-1 bg-primary transition-all" style={{ width: "66%" }} />
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Specialist summary */}
        {specialist && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-xs font-semibold text-primary" aria-hidden="true">
                {specialist.avatarInitials}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{specialist.displayName}</p>
              <p className="text-xs text-muted-foreground">{specialist.titleAr}</p>
            </div>
          </div>
        )}

        {/* Slots */}
        {!slotResult || slotResult.status === "empty" || slotResult.slots.length === 0 ? (
          <EmptySlotsState onBack={handleBack} />
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedSlots).map(([dayKey, slots]) => (
              <div key={dayKey} className="space-y-3">
                <h2 className="text-sm font-semibold text-foreground">{dayKey}</h2>
                <div className="grid gap-3">
                  {slots.map((slot) => (
                    <SlotCard key={slot.slotId} slot={slot} onSelect={handleSelectSlot} />
                  ))}
                </div>
              </div>
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
