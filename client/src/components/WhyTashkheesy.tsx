/*
 * تشخيصي WhyTashkheesy — Sprint 2 Refinement
 *
 * Changes from previous version:
 * - Removed "من نحن" trust note block (belongs in Footer/About, not here)
 * - Simplified main paragraph — shorter, dual-audience (children + adults)
 * - Simplified value grid labels — shorter, more scannable
 * - Reduced section vertical padding (py-20 → py-16 lg:py-20)
 * - Kept: two-column layout, reasons cards, value grid, fade-in animation
 * - Kept: all 4 reasons cards unchanged (content is accurate and appropriate)
 * - Kept: id="why-tashkheesy" for anchor navigation
 */

import { useEffect, useRef } from "react";
import { Brain, BookOpen, Languages, Compass } from "lucide-react";

const reasons = [
  {
    icon: Brain,
    title: "تحليل أولي مدعوم بالذكاء الاصطناعي",
    desc: "بعد إتمام الفحص، يُنظّم الذكاء الاصطناعي المؤشرات ويشرحها بلغة عربية واضحة — يساعدك على فهم ما رصده الفحص دون أن يُصدر حكماً أو تشخيصاً رسمياً.",
    color: "#1E4E8C",
    bg: "#DFF3F1",
  },
  {
    icon: BookOpen,
    title: "مؤشرات القراءة والكتابة والانتباه والتركيز",
    desc: "الفحص يُغطي مؤشرات صعوبات التعلم وفرط الحركة وتشتت الانتباه — بما فيها تحديات القراءة والكتابة والانتباه والتركيز — بصورة منظمة وقابلة للفهم.",
    color: "#F4C46A",
    bg: "#FFFBEB",
  },
  {
    icon: Languages,
    title: "تجربة مبنية للسياق العربي",
    desc: "المحتوى مكتوب بالعربية ومصمم لمراعاة الحساسية الثقافية للأسرة العربية — دون تعقيد طبي أو لغة أكاديمية مُربكة.",
    color: "#2BBDB6",
    bg: "#DFF3F1",
  },
  {
    icon: Compass,
    title: "خطوة أولى منظمة بدل الحيرة",
    desc: "بدلاً من البدء من الصفر أو الانتظار، تحصل على فهم أولي واضح للمؤشرات وتوجيه نحو الخطوة التالية الأكثر ملاءمة لحالتك.",
    color: "#1E4E8C",
    bg: "#DFF3F1",
  },
];

const valueGrid = [
  {
    value: "مجاني",
    label: "فحص أولي بدون أي رسوم",
    color: "#2BBDB6",
  },
  {
    value: "عربي",
    label: "شرح بالعربية — لغةً وثقافةً",
    color: "#1E4E8C",
  },
  {
    value: "٦ محاور",
    label: "تغطية صعوبات التعلم وفرط الحركة",
    color: "#F4C46A",
  },
  {
    value: "خطوة واضحة",
    label: "توجيه للخطوة التالية الأنسب",
    color: "#1E4E8C",
  },
];

export default function WhyTashkheesy() {
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
      id="why-tashkheesy"
      ref={sectionRef}
      className="py-16 lg:py-20"
      style={{ background: "#F4EFE8" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-start">
          {/* Right column: Heading + Paragraph + Value Grid */}
          <div>
            <div className="fade-in-up mb-3">
              <span className="section-label">لماذا تشخيصي؟</span>
            </div>

            <h2
              className="fade-in-up text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 mb-5"
              style={{
                fontFamily: "'Cairo', sans-serif",
                fontWeight: 900,
                lineHeight: 1.25,
              }}
            >
              خطوتك الأولى{" "}
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
              className="fade-in-up text-base text-slate-600 mb-8"
              style={{
                fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                lineHeight: 1.85,
              }}
            >
              تشخيصي تساعدك على الانتقال من عدم اليقين إلى فهم أولي أوضح
              لمؤشرات صعوبات التعلم وفرط الحركة — سواء كنت والداً يبحث عن إجابات
              لطفله، أو بالغاً يسعى لفهم تجربته الخاصة.
            </p>

            {/* Practical Value Grid */}
            <div className="fade-in-up grid grid-cols-2 gap-3">
              {valueGrid.map((item, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div
                    className="text-xl font-black mb-1.5"
                    style={{
                      fontFamily: "'Cairo', sans-serif",
                      fontWeight: 900,
                      color: item.color,
                    }}
                  >
                    {item.value}
                  </div>
                  <div
                    className="text-xs text-slate-500 leading-snug"
                    style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                  >
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Left column: Feature/Value cards */}
          <div className="grid grid-cols-1 gap-3">
            {reasons.map((reason, index) => {
              const Icon = reason.icon;
              return (
                <div
                  key={index}
                  className="fade-in-up group flex items-start gap-4 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105"
                    style={{ background: reason.bg }}
                  >
                    <Icon size={19} style={{ color: reason.color }} />
                  </div>

                  <div>
                    <h3
                      className="text-sm font-bold text-slate-900 mb-1"
                      style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 700 }}
                    >
                      {reason.title}
                    </h3>
                    <p
                      className="text-xs text-slate-600"
                      style={{
                        fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                        lineHeight: 1.7,
                      }}
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
