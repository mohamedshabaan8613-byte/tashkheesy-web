/**
 * ConsultationBookingContext.tsx — Sprint 3.3 PHASE 1 (Fix N2 docs)
 * ConsultationBookingContext.tsx
 *
 * Pre-Sprint 3.3 — Stabilization Phase
 *
 * ─── Runtime Coordinator Contract ──────────────────────────────────────────
 *
 * ConsultationBookingProvider هو المنسق الوحيد لـ booking runtime:
 *
 * ✅ يملك Provider:
 *   - hydration lifecycle (مرة واحدة فقط — hydrateOnce guard)
 *   - runtime safety validation (runtimeSafetyCheck)
 *   - active booking recovery (recovery on mount)
 *   - expiration monitoring (polling كل 60 ثانية)
 *   - ownership state (ownershipToken)
 *   - transition dispatching (transitionTo)
 *   - booking runtime cache (sessionRef)
 *
 * ❌ يبقى خارج Provider:
 *   - navigation
 *   - UI rendering
 *   - denial presentation
 *   - analytics
 *   - emotional copy
 *   - toasts
 *
 * ─── advancePhase — محذوف نهائيًا ─────────────────────────────────────────
 *   advancePhase() أُزيل كليًا — لم يعد موجودًا كـ alias أو deprecated.
 *   استخدم transitionTo(nextPhase) حصرًا.
 *   السبب: advancePhase("SPECIALIST_SELECTION") يصف الحدث السابق (ambiguous).
 *           transitionTo("SLOT_SELECTION") يصف الحالة الناتجة (deterministic).
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
 *
 * ─── Fix N2: توضيح الفرق بين PHASE mutations و PAYLOAD mutations ───────────
 *
 * هذا الـ context يحتوي نوعين من الـ mutations — وهما مختلفان تمامًا:
 *
 * ── النوع الأول: PHASE mutations ────────────────────────────────────────────
 *
 *   الدوال: transitionTo() — وهي المصدر الوحيد والكامل لهذا النوع.
 *
 *   ماذا تفعل:
 *     - تُغيّر bookingFlowPhase في الـ session
 *     - تُغيّر bookingStatus
 *     - تُصدر BOOKING_PHASE_TRANSITIONED domain event
 *     - تتحقق من صحة الـ transition عبر isValidTransition()
 *     - تحفظ الـ session بالـ repository
 *
 *   قاعدة الاستخدام:
 *     transitionTo() لا تُستدعى من الـ UI مباشرة.
 *     المسار الصحيح: UI → orchestrator → transitionTo()
 *
 *   لماذا هذا مهم:
 *     PHASE mutations هي التي تُنتج domain events.
 *     إذا حدثت خارج transitionTo() → لا domain event → recovery corruption.
 *
 * ── النوع الثاني: PAYLOAD mutations ─────────────────────────────────────────
 *
 *   الدوال: selectSpecialist() + selectSlot()
 *
 *   ماذا تفعل:
 *     - تُعدّل payload fields فقط: selectedSpecialistId, selectedSlotId
 *     - لا تُغيّر bookingFlowPhase
 *     - لا تُصدر domain event (هذا مقصود)
 *     - تحفظ الـ session بالـ repository مباشرة
 *
 *   قاعدة الاستخدام:
 *     يمكن استدعاؤها من الـ UI مباشرة.
 *     لا تمر عبر transitionTo() لأنها لا تُغيّر lifecycle phase.
 *
 *   لماذا لا تمر عبر transitionTo():
 *     transitionTo() مصمم لتغيير الـ phase + إصدار domain event.
 *     اختيار الأخصائي أو الموعد لا يُشكّل phase transition في الـ lifecycle.
 *     هو تحديث لبيانات الحجز فقط داخل نفس الـ phase.
 *
 * ── الخلاصة ─────────────────────────────────────────────────────────────────
 *
 *   transitionTo() = مصدر وحيد لتغيير lifecycle phase
 *   selectSpecialist/selectSlot = payload mutations فقط، لا تغير الـ phase
 *
 *   إذا احتجت لتغيير phase + payload في نفس الوقت:
 *     1. استدعي selectSpecialist() أو selectSlot() أولاً
 *     2. ثم استدعي transitionTo() عبر orchestrator
 * ─── sourceIntentId Migration ──────────────────────────────────────────────
 *   sourceIntentId هو الحقل الكنسي الرسمي (immutable linkage).
 *   consultationIntentId محفوظ كـ readonly alias في النوع فقط.
 *   جميع العمليات الداخلية تستخدم sourceIntentId حصرًا.
 *
 * ─── hydrateOnce Guard ──────────────────────────────────────────────────────
 *   useRef(false) يمنع double-recovery في React StrictMode.
 *   بدونه: StrictMode يُشغّل useEffect مرتين → recovery مزدوج.
 *
 * ─── الفصل المعماري ────────────────────────────────────────────────────────
 *   ConsultationContext          → WHY + WHERE (لماذا + من أين)
 *   ConsultationBookingContext   → HOW         (كيف + runtime + lifecycle)
 *
 * ❌❌❌ تحذير صريح ❌❌❌
 *   لا تُضف داخل هذا الملف:
 *     useConsultationContext()
 *     useConsultation()
 *     import ... from ConsultationContext
 *   الفصل يجب أن يكون كاملاً على مستوى الكود.
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

// ─── Expiration Poll Interval ─────────────────────────────────────────────────
/** كل 60 ثانية — يكفي لأن TTL الجلسة هو 2 ساعة */
const EXPIRATION_POLL_MS = 60_000;

// ─── State ────────────────────────────────────────────────────────────────────
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

// ─── Actions ──────────────────────────────────────────────────────────────────
type BookingAction =
  | { type: "SESSION_STARTED";     session: ConsultationBookingSession }
  | { type: "SESSION_RECOVERED";   session: ConsultationBookingSession }
  | { type: "PHASE_TRANSITIONED";  phase: BookingPhase; session: ConsultationBookingSession }
  | { type: "SPECIALIST_SELECTED"; specialistId: string; session: ConsultationBookingSession }
  | { type: "SLOT_SELECTED";       slotId: string; session: ConsultationBookingSession }
  | { type: "SESSION_TERMINATED";  reason: "CANCELLED" | "EXPIRED" | "ABANDONED" }
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

// ─── Context Shape ────────────────────────────────────────────────────────────
interface ConsultationBookingContextValue {
  session: ConsultationBookingSession | null;
  currentPhase: BookingPhase | null;
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
   * transitionTo() — PHASE mutation.
   *
   * المصدر الوحيد لتغيير lifecycle phase في الـ session.
   *
   * RULE 2: الـ UI لا يستدعي هذا مباشرة.
   *         يستدعيه orchestrator بعد validation + persistence.
   *
   * يُصدر BOOKING_PHASE_TRANSITIONED domain event عند كل transition ناجح.
   *
   * انظر Fix N2 في أعلى الملف للفرق الكامل بين PHASE و PAYLOAD mutations.
   */
  transitionTo(to: BookingLifecyclePhase, triggeredBy?: "orchestrator" | "recovery" | "expiration"): boolean;

  /**
   * @deprecated استخدم transitionTo() بدلاً منه.
   * محفوظ للتوافق مع الكود القائم — سيُزال في Sprint 3.4.
   */
  advancePhase(to: BookingLifecyclePhase): boolean;

  /**
   * selectSpecialist() — PAYLOAD mutation.
   *
   * تُعدّل selectedSpecialistId فقط — لا تُغيّر lifecycle phase.
   * يمكن استدعاؤها من الـ UI مباشرة.
   *
   * انظر Fix N2 في أعلى الملف للفرق الكامل بين PHASE و PAYLOAD mutations.
    *
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
  transitionTo(nextPhase: BookingPhase): boolean;

  selectSpecialist(specialistId: string): void;

  /**
   * selectSlot() — PAYLOAD mutation.
   *
   * تُعدّل selectedSlotId فقط — لا تُغيّر lifecycle phase.
   * يمكن استدعاؤها من الـ UI مباشرة.
   *
   * انظر Fix N2 في أعلى الملف للفرق الكامل بين PHASE و PAYLOAD mutations.
   */
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
   */
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

  /**
   * hydrateOnce guard — Sprint 3.1 hardening
   * يمنع double-recovery في React StrictMode.
   */
  const hydratedRef = useRef(false);

  // ── Recovery عند mount ──────────────────────────────────
  // hydrateOnce guard: يمنع double-recovery في React StrictMode
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

  // ── Expiration Polling — Provider-level Single Source ───────────────────
  //
  // PROVIDER_RUNTIME_CONSOLIDATION:
  //   Polling يعيش هنا فقط — ليس في الصفحات ولا في hooks.
  //   الصفحات لا تحتاج إنشاء polling خاص بها.
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

  // ── startBookingSession ──────────────────────────────────────────────────
  const startBookingSession = useCallback(
    (params: Parameters<ConsultationBookingContextValue["startBookingSession"]>[0]): ConsultationBookingSession => {
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
      };

      // sourceIntentId = الرابط الثابت مع ConsultationIntent (Rule 4)
      const newSession: ConsultationBookingSession = {
        sessionId:            generateBookingSessionId(),
        sourceIntentId:       params.consultationIntentId,
        consultationIntentId: params.consultationIntentId, // readonly alias
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

  // ── transitionTo() — PHASE mutation ─────────────────────────────────────
  //
  // المصدر الوحيد لتغيير lifecycle phase.
  // يُصدر BOOKING_PHASE_TRANSITIONED domain event.
  // لا يُستدعى من الـ UI مباشرة — يمر عبر orchestrator.
  //
  // انظر Fix N2 في أعلى الملف.
  //
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
      dispatch({ type: "PHASE_TRANSITIONED", phase: to, session: updated });

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

  // ── selectSpecialist — PAYLOAD mutation ──────────────────────────────────
  //
  // تُعدّل selectedSpecialistId فقط.
  // لا تُغيّر bookingFlowPhase — لا تمر عبر transitionTo().
  // يمكن استدعاؤها من الـ UI مباشرة.
  //
  // انظر Fix N2 في أعلى الملف.
  //
  const selectSpecialist = useCallback((specialistId: string): void => {
    const current = sessionRef.current;
    if (!current) return;
    const updated: ConsultationBookingSession = {
      ...current,
      selectedSpecialistId: specialistId,
      lastActivityAt:       new Date().toISOString(),
    };
    consultationBookingRepository.save(updated);
    dispatch({ type: "SPECIALIST_SELECTED", specialistId, session: updated });
  }, []);

  // ── selectSlot — PAYLOAD mutation ────────────────────────────────────────
  //
  // تُعدّل selectedSlotId فقط.
  // لا تُغيّر bookingFlowPhase — لا تمر عبر transitionTo().
  // يمكن استدعاؤها من الـ UI مباشرة.
  //
  // انظر Fix N2 في أعلى الملف.
  //
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

  // ── cancelBooking ─────────────────────────────────────────────────────────
  const cancelBooking = useCallback((reason: BookingRecoveryReason = "user_cancelled"): void => {
    const current = sessionRef.current;
    if (!current) return;
    consultationBookingRepository.invalidate(current.sessionId, reason);
    dispatch({ type: "SESSION_TERMINATED", reason: "CANCELLED" });
  }, []);

  // ── expireBooking ─────────────────────────────────────────────────────────
  const expireBooking = useCallback((reason: BookingRecoveryReason): void => {
    const current = sessionRef.current;
    if (!current) return;
    consultationBookingRepository.invalidate(current.sessionId, reason);
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

  // ── runtimeSafetyCheck — Provider Single Source ───────────────────────────
  //
  // PROVIDER_RUNTIME_CONSOLIDATION:
  //   لا تُعيد بناء هذا الـ check في الصفحات — استدعِه من الـ context.
  //
  //   يتحقق من:
  //     1. وجود جلسة نشطة
  //     2. أن الجلسة لم تنتهِ صلاحيتها (TTL)
  //     3. تناسق sessionId مع repository
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
    ownershipToken:   state.session?.sessionId ?? null,
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
