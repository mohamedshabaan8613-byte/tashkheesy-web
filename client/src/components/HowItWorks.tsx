/*
 * تشخيصي HowItWorks — Editorial Healthcare
 * 4-step visual journey: Screening → AI Results → Book → Follow-up
 * AI badge on step 2, AI transparency banner after steps
 * Large decorative Arabic numerals, connected steps, soft cards
 */

import { useEffect, useRef } from "react";
import { ClipboardList, FileText, CalendarCheck, TrendingUp, ArrowLeft, Brain, Sparkles, Shield, Info } from "lucide-react";

const steps = [
  {
    number: "١",
    numEn: "01",
    icon: ClipboardList,
    title: "أجب على أسئلة الفحص",
    desc: "فحص منظم وموجَّه يستغرق ١٥ دقيقة فقط، مصمم بعناية من قِبل متخصصين في صعوبات التعلم والانتباه.",
    detail: "يشمل الفحص: القراءة، الكتابة، الحساب، الانتباه، والسلوك",
    color: "#2563EB",
    bg: "#EFF6FF",
    gradient: "from-blue-500 to-blue-600",
    aiTag: null,
  },
  {
    number: "٢",
    numEn: "02",
    icon: Brain,
    title: "الذكاء الاصطناعي يُحلّل إجاباتك",
    desc: "يُحلّل نظام الذكاء الاصطناعي إجاباتك فورياً ويُنشئ شرحاً مفصلاً بلغة عربية واضحة وغير مُخيفة.",
    detail: "تقرير فوري مدعوم بالذكاء الاصطناعي — يساعدك على فهم المؤشرات",
    color: "#14B8A6",
    bg: "#F0FDFA",
    gradient: "from-teal-500 to-teal-600",
    aiTag: "مدعوم بالذكاء الاصطناعي",
  },
  {
    number: "٣",
    numEn: "03",
    icon: CalendarCheck,
    title: "احجز مع متخصص",
    desc: "إذا أشارت النتائج إلى الحاجة لمزيد من التقييم، نوصلك بمتخصص معتمد يناسب حالتك.",
    detail: "متخصصون معتمدون في التربية الخاصة وعلم النفس",
    color: "#F59E0B",
    bg: "#FFFBEB",
    gradient: "from-amber-500 to-amber-600",
    aiTag: null,
  },
  {
    number: "٤",
    numEn: "04",
    icon: TrendingUp,
    title: "توجيه نحو الخطوة التالية",
    desc: "بعد فهم النتائج، نوجهك نحو الخطوة التالية المناسبة — سواء كانت حجز موعد مع متخصص أو استشارة متخصصة.",
    detail: "يوجّهك إلى الدعم المناسب بناءً على مؤشرات الفحص",
    color: "#2563EB",
    bg: "#EFF6FF",
    gradient: "from-blue-500 to-teal-500",
    aiTag: null,
  },
];

export default function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll(".fade-in-up").forEach((el, i) => {
              setTimeout(() => el.classList.add("visible"), i * 120);
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
      id="how-it-works"
      ref={sectionRef}
      className="py-20 lg:py-28 bg-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 fade-in-up">
          <span className="section-label block mb-3">رحلتك معنا</span>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 mb-5"
            style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900 }}
          >
            أربع خطوات{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #2563EB 0%, #14B8A6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              نحو الوضوح
            </span>
          </h2>
          <p
            className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed"
            style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.8 }}
          >
            من أول سؤال في الفحص إلى فهم النتائج والخطوة التالية — نرافقك في رحلة أكثر وضوحًا وطمأنينة.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-5 mb-12">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className="fade-in-up group relative"
              >
                <div
                  className="rounded-2xl p-6 h-full flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  style={{
                    background: step.bg,
                    border: `1px solid ${step.color}18`,
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* Large background number */}
                  <div
                    className="absolute top-2 left-3 text-8xl font-black select-none pointer-events-none"
                    style={{
                      fontFamily: "'Cairo', sans-serif",
                      fontWeight: 900,
                      color: step.color,
                      opacity: 0.06,
                      lineHeight: 1,
                    }}
                  >
                    {step.number}
                  </div>

                  {/* Step number badge + AI tag */}
                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{
                        background: step.color,
                        fontFamily: "'Cairo', sans-serif",
                      }}
                    >
                      {index + 1}
                    </div>
                    {step.aiTag && (
                      <div
                        className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold"
                        style={{
                          background: "rgba(20,184,166,0.12)",
                          border: "1px solid rgba(20,184,166,0.25)",
                          color: "#0f766e",
                          fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                        }}
                      >
                        <Sparkles size={10} />
                        {step.aiTag}
                      </div>
                    )}
                  </div>

                  {/* Icon */}
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 bg-gradient-to-br ${step.gradient} shadow-md relative z-10`}
                  >
                    <Icon size={26} className="text-white" />
                  </div>

                  {/* Content */}
                  <h3
                    className="text-base font-bold text-slate-900 mb-3 relative z-10"
                    style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 700 }}
                  >
                    {step.title}
                  </h3>
                  <p
                    className="text-sm text-slate-600 leading-relaxed mb-4 flex-1 relative z-10"
                    style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.7 }}
                  >
                    {step.desc}
                  </p>

                  {/* Detail tag */}
                  <div
                    className="text-xs px-3 py-1.5 rounded-xl relative z-10 font-medium"
                    style={{
                      background: "rgba(255,255,255,0.7)",
                      color: step.color,
                      fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                      border: `1px solid ${step.color}20`,
                    }}
                  >
                    {step.detail}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ─── بانر الذكاء الاصطناعي ─── */}
        <div
          className="fade-in-up rounded-3xl p-6 sm:p-8 mb-10 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #0F172A 0%, #1e3a8a 55%, #0f766e 100%)",
            boxShadow: "0 16px 48px rgba(15,23,42,0.2)",
          }}
        >
          {/* نقاط زخرفية */}
          <div
            className="absolute inset-0 pointer-events-none opacity-10"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
          <div
            className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(circle, rgba(20,184,166,0.2) 0%, transparent 70%)",
              transform: "translate(30%, -30%)",
            }}
          />
          <div className="relative flex flex-col lg:flex-row items-start lg:items-center gap-6">
            {/* الأيقونة */}
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              <Brain size={30} className="text-white" />
            </div>
            {/* المحتوى */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3
                  className="text-xl font-black text-white"
                  style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900 }}
                >
                  كيف يعمل الذكاء الاصطناعي في تشخيصي؟
                </h3>
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                  style={{ background: "rgba(16,185,129,0.2)", border: "1px solid rgba(16,185,129,0.3)" }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span
                    className="text-xs font-semibold text-emerald-300"
                    style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                  >
                    نشط
                  </span>
                </div>
              </div>
              <p
                className="text-blue-200 text-sm leading-relaxed mb-4"
                style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.8 }}
              >
                بعد إتمام الفحص، يُحلل نموذج الذكاء الاصطناعي إجاباتك عبر ٦ محاور معرفية ويُنشئ شرحاً مخصصاً بلغة عربية دافئة — يُجيب على: ما الذي رصده الفحص؟ ماذا يعني؟ لماذا يهم؟ وما الخطوة التالية؟
              </p>
              <div className="flex flex-wrap gap-3">
                {[
                  { icon: Shield, text: "فحص أولي — ليس تشخيصاً طبياً رسمياً" },
                  { icon: Info, text: "الذكاء الاصطناعي يُنظّم المؤشرات ويشرحها — لا يُصدر أحكاماً" },
                  { icon: Sparkles, text: "المتخصص هو الخطوة التالية عند الحاجة" },
                ].map((item, i) => {
                  const ItemIcon = item.icon;
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
                      style={{
                        background: "rgba(255,255,255,0.08)",
                        border: "1px solid rgba(255,255,255,0.12)",
                      }}
                    >
                      <ItemIcon size={12} className="text-teal-300" />
                      <span
                        className="text-xs text-blue-100"
                        style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                      >
                        {item.text}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            {/* زر */}
            <div className="flex-shrink-0">
              <a
                href="/ai-insights"
                className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all duration-200 hover:opacity-90 whitespace-nowrap"
                style={{
                  background: "white",
                  color: "#1e3a8a",
                  fontFamily: "'Cairo', sans-serif",
                  fontWeight: 700,
                  boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
                }}
              >
                <Brain size={15} />
                اعرف أكثر عن AI
              </a>
            </div>
          </div>
        </div>

        {/* CTA — زر واحد يقود مباشرة إلى مسار الفحص */}
        <div className="fade-in-up text-center">
          <a
            href="/start"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-white font-bold text-base transition-all duration-200 hover:-translate-y-1"
            style={{
              background: "linear-gradient(135deg, #2563EB 0%, #14B8A6 100%)",
              fontFamily: "'Cairo', sans-serif",
              fontWeight: 700,
              boxShadow: "0 6px 20px rgba(37,99,235,0.3)",
            }}
          >
            ابدأ الفحص الأولي — مجاناً
            <ArrowLeft size={18} />
          </a>
        </div>
      </div>
    </section>
  );
}
