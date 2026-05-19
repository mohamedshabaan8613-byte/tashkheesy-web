/**
 * consultationStateMachine.ts — Consultation Flow State Machine
 *
 * Sprint 3.0c | Phase 1 — Runtime Completion
 *
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * ARCHITECTURE BOUNDARY — هذا الملف هو Runtime Layer فقط
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * ✅ مسموح داخل هذا الملف:
 *   - state transitions (IDLE → INTRO → BOOKING → …)
 *   - transition guards (canTransition)
 *   - phase resolution from URL or hydration
 *   - recovery phase logic
 *
 * ❌ ممنوع داخل هذا الملف:
 *   - copy / labels / text (→ consultationCopy.ts)
 *   - routing decisions (→ consultationBookingOrchestrator.ts)
 *   - entitlements / payments (→ Business Layer Sprint 3.3+)
 *   - UX awareness (severity, emotional tone)
 *   - analytics events
 *
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import type {
  ConsultationFlowPhase,
  ConsultationIntent,
  ConsultationNavigationState,
} from "../types/consultationTypes";

// ---------------------------------------------------------------------------
// Valid Transitions Map
// ---------------------------------------------------------------------------

/**
 * خريطة كاملة لجميع transitions المسموح بها.
 * أي transition غير موجود هنا → مرفوض.
 */
const VALID_TRANSITIONS: Record<ConsultationFlowPhase, ConsultationFlowPhase[]> =
  {
    IDLE: ["INTRO"],
    INTRO: ["BOOKING", "EXITED"],
    BOOKING: ["SUCCESS", "EXITED", "ERROR", "RECOVERY"],
    SUCCESS: ["EXITED"],
    EXITED: ["IDLE", "INTRO"],  // يسمح بإعادة بدء رحلة جديدة
    RECOVERY: ["INTRO", "BOOKING", "EXITED"],
    ERROR: ["RECOVERY", "IDLE"],
  } as Record<ConsultationFlowPhase, ConsultationFlowPhase[]>;

// ---------------------------------------------------------------------------
// canTransition — هل هذا الانتقال مسموح؟
// ---------------------------------------------------------------------------

/**
 * Guard — يتحقق إذا كان الانتقال من حالة إلى أخرى مسموحاً به.
 *
 * @example
 * canTransition("INTRO", "BOOKING") // true
 * canTransition("SUCCESS", "BOOKING") // false
 */
export function canTransition(
  from: ConsultationFlowPhase,
  to: ConsultationFlowPhase
): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

// ---------------------------------------------------------------------------
// transition — تنفيذ الانتقال بأمان
// ---------------------------------------------------------------------------

export type TransitionResult =
  | { success: true; phase: ConsultationFlowPhase }
  | { success: false; reason: string };

/**
 * ينفّذ الانتقال إذا كان مسموحاً، ويرفض مع السبب إذا لم يكن.
 */
export function transition(
  current: ConsultationFlowPhase,
  target: ConsultationFlowPhase
): TransitionResult {
  if (canTransition(current, target)) {
    return { success: true, phase: target };
  }
  return {
    success: false,
    reason: `Transition ${current} → ${target} is not allowed`,
  };
}

// ---------------------------------------------------------------------------
// getPhaseFromPath — استنتاج phase من URL
// ---------------------------------------------------------------------------

/**
 * يستنتج ConsultationFlowPhase الحالية من pathname.
 * يُستخدم عند mount أو hydration لمزامنة الـ state مع الـ URL.
 */
export function getPhaseFromPath(
  pathname: string
): ConsultationFlowPhase | null {
  if (pathname.startsWith("/consultation/start")) return "INTRO";
  if (pathname.startsWith("/consultation/booking")) return "BOOKING";
  if (pathname.startsWith("/consultation/success")) return "SUCCESS";
  return null;
}

// ---------------------------------------------------------------------------
// getRecoveryPhase — phase الصحيحة بعد انقطاع
// ---------------------------------------------------------------------------

/**
 * يحدد phase الصحيحة عند recovery (refresh / back / auth redirect).
 *
 * الأولوية:
 *   1. إذا كان pathname يشير لـ BOOKING وlا intent → INTRO
 *   2. إذا كان pathname يشير لـ phase معروفة → تلك الـ phase
 *   3. إذا كانت hydration state تحتوي phase → تلك الـ phase
 *   4. fallback → IDLE
 */
export function getRecoveryPhase(
  hydration: ConsultationNavigationState | null,
  pathname: string
): ConsultationFlowPhase {
  const pathPhase = getPhaseFromPath(pathname);

  // على صفحة booking بدون intent → أعده للـ intro
  if (pathPhase === "BOOKING" && !hydration?.intentSource) {
    return "INTRO";
  }

  if (pathPhase) return pathPhase;
  if (hydration?.phase) return hydration.phase;

  return "IDLE";
}

// ---------------------------------------------------------------------------
// resolveInitialPhase — الحالة الأولية عند تحميل الصفحة
// ---------------------------------------------------------------------------

/**
 * يحدد الـ phase الأولية عند mount بناءً على:
 *   1. intent (هل هناك intent نشطة؟)
 *   2. hydration (هل تم استعادة state سابق؟)
 *   3. pathname الحالي
 */
export function resolveInitialPhase(
  intent: ConsultationIntent | null,
  hydration: ConsultationNavigationState | null,
  pathname: string
): ConsultationFlowPhase {
  if (!intent) return "IDLE";

  // إذا كان هناك recovery → استعمل getRecoveryPhase
  if (hydration?.wasRecovered) {
    return getRecoveryPhase(hydration, pathname);
  }

  // استنتج من pathname
  const pathPhase = getPhaseFromPath(pathname);
  if (pathPhase) return pathPhase;

  // intent موجودة لكن لا pathname معروف → INTRO
  return "INTRO";
}
