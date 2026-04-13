/*
 * AssessmentStart — صفحة اختيار مسار الفحص
 *
 * التصميم: Editorial Healthcare Calm
 * الهوية البصرية: Cairo + IBM Plex Sans Arabic
 * اللوحة اللونية: #F4EFE8 خلفية | #1E4E8C أزرق | #2BBDB6 أخضر
 *
 * المسارات:
 *   أقيّم طفلي  → /children  (المسار الحالي)
    أقيّم نفسي  → /choose-self-path  (اختيار المسار أولاً))
 *
 * الأسلوب: دافئ، شامل، غير حكمي، عربي أولاً
 */
import { useLocation } from "wouter";
import { Users, User, ArrowLeft, Shield, Brain, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

export default function AssessmentStart() {
  const [, navigate] = useLocation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    document.title = "ابدأ الفحص — تشخيصي | Tashkheesy";
    setTimeout(() => setVisible(true), 80);
  }, []);

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
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors duration-200"
          style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", fontSize: "0.875rem" }}
          aria-label="العودة إلى الصفحة الرئيسية"
        >
          <ArrowLeft size={16} />
          <span>الرئيسية</span>
        </button>

        <a
          href="/"
          className="flex items-center gap-2"
          style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 800, fontSize: "1.1rem", color: "#1e3a8a", textDecoration: "none" }}
          aria-label="تشخيصي — الصفحة الرئيسية"
        >
          <span
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #1E4E8C 0%, #2BBDB6 100%)" }}
            aria-hidden="true"
          >
            <Brain size={14} style={{ color: "white" }} />
          </span>
          تشخيصي
        </a>
      </header>

      {/* ─── المحتوى الرئيسي ─────────────────────────────────────────────── */}
      <main
        className="flex-1 flex flex-col items-center justify-center px-4 py-12 sm:py-16"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(16px)",
          transition: "opacity 0.5s ease, transform 0.5s ease",
        }}
      >
        {/* ─── العنوان ─────────────────────────────────────────────────── */}
        <div className="text-center mb-10 max-w-xl">
          {/* شارة */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{
              background: "rgba(37,99,235,0.07)",
              border: "1px solid rgba(37,99,235,0.15)",
            }}
          >
            <Sparkles size={13} style={{ color: "#1E4E8C" }} aria-hidden="true" />
            <span
              className="text-xs font-medium"
              style={{ color: "#1E4E8C", fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
            >
              فحص أولي مجاني — لا يستغرق أكثر من 10 دقائق
            </span>
          </div>

          <h1
            className="text-3xl sm:text-4xl font-black text-slate-900 mb-4"
            style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900, lineHeight: 1.25 }}
          >
            لمن تريد إجراء الفحص؟
          </h1>
          <p
            className="text-base text-slate-500 leading-relaxed"
            style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.8 }}
          >
            لكل مسار أسئلته الخاصة وتقريره الأولي المخصص — اختر من يحتاج الفحص أولاً</p>
        </div>

        {/* ─── بطاقتا الاختيار ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">

          {/* بطاقة: أقيّم طفلي */}
          <button
            onClick={() => navigate("/children")}
            className="group text-right rounded-3xl p-5 sm:p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl active:scale-[0.98]"
            style={{
              background: "white",
              border: "2px solid rgba(37,99,235,0.12)",
              boxShadow: "0 4px 24px rgba(37,99,235,0.06)",
              cursor: "pointer",
            }}
            aria-label="ابدأ تقييم طفلك"
          >
            {/* أيقونة */}
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
              style={{
                background: "linear-gradient(135deg, #DFF3F1 0%, #DBEAFE 100%)",
                border: "1px solid rgba(37,99,235,0.15)",
              }}
              aria-hidden="true"
            >
              <Users size={26} style={{ color: "#1E4E8C" }} />
            </div>

            {/* النص */}
            <h2
              className="text-xl font-black text-slate-900 mb-2"
              style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 800 }}
            >
              أقيّم طفلي
            </h2>
            <p
              className="text-sm text-slate-500 leading-relaxed mb-5"
              style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.7 }}
            >
              للآباء والأمهات والمعلمين — ستختار بعدها المسار الأنسب: صعوبات التعلم أو فرط الحركة وتشتت الانتباه
            </p>

            {/* الفئة العمرية */}
            <div className="flex flex-wrap gap-2">
              {["٣–٥ سنوات", "٦–١٢ سنة", "١٣–١٧ سنة"].map((age) => (
                <span
                  key={age}
                  className="text-xs px-3 py-1 rounded-full"
                  style={{
                    background: "#DFF3F1",
                    color: "#1E4E8C",
                    fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                    border: "1px solid rgba(37,99,235,0.15)",
                  }}
                >
                  {age}
                </span>
              ))}
            </div>

            {/* زر الدخول */}
            <div
              className="mt-5 flex items-center justify-between"
            >
              <span
                className="text-sm font-bold transition-colors duration-200"
                style={{ color: "#1E4E8C", fontFamily: "'Cairo', sans-serif" }}
              >
                ابدأ تقييم طفلك
              </span>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 group-hover:translate-x-[-4px]"
                style={{ background: "#DFF3F1" }}
                aria-hidden="true"
              >
                <ArrowLeft size={14} style={{ color: "#1E4E8C" }} />
              </div>
            </div>
          </button>

          {/* بطاقة: أقيّم نفسي */}
          <button
            onClick={() => navigate("/choose-self-path")}
            className="group text-right rounded-3xl p-5 sm:p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl active:scale-[0.98]"
            style={{
              background: "white",
              border: "2px solid rgba(20,184,166,0.12)",
              boxShadow: "0 4px 24px rgba(20,184,166,0.06)",
              cursor: "pointer",
            }}
            aria-label="ابدأ التقييم الذاتي"
          >
            {/* أيقونة */}
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
              style={{
                background: "linear-gradient(135deg, #DFF3F1 0%, #CCFBF1 100%)",
                border: "1px solid rgba(20,184,166,0.15)",
              }}
              aria-hidden="true"
            >
              <User size={26} style={{ color: "#2BBDB6" }} />
            </div>

            {/* النص */}
            <h2
              className="text-xl font-black text-slate-900 mb-2"
              style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 800 }}
            >
              أقيّم نفسي
            </h2>
            <p
              className="text-sm text-slate-500 leading-relaxed mb-5"
              style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.7 }}
            >
              للطلاب والبالغين — فحص أولي لفهم أنماط التعلم والانتباه الخاصة بك بشكل أعمق
            </p>

            {/* الفئة العمرية */}
            <div className="flex flex-wrap gap-2">
              {["١٦+ سنة", "طالب جامعي", "بالغ"].map((label) => (
                <span
                  key={label}
                  className="text-xs px-3 py-1 rounded-full"
                  style={{
                    background: "#DFF3F1",
                    color: "#0D9488",
                    fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                    border: "1px solid rgba(20,184,166,0.15)",
                  }}
                >
                  {label}
                </span>
              ))}
            </div>

            {/* زر الدخول */}
            <div className="mt-5 flex items-center justify-between">
              <span
                className="text-sm font-bold transition-colors duration-200"
                style={{ color: "#0D9488", fontFamily: "'Cairo', sans-serif" }}
              >
                ابدأ التقييم الذاتي
              </span>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 group-hover:translate-x-[-4px]"
                style={{ background: "#DFF3F1" }}
                aria-hidden="true"
              >
                <ArrowLeft size={14} style={{ color: "#0D9488" }} />
              </div>
            </div>
          </button>
        </div>

        {/* ─── ضمانات الثقة ────────────────────────────────────────────── */}
        <div
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8"
          style={{ opacity: 0.75 }}
          aria-label="ضمانات الفحص"
        >
          {[
            { icon: Shield, text: "ليس تشخيصاً رسمياً — فحص أولي توجيهي" },
            { icon: Brain, text: "الذكاء الاصطناعي يساعد على الفهم الأولي فقط" },
            { icon: Users, text: "المتخصص هو الخطوة التالية عند الحاجة" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2">
              <Icon size={13} style={{ color: "#64748B", flexShrink: 0 }} aria-hidden="true" />
              <span
                className="text-xs text-slate-500"
                style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
              >
                {text}
              </span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
