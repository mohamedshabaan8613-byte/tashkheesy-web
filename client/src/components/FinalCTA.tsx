/*
 * تشخيصي FinalCTA — Editorial Healthcare
 * Final conversion strip: privacy, simplicity, screening action
 * Gradient background, strong CTA, trust reassurance
 * Warm, reassuring, action-oriented copy
 */

import { useEffect, useRef } from "react";
import { ArrowLeft, Shield, Clock, Smile } from "lucide-react";

export default function FinalCTA() {
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
      id="final-cta"
      ref={sectionRef}
      className="py-24 lg:py-32 relative overflow-hidden"
    >
      {/* Background gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(135deg, #1e3a8a 0%, #2563EB 45%, #0f766e 100%)",
        }}
      />

      {/* Decorative circles */}
      <div
        className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)",
          transform: "translate(30%, -30%)",
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-72 h-72 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)",
          transform: "translate(-30%, 30%)",
        }}
      />
      <div
        className="absolute top-1/2 left-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(20,184,166,0.08) 0%, transparent 70%)",
          transform: "translate(-50%, -50%)",
        }}
      />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Label */}
        <div
          className="fade-in-up mb-7 inline-flex items-center gap-2 px-5 py-2.5 rounded-full"
          style={{
            background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.2)",
            backdropFilter: "blur(10px)",
          }}
        >
          <span className="w-2 h-2 rounded-full bg-teal-300 animate-pulse" />
          <span
            className="text-white text-xs font-medium"
            style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
          >
            الخطوة الأولى دائماً هي الأصعب — نحن هنا معك
          </span>
        </div>

        {/* Headline */}
        <h2
          className="fade-in-up text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6"
          style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900, lineHeight: 1.2 }}
        >
          خطوتك الأولى نحو فهم
          <br />
          <span
            style={{
              background: "linear-gradient(135deg, #5eead4 0%, #a5f3fc 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            مؤشرات التعلم والانتباه
          </span>
        </h2>

        {/* Subtext */}
        <p
          className="fade-in-up text-xl text-blue-100 max-w-2xl mx-auto mb-10 leading-relaxed"
          style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.8 }}
        >
          فحص أولي مجاني لمؤشرات صعوبات التعلم وفرط الحركة وتشتت الانتباه —
          سواء كنت والداً يلاحظ شيئاً ما، أو بالغاً يبحث عن فهم أعمق لنفسه.
        </p>

        {/* CTA Buttons */}
        <div className="fade-in-up mb-12 flex flex-col sm:flex-row items-center justify-center gap-4">
          {/* Primary CTA */}
          <a
            href="/start"
            className="group inline-flex items-center gap-3 px-10 py-5 rounded-2xl text-blue-700 font-black text-lg transition-all duration-200"
            style={{
              background: "white",
              fontFamily: "'Cairo', sans-serif",
              fontWeight: 800,
              boxShadow: "0 10px 40px rgba(0,0,0,0.25)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 16px 50px rgba(0,0,0,0.3)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 10px 40px rgba(0,0,0,0.25)";
            }}
          >
            ابدأ الفحص الأولي — مجاناً
            <ArrowLeft size={20} className="transition-transform group-hover:-translate-x-1" />
          </a>
          {/* Tertiary CTA — لمن يريد التحدث مع متخصص مباشرة */}
          <a
            href="/booking"
            className="inline-flex items-center gap-2 px-7 py-4 rounded-2xl font-semibold text-sm transition-all duration-200"
            style={{
              background: "rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.9)",
              border: "1.5px solid rgba(255,255,255,0.25)",
              fontFamily: "'IBM Plex Sans Arabic', sans-serif",
              fontWeight: 600,
              backdropFilter: "blur(10px)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.18)";
              (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.1)";
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
            }}
          >
            احجز موعداً مع متخصص
          </a>
        </div>

        {/* Trust micro-badges */}
        <div className="fade-in-up flex flex-wrap justify-center gap-8">
          {[
            { icon: Shield, text: "خصوصية كاملة — لا نشارك بياناتك" },
            { icon: Clock, text: "١٠ دقائق فقط" },
            { icon: Smile, text: "فحص أولي — ليس تشخيصاً رسمياً" },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="flex items-center gap-2 text-blue-100">
                <Icon size={16} className="text-teal-300 flex-shrink-0" />
                <span
                  className="text-sm"
                  style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                >
                  {item.text}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
