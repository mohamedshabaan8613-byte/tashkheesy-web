/*
 * تشخيصي HowItWorks — Editorial Healthcare
 * 4-step visual journey: Screening → Results → Book → Follow-up
 * Large decorative Arabic numerals, connected steps, soft cards
 * Alternating layout for visual interest
 */

import { useEffect, useRef } from "react";
import { ClipboardList, FileText, CalendarCheck, TrendingUp, ArrowLeft } from "lucide-react";

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
  },
  {
    number: "٢",
    numEn: "02",
    icon: FileText,
    title: "احصل على نتائجك فوراً",
    desc: "تقرير واضح ومفصَّل يشرح ما لاحظناه، مع توصيات أولية مكتوبة بلغة سهلة وغير تقنية.",
    detail: "النتائج فورية — بمجرد إتمام الفحص",
    color: "#14B8A6",
    bg: "#F0FDFA",
    gradient: "from-teal-500 to-teal-600",
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
  },
  {
    number: "٤",
    numEn: "04",
    icon: TrendingUp,
    title: "خطة متابعة مستمرة",
    desc: "لا تنتهي رحلتك عند التشخيص — نرافقك بخطة دعم واضحة تشمل الأسرة والمدرسة.",
    detail: "تقارير دورية وتحديث مستمر لخطة الدعم",
    color: "#2563EB",
    bg: "#EFF6FF",
    gradient: "from-blue-500 to-teal-500",
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
            من أول سؤال في الفحص إلى خطة دعم متكاملة — نرافقك في كل خطوة.
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
                {/* Connector arrow (desktop, not last) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:flex absolute top-8 left-0 items-center justify-center w-full z-10 pointer-events-none"
                    style={{ transform: "translateX(-50%)" }}>
                  </div>
                )}

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

                  {/* Step number badge */}
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white mb-4 relative z-10"
                    style={{
                      background: step.color,
                      fontFamily: "'Cairo', sans-serif",
                    }}
                  >
                    {index + 1}
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

        {/* CTA */}
        <div className="fade-in-up text-center">
          <a
            href="#screening"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-white font-bold text-base transition-all duration-200 hover:-translate-y-1"
            style={{
              background: "linear-gradient(135deg, #2563EB 0%, #14B8A6 100%)",
              fontFamily: "'Cairo', sans-serif",
              fontWeight: 700,
              boxShadow: "0 6px 20px rgba(37,99,235,0.3)",
            }}
          >
            ابدأ رحلتك الآن — مجاناً
            <ArrowLeft size={18} />
          </a>
        </div>
      </div>
    </section>
  );
}
