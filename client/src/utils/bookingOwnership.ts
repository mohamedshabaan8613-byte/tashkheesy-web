/**
 * bookingOwnership.ts — Sprint 3.1 Pre-3.2 Hardening (Point 4)
 *
 * ─── PURPOSE ──────────────────────────────────────────────────────────────────
 * يتحقق من أن المستخدم يملك حق الوصول لـ bookingSession معين.
 *
 * الخطر بدون هذا:
 *   /consultation/booking?id=xyz
 *   قد يُعرض لأي مستخدم — حتى لو لم ينشئ الجلسة.
 *
 * ─── CURRENT IMPLEMENTATION (Sprint 3.1) ─────────────────────────────────────
 * sessionStorage only — يتحقق أن الـ session مخزنة محليًا.
 *
 * ─── SPRINT 3.2+ UPGRADE PATH ────────────────────────────────────────────────
 * استبدل validateBookingOwnership() بـ server-side check:
 *   const { data } = await supabase
 *     .from('consultation_bookings')
 *     .select('id')
 *     .eq('id', sessionId)
 *     .eq('user_id', currentUser.id)
 *     .single();
 *
 * ─── RULE ─────────────────────────────────────────────────────────────────────
 * كل صفحة booking تستدعي validateBookingOwnership() عند mount.
 * لا تعرض محتوى booking قبل اجتياز هذا الفحص.
 */

import type { ConsultationBookingSession } from "../types/consultationBookingTypes";
import { isSessionExpired } from "../types/consultationBookingTypes";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

// ─── Ownership Result ─────────────────────────────────────────────────────────

export type BookingOwnershipStatus =
  | "OWNED"           // الجلسة موجودة وصالحة وتعود للمستخدم الحالي
  | "NOT_FOUND"        // لا توجد جلسة بهذا الـ ID
  | "EXPIRED"          // الجلسة موجودة لكن منتهية الصلاحية
  | "MISMATCH"         // الـ ID في URL لا يطابق الجلسة النشطة
  | "UNAUTHORIZED";    // Sprint 3.2+: Supabase ملكية مغايرة

export interface BookingOwnershipResult {
  status: BookingOwnershipStatus;
  session: ConsultationBookingSession | null;
  /** سبب الرفض — للـ orchestrator / logging */
  rejectReason?: string;
}

// ─── Core Validator ───────────────────────────────────────────────────────────

/**
 * validateBookingOwnership — يتحقق من ملكية الجلسة.
 *
 * @param sessionId  — الـ ID من URL أو state
 * @param loadSession — دالة تُحمّل الجلسة (من sessionStorage أو Supabase لاحقًا)
 *
 * RULE: استدعِ هذا قبل render أي صفحة booking.
 *
 * Sprint 3.1: sessionStorage check فقط.
 * Sprint 3.2+: استبدل loadSession بـ async Supabase call.
 */
export function validateBookingOwnership(
  sessionId: string | null | undefined,
  loadSession: (id: string) => ConsultationBookingSession | null
): BookingOwnershipResult {
  // لا يوجد ID — ليس هنا بشكل صحيح
  if (!sessionId || sessionId.trim() === "") {
    return {
      status: "NOT_FOUND",
      session: null,
      rejectReason: "no_session_id_provided",
    };
  }

  const session = loadSession(sessionId);

  // الجلسة غير موجودة في storage
  if (!session) {
    return {
      status: "NOT_FOUND",
      session: null,
      rejectReason: `session_not_found:${sessionId}`,
    };
  }

  // الجلسة منتهية الصلاحية
  if (isSessionExpired(session)) {
    return {
      status: "EXPIRED",
      session,
      rejectReason: `session_expired:expiresAt=${session.expiresAt}`,
    };
  }

  // الـ sessionId في URL لا يطابق sourceIntentId في الجلسة
  // (حماية من URL tampering البسيطة)
  if (session.sessionId !== sessionId) {
    return {
      status: "MISMATCH",
      session: null,
      rejectReason: `session_id_mismatch:expected=${session.sessionId},got=${sessionId}`,
    };
  }

  return { status: "OWNED", session };
}

// ─── React Hook ───────────────────────────────────────────────────────────────

/**
 * useBookingOwnershipGuard — يُشغَّل عند mount أي صفحة booking.
 *
 * الاستخدام في Sprint 3.2 (BookingPage, SpecialistSelectionPage, etc.):
 * ```tsx
 * const { isOwned, isChecking } = useBookingOwnershipGuard(sessionId, loadSession);
 * if (isChecking) return <LoadingSpinner />;
 * if (!isOwned) return null; // redirect حدث تلقائيًا
 * ```
 *
 * RULE: لا تعرض محتوى booking قبل isOwned === true.
 */
export function useBookingOwnershipGuard(
  sessionId: string | null | undefined,
  loadSession: (id: string) => ConsultationBookingSession | null
): { isOwned: boolean; isChecking: boolean; ownershipStatus: BookingOwnershipStatus | null } {
  const [, setLocation] = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [ownershipStatus, setOwnershipStatus] = useState<BookingOwnershipStatus | null>(null);

  useEffect(() => {
    const result = validateBookingOwnership(sessionId, loadSession);
    setOwnershipStatus(result.status);
    setIsChecking(false);

    if (result.status !== "OWNED") {
      // redirect بناءً على سبب الرفض
      switch (result.status) {
        case "EXPIRED":
          setLocation("/consultation/start");
          break;
        case "NOT_FOUND":
        case "MISMATCH":
        case "UNAUTHORIZED":
        default:
          setLocation("/consultation/start");
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  return {
    isOwned: ownershipStatus === "OWNED",
    isChecking,
    ownershipStatus,
  };
}
