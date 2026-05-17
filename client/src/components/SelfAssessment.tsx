/*
 * SelfAssessment — صفحة مدخل التقييم الذاتي للبالغين والطلاب
 *
 * التصميم: Editorial Healthcare Calm
 * الهوية البصرية: Cairo + IBM Plex Sans Arabic
 * اللوحة اللونية: #F4EFE8 خلفية | #2BBDB6 أخضر | #1E4E8C أزرق
 *
 * التدفق:
 *   /choose-self-path → /self-assessment?pathType=...&mode=self
 *   → /screening-intro/self?name=...&age=...&mode=self&pathType=...
 *
 * الأسلوب: دافئ، شامل، غير حكمي، عربي أولاً
 * الضمانات: ليس تشخيصاً رسمياً | الذكاء الاصطناعي للفهم الأولي | المتخصص الخطوة التالية
 *
 * Sprint 2.2 — Step 5:
 * Form UX منقولة إلى AssessmentForm.tsx (controlled component).
 * هذا الملف يقوم بـ:
 *   - orchestration + routing
 *   - Supabase fetch + history merge
 *   - state coordination (name, age, errors, history, visible)
 *   - تمرير كل القيم والـ handlers إلى AssessmentForm عبر props
 */
import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useSupabaseAuth } from "@/context/AuthContext";
import { fetchRemoteSelfAssessmentResults } from "@/lib/screeningResults";
import {
  User,
  ArrowLeft,
  Brain,
  CheckCircle2,
  Sparkles,
  Clock,
  ChevronDown,
  ChevronUp,
  Lock,
  LogIn,
} from "lucide-react";
import AssessmentForm from "./screening/AssessmentForm";

// ─── ثابت مفتاح localStorage ─────────────────────────────────────────────────
const SELF_ASSESSMENTS_KEY = "tashkheesy_self_assessments";

// ─── نوع ملخص التقييم الذاتي ─────────────────────────────────────────────────
interface SelfAssessmentSummary {
  id: string;
  sessionId: string;
  name: string;
  age: string | number;
  mode?: string;
  pathType: "learning" | "adhd";
  screeningType?: string;
  completedAt: string;
  resultKey: string;
}

// ─── قراءة سجل التقييمات الذاتية من localStorage ─────────────────────────────
function loadSelfHistory(): SelfAssessmentSummary[] {
  try {
    const raw = localStorage.getItem(SELF_ASSESSMENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as SelfAssessmentSummary[];
  } catch {
    return [];
  }
}

// ─── تنسيق التاريخ بالعربية ──────────────────────────────────────────────────
function formatArabicDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return isoString;
  }
}

export default function SelfAssessment() {
  const [, navigate] = useLocation();
  const { user, loading: authLoading } = useSupabaseAuth();

  // ─── Form state (يُمرَّر إلى AssessmentForm عبر props) ───────────────────
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [nameError, setNameError] = useState("");
  const [ageError, setAgeError] = useState("");

  // ─── UI + history state ──────────────────────────────────────────────────
  const [visible, setVisible] = useState(false);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [history, setHistory] = useState<SelfAssessmentSummary[]>([]);
  const remoteFetchedRef = useRef(false);

  // قراءة pathType وmode من URL
  const searchParams = new URLSearchParams(window.location.search);
  const pathType = (searchParams.get("pathType") ?? "learning") as "learning" | "adhd";
  const mode = searchParams.get("mode") ?? "self";

  useEffect(() => {
    document.title = "التقييم الذاتي — تشخيصي | Tashkheesy";
    setTimeout(() => setVisible(true), 80);
    const localHistory = loadSelfHistory();
    localHistory.sort(
      (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );
    setHistory(localHistory);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── دمج النتائج البعيدة من Supabase مع المحلية ─────────────────────────
  useEffect(() => {
    if (!user || remoteFetchedRef.current) return;
    remoteFetchedRef.current = true;

    fetchRemoteSelfAssessmentResults().then((res) => {
      if (!res.ok || !res.data || res.data.length === 0) return;

      setHistory((prev) => {
        const localSessionIds = new Set(prev.map((item) => item.sessionId));
        const newRemote: SelfAssessmentSummary[] = res.data
          .filter((r) => !localSessionIds.has(r.sessionId))
          .map((r) => ({
            id: r.sessionId,
            sessionId: r.sessionId,
            name: r.subjectName ?? "",
            age: r.subjectAge ?? "",
            mode: "self",
            pathType: (r.pathType as "learning" | "adhd") ?? "learning",
            screeningType: r.screeningType ?? undefined,
            completedAt: r.completedAt ?? new Date().toISOString(),
            resultKey: `result_${r.sessionId}`,
          }));

        if (newRemote.length === 0) return prev;
        const merged = [...prev, ...newRemote];
        merged.sort(
          (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
        );
        return merged;
      });
    });
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Form submission handler (orchestration يبقى هنا) ───────────────────
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    let valid = true;

    if (!name.trim()) {
      setNameError("يرجى إدخال اسمك");
      valid = false;
    } else {
      setNameError("");
    }

    const ageNum = parseInt(age, 10);
    if (!age || isNaN(ageNum)) {
      setAgeError("يرجى إدخال عمرك");
      valid = false;
    } else if (ageNum < 16) {
      setAgeError(
        "هذا المسار مخصص للأعمار ١٦ سنة فأكثر — لتقييم الأطفال استخدم مسار 'أقيّم طفلي'"
      );
      valid = false;
    } else if (ageNum > 80) {
      setAgeError("يرجى إدخال عمر صحيح");
      valid = false;
    } else {
      setAgeError("");
    }

    if (!valid) return;

    const selfId = `self_${Date.now()}`;
    localStorage.setItem(
      `self_profile_${selfId}`,
      JSON.stringify({
        id: selfId,
        name: name.trim(),
        age: ageNum,
        mode,
        pathType,
        createdAt: new Date().toISOString(),
      })
    );
    navigate(
      `/screening-intro/${selfId}?name=${encodeURIComponent(name.trim())}&age=${ageNum}&mode=${mode}&pathType=${pathType}`
    );
  }

  // ─── مشتقات (view logic فقط) ─────────────────────────────────────────────
  const pathLabel =
    pathType === "adhd" ? "فرط الحركة وتشتت الانتباه" : "صعوبات التعلم";

  const currentPathResults = history.filter((item) => item.pathType === pathType);
  const otherPathResults   = history.filter((item) => item.pathType !== pathType);
  const latestResult       = currentPathResults.length > 0 ? currentPathResults[0] : null;
  const olderResults       = currentPathResults.length > 1 ? currentPathResults.slice(1) : [];

  const currentPath = window.location.pathname + window.location.search;
  const safeRedirect =
    currentPath.startsWith("/") && !currentPath.startsWith("//")
      ? currentPath
      : "/self-assessment";
  const loginUrl = `/login?redirect=${encodeURIComponent(safeRedirect)}`;

  return (
    <div
      className="min-h-screen flex flex-col"
      dir="rtl"
      style={{
        background: "linear-gradient(160deg, #F4EFE8 0%, #DFF3F1 50%, #DFF3F1 100%)",
      }}
    >
      {/* ─── شريط التنقل ─────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-30 flex items-center justify-between px-5 sm:px-8"
        style={{
          height: "60px",
          background: "rgba(248,250,252,0.92)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(226,232,240,0.7)",
        }}
      >
        <button
          onClick={() => navigate("/start")}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors duration-200"
          style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", fontSize: "0.875rem" }}
          aria-label="العودة إلى اختيار المسار"
        >
          <ArrowLeft size={16} />
          <span>تغيير المسار</span>
        </button>

        <a
          href="/"
          className="flex items-center gap-2"
          style={{
            fontFamily: "'Cairo', sans-serif",
            fontWeight: 800,
            fontSize: "1.1rem",
            color: "#1e3a8a",
            textDecoration: "none",
          }}
          aria-label="تشخيصي — الصفحة الرئيسية"
        >
          <span
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #2BBDB6 0%, #1E4E8C 100%)" }}
            aria-hidden="true"
          >
            <Brain size={14} style={{ color: "white" }} />
          </span>
          تشخيصي
        </a>
      </header>

      {/* ─── المحتوى الرئيسي ─────────────────────────────────────────────── */}
      <main
        className="flex-1 flex flex-col items-center justify-center px-4 py-10 sm:py-14"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(16px)",
          transition: "opacity 0.5s ease, transform 0.5s ease",
        }}
      >
        <div className="w-full max-w-lg">

          {/* ─── بطاقة تسجيل الدخول (غير مسجّل) ──────────────────────── */}
          {!authLoading && !user && (
            <div
              className="rounded-3xl p-6 sm:p-8 mb-6"
              style={{
                background: "white",
                border: "1.5px solid rgba(30,78,140,0.15)",
                boxShadow: "0 8px 40px rgba(30,78,140,0.08)",
              }}
            >
              <div className="flex justify-center mb-5">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #DFF3F1 0%, #E0E7FF 100%)" }}
                >
                  <Lock size={26} style={{ color: "#1E4E8C" }} aria-hidden="true" />
                </div>
              </div>

              <h2
                className="text-xl font-black text-slate-900 text-center mb-3"
                style={{ fontFamily: "'Cairo', sans-serif" }}
              >
                احفظ نتيجتك بأمان
              </h2>

              <p
                className="text-sm text-slate-600 text-center leading-relaxed mb-2"
                style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.8 }}
              >
                قبل بدء الفحص، سجّل دخولك بالبريد الإلكتروني حتى تتمكن من الرجوع إلى نتيجتك لاحقًا ومتابعة خطواتك بسهولة.
              </p>

              <p
                className="text-xs text-slate-400 text-center mb-6"
                style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
              >
                لن نطلب كلمة مرور. سنرسل لك رابط دخول آمن إلى بريدك الإلكتروني.
              </p>

              <a
                href={loginUrl}
                className="w-full flex items-center justify-center gap-2.5 rounded-2xl font-bold text-base transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] mb-3"
                style={{
                  background: "linear-gradient(135deg, #1E4E8C 0%, #2BBDB6 100%)",
                  color: "white",
                  fontFamily: "'Cairo', sans-serif",
                  fontWeight: 700,
                  padding: "0.9rem 1.5rem",
                  boxShadow: "0 4px 20px rgba(30,78,140,0.25)",
                  textDecoration: "none",
                  display: "flex",
                }}
              >
                <LogIn size={16} aria-hidden="true" />
                تسجيل الدخول ومتابعة الفحص
              </a>

              <button
                onClick={() => navigate("/choose-self-path")}
                className="w-full text-center text-sm text-slate-400 hover:text-slate-600 transition-colors py-2"
                style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
              >
                العودة لاختيار نوع الفحص
              </button>
            </div>
          )}

          {/* ─── محتوى التقييم (مسجّل الدخول) ─────────────────────────── */}
          {(authLoading || user) && (
            <>

              {/* ─── AssessmentHistory (Step 6) ──────────────────────────
                   النتائج السابقة مؤقتاً هنا — ستُستخرج في Step 6          */}
              {latestResult && (
                <div
                  className="rounded-3xl p-5 sm:p-6 mb-6"
                  style={{
                    background: "white",
                    border: "1.5px solid rgba(30,78,140,0.15)",
                    boxShadow: "0 8px 32px rgba(30,78,140,0.07)",
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Clock size={15} style={{ color: "#1E4E8C" }} aria-hidden="true" />
                    <h2
                      className="text-sm font-bold text-slate-800"
                      style={{ fontFamily: "'Cairo', sans-serif" }}
                    >
                      نتائجك السابقة على هذا الجهاز
                    </h2>
                  </div>
                  <p
                    className="text-xs text-slate-400 mb-4"
                    style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                  >
                    يمكنك عرض آخر نتيجة أو بدء تقييم جديد.
                  </p>

                  {/* بطاقة آخر نتيجة */}
                  <div
                    className="rounded-2xl p-4 mb-3"
                    style={{
                      background: latestResult.pathType === "adhd" ? "#F5F3FF" : "#DFF3F1",
                      border: `1px solid ${
                        latestResult.pathType === "adhd"
                          ? "rgba(139,92,246,0.2)"
                          : "rgba(20,184,166,0.2)"
                      }`,
                    }}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <span
                          className="inline-block text-xs font-bold px-2.5 py-1 rounded-full mb-1"
                          style={{
                            background:
                              latestResult.pathType === "adhd"
                                ? "rgba(139,92,246,0.12)"
                                : "rgba(20,184,166,0.12)",
                            color:
                              latestResult.pathType === "adhd" ? "#7C3AED" : "#0D9488",
                            fontFamily: "'Cairo', sans-serif",
                          }}
                        >
                          {latestResult.pathType === "adhd"
                            ? "فرط الحركة وتشتت الانتباه"
                            : "صعوبات التعلم"}
                        </span>
                        <p
                          className="text-xs text-slate-500"
                          style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                        >
                          {latestResult.name} · {formatArabicDate(latestResult.completedAt)}
                        </p>
                      </div>
                      <CheckCircle2
                        size={18}
                        style={{
                          color: latestResult.pathType === "adhd" ? "#7C3AED" : "#0D9488",
                          flexShrink: 0,
                        }}
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() =>
                          navigate(
                            `/screening-result/${latestResult.sessionId}?name=${encodeURIComponent(latestResult.name)}&pathType=${latestResult.pathType}`
                          )
                        }
                        className="w-full sm:flex-1 flex items-center justify-center gap-2 rounded-xl font-bold text-sm transition-all duration-200 hover:-translate-y-0.5"
                        style={{
                          background:
                            latestResult.pathType === "adhd"
                              ? "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)"
                              : "linear-gradient(135deg, #2BBDB6 0%, #0D9488 100%)",
                          color: "white",
                          fontFamily: "'Cairo', sans-serif",
                          padding: "0.6rem 1rem",
                          boxShadow:
                            latestResult.pathType === "adhd"
                              ? "0 3px 12px rgba(124,58,237,0.25)"
                              : "0 3px 12px rgba(20,184,166,0.25)",
                        }}
                      >
                        <CheckCircle2 size={14} />
                        عرض آخر نتيجة
                      </button>
                      <button
                        onClick={() => {
                          document
                            .getElementById("self-assessment-form")
                            ?.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-xl text-sm font-medium transition-colors duration-200"
                        style={{
                          background: "transparent",
                          border: "1.5px solid #D8E8E7",
                          color: "#4A6278",
                          fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                          padding: "0.6rem 1rem",
                        }}
                      >
                        <Sparkles size={13} />
                        بدء تقييم جديد
                      </button>
                    </div>
                  </div>

                  {/* النتائج الأقدم */}
                  {olderResults.length > 0 && (
                    <div>
                      <button
                        onClick={() => setShowAllHistory((v) => !v)}
                        className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors mb-2"
                        style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                      >
                        {showAllHistory ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                        {showAllHistory
                          ? "إخفاء النتائج السابقة"
                          : `عرض كل النتائج السابقة (${olderResults.length})`}
                      </button>

                      {showAllHistory && (
                        <div className="flex flex-col gap-2">
                          {olderResults.map((item) => (
                            <div
                              key={item.sessionId}
                              className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5"
                              style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}
                            >
                              <div>
                                <span
                                  className="text-xs font-semibold"
                                  style={{
                                    color: item.pathType === "adhd" ? "#7C3AED" : "#0D9488",
                                    fontFamily: "'Cairo', sans-serif",
                                  }}
                                >
                                  {item.pathType === "adhd" ? "فرط الحركة" : "صعوبات التعلم"}
                                </span>
                                <p
                                  className="text-xs text-slate-400"
                                  style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                                >
                                  {formatArabicDate(item.completedAt)}
                                </p>
                              </div>
                              <button
                                onClick={() =>
                                  navigate(
                                    `/screening-result/${item.sessionId}?name=${encodeURIComponent(item.name)}&pathType=${item.pathType}`
                                  )
                                }
                                className="text-xs font-medium rounded-lg px-3 py-1.5 transition-colors"
                                style={{
                                  background: "rgba(30,78,140,0.07)",
                                  color: "#1E4E8C",
                                  fontFamily: "'Cairo', sans-serif",
                                  border: "1px solid rgba(30,78,140,0.12)",
                                }}
                              >
                                عرض النتيجة
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <p
                    className="mt-3 text-xs text-slate-400 leading-relaxed"
                    style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.7 }}
                  >
                    يتم حفظ هذه النتائج على هذا الجهاز فقط. لتخزينها بشكل دائم لاحقًا، سنوفر ربطها بحسابك.
                  </p>

                  {/* نتائج مسارات أخرى */}
                  {otherPathResults.length > 0 && (
                    <div
                      className="mt-4 rounded-xl p-3"
                      style={{
                        background: "rgba(148,163,184,0.06)",
                        border: "1px solid rgba(148,163,184,0.15)",
                      }}
                    >
                      <p
                        className="text-xs font-medium mb-2"
                        style={{ color: "#94A3B8", fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                      >
                        نتائج أخرى محفوظة على هذا الجهاز
                      </p>
                      <div className="flex flex-col gap-2">
                        {otherPathResults.slice(0, 3).map((item) => (
                          <div
                            key={item.sessionId}
                            className="flex items-center justify-between gap-2 rounded-lg px-3 py-2"
                            style={{
                              background: "rgba(148,163,184,0.08)",
                              border: "1px solid rgba(148,163,184,0.12)",
                            }}
                          >
                            <div className="flex flex-col gap-0.5 min-w-0">
                              <span
                                className="text-xs font-medium truncate"
                                style={{ color: "#64748B", fontFamily: "'Cairo', sans-serif" }}
                              >
                                {item.pathType === "adhd"
                                  ? "فرط الحركة وتشتت الانتباه"
                                  : "صعوبات التعلم"}
                              </span>
                              <span
                                className="text-xs"
                                style={{
                                  color: "#94A3B8",
                                  fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                                }}
                              >
                                {formatArabicDate(item.completedAt)}
                              </span>
                            </div>
                            <button
                              onClick={() =>
                                navigate(
                                  `/screening-result/${item.sessionId}?name=${encodeURIComponent(item.name)}&pathType=${item.pathType}`
                                )
                              }
                              className="text-xs rounded-lg px-2.5 py-1 transition-colors flex-shrink-0"
                              style={{
                                background: "rgba(148,163,184,0.12)",
                                color: "#64748B",
                                fontFamily: "'Cairo', sans-serif",
                                border: "1px solid rgba(148,163,184,0.18)",
                              }}
                            >
                              عرض
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ─── العنوان ─────────────────────────────────────────── */}
              <div className="text-center mb-8">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
                  style={{
                    background: "linear-gradient(135deg, #DFF3F1 0%, #CCFBF1 100%)",
                    border: "1px solid rgba(20,184,166,0.2)",
                  }}
                  aria-hidden="true"
                >
                  <User size={28} style={{ color: "#2BBDB6" }} />
                </div>

                <div
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4"
                  style={{
                    background: "rgba(20,184,166,0.08)",
                    border: "1px solid rgba(20,184,166,0.18)",
                  }}
                >
                  <Sparkles size={12} style={{ color: "#0D9488" }} aria-hidden="true" />
                  <span
                    className="text-xs font-medium"
                    style={{ color: "#0D9488", fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                  >
                    {pathLabel} — تقييم ذاتي مجاني
                  </span>
                </div>

                <h1
                  className="text-2xl sm:text-3xl font-black text-slate-900 mb-3"
                  style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900, lineHeight: 1.3 }}
                >
                  {latestResult ? "بدء تقييم جديد" : "أقيّم نفسي"}
                </h1>
                <p
                  className="text-sm text-slate-500 leading-relaxed"
                  style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.8 }}
                >
                  فحص أولي لفهم أنماط تعلمك وانتباهك — الخطوة الأولى نحو فهم أعمق لنفسك
                </p>
              </div>

              {/* ─── AssessmentForm (Step 5) ─────────────────────────── */}
              <AssessmentForm
                name={name}
                age={age}
                nameError={nameError}
                ageError={ageError}
                pathType={pathType}
                latestResult={latestResult}
                onNameChange={(v) => { setName(v); setNameError(""); }}
                onAgeChange={(v) => { setAge(v); setAgeError(""); }}
                onSubmit={handleSubmit}
              />

            </>
          )}
        </div>
      </main>
    </div>
  );
}
