/*
 * تشخيصي HowItWorks — Sprint 2 Refinement
 *
 * Changes from previous version:
 * - Reduced from 4 steps to 3 steps (merged "احجز مع متخصص" + "توجيه نحو الخطوة التالية" into one)
 * - Removed heavy dark AI banner (was visually dominant and repeated HeroSection messaging)
 * - Removed ArrowLeft icon (not needed with 3-column layout)
 * - Simplified step descriptions — shorter, clearer
 * - Added a lightweight AI transparency note (replaces the heavy banner)
 * - Kept: fade-in animation system, step number badges, detail tags, CTA button
 * - Kept: id="how-it-works" for anchor navigation from Hero CTA
 */

import { useEffect, useRef } from "react";
import { ClipboardList, Brain, Compass, Sparkles, Shield, Info } from "lucide-react";

const steps = [
  {
    number: "١",
    icon: ClipboardList,
    title: "أجب على أسئلة الفحص",
    desc: "فحص منظم بخطوات بسيطة، يُغطي مؤشرات القراءة والكتابة والانتباه والتركيز.",
    detail: "مجاني • سري • للأطفال والبالغين",
    color: "#1E4E8C",
    bg: "#DFF3F1",
    gradient: "from-blue-500 to-blue-600",
    aiTag: null,
  },
  {
    number: "٢",
    icon: Brain,
    title: "احصل على شرح أولي",
    desc: "يساعد الذكاء الاصطناعي في تنظيم المؤشرات وشرحها بالعربية، دون إصدار حكم أو تشخيص رسمي.",
    detail: "شرح أولي — ليس تشخيصاً رسمياً",
    color: "#2BBDB6",
    bg: "#DFF3F1",
    gradient: "from-teal-500 to-teal-600",
    aiTag: "مدعوم بالذكاء الاصطناعي",
  },
  {
    number: "٣",
    icon: Compass,
    title: "اعرف خطوتك التالية",
    desc: "بناءً على نتيجة الفحص، نساعدك على فهم الخطوة الأنسب — مثل مراجعة النتيجة مع متخصص عند الحاجة.",
    detail: "توجيه واضح بدلاً من الحيرة",
    color: "#F4C46A",
    bg: "#FFFBEB",
    gradient: "from-amber-500 to-amber-600",
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
      className="py-16 lg:py-24 bg-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 fade-in-up">
          <span className="section-label block mb-3">رحلتك معنا</span>
          <h2
            className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 mb-4"
            style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900 }}
          >
            ثلاث خطوات{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #1E4E8C 0%, #2BBDB6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              نحو الوضوح
            </span>
          </h2>
          <p
            className="text-base text-slate-600 max-w-xl mx-auto"
            style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.8 }}
          >
            من أول سؤال في الفحص إلى فهم النتائج والخطوة التالية — رحلة واضحة ومنظمة.
          </p>
        </div>

        {/* Steps Grid — 3 columns */}
        <div className="grid sm:grid-cols-3 gap-5 mb-10">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="fade-in-up group relative">
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
                      style={{ background: step.color, fontFamily: "'Cairo', sans-serif" }}
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
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-gradient-to-br ${step.gradient} shadow-md relative z-10`}
                  >
                    <Icon size={22} className="text-white" />
                  </div>

                  {/* Content */}
                  <h3
                    className="text-base font-bold text-slate-900 mb-2 relative z-10"
                    style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 700 }}
                  >
                    {step.title}
                  </h3>
                  <p
                    className="text-sm text-slate-600 mb-4 flex-1 relative z-10"
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

        {/* Lightweight AI transparency note — replaces heavy dark banner */}
        <div
          className="fade-in-up rounded-2xl px-5 py-4 mb-8 flex flex-wrap items-center gap-4"
          style={{
            background: "rgba(37,99,235,0.04)",
            border: "1px solid rgba(37,99,235,0.10)",
          }}
        >
          <div className="flex items-center gap-2">
            <Brain size={16} style={{ color: "#1E4E8C", flexShrink: 0 }} />
            <span
              className="text-sm font-bold text-slate-800"
              style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 700 }}
            >
              شفافية الذكاء الاصطناعي
            </span>
          </div>
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
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
                  style={{
                    background: "rgba(255,255,255,0.8)",
                    border: "1px solid rgba(37,99,235,0.08)",
                  }}
                >
                  <ItemIcon size={11} style={{ color: "#1E4E8C", flexShrink: 0 }} />
                  <span
                    className="text-xs text-slate-600"
                    style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                  >
                    {item.text}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="fade-in-up text-center">
          <a
            href="/start"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl text-white font-bold text-sm transition-all duration-200 hover:-translate-y-1"
            style={{
              background: "linear-gradient(135deg, #1E4E8C 0%, #2BBDB6 100%)",
              fontFamily: "'Cairo', sans-serif",
              fontWeight: 700,
              boxShadow: "0 6px 20px rgba(37,99,235,0.25)",
            }}
          >
            ابدأ الفحص الأولي — مجاناً
          </a>
        </div>
      </div>
    </section>
  );
}
