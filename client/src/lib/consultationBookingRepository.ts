/**
 * consultationBookingRepository.ts — Booking Repository Layer
 *
 * Sprint 3.1 — Business Layer Foundation
 * Priority 2: Booking Domain Isolation
 *
 * هذا الملف يوفّر طبقة repository لـ booking sessions.
 *
 * الحالة الحالية (Sprint 3.1):
 *   in-memory + sessionStorage مؤقتاً.
 *
 * تحذير معماري:
 * ════════════════════════════════════════════════
 * TEMPORARY: sessionStorage implementation.
 * Sprint 3.1 Priority 3 (Persistence Layer):
 *   يجب استبدال هذا الملف بـ Supabase repository.
 *   الواجهة (create/get/update/clear) تبقى ثابتة — فقط التنفيذ يتغيّر.
 * ════════════════════════════════════════════════
 */

import type {
  BookingDenialReason,
} from "../types/consultationEntitlements";
import type {
  BookingInterruptionReason,
  BookingLifecyclePhase,
  BookingRecoveryState,
  ConsultationBookingSession,
  ConsultationEntryPoint,
} from "../types/consultationBookingTypes";
import type { ConsultationEntitlement } from "../types/consultationEntitlements";
import {
  BOOKING_RECOVERABLE_PHASES,
  BOOKING_TERMINAL_PHASES,
} from "../types/consultationBookingTypes";

// ---------------------------------------------------------------------------
// Storage Key
// ---------------------------------------------------------------------------

const BOOKING_SESSION_KEY = "tashkheesy_booking_session_v1";

// ---------------------------------------------------------------------------
// Transition Guard
// ---------------------------------------------------------------------------

/**
 * يتحقق من صلاحية الانتقال بين حالتين.
 *
 * القاعدة البسيطة:
 *   1. لا يمكن الانتقال من حالة نهائية.
 *   2. CANCELLED و EXPIRED يمكن الوصول إليهما من أي حالة غير نهائية.
 *   3. باقي الانتقالات تتبع التسلسل المنطقي فقط.
 */
function isValidTransition(
  from: BookingLifecyclePhase,
  to: BookingLifecyclePhase
): boolean {
  // لا يمكن الخروج من حالة نهائية
  if (BOOKING_TERMINAL_PHASES.has(from)) return false;

  // إلى CANCELLED أو EXPIRED: مسموح من أي حالة غير نهائية
  if (to === "CANCELLED" || to === "EXPIRED" || to === "ABANDONED") return true;

  const ALLOWED: Partial<Record<BookingLifecyclePhase, BookingLifecyclePhase[]>> = {
    CREATED:              ["SPECIALIST_SELECTION"],
    SPECIALIST_SELECTION: ["SLOT_SELECTION"],
    SLOT_SELECTION:       ["REVIEW", "SPECIALIST_SELECTION"],
    REVIEW:               ["CONFIRMED", "SLOT_SELECTION"],
    CONFIRMED:            ["COMPLETED"],
  };

  return ALLOWED[from]?.includes(to) ?? false;
}

// ---------------------------------------------------------------------------
// ID Generator
// ---------------------------------------------------------------------------

function generateSessionId(): string {
  return `booking_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

// ---------------------------------------------------------------------------
// sessionStorage helpers (TEMPORARY — Sprint 3.1 Priority 3)
// ---------------------------------------------------------------------------

function persistSession(session: ConsultationBookingSession): void {
  try {
    sessionStorage.setItem(BOOKING_SESSION_KEY, JSON.stringify(session));
  } catch {
    // sessionStorage محجوب في sandbox — فشل صامت
  }
}

function loadPersistedSession(): ConsultationBookingSession | null {
  try {
    const raw = sessionStorage.getItem(BOOKING_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ConsultationBookingSession;
  } catch {
    return null;
  }
}

function clearPersistedSession(): void {
  try {
    sessionStorage.removeItem(BOOKING_SESSION_KEY);
  } catch {
    // فشل صامت
  }
}

// ---------------------------------------------------------------------------
// Repository
// ---------------------------------------------------------------------------

/**
 * createConsultationBookingRepository
 *
 * مصنع ريروبِتوري لجلسة الحجز.
 * كل عملية create/update/recover تمر عبر هذه الواجهة حصراً.
 *
 * يُستخدم داخل ConsultationBookingContext فقط.
 */
export function createConsultationBookingRepository() {
  // in-memory store (primary)
  let _session: ConsultationBookingSession | null = null;

  // ---------------------------------------------------------------------------

  function create(
    intentId: string,
    entryPoint: ConsultationEntryPoint,
    entitlementType: ConsultationEntitlement,
    assessmentSessionId?: string
  ): ConsultationBookingSession {
    const now = new Date().toISOString();
    const initialRecovery: BookingRecoveryState = {
      wasRecovered: false,
      recoveryAttempts: 0,
    };

    const session: ConsultationBookingSession = {
      sessionId: generateSessionId(),
      consultationIntentId: intentId,
      entryPoint,
      assessmentSessionId,
      entitlementType,
      bookingStatus: "CREATED",
      createdAt: now,
      lastActivityAt: now,
      recoveryState: initialRecovery,
    };

    _session = session;
    persistSession(session);
    return session;
  }

  // ---------------------------------------------------------------------------

  function get(): ConsultationBookingSession | null {
    return _session;
  }

  // ---------------------------------------------------------------------------

  function updatePhase(
    to: BookingLifecyclePhase,
    extras?: Partial<Pick<
      ConsultationBookingSession,
      "selectedSpecialistId" | "selectedSlotId" | "confirmedAt" | "denialReason"
    >>
  ): { success: boolean; session: ConsultationBookingSession | null } {
    if (!_session) return { success: false, session: null };

    const from = _session.bookingStatus;
    if (!isValidTransition(from, to)) {
      console.warn(
        `[BookingRepository] Invalid transition: ${from} → ${to}`
      );
      return { success: false, session: _session };
    }

    _session = {
      ..._session,
      bookingStatus: to,
      lastActivityAt: new Date().toISOString(),
      ...(to === "CONFIRMED" && { confirmedAt: new Date().toISOString() }),
      ...extras,
    };

    persistSession(_session);
    return { success: true, session: _session };
  }

  // ---------------------------------------------------------------------------

  function selectSpecialist(specialistId: string): void {
    if (!_session) return;
    _session = {
      ..._session,
      selectedSpecialistId: specialistId,
      lastActivityAt: new Date().toISOString(),
    };
    persistSession(_session);
  }

  function selectSlot(slotId: string): void {
    if (!_session) return;
    _session = {
      ..._session,
      selectedSlotId: slotId,
      lastActivityAt: new Date().toISOString(),
    };
    persistSession(_session);
  }

  // ---------------------------------------------------------------------------

  function cancel(reason?: BookingDenialReason): void {
    if (!_session) return;
    _session = {
      ..._session,
      bookingStatus: "CANCELLED",
      lastActivityAt: new Date().toISOString(),
      ...(reason && { denialReason: reason }),
    };
    persistSession(_session);
  }

  // ---------------------------------------------------------------------------

  function clear(): void {
    _session = null;
    clearPersistedSession();
  }

  // ---------------------------------------------------------------------------

  /**
   * يحاول استعادة جلسة من sessionStorage بعد انقطاع.
   *
   * شروط الاستعادة:
   *   • توجد جلسة مخزّنة
   *   • حالتها قابلة للاستعادة (BOOKING_RECOVERABLE_PHASES)
   *   • لم تنته صلاحيتها (أقل من 2 ساعة)
   */
  function recover(
    reason: BookingInterruptionReason
  ): ConsultationBookingSession | null {
    const persisted = _session ?? loadPersistedSession();
    if (!persisted) return null;

    // فحص إذا الحالة قابلة للاستعادة
    if (!BOOKING_RECOVERABLE_PHASES.has(persisted.bookingStatus)) return null;

    // فحص عمر الجلسة (2 ساعة)
    const ageMs = Date.now() - new Date(persisted.lastActivityAt).getTime();
    if (ageMs > 2 * 60 * 60 * 1000) return null;

    _session = {
      ...persisted,
      lastActivityAt: new Date().toISOString(),
      recoveryState: {
        wasRecovered: true,
        lastInterruptionReason: reason,
        recoveryAttempts: (persisted.recoveryState.recoveryAttempts ?? 0) + 1,
        lastActiveAt: persisted.lastActivityAt,
        interruptedAtPhase: persisted.bookingStatus,
      },
    };

    persistSession(_session);
    return _session;
  }

  // ---------------------------------------------------------------------------

  return { create, get, updatePhase, selectSpecialist, selectSlot, cancel, clear, recover };
}

export type ConsultationBookingRepository = ReturnType<
  typeof createConsultationBookingRepository
>;
