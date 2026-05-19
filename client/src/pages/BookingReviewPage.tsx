/**
 * BookingReviewPage.tsx — Sprint 3.3 PHASE 1
 *
 * UX completion boundary before persistence commit.
 *
 * ────────────────────────────────────────────────────────────────────
 * ARCHITECTURE RULES (Sprint 3.3)
 * ────────────────────────────────────────────────────────────────────
 *
 * RULE 2 — UI لا تُعدِّل lifecycle مباشرة:
 *   هذه الصفحة تعرض فقط. لا تستدعي transitionTo() مباشرة.
 *   التأكيد يمر عبر BookingOrchestrator.
 *
 * RULE 1 — SOURCE OF TRUTH:
 *   تعرض بيانات runtime session حاليًا.
 *   Phase 2: ستتحقق من persistent record قبل العرض.
 *
 * RULE 3 — CONFIRMED ≠ visual:
 *   زر التأكيد هنا لا يُصدر transitionTo("CONFIRMED") مباشرة.
 *   يستدعي orchestrator الذي يضمن الشروط أولاً.
 *
 * ────────────────────────────────────────────────────────────────────
 * ما تفعله هذه الصفحة:
 *   ✅ عرض ملخص الحجز (الأخصائي + الموعد + الاستحقاق)
 *   ✅ إتاحة التعديل (العودة لاختيار الأخصائي أو الموعد)
 *   ✅ hydration-safe + recovery-safe
 *   ✅ تصدر BOOKING_REVIEW_REACHED event عند الوصول
 *
 * ما لا تفعله:
 *   ❌ لا تؤكد الحجز مباشرة
 *   ❌ لا تكتب في Supabase
 *   ❌ لا تستدعي transitionTo() مباشرة
 * ────────────────────────────────────────────────────────────────────
 */

import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useConsultationBooking } from "../contexts/ConsultationBookingContext";
import { bookingEventBus, createBookingEvent } from "../types/bookingDomainEvents";
import type { BookingReviewReachedEvent } from "../types/bookingDomainEvents";

// ─── BookingReviewPage ────────────────────────────────────────────────────────
export default function BookingReviewPage() {
  const { session, currentPhase, hasActiveSession, isRecovering, cancelBooking } =
    useConsultationBooking();
  const [, navigate] = useLocation();

  const reviewEventFiredRef = useRef(false);

  // ── حماية: تحقق من session + phase ──────────────────────────────────────
  const isValidForReview =
    hasActiveSession &&
    session !== null &&
    (currentPhase === "REVIEW" || currentPhase === "SLOT_SELECTION") &&
    Boolean(session.selectedSpecialistId) &&
    Boolean(session.selectedSlotId);

  // ── إطلاق BOOKING_REVIEW_REACHED مرة واحدة ──────────────────────────────
  useEffect(() => {
    if (!isValidForReview || reviewEventFiredRef.current || !session) return;
    if (!session.selectedSpecialistId || !session.selectedSlotId) return;

    reviewEventFiredRef.current = true;

    const event: BookingReviewReachedEvent = createBookingEvent(
      "BOOKING_REVIEW_REACHED",
      session.sessionId,
      session.sourceIntentId,
      {
        specialistId: session.selectedSpecialistId,
        slotId: session.selectedSlotId,
        entitlementType: session.entitlementType,
      },
    );

    bookingEventBus.publish(event);
  }, [isValidForReview, session]);

  // ── Redirect: إذا لم يكن هناك session صالح ───────────────────────────────
  useEffect(() => {
    if (isRecovering) return;
    if (!hasActiveSession || !session) {
      navigate("/consultation/start", { replace: true });
      return;
    }
    if (!session.selectedSpecialistId) {
      navigate("/consultation/booking", { replace: true });
      return;
    }
    if (!session.selectedSlotId) {
      navigate("/consultation/booking", { replace: true });
    }
  }, [isRecovering, hasActiveSession, session, navigate]);

  // ── Loading state ─────────────────────────────────────────────────────────
  if (isRecovering) {
    return <BookingReviewSkeleton />;
  }

  if (!isValidForReview || !session) {
    return null;
  }

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleEditSpecialist = () => {
    navigate("/consultation/booking");
  };

  const handleEditSlot = () => {
    navigate("/consultation/booking");
  };

  const handleCancel = () => {
    cancelBooking("user_cancelled");
    navigate("/consultation/start", { replace: true });
  };

  /**
   * handleConfirm — RULE 2 + RULE 3
   *
   * الآن: placeholder — Sprint 3.3 Phase 4 سيستبدله بـ orchestrator call.
   * لا يُستدعى transitionTo() مباشرة هنا.
   * يجب أن يمر عبر BookingOrchestrator عند اكتمال Phase 2.
   */
  const handleConfirm = () => {
    // Sprint 3.3 Phase 4: استبدل هذا بـ:
    //   await bookingOrchestrator.confirmBooking({ sessionId: session.sessionId })
    // لا تضيف transitionTo("CONFIRMED") هنا مباشرة.
    console.warn(
      "[BookingReviewPage] handleConfirm: orchestrator not yet connected. Sprint 3.3 Phase 4.",
    );
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-background flex flex-col items-center justify-start pt-8 pb-16 px-4"
    >
      <div className="w-full max-w-lg">
        {/* ─── Header ──────────────────────────────────────────────────────── */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-1">مراجعة الحجز</h1>
          <p className="text-sm text-muted-foreground">
            تحقق من التفاصيل قبل تأكيد الموعد
          </p>
        </div>

        {/* ─── Booking Summary Card ─────────────────────────────────────────── */}
        <div className="bg-card border border-border rounded-xl p-5 mb-4 shadow-sm">
          <h2 className="text-base font-semibold text-foreground mb-4">
            ملخص الحجز
          </h2>

          {/* Specialist */}
          <div className="flex items-start justify-between mb-4 pb-4 border-b border-border/60">
            <div>
              <p className="text-xs text-muted-foreground mb-1">الأخصائي المختار</p>
              <p className="text-sm font-medium text-foreground">
                {session.selectedSpecialistId}
              </p>
            </div>
            <button
              onClick={handleEditSpecialist}
              className="text-xs text-primary underline-offset-2 hover:underline transition-colors"
              aria-label="تعديل اختيار الأخصائي"
            >
              تعديل
            </button>
          </div>

          {/* Slot */}
          <div className="flex items-start justify-between mb-4 pb-4 border-b border-border/60">
            <div>
              <p className="text-xs text-muted-foreground mb-1">الموعد المختار</p>
              <p className="text-sm font-medium text-foreground">
                {session.selectedSlotId}
              </p>
            </div>
            <button
              onClick={handleEditSlot}
              className="text-xs text-primary underline-offset-2 hover:underline transition-colors"
              aria-label="تعديل الموعد"
            >
              تعديل
            </button>
          </div>

          {/* Entitlement */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">نوع الاستحقاق</p>
              <EntitlementBadge type={session.entitlementType} />
            </div>
          </div>
        </div>

        {/* ─── Session Expiry Notice ────────────────────────────────────────── */}
        <SessionExpiryNotice expiresAt={session.expiresAt} />

        {/* ─── Actions ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-3 mt-6">
          {/*
           * Sprint 3.3 Phase 4:
           * هذا الزر سيُفعَّل بعد اكتمال orchestrator + persistence layer.
           * حاليًا: disabled مع توضيح للمستخدم.
           */}
          <button
            onClick={handleConfirm}
            disabled
            className="w-full py-3 px-4 bg-primary/40 text-primary-foreground/60 rounded-lg text-sm font-semibold cursor-not-allowed"
            aria-label="تأكيد الحجز — قيد التطوير"
          >
            تأكيد الحجز
            <span className="block text-xs font-normal opacity-70 mt-0.5">
              قريبًا — قيد الإعداد
            </span>
          </button>

          <button
            onClick={handleCancel}
            className="w-full py-2.5 px-4 bg-transparent border border-border text-muted-foreground rounded-lg text-sm hover:bg-muted/50 transition-colors"
            aria-label="إلغاء الحجز"
          >
            إلغاء الحجز
          </button>
        </div>

        {/* ─── Recovery State Badge (dev-visible) ──────────────────────────── */}
        {process.env.NODE_ENV === "development" && session.recoveryState.status !== "fresh" && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-700">
              <strong>Recovery:</strong> {session.recoveryState.status}
              {session.recoveryState.reason && ` — ${session.recoveryState.reason}`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function BookingReviewSkeleton() {
  return (
    <div dir="rtl" className="min-h-screen bg-background flex flex-col items-center pt-8 px-4 animate-pulse">
      <div className="w-full max-w-lg">
        <div className="h-7 w-40 bg-muted rounded mb-2" />
        <div className="h-4 w-64 bg-muted rounded mb-6" />
        <div className="bg-card border border-border rounded-xl p-5 mb-4">
          <div className="h-5 w-32 bg-muted rounded mb-4" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between mb-4 pb-4 border-b border-border/40">
              <div>
                <div className="h-3 w-20 bg-muted rounded mb-2" />
                <div className="h-4 w-36 bg-muted rounded" />
              </div>
              <div className="h-4 w-12 bg-muted rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EntitlementBadge({ type }: { type: string }) {
  const labels: Record<string, string> = {
    free_first_consultation: "استشارة مجانية",
    paid_consultation: "استشارة مدفوعة",
    package_session: "جلسة من باقة",
    follow_up: "متابعة",
  };
  const label = labels[type] ?? type;

  const isFreeTier = type === "free_first_consultation";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
        isFreeTier
          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
          : "bg-blue-50 text-blue-700 border border-blue-200"
      }`}
    >
      {label}
    </span>
  );
}

function SessionExpiryNotice({ expiresAt }: { expiresAt: string }) {
  const expiryDate = new Date(expiresAt);
  const now = new Date();
  const diffMs = expiryDate.getTime() - now.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins <= 0) {
    return (
      <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
        <span className="text-red-500 text-xs">⏰</span>
        <p className="text-xs text-red-600">انتهت مهلة الحجز</p>
      </div>
    );
  }

  if (diffMins <= 15) {
    return (
      <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <span className="text-amber-500 text-xs">⚠️</span>
        <p className="text-xs text-amber-700">
          ينتهي الحجز خلال {diffMins} دقيقة
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 p-3 bg-muted/40 border border-border rounded-lg">
      <span className="text-muted-foreground text-xs">🕐</span>
      <p className="text-xs text-muted-foreground">
        الحجز محجوز حتى {expiryDate.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}
      </p>
    </div>
  );
}
