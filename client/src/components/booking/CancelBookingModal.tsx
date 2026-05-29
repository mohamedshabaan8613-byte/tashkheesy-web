/**
 * CancelBookingModal.tsx — Sprint 3.5
 *
 * Reusable cancel booking UI component.
 * Used by: BookingReviewPage, ActiveBookingPage, Dashboard.
 *
 * FEATURES:
 *   - Cancel button (disabled states: non-cancellable phase, in-progress)
 *   - Confirmation modal (two-step: button → modal confirm)
 *   - Loading spinner during cancellation
 *   - Error state with retry option
 *   - Optimistic locking via useCancelBooking hook
 *   - Policy message when phase is non-cancellable
 *
 * USAGE:
 *   <CancelBookingModal
 *     session={session}
 *     currentPhase={currentPhase}
 *     onCancelled={() => navigate(CONSULTATION_ROUTES.START, { replace: true })}
 *   />
 *
 * DESIGN RULES:
 *   - This component does NOT navigate. Caller provides onCancelled callback.
 *   - This component does NOT own cancellation logic. useCancelBooking owns that.
 *   - Modal is portal-less (inline div) — avoids z-index complexity in Sprint 3.5.
 */

import { useState, useCallback } from "react";
import type { BookingPhase, ConsultationBookingSession } from "../../types/consultationBookingTypes";
import { isCancellablePhase, getCancellationPolicyMessage } from "../../orchestrators/CancellationOrchestrator";
import { useCancelBooking } from "../../hooks/useCancelBooking";

// ─── Props ────────────────────────────────────────────────────────────────────

export interface CancelBookingModalProps {
  /** Current runtime session. Required for orchestrator. */
  session: ConsultationBookingSession;
  /** Current booking phase (may differ from session.bookingFlowPhase in flight). */
  currentPhase: BookingPhase;
  /**
   * Called after successful cancellation.
   * Caller should navigate to START or show a confirmation message.
   */
  onCancelled: () => void;
  /** Optional label override for the trigger button. */
  cancelButtonLabel?: string;
  /** Optional reason prefix shown in confirmation modal. */
  context?: "review" | "active" | "dashboard";
}

// ─── Component ───────────────────────────────────────────────────────────────────

export function CancelBookingModal({
  session,
  currentPhase,
  onCancelled,
  cancelButtonLabel = "إلغاء الحجز",
  context = "review",
}: CancelBookingModalProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { cancel, isCancelling, cancelError, resetError } = useCancelBooking(session, onCancelled);

  const canCancel = isCancellablePhase(currentPhase);
  const policyMessage = canCancel ? null : getCancellationPolicyMessage(currentPhase);

  const handleTrigger = useCallback(() => {
    if (!canCancel || isCancelling) return;
    resetError();
    setIsModalOpen(true);
  }, [canCancel, isCancelling, resetError]);

  const handleConfirm = useCallback(async () => {
    setIsModalOpen(false);
    await cancel();
  }, [cancel]);

  const handleClose = useCallback(() => {
    if (isCancelling) return; // don’t close mid-flight
    setIsModalOpen(false);
    resetError();
  }, [isCancelling, resetError]);

  const contextLabel: Record<typeof context, string> = {
    review: "هل أنت متأكد من إلغاء الحجز قبل التأكيد؟",
    active: "هل أنت متأكد من إلغاء هذا الموعد المؤكد؟",
    dashboard: "هل تريد إلغاء هذا الحجز؟",
  };

  return (
    <div dir="rtl">
      {/* ─── Trigger Button ─── */}
      <div className="relative">
        <button
          type="button"
          onClick={handleTrigger}
          disabled={!canCancel || isCancelling}
          aria-label={cancelButtonLabel}
          aria-disabled={!canCancel || isCancelling}
          title={policyMessage ?? undefined}
          className={[
            "w-full py-2.5 px-4 rounded-lg text-sm transition-colors",
            canCancel && !isCancelling
              ? "bg-transparent border border-border text-muted-foreground hover:bg-red-50 hover:border-red-300 hover:text-red-700"
              : "bg-transparent border border-border/40 text-muted-foreground/40 cursor-not-allowed",
          ].join(" ")}
        >
          {isCancelling ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-3.5 w-3.5 border-2 border-muted-foreground/40 border-t-muted-foreground rounded-full animate-spin" />
              جاري الإلغاء…
            </span>
          ) : (
            cancelButtonLabel
          )}
        </button>

        {/* Policy tooltip — shown below button if phase non-cancellable */}
        {policyMessage && (
          <p className="mt-1.5 text-xs text-muted-foreground/70 text-center">
            {policyMessage}
          </p>
        )}
      </div>

      {/* ─── Error Banner ─── */}
      {cancelError && (
        <CancellationErrorBanner
          reason={cancelError}
          onRetry={() => {
            resetError();
            setIsModalOpen(true);
          }}
        />
      )}

      {/* ─── Confirmation Modal ─── */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          <div className="bg-card border border-border rounded-xl p-6 shadow-xl max-w-sm w-full mx-4">
            {/* Title */}
            <h2
              id="cancel-modal-title"
              className="text-base font-semibold text-foreground mb-2"
            >
              تأكيد الإلغاء
            </h2>

            {/* Body */}
            <p className="text-sm text-muted-foreground mb-6">
              {contextLabel[context]}
            </p>

            {/* CONFIRMED phase extra warning */}
            {currentPhase === "CONFIRMED" && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xs text-amber-700">
                  ⚠️ سيتم إلغاء الموعد المؤكد. قد يتم تطبيق سياسة الإلغاء حسب الشروط.
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isCancelling}
                className="w-full py-2.5 px-4 bg-red-600 text-white rounded-lg text-sm font-semibold
                           hover:bg-red-700 active:bg-red-800 transition-colors
                           disabled:bg-red-300 disabled:cursor-not-allowed"
                aria-label="تأكيد إلغاء الحجز"
              >
                {isCancelling ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    جاري الإلغاء…
                  </span>
                ) : (
                  "نعم، إلغاء الحجز"
                )}
              </button>

              <button
                type="button"
                onClick={handleClose}
                disabled={isCancelling}
                className="w-full py-2.5 px-4 bg-transparent border border-border text-muted-foreground rounded-lg text-sm
                           hover:bg-muted/50 transition-colors
                           disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="إغلاق نافذة الإلغاء"
              >
                لا، الرجوع
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── CancellationErrorBanner ────────────────────────────────────────────────────

function CancellationErrorBanner({
  reason,
  onRetry,
}: {
  reason: string;
  onRetry: () => void;
}) {
  const messages: Record<string, string> = {
    non_cancellable_phase: "لا يمكن إلغاء الحجز في هذا الوضع.",
    ownership_token_mismatch: "تعذّر التحقق من صلاحية الإلغاء. حاول مجددًا.",
    stale_lifecycle_version: "تم تحديث الجلسة من مكان آخر. أعد تحميل الصفحة.",
    authoritative_version_unavailable: "لا يمكن التحقق من الجلسة حاليًا. تحقق من الاتصال.",
    reservation_release_failed: "لم يتم تحرير الموعد، لكن الحجز أُلغي.",
    persist_failed: "تعذّر حفظ الإلغاء. تواصل مع الدعم.",
    unknown_error: "حدث خطأ غير متوقع. حاول مرة أخرى.",
  };

  const message = messages[reason] ?? messages.unknown_error;
  const isRetryable = !["non_cancellable_phase", "persist_failed"].includes(reason);

  return (
    <div
      role="alert"
      className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start justify-between gap-3"
    >
      <p className="text-xs text-red-700 flex-1">{message}</p>
      {isRetryable && (
        <button
          type="button"
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
