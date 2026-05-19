/**
 * ConsultationBookingContext.tsx — Sprint 3.3 PHASE 1 (updated)
 *
 * Context مستقل تمامًا عن ConsultationContext.
 *
 * ❌❌❌ تحذير صريح ❌❌❌
 * لا تُضف داخل هذا الملف:
 *   useConsultationContext()
 *   useConsultation()
 *   import ... from ConsultationContext
 *
 * الفصل يجب أن يكون كاملاً على مستوى الكود.
 * إذا احتجت بيانات consultation → مرّرها عبر startBookingSession() params.
 * إذا احتجت intent لاحقًا → استخدم ConsultationBookingOrchestrator.
 *
 * ─── Sprint 3.3 Changes ──────────────────────────────────────────────────────
 *
 * ADDED: transitionTo() — المسار الوحيد لتغيير الـ lifecycle phase.
 *   - يُصدر domain event BOOKING_PHASE_TRANSITIONED عند كل transition ناجح.
 *   - الـ UI يستدعي orchestrator الذي يستدعي transitionTo().
 *   - لا تستدعي transitionTo() مباشرة من الـ UI.
 *
 * PRESERVED: advancePhase() — محفوظ للتوافق مع الكود القائم.
 *   - سيُزال في Sprint 3.4 بعد ترحيل جميع المستدعيين إلى transitionTo().
 *
 * ADDED: hydrateOnce guard — يمنع double-recovery في React StrictMode.
 *
 * sourceIntentId — immutable linkage:
 *   startBookingSession يقبل consultationIntentId ويُخزنه في sourceIntentId.
 *   المعرفان identicals في v1 — sourceIntentId هو الاسم الكنسي.
 *
 * الفرق المعماري:
 *   ConsultationContext          → WHY + WHERE (لماذا + من أين)
 *   ConsultationBookingContext   → HOW         (كيف + تتبع الحجز)
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
  BookingRecoveryReason,
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
import {
  bookingEventBus,
  createBookingEvent,
} from "../types/bookingDomainEvents";
import type {
  BookingPhaseTransitionedEvent,
  BookingSessionCreatedEvent,
  BookingRecoveredEvent,
} from "../types/bookingDomainEvents";

// ─── State ────────────────────────────────────────────────────────────────
interface BookingState {
  session: ConsultationBookingSession | null;
  isRecovering: boolean;
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
  session: ConsultationBookingSession | null;
  currentPhase: BookingLifecyclePhase | null;
  isRecovering: boolean;
  hasActiveSession: boolean;

  startBookingSession(params: {
    consultationIntentId: string;
    entryPoint: BookingEntryPoint;
    entitlementType: BookingEntitlementType;
    assessmentSessionId?: string;
    specialistRecommendation?: SpecialistRecommendation;
  }): ConsultationBookingSession;

  /**
   * transitionTo() — Sprint 3.3: المسار الوحيد لتغيير الـ lifecycle phase.
   *
   * RULE 2: الـ UI لا يستدعي هذا مباشرة.
   *         يستدعيه orchestrator بعد validation + persistence.
   *
   * يُصدر BOOKING_PHASE_TRANSITIONED event عند كل transition ناجح.
   */
  transitionTo(to: BookingLifecyclePhase, triggeredBy?: "orchestrator" | "recovery" | "expiration"): boolean;

  /**
   * @deprecated استخدم transitionTo() بدلاً منه.
   * محفوظ للتوافق مع الكود القائم — سيُزال في Sprint 3.4.
   */
  advancePhase(to: BookingLifecyclePhase): boolean;

  selectSpecialist(specialistId: string): void;
  selectSlot(slotId: string): void;
  cancelBooking(reason?: BookingRecoveryReason): void;
  expireBooking(reason: BookingRecoveryReason): void;
  recoverSession(): ConsultationBookingSession | null;
  isSessionRecoverable(): boolean;
}

const ConsultationBookingContext =
  createContext<ConsultationBookingContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────
export function ConsultationBookingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(bookingReducer, initialState);
  const sessionRef = useRef<ConsultationBookingSession | null>(null);
  sessionRef.current = state.session;

  /**
   * hydrateOnce guard — Sprint 3.1 hardening
   * يمنع double-recovery في React StrictMode.
   */
  const hydratedRef = useRef(false);

  // ── Recovery عند mount ──────────────────────────────────
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;

    dispatch({ type: "RECOVERY_STARTED" });
    const recovered = consultationBookingRepository.loadActive();

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
          reason: "page_refresh",
          recoveredAt: new Date().toISOString(),
          recoveredPhase: recovered.bookingFlowPhase,
          auditNote: `auto-recovered on mount from phase: ${recovered.bookingFlowPhase}`,
        },
      };
      consultationBookingRepository.save(updatedSession);
      dispatch({ type: "SESSION_RECOVERED", session: updatedSession });

      // Domain event: BOOKING_RECOVERED
      const recoveryEvent: BookingRecoveredEvent = createBookingEvent(
        "BOOKING_RECOVERED",
        updatedSession.sessionId,
        updatedSession.sourceIntentId,
        {
          recoveredPhase: updatedSession.bookingFlowPhase,
          recoveredAt: updatedSession.recoveryState.recoveredAt ?? new Date().toISOString(),
        },
      );
      bookingEventBus.publish(recoveryEvent);
    } else {
      if (recovered && isSessionExpired(recovered)) {
        consultationBookingRepository.invalidate(recovered.sessionId, "mount_ttl_check");
      }
      dispatch({ type: "RECOVERY_FAILED" });
    }
  }, []);

  // ── startBookingSession ──────────────────────────────
  const startBookingSession = useCallback(
    (params: Parameters<ConsultationBookingContextValue["startBookingSession"]>[0]) => {
      const now = new Date().toISOString();
      const sessionId = generateBookingSessionId();

      const newSession: ConsultationBookingSession = {
        sessionId,
        // sourceIntentId = consultationIntentId (v1 identicals)
        sourceIntentId: params.consultationIntentId,
        consultationIntentId: params.consultationIntentId,
        bookingFlowPhase: "CREATED",
        bookingStatus: "CREATED",
        lifecycleVersion: "v1",
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
      consultationBookingRepository.setActive(newSession.sessionId);
      dispatch({ type: "SESSION_STARTED", session: newSession });

      // Domain event: BOOKING_SESSION_CREATED
      const createdEvent: BookingSessionCreatedEvent = createBookingEvent(
        "BOOKING_SESSION_CREATED",
        sessionId,
        newSession.sourceIntentId,
        {
          entryPoint: params.entryPoint,
          entitlementType: params.entitlementType,
          assessmentSessionId: params.assessmentSessionId,
        },
      );
      bookingEventBus.publish(createdEvent);

      return newSession;
    },
    [],
  );

  // ── transitionTo() — Sprint 3.3: canonical mutation path ────────────────
  const transitionTo = useCallback(
    (
      to: BookingLifecyclePhase,
      triggeredBy: "orchestrator" | "recovery" | "expiration" = "orchestrator",
    ): boolean => {
      const current = sessionRef.current;
      if (!current) return false;

      const from = current.bookingFlowPhase;

      if (!isValidTransition(from, to)) {
        console.warn(`[BookingCtx] Invalid transition: ${from} → ${to}`);
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

      // Domain event: BOOKING_PHASE_TRANSITIONED
      const transitionEvent: BookingPhaseTransitionedEvent = createBookingEvent(
        "BOOKING_PHASE_TRANSITIONED",
        current.sessionId,
        current.sourceIntentId,
        { fromPhase: from, toPhase: to, triggeredBy },
      );
      bookingEventBus.publish(transitionEvent);

      return true;
    },
    [],
  );

  // ── advancePhase — @deprecated: delegates to transitionTo ────────────────
  const advancePhase = useCallback(
    (to: BookingLifecyclePhase): boolean => transitionTo(to, "orchestrator"),
    [transitionTo],
  );

  // ── selectSpecialist ─────────────────────────────────
  const selectSpecialist = useCallback((specialistId: string): void => {
    const current = sessionRef.current;
    if (!current) return;
    const updated = { ...current, selectedSpecialistId: specialistId, lastActivityAt: new Date().toISOString() };
    consultationBookingRepository.save(updated);
    dispatch({ type: "SPECIALIST_SELECTED", specialistId, session: updated });
  }, []);

  // ── selectSlot ───────────────────────────────────────
  const selectSlot = useCallback((slotId: string): void => {
    const current = sessionRef.current;
    if (!current) return;
    const updated = { ...current, selectedSlotId: slotId, lastActivityAt: new Date().toISOString() };
    consultationBookingRepository.save(updated);
    dispatch({ type: "SLOT_SELECTED", slotId, session: updated });
  }, []);

  // ── cancelBooking ────────────────────────────────────
  const cancelBooking = useCallback((reason: BookingRecoveryReason = "user_cancelled"): void => {
    const current = sessionRef.current;
    if (!current) return;
    consultationBookingRepository.invalidate(current.sessionId, reason);
    dispatch({ type: "SESSION_TERMINATED", reason: "CANCELLED" });
  }, []);

  // ── expireBooking ────────────────────────────────────
  const expireBooking = useCallback((reason: BookingRecoveryReason): void => {
    const current = sessionRef.current;
    if (!current) return;
    consultationBookingRepository.invalidate(current.sessionId, reason);
    dispatch({ type: "SESSION_TERMINATED", reason: "EXPIRED" });
  }, []);

  // ── recoverSession ───────────────────────────────────
  const recoverSession = useCallback((): ConsultationBookingSession | null => {
    const active = consultationBookingRepository.loadActive();
    if (!active || isSessionExpired(active)) return null;
    if (TERMINAL_PHASES.includes(active.bookingFlowPhase)) return null;
    return active;
  }, []);

  // ── isSessionRecoverable ─────────────────────────────
  const isSessionRecoverable = useCallback((): boolean => {
    const active = consultationBookingRepository.loadActive();
    if (!active || isSessionExpired(active)) return false;
    return RECOVERABLE_PHASES.includes(active.bookingFlowPhase);
  }, []);

  const value: ConsultationBookingContextValue = {
    session: state.session,
    currentPhase: state.session?.bookingFlowPhase ?? null,
    isRecovering: state.isRecovering,
    hasActiveSession: state.hasActiveSession,
    startBookingSession,
    transitionTo,
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
export function useConsultationBooking(): ConsultationBookingContextValue {
  const ctx = useContext(ConsultationBookingContext);
  if (!ctx) {
    throw new Error(
      "useConsultationBooking must be used within ConsultationBookingProvider. " +
      "Do NOT import ConsultationContext inside this hook.",
    );
  }
  return ctx;
}
