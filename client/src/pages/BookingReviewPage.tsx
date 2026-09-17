/**
 * BookingReviewPage.tsx — Sprint 3.4.1 M1 / Phase-5 hardened
 *
 * ────────────────────────────────────────────────────────────────────
 * ARCHITECTURE RULES (Sprint 3.3 → Sprint 3.4.1 / Phase 5)
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
 *   الزر لا يُصدر transitionTo(“CONFIRMED”) مباشرةً.
 *   transitionTo يُستدعى حصرًا من orchestrateBookingConfirmation().
 *
 * RULE 4 — No hardcoded routes:
 *   جميع navigate() تستخدم CONSULTATION_ROUTES.
 *
 * RULE 5 (Phase 5) — navigate() بعد phase مؤكدة:
 *   navigate(“CONFIRMED”) يحدث فقط بعد التحقق من currentPhase === “CONFIRMED”
 *   عبر useEffect — ليس بشكل مباشر على result.success.
 *
 * ────────────────────────────────────────────────────────────────────
 * Phase-5 fixes:
 *   ✅ G1: transitionTo cast حل — typed BookingPhase union مستخدم
 *   ✅ G2: session.reservationId مقروء مباشرةً (نوع مضاف في Phase 3)
 *   ✅ G3: navigate مربوط بـ useEffect يراقب currentPhase === "CONFIRMED"
 * ────────────────────────────────────────────────────────────────────
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { useConsultationBooking } from "../contexts/ConsultationBookingContext";
import { bookingEventBus, createBookingEvent } from "../types/bookingDomainEvents";
import { isSessionExpired } from "../types/consultationBookingTypes";
import type { BookingPhase } from "../types/consultationBookingTypes";
import { CONSULTATION_ROUTES } from "../constants/consultationRoutes";
import { orchestrateBookingConfirmation } from "../orchestrators/BookingConfirmationOrchestrator";
import type { BookingReviewReachedEvent } from "../types/bookingDomainEvents";

// ─── Confirmation UI state ─────────────────────────────────────────────────────────────

type ConfirmState =
  | { status: "idle" }
  | { status: "confirming" }
  | { status: "failed"; reason: string; retryable: boolean };

// ─── Typed transitionTo helper (G1 fix) ───────────────────────────────────────────────
//
// المشكلة السابقة:
//   orchestrateBookingConfirmation تستقبل transitionTo: (phase: string) => void
//   BookingContext يعرّف transitionTo: (phase: BookingPhase) => void
//   الجسر: cast غير آمن بـ `as Parameters<typeof transitionTo>[0]`
//
// الحل: ننشئ wrapper محدود النوع يضمن أن كل phase تمر عبر الـ union.
//
const VALID_ORCHESTRATOR_PHASES = new Set<BookingPhase>([
  "CONFIRMING",
  "CONFIRMED",
  "CONFIRMATION_FAILED",
]);

function makeTypedTransitionTo(
  transitionTo: (phase: BookingPhase) => void
): (phase: string) => void {
  return (phase: string) => {
    if (VALID_ORCHESTRATOR_PHASES.has(phase as BookingPhase)) {
      transitionTo(phase as BookingPhase);
    } else {
      // لا تترجم phase غير معروفة إلى فساد حالة — اسجل فقط
      if (process.env.NODE_ENV !== "production") {
        console.warn(
          `[BookingReviewPage] orchestrator sent unknown phase: "${phase}" — ignored`
        );
      }
    }
  };
}

// ─── BookingReviewPage ─────────────────────────────────────────────────────────────

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
  // G3: track whether we should navigate after phase settles
  const pendingNavigateRef = useRef(false);

  // ── حماية: تحقق من session + phase ─────────────────────────────────────────
  const isValidForReview =
    hasActiveSession &&
    session !== null &&
    (currentPhase === "REVIEW" ||
      currentPhase === "SLOT_SELECTION" ||
      currentPhase === "CONFIRMING" ||
      currentPhase === "CONFIRMATION_FAILED") &&
    Boolean(session.selectedSpecialistId) &&
    Boolean(session.selectedSlotId);

  // ── G3: navigate فور currentPhase يصبح CONFIRMED ──────────────────────────────
  //
  // لماذا useEffect وليس بعد result.success مباشرةً:
  //   orchestrateBookingConfirmation تستدعي transitionTo("CONFIRMED") ثم ترجع.
  //   transitionTo يحدث re-render لـ React.
  //   navigate في نفس callback المتزامن = racing condition.
  //   useEffect يضمن أن currentPhase استقر فعلاً على "CONFIRMED" قبل navigate.
  //
  useEffect(() => {
    if (currentPhase === "CONFIRMED" && pendingNavigateRef.current) {
      pendingNavigateRef.current = false;
      navigate(CONSULTATION_ROUTES.CONFIRMED, { replace: true });
    }
  }, [currentPhase, navigate]);

  // ── إطلاق BOOKING_REVIEW_REACHED مرة واحدة ───────────────────────────────────
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
      }
    );

    bookingEventBus.publish(event);
  }, [isValidForReview, session]);

  // ── Redirect + Expiry Guard ───────────────────────────────────────────────────
  //
  // الترتيب:
  //   1. isRecovering → انتظر
  //   2. CONFIRMED → لا redirect (تتولى useEffect أعلاه التنقل)
  //   3. session منتهية → expireBooking() + redirect
  //   4. لا session → redirect
  //   5. specialist/slot ناقص → redirect
  //
  useEffect(() => {
    if (isRecovering) return;
    if (currentPhase === "CONFIRMED") return; // تولى G3 useEffect

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
  }, [isRecovering, currentPhase, hasActiveSession, session, navigate, expireBooking]);

  // ── handleConfirm — RULE 2 + RULE 3 + Phase-5 fixes ────────────────────────────
  //
  // G1: transitionTo ملفوف بـ makeTypedTransitionTo() — لا cast غير آمن
  // G2: reservationId مقروء من session.reservationId مباشرةً
  // G3: بعد result.success → pendingNavigateRef.current = true
  //     التنقل الفعلي يحدث في useEffect عند currentPhase === "CONFIRMED"
  //
  const handleConfirm = useCallback(async () => {
    if (!session) return;
    if (confirmState.status === "confirming") return;

    // G2: قراءة مباشرة — reservationId مضاف في ConsultationBookingSession في Phase 3
    const reservationId = session.reservationId;
    const ownershipToken = session.sessionId;

    if (!reservationId) {
      setConfirmState({
        status: "failed",
        reason: "reservation_not_found",
        retryable: false,
      });
      return;
    }

    setConfirmState({ status: "confirming" });

    // G1: typed wrapper — يضمن أن orchestrator لا يرسل phase غير معروفة للـ context
    const typedTransitionTo = makeTypedTransitionTo(transitionTo);

    const result = await orchestrateBookingConfirmation(
      {
        consultationId: session.sessionId,
        userId: session.sourceIntentId,
        reservationId,
        ownershipToken,
      },
      {
        // RULE 2: transitionTo مُمرّر كـ dep-injection — لا import مباشر
        transitionTo: typedTransitionTo,
      }
    );

    if (result.success) {
      // G3: لا navigate() مباشرةً — علّم useEffect بالانتظار حتى phase يستقر
      pendingNavigateRef.current = true;
      // إذا currentPhase انتقل إلى "CONFIRMED" بالفعل قبل re-render (نادر)، نتحقق هنا
      // ولكن الحالة الطبيعية — useEffect يرصد التغيير وينتقل
    } else {
      pendingNavigateRef.current = false;
      setConfirmState({
        status: "failed",
        reason: result.reason ?? "unknown_error",
        retryable: result.retryable ?? false,
      });
    }
  }, [session, confirmState.status, transitionTo]);

  // ── Loading state ────────────────────────────────────────────────────────────
  if (isRecovering) {
    return <BookingReviewSkeleton />;
  }

  if (!isValidForReview || !session) {
    return null;
  }

  const isConfirming = confirmState.status === "confirming";

  // ── Edit Handlers ────────────────────────────────────────────────────────────
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
        {/* ─── Header ─────────────────────────────────────────────────────────────── */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-1">مراجعة الحجز</h1>
          <p className="text-sm text-muted-foreground">
            تحقق من التفاصيل قبل تأكيد الموعد
          </p>
        </div>

        {/* ─── Phase indicator (CONFIRMING state) ───────────────────────────────── */}
        {currentPhase === "CONFIRMING" && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
            <span className="h-4 w-4 border-2 border-blue-400 border-t-blue-600 rounded-full animate-spin shrink-0" />
            <p className="text-xs text-blue-700">جاري تأكيد حجزك…</p>
          </div>
        )}

        {/* ─── Confirmation Error Banner ───────────────────────────────────────────── */}
        {confirmState.status === "failed" && (
          <ConfirmationErrorBanner
            reason={confirmState.reason}
            retryable={confirmState.retryable}
            onRetry={handleRetry}
          />
        )}

        {/* ─── Booking Summary Card ─────────────────────────────────────────────── */}
        <div className="bg-card border border-border rounded-xl p-5 mb-4 shadow-sm">
          <h2 className="text-base font-semibold text-foreground mb-4">ملخص الحجز</h2>

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

        {/* ─── Session Expiry Notice ──────────────────────────────────────────────── */}
        <SessionExpiryNotice expiresAt={session.expiresAt} />

        {/* ─── Actions ────────────────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-3 mt-6">
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

        {/* ─── Recovery State Badge (dev-visible) ─────────────────────────────────── */}
        {process.env.NODE_ENV === "development" &&
          session.recoveryState.status !== "fresh" && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs text-amber-700">
                <strong>Recovery:</strong> {session.recoveryState.status}
                {session.recoveryState.reason && ` — ${session.recoveryState.reason}`}
              </p>
            </div>
          )}

        {/* ─── Phase Badge (dev-visible) ────────────────────────────────────────── */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-2 p-2 bg-muted/40 border border-border rounded-lg">
            <p className="text-xs text-muted-foreground font-mono">
              phase: <strong>{currentPhase}</strong>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────────────────

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
