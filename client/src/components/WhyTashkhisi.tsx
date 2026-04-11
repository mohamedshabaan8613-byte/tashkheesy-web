/*
 * تشخيصي WhyTashkhisi — Editorial Healthcare
 * Asymmetric layout: large text + stats on right, feature cards on left
 * Explains the platform's unique value proposition
 */

import { useEffect, useRef } from "react";
import { Lightbulb, MapPin, Languages, ArrowRightLeft } from "lucide-react";

const reasons = [
  {
    icon: Lightbulb,
    title: "وضوح مبكر يُغيّر المسار",
    desc: "الفهم المبكر لصعوبات التعلم يُمكّن الأسرة من اتخاذ قرارات صحيحة قبل تراكم الفجوات الأكاديمية.",
    color: "#F59E0B",
    bg: "#FFFBEB",
  },
  {
    icon: MapPin,
    title: "خطوتك الأولى الموثوقة",
    desc: "تشخيصي ليس تطبيقاً عشوائياً — بل مسار منظم مبني على أسس علمية وتوجيه من متخصصين.",
    color: "#2563EB",
    bg: "#EFF6FF",
  },
  {
    icon: Languages,
    title: "تجربة عربية حقيقية",
    desc: "محتوى مكتوب بالعربية، يراعي السياق الثقافي، ويتحدث بلغة الأسرة العربية دون تعقيد.",
    color: "#14B8A6",
    bg: "#F0FDFA",
  },
  {
    icon: ArrowRightLeft,
    title: "من الحيرة إلى الفعل",
    desc: "نحوّل القلق والتساؤلات إلى خطوات واضحة وقابلة للتنفيذ — دون إرهاق أو تعقيد.",
    color: "#2563EB",
    bg: "#EFF6FF",
  },
];

const stats = [
  { value: "١ من كل ٥", label: "أطفال قد يواجهون تحديات في التعلم أو الانتباه — تقدير عالمي" },
  { value: "سنوات", label: "قد تفصل بين أول قلق وأول خطوة دعم — في غياب بداية واضحة" },
  { value: "الفهم أولاً", label: "قبل أي تدخل رسمي — الوضوح يُغيّر كيف تتصرف الأسرة" },
  { value: "عربي ١٠٠٪", label: "محتوى مبني للسياق العربي — لغةً وثقافةً وحساسيةً" },
];

export default function WhyTashkhisi() {
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
      id="why-tashkhisi"
      ref={sectionRef}
      className="py-20 lg:py-28"
      style={{ background: "#F8FAFC" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Right: Text + Stats */}
          <div>
            <div className="fade-in-up mb-4">
              <span className="section-label">لماذا تشخيصي؟</span>
            </div>
            <h2
              className="fade-in-up text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 mb-6"
              style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900, lineHeight: 1.2 }}
            >
              لأن كل طفل{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #2563EB 0%, #14B8A6 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                يستحق الفهم
              </span>
            </h2>
            <p
              className="fade-in-up text-lg text-slate-600 leading-relaxed mb-10"
              style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.85 }}
            >
              في كثير من الأحيان، يعاني الأطفال في صمت لسنوات قبل أن يحصلوا على الدعم المناسب.
              تشخيصي وُجد ليكون الجسر الذي يختصر هذا الطريق — بأمان وثقة وبلغتنا العربية.
            </p>

            {/* Stats Grid */}
            <div className="fade-in-up grid grid-cols-2 gap-4">
              {stats.map((stat, i) => (
                <div
                  key={i}
                  className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div
                    className="text-2xl font-black mb-2"
                    style={{
                      fontFamily: "'Cairo', sans-serif",
                      fontWeight: 900,
                      background: "linear-gradient(135deg, #2563EB 0%, #14B8A6 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {stat.value}
                  </div>
                  <div
                    className="text-xs text-slate-500 leading-snug"
                    style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Left: Feature cards */}
          <div className="grid grid-cols-1 gap-4">
            {reasons.map((reason, index) => {
              const Icon = reason.icon;
              return (
                <div
                  key={index}
                  className="fade-in-up group flex items-start gap-4 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105"
                    style={{ background: reason.bg }}
                  >
                    <Icon size={22} style={{ color: reason.color }} />
                  </div>
                  <div>
                    <h3
                      className="text-base font-bold text-slate-900 mb-1.5"
                      style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 700 }}
                    >
                      {reason.title}
                    </h3>
                    <p
                      className="text-sm text-slate-600 leading-relaxed"
                      style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.7 }}
                    >
                      {reason.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
