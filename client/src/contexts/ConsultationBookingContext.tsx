/**
 * ConsultationBookingContext.tsx — Sprint 3.1 Priority 2
 * Updated: Pre-Sprint 3.3 — transitionTo() + Provider Runtime Consolidation
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
 * ─── ما تغيّر في هذا الإصدار ──────────────────────────────────────────
 *
 * 1. TRANSITION_NAMING_FIX
 *    advancePhase() → transitionTo()
 *    transitionTo(nextPhase) = describes resulting state ✅
 *    advancePhase محفوظ كـ @deprecated alias لمنع breaking change.
 *    يُزال في Sprint 3.3 بعد migrate كل استخدامات advancePhase.
 *
 * 2. PROVIDER_RUNTIME_CONSOLIDATION
 *    نُقل إلى Provider:
 *      ✅ expiration polling (كل 60 ثانية — Single Source)
 *      ✅ runtimeSafetyCheck() dispatcher
 *      ✅ ownershipToken (sessionId) — للصفحات بدون قراءة session كاملة
 *    يبقى خارج Provider:
 *      ❌ UI rendering
 *      ❌ navigation
 *      ❌ analytics
 *      ❌ denial copy
 *
 * 3. HYDRATION_BOUNDARY_PRESERVED
 *    useBookingSessionHydration.ts يبقى كما هو.
 *    hydration ≠ runtime safety check.
 *    hydration: هل الجلسة مناسبة لهذه الصفحة؟
 *    runtimeSafetyCheck: هل الجلسة صالحة تقنيًا؟
 *
 * الفرق المعماري:
 *   ConsultationContext          → WHY + WHERE (لماذا + من أين)
 *   ConsultationBookingContext   → HOW         (كيف + runtime + lifecycle)
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

// ─── Expiration Poll Interval ─────────────────────────────────────────────────
/** كل 60 ثانية — يكفي لأن TTL الجلسة هو 2 ساعة */
const EXPIRATION_POLL_MS = 60_000;

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
  | { type: "PHASE_TRANSITIONED";  phase: BookingLifecyclePhase; session: ConsultationBookingSession }
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
    case "PHASE_TRANSITIONED":
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

  /**
   * ownershipToken — sessionId الجلسة النشطة.
   *
   * للصفحات التي تحتاج التحقق من ownership بدون قراءة session كاملة.
   * null إذا لم تكن هناك جلسة نشطة.
   */
  ownershipToken: string | null;

  startBookingSession(params: {
    consultationIntentId: string;
    entryPoint: BookingEntryPoint;
    entitlementType: BookingEntitlementType;
    assessmentSessionId?: string;
    specialistRecommendation?: SpecialistRecommendation;
  }): ConsultationBookingSession;

  /**
   * transitionTo — الانتقال إلى phase جديدة.
   *
   * TRANSITION_NAMING_RULE:
   *   الاسم يصف الحالة الناتجة وليس الحدث السابق.
   *   transitionTo("SLOT_SELECTION")  ← بعد اختيار specialist ✅
   *   transitionTo("REVIEW")          ← بعد اختيار slot ✅
   *   transitionTo("RESCHEDULED")     ← من CONFIRMED عند إعادة الجدولة ✅
   *
   * @returns true إذا نجح الانتقال، false إذا كان invalid
   */
  transitionTo(nextPhase: BookingLifecyclePhase): boolean;

  /**
   * @deprecated استخدم transitionTo() بدلاً منه.
   * advancePhase("SPECIALIST_SELECTION") مُضلِّل semantically.
   * يصف الحدث السابق وليس الحالة الناتجة.
   * سيُزال في Sprint 3.3 بعد migrate كل الاستخدامات.
   * @see transitionTo
   */
  advancePhase(to: BookingLifecyclePhase): boolean;

  selectSpecialist(specialistId: string): void;
  selectSlot(slotId: string): void;
  cancelBooking(reason?: BookingRecoveryReason): void;
  expireBooking(reason: BookingRecoveryReason): void;
  recoverSession(): ConsultationBookingSession | null;
  isSessionRecoverable(): boolean;

  /**
   * runtimeSafetyCheck — تحقق من صحة الجلسة الحالية.
   *
   * PROVIDER_RUNTIME_CONSOLIDATION:
   *   هذه الدالة داخل Provider — لا تُعيد تنفيذها في الصفحات.
   *   تستخدمها الصفحات للتحقق قبل أي عملية حساسة.
   *
   * @returns RuntimeSafetyResult — الحالة + diagnosticNote
   */
  runtimeSafetyCheck(): RuntimeSafetyResult;
}

const ConsultationBookingContext =
  createContext<ConsultationBookingContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────
export function ConsultationBookingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(bookingReducer, initialState);
  const sessionRef = useRef<ConsultationBookingSession | null>(null);
  sessionRef.current = state.session;

  // ── Recovery عند mount ──────────────────────────────────
  useEffect(() => {
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
    } else {
      if (recovered && isSessionExpired(recovered)) {
        consultationBookingRepository.invalidate(recovered.sessionId, "mount_ttl_check");
      }
      dispatch({ type: "RECOVERY_FAILED" });
    }
  }, []);

  // ── Expiration Polling — Provider-level Single Source ───
  /**
   * PROVIDER_RUNTIME_CONSOLIDATION:
   *   Polling يعيش هنا فقط — ليس في الصفحات ولا في hooks.
   *   إذا انتهت صلاحية الجلسة → expireBooking() تلقائيًا.
   *   الصفحات لا تحتاج إنشاء polling خاص بها.
   */
  useEffect(() => {
    const poll = setInterval(() => {
      const current = sessionRef.current;
      if (!current) return;
      if (isSessionExpired(current)) {
        consultationBookingRepository.invalidate(current.sessionId, "expiration_poll");
        dispatch({ type: "SESSION_TERMINATED", reason: "EXPIRED" });
      }
    }, EXPIRATION_POLL_MS);

    return () => clearInterval(poll);
  }, []);

  // ── startBookingSession ──────────────────────────────
  const startBookingSession = useCallback(
    (params: Parameters<ConsultationBookingContextValue["startBookingSession"]>[0]) => {
      const now = new Date().toISOString();
      const newSession: ConsultationBookingSession = {
        sessionId: generateBookingSessionId(),
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
      return newSession;
    },
    []
  );

  // ── transitionTo — الاسم الصحيح semantically ─────────
  /**
   * transitionTo(nextPhase)
   *
   * TRANSITION_NAMING_RULE:
   *   الاسم يصف الحالة الناتجة، وليس الحدث السابق.
   *   هذا يمنع phase drift في state machines المعقدة.
   *
   *   صحيح:
   *     selectSpecialist(id);
   *     transitionTo("SLOT_SELECTION");  ← نحن الآن في SLOT_SELECTION
   *
   *   خاطئ (كان سابقًا):
   *     selectSpecialist(id);
   *     advancePhase("SPECIALIST_SELECTION"); ← هذا اسم الحالة السابقة!
   */
  const transitionTo = useCallback((nextPhase: BookingLifecyclePhase): boolean => {
    const current = sessionRef.current;
    if (!current) return false;

    if (!isValidTransition(current.bookingFlowPhase, nextPhase)) {
      console.warn(
        `[BookingCtx] Invalid transition: ${current.bookingFlowPhase} → ${nextPhase}. ` +
        `Check ALLOWED_TRANSITIONS in consultationBookingTypes.ts`
      );
      return false;
    }

    const updated: ConsultationBookingSession = {
      ...current,
      bookingFlowPhase: nextPhase,
      bookingStatus: nextPhase,
      lastActivityAt: new Date().toISOString(),
    };

    consultationBookingRepository.save(updated);
    dispatch({ type: "PHASE_TRANSITIONED", phase: nextPhase, session: updated });
    return true;
  }, []);

  // ── advancePhase — @deprecated alias ─────────────────
  /**
   * @deprecated استخدم transitionTo() بدلاً منه.
   * محفوظ لمنع breaking change — سيُزال في Sprint 3.3.
   */
  const advancePhase = useCallback(
    (to: BookingLifecyclePhase): boolean => {
      console.warn(
        `[BookingCtx] advancePhase() is deprecated. Use transitionTo("${to}") instead. ` +
        `advancePhase will be removed in Sprint 3.3.`
      );
      return transitionTo(to);
    },
    [transitionTo]
  );

  // ── selectSpecialist ─────────────────────────────────
  const selectSpecialist = useCallback((specialistId: string): void => {
    const current = sessionRef.current;
    if (!current) return;
    const updated = {
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
    const updated = {
      ...current,
      selectedSlotId: slotId,
      lastActivityAt: new Date().toISOString(),
    };
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

  // ── runtimeSafetyCheck — Provider Single Source ──────
  /**
   * runtimeSafetyCheck()
   *
   * PROVIDER_RUNTIME_CONSOLIDATION:
   *   لا تُعيد بناء هذا الـ check في الصفحات.
   *   استدعِه مباشرة من الـ context.
   *
   * يتحقق من:
   *   1. وجود جلسة نشطة
   *   2. أن الجلسة لم تنتهِ صلاحيتها (TTL)
   *   3. أن الـ phase ليست terminal بشكل غير متوقع
   *   4. تناسق sessionId مع repository
   */
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

    // تحقق من تناسق repository مع context state
    const repoSession = consultationBookingRepository.load(current.sessionId);
    if (!repoSession) {
      return {
        status: "corrupt",
        currentPhase: current.bookingFlowPhase,
        diagnosticNote: `Session ${current.sessionId} exists in context but not in repository — possible corruption`,
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
    session: state.session,
    currentPhase: state.session?.bookingFlowPhase ?? null,
    isRecovering: state.isRecovering,
    hasActiveSession: state.hasActiveSession,
    ownershipToken: state.session?.sessionId ?? null,
    startBookingSession,
    transitionTo,
    advancePhase,   // @deprecated — alias لـ transitionTo
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

// ─── Hook ─────────────────────────────────────────────────────────────────
export function useConsultationBooking(): ConsultationBookingContextValue {
  const ctx = useContext(ConsultationBookingContext);
  if (!ctx) {
    throw new Error(
      "useConsultationBooking must be used within ConsultationBookingProvider. " +
      "Do NOT import ConsultationContext inside this hook."
    );
  }
  return ctx;
}
