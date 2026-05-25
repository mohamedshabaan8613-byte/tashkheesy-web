/**
 * useNavigationRecovery.ts — Navigation Recovery Policy Hook
 *
 * Sprint 3.0c | Phase 1 — Runtime Completion
 *
 * يعالج:
 *   - Back button (PopStateEvent)
 *   - Refresh على صفحة consultation
 *   - Auth redirect يعيد للصفحة
 *   - Mobile tab restore
 *   - Interrupted flow recovery
 *
 * الاستخدام:
 *   const { wasRecovered, handleBookingBack } = useNavigationRecovery();
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { useConsultationContext } from "../contexts/ConsultationContext";
import { CONSULTATION_ROUTES } from "../types/consultationTypes";
import {
  hydrateConsultationIntent,
  isIntentStillValid,
} from "../lib/consultationHydration";
import {
  getPhaseFromPath,
  getRecoveryPhase,
  transition,
} from "../lib/consultationStateMachine";
import type { ConsultationFlowPhase } from "../types/consultationTypes";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface NavigationRecoveryState {
  wasRecovered: boolean;
  recoverySource: "back_button" | "refresh" | "auth_redirect" | "none";
  currentPhase: ConsultationFlowPhase;
}

export interface UseNavigationRecoveryReturn {
  recoveryState: NavigationRecoveryState;
  wasRecovered: boolean;
  /**
   * يستدعى من زر Back داخل /consultation/booking.
   * يعود للـ intro بدل الـ browser history إذا كان intent صالحًا.
   */
  handleBookingBack: () => void;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useNavigationRecovery(): UseNavigationRecoveryReturn {
  const [location, setLocation] = useLocation();
  const { intent, clearIntent } = useConsultationContext();
  const didMountRef = useRef(false);

  const [recoveryState, setRecoveryState] = useState<NavigationRecoveryState>(
    () => ({
      wasRecovered: false,
      recoverySource: "none",
      currentPhase: getPhaseFromPath(
        typeof window !== "undefined" ? window.location.pathname : "/"
      ),
    })
  );

  // ── Mount: تحقق من hydration على refresh أو direct URL
  useEffect(() => {
    if (didMountRef.current) return;
    didMountRef.current = true;

    if (typeof window === "undefined") return;

    const hydration = hydrateConsultationIntent(
      window.location.pathname,
      window.location.search
    );

    const phase = getRecoveryPhase(hydration, window.location.pathname);

    if (hydration.wasRecovered || hydration.source === "url") {
      setRecoveryState({
        wasRecovered: true,
        recoverySource: "refresh",
        currentPhase: phase,
      });
    }
  }, []);

  // ── PopState: back/forward button
  useEffect(() => {
    function handlePopState() {
      if (typeof window === "undefined") return;

      const nextPath = window.location.pathname;
      const nextPhase = getPhaseFromPath(nextPath);
      const currentPhase = getPhaseFromPath(location);

      // Guard: منع back إلى booking بدون intent صالح
      if (
        nextPhase === "BOOKING" &&
        !isIntentStillValid(intent)
      ) {
        // ابق في المكان الحالي
        window.history.pushState(null, "", location);
        return;
      }

      // Guard: إذا رجع من consultation إلى صفحة عادية → امسح intent
      if (nextPhase === "IDLE" && currentPhase !== "IDLE") {
        const result = transition(currentPhase, "EXITED");
        if (result.success) {
          clearIntent();
        }
      }

      setRecoveryState((prev) => ({
        ...prev,
        wasRecovered: prev.wasRecovered || nextPhase !== "IDLE",
        recoverySource: "back_button",
        currentPhase: nextPhase,
      }));
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [location, intent, clearIntent]);

  // ── handleBookingBack: زر Back داخل /consultation/booking
  const handleBookingBack = useCallback(() => {
    if (isIntentStillValid(intent)) {
      // عد للـ intro مع الحفاظ على intent
      setLocation(CONSULTATION_ROUTES.START);
    } else {
      // لا intent → عد للرئيسية
      clearIntent();
      setLocation("/");
    }
  }, [intent, clearIntent, setLocation]);

  return {
    recoveryState,
    wasRecovered: recoveryState.wasRecovered,
    handleBookingBack,
  };
}
