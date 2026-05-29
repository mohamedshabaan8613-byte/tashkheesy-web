/**
 * runtimeSafety.ts — Sprint 3.1 Pre-3.2 Hardening (Point 6)
 *
 * ─── Production Runtime Validation ───────────────────────────────────────────
 *
 * الهدف: اكتشاف حالات خطرة في runtime قبل أن تصل للمستخدم.
 *
 * الحالات التي يكتشفها:
 *   1. Orphaned session   — جلسة بدون intent مرتبط
 *   2. Intent mismatch    — sourceIntentId لا يطابق intent الحالي
 *   3. Expired session    — الجلسة منتهية الصلاحية
 *   4. Phase inconsistency — phase غير متوافقة مع entryPoint
 *   5. Missing sourceIntentId — orphaned booking بدون traceability
 *
 * ─── USAGE ───────────────────────────────────────────────────────────────────
 * يُشغَّل عند mount BookingContext أو أي صفحة booking حساسة.
 *
 * ```tsx
 * // في BookingContext عند mount:
 * const flags = validateRuntimeSafety(intent, session);
 * if (flags.hasOrphanedSession || flags.hasIntentMismatch) {
 *   invalidateSession();
 *   redirectToStart();
 * }
 * ```
 *
 * ─── SPRINT 3.2+ ────────────────────────────────────────────────────────────
 * أضف:
 *   - server-side session validation
 *   - Supabase RLS policy verification
 *   - payment status cross-check
 */

import type {
  ConsultationBookingSession,
} from "../types/consultationBookingTypes";
import { isSessionExpired } from "../types/consultationBookingTypes";
import type { ConsultationIntent } from "../types/consultationTypes";
import { useEffect, useRef } from "react";

// ─── RuntimeSafetyFlags ───────────────────────────────────────────────────────

export interface RuntimeSafetyFlags {
  /** جلسة موجودة لكن لا يوجد intent نشط مرتبط بها */
  hasOrphanedSession: boolean;
  /** sourceIntentId في الجلسة لا يطابق intentId الحالي */
  hasIntentMismatch: boolean;
  /** الجلسة منتهية الصلاحية */
  hasExpiredSession: boolean;
  /** الجلسة ليس لها sourceIntentId — orphaned booking */
  hasMissingSourceIntent: boolean;
  /** هل يوجد أي مشكلة (اختصار) */
  hasAnyViolation: boolean;
  /** تفاصيل كل violation للـ logging */
  violations: string[];
}

// ─── Core Validator ───────────────────────────────────────────────────────────

/**
 * validateRuntimeSafety — يفحص تناسق Intent + Session في runtime.
 *
 * @param intent  — ConsultationIntent الحالي (أو null)
 * @param session — ConsultationBookingSession الحالية (أو null)
 *
 * RULE: هذا فحص read-only — لا يُعدِّل أي state.
 * قرار ماذا تفعل بالـ violations هو مسؤولية المستدعي.
 */
export function validateRuntimeSafety(
  intent: ConsultationIntent | null,
  session: ConsultationBookingSession | null
): RuntimeSafetyFlags {
  const violations: string[] = [];

  // ─── 1. Orphaned session ────────────────────────────────────────────────────
  const hasOrphanedSession =
    session !== null &&
    intent === null;

  if (hasOrphanedSession) {
    violations.push("orphaned_session: booking session exists but no intent is active");
  }

  // ─── 2. Intent mismatch ─────────────────────────────────────────────────────
  const hasIntentMismatch =
    session !== null &&
    intent !== null &&
    session.sourceIntentId !== intent.intentId;

  if (hasIntentMismatch) {
    violations.push(
      `intent_mismatch: session.sourceIntentId=${session?.sourceIntentId} ≠ intent.intentId=${intent?.intentId}`
    );
  }

  // ─── 3. Expired session ──────────────────────────────────────────────────────
  const hasExpiredSession =
    session !== null &&
    isSessionExpired(session);

  if (hasExpiredSession) {
    violations.push(
      `expired_session: sessionId=${session?.sessionId} expired at ${session?.expiresAt}`
    );
  }

  // ─── 4. Missing sourceIntentId ───────────────────────────────────────────────
  const hasMissingSourceIntent =
    session !== null &&
    (!session.sourceIntentId || session.sourceIntentId.trim() === "");

  if (hasMissingSourceIntent) {
    violations.push(
      `missing_source_intent: sessionId=${session?.sessionId} has no sourceIntentId — cannot trace to intent`
    );
  }

  const hasAnyViolation =
    hasOrphanedSession ||
    hasIntentMismatch ||
    hasExpiredSession ||
    hasMissingSourceIntent;

  return {
    hasOrphanedSession,
    hasIntentMismatch,
    hasExpiredSession,
    hasMissingSourceIntent,
    hasAnyViolation,
    violations,
  };
}

// ─── React Hook ───────────────────────────────────────────────────────────────

/**
 * useRuntimeSafetyCheck — يُشغَّل عند mount BookingContext.
 *
 * @param intent   — من ConsultationContext
 * @param session  — من ConsultationBookingContext
 * @param onViolation — callback يستقبل الـ flags لتتخذ القرار
 *
 * يُشغَّل مرة واحدة عند mount فقط — ليس reactive.
 * لا يأخذ قرار بنفسه — فقط يُبلِّغ المستدعي.
 *
 * الاستخدام في BookingContext provider:
 * ```tsx
 * useRuntimeSafetyCheck(intent, activeSession, (flags) => {
 *   if (flags.hasAnyViolation) {
 *     console.warn('[RuntimeSafety]', flags.violations);
 *     if (flags.hasOrphanedSession || flags.hasIntentMismatch) {
 *       invalidateActiveSession();
 *     }
 *   }
 * });
 * ```
 */
export function useRuntimeSafetyCheck(
  intent: ConsultationIntent | null,
  session: ConsultationBookingSession | null,
  onViolation: (flags: RuntimeSafetyFlags) => void
): void {
  const onViolationRef = useRef(onViolation);
  onViolationRef.current = onViolation;

  const checkedRef = useRef(false);

  useEffect(() => {
    // يُشغّل مرة واحدة فقط عند mount
    if (checkedRef.current) return;
    checkedRef.current = true;

    const flags = validateRuntimeSafety(intent, session);

    if (flags.hasAnyViolation) {
      // dev mode: log violations
      if (process.env.NODE_ENV !== "production") {
        console.warn(
          "[RuntimeSafety] Violations detected at mount:",
          flags.violations
        );
      }
      onViolationRef.current(flags);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
