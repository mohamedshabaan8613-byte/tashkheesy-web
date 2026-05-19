/**
 * ConsultationContext.tsx — Consultation Journey Context
 *
 * Sprint 3.0 Stabilization — Architecture Review
 *
 * تغييرات هذا الإصدار:
 *   • إضافة URL-based hydration كطبقة أولى قبل sessionStorage
 *   • إضافة isIntentValid() guard لمنع stale session poisoning
 *   • إضافة intentAgeSeconds لاكتشاف النيات المنتهية الصلاحية
 *   • إضافة intentSource للـ analytics
 *   • الـ context لم يعد يعتمد بالكامل على sessionStorage —
 *     URL params تُفحَص أولاً عند mount للـ recovery
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type {
  ConsultationContextValue,
  ConsultationIntent,
} from "../types/consultationTypes";
import { CONSULTATION_ROUTES } from "../types/consultationTypes";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SESSION_STORAGE_KEY = "tashkheesy__consultation_intent" as const;

/** مدة صلاحية النية — 4 ساعات */
const INTENT_EXPIRY_MS = 4 * 60 * 60 * 1000;

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

export const ConsultationContext =
  createContext<ConsultationContextValue | null>(null);
ConsultationContext.displayName = "ConsultationContext";

// ---------------------------------------------------------------------------
// sessionStorage helpers
// ---------------------------------------------------------------------------

function readIntentFromSession(): ConsultationIntent | null {
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ConsultationIntent;
  } catch {
    return null;
  }
}

function writeIntentToSession(intent: ConsultationIntent): void {
  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(intent));
  } catch {
    // sessionStorage unavailable — silent fail
  }
}

function clearIntentFromSession(): void {
  try {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    // silent fail
  }
}

// ---------------------------------------------------------------------------
// Intent validation guard
// ---------------------------------------------------------------------------

/**
 * يتحقق من صلاحية النية وعدم انتهاء صلاحيتها.
 * يرفض النية إذا كانت تتجاوز INTENT_EXPIRY_MS.
 */
function isIntentValid(intent: ConsultationIntent): boolean {
  try {
    const initiated = new Date(intent.initiatedAt).getTime();
    if (isNaN(initiated)) return false;
    return Date.now() - initiated < INTENT_EXPIRY_MS;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// URL-based hydration helper
// ---------------------------------------------------------------------------

/**
 * يقرأ URL params ويبني intent مستعاداً عند direct access أو refresh.
 * يعمل فقط على مسار /consultation/start.
 *
 * الأولوية: session أولاً → URL ثانياً → fresh أخيراً.
 */
function reconcileIntentWithUrl(
  sessionIntent: ConsultationIntent | null
): { intent: ConsultationIntent | null; source: "session" | "url" | "none" } {
  // 1. استخدم session إذا كانت صالحة
  if (sessionIntent && isIntentValid(sessionIntent)) {
    return { intent: sessionIntent, source: "session" };
  }

  // 2. حاول استعادة من URL إذا كنا على صفحة consultation/start
  if (
    typeof window !== "undefined" &&
    window.location.pathname.startsWith("/consultation")
  ) {
    const params = new URLSearchParams(window.location.search);
    const from = params.get("from");

    if (from === "assessment") {
      const intent: ConsultationIntent = {
        entryPoint: "assessment_result",
        initiatedAt: new Date().toISOString(),
      };
      return { intent, source: "url" };
    }

    if (from === "follow_up") {
      const ref = params.get("ref") ?? undefined;
      const intent: ConsultationIntent = {
        entryPoint: "follow_up",
        previousConsultationId: ref,
        initiatedAt: new Date().toISOString(),
      };
      return { intent, source: "url" };
    }

    // Direct access — no context from URL, create fresh direct_booking intent
    const intent: ConsultationIntent = {
      entryPoint: "direct_booking",
      initiatedAt: new Date().toISOString(),
    };
    return { intent, source: "url" };
  }

  return { intent: null, source: "none" };
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function ConsultationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // ─ استعادة intent بالتتابع: session → URL → null
  const [{ intent: initialIntent, source: initialSource }] = useState(() => {
    const sessionIntent = readIntentFromSession();
    return reconcileIntentWithUrl(sessionIntent);
  });

  const [intent, setIntentState] = useState<ConsultationIntent | null>(
    initialIntent
  );
  const [intentSource, setIntentSource] = useState<
    "session" | "url" | "fresh" | "none"
  >(initialSource);

  // Sync to sessionStorage عند كل تغيير
  useEffect(() => {
    if (intent) {
      writeIntentToSession(intent);
    } else {
      clearIntentFromSession();
    }
  }, [intent]);

  const setIntent = useCallback((newIntent: ConsultationIntent) => {
    setIntentState(newIntent);
    setIntentSource("fresh");
  }, []);

  const clearIntent = useCallback(() => {
    setIntentState(null);
    setIntentSource("none");
  }, []);

  const isFromAssessment = useMemo(
    () =>
      intent?.entryPoint === "assessment_result" &&
      intent.assessmentResult !== undefined,
    [intent]
  );

  const hasActiveIntent = useMemo(
    () => intent !== null && intent.entryPoint !== undefined,
    [intent]
  );

  const intentAgeSeconds = useMemo(() => {
    if (!intent?.initiatedAt) return null;
    try {
      return Math.floor(
        (Date.now() - new Date(intent.initiatedAt).getTime()) / 1000
      );
    } catch {
      return null;
    }
  }, [intent]);

  const value: ConsultationContextValue = {
    intent,
    setIntent,
    clearIntent,
    isFromAssessment,
    hasActiveIntent,
    intentAgeSeconds,
    intentSource,
  };

  return (
    <ConsultationContext.Provider value={value}>
      {children}
    </ConsultationContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Consumer hook
// ---------------------------------------------------------------------------

export function useConsultationContext(): ConsultationContextValue {
  const ctx = useContext(ConsultationContext);
  if (!ctx) {
    throw new Error(
      "[useConsultationContext] يجب أن يكون المكوّن داخل <ConsultationProvider>. " +
        "تأكد من إضافة ConsultationProvider في App.tsx."
    );
  }
  return ctx;
}

export { CONSULTATION_ROUTES };
export default ConsultationContext;
