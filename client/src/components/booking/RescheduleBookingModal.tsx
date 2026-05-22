/**
 * RescheduleBookingModal.tsx — Sprint 3.5 Phase 1B
 *
 * Reschedule booking UI component.
 * Used by: ActiveBookingPage, Dashboard (post-confirmation views).
 *
 * 3-STEP FLOW:
 *   Step 1 “Select”   — trigger button (shows current slot info)
 *   Step 2 “Confirm”  — modal: slot picker + confirm action
 *   Step 3 “Progress” — loading overlay while orchestrator runs
 *
 * SLOT PICKER INTEGRATION:
 *   The component exposes a `renderSlotPicker` render prop.
 *   The parent page provides the actual slot picker UI (AvailableSlotsGrid etc.)
 *   to avoid coupling this component to slot fetching.
 *
 * DESIGN RULES:
 *   - Does NOT navigate. Caller provides onRescheduled callback.
 *   - Does NOT own orchestration logic. useRescheduleBooking owns that.
 *   - Optimistic locking via useRescheduleBooking action lock.
 */

import { useState, useCallback } from "react";
import type { BookingPhase, ConsultationBookingSession } from "../../types/consultationBookingTypes";
import { isReschedulablePhase, getReschedulePolicyMessage } from "../../orchestrators/RescheduleOrchestrator";
import { useRescheduleBooking } from "../../hooks/useRescheduleBooking";

// ─── Props ────────────────────────────────────────────────────────────────────

export interface RescheduleBookingModalProps {
  session: ConsultationBookingSession;
  currentPhase: BookingPhase;
  currentReservationId: string | null;
  /** Current slot label (e.g., "الثلاثاء 27 مايو • 10:00 ص") for display. */
  currentSlotLabel: string;
  /**
   * Render prop: the parent provides the slot picker UI.
   * The component calls onSlotSelected(slotId) when a slot is chosen.
   */
  renderSlotPicker: (onSlotSelected: (slotId: string) => void) => React.ReactNode;
  /** Called after successful reschedule. Caller navigates. */
  onRescheduled: (newSlotId: string) => void;
  rescheduleButtonLabel?: string;
}

// ─── Component ───────────────────────────────────────────────────────────────────

export function RescheduleBookingModal({
  session,
  currentPhase,
  currentReservationId,
  currentSlotLabel,
  renderSlotPicker,
  onRescheduled,
  rescheduleButtonLabel = "إعادة الجدولة",
}: RescheduleBookingModalProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  const canReschedule = isReschedulablePhase(currentPhase);
  const policyMessage = canReschedule ? null : getReschedulePolicyMessage(currentPhase);

  const handleRescheduled = useCallback(
    (newSlotId: string) => {
      setIsModalOpen(false);
      setSelectedSlotId(null);
      onRescheduled(newSlotId);
    },
    [onRescheduled],
  );

  const { reschedule, isRescheduling, rescheduleError, resetError } = useRescheduleBooking(
    session,
    currentReservationId,
    handleRescheduled,
  );

  const handleTrigger = useCallback(() => {
    if (!canReschedule || isRescheduling) return;
    resetError();
    setSelectedSlotId(null);
    setIsModalOpen(true);
  }, [canReschedule, isRescheduling, resetError]);

  const handleConfirm = useCallback(async () => {
    if (!selectedSlotId) return;
    await reschedule(selectedSlotId);
  }, [selectedSlotId, reschedule]);

  const handleClose = useCallback(() => {
    if (isRescheduling) return;
    setIsModalOpen(false);
    setSelectedSlotId(null);
    resetError();
  }, [isRescheduling, resetError]);

  return (
    <div dir="rtl">
      {/* ─── Trigger Button ─── */}
      <div className="relative">
        <button
          type="button"
          onClick={handleTrigger}
          disabled={!canReschedule || isRescheduling}
          aria-label={rescheduleButtonLabel}
          title={policyMessage ?? undefined}
          className={[
            "w-full py-2.5 px-4 rounded-lg text-sm border transition-colors",
            canReschedule && !isRescheduling
              ? "bg-transparent border-border text-muted-foreground hover:bg-primary/5 hover:border-primary/40 hover:text-primary"
              : "bg-transparent border-border/40 text-muted-foreground/40 cursor-not-allowed",
          ].join(" ")}
        >
          {isRescheduling ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-3.5 w-3.5 border-2 border-muted-foreground/40 border-t-muted-foreground rounded-full animate-spin" />
              جاري إعادة الجدولة…
            </span>
          ) : (
            rescheduleButtonLabel
          )}
        </button>
        {policyMessage && (
          <p className="mt-1.5 text-xs text-muted-foreground/70 text-center">{policyMessage}</p>
        )}
      </div>

      {/* ─── Error Banner ─── */}
      {rescheduleError && (
        <RescheduleErrorBanner
          reason={rescheduleError}
          onRetry={() => { resetError(); setIsModalOpen(true); }}
        />
      )}

      {/* ─── Modal ─── */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="reschedule-modal-title"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
        >
          <div className="bg-card border border-border rounded-t-2xl sm:rounded-xl w-full sm:max-w-lg max-h-[90dvh] flex flex-col shadow-xl">

            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-border shrink-0">
              <h2 id="reschedule-modal-title" className="text-base font-semibold text-foreground">
                إعادة جدولة الموعد
              </h2>
              <button
                type="button"
                onClick={handleClose}
                disabled={isRescheduling}
                aria-label="إغلاق"
                className="p-1.5 rounded-md text-muted-foreground hover:bg-muted/50 disabled:opacity-40"
              >
                ×
              </button>
            </div>

            {/* Current slot info */}
            <div className="px-5 py-3 bg-muted/30 border-b border-border text-sm text-muted-foreground shrink-0">
              <span className="font-medium text-foreground">الموعد الحالي: </span>
              {currentSlotLabel}
            </div>

            {/* Slot picker (render prop) */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <p className="text-sm text-muted-foreground mb-3">اختر موعدًا جديدًا:</p>
              {renderSlotPicker((slotId) => setSelectedSlotId(slotId))}
            </div>

            {/* Confirm action */}
            <div className="px-5 py-4 border-t border-border shrink-0 flex flex-col gap-2">
              {selectedSlotId && (
                <p className="text-xs text-primary font-medium mb-1">
                  ✔ تم اختيار موعد جديد
                </p>
              )}
              <button
                type="button"
                onClick={handleConfirm}
                disabled={!selectedSlotId || isRescheduling}
                className="w-full py-2.5 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-semibold
                           hover:bg-primary/90 active:bg-primary/80 transition-colors
                           disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isRescheduling ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    جاري إعادة الجدولة…
                  </span>
                ) : (
                  "تأكيد إعادة الجدولة"
                )}
              </button>
              <button
                type="button"
                onClick={handleClose}
                disabled={isRescheduling}
                className="w-full py-2.5 px-4 bg-transparent border border-border text-muted-foreground rounded-lg text-sm
                           hover:bg-muted/50 transition-colors disabled:opacity-40"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── RescheduleErrorBanner ──────────────────────────────────────────────────

function RescheduleErrorBanner({ reason, onRetry }: { reason: string; onRetry: () => void }) {
  const messages: Record<string, string> = {
    non_reschedulable_phase:           "لا يمكن إعادة جدولة الحجز في هذا الوضع.",
    ownership_token_mismatch:          "تعذّر التحقق من صلاحية إعادة الجدولة.",
    stale_lifecycle_version:           "تم تحديث الجلسة من تبويب آخر. أعد تحميل الصفحة.",
    authoritative_version_unavailable: "لا يمكن التحقق من الجلسة. تحقق من الاتصال.",
    new_slot_unavailable:              "الموعد المختار لم يعد متاحًا. اختر موعدًا آخر.",
    new_slot_reservation_failed:       "تعذّر حجز الموعد الجديد. حاول مجددًا.",
    old_slot_release_failed:           "تعذّر تحرير الموعد القديم. تواصل مع الدعم.",
    persist_failed:                    "تعذّر حفظ إعادة الجدولة. تواصل مع الدعم.",
    unknown_error:                     "حدث خطأ غير متوقع. حاول مرة أخرى.",
  };
  const message = messages[reason] ?? messages.unknown_error;
  const isRetryable = !("non_reschedulable_phase" === reason || "persist_failed" === reason);

  return (
    <div role="alert" className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start justify-between gap-3">
      <p className="text-xs text-amber-700 flex-1">{message}</p>
      {isRetryable && (
        <button type="button" onClick={onRetry}
          className="text-xs text-amber-700 font-semibold underline underline-offset-2 whitespace-nowrap shrink-0">
          حاول مجددًا
        </button>
      )}
    </div>
  );
}
