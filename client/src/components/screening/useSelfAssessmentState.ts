/**
 * useSelfAssessmentState.ts
 * Sprint 2.2 — Step 4: Centralized state hook
 * Sprint 2.2 — Step 7a: Funnel Instrumentation Wiring
 *
 * يجمع كل useState وملحقاتها + Funnel tracking في مكان واحد.
 * SelfAssessment.tsx يستدعي هذا الـ hook ويأخذ كل ما يحتاجه منه.
 *
 * Funnel Wiring (Step 7a):
 *   • FunnelSession يُنشأ بـ useRef — مرة واحدة per mount
 *   • trackFunnelSubmit → في handleSubmit فور نجاح الـ validation
 *   • trackFunnelAbandonment → beforeunload effect
 *   • trackHistoryView → عند فتح سجل التقييمات
 *   • funnelSession يُمرَّر لـ AssessmentForm عبر props
 *
 * لا lazy loading — الـ assessment هو primary user flow.
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

  // ─── Step 7a: Funnel Session (created once per mount) ───────────────────────
  //
  // نستخدم useRef وليس useState لأن FunnelSession لا تحتاج re-render.
  // الـ sessionId سيتطابق مع generateSelfId() في handleSubmit.
  // الطريقة: نُنشئ session عند أول render ونحتفظ بالـ sessionId.
  // في handleSubmit نتحقق من تطابق session.sessionId مع selfId
  // عبر saveSelfProfile (selfId = session.sessionId).
  const funnelSessionRef = useRef<FunnelSession | null>(null);
  if (!funnelSessionRef.current) {
    funnelSessionRef.current = new FunnelSession(
      // سيُحدد selfId لاحقاً في handleSubmit — هنا نسجل pathType و device
      // ونترك sessionId placeholder لأنه لا يُعرف بعد
      `pending-${Date.now()}`,
      pathType
    );
  }
  const funnelSession = funnelSessionRef.current;

  // ─── historyViewTracked: لمنع إرسال trackHistoryView أكثر من مرة ────────────
  const historyViewTracked = useRef(false);

  // ─── Mount: page title + local history + enter animation ─────────────────────
  useEffect(() => {
    document.title = COPY.pageTitle;
    setTimeout(() => setVisible(true), 80);
    setHistory(sortByDate(loadSelfHistory()));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Remote merge (Supabase) — silent, non-blocking ────────────────────────
  useEffect(() => {
    if (!user || remoteFetchedRef.current) return;
    remoteFetchedRef.current = true;
    fetchRemoteSelfAssessmentResults().then((res) => {
      if (!res.ok || !res.data || res.data.length === 0) return;
      setHistory((prev) => mergeRemoteResults(prev, res.data));
    });
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Step 7a: beforeunload — Abandonment tracking ─────────────────────────
  //
  // يُرسل abandoned=true عند مغادرة الصفحة بعد بدء التفاعل.
  // لملاحظة: sessionId قد يكون "pending-" إذا لم يًكمل المستخدم الفورم.
  // screeningAnalytics.trackFunnelAbandonment تتحمل ذلك بشفافية.
  useEffect(() => {
    function onBeforeUnload() {
      // لا نُرسل إلا إذا كان المستخدم تفاعل (بدأت startTracked في AssessmentForm)
      // و لم يُكمل الفورم (لا submittedAt)
      if (funnelSession.submittedAt !== null) return;
      void trackFunnelAbandonment(funnelSession, "self_assessment_form");
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
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

    // Step 7a: نُطلق trackFunnelSubmit قبل navigate (fire-and-forget)
    // ملاحظة: نستخدم funnelSession الموجود بالـ ref —
    // session.sessionId قد يكون "pending-" لكن الصف سيكون موجوداً
    // بالـ session_id الذي أدخله trackFunnelStart (pending-...)
    void trackFunnelSubmit(funnelSession);

    navigate(buildIntroUrl(selfId, name.trim(), ageNum, mode, pathType));
  }

  // ─── Step 7a: trackHistoryView ───────────────────────────────────────────────
  function handleShowAllHistory(value: boolean) {
    setShowAllHistory(value);
    // نُطلق trackHistoryView فقط عند الفتح (وليس عند الإغلاق)، ومرة واحدة فقط
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

  // ─── Scroll to form helper ──────────────────────────────────────────────────────
  function scrollToForm() {
    document.getElementById("self-assessment-form")?.scrollIntoView({ behavior: "smooth" });
  }

  // ─── Navigate to result helper ────────────────────────────────────────────────
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
    setShowAllHistory: handleShowAllHistory,  // مُحدّث: الآن يحتوي trackHistoryView
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
