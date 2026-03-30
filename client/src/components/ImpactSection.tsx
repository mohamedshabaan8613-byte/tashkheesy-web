/*
 * تشخيصي ImpactSection — Editorial Healthcare
 * Dark section with animated impact stats and social/educational value
 * For hackathon judges to understand the product's importance quickly
 */

import { useEffect, useRef, useState } from "react";

const stats = [
  {
    value: 15,
    suffix: "٪",
    label: "من الطلاب يعانون من صعوبات تعلم غير مشخَّصة",
    source: "منظمة الصحة العالمية",
    color: "#14B8A6",
  },
  {
    value: 3,
    suffix: "+",
    label: "سنوات متوسط التأخر في التشخيص بالمنطقة العربية",
    source: "دراسات إقليمية",
    color: "#2563EB",
  },
  {
    value: 80,
    suffix: "٪",
    label: "من الحالات تتحسن بشكل ملحوظ مع الدعم المبكر",
    source: "أبحاص التعليم الخاص",
    color: "#14B8A6",
  },
  {
    value: 2,
    suffix: "M+",
    label: "طفل عربي قد يستفيد من هذه الخدمة",
    source: "تقديرات تشخيصي",
    color: "#F59E0B",
  },
];

const impactPoints = [
  {
    emoji: "📚",
    title: "أثر تعليمي",
    desc: "الكشف المبكر يمنع تراكم الفجوات الأكاديمية ويُمكّن الطالب من الوصول لإمكاناته الحقيقية.",
    color: "#14B8A6",
  },
  {
    emoji: "💙",
    title: "أثر نفسي",
    desc: "الفهم يُزيل وصمة العار ويُعيد بناء الثقة بالنفس لدى الطفل وأسرته.",
    color: "#2563EB",
  },
  {
    emoji: "🌍",
    title: "أثر اجتماعي",
    desc: "دعم الأسر العربية بلغتها ومن ثقافتها يُقلل الحواجز ويُعزز الوصول العادل للرعاية.",
    color: "#14B8A6",
  },
  {
    emoji: "💡",
    title: "أثر اقتصادي",
    desc: "كل ريال يُنفق على الدعم المبكر يوفر عشرة أضعافه في تكاليف التدخل المتأخر.",
    color: "#F59E0B",
  },
];

function AnimatedNumber({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const animated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !animated.current) {
          animated.current = true;
          const duration = 1800;
          const startTime = performance.now();
          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

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
      style={{ background: "#0F172A" }}
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
      <div className="absolute inset-0"
        style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.12) 0%, rgba(20,184,166,0.08) 100%)" }} />
      <div className="absolute top-0 left-0 right-0 h-24"
        style={{ background: "linear-gradient(to bottom, #0F172A, transparent)" }} />
      <div className="absolute bottom-0 left-0 right-0 h-24"
        style={{ background: "linear-gradient(to top, #0F172A, transparent)" }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 fade-in-up">
          <span
            className="section-label block mb-3"
            style={{ color: "#14B8A6" }}
          >
            لماذا يهم هذا؟
          </span>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-5"
            style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900 }}
          >
            الأثر الحقيقي{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #14B8A6 0%, #2563EB 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              لكل تشخيص مبكر
            </span>
          </h2>
          <p
            className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed"
            style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.8 }}
          >
            الأرقام تحكي قصة واضحة — التشخيص المبكر ليس رفاهية، بل ضرورة تربوية وإنسانية.
          </p>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="fade-in-up text-center p-6 rounded-2xl group hover:-translate-y-1 transition-transform duration-200"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                backdropFilter: "blur(10px)",
              }}
            >
              <div
                className="text-4xl lg:text-5xl font-black mb-3"
                style={{
                  fontFamily: "'Cairo', sans-serif",
                  fontWeight: 900,
                  color: stat.color,
                }}
              >
                <AnimatedNumber target={stat.value} suffix={stat.suffix} />
              </div>
              <p
                className="text-sm text-slate-300 leading-relaxed mb-3"
                style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.6 }}
              >
                {stat.label}
              </p>
              <span
                className="text-xs px-2 py-1 rounded-full"
                style={{
                  color: stat.color,
                  background: `${stat.color}18`,
                  fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                }}
              >
                {stat.source}
              </span>
            </div>
          ))}
        </div>

        {/* Impact points */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {impactPoints.map((point, index) => (
            <div
              key={index}
              className="fade-in-up p-5 rounded-2xl"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div className="text-2xl mb-3">{point.emoji}</div>
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
          ))}
        </div>
      </div>
    </section>
  );
}
