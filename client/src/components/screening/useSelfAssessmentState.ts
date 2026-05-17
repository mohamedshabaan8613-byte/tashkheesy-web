/**
 * useSelfAssessmentState.ts
 * Sprint 2.2 — Step 4: Centralized state hook
 *
 * يجمع كل useState وuseEffect الخاصة بـ SelfAssessment في مكان واحد.
 * يُقلل prop drilling ويمنع distributed state bugs.
 *
 * SelfAssessment.tsx يستدعي هذا الـ hook ويأخذ كل ما يحتاجه منه.
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

export function useSelfAssessmentState() {
  const [, navigate] = useLocation();
  const { user, loading: authLoading } = useSupabaseAuth();

  // ─── URL params ──────────────────────────────────────────────────────────────
  const searchParams = new URLSearchParams(window.location.search);
  const pathType = (searchParams.get("pathType") ?? "learning") as PathType;
  const mode     = (searchParams.get("mode")     ?? "self")     as AssessmentMode;

  // ─── UI state ─────────────────────────────────────────────────────────────────
  const [visible,        setVisible]        = useState(false);
  const [showAllHistory, setShowAllHistory] = useState(false);

  // ─── Form state ───────────────────────────────────────────────────────────────
  const [name,      setName]      = useState("");
  const [age,       setAge]       = useState("");
  const [ageError,  setAgeError]  = useState("");
  const [nameError, setNameError] = useState("");

  // ─── History state ────────────────────────────────────────────────────────────
  const [history, setHistory] = useState<SelfAssessmentSummary[]>([]);
  const remoteFetchedRef = useRef(false);

  // ─── Mount: page title + local history + enter animation ─────────────────────
  useEffect(() => {
    document.title = COPY.pageTitle;
    setTimeout(() => setVisible(true), 80);
    setHistory(sortByDate(loadSelfHistory()));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Remote merge (Supabase) — silent, non-blocking ──────────────────────────
  useEffect(() => {
    if (!user || remoteFetchedRef.current) return;
    remoteFetchedRef.current = true;
    fetchRemoteSelfAssessmentResults().then((res) => {
      if (!res.ok || !res.data || res.data.length === 0) return;
      setHistory((prev) => mergeRemoteResults(prev, res.data));
    });
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Form submit ──────────────────────────────────────────────────────────────
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
    navigate(buildIntroUrl(selfId, name.trim(), ageNum, mode, pathType));
  }

  // ─── Derived state ────────────────────────────────────────────────────────────
  const { current: currentPathResults, others: otherPathResults } =
    filterByPath(history, pathType);
  const latestResult = currentPathResults.length > 0 ? currentPathResults[0]     : null;
  const olderResults = currentPathResults.length > 1 ? currentPathResults.slice(1) : [];
  const safeRedirect = buildSafeRedirect(window.location.pathname, window.location.search);
  const loginUrl     = `/login?redirect=${encodeURIComponent(safeRedirect)}`;

  // ─── Scroll to form helper ────────────────────────────────────────────────────
  function scrollToForm() {
    document.getElementById("self-assessment-form")?.scrollIntoView({ behavior: "smooth" });
  }

  // ─── Navigate to result helper ───────────────────────────────────────────────
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
    setShowAllHistory,
    // form
    name, setName,
    age,  setAge,
    nameError, setNameError,
    ageError,  setAgeError,
    handleSubmit,
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
