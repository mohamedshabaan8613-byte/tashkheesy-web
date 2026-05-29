/**
 * BookingReviewPage.tsx — Sprint 3.4.1 M1 Fix
 *
 * UX completion boundary before persistence commit.
 *
 * ────────────────────────────────────────────────────────────────────
 * ARCHITECTURE RULES (Sprint 3.3 → Sprint 3.4.1)
 * ────────────────────────────────────────────────────────────────────
 *
 * RULE 1 — SOURCE OF TRUTH:
 *   تعرض بيانات runtime session.
 *   Phase 2: ستتحقق من persistent record قبل العرض.
 *
 * RULE 2 — UI لا تُعدّل lifecycle مباشرةً:
 *   handleConfirm → orchestrateBookingConfirmation() → transitionTo()
 *   لا تستدعي transitionTo() مباشرةً من الصفحة.
 *
 * RULE 3 — CONFIRMED ≠ visual:
 *   الزر لا يُصدر transitionTo("CONFIRMED") مباشرةً.
 *   transitionTo يُستدعى حصرًا من orchestrateBookingConfirmation().
 *
 * RULE 4 — No hardcoded routes (Fix N4):
 *   جميع navigate() تستخدم CONSULTATION_ROUTES.
 *
 * ────────────────────────────────────────────────────────────────────
 * Sprint 3.4.1 M1 Changes
 * ────────────────────────────────────────────────────────────────────
 *
 * FIX 1: handleConfirm — wired to orchestrateBookingConfirmation()
 *   الوضع السابق: console.warn placeholder — لا يفعل شيئًا
 *   الآن: orchestrateBookingConfirmation() مربوط بالكامل مع transitionTo dep-injection
 *
 * FIX 2: BookingReviewReachedEvent import كان يسبب build error
 *   الآن: النوع معرّف في bookingDomainEvents.ts
 *
 * ────────────────────────────────────────────────────────────────────
 * ما تفعله هذه الصفحة:
 *   ✅ عرض ملخص الحجز (الأخصائي + الموعد + الاستحقاق)
 *   ✅ إتاحة التعديل (العودة لاختيار الأخصائي أو الموعد)
 *   ✅ hydration-safe + recovery-safe + expiry-safe
 *   ✅ تصدر BOOKING_REVIEW_REACHED event عند الوصول
 *   ✅ تستدعي orchestrateBookingConfirmation() لتأكيد الحجز
 *
 * ما لا تفعله:
 *   ❌ لا تؤكد الحجز مباشرة
 *   ❌ لا تكتب في Supabase
 *   ❌ لا تستدعي transitionTo() مباشرة
 *   ❌ لا تقرأ من URL params
 * ────────────────────────────────────────────────────────────────────
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { useConsultationBooking } from "../contexts/ConsultationBookingContext";
import { bookingEventBus, createBookingEvent } from "../types/bookingDomainEvents";
import { isSessionExpired } from "../types/consultationBookingTypes";
import { CONSULTATION_ROUTES } from "../constants/consultationRoutes";
import { orchestrateBookingConfirmation } from "../orchestrators/BookingConfirmationOrchestrator";
import type { BookingReviewReachedEvent } from "../types/bookingDomainEvents";

// ─── Confirmation UI state ───────────────────────────────────────────────────────────────

type ConfirmState =
  | { status: "idle" }
  | { status: "confirming" }
  | { status: "failed"; reason: string; retryable: boolean };

// ─── BookingReviewPage ───────────────────────────────────────────────────────────────
export default function BookingReviewPage() {
  const {
    session,
    currentPhase,
    hasActiveSession,
    isRecovering,
    cancelBooking,
    expireBooking,
    transitionTo,
  } = useConsultationBooking();
  const [, navigate] = useLocation();

  const reviewEventFiredRef = useRef(false);
  const [confirmState, setConfirmState] = useState<ConfirmState>({ status: "idle" });

  // ── حماية: تحقق من session + phase ──────────────────────────────────────────
  const isValidForReview =
    hasActiveSession &&
    session !== null &&
    // CANONICAL_WORKFLOW: صفحة المراجعة تقبل REVIEW phase فقط — TRACK 2 semantic fix
    currentPhase === "REVIEW" &&
    Boolean(session.selectedSpecialistId) &&
    Boolean(session.selectedSlotId);

  // ── إطلاق BOOKING_REVIEW_REACHED مرة واحدة ─────────────────────────────────────
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

  // ── Redirect + Expiry Guard (Fix N3) ──────────────────────────────────────────
  //
  // الترتيب مهم:
  //   1. isRecovering → انتظر (لا redirect أثناء hydration)
  //   2. session منتهية → expireBooking() + redirect فوري
  //   3. لا session → redirect لـ START
  //   4. specialist/slot ناقص → redirect لـ BOOKING
  //
  useEffect(() => {
    if (isRecovering) return;

    if (session && isSessionExpired(session)) {
      expireBooking("session_ttl_exceeded");
      navigate(CONSULTATION_ROUTES.START, { replace: true });
      return;
    }

    if (!hasActiveSession || !session) {
      navigate(CONSULTATION_ROUTES.START, { replace: true });
      return;
    }
    if (!session.selectedSpecialistId) {
      navigate(CONSULTATION_ROUTES.BOOKING, { replace: true });
      return;
    }
    if (!session.selectedSlotId) {
      navigate(CONSULTATION_ROUTES.BOOKING, { replace: true });
    }
  }, [isRecovering, hasActiveSession, session, navigate, expireBooking]);

  // ── handleConfirm — RULE 2 + RULE 3 (Sprint 3.4.1 M1 Fix) ──────────────────
  //
  // الدفق الصحيح:
  //   UI → orchestrateBookingConfirmation() → transitionTo() → domain event
  //
  // لماذا transitionTo مُمرّر كـ dep-injection:
  //   orchestrateBookingConfirmation لا يستورد Context مباشرةً — RULE 2 isolation.
  //   transitionTo هو المسار الوحيد لتغيير lifecycle phase.
  //
  // userId مصدر: session.sourceIntentId
  //   مؤقت حتى اكتمال Sprint 3.5 auth layer.
  //   session.sourceIntentId = consultationIntentId = userId في v1.
  //
  // reservationId مصدر: session.reservationId
  //   مضبوط بواسطة SlotReservationOrchestrator عند اختيار الموعد.
  //
  const handleConfirm = useCallback(async () => {
    if (!session) return;
    if (confirmState.status === "confirming") return; // منع double-submit

    const reservationId = ((session as unknown) as Record<string, unknown>).reservationId as string | undefined;
    const ownershipToken = session.sessionId; // ownershipToken = sessionId في v1

    if (!reservationId) {
      // reservationId غير موجود: عادة لم يكتمل SlotReservationOrchestrator
      setConfirmState({
        status: "failed",
        reason: "reservation_not_found",
        retryable: false,
      });
      return;
    }

    setConfirmState({ status: "confirming" });

    const result = await orchestrateBookingConfirmation(
      {
        consultationId: session.sessionId,
        userId: session.sourceIntentId,
        reservationId,
        ownershipToken,
      },
      {
        // RULE 2: transitionTo ُممرّر كـ dep-injection — لا import مباشر
        transitionTo: (phase: string) => transitionTo(phase as Parameters<typeof transitionTo>[0]),
      },
    );

    if (result.success) {
      navigate(CONSULTATION_ROUTES.CONFIRMED, { replace: true });
    } else {
      setConfirmState({
        status: "failed",
        reason: result.reason ?? "unknown_error",
        retryable: result.retryable ?? false,
      });
    }
  }, [session, confirmState.status, transitionTo, navigate]);

  // ── Loading state ───────────────────────────────────────────────────────────────
  if (isRecovering) {
    return <BookingReviewSkeleton />;
  }

  if (!isValidForReview || !session) {
    return null;
  }

  const isConfirming = confirmState.status === "confirming";

  // ── Edit Handlers ───────────────────────────────────────────────────────────────
  const handleEditSpecialist = () => navigate(CONSULTATION_ROUTES.BOOKING);
  const handleEditSlot = () => navigate(CONSULTATION_ROUTES.BOOKING);

  const handleCancel = () => {
    cancelBooking("user_cancelled");
    navigate(CONSULTATION_ROUTES.START, { replace: true });
  };

  const handleRetry = () => setConfirmState({ status: "idle" });

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-background flex flex-col items-center justify-start pt-8 pb-16 px-4"
    >
      <div className="w-full max-w-lg">
        {/* ─── Header ───────────────────────────────────────────────────────────────── */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-1">مراجعة الحجز</h1>
          <p className="text-sm text-muted-foreground">
            تحقق من التفاصيل قبل تأكيد الموعد
          </p>
        </div>

        {/* ─── Confirmation Error Banner (Sprint 3.4.1 M1) ──────────────────────── */}
        {confirmState.status === "failed" && (
          <ConfirmationErrorBanner
            reason={confirmState.reason}
            retryable={confirmState.retryable}
            onRetry={handleRetry}
          />
        )}

        {/* ─── Booking Summary Card ─────────────────────────────────────────────── */}
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
              disabled={isConfirming}
              className="text-xs text-primary underline-offset-2 hover:underline transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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
              disabled={isConfirming}
              className="text-xs text-primary underline-offset-2 hover:underline transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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

        {/* ─── Session Expiry Notice ───────────────────────────────────────────── */}
        <SessionExpiryNotice expiresAt={session.expiresAt} />

        {/* ─── Actions ─────────────────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-3 mt-6">
          {/*
           * Confirm Button — Sprint 3.4.1 M1 Fix
           * الآن: مفعّل ومربوط بالكامل بـ orchestrateBookingConfirmation()
           * يُعطّل أثناء CONFIRMING لمنع double-submit
           */}
          <button
            onClick={handleConfirm}
            disabled={isConfirming}
            className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-semibold
                       hover:bg-primary/90 active:bg-primary/80 transition-colors
                       disabled:bg-primary/40 disabled:text-primary-foreground/60 disabled:cursor-not-allowed"
            aria-label="تأكيد الحجز"
            aria-busy={isConfirming}
          >
            {isConfirming ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
                جاري تأكيد الحجز…
              </span>
            ) : (
              "تأكيد الحجز"
            )}
          </button>

          <button
            onClick={handleCancel}
            disabled={isConfirming}
            className="w-full py-2.5 px-4 bg-transparent border border-border text-muted-foreground rounded-lg text-sm
                       hover:bg-muted/50 transition-colors
                       disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="إلغاء الحجز"
          >
            إلغاء الحجز
          </button>
        </div>

        {/* ─── Recovery State Badge (dev-visible) ──────────────────────────────── */}
        {process.env.NODE_ENV === "development" &&
          session.recoveryState.status !== "fresh" && (
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

// ─── Sub-components ─────────────────────────────────────────────────────────────────────────

function BookingReviewSkeleton() {
  return (
    <div
      dir="rtl"
      className="min-h-screen bg-background flex flex-col items-center pt-8 px-4 animate-pulse"
    >
      <div className="w-full max-w-lg">
        <div className="h-7 w-40 bg-muted rounded mb-2" />
        <div className="h-4 w-64 bg-muted rounded mb-6" />
        <div className="bg-card border border-border rounded-xl p-5 mb-4">
          <div className="h-5 w-32 bg-muted rounded mb-4" />
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex justify-between mb-4 pb-4 border-b border-border/40"
            >
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
        الحجز محجوز حتى{" "}
        {expiryDate.toLocaleTimeString("ar-SA", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>
    </div>
  );
}

/**
 * ConfirmationErrorBanner — Sprint 3.4.1 M1 Addition
 *
 * يظهر خطأ تأكيد مترجم إلى العربية بدل raw error string.
 * يتيح إعادة المحاولة إذا كان الخطأ retryable.
 */
function ConfirmationErrorBanner({
  reason,
  retryable,
  onRetry,
}: {
  reason: string;
  retryable: boolean;
  onRetry: () => void;
}) {
  const messages: Record<string, string> = {
    reservation_expired: "انتهت مدة حجز الموعد. يرجى اختيار موعد جديد.",
    reservation_not_owned: "تعذّر التحقق من ملكية الموعد. حاول مرة أخرى.",
    reservation_not_found: "لم يتم حجز الموعد بعد. يرجى العودة واختيار الموعد.",
    eligibility_denied: "غير مؤهّل لهذه الاستشارة حاليًا.",
    network_error: "خطأ في الشبكة. تحقق من الاتصال وحاول مجددًا.",
    db_error: "تعذّر حفظ الحجز. تواصل مع الدعم إذا تكررت المشكلة.",
    unknown_error: "حدث خطأ غير متوقع. حاول مرة أخرى.",
  };

  const message = messages[reason] ?? messages.unknown_error;

  return (
    <div
      role="alert"
      className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start justify-between gap-3"
    >
      <p className="text-xs text-red-700 flex-1">{message}</p>
      {retryable && (
        <button
          onClick={onRetry}
          className="text-xs text-red-700 font-semibold underline underline-offset-2 whitespace-nowrap shrink-0"
          aria-label="إعادة المحاولة"
        >
          حاول مجددًا
        </button>
      )}
    </div>
  );
}
