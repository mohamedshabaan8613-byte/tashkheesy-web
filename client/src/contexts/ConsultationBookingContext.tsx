/**
 * ConsultationBookingContext.tsx — Booking Domain Context
 *
 * Sprint 3.1 — Business Layer Foundation
 * Priority 2: Booking Domain Isolation
 *
 * هذا Context مستقل تماماً عن ConsultationContext.
 *
 * ConsultationContext  → intent + flow phase (لماذا جاء + أين أصبح)
 * ConsultationBookingContext → booking session + lifecycle (كيف يحجز)
 *
 * الاستخدام الصحيح:
 *   useConsultationBookingContext() — فقط من داخل ConsultationBookingProvider
 *   useConsultationContext() — لـ intent والـ flow phase
 *
 * لا تخلط بين الاثنين.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import type {
  BookingDenialReason,
} from "../types/consultationEntitlements";
import type {
  BookingInterruptionReason,
  BookingLifecyclePhase,
  BookingMetadata,
  ConsultationBookingContextValue,
  ConsultationBookingSession,
  ConsultationEntryPoint,
} from "../types/consultationBookingTypes";
import type { ConsultationEntitlement } from "../types/consultationEntitlements";
import { createConsultationBookingRepository } from "../lib/consultationBookingRepository";

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const ConsultationBookingContext =
  createContext<ConsultationBookingContextValue | null>(null);

ConsultationBookingContext.displayName = "ConsultationBookingContext";

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

interface ConsultationBookingProviderProps {
  children: React.ReactNode;
}

export function ConsultationBookingProvider({
  children,
}: ConsultationBookingProviderProps): React.JSX.Element {
  // Repository — مخزّن في ref حتى لا يُعاد إنشاؤه عند كل render
  const repositoryRef = useRef(createConsultationBookingRepository());
  const repo = repositoryRef.current;

  // State — نسخة من الجلسة لتشغيل re-renders
  const [bookingSession, setBookingSession] =
    useState<ConsultationBookingSession | null>(null);

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  const startBookingSession = useCallback(
    (
      intentId: string,
      entryPoint: ConsultationEntryPoint,
      entitlementType: ConsultationEntitlement,
      assessmentSessionId?: string
    ): ConsultationBookingSession => {
      const session = repo.create(
        intentId,
        entryPoint,
        entitlementType,
        assessmentSessionId
      );
      setBookingSession(session);
      return session;
    },
    [repo]
  );

  const advanceBookingPhase = useCallback(
    (to: BookingLifecyclePhase): boolean => {
      const result = repo.updatePhase(to);
      if (result.success && result.session) {
        setBookingSession({ ...result.session });
      }
      return result.success;
    },
    [repo]
  );

  const selectSpecialist = useCallback(
    (specialistId: string): void => {
      repo.selectSpecialist(specialistId);
      const updated = repo.get();
      if (updated) setBookingSession({ ...updated });
    },
    [repo]
  );

  const selectSlot = useCallback(
    (slotId: string): void => {
      repo.selectSlot(slotId);
      const updated = repo.get();
      if (updated) setBookingSession({ ...updated });
    },
    [repo]
  );

  const cancelBookingSession = useCallback(
    (reason?: BookingDenialReason): void => {
      repo.cancel(reason);
      const updated = repo.get();
      if (updated) setBookingSession({ ...updated });
    },
    [repo]
  );

  const clearBookingSession = useCallback((): void => {
    repo.clear();
    setBookingSession(null);
  }, [repo]);

  const recoverBookingSession = useCallback(
    (reason: BookingInterruptionReason): ConsultationBookingSession | null => {
      const recovered = repo.recover(reason);
      if (recovered) setBookingSession({ ...recovered });
      return recovered;
    },
    [repo]
  );

  const getBookingMetadata = useCallback((): BookingMetadata | null => {
    if (!bookingSession) return null;
    return {
      sessionId: bookingSession.sessionId,
      entryPoint: bookingSession.entryPoint,
      entitlementType: bookingSession.entitlementType,
      assessmentSessionId: bookingSession.assessmentSessionId,
      wasRecovered: bookingSession.recoveryState.wasRecovered,
      recoveryAttempts: bookingSession.recoveryState.recoveryAttempts,
      createdAt: bookingSession.createdAt,
      confirmedAt: bookingSession.confirmedAt,
    };
  }, [bookingSession]);

  // ---------------------------------------------------------------------------
  // Derived State
  // ---------------------------------------------------------------------------

  const bookingPhase = bookingSession?.bookingStatus ?? null;
  const hasActiveBooking =
    bookingSession !== null &&
    bookingSession.bookingStatus !== "CANCELLED" &&
    bookingSession.bookingStatus !== "EXPIRED" &&
    bookingSession.bookingStatus !== "ABANDONED" &&
    bookingSession.bookingStatus !== "COMPLETED";
  const wasSessionRecovered =
    bookingSession?.recoveryState.wasRecovered ?? false;

  // ---------------------------------------------------------------------------
  // Context Value
  // ---------------------------------------------------------------------------

  const value: ConsultationBookingContextValue = {
    bookingSession,
    bookingPhase,
    hasActiveBooking,
    wasSessionRecovered,
    startBookingSession,
    advanceBookingPhase,
    selectSpecialist,
    selectSlot,
    cancelBookingSession,
    clearBookingSession,
    recoverBookingSession,
    getBookingMetadata,
  };

  return (
    <ConsultationBookingContext.Provider value={value}>
      {children}
    </ConsultationBookingContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * useConsultationBookingContext
 *
 * الواجهة الرسمية لـ ConsultationBookingContext.
 *
 * ملاحظة: يجب استخدام useConsultationContext() لـ intent والـ flow phase.
 * هذا الهوك لـ booking session فقط.
 */
export function useConsultationBookingContext(): ConsultationBookingContextValue {
  const ctx = useContext(ConsultationBookingContext);
  if (!ctx) {
    throw new Error(
      "useConsultationBookingContext must be used inside ConsultationBookingProvider. " +
        "Ensure ConsultationBookingProvider wraps the component tree."
    );
  }
  return ctx;
}
