/**
 * ConsultationBookingContext.tsx — Sprint 3.1 Priority 2
 *
 * Context مستقل تمامًا عن ConsultationContext.
 *
 * الفرق المعماري:
 *   ConsultationContext     → WHY + WHERE (intent, flow phase, entry point)
 *   ConsultationBookingContext → HOW      (booking session, lifecycle, selections)
 *
 * لا يقرأ ConsultationContext مباشرة — الفصل كامل على مستوى الكود.
 * startBookingSession يستقبل البيانات المطلوبة كـ parameters.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
  type ReactNode,
} from "react";
import type {
  BookingEntitlementType,
  BookingEntryPoint,
  BookingLifecyclePhase,
  BookingRecoveryState,
  ConsultationBookingSession,
  SpecialistRecommendation,
} from "../types/consultationBookingTypes";
import {
  RECOVERABLE_PHASES,
  TERMINAL_PHASES,
  calculateBookingExpiry,
  generateBookingSessionId,
  isSessionExpired,
  isValidTransition,
} from "../types/consultationBookingTypes";
import { consultationBookingRepository } from "../repositories/ConsultationBookingRepository";

// ─── State ────────────────────────────────────────────────────────────────
interface BookingState {
  session: ConsultationBookingSession | null;
  isRecovering: boolean;   // هل النظام في مرحلة استرداد الجلسة
  hasActiveSession: boolean;
}

const initialState: BookingState = {
  session: null,
  isRecovering: false,
  hasActiveSession: false,
};

// ─── Actions ──────────────────────────────────────────────────────────────
type BookingAction =
  | { type: "SESSION_STARTED";     session: ConsultationBookingSession }
  | { type: "SESSION_RECOVERED";   session: ConsultationBookingSession }
  | { type: "PHASE_ADVANCED";      phase: BookingLifecyclePhase; session: ConsultationBookingSession }
  | { type: "SPECIALIST_SELECTED"; specialistId: string; session: ConsultationBookingSession }
  | { type: "SLOT_SELECTED";       slotId: string; session: ConsultationBookingSession }
  | { type: "SESSION_TERMINATED"; reason: "CANCELLED" | "EXPIRED" | "ABANDONED" }
  | { type: "RECOVERY_STARTED" }
  | { type: "RECOVERY_FAILED" }
  | { type: "SESSION_CLEARED" };

function bookingReducer(state: BookingState, action: BookingAction): BookingState {
  switch (action.type) {
    case "SESSION_STARTED":
    case "SESSION_RECOVERED":
      return { session: action.session, isRecovering: false, hasActiveSession: true };

    case "PHASE_ADVANCED":
    case "SPECIALIST_SELECTED":
    case "SLOT_SELECTED":
      return { ...state, session: action.session };

    case "SESSION_TERMINATED":
      return { ...state, session: null, hasActiveSession: false };

    case "RECOVERY_STARTED":
      return { ...state, isRecovering: true };

    case "RECOVERY_FAILED":
      return { ...state, isRecovering: false };

    case "SESSION_CLEARED":
      return initialState;

    default:
      return state;
  }
}

// ─── Context Shape ────────────────────────────────────────────────────────
interface ConsultationBookingContextValue {
  // ── State ────────────────────────────────────────────
  session: ConsultationBookingSession | null;
  currentPhase: BookingLifecyclePhase | null;
  isRecovering: boolean;
  hasActiveSession: boolean;

  // ── Lifecycle Actions ─────────────────────────────────
  startBookingSession(params: {
    consultationIntentId: string;
    entryPoint: BookingEntryPoint;
    entitlementType: BookingEntitlementType;
    assessmentSessionId?: string;
    specialistRecommendation?: SpecialistRecommendation;
  }): ConsultationBookingSession;

  advancePhase(to: BookingLifecyclePhase): boolean;
  selectSpecialist(specialistId: string): void;
  selectSlot(slotId: string): void;
  cancelBooking(): void;
  expireBooking(reason: string): void;

  // ── Recovery ─────────────────────────────────────────
  recoverSession(): ConsultationBookingSession | null;
  isSessionRecoverable(): boolean;
}

const ConsultationBookingContext =
  createContext<ConsultationBookingContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────
export function ConsultationBookingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(bookingReducer, initialState);

  // Ref للـ session الحالية لاستخدامها في callbacks بدون re-render
  const sessionRef = useRef<ConsultationBookingSession | null>(null);
  sessionRef.current = state.session;

  // ── Recovery عند mount: هل يوجد جلسة سابقة؟ ──────────
  useEffect(() => {
    dispatch({ type: "RECOVERY_STARTED" });

    const recovered = consultationBookingRepository.loadLatest();

    if (
      recovered &&
      !isSessionExpired(recovered) &&
      RECOVERABLE_PHASES.includes(recovered.bookingFlowPhase)
    ) {
      const updatedSession: ConsultationBookingSession = {
        ...recovered,
        lastActivityAt: new Date().toISOString(),
        recoveryState: {
          status: "recovered",
          recoveredAt: new Date().toISOString(),
          recoveredPhase: recovered.bookingFlowPhase,
        },
      };
      consultationBookingRepository.save(updatedSession);
      dispatch({ type: "SESSION_RECOVERED", session: updatedSession });
    } else {
      if (recovered && isSessionExpired(recovered)) {
        consultationBookingRepository.invalidate(recovered.sessionId, "TTL_EXPIRED_ON_MOUNT");
      }
      dispatch({ type: "RECOVERY_FAILED" });
    }
  }, []);

  // ── startBookingSession ──────────────────────────────
  const startBookingSession = useCallback(
    (params: Parameters<ConsultationBookingContextValue["startBookingSession"]>[0]) => {
      const now = new Date().toISOString();
      const newSession: ConsultationBookingSession = {
        sessionId: generateBookingSessionId(),
        consultationIntentId: params.consultationIntentId,
        bookingFlowPhase: "CREATED",
        bookingStatus: "CREATED",
        createdAt: now,
        lastActivityAt: now,
        expiresAt: calculateBookingExpiry(),
        entryPoint: params.entryPoint,
        assessmentSessionId: params.assessmentSessionId,
        entitlementType: params.entitlementType,
        specialistRecommendation: params.specialistRecommendation,
        recoveryState: { status: "fresh" },
      };

      consultationBookingRepository.save(newSession);
      dispatch({ type: "SESSION_STARTED", session: newSession });
      return newSession;
    },
    []
  );

  // ── advancePhase ─────────────────────────────────────
  const advancePhase = useCallback((to: BookingLifecyclePhase): boolean => {
    const current = sessionRef.current;
    if (!current) return false;

    if (!isValidTransition(current.bookingFlowPhase, to)) {
      console.warn(
        `[BookingContext] Invalid transition: ${current.bookingFlowPhase} → ${to}`
      );
      return false;
    }

    const updated: ConsultationBookingSession = {
      ...current,
      bookingFlowPhase: to,
      bookingStatus: to,
      lastActivityAt: new Date().toISOString(),
    };

    consultationBookingRepository.save(updated);
    dispatch({ type: "PHASE_ADVANCED", phase: to, session: updated });
    return true;
  }, []);

  // ── selectSpecialist ─────────────────────────────────
  const selectSpecialist = useCallback((specialistId: string): void => {
    const current = sessionRef.current;
    if (!current) return;

    const updated: ConsultationBookingSession = {
      ...current,
      selectedSpecialistId: specialistId,
      lastActivityAt: new Date().toISOString(),
    };

    consultationBookingRepository.save(updated);
    dispatch({ type: "SPECIALIST_SELECTED", specialistId, session: updated });
  }, []);

  // ── selectSlot ───────────────────────────────────────
  const selectSlot = useCallback((slotId: string): void => {
    const current = sessionRef.current;
    if (!current) return;

    const updated: ConsultationBookingSession = {
      ...current,
      selectedSlotId: slotId,
      lastActivityAt: new Date().toISOString(),
    };

    consultationBookingRepository.save(updated);
    dispatch({ type: "SLOT_SELECTED", slotId, session: updated });
  }, []);

  // ── cancelBooking ────────────────────────────────────
  const cancelBooking = useCallback((): void => {
    const current = sessionRef.current;
    if (!current) return;

    consultationBookingRepository.invalidate(current.sessionId, "USER_CANCELLED");
    dispatch({ type: "SESSION_TERMINATED", reason: "CANCELLED" });
  }, []);

  // ── expireBooking ────────────────────────────────────
  const expireBooking = useCallback((reason: string): void => {
    const current = sessionRef.current;
    if (!current) return;

    consultationBookingRepository.invalidate(current.sessionId, reason);
    dispatch({ type: "SESSION_TERMINATED", reason: "EXPIRED" });
  }, []);

  // ── recoverSession ───────────────────────────────────
  const recoverSession = useCallback((): ConsultationBookingSession | null => {
    const latest = consultationBookingRepository.loadLatest();
    if (!latest || isSessionExpired(latest)) return null;
    if (TERMINAL_PHASES.includes(latest.bookingFlowPhase)) return null;
    return latest;
  }, []);

  // ── isSessionRecoverable ─────────────────────────────
  const isSessionRecoverable = useCallback((): boolean => {
    const latest = consultationBookingRepository.loadLatest();
    if (!latest || isSessionExpired(latest)) return false;
    return RECOVERABLE_PHASES.includes(latest.bookingFlowPhase);
  }, []);

  const value: ConsultationBookingContextValue = {
    session: state.session,
    currentPhase: state.session?.bookingFlowPhase ?? null,
    isRecovering: state.isRecovering,
    hasActiveSession: state.hasActiveSession,
    startBookingSession,
    advancePhase,
    selectSpecialist,
    selectSlot,
    cancelBooking,
    expireBooking,
    recoverSession,
    isSessionRecoverable,
  };

  return (
    <ConsultationBookingContext.Provider value={value}>
      {children}
    </ConsultationBookingContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────
/**
 * useConsultationBooking — الـ hook الرسمي للوصول إلى booking context.
 *
 * يجب استخدامه فقط داخل ConsultationBookingProvider.
 * لا تستخدمه خارج صفحات /consultation/*
 */
export function useConsultationBooking(): ConsultationBookingContextValue {
  const ctx = useContext(ConsultationBookingContext);
  if (!ctx) {
    throw new Error(
      "useConsultationBooking must be used within ConsultationBookingProvider"
    );
  }
  return ctx;
}
