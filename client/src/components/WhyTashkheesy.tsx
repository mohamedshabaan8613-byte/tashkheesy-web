/*
 * تشخيصي WhyTashkheesy — Value Proposition Section
 * Answers: لماذا أختار تشخيصي كخطوة أولى؟
 *
 * Role in homepage narrative:
 *   FounderStory → why it was built (emotional origin)
 *   ImpactSection → why the issue matters socially/educationally
 *   WhyTashkheesy → what practical value the platform delivers (THIS section)
 *   HowItWorks → how the process works step by step
 *
 * Content rules:
 *   - No emotional storytelling (FounderStory handles that)
 *   - No impact framing (ImpactSection handles that)
 *   - No process explanation (HowItWorks handles that)
 *   - Focus: concrete product value, specific user-facing benefits
 *
 * Stats block replaced with practical value grid (4 cards):
 *   - فحص أولي مجاني — no cost barrier
 *   - شرح أولي بالعربية — language & culture fit
 *   - فهم أوضح للمؤشرات — specific screening areas
 *   - خطوة أولى منظمة — structured next step
 *
 * Reasons cards rewritten to be product-specific:
 *   1. AI-supported analysis — responsible framing
 *   2. Specific screening areas (القراءة والكتابة والانتباه والتركيز)
 *   3. Arabic-first UX — cultural fit
 *   4. Structured next step — clarity over confusion
 *
 * Design: asymmetric two-column, light #F4EFE8 background, preserved
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
    label: "فحص أولي بدون أي رسوم — بدون حواجز للبدء",
    color: "#2BBDB6",
  },
  {
    value: "عربي",
    label: "شرح أولي بالعربية — لغةً وثقافةً وحساسيةً",
    color: "#1E4E8C",
  },
  {
    value: "٦ محاور",
    label: "تغطية مؤشرات صعوبات التعلم وفرط الحركة وتشتت الانتباه",
    color: "#F4C46A",
  },
  {
    value: "خطوة واضحة",
    label: "توجيه نحو الخطوة التالية الأنسب — بدل الحيرة",
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
      className="py-20 lg:py-28"
      style={{ background: "#F4EFE8" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">

          {/* Right column: Heading + Paragraph + Value Grid */}
          <div>
            <div className="fade-in-up mb-4">
              <span className="section-label">لماذا تشخيصي؟</span>
            </div>

            <h2
              className="fade-in-up text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 mb-6"
              style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900, lineHeight: 1.2 }}
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
              className="fade-in-up text-lg text-slate-600 leading-relaxed mb-10"
              style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.85 }}
            >
              تشخيصي تساعدك على الانتقال من عدم اليقين إلى فهم أولي أوضح لمؤشرات صعوبات التعلم وفرط الحركة وتشتت الانتباه — بما فيها تحديات القراءة والكتابة والانتباه والتركيز — وتوجيهك نحو الخطوة التالية الأنسب لحالتك.
            </p>

            {/* Practical Value Grid — replaces vague stats */}
            <div className="fade-in-up grid grid-cols-2 gap-4">
              {valueGrid.map((item, i) => (
                <div
                  key={i}
                  className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div
                    className="text-2xl font-black mb-2"
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
