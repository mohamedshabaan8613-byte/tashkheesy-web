/*
 * تشخيصي ScreeningIntro — Editorial Healthcare
 * Calm, reassuring intro step before screening questions
 * Design: Light mode, #F4EFE8 bg, #1E4E8C primary, #2BBDB6 secondary
 * Typography: Cairo (headings) + IBM Plex Sans Arabic (body)
 * Tone: warm, medically credible, non-judgmental, premium
 *
 * Flow: ChildrenPage → ScreeningIntro (/screening-intro/:childId) → ScreeningPage (/screening/:childId)
 * Receives: childId via route param, childName + age via query string (same as ScreeningPage)
 */

import { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import {
  BookOpen,
  Brain,
  Pencil,
  Zap,
  Users,
  Hand,
  Shield,
  Clock,
  Sparkles,
  ArrowLeft,
  ChevronLeft,
  CheckCircle2,
  Info,
} from "lucide-react";
import {
  FunnelSession,
  trackFunnelStart,
} from "@/lib/screeningAnalytics";

// ─── محاور الفحص الستة ────────────────────────────────────────────────────────
const SCREENING_AREAS = [
  {
    icon: BookOpen,
    label: "القراءة",
    desc: "الطلاقة والفهم القرائي",
    color: "#1E4E8C",
    bg: "#DFF3F1",
    border: "rgba(37,99,235,0.15)",
  },
  {
    icon: Pencil,
    label: "الكتابة",
    desc: "الإملاء والتعبير الكتابي",
    color: "#2BBDB6",
    bg: "#DFF3F1",
    border: "rgba(20,184,166,0.15)",
  },
  {
    icon: Zap,
    label: "الانتباه",
    desc: "التركيز والتنظيم الذاتي",
    color: "#F4C46A",
    bg: "#FFFBEB",
    border: "rgba(245,158,11,0.15)",
  },
  {
    icon: Brain,
    label: "الذاكرة",
    desc: "المعالجة والاسترجاع",
    color: "#8B5CF6",
    bg: "#F5F3FF",
    border: "rgba(139,92,246,0.15)",
  },
  {
    icon: Users,
    label: "الاجتماعي",
    desc: "التفاعل والمهارات الاجتماعية",
    color: "#059669",
    bg: "#ECFDF5",
    border: "rgba(5,150,105,0.15)",
  },
  {
    icon: Hand,
    label: "الحركي",
    desc: "التنسيق والمهارات الحركية",
    color: "#DC2626",
    bg: "#FEF2F2",
    border: "rgba(220,38,38,0.15)",
  },
];

// ─── ضمانات الثقة ─────────────────────────────────────────────────────────────
const TRUST_POINTS = [
  { icon: Shield, text: "بياناتك ونتائجك تُعامل بسرية تامة" },
  { icon: Info, text: "هذا فحص توجيهي أولي — ليس تشخيصاً طبياً رسمياً" },
  { icon: CheckCircle2, text: "يمكنك مناقشة النتائج لاحقاً مع متخصص معتمد" },
];

// ─── Props ────────────────────────────────────────────────────────────────────
interface ScreeningIntroProps {
  childId: string;
}

export default function ScreeningIntro({ childId }: ScreeningIntroProps) {
  const [, navigate] = useLocation();
  const [visible, setVisible] = useState(false);
  const funnelSessionRef = useRef<FunnelSession | null>(null);

  // قراءة اسم الطفل والعمر والمسار من query string
  const searchParams = new URLSearchParams(window.location.search);
  const childName = searchParams.get("name") ?? "";
  const childAge  = searchParams.get("age")  ?? "";
  const pathType  = searchParams.get("pathType") ?? "learning"; // learning | adhd
  const mode       = searchParams.get("mode") ?? ""; // self | "" (child mode)

  // عنوان المسار المختار
  const pathLabel = pathType === "adhd"
    ? "فرط الحركة وتشتت الانتباه (ADHD)"
    : "صعوبات التعلم (القراءة والكتابة والانتباه)";

  // محاور الفحص بحسب المسار
  const ADHD_AREAS = [
    { icon: Zap,      label: "الانتباه",       desc: "التركيز والتنظيم الذاتي",      color: "#F4C46A", bg: "#FFFBEB",  border: "rgba(245,158,11,0.15)" },
    { icon: Brain,    label: "فرط الحركة",     desc: "النشاط الزائد والاندفاعية",    color: "#8B5CF6", bg: "#F5F3FF",  border: "rgba(139,92,246,0.15)" },
    { icon: Users,    label: "الاجتماعي",      desc: "التفاعل والمهارات الاجتماعية", color: "#059669", bg: "#ECFDF5",  border: "rgba(5,150,105,0.15)" },
    { icon: Shield,   label: "التنظيم",        desc: "تنظيم الوقت والمهام",          color: "#1E4E8C", bg: "#DFF3F1",  border: "rgba(37,99,235,0.15)" },
    { icon: Sparkles, label: "المزاج",         desc: "الاستجابة العاطفية والتقلبات", color: "#DC2626", bg: "#FEF2F2",  border: "rgba(220,38,38,0.15)" },
    { icon: Clock,    label: "الذاكرة العاملة", desc: "الاحتفاظ بالمعلومات آنياً",   color: "#2BBDB6", bg: "#DFF3F1",  border: "rgba(20,184,166,0.15)" },
  ];
  const activeAreas = pathType === "adhd" ? ADHD_AREAS : SCREENING_AREAS;

 useEffect(() => {
  funnelSessionRef.current = new FunnelSession(
    childId,
    pathType === "adhd" ? "adhd" : "learning"
  );

  void trackFunnelStart(funnelSessionRef.current);

  const t = setTimeout(() => setVisible(true), 80);

  return () => clearTimeout(t);
}, []);

  // بناء رابط الفحص مع نفس الـ query params بما فيها pathType
  const screeningHref = `/screening/${childId}?name=${encodeURIComponent(childName || "الطفل")}&age=${childAge || "8"}&pathType=${pathType}${mode ? `&mode=${mode}` : ""}`;

  const anim = (delay: number) =>
    `transition-all duration-700 ease-out ${
      visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
    }`;
  const animStyle = (delay: number) => ({ transitionDelay: `${delay}ms` });

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#F4EFE8", direction: "rtl" }}
    >
      {/* ─── شريط التنقل العلوي ─────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b"
        style={{ borderColor: "#D8E8E7" }}
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* زر العودة */}
          <button
            onClick={() => navigate("/children")}
            className="flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-blue-600"
            style={{ color: "#4A6278", fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
          >
            <ChevronLeft size={16} />
            العودة
          </button>

          {/* شعار */}
          <a
            href="/"
            className="flex items-center gap-2"
            style={{ fontFamily: "'Cairo', sans-serif" }}
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #1E4E8C 0%, #2BBDB6 100%)" }}
            >
              <Brain size={14} className="text-white" />
            </div>
            <span className="font-black text-sm" style={{ color: "#243B53" }}>
              تشخيصي
            </span>
          </a>

          {/* مؤشر الخطوة */}
          <div
            className="text-xs font-medium"
            style={{ color: "#94A3B8", fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
          >
            خطوة ١ من ٣
          </div>
        </div>
      </header>

      {/* ─── المحتوى الرئيسي ────────────────────────────────────────────────── */}
      <main className="flex-1 py-10 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">

          {/* ── اسم الطفل (إذا كان موجوداً) ─────────────────────────────── */}
          {childName && (
            <div
              className={`mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full ${anim(0)}`}
              style={{
                ...animStyle(0),
                background: "rgba(37,99,235,0.07)",
                border: "1px solid rgba(37,99,235,0.15)",
              }}
            >
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span
                className="text-sm font-semibold text-blue-700"
                style={{ fontFamily: "'Cairo', sans-serif" }}
              >
                فحص {childName}
              </span>
            </div>
          )}

          {/* ── العنوان الرئيسي ───────────────────────────────────────────── */}
          <div className={`mb-5 ${anim(80)}`} style={animStyle(80)}>
            <h1
              className="text-3xl sm:text-4xl font-black text-slate-900 mb-4 leading-snug"
              style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900, lineHeight: 1.3 }}
            >
              {childName ? (
                <>
                  لنبدأ بخطوة أولى تساعدك على{" "}
                  <span
                    style={{
                      background: "linear-gradient(135deg, #1E4E8C 0%, #2BBDB6 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    فهم {childName} بشكل أوضح
                  </span>
                </>
              ) : (
                <>
                  لنبدأ بخطوة أولى تساعدك على{" "}
                  <span
                    style={{
                      background: "linear-gradient(135deg, #1E4E8C 0%, #2BBDB6 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    فهم الصورة بشكل أوضح
                  </span>
                </>
              )}
            </h1>
            <p
              className="text-base text-slate-600 leading-relaxed"
              style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.85 }}
            >
              هذا الفحص المبدئي يساعدك على رصد المؤشرات الأولية وتنظيمها — لا ليُصدر حكماً، بل ليُضيء الطريق نحو الفهم والخطوة التالية الصحيحة.
            </p>
          </div>

          {/* ── بطاقة نظرة عامة على الفحص ───────────────────────────────── */}
          <div
            className={`rounded-2xl p-5 mb-6 ${anim(160)}`}
            style={{
              ...animStyle(160),
              background: "white",
              border: "1px solid #D8E8E7",
              boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
            }}
          >
            <h2
              className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4"
              style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", letterSpacing: "0.08em" }}
            >
              نظرة عامة على الفحص
            </h2>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { icon: Clock, value: "١٥ دقيقة", label: "المدة التقريبية", color: "#1E4E8C", bg: "#DFF3F1" },
                { icon: Brain, value: "٦ محاور", label: "مجالات التقييم", color: "#2BBDB6", bg: "#DFF3F1" },
                { icon: Sparkles, value: "فوري", label: "شرح AI للنتائج", color: "#F4C46A", bg: "#FFFBEB" },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div
                    key={i}
                    className="rounded-xl p-3 flex flex-col items-center text-center"
                    style={{ background: item.bg }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center mb-2"
                      style={{ background: "white", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}
                    >
                      <Icon size={16} style={{ color: item.color }} />
                    </div>
                    <div
                      className="text-base font-black mb-0.5"
                      style={{ color: item.color, fontFamily: "'Cairo', sans-serif", fontWeight: 900 }}
                    >
                      {item.value}
                    </div>
                    <div
                      className="text-xs text-slate-500"
                      style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                    >
                      {item.label}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* نصيحة الإجابة */}
            <div
              className="flex items-start gap-3 rounded-xl p-3"
              style={{ background: "#F4EFE8", border: "1px solid #D8E8E7" }}
            >
              <Info size={15} className="text-blue-500 flex-shrink-0 mt-0.5" />
              <p
                className="text-sm text-slate-600 leading-relaxed"
                style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.7 }}
              >
                <strong className="text-slate-800">للحصول على أدق النتائج:</strong> أجب بصدق بناءً على ما تُلاحظه فعلاً — لا توجد إجابات صحيحة أو خاطئة.
              </p>
            </div>
          </div>

          {/* ── محاور الفحص الستة ────────────────────────────────────────── */}
          <div className={`mb-6 ${anim(240)}`} style={animStyle(240)}>
            <h2
              className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3"
              style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", letterSpacing: "0.08em" }}
            >
              محاور فحص {pathLabel}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {activeAreas.map((area, i) => {
                const Icon = area.icon;
                return (
                  <div
                    key={i}
                    className="rounded-xl p-3.5 flex items-center gap-3 transition-all duration-200 hover:-translate-y-0.5"
                    style={{
                      background: area.bg,
                      border: `1px solid ${area.border}`,
                    }}
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: "white", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}
                    >
                      <Icon size={17} style={{ color: area.color }} />
                    </div>
                    <div>
                      <div
                        className="text-sm font-bold"
                        style={{ color: area.color, fontFamily: "'Cairo', sans-serif", fontWeight: 700 }}
                      >
                        {area.label}
                      </div>
                      <div
                        className="text-xs text-slate-500 leading-tight"
                        style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                      >
                        {area.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── شرح دور الذكاء الاصطناعي ─────────────────────────────────── */}
          <div
            className={`rounded-2xl p-5 mb-6 ${anim(320)}`}
            style={{
              ...animStyle(320),
              background: "linear-gradient(135deg, rgba(15,23,42,0.94) 0%, rgba(30,58,138,0.94) 55%, rgba(15,118,110,0.94) 100%)",
              boxShadow: "0 8px 32px rgba(15,23,42,0.15)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* نقاط زخرفية */}
            <div
              className="absolute inset-0 pointer-events-none opacity-10"
              style={{
                backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />
            <div className="relative flex items-start gap-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }}
              >
                <Sparkles size={18} className="text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3
                    className="text-sm font-black text-white"
                    style={{ fontFamily: "'Cairo', sans-serif" }}
                  >
                    ماذا ستحصل بعد الفحص؟
                  </h3>
                  <div
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(16,185,129,0.2)", border: "1px solid rgba(16,185,129,0.3)" }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span
                      className="text-xs text-emerald-300"
                      style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                    >
                      مدعوم بالذكاء الاصطناعي
                    </span>
                  </div>
                </div>
                <p
                  className="text-sm text-blue-200 leading-relaxed mb-3"
                  style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.8 }}
                >
                  فور إتمام الفحص، يُحلل نظام الذكاء الاصطناعي إجاباتك ويُنشئ شرحاً مفصلاً بلغة عربية دافئة يُجيب على: ما الذي رصده الفحص؟ ماذا يعني؟ وما الخطوة التالية الأنسب؟
                </p>
                <div
                  className="text-xs px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5"
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "rgba(255,255,255,0.8)",
                    fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                  }}
                >
                  <Shield size={11} />
                  شرح توجيهي — مراجَع من متخصصين — ليس تشخيصاً طبياً
                </div>
              </div>
            </div>
          </div>

          {/* ── ضمانات الخصوصية والثقة ───────────────────────────────────── */}
          <div
            className={`rounded-2xl p-5 mb-8 ${anim(400)}`}
            style={{
              ...animStyle(400),
              background: "white",
              border: "1px solid #D8E8E7",
              boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
            }}
          >
            <h2
              className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4"
              style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", letterSpacing: "0.08em" }}
            >
              خصوصيتك وأمانك
            </h2>
            <div className="space-y-3">
              {TRUST_POINTS.map((point, i) => {
                const Icon = point.icon;
                return (
                  <div key={i} className="flex items-start gap-3">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: "#DFF3F1" }}
                    >
                      <Icon size={14} className="text-teal-600" />
                    </div>
                    <p
                      className="text-sm text-slate-600 leading-relaxed"
                      style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.7 }}
                    >
                      {point.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── أزرار الإجراء ─────────────────────────────────────────────── */}
          <div className={`flex flex-col sm:flex-row gap-3 ${anim(480)}`} style={animStyle(480)}>
            {/* الزر الرئيسي */}
            <button
              onClick={() => navigate(screeningHref)}
              className="flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-2xl text-white font-bold text-base transition-all duration-200 hover:-translate-y-1 active:translate-y-0"
              style={{
                background: "linear-gradient(135deg, #1E4E8C 0%, #1d4ed8 100%)",
                fontFamily: "'Cairo', sans-serif",
                fontWeight: 700,
                boxShadow: "0 6px 20px rgba(37,99,235,0.35)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 28px rgba(37,99,235,0.45)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 20px rgba(37,99,235,0.35)";
              }}
            >
              ابدأ الفحص الآن
              <ArrowLeft size={18} />
            </button>

            {/* زر العودة */}
            <button
              onClick={() => navigate("/children")}
              className="sm:w-auto flex items-center justify-center gap-2 py-4 px-6 rounded-2xl font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: "white",
                color: "#4A6278",
                border: "1.5px solid #D8E8E7",
                fontFamily: "'Cairo', sans-serif",
              }}
            >
              <ChevronLeft size={16} />
              العودة
            </button>
          </div>

          {/* ملاحظة أسفل الصفحة */}
          <p
            className={`text-center text-xs text-slate-400 mt-6 ${anim(560)}`}
            style={{
              ...animStyle(560),
              fontFamily: "'IBM Plex Sans Arabic', sans-serif",
            }}
          >
            يمكنك إيقاف الفحص في أي وقت والعودة لاحقاً — ستُحفظ إجاباتك تلقائياً.
          </p>
        </div>
      </main>
    </div>
  );
}
