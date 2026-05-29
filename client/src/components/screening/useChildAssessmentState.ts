/**
 * useChildAssessmentState.ts
 * Sprint 2.2 — Step 7b: Child Funnel Instrumentation
 *
 * AUDIT FIXES (2026-05-18):
 *   #4 — session_id alignment:
 *         attachRealSessionId يستخدم buildChildFunnelSessionId(childId)
 *         ليتطابق مع session_id الذي تكتبه ChooseChildPath
 *         و ScreeningPage (upsertScreeningResultAnalytics).
 */

import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useSupabaseAuth } from "@/context/AuthContext";
import type { PathType, AssessmentMode } from "./assessmentTypes";
import {
  buildIntroUrl,
  buildResultUrl,
  buildSafeRedirect,
  saveChildProfile,
} from "./assessmentLogic";
import {
  FunnelSession,
  buildChildFunnelSessionId,
  trackFunnelSubmit,
  trackFunnelAbandonment,
} from "@/lib/screeningAnalytics";

export interface ChildAssessmentParams {
  childId: string;
}

export function useChildAssessmentState({ childId }: ChildAssessmentParams) {
  const [, navigate] = useLocation();
  const { user, loading: authLoading } = useSupabaseAuth();

  // ─── URL params ─────────────────────────────────────────────────────────────
  const searchParams = new URLSearchParams(window.location.search);
  const pathType  = (searchParams.get("pathType")  ?? "learning") as PathType;
  const mode      = (searchParams.get("mode")      ?? "child")    as AssessmentMode;
  const childName =  searchParams.get("name")      ?? "طفلك";
  const childAge  =  searchParams.get("age")       ?? "";
  const ageGroup  =  searchParams.get("ageGroup")  ?? "school";

  // ─── UI state ────────────────────────────────────────────────────────────────
  const [visible, setVisible] = useState(false);

  // ─── FunnelSession ──────────────────────────────────────────────────────────
  // FIX #4: نستخدم buildChildFunnelSessionId مباشرة كـ session_id الأولي
  // (لا نحتاج pending- لأن childId معروف من mount)
  const funnelSessionRef = useRef<FunnelSession | null>(null);
  if (!funnelSessionRef.current) {
    // نبدأ بالـ unified ID مباشرة — نفس ما كتبه trackFunnelPathSelected
    funnelSessionRef.current = new FunnelSession(
      buildChildFunnelSessionId(childId),
      pathType
    );
    // نضع attachRealSessionId بنفس القيمة لتأمين _realIdAttached = true
    // حتى لا يُرسَل abandonment قبل أن يُكتب الـ row
    funnelSessionRef.current.attachRealSessionId(buildChildFunnelSessionId(childId));
  }
  const funnelSession = funnelSessionRef.current;

  // ─── Mount ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    document.title = `فحص ${childName} — تشخيصي`;
    setTimeout(() => setVisible(true), 80);
  }, [childName]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── FIX 2: beforeunload + visibilitychange dual fallback ────────────────────
  useEffect(() => {
    const abandonedRef = { sent: false };

    async function fireAbandonment() {
      if (abandonedRef.sent) return;
      if (funnelSession.submittedAt !== null) return;
      abandonedRef.sent = true;
      void trackFunnelAbandonment(funnelSession, "child_assessment_form");
    }

    function onBeforeUnload() { void fireAbandonment(); }
    function onVisibilityChange() { if (document.hidden) void fireAbandonment(); }

    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [funnelSession]);

  // ─── handleStartAssessment ───────────────────────────────────────────────────
  function handleStartAssessment() {
    const ageNum = parseInt(childAge, 10) || 0;

    saveChildProfile(childId, childName, ageNum, pathType, ageGroup);

    // FIX #4: session_id = buildChildFunnelSessionId(childId) بالفعل — upsert
    void trackFunnelSubmit(funnelSession);

    navigate(
      buildIntroUrl(childId, childName, ageNum, mode, pathType, ageGroup)
    );
  }

  // ─── navigateToResult ────────────────────────────────────────────────────────
  function navigateToResult(
    sessionId: string,
    name: string,
    itemPathType: PathType
  ) {
    navigate(buildResultUrl(sessionId, name, itemPathType));
  }

  // ─── Derived ──────────────────────────────────────────────────────────────────
  const safeRedirect = buildSafeRedirect(
    window.location.pathname,
    window.location.search
  );
  const loginUrl = `/login?redirect=${encodeURIComponent(safeRedirect)}`;

  return {
    user,
    authLoading,
    childId,
    childName,
    childAge,
    ageGroup,
    pathType,
    mode,
    visible,
    funnelSession,
    handleStartAssessment,
    navigateToResult,
    loginUrl,
  };
}
