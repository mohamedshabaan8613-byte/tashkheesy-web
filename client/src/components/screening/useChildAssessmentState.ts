/**
 * useChildAssessmentState.ts
 * Sprint 2.2 — Step 7b: Child Funnel Instrumentation
 *
 * Mirror of useSelfAssessmentState.ts adapted for child assessment path.
 *
 * الفروق الجوهرية عن self:
 *   1. childId يأتي من URL param (/:childId) — ليس مُولَّداً هنا
 *   2. لا يوجد form validation — المعلومات تأتي مكتملة من ChooseChildPath
 *   3. pathType محدد مسبقاً من ChooseChildPath — ليس اختيار المستخدم هنا
 *   4. ageGroup متاح كـ extra signal للـ analytics
 *
 * FIX 1 (sessionId mismatch):
 *   attachRealSessionId(childId) قبل trackFunnelSubmit()
 *   ضمان: session_id في Supabase = childId دائماً
 *
 * FIX 2 (beforeunload reliability):
 *   visibilitychange fallback بجانب beforeunload
 *
 * FIX 3 (trackFunnelSubmit → upsert):
 *   موجود في screeningAnalytics.ts — لا تغيير هنا.
 *
 * FIX #4 (session_id unification):
 *   يُمرَّر funnelSession.sessionId (= childId بعد attach) عبر buildIntroUrl
 *   كـ &fid=... → يقرأه ScreeningPage ويستخدمه كـ sessionId الوحيد.
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

  // ─── FunnelSession (created once per mount) ──────────────────────────────────
  // sessionId = pending-{ts} حتى نستدعي attachRealSessionId(childId)
  const funnelSessionRef = useRef<FunnelSession | null>(null);
  if (!funnelSessionRef.current) {
    funnelSessionRef.current = new FunnelSession(`pending-${Date.now()}`, pathType);
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
  //
  // FIX 1: attachRealSessionId(childId) قبل trackFunnelSubmit
  // FIX #4: تمرير funnelSession.sessionId (= childId) كـ fid في URL
  function handleStartAssessment() {
    const ageNum = parseInt(childAge, 10) || 0;

    // حفظ profile الطفل (idempotent)
    saveChildProfile(childId, childName, ageNum, pathType, ageGroup);

    // FIX 1: ربط session بـ childId الحقيقي قبل أي Supabase write
    funnelSession.attachRealSessionId(childId);

    // upsert إلى screening_analytics
    void trackFunnelSubmit(funnelSession);

    // FIX #4: مرّر sessionId الموحَّد (= childId) عبر URL param &fid
    navigate(
      buildIntroUrl(childId, childName, ageNum, mode, pathType, ageGroup, funnelSession.sessionId)
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

  // ─── Derived ─────────────────────────────────────────────────────────────────
  const safeRedirect = buildSafeRedirect(
    window.location.pathname,
    window.location.search
  );
  const loginUrl = `/login?redirect=${encodeURIComponent(safeRedirect)}`;

  return {
    // auth
    user,
    authLoading,
    // child identity
    childId,
    childName,
    childAge,
    ageGroup,
    // url
    pathType,
    mode,
    // ui
    visible,
    // funnel (Step 7b)
    funnelSession,
    // actions
    handleStartAssessment,
    navigateToResult,
    // navigation helpers
    loginUrl,
  };
}
