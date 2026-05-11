/*
 * تشخيصي AwarenessSection — Sprint 2 Refinement
 *
 * Changes from previous version:
 * - Section title: "هل تلاحظ شيئاً مختلفاً؟" → "هل تظهر هذه المؤشرات لديك أو لدى طفلك؟"
 * - Supporting paragraph: updated to reflect both children AND adults
 * - Card descriptions: rewritten to be dual-audience (child + adult/self)
 * - Removed "إحباط مدرسي" (child-only) → replaced with "صعوبة التركيز والتنظيم" (applies to both)
 * - Removed "ملاحظات المعلمين" (child-only) → replaced with "صعوبة تنظيم المهام" (applies to both)
 * - Reassurance note: updated to mention both children and adults
 * - Kept: 6 cards max, animation system, card structure, background color
 */

import { useEffect, useRef } from "react";
import { BookOpen, Brain, Focus, Clock, Heart, ListChecks } from "lucide-react";

const signs = [
  {
    icon: BookOpen,
    title: "صعوبة في القراءة",
    desc: "قراءة النصوص تستغرق وقتاً أطول من المعتاد، أو يحدث خلط بين الحروف المتشابهة — لدى الطفل أو البالغ.",
    color: "#1E4E8C",
    bg: "#DFF3F1",
    borderColor: "rgba(37,99,235,0.12)",
  },
  {
    icon: Brain,
    title: "تشتت الانتباه",
    desc: "صعوبة في التركيز لفترات متواصلة، أو الانتقال السريع بين الأفكار والأنشطة — حتى في المواضيع المحببة.",
    color: "#2BBDB6",
    bg: "#DFF3F1",
    borderColor: "rgba(20,184,166,0.12)",
  },
  {
    icon: Focus,
    title: "صعوبة التركيز",
    desc: "التركيز يتبدد بسرعة عند أداء المهام، أو يصعب إتمام نشاط واحد دون تشتت متكرر.",
    color: "#F4C46A",
    bg: "#FFFBEB",
    borderColor: "rgba(245,158,11,0.12)",
  },
  {
    icon: Clock,
    title: "بطء الفهم أو الاستيعاب",
    desc: "يحتاج وقتاً أطول لفهم التعليمات أو استيعاب المعلومات الجديدة، دون أن يكون ذلك مرتبطاً بمستوى الذكاء.",
    color: "#1E4E8C",
    bg: "#DFF3F1",
    borderColor: "rgba(37,99,235,0.12)",
  },
  {
    icon: Heart,
    title: "تراجع الثقة بالنفس",
    desc: "المقارنة المستمرة بالآخرين وتساؤلات حول القدرات الحقيقية — رغم وجود إمكانات حقيقية لم تُفهم بعد.",
    color: "#2BBDB6",
    bg: "#DFF3F1",
    borderColor: "rgba(20,184,166,0.12)",
  },
  {
    icon: ListChecks,
    title: "صعوبة تنظيم المهام",
    desc: "صعوبة في ترتيب الأولويات وإتمام المهام بتسلسل منطقي — في الدراسة أو العمل أو الحياة اليومية.",
    color: "#F4C46A",
    bg: "#FFFBEB",
    borderColor: "rgba(245,158,11,0.12)",
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
      className="py-16 lg:py-24"
      style={{ background: "#F4EFE8" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-2xl mx-auto text-center mb-12 fade-in-up">
          <span className="section-label block mb-3">مؤشرات تستحق الانتباه</span>
          <h2
            className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 mb-4"
            style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900, lineHeight: 1.25 }}
          >
            هل تظهر هذه المؤشرات{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #1E4E8C 0%, #2BBDB6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              لديك أو لدى طفلك؟
            </span>
          </h2>
          <p
            className="text-base text-slate-600"
            style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.8 }}
          >
            هذه المؤشرات لا تعني بالضرورة وجود مشكلة — لكنها تستحق الفهم.
            الوضوح المبكر يُحدث فرقاً حقيقياً، سواء للطفل أو للبالغ.
          </p>
        </div>

        {/* Signs Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {signs.map((sign, index) => {
            const Icon = sign.icon;
            return (
              <div
                key={index}
                className="fade-in-up group p-5 rounded-2xl bg-white transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
                style={{
                  border: `1px solid ${sign.borderColor}`,
                  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-105"
                  style={{ background: sign.bg }}
                >
                  <Icon size={19} style={{ color: sign.color }} />
                </div>
                <h3
                  className="text-sm font-bold text-slate-900 mb-1.5"
                  style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 700 }}
                >
                  {sign.title}
                </h3>
                <p
                  className="text-xs text-slate-600"
                  style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.7 }}
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
            className="inline-flex items-center gap-2.5 px-5 py-3.5 rounded-2xl"
            style={{
              background: "rgba(37,99,235,0.05)",
              border: "1px solid rgba(37,99,235,0.10)",
            }}
          >
            <span className="text-base">💡</span>
            <p
              className="text-sm text-slate-700"
              style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
            >
              تشخيصي ليس تشخيصاً طبياً — بل خطوتك الأولى نحو الفهم، للطفل والبالغ على حدٍّ سواء.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
