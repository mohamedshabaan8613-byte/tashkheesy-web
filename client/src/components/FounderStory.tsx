/*
 * تشخيصي FounderStory — قسم "لماذا بنينا تشخيصي"
 * Design: Light editorial — #F8FAFC background, warm accents
 * Tone: Human, mission-driven, warm, credible, non-promotional
 * Purpose: يُجيب على سؤال المحكم والأسرة: لماذا يوجد هذا المنتج؟
 * Palette: consistent with platform — #0F172A text, #2563EB accent, #14B8A6 secondary
 */
import { useEffect, useRef, useState } from "react";
import { Heart, Eye, Compass, ArrowLeft } from "lucide-react";

const pillars = [
  {
    icon: Eye,
    title: "كثير من الأسر تلاحظ — لكن لا تعرف من أين تبدأ",
    body:
      "الأهل يرون طفلهم يُعاني في القراءة أو يتشتت في الصف أو يبذل جهداً مضاعفاً دون نتيجة. لكن الخطوة التالية ليست واضحة — هل أتحدث مع المعلمة؟ هل أزور طبيباً؟ هل ما يحدث طبيعي؟",
    color: "#2563EB",
    bg: "#EFF6FF",
    border: "#BFDBFE",
  },
  {
    icon: Heart,
    title: "صعوبات التعلم تُفهَم في وقت متأخر جداً",
    body:
      "في كثير من الحالات، يمر الطفل بسنوات دراسية كاملة قبل أن يُفهَم ما يواجهه فعلاً. وفي هذه السنوات، يتراكم الإحساس بالإخفاق — وليس لأن الطفل لا يُحاول، بل لأن أحداً لم يُقدّم له الصورة الكاملة في الوقت المناسب.",
    color: "#14B8A6",
    bg: "#F0FDFA",
    border: "#99F6E4",
  },
  {
    icon: Compass,
    title: "تشخيصي بُنيت لتكون الخطوة الأولى الأكثر وضوحاً",
    body:
      "لا نُصدر أحكاماً ولا نضع تصنيفات. نُقدّم فحصاً أولياً مدعوماً بالذكاء الاصطناعي يُساعد الأسرة على فهم ما تلاحظه، ويُوجّهها نحو الدعم المناسب — بلغة عربية دافئة، وبسرية تامة، وبدون قلق.",
    color: "#F59E0B",
    bg: "#FFFBEB",
    border: "#FDE68A",
  },
];

export default function FounderStory() {
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      dir="rtl"
      className="relative overflow-hidden py-24"
      style={{ background: "#F8FAFC" }}
    >
      {/* Subtle top border accent */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, #2563EB30, #14B8A630, transparent)" }}
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section label */}
        <div
          className={`flex justify-center mb-10 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          style={{ transitionDelay: "0ms" }}
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
            style={{
              background: "rgba(37,99,235,0.06)",
              border: "1px solid rgba(37,99,235,0.15)",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "#2563EB" }}
            />
            <span
              className="text-xs font-semibold text-blue-700"
              style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", letterSpacing: "0.04em" }}
            >
              لماذا بنينا تشخيصي
            </span>
          </div>
        </div>

        {/* Main headline */}
        <div
          className={`text-center mb-6 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          style={{ transitionDelay: "100ms" }}
        >
          <h2
            className="text-4xl sm:text-5xl font-black text-slate-900 mb-5"
            style={{
              fontFamily: "'Cairo', sans-serif",
              fontWeight: 900,
              lineHeight: 1.25,
            }}
          >
            وراء كل طفل يُعاني في صمت
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, #2563EB 0%, #14B8A6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              أسرة تبحث عن إجابة
            </span>
          </h2>
          <p
            className="text-lg text-slate-500 max-w-2xl mx-auto"
            style={{
              fontFamily: "'IBM Plex Sans Arabic', sans-serif",
              lineHeight: 1.85,
              fontWeight: 400,
            }}
          >
            صعوبات التعلم لا تظهر دائماً بوضوح — وكثيراً ما تُفسَّر خطأً كتقصير أو كسل أو ضعف تركيز.
            تشخيصي وُجدت لتُغيّر هذه المعادلة.
          </p>
        </div>

        {/* Three pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {pillars.map((pillar, i) => {
            const Icon = pillar.icon;
            return (
              <div
                key={i}
                className={`rounded-3xl p-7 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
                style={{
                  transitionDelay: `${200 + i * 120}ms`,
                  background: pillar.bg,
                  border: `1px solid ${pillar.border}`,
                }}
              >
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center mb-5"
                  style={{
                    background: "white",
                    border: `1px solid ${pillar.border}`,
                    boxShadow: `0 2px 8px ${pillar.color}18`,
                  }}
                >
                  <Icon size={20} style={{ color: pillar.color }} />
                </div>
                <h3
                  className="text-base font-bold text-slate-900 mb-3 leading-snug"
                  style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 700 }}
                >
                  {pillar.title}
                </h3>
                <p
                  className="text-sm text-slate-600 leading-relaxed"
                  style={{
                    fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                    lineHeight: 1.85,
                  }}
                >
                  {pillar.body}
                </p>
              </div>
            );
          })}
        </div>

        {/* Mission statement card */}
        <div
          className={`max-w-3xl mx-auto transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          style={{ transitionDelay: "580ms" }}
        >
          <div
            className="rounded-3xl p-8 relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #0F172A 0%, #1E3A5F 60%, #0F4C4C 100%)",
              boxShadow: "0 20px 60px rgba(15,23,42,0.18)",
            }}
          >
            {/* Subtle glow */}
            <div
              className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
              style={{
                background: "radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)",
                transform: "translate(30%, -30%)",
              }}
            />
            <div
              className="absolute bottom-0 left-0 w-48 h-48 rounded-full pointer-events-none"
              style={{
                background: "radial-gradient(circle, rgba(20,184,166,0.1) 0%, transparent 70%)",
                transform: "translate(-20%, 20%)",
              }}
            />

            <div className="relative flex flex-col sm:flex-row items-start gap-6">
              {/* Accent bar */}
              <div
                className="hidden sm:block w-1 rounded-full flex-shrink-0 self-stretch"
                style={{ background: "linear-gradient(180deg, #60A5FA, #34D399)", minHeight: "80px" }}
              />

              <div className="flex-1">
                <p
                  className="text-lg sm:text-xl font-semibold text-white mb-4 leading-relaxed"
                  style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 600, lineHeight: 1.7 }}
                >
                  تشخيصي لا تُصدر أحكاماً — بل تُنير الطريق.
                  <br />
                  <span
                    className="font-normal"
                    style={{ color: "#93C5FD", fontFamily: "'IBM Plex Sans Arabic', sans-serif", fontSize: "0.95rem" }}
                  >
                    نُقدّم خطوة أولى أكثر وضوحاً لكل أسرة تلاحظ شيئاً ما ولا تعرف من أين تبدأ — بلغة عربية دافئة، وبسرية تامة، وبدون الحاجة إلى انتظار أشهر أو دفع آلاف الريالات.
                  </span>
                </p>

                {/* Three guardrails */}
                <div className="flex flex-wrap gap-3">
                  {[
                    "فحص أولي، ليس تشخيصاً رسمياً",
                    "الذكاء الاصطناعي يدعم الفهم",
                    "المتخصص هو الخطوة التالية",
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                      style={{
                        background: "rgba(255,255,255,0.07)",
                        border: "1px solid rgba(255,255,255,0.12)",
                      }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ background: i === 0 ? "#60A5FA" : i === 1 ? "#34D399" : "#FCD34D" }}
                      />
                      <span
                        className="text-xs text-slate-300"
                        style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                      >
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="relative mt-7 pt-6" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <p
                  className="text-sm text-slate-400 text-center sm:text-right"
                  style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                >
                  هل تلاحظ مؤشرات لدى طفلك أو طالبك؟ شاهد كيف تبدو نتائج الفحص قبل أن تبدأ.
                </p>
                <a
                  href="/result-demo"
                  className="group flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex-shrink-0"
                  style={{
                    color: "#94a3b8",
                    border: "1px solid rgba(148,163,184,0.25)",
                    fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                    background: "rgba(255,255,255,0.04)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.color = "#e2e8f0";
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(148,163,184,0.45)";
                    (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.color = "#94a3b8";
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(148,163,184,0.25)";
                    (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
                  }}
                >
                  ✨ شاهد نموذج النتائج
                </a>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Subtle bottom border accent */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, #14B8A630, #2563EB30, transparent)" }}
      />
    </section>
  );
}
