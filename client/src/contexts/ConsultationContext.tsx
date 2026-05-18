/**
 * ConsultationContext.tsx — Consultation Journey Context
 *
 * Sprint 3.0a | Issue #55 — ConsultationContext type definition
 *
 * يوفّر هذا الـ context:
 *   1. حفظ ConsultationIntent عبر navigation (sessionStorage)
 *   2. Helpers جاهزة: isFromAssessment, hasActiveIntent
 *   3. setIntent / clearIntent بواجهة واحدة واضحة
 *
 * القاعدة: لا localStorage (sandbox-safe + يتوافق مع قاعدة المشروع)
 *
 * الاستخدام:
 *   // في App.tsx
 *   <ConsultationProvider>
 *     <RouterProvider router={router} />
 *   </ConsultationProvider>
 *
 *   // في أي component
 *   const { intent, setIntent, isFromAssessment } = useConsultationContext();
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type {
  ConsultationContextValue,
  ConsultationIntent,
} from "../types/consultationTypes";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SESSION_STORAGE_KEY = "tashkheesy__consultation_intent" as const;

// ---------------------------------------------------------------------------
// Context creation
// ---------------------------------------------------------------------------

const ConsultationContext = createContext<ConsultationContextValue | null>(null);
ConsultationContext.displayName = "ConsultationContext";

// ---------------------------------------------------------------------------
// sessionStorage helpers (isolated to avoid duplication)
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
    // sessionStorage unavailable (e.g. private browsing) — silent fail
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
// Provider
// ---------------------------------------------------------------------------

export function ConsultationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Restore intent from sessionStorage on mount (page refresh / back navigation)
  const [intent, setIntentState] = useState<ConsultationIntent | null>(() =>
    readIntentFromSession()
  );

  // Sync to sessionStorage whenever intent changes
  useEffect(() => {
    if (intent) {
      writeIntentToSession(intent);
    } else {
      clearIntentFromSession();
    }
  }, [intent]);

  const setIntent = useCallback((newIntent: ConsultationIntent) => {
    setIntentState(newIntent);
  }, []);

  const clearIntent = useCallback(() => {
    setIntentState(null);
  }, []);

  const isFromAssessment =
    intent?.entryPoint === "assessment_result" &&
    intent.assessmentResult !== undefined;

  const hasActiveIntent = intent !== null && !intent.confirmed;

  const value: ConsultationContextValue = {
    intent,
    setIntent,
    clearIntent,
    isFromAssessment,
    hasActiveIntent,
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

/**
 * يجب استخدام هذا الـ hook داخل <ConsultationProvider> فقط.
 * يرمي error واضح إذا استُخدم خارجه.
 */
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

export default ConsultationContext;
