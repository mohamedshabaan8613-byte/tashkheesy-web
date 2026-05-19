/**
 * consultationHydration.ts — Consultation Intent Hydration & Recovery Layer
 *
 * Sprint 3.0 Stabilization — Architecture Review
 *
 * هذا الملف هو طبقة الـ recovery الكاملة.
 * يعمل بشكل مستقل عن الـ React tree — يمكن استخدامه قبل mount أو فيه.
 *
 * يحل الحالات التالية:
 *   - Refresh على صفحة consultation
 *   - Auth redirect يعيد المستخدم للصفحة
 *   - Direct URL access (/consultation/start?from=assessment)
 *   - Interrupted flow (mobile browser kill + restore)
 *   - Multi-tab scenarios
 */

import type {
  ConsultationIntent,
  ConsultationEntryPoint,
} from "../types/consultationTypes";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SESSION_STORAGE_KEY = "tashkheesy__consultation_intent" as const;
const INTENT_EXPIRY_MS = 4 * 60 * 60 * 1000; // 4 hours

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type IntentSource = "session" | "url" | "fresh" | "none";

export interface HydrationResult {
  /** النية المستعادة — null إذا لم يمكن الاستعادة */
  intent: ConsultationIntent | null;

  /** مصدر النية */
  source: IntentSource;

  /** هل تم استعادة الحالة بعد انقطاع (refresh/redirect/mobile kill)? */
  wasRecovered: boolean;

  /** هل تحتاج لتدخل يدوي (intent فاسد أو منتهي الصلاحية)? */
  needsRecovery: boolean;

  /**
   * سبب الفشل — null إذا نجحت العملية
   */
  failureReason:
    | "expired"
    | "invalid_session"
    | "no_context"
    | "parse_error"
    | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function readSession(): ConsultationIntent | null {
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ConsultationIntent;
  } catch {
    return null;
  }
}

function isExpired(intent: ConsultationIntent): boolean {
  try {
    const initiated = new Date(intent.initiatedAt).getTime();
    return isNaN(initiated) || Date.now() - initiated >= INTENT_EXPIRY_MS;
  } catch {
    return true;
  }
}

function isValidIntent(intent: unknown): intent is ConsultationIntent {
  if (!intent || typeof intent !== "object") return false;
  const obj = intent as Record<string, unknown>;
  return (
    typeof obj.entryPoint === "string" && typeof obj.initiatedAt === "string"
  );
}

function buildIntentFromUrl(params: URLSearchParams): ConsultationIntent {
  const from = params.get("from");

  let entryPoint: ConsultationEntryPoint = "direct_booking";
  let previousConsultationId: string | undefined;

  if (from === "assessment") entryPoint = "assessment_result";
  else if (from === "follow_up") {
    entryPoint = "follow_up";
    previousConsultationId = params.get("ref") ?? undefined;
  }

  return {
    entryPoint,
    previousConsultationId,
    initiatedAt: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Main hydration function
// ---------------------------------------------------------------------------

/**
 * يحل intent للجلسة الحالية باتباع هذه الأولويات:
 *   1. sessionStorage — إذا صالحة ولم تنتهِ صلاحيتها → تستخدم مباشرة
 *   2. URL params — إذا كنا على /consultation → يبني نية من الـ URL (wasRecovered=true)
 *   3. فشل — needsRecovery=true ونية null
 *
 * @param pathname - window.location.pathname أو custom path
 * @param search - window.location.search
 */
export function hydrateConsultationIntent(
  pathname: string,
  search: string
): HydrationResult {
  // ─ خطوة 1: sessionStorage
  const sessionRaw = readSession();

  if (sessionRaw) {
    if (!isValidIntent(sessionRaw)) {
      return {
        intent: null,
        source: "session",
        wasRecovered: false,
        needsRecovery: true,
        failureReason: "invalid_session",
      };
    }

    if (isExpired(sessionRaw)) {
      return {
        intent: null,
        source: "session",
        wasRecovered: false,
        needsRecovery: true,
        failureReason: "expired",
      };
    }

    return {
      intent: sessionRaw,
      source: "session",
      wasRecovered: false,
      needsRecovery: false,
      failureReason: null,
    };
  }

  // ─ خطوة 2: URL params (refresh أو direct link)
  if (pathname.startsWith("/consultation")) {
    const params = new URLSearchParams(search);
    const intent = buildIntentFromUrl(params);

    return {
      intent,
      source: "url",
      wasRecovered: true,
      needsRecovery: false,
      failureReason: null,
    };
  }

  // ─ خطوة 3: لا يوجد سياق — IDLE
  return {
    intent: null,
    source: "none",
    wasRecovered: false,
    needsRecovery: false,
    failureReason: null,
  };
}

/**
 * مساعد: احسب عمر النية بالثواني
 */
export function getIntentAgeSeconds(
  intent: ConsultationIntent | null
): number | null {
  if (!intent?.initiatedAt) return null;
  try {
    return Math.floor(
      (Date.now() - new Date(intent.initiatedAt).getTime()) / 1000
    );
  } catch {
    return null;
  }
}

/**
 * مساعد: تحقق من صلاحية النية
 */
export function isIntentStillValid(
  intent: ConsultationIntent | null
): boolean {
  if (!intent) return false;
  return !isExpired(intent) && isValidIntent(intent);
}
