/**
 * consultationStateMachine.ts — Consultation Flow State Machine
 *
 * Sprint 3.0c | Phase 1 — Runtime Completion
 *
 * State Machine حتمية (deterministic) لرحلة الاستشارة.
 *
 * States:
 *   IDLE     → لا توجد نية نشطة
 *   INTRO    → المستخدم في شاشة intro
 *   BOOKING  → المستخدم في شاشة الحجز
 *   SUCCESS  → تم تأكيد الحجز
 *   EXITED   → غادر الرحلة
 *   RECOVERY → تمت استعادة الحالة بعد انقطاع
 *   ERROR    → حدث خطأ في إحدى الخطوات
 *
 * Transition Matrix:
 *   IDLE      → INTRO
 *   INTRO     → BOOKING, EXITED
 *   BOOKING   → SUCCESS, EXITED, ERROR, RECOVERY
 *   RECOVERY  → INTRO, BOOKING, EXITED
 *   SUCCESS   → IDLE (reset)
 *   EXITED    → IDLE (reset)
 *   ERROR     → RECOVERY, IDLE
 */

import type {
  ConsultationFlowPhase,
  ConsultationIntent,
} from "../types/consultationTypes";
import { CONSULTATION_ROUTES } from "../types/consultationTypes";
import type { HydrationResult } from "./consultationHydration";

// ---------------------------------------------------------------------------
// Extended Phase Type (adds RECOVERY not in the base type)
// ---------------------------------------------------------------------------

export type ExtendedFlowPhase = ConsultationFlowPhase | "RECOVERY";

// ---------------------------------------------------------------------------
// Transition Matrix
// ---------------------------------------------------------------------------

const TRANSITION_MATRIX: Record<ExtendedFlowPhase, ExtendedFlowPhase[]> = {
  IDLE:     ["INTRO"],
  INTRO:    ["BOOKING", "EXITED"],
  BOOKING:  ["SUCCESS", "EXITED", "ERROR", "RECOVERY"],
  RECOVERY: ["INTRO", "BOOKING", "EXITED"],
  SUCCESS:  ["IDLE"],
  EXITED:   ["IDLE"],
  ERROR:    ["RECOVERY", "IDLE"],
};

// ---------------------------------------------------------------------------
// canTransition
// ---------------------------------------------------------------------------

/**
 * يتحقق إذا كانت الانتقالة من `from` إلى `to` صالحة.
 */
export function canTransition(
  from: ExtendedFlowPhase,
  to: ExtendedFlowPhase
): boolean {
  return TRANSITION_MATRIX[from]?.includes(to) ?? false;
}

// ---------------------------------------------------------------------------
// transition
// ---------------------------------------------------------------------------

export type TransitionResult =
  | { success: true; phase: ExtendedFlowPhase }
  | { success: false; reason: string; current: ExtendedFlowPhase };

/**
 * ينفّذ انتقالة آمنة من الحالة الحالية إلى الحالة الهدف.
 * يرفض الانتقالة إذا لم تكن موجودة في الـ matrix.
 */
export function transition(
  current: ExtendedFlowPhase,
  target: ExtendedFlowPhase
): TransitionResult {
  if (!canTransition(current, target)) {
    return {
      success: false,
      reason: `Illegal transition: ${current} → ${target}`,
      current,
    };
  }
  return { success: true, phase: target };
}

// ---------------------------------------------------------------------------
// getPhaseFromPath
// ---------------------------------------------------------------------------

/**
 * يستنتج الـ phase من الـ URL الحالي.
 * يُستخدم عند hydration لتحديد موقع المستخدم في الرحلة.
 */
export function getPhaseFromPath(pathname: string): ExtendedFlowPhase {
  if (pathname.startsWith(CONSULTATION_ROUTES.BOOKING)) return "BOOKING";
  if (pathname === CONSULTATION_ROUTES.SUCCESS) return "SUCCESS";
  if (pathname.startsWith("/consultation")) return "INTRO";
  return "IDLE";
}

// ---------------------------------------------------------------------------
// getRecoveryPhase
// ---------------------------------------------------------------------------

/**
 * يُحدد الـ phase الصحيحة عند recovery من HydrationResult.
 *
 * الأولوية:
 *   1. إذا كان الـ path يدل على BOOKING → RECOVERY (احتياطي)
 *   2. إذا كان wasRecovered → RECOVERY
 *   3. إذا كان session valid → INTRO
 *   4. غير ذلك → IDLE
 */
export function getRecoveryPhase(
  hydration: HydrationResult,
  pathname: string
): ExtendedFlowPhase {
  const pathPhase = getPhaseFromPath(pathname);

  if (pathPhase === "BOOKING" && hydration.wasRecovered) {
    return "RECOVERY";
  }

  if (hydration.wasRecovered) {
    return "RECOVERY";
  }

  if (hydration.intent && !hydration.needsRecovery) {
    return pathPhase === "IDLE" ? "INTRO" : pathPhase;
  }

  return "IDLE";
}

// ---------------------------------------------------------------------------
// resolveInitialPhase
// ---------------------------------------------------------------------------

/**
 * يُحدد الـ phase الأولية عند تحميل الصفحة لأول مرة.
 * يجمع بين: intent + path + hydration result.
 */
export function resolveInitialPhase(
  intent: ConsultationIntent | null,
  hydration: HydrationResult,
  pathname: string
): ExtendedFlowPhase {
  if (!intent) return "IDLE";
  return getRecoveryPhase(hydration, pathname);
}
