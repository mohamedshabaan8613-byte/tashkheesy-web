/**
 * recoveryPolicy.ts — Sprint 3.1 Pre-3.2 Hardening (Point 5)
 *
 * ─── RecoveryPolicy Layer ──────────────────────────────────────────────────────
 *
 * الفرق المهم:
 *
 * RecoveryAction  → ماذا يجب فعله؟   ("resume_active_booking")
 * RecoveryPolicy  → كيف يُنفَّذ؟      (AUTO | MANUAL | USER_CONFIRMATION_REQUIRED)
 *                 → ومتى؟            (based on session age + entitlement + interruption)
 *
 * ─── WHY THIS MATTERS ─────────────────────────────────────────────────────────
 * resume_active_booking قد يكون:
 *   AUTO                     — إذا كانت الجلسة حديثة (< 5 دقائق)
 *   USER_CONFIRMATION_REQUIRED — إذا كانت قديمة (5-60 دقيقة)
 *   MANUAL                   — إذا كانت قديمة جدًا (> 60 دقيقة)
 *
 * ─── RULE ─────────────────────────────────────────────────────────────────────
 * UI يقرأ RecoveryPolicy.execution لتحديد UX pattern:
 *   AUTO                     → execute immediately, no dialog
 *   USER_CONFIRMATION_REQUIRED → show confirmation dialog
 *   MANUAL                   → show action button, user navigates
 *
 * لا تُدمج RecoveryPolicy مع RecoveryAction —
 * هما مسؤوليتان منفصلتان.
 */

import type {
  RecoveryAction,
  RecoveryExecution,
  ConsultationBookingSession,
  BookingEntitlementType,
} from "../types/consultationBookingTypes";

// ─── RecoveryPolicy ───────────────────────────────────────────────────────────

export interface RecoveryPolicy {
  /** ماذا يجب فعله */
  action: RecoveryAction;
  /** كيف يُنفَّذ */
  execution: RecoveryExecution;
  /** هل يمكن التنفيذ الآن (entitlement valid, session not terminal) */
  isEligible: boolean;
  /** لماذا هذا القرار — للـ logging / debugging فقط */
  policyReason: string;
}

// ─── Age Thresholds ───────────────────────────────────────────────────────────

/** < 5 دقائق — يمكن resume تلقائيًا */
const RESUME_AUTO_THRESHOLD_MS   = 5  * 60 * 1000;
/** < 60 دقيقة — يحتاج تأكيد */
const RESUME_CONFIRM_THRESHOLD_MS = 60 * 60 * 1000;

function getSessionAgeMs(session: ConsultationBookingSession): number {
  try {
    return Date.now() - new Date(session.lastActivityAt).getTime();
  } catch {
    return Infinity;
  }
}

// ─── Entitlement Helpers ──────────────────────────────────────────────────────

/**
 * هل الاستحقاق يسمح بالـ auto-resume؟
 * free_first_consultation / follow_up → نعم (لا دفع مطلوب)
 * paid_consultation / package_session  → بحذر (قد يكون الدفع pending)
 */
function entitlementAllowsAutoResume(entitlement: BookingEntitlementType): boolean {
  return entitlement === "free_first_consultation" || entitlement === "follow_up";
}

// ─── Core Policy Resolver ─────────────────────────────────────────────────────

/**
 * resolveRecoveryPolicy — يحدد كيف يُنفَّذ RecoveryAction بناءً على السياق.
 *
 * @param action  — RecoveryAction من BookingDenialPresentation
 * @param session — الجلسة الحالية (إن وُجدت)
 *
 * الاستخدام:
 * ```ts
 * const policy = resolveRecoveryPolicy("resume_active_booking", session);
 * if (policy.execution === "AUTO") autoResume();
 * if (policy.execution === "USER_CONFIRMATION_REQUIRED") showConfirmDialog();
 * if (policy.execution === "MANUAL") showActionButton();
 * ```
 *
 * Sprint 3.2+: أضف entitlement state checking من Supabase.
 */
export function resolveRecoveryPolicy(
  action: RecoveryAction,
  session: ConsultationBookingSession | null
): RecoveryPolicy {
  switch (action) {
    case "resume_active_booking": {
      if (!session) {
        return {
          action,
          execution: "MANUAL",
          isEligible: false,
          policyReason: "no_session_to_resume",
        };
      }

      const ageMs = getSessionAgeMs(session);
      const allowsAuto = entitlementAllowsAutoResume(session.entitlementType);

      if (ageMs < RESUME_AUTO_THRESHOLD_MS && allowsAuto) {
        return {
          action,
          execution: "AUTO",
          isEligible: true,
          policyReason: `fresh_session:age=${Math.floor(ageMs / 1000)}s:entitlement=${session.entitlementType}`,
        };
      }

      if (ageMs < RESUME_CONFIRM_THRESHOLD_MS) {
        return {
          action,
          execution: "USER_CONFIRMATION_REQUIRED",
          isEligible: true,
          policyReason: `stale_session:age=${Math.floor(ageMs / 60000)}min`,
        };
      }

      // > 60 دقيقة — يحتاج تدخل يدوي
      return {
        action,
        execution: "MANUAL",
        isEligible: true,
        policyReason: `old_session:age=${Math.floor(ageMs / 60000)}min`,
      };
    }

    case "redirect_to_payment": {
      return {
        action,
        execution: "MANUAL",
        isEligible: true,
        policyReason: "payment_requires_explicit_user_action",
      };
    }

    case "redirect_to_assessment": {
      return {
        action,
        execution: "MANUAL",
        isEligible: true,
        policyReason: "assessment_restart_requires_user_decision",
      };
    }

    case "show_retry_dialog": {
      return {
        action,
        execution: "USER_CONFIRMATION_REQUIRED",
        isEligible: true,
        policyReason: "retry_needs_user_awareness",
      };
    }

    case "contact_support": {
      return {
        action,
        execution: "MANUAL",
        isEligible: true,
        policyReason: "support_contact_is_user_initiated",
      };
    }

    case "none":
    default: {
      return {
        action: "none",
        execution: "MANUAL",
        isEligible: false,
        policyReason: "no_recovery_available",
      };
    }
  }
}

// ─── Convenience: batchResolve ────────────────────────────────────────────────

/**
 * batchResolveRecoveryPolicies — يُنشئ map كامل لكل RecoveryAction.
 * مفيد للـ Sprint 3.2 BookingRecoveryScreen.
 */
export function batchResolveRecoveryPolicies(
  actions: RecoveryAction[],
  session: ConsultationBookingSession | null
): Map<RecoveryAction, RecoveryPolicy> {
  const map = new Map<RecoveryAction, RecoveryPolicy>();
  for (const action of actions) {
    map.set(action, resolveRecoveryPolicy(action, session));
  }
  return map;
}
