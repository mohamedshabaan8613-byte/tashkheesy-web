/**
 * consultationBookingOrchestrator.ts — Booking Orchestration Layer
 *
 * Sprint 3.0c | Phase 1 — Runtime Completion
 *
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * ARCHITECTURE BOUNDARY — هذا الملف هو Orchestration Layer فقط
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * ✅ مسموح داخل هذا الملف:
 *   - routing decisions (أي route يُفتح؟)
 *   - booking context building
 *   - intent validation (هل النية صالحة؟)
 *   - entry point resolution
 *
 * ❌ ممنوع داخل هذا الملف:
 *   - copy / labels / text (→ consultationCopy.ts)
 *   - UI rendering decisions
 *   - entitlements / payments / credits (→ Business Layer Sprint 3.3+)
 *   - state machine transitions (→ consultationStateMachine.ts)
 *   - analytics events
 *
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import type {
  ConsultationIntent,
  ConsultationEntryPoint,
} from "../types/consultationTypes";
import { CONSULTATION_ROUTES } from "../types/consultationTypes";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type BookingRouteResolution =
  | { type: "contextual"; route: string }
  | { type: "generic"; route: string }
  | { type: "blocked"; reason: BookingBlockReason };

export type BookingBlockReason =
  | "no_intent"
  | "intent_expired"
  | "missing_entry_point";

export interface BookingContext {
  /** هل الحجز سياقي (بعد تقييم)؟ */
  isContextual: boolean;
  /** اسم الشخص الذي يُحجز له (الطفل أو المستخدم نفسه) */
  subjectName?: string;
  /** مفتاح النتيجة من التقييم */
  resultKey?: string;
  /** نوع الدخول */
  entryPoint: ConsultationEntryPoint;
  /** معرّف الجلسة للاستخدام في الـ booking page */
  sessionId?: string;
}

// ---------------------------------------------------------------------------
// resolveBookingRoute — أي صفحة حجز نفتح?
// ---------------------------------------------------------------------------

/**
 * يقرر أي route يجب أن يُفتح بناءً على intent.
 *
 * الترتيب:
 *   1. لا intent → blocked
 *   2. intent منتهية الصلاحية (> 4 ساعات) → blocked
 *   3. assessment_result → /consultation/booking (contextual)
 *   4. follow_up → /consultation/booking (contextual)
 *   5. غير ذلك → /booking (generic)
 */
export function resolveBookingRoute(
  intent: ConsultationIntent | null
): BookingRouteResolution {
  if (!intent) {
    return { type: "blocked", reason: "no_intent" };
  }

  if (isIntentExpired(intent)) {
    return { type: "blocked", reason: "intent_expired" };
  }

  if (!intent.entryPoint) {
    return { type: "blocked", reason: "missing_entry_point" };
  }

  if (
    intent.entryPoint === "assessment_result" ||
    intent.entryPoint === "follow_up"
  ) {
    return { type: "contextual", route: CONSULTATION_ROUTES.BOOKING };
  }

  return { type: "generic", route: CONSULTATION_ROUTES.BOOKING };
}

// ---------------------------------------------------------------------------
// buildBookingContext — بناء سياق الحجز
// ---------------------------------------------------------------------------

/**
 * يبني BookingContext من intent.
 * يُمرَّر إلى صفحة الحجز عبر URL params أو state.
 */
export function buildBookingContext(
  intent: ConsultationIntent
): BookingContext {
  const isContextual =
    intent.entryPoint === "assessment_result" ||
    intent.entryPoint === "follow_up";

  return {
    isContextual,
    entryPoint: intent.entryPoint,
    subjectName: intent.assessmentResult?.subjectName,
    resultKey: intent.assessmentResult?.resultKey,
    sessionId: intent.assessmentResult?.sessionId,
  };
}

// ---------------------------------------------------------------------------
// validateBookingEntry — هل يمكن الدخول لصفحة الحجز?
// ---------------------------------------------------------------------------

/**
 * يتحقق من صحة intent قبل السماح بالدخول لصفحة الحجز.
 * يُستخدم كـ guard في ConsultationBookingPage.
 */
export function validateBookingEntry(intent: ConsultationIntent | null): {
  isValid: boolean;
  reason?: BookingBlockReason;
} {
  if (!intent) return { isValid: false, reason: "no_intent" };
  if (isIntentExpired(intent)) return { isValid: false, reason: "intent_expired" };
  if (!intent.entryPoint) return { isValid: false, reason: "missing_entry_point" };
  return { isValid: true };
}

// ---------------------------------------------------------------------------
// isIntentExpired — هل انتهت صلاحية النية?
// ---------------------------------------------------------------------------

/** النية تنتهي بعد 4 ساعات من بدئها */
const INTENT_EXPIRY_MS = 4 * 60 * 60 * 1000;

function isIntentExpired(intent: ConsultationIntent): boolean {
  if (!intent.initiatedAt) return false;
  const initiatedAt = new Date(intent.initiatedAt).getTime();
  return Date.now() - initiatedAt > INTENT_EXPIRY_MS;
}

// ---------------------------------------------------------------------------
// isIntentStillValid — exported alias for page-level guards
// ---------------------------------------------------------------------------

/**
 * Exported alias — يُستخدم في ConsultationBookingPage كـ mount guard.
 * يجمع validateBookingEntry في دالة boolean بسيطة.
 */
export function isIntentStillValid(
  intent: ConsultationIntent | null
): boolean {
  return validateBookingEntry(intent).isValid;
}
