/*
 * SelfAssessment — صفحة مدخل التقييم الذاتي للبالغين والطلاب
 *
 * التصميم: Editorial Healthcare Calm
 * الهوية البصرية: Cairo + IBM Plex Sans Arabic
 * اللوحة اللونية: #F8FAFC خلفية | #14B8A6 أخضر | #2563EB أزرق
 *
 * التدفق:
 *   /self-assessment → يُدخل المستخدم اسمه وعمره → /screening-intro/self?name=...&age=...
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
} from "lucide-react";

// ─── محاور الفحص الستة ────────────────────────────────────────────────────────
const SCREENING_AREAS = [
  { icon: BookOpen, label: "القراءة والفهم", color: "#2563EB", bg: "#EFF6FF" },
  { icon: Pencil,   label: "الكتابة والإملاء", color: "#14B8A6", bg: "#F0FDFA" },
  { icon: Zap,      label: "الانتباه والتركيز", color: "#F59E0B", bg: "#FFFBEB" },
  { icon: Brain,    label: "الذاكرة والمعالجة", color: "#8B5CF6", bg: "#F5F3FF" },
  { icon: Users,    label: "المهارات الاجتماعية", color: "#059669", bg: "#ECFDF5" },
  { icon: Hand,     label: "المهارات الحركية", color: "#DC2626", bg: "#FEF2F2" },
];

export default function SelfAssessment() {
  const [, navigate] = useLocation();
  const [visible, setVisible] = useState(false);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [ageError, setAgeError] = useState("");
  const [nameError, setNameError] = useState("");

  useEffect(() => {
    document.title = "التقييم الذاتي — تشخيصي | Tashkheesy";
    setTimeout(() => setVisible(true), 80);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    let valid = true;

    // التحقق من الاسم
    if (!name.trim()) {
      setNameError("يرجى إدخال اسمك");
      valid = false;
    } else {
      setNameError("");
    }

    // التحقق من العمر
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

    // حفظ بيانات المستخدم في localStorage لاستخدامها في صفحة الفحص
    localStorage.setItem(`self_profile_${selfId}`, JSON.stringify({
      id: selfId,
      name: name.trim(),
      age: ageNum,
      mode: "self",
      createdAt: new Date().toISOString(),
    }));

    // الانتقال إلى صفحة المقدمة مع بيانات المستخدم
    navigate(`/screening-intro/${selfId}?name=${encodeURIComponent(name.trim())}&age=${ageNum}&mode=self`);
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      dir="rtl"
      style={{ background: "linear-gradient(160deg, #F8FAFC 0%, #F0FDFA 50%, #EFF6FF 100%)" }}
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
            style={{ background: "linear-gradient(135deg, #14B8A6 0%, #2563EB 100%)" }}
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

          {/* ─── العنوان ─────────────────────────────────────────────────── */}
          <div className="text-center mb-8">
            {/* أيقونة */}
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
              style={{
                background: "linear-gradient(135deg, #F0FDFA 0%, #CCFBF1 100%)",
                border: "1px solid rgba(20,184,166,0.2)",
              }}
              aria-hidden="true"
            >
              <User size={28} style={{ color: "#14B8A6" }} />
            </div>

            {/* شارة */}
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
                تقييم ذاتي — مجاني وسري
              </span>
            </div>

            <h1
              className="text-2xl sm:text-3xl font-black text-slate-900 mb-3"
              style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900, lineHeight: 1.3 }}
            >
              أقيّم نفسي
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
                  border: nameError ? "1.5px solid #EF4444" : "1.5px solid #E2E8F0",
                  background: "#F8FAFC",
                  boxShadow: "inset 0 1px 3px rgba(0,0,0,0.04)",
                }}
                onFocus={(e) => { e.target.style.border = "1.5px solid #14B8A6"; e.target.style.boxShadow = "0 0 0 3px rgba(20,184,166,0.1)"; }}
                onBlur={(e) => { e.target.style.border = nameError ? "1.5px solid #EF4444" : "1.5px solid #E2E8F0"; e.target.style.boxShadow = "inset 0 1px 3px rgba(0,0,0,0.04)"; }}
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
                  border: ageError ? "1.5px solid #EF4444" : "1.5px solid #E2E8F0",
                  background: "#F8FAFC",
                  boxShadow: "inset 0 1px 3px rgba(0,0,0,0.04)",
                }}
                onFocus={(e) => { e.target.style.border = "1.5px solid #14B8A6"; e.target.style.boxShadow = "0 0 0 3px rgba(20,184,166,0.1)"; }}
                onBlur={(e) => { e.target.style.border = ageError ? "1.5px solid #EF4444" : "1.5px solid #E2E8F0"; e.target.style.boxShadow = "inset 0 1px 3px rgba(0,0,0,0.04)"; }}
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
              style={{ background: "#F0FDFA", border: "1px solid rgba(20,184,166,0.15)" }}
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
                background: "linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)",
                color: "white",
                fontFamily: "'Cairo', sans-serif",
                fontWeight: 700,
                padding: "0.9rem 1.5rem",
                boxShadow: "0 4px 20px rgba(20,184,166,0.3)",
              }}
            >
              <Sparkles size={16} aria-hidden="true" />
              ابدأ التقييم الذاتي
              <ArrowLeft size={16} aria-hidden="true" />
            </button>
          </form>

          {/* ─── ما يشمله الفحص ───────────────────────────────────────────── */}
          <div
            className="rounded-2xl p-5"
            style={{
              background: "white",
              border: "1px solid #F1F5F9",
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
            <div className="mt-4 pt-4" style={{ borderTop: "1px solid #F1F5F9" }}>
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
