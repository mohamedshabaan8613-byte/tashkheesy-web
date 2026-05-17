/**
 * useSelfAssessmentState.ts
 * Sprint 2.2 — Step 4: Centralized state hook
 * Sprint 2.2 — Step 7a: Funnel Instrumentation Wiring
 *
 * FIX 1 (sessionId mismatch):
 *   attachRealSessionId(selfId) قبل trackFunnelSubmit()
 *   ضمان: session_id في Supabase = selfId دائماً
 *
 * FIX 2 (beforeunload reliability):
 *   visibilitychange fallback بجانب beforeunload
 *
 * FIX 3 (trackFunnelSubmit → upsert):
 *   موجود في screeningAnalytics.ts — لا تغيير هنا.
 */

import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useSupabaseAuth } from "@/context/AuthContext";
import { fetchRemoteSelfAssessmentResults } from "@/lib/screeningResults";
import type { SelfAssessmentSummary, PathType, AssessmentMode } from "./assessmentTypes";
import {
  loadSelfHistory,
  sortByDate,
  mergeRemoteResults,
  filterByPath,
  validateForm,
  generateSelfId,
  saveSelfProfile,
  buildIntroUrl,
  buildResultUrl,
  buildSafeRedirect,
} from "./assessmentLogic";
import { COPY } from "./assessmentCopy";
import {
  FunnelSession,
  trackFunnelSubmit,
  trackFunnelAbandonment,
  trackHistoryView,
} from "@/lib/screeningAnalytics";

export function useSelfAssessmentState() {
  const [, navigate] = useLocation();
  const { user, loading: authLoading } = useSupabaseAuth();

  // ─── URL params ────────────────────────────────────────────────────────────────────
  const searchParams = new URLSearchParams(window.location.search);
  const pathType = (searchParams.get("pathType") ?? "learning") as PathType;
  const mode     = (searchParams.get("mode")     ?? "self")     as AssessmentMode;

  // ─── UI state ────────────────────────────────────────────────────────────────────────
  const [visible,        setVisible]        = useState(false);
  const [showAllHistory, setShowAllHistory] = useState(false);

  // ─── Form state ─────────────────────────────────────────────────────────────────────
  const [name,      setName]      = useState("");
  const [age,       setAge]       = useState("");
  const [ageError,  setAgeError]  = useState("");
  const [nameError, setNameError] = useState("");

  // ─── History state ────────────────────────────────────────────────────────────────
  const [history, setHistory] = useState<SelfAssessmentSummary[]>([]);
  const remoteFetchedRef = useRef(false);

  // ─── FunnelSession (created once per mount) ────────────────────────────────────
  const funnelSessionRef = useRef<FunnelSession | null>(null);
  if (!funnelSessionRef.current) {
    funnelSessionRef.current = new FunnelSession(`pending-${Date.now()}`, pathType);
  }
  const funnelSession = funnelSessionRef.current;

  // ─── historyViewTracked guard ─────────────────────────────────────────────────────
  const historyViewTracked = useRef(false);

  // ─── Mount ────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    document.title = COPY.pageTitle;
    setTimeout(() => setVisible(true), 80);
    setHistory(sortByDate(loadSelfHistory()));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Remote merge (Supabase) ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user || remoteFetchedRef.current) return;
    remoteFetchedRef.current = true;
    fetchRemoteSelfAssessmentResults().then((res) => {
      if (!res.ok || !res.data || res.data.length === 0) return;
      setHistory((prev) => mergeRemoteResults(prev, res.data));
    });
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── FIX 2: beforeunload + visibilitychange dual fallback ────────────────────────
  //
  // استراتيجية مزدوجة لضمان abandonment tracking على جميع المتصفحات:
  //   1. beforeunload: Chrome/Firefox Desktop — يرسل supabase request
  //   2. visibilitychange (hidden): Safari iOS + Android Chrome
  //      — يرسل supabase request عند انتقال لتطبيق آخر أو إغلاق التبويب
  //
  // حماية مزدوجة: abandonedRef يمنع إرسالين للـ Supabase
  useEffect(() => {
    const abandonedRef = { sent: false };

    async function fireAbandonment() {
      if (abandonedRef.sent) return;
      if (funnelSession.submittedAt !== null) return;
      abandonedRef.sent = true;
      void trackFunnelAbandonment(funnelSession, "self_assessment_form");
    }

    function onBeforeUnload() {
      void fireAbandonment();
    }

    function onVisibilityChange() {
      if (document.hidden) {
        void fireAbandonment();
      }
    }

    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [funnelSession]);

  // ─── Form submit ─────────────────────────────────────────────────────────────────
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = validateForm(name, age, {
      nameError:     COPY.form.nameError,
      ageErrorEmpty: COPY.form.ageErrorEmpty,
      ageErrorMin:   COPY.form.ageErrorMin,
      ageErrorMax:   COPY.form.ageErrorMax,
    });
    setNameError(result.nameError);
    setAgeError(result.ageError);
    if (!result.valid) return;

    const selfId  = generateSelfId();
    const ageNum  = parseInt(age, 10);
    saveSelfProfile(selfId, name.trim(), ageNum, mode, pathType);

    // FIX 1: ربط session بالـ selfId الحقيقي قبل أي tracking
    // بعد هذا السطر: session.sessionId = selfId دائماً
    funnelSession.attachRealSessionId(selfId);

    // trackFunnelSubmit يكتب row بـ session_id = selfId (upsert — FIX 3)
    void trackFunnelSubmit(funnelSession);

    navigate(buildIntroUrl(selfId, name.trim(), ageNum, mode, pathType));
  }

  // ─── trackHistoryView (once-only) ───────────────────────────────────────────────
  function handleShowAllHistory(value: boolean) {
    setShowAllHistory(value);
    if (value && !historyViewTracked.current) {
      historyViewTracked.current = true;
      funnelSession.onHistoryView();
      void trackHistoryView(funnelSession.sessionId);
    }
  }

  // ─── Derived state ────────────────────────────────────────────────────────────────
  const { current: currentPathResults, others: otherPathResults } =
    filterByPath(history, pathType);
  const latestResult = currentPathResults.length > 0 ? currentPathResults[0]     : null;
  const olderResults = currentPathResults.length > 1 ? currentPathResults.slice(1) : [];
  const safeRedirect = buildSafeRedirect(window.location.pathname, window.location.search);
  const loginUrl     = `/login?redirect=${encodeURIComponent(safeRedirect)}`;

  // ─── Helpers ────────────────────────────────────────────────────────────────────────
  function scrollToForm() {
    document.getElementById("self-assessment-form")?.scrollIntoView({ behavior: "smooth" });
  }

  function navigateToResult(sessionId: string, itemName: string, itemPathType: PathType) {
    navigate(buildResultUrl(sessionId, itemName, itemPathType));
  }

  return {
    // auth
    user,
    authLoading,
    // url
    pathType,
    mode,
    // ui
    visible,
    showAllHistory,
    setShowAllHistory: handleShowAllHistory,
    // form
    name, setName,
    age,  setAge,
    nameError, setNameError,
    ageError,  setAgeError,
    handleSubmit,
    // funnel (Step 7a)
    funnelSession,
    // history
    history,
    latestResult,
    olderResults,
    otherPathResults,
    // navigation
    loginUrl,
    scrollToForm,
    navigateToResult,
  };
}
