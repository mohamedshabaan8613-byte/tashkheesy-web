/**
 * ConsultationBookingContext.tsx — Sprint 3.7.1 PHASE 2
 *
 * ─── Phase 2 additions ──────────────────────────────────────────────────────
 *
 * ✅ useSessionLifecycle is now wired into the Provider:
 *
 *   - sessionMachine (BookingSessionStateMachine) lives as a singleton ref.
 *   - sessionGuard (SessionGuard) wraps every mutation.
 *   - Every PHASE_TRANSITIONED action auto-syncs the state machine.
 *   - guardCheck() is exposed on the context value for consumers that need
 *     pre-flight checks (e.g. UI buttons that want to know if an action is
 *     allowed before triggering it).
 *   - SESSION_STALE is dispatched when a guard returns STALE — triggers
 *     forceRefresh flow in useSessionLifecycle consumers.
 *
 * ─── Mutation guard contract ────────────────────────────────────────────────
 *
 *   selectSpecialist / selectSlot  →  guard.check('SELECT_SPECIALIST' | 'SELECT_SLOT')
 *   transitionTo(phase)            →  guard.check('CONFIRM' | 'RESCHEDULE' | ...)
 *
 *   Blocked reason  │  Effect
 *   ────────────────┼──────────────────────────────────────────
 *   STALE           │  SESSION_STALE dispatched, returns false
 *   CONCURRENT      │  silent no-op, returns false
 *   EXPIRED         │  SESSION_TERMINATED dispatched
 *   INVALID_STATE   │  console.warn, returns false
 *
 * ─── Pre-Phase-2 contract (unchanged) ──────────────────────────────────────
 *
 * ConsultationBookingProvider is the single runtime coordinator:
 *   - hydration lifecycle (hydrateOnce guard)
 *   - runtime safety validation (runtimeSafetyCheck)
 *   - active booking recovery (recovery on mount)
 *   - expiration monitoring (polling every 60 s)
 *   - ownership state (ownershipToken)
 *   - transition dispatching (transitionTo)
 *   - booking runtime cache (sessionRef)
 *
 * ─── advancePhase — محذوف نهائيًا ─────────────────────────────────────────
 *   advancePhase() أُزيل كليًا — لم يعد موجودًا كـ alias أو deprecated.
 *   استخدم transitionTo(nextPhase) حصرًا.
 *
 * ─── Fix N2: PHASE vs PAYLOAD mutations (unchanged) ────────────────────────
 *   transitionTo()              = PHASE mutation (emits domain event)
 *   selectSpecialist/selectSlot = PAYLOAD mutations (no phase change)
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
  BookingPhase,
  BookingRecoveryReason,
  BookingRecoveryState,
  ConsultationBookingSession,
  RuntimeSafetyResult,
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
import {
  BookingSessionStateMachine,
  type SessionMutationType,
} from "../session/BookingSessionStateMachine";
import { SessionGuard } from "../session/SessionGuard";
import type { GuardCheckResult } from "../session/SessionGuard";

// ─── Expiration Poll Interval ─────────────────────────────────────────────────
const EXPIRATION_POLL_MS = 60_000;

// ─── State ────────────────────────────────────────────────────────────────────
interface BookingState {
  session: ConsultationBookingSession | null;
  isRecovering: boolean;
  hasActiveSession: boolean;
  isStale: boolean;
}

const initialState: BookingState = {
  session: null,
  isRecovering: false,
  hasActiveSession: false,
  isStale: false,
};

// ─── Actions ──────────────────────────────────────────────────────────────────
type BookingAction =
  | { type: "SESSION_STARTED";     session: ConsultationBookingSession }
  | { type: "SESSION_RECOVERED";   session: ConsultationBookingSession }
  | { type: "PHASE_TRANSITIONED";  phase: BookingPhase; session: ConsultationBookingSession }
  | { type: "SPECIALIST_SELECTED"; specialistId: string; session: ConsultationBookingSession }
  | { type: "SLOT_SELECTED";       slotId: string; session: ConsultationBookingSession }
  | { type: "SESSION_TERMINATED";  reason: "CANCELLED" | "EXPIRED" | "ABANDONED" }
  | { type: "SESSION_STALE" }
  | { type: "SESSION_REFRESHED" }
  | { type: "RECOVERY_STARTED" }
  | { type: "RECOVERY_FAILED" }
  | { type: "SESSION_CLEARED" };

function bookingReducer(state: BookingState, action: BookingAction): BookingState {
  switch (action.type) {
    case "SESSION_STARTED":
    case "SESSION_RECOVERED":
      return { session: action.session, isRecovering: false, hasActiveSession: true, isStale: false };
    case "PHASE_TRANSITIONED":
    case "SPECIALIST_SELECTED":
    case "SLOT_SELECTED":
      return { ...state, session: action.session, isStale: false };
    case "SESSION_TERMINATED":
      return { session: null, hasActiveSession: false, isRecovering: false, isStale: false };
    case "SESSION_STALE":
      return { ...state, isStale: true };
    case "SESSION_REFRESHED":
      return { ...state, isStale: false };
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

// ─── Context Shape ────────────────────────────────────────────────────────────
interface ConsultationBookingContextValue {
  session: ConsultationBookingSession | null;
  currentPhase: BookingPhase | null;
  isRecovering: boolean;
  hasActiveSession: boolean;
  isStale: boolean;

  /**
   * ownershipToken — sessionId الجلسة النشطة.
   */
  ownershipToken: string | null;

  /**
   * guardCheck() — pre-flight check for UI.
   *
   * يُمكّن الـ UI من التحقق قبل تنفيذ mutation.
   * لا تُنفذ أي تغيير — فحص فقط.
   *
   * @example
   * const result = guardCheck('CONFIRM');
   * if (!result.allowed) { showBlockedReason(result.reason); return; }
   */
  guardCheck(mutation: SessionMutationType): GuardCheckResult;

  startBookingSession(params: {
    consultationIntentId: string;
    entryPoint: BookingEntryPoint;
    entitlementType: BookingEntitlementType;
    assessmentSessionId?: string;
    specialistRecommendation?: SpecialistRecommendation;
  }): ConsultationBookingSession;

  /**
   * transitionTo() — PHASE mutation.
   * الـ UI لا يستدعي هذا مباشرة — يمر عبر orchestrator.
   */
  transitionTo(to: BookingPhase, triggeredBy?: "orchestrator" | "recovery" | "expiration"): boolean;

  /**
   * @deprecated استخدم transitionTo() بدلاً منه.
   */
  advancePhase(to: BookingPhase): boolean;

  /** PAYLOAD mutation — يمكن استدعاؤها من الـ UI مباشرة */
  selectSpecialist(specialistId: string): void;

  /** PAYLOAD mutation — يمكن استدعاؤها من الـ UI مباشرة */
  selectSlot(slotId: string): void;

  cancelBooking(reason?: BookingRecoveryReason): void;
  expireBooking(reason: BookingRecoveryReason): void;
  recoverSession(): ConsultationBookingSession | null;
  isSessionRecoverable(): boolean;
  runtimeSafetyCheck(): RuntimeSafetyResult;
}

const ConsultationBookingContext =
  createContext<ConsultationBookingContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function ConsultationBookingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(bookingReducer, initialState);

  // sessionRef: يُتيح للـ callbacks قراءة الجلسة الحالية دون إعادة إنشائها
  const sessionRef = useRef<ConsultationBookingSession | null>(null);
  sessionRef.current = state.session;

  // ── Phase 2: State Machine + Guard singletons ──────────────────────────────
  //
  // كلاهما singleton — لا يُعاد إنشاؤهما في كل render.
  // sessionMachine يتتبع الـ state الحالي للـ machine.
  // sessionGuard يستخدم sessionMachine لفحص كل mutation قبل تنفيذه.
  //
  const sessionMachineRef = useRef<BookingSessionStateMachine | null>(null);
  const sessionGuardRef   = useRef<SessionGuard | null>(null);

  if (sessionMachineRef.current === null) {
    sessionMachineRef.current = new BookingSessionStateMachine();
  }
  if (sessionGuardRef.current === null) {
    sessionGuardRef.current = new SessionGuard(sessionMachineRef.current);
  }

  // hydrateOnce guard — يمنع double-recovery في React StrictMode
  const hydratedRef = useRef(false);

  // ── Recovery عند mount — مرة واحدة فقط ─────────────────────────────────
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
      const now = new Date().toISOString();
      const updatedSession: ConsultationBookingSession = {
        ...recovered,
        lastActivityAt: now,
        recoveryState: {
          status: "recovered",
          reason: "page_refresh",
          recoveredAt: now,
          recoveredPhase: recovered.bookingFlowPhase,
          auditNote: `auto-recovered on mount from phase: ${recovered.bookingFlowPhase}`,
        },
      };
      consultationBookingRepository.save(updatedSession);
      dispatch({ type: "SESSION_RECOVERED", session: updatedSession });

      // Sync machine to recovered phase
      sessionMachineRef.current!.syncToPhase(updatedSession.bookingFlowPhase);

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

  // ── Expiration Polling ───────────────────────────────────────────────────
  useEffect(() => {
    const poll = setInterval(() => {
      const current = sessionRef.current;
      if (!current) return;
      if (isSessionExpired(current)) {
        consultationBookingRepository.invalidate(current.sessionId, "expiration_poll");
        sessionMachineRef.current!.transition("EXPIRE");
        dispatch({ type: "SESSION_TERMINATED", reason: "EXPIRED" });
      }
    }, EXPIRATION_POLL_MS);

    return () => clearInterval(poll);
  }, []);

  // ── guardCheck — pre-flight check exposed to consumers ──────────────────
  const guardCheck = useCallback((mutation: SessionMutationType): GuardCheckResult => {
    const current = sessionRef.current;
    const clientVersion = current?.lastActivityAt ?? null;
    // server version: repository is source of truth
    const repoSession = current
      ? consultationBookingRepository.load(current.sessionId)
      : null;
    const serverVersion = repoSession?.lastActivityAt ?? null;

    return sessionGuardRef.current!.check(mutation, clientVersion, serverVersion);
  }, []);

  // ── startBookingSession ──────────────────────────────────────────────────
  const startBookingSession = useCallback(
    (params: Parameters<ConsultationBookingContextValue["startBookingSession"]>[0]): ConsultationBookingSession => {
      const existing = sessionRef.current;
      if (existing && !isSessionExpired(existing) && !TERMINAL_PHASES.includes(existing.bookingFlowPhase)) {
        return existing;
      }

      const now = new Date().toISOString();
      const newSession: ConsultationBookingSession = {
        sessionId:            generateBookingSessionId(),
        sourceIntentId:       params.consultationIntentId,
        consultationIntentId: params.consultationIntentId,
        bookingFlowPhase:     "CREATED",
        bookingStatus:        "CREATED",
        lifecycleVersion:     "v1",
        createdAt:            now,
        lastActivityAt:       now,
        expiresAt:            calculateBookingExpiry(),
        entryPoint:           params.entryPoint,
        assessmentSessionId:  params.assessmentSessionId,
        entitlementType:      params.entitlementType,
        specialistRecommendation: params.specialistRecommendation,
        recoveryState: { status: "fresh" },
      };

      consultationBookingRepository.save(newSession);
      consultationBookingRepository.setActive(newSession.sessionId);

      // Reset machine to IDLE then advance to CREATED
      sessionMachineRef.current!.reset();
      sessionMachineRef.current!.transition("CREATE");

      dispatch({ type: "SESSION_STARTED", session: newSession });

      const createdEvent: BookingSessionCreatedEvent = createBookingEvent(
        "BOOKING_SESSION_CREATED",
        newSession.sessionId,
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

  // ── transitionTo() — PHASE mutation ─────────────────────────────────────
  const transitionTo = useCallback(
    (
      to: BookingPhase,
      triggeredBy: "orchestrator" | "recovery" | "expiration" = "orchestrator",
    ): boolean => {
      const current = sessionRef.current;
      if (!current) return false;

      const from = current.bookingFlowPhase;

      if (!isValidTransition(from, to)) {
        console.warn(`[BookingCtx] Invalid transition: ${from} → ${to}`);
        return false;
      }

      // Phase 2: guard check before mutating
      const guardResult = guardCheck("CONFIRM");
      if (!guardResult.allowed) {
        if (guardResult.reason === "STALE") {
          dispatch({ type: "SESSION_STALE" });
        } else if (guardResult.reason === "EXPIRED") {
          consultationBookingRepository.invalidate(current.sessionId, "guard_expired");
          sessionMachineRef.current!.transition("EXPIRE");
          dispatch({ type: "SESSION_TERMINATED", reason: "EXPIRED" });
        }
        console.warn(`[BookingCtx] transitionTo blocked by guard: ${guardResult.reason}`);
        return false;
      }

      const updated: ConsultationBookingSession = {
        ...current,
        bookingFlowPhase: to,
        bookingStatus: to,
        lastActivityAt: new Date().toISOString(),
      };

      consultationBookingRepository.save(updated);

      // Sync machine to new phase
      sessionMachineRef.current!.syncToPhase(to);

      dispatch({ type: "PHASE_TRANSITIONED", phase: to, session: updated });

      const transitionEvent: BookingPhaseTransitionedEvent = createBookingEvent(
        "BOOKING_PHASE_TRANSITIONED",
        current.sessionId,
        current.sourceIntentId,
        { fromPhase: from, toPhase: to, triggeredBy },
      );
      bookingEventBus.publish(transitionEvent);

      return true;
    },
    [guardCheck],
  );

  // ── advancePhase — @deprecated ───────────────────────────────────────────
  const advancePhase = useCallback(
    (to: BookingPhase): boolean => transitionTo(to, "orchestrator"),
    [transitionTo],
  );

  // ── selectSpecialist — PAYLOAD mutation ──────────────────────────────────
  const selectSpecialist = useCallback((specialistId: string): void => {
    const current = sessionRef.current;
    if (!current) return;

    // Phase 2: guard check
    const guardResult = guardCheck("SELECT_SPECIALIST");
    if (!guardResult.allowed) {
      if (guardResult.reason === "STALE") dispatch({ type: "SESSION_STALE" });
      console.warn(`[BookingCtx] selectSpecialist blocked: ${guardResult.reason}`);
      return;
    }

    const updated: ConsultationBookingSession = {
      ...current,
      selectedSpecialistId: specialistId,
      lastActivityAt:       new Date().toISOString(),
    };
    consultationBookingRepository.save(updated);
    dispatch({ type: "SPECIALIST_SELECTED", specialistId, session: updated });
  }, [guardCheck]);

  // ── selectSlot — PAYLOAD mutation ────────────────────────────────────────
  const selectSlot = useCallback((slotId: string): void => {
    const current = sessionRef.current;
    if (!current) return;

    // Phase 2: guard check
    const guardResult = guardCheck("SELECT_SLOT");
    if (!guardResult.allowed) {
      if (guardResult.reason === "STALE") dispatch({ type: "SESSION_STALE" });
      console.warn(`[BookingCtx] selectSlot blocked: ${guardResult.reason}`);
      return;
    }

    const updated: ConsultationBookingSession = {
      ...current,
      selectedSlotId: slotId,
      lastActivityAt: new Date().toISOString(),
    };
    consultationBookingRepository.save(updated);
    dispatch({ type: "SLOT_SELECTED", slotId, session: updated });
  }, [guardCheck]);

  // ── cancelBooking ─────────────────────────────────────────────────────────
  const cancelBooking = useCallback((reason: BookingRecoveryReason = "user_cancelled"): void => {
    const current = sessionRef.current;
    if (!current) return;
    consultationBookingRepository.invalidate(current.sessionId, reason);
    sessionMachineRef.current!.transition("CANCEL");
    dispatch({ type: "SESSION_TERMINATED", reason: "CANCELLED" });
  }, []);

  // ── expireBooking ─────────────────────────────────────────────────────────
  const expireBooking = useCallback((reason: BookingRecoveryReason): void => {
    const current = sessionRef.current;
    if (!current) return;
    consultationBookingRepository.invalidate(current.sessionId, reason);
    sessionMachineRef.current!.transition("EXPIRE");
    dispatch({ type: "SESSION_TERMINATED", reason: "EXPIRED" });
  }, []);

  // ── recoverSession ────────────────────────────────────────────────────────
  const recoverSession = useCallback((): ConsultationBookingSession | null => {
    const active = consultationBookingRepository.loadActive();
    if (!active || isSessionExpired(active)) return null;
    if (TERMINAL_PHASES.includes(active.bookingFlowPhase)) return null;
    return active;
  }, []);

  // ── isSessionRecoverable ──────────────────────────────────────────────────
  const isSessionRecoverable = useCallback((): boolean => {
    const active = consultationBookingRepository.loadActive();
    if (!active || isSessionExpired(active)) return false;
    return RECOVERABLE_PHASES.includes(active.bookingFlowPhase);
  }, []);

  // ── runtimeSafetyCheck ───────────────────────────────────────────────────
  const runtimeSafetyCheck = useCallback((): RuntimeSafetyResult => {
    const current = sessionRef.current;

    if (!current) {
      return {
        status: "missing",
        currentPhase: null,
        diagnosticNote: "No active booking session in context",
      };
    }

    if (isSessionExpired(current)) {
      return {
        status: "expired",
        currentPhase: current.bookingFlowPhase,
        diagnosticNote: `Session ${current.sessionId} expired at ${current.expiresAt}`,
      };
    }

    const repoSession = consultationBookingRepository.load(current.sessionId);
    if (!repoSession) {
      return {
        status: "corrupt",
        currentPhase: current.bookingFlowPhase,
        diagnosticNote:
          `Session ${current.sessionId} exists in context but not in repository — possible corruption`,
      };
    }

    if (repoSession.bookingFlowPhase !== current.bookingFlowPhase) {
      return {
        status: "corrupt",
        currentPhase: current.bookingFlowPhase,
        diagnosticNote:
          `Phase mismatch: context=${current.bookingFlowPhase}, ` +
          `repository=${repoSession.bookingFlowPhase}`,
      };
    }

    return {
      status: "valid",
      currentPhase: current.bookingFlowPhase,
      diagnosticNote: `Session ${current.sessionId} is valid at phase ${current.bookingFlowPhase}`,
    };
  }, []);

  const value: ConsultationBookingContextValue = {
    session:          state.session,
    currentPhase:     state.session?.bookingFlowPhase ?? null,
    isRecovering:     state.isRecovering,
    hasActiveSession: state.hasActiveSession,
    isStale:          state.isStale,
    ownershipToken:   state.session?.sessionId ?? null,
    guardCheck,
    startBookingSession,
    transitionTo,
    advancePhase,
    selectSpecialist,
    selectSlot,
    cancelBooking,
    expireBooking,
    recoverSession,
    isSessionRecoverable,
    runtimeSafetyCheck,
  };

  return (
    <ConsultationBookingContext.Provider value={value}>
      {children}
    </ConsultationBookingContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useConsultationBooking(): ConsultationBookingContextValue {
  const ctx = useContext(ConsultationBookingContext);
  if (!ctx) {
    throw new Error(
      "useConsultationBooking must be used within ConsultationBookingProvider. " +
      "Wrap your component tree with <ConsultationBookingProvider>."
    );
  }
  return ctx;
}
