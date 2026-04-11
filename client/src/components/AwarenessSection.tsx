/*
 * تشخيصي AwarenessSection — Editorial Healthcare
 * Signs & signals: empathetic, informative, not alarming
 * Soft card grid with icons and warm copy
 * Tone: "we understand, we're here to help"
 */

import { useEffect, useRef } from "react";
import { BookOpen, Brain, GraduationCap, Clock, Heart, MessageCircle } from "lucide-react";

const signs = [
  {
    icon: BookOpen,
    title: "صعوبة في القراءة",
    desc: "يقضي وقتاً طويلاً في قراءة نصوص بسيطة، أو يخلط بين الحروف المتشابهة دون أن يُدرك السبب.",
    color: "#2563EB",
    bg: "#EFF6FF",
    borderColor: "rgba(37,99,235,0.15)",
  },
  {
    icon: Brain,
    title: "تشتت الانتباه",
    desc: "يجد صعوبة في التركيز لفترات طويلة، أو ينتقل من نشاط لآخر بسرعة حتى في الأشياء التي يُحبها.",
    color: "#14B8A6",
    bg: "#F0FDFA",
    borderColor: "rgba(20,184,166,0.15)",
  },
  {
    icon: GraduationCap,
    title: "إحباط مدرسي",
    desc: "يشعر بالإحباط من المدرسة رغم بذل الجهد، أو يتجنب الواجبات المنزلية دون سبب واضح.",
    color: "#F59E0B",
    bg: "#FFFBEB",
    borderColor: "rgba(245,158,11,0.15)",
  },
  {
    icon: Clock,
    title: "تأخر في الوصول إلى الدعم المناسب",
    desc: "مرت سنوات دون فهم واضح، وتراكمت الفجوات الأكاديمية تدريجياً دون أن يعرف أحد السبب.",
    color: "#2563EB",
    bg: "#EFF6FF",
    borderColor: "rgba(37,99,235,0.15)",
  },
  {
    icon: Heart,
    title: "تراجع الثقة بالنفس",
    desc: "بدأ يقارن نفسه بزملائه وأصبح يتشكك في قدراته الحقيقية، رغم أنه يملك إمكانات كبيرة.",
    color: "#14B8A6",
    bg: "#F0FDFA",
    borderColor: "rgba(20,184,166,0.15)",
  },
  {
    icon: MessageCircle,
    title: "ملاحظات المعلمين",
    desc: "تتكرر ملاحظات المعلمين حول الأداء أو السلوك، وأنت تشعر أن هناك شيئًا ما لا تراه بوضوح.",
    color: "#F59E0B",
    bg: "#FFFBEB",
    borderColor: "rgba(245,158,11,0.15)",
  },
];

export default function AwarenessSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll(".fade-in-up").forEach((el, i) => {
              setTimeout(() => el.classList.add("visible"), i * 80);
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
      id="awareness"
      ref={sectionRef}
      className="py-20 lg:py-28"
      style={{ background: "#F8FAFC" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-14 fade-in-up">
          <span className="section-label block mb-3">مؤشرات تستحق الانتباه</span>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 mb-5"
            style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900 }}
          >
            هل تلاحظ شيئاً{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #2563EB 0%, #14B8A6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              مختلفاً؟
            </span>
          </h2>
          <p
            className="text-lg text-slate-600 leading-relaxed"
            style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.85 }}
          >
            هذه المؤشرات لا تعني بالضرورة وجود مشكلة، لكنها تستحق الفهم والاستيضاح.
            الوضوح المبكر يُحدث فرقاً حقيقياً في مسيرة طفلك.
          </p>
        </div>

        {/* Signs Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
          {signs.map((sign, index) => {
            const Icon = sign.icon;
            return (
              <div
                key={index}
                className="fade-in-up group p-6 rounded-2xl bg-white transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
                style={{
                  border: `1px solid ${sign.borderColor}`,
                  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                }}
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-105"
                  style={{ background: sign.bg }}
                >
                  <Icon size={22} style={{ color: sign.color }} />
                </div>
                <h3
                  className="text-base font-bold text-slate-900 mb-2"
                  style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 700 }}
                >
                  {sign.title}
                </h3>
                <p
                  className="text-sm text-slate-600 leading-relaxed"
                  style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.75 }}
                >
                  {sign.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Reassurance note */}
        <div className="fade-in-up text-center">
          <div
            className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl"
            style={{
              background: "linear-gradient(135deg, rgba(37,99,235,0.06) 0%, rgba(20,184,166,0.06) 100%)",
              border: "1px solid rgba(37,99,235,0.12)",
            }}
          >
            <span className="text-xl">💡</span>
            <p
              className="text-sm text-slate-700 font-medium"
              style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
            >
              تشخيصي ليس تشخيصاً طبياً — بل هو خطوتك الأولى نحو الفهم والوضوح.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
