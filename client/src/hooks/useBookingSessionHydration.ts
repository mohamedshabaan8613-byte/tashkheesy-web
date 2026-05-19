/**
 * useBookingSessionHydration.ts — Sprint 3.2
 *
 * ─── HYDRATION_BOUNDARY ────────────────────────────────────────────────────
 *
 * Hydration ≠ Recovery.
 *
 * Hydration:
 *   هل الجلسة الحالية قابلة للاستخدام في هذه الصفحة؟
 *   ✅ تحقق من وجود session
 *   ✅ تحقق من أن phase مناسبة للصفحة الحالية
 *   ✅ تحقق من أن session لم تنته صلاحيتها
 *   ✅ emit حالة للـ UI: ready | stale | expired | missing
 *
 * Recovery:
 *   ماذا نفعل إذا كانت الجلسة تالفة؟
 *   → هذا مسؤولية useBookingOwnershipGuard + recoveryPolicy
 *
 * ❌ هذا الـ hook لا يتخذ قرار redirect
 * ❌ هذا الـ hook لا يستدعي navigate()
 * ✅ يُعيد فقط: hydration status + session
 * ✅ الـ page component هو من يقرر ماذا يعرض بناءً على الحالة
 */

import { useEffect, useState } from "react";
import { useConsultationBooking } from "../contexts/ConsultationBookingContext";
import type { BookingLifecyclePhase, ConsultationBookingSession } from "../types/consultationBookingTypes";
import { isSessionExpired } from "../types/consultationBookingTypes";

export type HydrationStatus =
  | "checking"    // جاري التحقق — لا تعرض شيئاً
  | "ready"       // الجلسة جاهزة وصالحة
  | "stale"       // الجلسة موجودة لكن phase غير مناسبة لهذه الصفحة
  | "expired"     // انتهت صلاحية الجلسة
  | "missing";    // لا توجد جلسة

export interface BookingSessionHydrationResult {
  status: HydrationStatus;
  session: ConsultationBookingSession | null;
  /** الـ phase الفعلية — لتحديد ما إذا كانت هذه الصفحة هي الصحيحة */
  currentPhase: BookingLifecyclePhase | null;
  /** هل الجلسة في phase مناسبة لهذه الصفحة؟ */
  isPhaseValid: boolean;
}

/**
 * useBookingSessionHydration()
 *
 * @param expectedPhases — الـ phases الصالحة لهذه الصفحة
 *
 * مثال الاستخدام:
 *   // في SpecialistSelectionPage:
 *   const { status, session } = useBookingSessionHydration(["CREATED", "SPECIALIST_SELECTION"]);
 *
 *   // في SlotSelectionPage:
 *   const { status, session } = useBookingSessionHydration(["SPECIALIST_SELECTION", "SLOT_SELECTION"]);
 */
export function useBookingSessionHydration(
  expectedPhases: BookingLifecyclePhase[]
): BookingSessionHydrationResult {
  const { session, isRecovering } = useConsultationBooking();
  const [status, setStatus] = useState<HydrationStatus>("checking");

  useEffect(() => {
    // لا تزال محاولة الـ recovery جارية — انتظر
    if (isRecovering) {
      setStatus("checking");
      return;
    }

    if (!session) {
      setStatus("missing");
      return;
    }

    if (isSessionExpired(session)) {
      setStatus("expired");
      return;
    }

    const isPhaseValid = expectedPhases.includes(session.bookingFlowPhase);
    if (!isPhaseValid) {
      setStatus("stale");
      return;
    }

    setStatus("ready");
  }, [session, isRecovering, expectedPhases]);

  const isPhaseValid =
    session !== null &&
    !isSessionExpired(session) &&
    expectedPhases.includes(session.bookingFlowPhase);

  return {
    status,
    session,
    currentPhase: session?.bookingFlowPhase ?? null,
    isPhaseValid,
  };
}
