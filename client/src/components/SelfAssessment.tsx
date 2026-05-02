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
 */
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  User,
  ArrowLeft,
  Shield,
  Brain,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Pencil,
  Zap,
  Hand,
  Users,
  Info,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

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

// ─── محاور الفحص الستة ────────────────────────────────────────────────────────
const SCREENING_AREAS = [
  { icon: BookOpen, label: "القراءة والفهم", color: "#1E4E8C", bg: "#DFF3F1" },
  { icon: Pencil,   label: "الكتابة والإملاء", color: "#2BBDB6", bg: "#DFF3F1" },
  { icon: Zap,      label: "الانتباه والتركيز", color: "#F4C46A", bg: "#FFFBEB" },
  { icon: Brain,    label: "الذاكرة والمعالجة", color: "#8B5CF6", bg: "#F5F3FF" },
  { icon: Users,    label: "المهارات الاجتماعية", color: "#059669", bg: "#ECFDF5" },
  { icon: Hand,     label: "المهارات الحركية", color: "#DC2626", bg: "#FEF2F2" },
];

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
  const [visible, setVisible] = useState(false);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [ageError, setAgeError] = useState("");
  const [nameError, setNameError] = useState("");
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [history, setHistory] = useState<SelfAssessmentSummary[]>([]);

  // قراءة pathType وmode من URL
  const searchParams = new URLSearchParams(window.location.search);
  const pathType = (searchParams.get("pathType") ?? "learning") as "learning" | "adhd";
  const mode = searchParams.get("mode") ?? "self";

  useEffect(() => {
    document.title = "التقييم الذاتي — تشخيصي | Tashkheesy";
    setTimeout(() => setVisible(true), 80);
    // تحميل السجل عند الدخول
    const h = loadSelfHistory();
    // ترتيب تنازلي بحسب completedAt
    h.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
    setHistory(h);
  }, []);

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
      setAgeError("هذا المسار مخصص للأعمار ١٦ سنة فأكثر — لتقييم الأطفال استخدم مسار 'أقيّم طفلي'");
      valid = false;
    } else if (ageNum > 80) {
      setAgeError("يرجى إدخال عمر صحيح");
      valid = false;
    } else {
      setAgeError("");
    }

    if (!valid) return;

    // إنشاء معرّف فريد للتقييم الذاتي
    const selfId = `self_${Date.now()}`;

    // حفظ بيانات المستخدم في localStorage
    localStorage.setItem(`self_profile_${selfId}`, JSON.stringify({
      id: selfId,
      name: name.trim(),
      age: ageNum,
      mode,
      pathType,
      createdAt: new Date().toISOString(),
    }));

    // الانتقال إلى صفحة المقدمة مع تمرير pathType وmode
    navigate(`/screening-intro/${selfId}?name=${encodeURIComponent(name.trim())}&age=${ageNum}&mode=${mode}&pathType=${pathType}`);
  }

  // عنوان المسار المختار
  const pathLabel = pathType === "adhd"
    ? "فرط الحركة وتشتت الانتباه"
    : "صعوبات التعلم";

  const latestResult = history.length > 0 ? history[0] : null;
  const olderResults = history.length > 1 ? history.slice(1) : [];

  return (
    <div
      className="min-h-screen flex flex-col"
      dir="rtl"
      style={{ background: "linear-gradient(160deg, #F4EFE8 0%, #DFF3F1 50%, #DFF3F1 100%)" }}
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
          style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 800, fontSize: "1.1rem", color: "#1e3a8a", textDecoration: "none" }}
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

          {/* ─── النتائج السابقة (تظهر فقط إذا وُجدت) ──────────────────── */}
          {latestResult && (
            <div
              className="rounded-3xl p-5 sm:p-6 mb-6"
              style={{
                background: "white",
                border: "1.5px solid rgba(30,78,140,0.15)",
                boxShadow: "0 8px 32px rgba(30,78,140,0.07)",
              }}
            >
              {/* عنوان القسم */}
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
                  border: `1px solid ${latestResult.pathType === "adhd" ? "rgba(139,92,246,0.2)" : "rgba(20,184,166,0.2)"}`,
                }}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span
                      className="inline-block text-xs font-bold px-2.5 py-1 rounded-full mb-1"
                      style={{
                        background: latestResult.pathType === "adhd" ? "rgba(139,92,246,0.12)" : "rgba(20,184,166,0.12)",
                        color: latestResult.pathType === "adhd" ? "#7C3AED" : "#0D9488",
                        fontFamily: "'Cairo', sans-serif",
                      }}
                    >
                      {latestResult.pathType === "adhd" ? "فرط الحركة وتشتت الانتباه" : "صعوبات التعلم"}
                    </span>
                    <p
                      className="text-xs text-slate-500"
                      style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                    >
                      {latestResult.name} · {formatArabicDate(latestResult.completedAt)}
                    </p>
                  </div>
                  <CheckCircle2 size={18} style={{ color: latestResult.pathType === "adhd" ? "#7C3AED" : "#0D9488", flexShrink: 0 }} />
                </div>

                {/* أزرار آخر نتيجة */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() =>
                      navigate(
                        `/screening-result/${latestResult.sessionId}?name=${encodeURIComponent(latestResult.name)}&pathType=${latestResult.pathType}`
                      )
                    }
                    className="w-full sm:flex-1 flex items-center justify-center gap-2 rounded-xl font-bold text-sm transition-all duration-200 hover:-translate-y-0.5"
                    style={{
                      background: latestResult.pathType === "adhd"
                        ? "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)"
                        : "linear-gradient(135deg, #2BBDB6 0%, #0D9488 100%)",
                      color: "white",
                      fontFamily: "'Cairo', sans-serif",
                      padding: "0.6rem 1rem",
                      boxShadow: latestResult.pathType === "adhd"
                        ? "0 3px 12px rgba(124,58,237,0.25)"
                        : "0 3px 12px rgba(20,184,166,0.25)",
                    }}
                  >
                    <CheckCircle2 size={14} />
                    عرض آخر نتيجة
                  </button>
                  <button
                    onClick={() => {
                      // التمرير إلى نموذج البدء
                      document.getElementById("self-assessment-form")?.scrollIntoView({ behavior: "smooth" });
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
                    {showAllHistory ? "إخفاء النتائج السابقة" : `عرض كل النتائج السابقة (${olderResults.length})`}
                  </button>

                  {showAllHistory && (
                    <div className="flex flex-col gap-2">
                      {olderResults.map((item) => (
                        <div
                          key={item.sessionId}
                          className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5"
                          style={{
                            background: "#F8FAFC",
                            border: "1px solid #E2E8F0",
                          }}
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

              {/* ملاحظة الخصوصية */}
              <p
                className="mt-3 text-xs text-slate-400 leading-relaxed"
                style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.7 }}
              >
                يتم حفظ هذه النتائج على هذا الجهاز فقط. لتخزينها بشكل دائم لاحقًا، سنوفر ربطها بحسابك.
              </p>
            </div>
          )}

          {/* ─── العنوان ─────────────────────────────────────────────────── */}
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

          {/* ─── نموذج البيانات ───────────────────────────────────────────── */}
          <form
            id="self-assessment-form"
            onSubmit={handleSubmit}
            className="rounded-3xl p-5 sm:p-7 lg:p-8 mb-6"
            style={{
              background: "white",
              border: "1.5px solid rgba(20,184,166,0.12)",
              boxShadow: "0 8px 40px rgba(20,184,166,0.07)",
            }}
            noValidate
          >
            <h2
              className="text-base font-bold text-slate-800 mb-5"
              style={{ fontFamily: "'Cairo', sans-serif" }}
            >
              بعض المعلومات الأساسية
            </h2>

            {/* حقل الاسم */}
            <div className="mb-5">
              <label
                htmlFor="self-name"
                className="block text-sm font-semibold text-slate-700 mb-2"
                style={{ fontFamily: "'Cairo', sans-serif" }}
              >
                اسمك (أو اسم مستعار)
              </label>
              <input
                id="self-name"
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setNameError(""); }}
                placeholder="مثال: أحمد أو مستخدم"
                className="w-full rounded-xl px-4 py-3 text-sm text-slate-800 outline-none transition-all duration-200"
                style={{
                  fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                  border: nameError ? "1.5px solid #EF4444" : "1.5px solid #D8E8E7",
                  background: "#F4EFE8",
                  boxShadow: "inset 0 1px 3px rgba(0,0,0,0.04)",
                }}
                onFocus={(e) => { e.target.style.border = "1.5px solid #2BBDB6"; e.target.style.boxShadow = "0 0 0 3px rgba(20,184,166,0.1)"; }}
                onBlur={(e) => { e.target.style.border = nameError ? "1.5px solid #EF4444" : "1.5px solid #D8E8E7"; e.target.style.boxShadow = "inset 0 1px 3px rgba(0,0,0,0.04)"; }}
                autoComplete="off"
                aria-describedby={nameError ? "name-error" : undefined}
              />
              {nameError && (
                <p id="name-error" className="mt-1.5 text-xs text-red-500" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>
                  {nameError}
                </p>
              )}
            </div>

            {/* حقل العمر */}
            <div className="mb-6">
              <label
                htmlFor="self-age"
                className="block text-sm font-semibold text-slate-700 mb-2"
                style={{ fontFamily: "'Cairo', sans-serif" }}
              >
                عمرك (بالسنوات)
              </label>
              <input
                id="self-age"
                type="number"
                value={age}
                onChange={(e) => { setAge(e.target.value); setAgeError(""); }}
                placeholder="مثال: 22"
                min={16}
                max={80}
                className="w-full rounded-xl px-4 py-3 text-sm text-slate-800 outline-none transition-all duration-200"
                style={{
                  fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                  border: ageError ? "1.5px solid #EF4444" : "1.5px solid #D8E8E7",
                  background: "#F4EFE8",
                  boxShadow: "inset 0 1px 3px rgba(0,0,0,0.04)",
                }}
                onFocus={(e) => { e.target.style.border = "1.5px solid #2BBDB6"; e.target.style.boxShadow = "0 0 0 3px rgba(20,184,166,0.1)"; }}
                onBlur={(e) => { e.target.style.border = ageError ? "1.5px solid #EF4444" : "1.5px solid #D8E8E7"; e.target.style.boxShadow = "inset 0 1px 3px rgba(0,0,0,0.04)"; }}
                aria-describedby={ageError ? "age-error" : "age-hint"}
              />
              {ageError ? (
                <p id="age-error" className="mt-1.5 text-xs text-red-500" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>
                  {ageError}
                </p>
              ) : (
                <p id="age-hint" className="mt-1.5 text-xs text-slate-400" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>
                  هذا المسار مخصص للأعمار ١٦ سنة فأكثر
                </p>
              )}
            </div>

            {/* إشعار الخصوصية */}
            <div
              className="flex items-start gap-3 rounded-xl p-3.5 mb-6"
              style={{ background: "#DFF3F1", border: "1px solid rgba(20,184,166,0.15)" }}
            >
              <Shield size={14} style={{ color: "#0D9488", flexShrink: 0, marginTop: "2px" }} aria-hidden="true" />
              <p
                className="text-xs text-teal-700 leading-relaxed"
                style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.7 }}
              >
                بياناتك محمية وسرية تماماً — لا تُشارك مع أي جهة. هذا الفحص لا يُعدّ تشخيصاً رسمياً.
              </p>
            </div>

            {/* زر البدء */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2.5 rounded-2xl font-bold text-base transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #2BBDB6 0%, #0D9488 100%)",
                color: "white",
                fontFamily: "'Cairo', sans-serif",
                fontWeight: 700,
                padding: "0.9rem 1.5rem",
                boxShadow: "0 4px 20px rgba(20,184,166,0.3)",
              }}
            >
              <Sparkles size={16} aria-hidden="true" />
              {latestResult ? "ابدأ تقييماً جديداً" : "ابدأ التقييم الذاتي"}
              <ArrowLeft size={16} aria-hidden="true" />
            </button>
          </form>

          {/* ─── ما يشمله الفحص ───────────────────────────────────────────── */}
          <div
            className="rounded-2xl p-5"
            style={{
              background: "white",
              border: "1px solid #DFF3F1",
              boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Info size={14} style={{ color: "#64748B" }} aria-hidden="true" />
              <h3
                className="text-sm font-bold text-slate-700"
                style={{ fontFamily: "'Cairo', sans-serif" }}
              >
                ما يشمله هذا الفحص
              </h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {SCREENING_AREAS.map(({ icon: Icon, label, color, bg }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 rounded-xl px-3 py-2.5"
                  style={{ background: bg, border: `1px solid ${color}18` }}
                >
                  <Icon size={13} style={{ color, flexShrink: 0 }} aria-hidden="true" />
                  <span
                    className="text-xs font-medium"
                    style={{ color: "#374151", fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>

            {/* ضمانات الثقة */}
            <div className="mt-4 pt-4" style={{ borderTop: "1px solid #DFF3F1" }}>
              <div className="flex flex-col gap-2">
                {[
                  { icon: CheckCircle2, text: "الفحص لا يستغرق أكثر من ١٠ دقائق", color: "#059669" },
                  { icon: CheckCircle2, text: "النتيجة فورية مع شرح مفصّل من الذكاء الاصطناعي", color: "#059669" },
                  { icon: CheckCircle2, text: "ليس تشخيصاً رسمياً — مؤشرات توجيهية أولية فقط", color: "#059669" },
                ].map(({ icon: Icon, text, color }) => (
                  <div key={text} className="flex items-start gap-2">
                    <Icon size={13} style={{ color, flexShrink: 0, marginTop: "2px" }} aria-hidden="true" />
                    <span
                      className="text-xs text-slate-500"
                      style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.6 }}
                    >
                      {text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
