/*
 * تشخيصي HeroSection — Editorial Healthcare
 * Strong Arabic headline, dual CTA, watercolor illustration
 * Background: soft blue-white gradient with generated hero image
 * Text: dark on light background
 * Animation: staggered fadeInUp on load
 *
 * CTA logic:
 *   Primary  → /start  (unified screening entry for both child & self)
 *   Secondary → /#how-it-works  (scrolls to HowItWorks section — label matches destination)
 *
 * AI badge wording: responsible, non-diagnostic, clear
 */

import { ArrowLeft, ChevronDown, Brain, Shield } from "lucide-react";
import { useEffect, useState } from "react";

export default function HeroSection() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const animClass = (delay: number) =>
    `transition-all duration-700 ease-out ${
      visible
        ? "opacity-100 translate-y-0"
        : "opacity-0 translate-y-8"
    }`;

  const animStyle = (delay: number) => ({
    transitionDelay: `${delay}ms`,
  });

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col justify-center overflow-hidden"
      style={{ background: "linear-gradient(160deg, #F4EFE8 0%, #DFF3F1 50%, #DFF3F1 100%)" }}
    >
      {/* Background image */}
      <div
        className="absolute inset-0 opacity-35"
        style={{
          backgroundImage: `url(https://d2xsxph8kpxj0f.cloudfront.net/310519663154655019/XUztTXmhcQeCV4Ng5pyz4t/hero-bg-YrQNC8a4KwmhVi6oFHecCv.webp)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Decorative blobs */}
      <div
        className="absolute top-1/4 left-0 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 70%)",
          transform: "translateX(-40%)",
        }}
      />
      <div
        className="absolute bottom-1/4 right-0 w-80 h-80 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(20,184,166,0.08) 0%, transparent 70%)",
          transform: "translateX(40%)",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16 sm:pb-20">
        <div className="grid lg:grid-cols-5 gap-8 lg:gap-8 items-center">
          {/* Text Content — 3 cols */}
          <div className="lg:col-span-3 order-2 lg:order-1">

            {/* Label badge — concise on all screen sizes */}
            <div
              className={`mb-5 sm:mb-7 inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full ${animClass(0)}`}
              style={{
                ...animStyle(0),
                background: "rgba(37,99,235,0.07)",
                border: "1px solid rgba(37,99,235,0.15)",
              }}
            >
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span
                className="text-xs font-semibold text-blue-700"
                style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", letterSpacing: "0.02em" }}
              >
                فحص أولي لمؤشرات صعوبات التعلم، فرط الحركة وتشتت الانتباه
              </span>
            </div>

            {/* Main Headline */}
            <h1
              className={`text-3xl sm:text-4xl lg:text-6xl font-black text-slate-900 mb-5 sm:mb-6 ${animClass(100)}`}
              style={{
                ...animStyle(100),
                fontFamily: "'Cairo', sans-serif",
                fontWeight: 900,
                lineHeight: 1.15,
                letterSpacing: "-0.01em",
              }}
            >
              <span
                className="block text-xl sm:text-2xl lg:text-3xl font-black mb-1.5"
                style={{
                  background: "linear-gradient(135deg, #1E4E8C 0%, #2BBDB6 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  fontFamily: "'Cairo', sans-serif",
                  letterSpacing: "0.01em",
                }}
              >
                تشخيصي{" "}·{" "}Tashkheesy
              </span>
              خطوتك الأولى{" "}
              <br />
              <span
                style={{
                  background: "linear-gradient(135deg, #1E4E8C 0%, #2BBDB6 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                نحو الفهم
              </span>
              <br />
              والدعم
            </h1>

            {/* Subheadline */}
            <p
              className={`text-base sm:text-lg lg:text-xl text-slate-600 leading-relaxed mb-7 sm:mb-9 max-w-lg ${animClass(200)}`}
              style={{
                ...animStyle(200),
                fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                fontWeight: 400,
                lineHeight: 1.8,
              }}
            >
              <span className="hidden sm:inline">
                <strong style={{ fontWeight: 700, color: "#1E4E8C" }}>تشخيصي (Tashkheesy)</strong> — معك خطوة بخطوة نحو فهم أوضح. فحص أولي لمؤشرات صعوبات التعلم، فرط الحركة وتشتت الانتباه، مدعوم بالذكاء الاصطناعي.
              </span>
              <span className="sm:hidden">فحص أولي لمؤشرات صعوبات التعلم، فرط الحركة وتشتت الانتباه — معك خطوة بخطوة نحو فهم أوضح.</span>
            </p>

            {/* CTAs */}
            <div
              className={`flex flex-col gap-3 mb-12 ${animClass(300)}`}
              style={animStyle(300)}
            >
              {/* Primary + Secondary row */}
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Primary CTA → /start (unified entry: child or self) */}
                <a
                  href="/start"
                  className="group flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl text-white font-bold text-base transition-all duration-200"
                  style={{
                    background: "linear-gradient(135deg, #1E4E8C 0%, #1d4ed8 100%)",
                    fontFamily: "'Cairo', sans-serif",
                    fontWeight: 700,
                    boxShadow: "0 6px 20px rgba(37,99,235,0.35)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 28px rgba(37,99,235,0.45)";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 20px rgba(37,99,235,0.35)";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  }}
                >
                  ابدأ الفحص الأولي
                  <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
                </a>

                {/* Secondary CTA → #how-it-works (label now matches destination) */}
                <a
                  href="#how-it-works"
                  className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-medium text-sm transition-all duration-200"
                  style={{
                    color: "#4A6278",
                    border: "1.5px solid rgba(71,85,105,0.18)",
                    fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                    background: "rgba(248,250,252,0.9)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(37,99,235,0.04)";
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(37,99,235,0.25)";
                    (e.currentTarget as HTMLElement).style.color = "#1E4E8C";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(248,250,252,0.9)";
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(71,85,105,0.18)";
                    (e.currentTarget as HTMLElement).style.color = "#4A6278";
                  }}
                >
                  اكتشف كيف يعمل الفحص
                </a>
              </div>

              {/* Reassurance line */}
              <p
                className="text-xs"
                style={{
                  color: "#64748B",
                  fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                  lineHeight: 1.7,
                }}
              >
                فحص أولي آمن وسري — ليس تشخيصاً طبياً رسمياً، معك خطوة بخطوة نحو فهم أوضح.
              </p>
            </div>

            {/* AI Badge — responsible, non-diagnostic wording */}
            <div
              className={`mb-6 sm:mb-8 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3 sm:gap-4 ${animClass(350)}`}
              style={{
                ...animStyle(350),
                background: "linear-gradient(135deg, rgba(15,23,42,0.92) 0%, rgba(30,58,138,0.92) 55%, rgba(15,118,110,0.92) 100%)",
                border: "1px solid rgba(255,255,255,0.1)",
                backdropFilter: "blur(12px)",
                boxShadow: "0 8px 32px rgba(15,23,42,0.2)",
                maxWidth: "480px",
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }}
              >
                <Brain size={20} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span
                    className="text-sm font-bold text-white"
                    style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 700 }}
                  >
                    تحليل ذكاء اصطناعي للمؤشرات
                  </span>
                  <div
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: "rgba(16,185,129,0.2)", border: "1px solid rgba(16,185,129,0.3)" }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs text-emerald-300" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>مجاني</span>
                  </div>
                </div>
                <p
                  className="text-xs text-blue-200"
                  style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.6 }}
                >
                  تحليل أولي مدعوم بالذكاء الاصطناعي — يساعد على فهم المؤشرات الأولية، لا يُعد تشخيصاً رسمياً
                </p>
              </div>
              <Shield size={14} className="text-teal-300 flex-shrink-0" />
            </div>

            {/* Micro-stats */}
            <div
              className={`flex flex-wrap gap-5 sm:gap-8 ${animClass(400)}`}
              style={animStyle(400)}
            >
              {[
                { value: "١٥ دقيقة", label: "مدة الفحص" },
                { value: "مجاني", label: "بدون أي رسوم" },
                { value: "سري تماماً", label: "خصوصيتك محمية" },
              ].map((stat, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div
                    className="w-1 h-10 rounded-full"
                    style={{ background: i === 0 ? "#1E4E8C" : i === 1 ? "#2BBDB6" : "#F4C46A" }}
                  />
                  <div>
                    <div
                      className="text-lg font-black text-slate-900"
                      style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900 }}
                    >
                      {stat.value}
                    </div>
                    <div
                      className="text-xs text-slate-500"
                      style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                    >
                      {stat.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Illustration — 2 cols — مخفية على الجوال لتوفير مساحة للنص */}
          <div
            className={`hidden lg:flex lg:col-span-2 order-1 lg:order-2 justify-center ${animClass(150)}`}
            style={animStyle(150)}
          >
            <div className="relative w-full max-w-sm lg:max-w-full">
              {/* Main card */}
              <div
                className="rounded-3xl overflow-hidden relative"
                style={{
                  background: "linear-gradient(135deg, rgba(37,99,235,0.06) 0%, rgba(20,184,166,0.06) 100%)",
                  border: "1px solid rgba(37,99,235,0.12)",
                  boxShadow: "0 20px 60px rgba(37,99,235,0.12), 0 4px 16px rgba(0,0,0,0.06)",
                }}
              >
                <img
                  src="https://d2xsxph8kpxj0f.cloudfront.net/310519663154655019/XUztTXmhcQeCV4Ng5pyz4t/screening-illustration-NJYSTiwfewSdiFVVNAnSXW.webp"
                  alt="رسم توضيحي لمنصة تشخيصي — كتاب ودماغ وعلامة صح"
                  className="w-full h-auto"
                  style={{ maxHeight: "360px", objectFit: "contain", padding: "2.5rem 2rem" }}
                />
              </div>

              {/* Floating badge — bottom right */}
              <div
                className="absolute -bottom-5 -right-3 bg-white rounded-2xl px-4 py-3 flex items-center gap-3"
                style={{
                  boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                  border: "1px solid rgba(20,184,166,0.15)",
                  minWidth: "170px",
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "#DFF3F1" }}
                >
                  <span className="text-teal-600 text-lg font-bold">✓</span>
                </div>
                <div>
                  <div
                    className="text-xs font-bold text-slate-900"
                    style={{ fontFamily: "'Cairo', sans-serif" }}
                  >
                    نتائج واضحة
                  </div>
                  <div
                    className="text-xs text-slate-500"
                    style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                  >
                    بعد إتمام الفحص مباشرة
                  </div>
                </div>
              </div>

              {/* Floating badge — top left */}
              <div
                className="absolute -top-5 -left-3 bg-white rounded-2xl px-4 py-3 flex items-center gap-3"
                style={{
                  boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                  border: "1px solid rgba(245,158,11,0.15)",
                  minWidth: "160px",
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "#FFFBEB" }}
                >
                  <Shield size={18} className="text-amber-500" />
                </div>
                <div>
                  <div
                    className="text-xs font-bold text-slate-900"
                    style={{ fontFamily: "'Cairo', sans-serif" }}
                  >
                    خصوصية كاملة
                  </div>
                  <div
                    className="text-xs text-slate-500"
                    style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                  >
                    بياناتك آمنة ومحمية
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-40">
        <span className="text-xs text-slate-500" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>
          اكتشف المزيد
        </span>
        <ChevronDown size={18} className="text-slate-400 animate-bounce" />
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <svg viewBox="0 0 1440 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 56L1440 56L1440 18C1200 56 960 0 720 18C480 36 240 0 0 18L0 56Z" fill="white" />
        </svg>
      </div>
    </section>
  );
}
