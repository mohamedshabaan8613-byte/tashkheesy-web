/*
 * تشخيصي ImpactSection — Editorial Healthcare (Rewritten)
 * ─────────────────────────────────────────────────────────────────
 * Design: Dark premium section — #243B53 background, teal/blue accents
 * Purpose: أثر الفهم المبكر — defensible for hackathon judges & public users
 *
 * Rewrite principles:
 * - No unsupported statistics as bold headline claims
 * - No "تشخيص مبكر" — only "فهم مبكر" and "مؤشرات"
 * - Impact categories preserved but rewritten carefully
 * - Added measurable-intent layer: ما الذي تستهدف المنصة قياسه
 * - Context figures framed as حجم الحاجة التقريبي, not proven outcomes
 * ─────────────────────────────────────────────────────────────────
 */

import { useEffect, useRef } from "react";
import { Target, Users, TrendingUp, Clock, BookOpen, Heart, Globe, Lightbulb } from "lucide-react";

// ─── Impact Categories ─────────────────────────────────────────────
const impactPoints = [
  {
    icon: BookOpen,
    emoji: "📚",
    title: "أثر تعليمي",
    desc: "الفهم المبكر لمؤشرات صعوبات القراءة والكتابة والانتباه يُمكّن الأسرة من التحرك قبل تراكم الفجوات الأكاديمية — كل فصل دراسي بوضوح أفضل من فصل بدونه.",
    color: "#2BBDB6",
  },
  {
    icon: Heart,
    emoji: "💙",
    title: "أثر نفسي",
    desc: "عندما يُفهم الطفل بدلاً من أن يُحكم عليه، تتغير علاقته بالتعلم. الوضوح يُزيل الوصمة ويُعيد بناء الثقة — للطفل ولأسرته معاً.",
    color: "#1E4E8C",
  },
  {
    icon: Globe,
    emoji: "🌍",
    title: "أثر اجتماعي",
    desc: "أداة عربية تُخاطب الأسرة بلغتها وثقافتها تُقلل الحاجز الاجتماعي أمام طلب الدعم — وهو أحد أكبر العوائق في السياق العربي.",
    color: "#2BBDB6",
  },
  {
    icon: Lightbulb,
    emoji: "💡",
    title: "أثر اقتصادي",
    desc: "الخطوة الأولى الواضحة تُقلل الوقت الضائع بين القلق الأول والتدخل المناسب — وهو ما تستهدف المنصة قياسه وتحسينه.",
    color: "#F4C46A",
  },
];

// ─── Need Context (framed as حجم الحاجة, not proven outcomes) ───────
const needContext = [
  {
    value: "١ من كل ٥",
    label: "أطفال في سن المدرسة قد يواجهون شكلاً من أشكال تحديات التعلم أو الانتباه",
    frame: "تقدير عالمي",
    color: "#2BBDB6",
    note: "وفق تقديرات منظمات التعليم الدولية — تتفاوت الأرقام حسب المنطقة والتعريف المستخدم",
  },
  {
    value: "سنوات",
    label: "قد تمر بين أول ملاحظة من الأسرة وأول خطوة دعم فعلية — في غياب أداة واضحة للبداية",
    frame: "الفجوة التي نستهدفها",
    color: "#1E4E8C",
    note: "هذه الفجوة الزمنية هي المشكلة الجوهرية التي تعالجها المنصة",
  },
  {
    value: "الفهم",
    label: "وحده يُحدث فارقاً — حتى قبل أي تدخل رسمي. الأسرة التي تعرف من أين تبدأ تتصرف بثقة",
    frame: "مبدأ المنصة",
    color: "#F4C46A",
    note: "الهدف الأول ليس التشخيص — بل تحويل الحيرة إلى خطوة واضحة",
  },
];

// ─── Measurable Intent Layer ───────────────────────────────────────
const measurableTargets = [
  {
    icon: Users,
    label: "عدد الأسر التي تُكمل الفحص الأولي",
    sub: "مؤشر الوصول والبداية",
    color: "#1E4E8C",
    bg: "#DFF3F1",
  },
  {
    icon: TrendingUp,
    label: "نسبة من ينتقلون إلى خطوة دعم لاحقة",
    sub: "مؤشر التحويل الفعلي",
    color: "#2BBDB6",
    bg: "#DFF3F1",
  },
  {
    icon: Clock,
    label: "الزمن بين القلق الأول وأول خطوة واضحة",
    sub: "مؤشر تقليص الفجوة الزمنية",
    color: "#F4C46A",
    bg: "#FFFBEB",
  },
  {
    icon: Target,
    label: "مدى شعور المستخدم بأن الشرح الأولي ساعده على فهم أوضح",
    sub: "مؤشر جودة الفهم",
    color: "#8B5CF6",
    bg: "#F5F3FF",
  },
];

// ─── Main Component ────────────────────────────────────────────────
export default function ImpactSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll(".fade-in-up").forEach((el, i) => {
              setTimeout(() => el.classList.add("visible"), i * 100);
            });
          }
        });
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="impact"
      ref={sectionRef}
      className="py-20 lg:py-28 relative overflow-hidden"
      style={{ background: "#243B53" }}
    >
      {/* Background image overlay */}
      <div
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage: `url(https://d2xsxph8kpxj0f.cloudfront.net/310519663154655019/XUztTXmhcQeCV4Ng5pyz4t/impact-bg-2BbMJCQeGzXF9BiHauyJLW.webp)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Gradient overlays */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.12) 0%, rgba(20,184,166,0.08) 100%)" }}
      />
      <div
        className="absolute top-0 left-0 right-0 h-24"
        style={{ background: "linear-gradient(to bottom, #243B53, transparent)" }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-24"
        style={{ background: "linear-gradient(to top, #243B53, transparent)" }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Section Header ─────────────────────────────────────── */}
        <div className="text-center mb-16 fade-in-up">
          <span
            className="section-label block mb-3"
            style={{ color: "#2BBDB6" }}
          >
            لماذا يهم هذا؟
          </span>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-5"
            style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900 }}
          >
            أثر{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #2BBDB6 0%, #1E4E8C 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              الفهم المبكر
            </span>
          </h2>
          <p
            className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed"
            style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.8 }}
          >
            الفهم المبكر لمؤشرات صعوبات التعلم وفرط الحركة وتشتت الانتباه ليس رفاهية —
            بل هو الخطوة التي تُغيّر مسار الطفل وأسرته.
          </p>
        </div>

        {/* ── Need Context (حجم الحاجة) ──────────────────────────── */}
        <div className="grid sm:grid-cols-3 gap-5 mb-14">
          {needContext.map((item, index) => (
            <div
              key={index}
              className="fade-in-up text-center p-6 rounded-2xl group hover:-translate-y-1 transition-transform duration-200"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                backdropFilter: "blur(10px)",
              }}
            >
              {/* Frame tag */}
              <div className="mb-3">
                <span
                  className="text-xs px-2.5 py-1 rounded-full font-semibold"
                  style={{
                    color: item.color,
                    background: `${item.color}18`,
                    border: `1px solid ${item.color}30`,
                    fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                  }}
                >
                  {item.frame}
                </span>
              </div>

              {/* Value */}
              <div
                className="text-3xl lg:text-4xl font-black mb-3"
                style={{
                  fontFamily: "'Cairo', sans-serif",
                  fontWeight: 900,
                  color: item.color,
                  lineHeight: 1.2,
                }}
              >
                {item.value}
              </div>

              {/* Label */}
              <p
                className="text-sm text-slate-300 leading-relaxed mb-3"
                style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.7 }}
              >
                {item.label}
              </p>

              {/* Note */}
              <p
                className="text-xs text-slate-500 leading-relaxed"
                style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.6 }}
              >
                {item.note}
              </p>
            </div>
          ))}
        </div>

        {/* ── Impact Categories ──────────────────────────────────── */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
          {impactPoints.map((point, index) => {
            const Icon = point.icon;
            return (
              <div
                key={index}
                className="fade-in-up p-5 rounded-2xl hover:-translate-y-1 transition-transform duration-200"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: `${point.color}18`, border: `1px solid ${point.color}25` }}
                >
                  <Icon size={18} style={{ color: point.color }} />
                </div>
                <h3
                  className="text-base font-bold text-white mb-2"
                  style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 700 }}
                >
                  {point.title}
                </h3>
                <p
                  className="text-sm text-slate-400 leading-relaxed"
                  style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.7 }}
                >
                  {point.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* ── Measurable Intent Layer ────────────────────────────── */}
        <div
          className="fade-in-up rounded-3xl p-7 lg:p-10"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(12px)",
          }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-3">
              <Target size={16} style={{ color: "#2BBDB6" }} />
              <span
                className="text-sm font-bold"
                style={{ color: "#2BBDB6", fontFamily: "'IBM Plex Sans Arabic', sans-serif", letterSpacing: "0.04em" }}
              >
                مؤشرات الأثر التي نتابعها
              </span>
            </div>
            <h3
              className="text-xl sm:text-2xl font-black text-white mb-3"
              style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900 }}
            >
              ما الذي تستهدف المنصة قياسه
            </h3>
            <p
              className="text-sm text-slate-400 max-w-xl mx-auto"
              style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.8 }}
            >
              هذه ليست إنجازات مؤكدة — بل مؤشرات الأثر التي نبني عليها قرارات التطوير ونسعى لتحقيقها.
            </p>
          </div>

          {/* KPI Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {measurableTargets.map((kpi, index) => {
              const Icon = kpi.icon;
              return (
                <div
                  key={index}
                  className="p-4 rounded-2xl"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: `1px solid ${kpi.color}20`,
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                    style={{ background: `${kpi.color}15` }}
                  >
                    <Icon size={16} style={{ color: kpi.color }} />
                  </div>
                  <p
                    className="text-sm text-slate-200 leading-relaxed mb-2"
                    style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.7, fontWeight: 500 }}
                  >
                    {kpi.label}
                  </p>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{
                      color: kpi.color,
                      background: `${kpi.color}15`,
                      fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                    }}
                  >
                    {kpi.sub}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Disclaimer */}
          <div
            className="mt-7 pt-6 text-center"
            style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
          >
            <p
              className="text-xs text-slate-500"
              style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.8 }}
            >
              تشخيصي منصة فحص أولي مجانية — لا تُصدر تشخيصاً طبياً أو نفسياً رسمياً.
              نتائج الفحص مؤشرات توجيهية تُساعد الأسرة على معرفة الخطوة التالية بثقة.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
