/*
 * تشخيصي HeroSection — Sprint 1.1: Hero Visual Minimalism & Premium UX Polish
 *
 * Built on Sprint 1 (4b9941b). Changes in this sprint:
 *
 * REMOVED:
 * - Floating illustration badges (bottom-right "نتائج واضحة", top-left "خصوصية كاملة")
 *   → duplicated trust/reassurance already stated in reassurance line + trust indicators
 * - Scroll indicator ("اكتشف المزيد" + ChevronDown bounce)
 *   → not aligned with premium minimal SaaS; creates visual noise at bottom
 * - Bottom wave SVG
 *   → replaced with a clean section-end padding; transition handled by section below
 * - ChevronDown and Shield imports (no longer used)
 * - Decorative blobs (both radial gradient divs)
 *   → background gradient alone is sufficient; blobs added visual noise
 * - Background image overlay
 *   → at 0.25 opacity it still competed with text; removed for cleaner premium feel
 *
 * SIMPLIFIED:
 * - Subheadline: shortened to one clean sentence per spec
 *   "فحص أولي آمن لمؤشرات صعوبات التعلم وفرط الحركة وتشتت الانتباه، مع توجيه أوضح للخطوة التالية."
 * - Illustration card: border and shadow softened further
 * - Section background: kept gradient (F4EFE8 → DFF3F1), removed image overlay
 * - Inline hover handlers: kept as-is (safe, no risk of regression)
 * - Mobile spacing: pb-16 sm:pb-20 (was pb-20 sm:pb-24) — tighter, cleaner
 *
 * UNCHANGED:
 * - Headline: "افهم مؤشرات صعوبات التعلم وفرط الحركة مبكرًا"
 * - Primary CTA: "ابدأ الفحص الأولي" → /start
 * - Secondary CTA: "اعرف كيف يعمل" → #how-it-works
 * - Reassurance line: "مجاني • سري • نتيجة أولية فورية • ليس تشخيصًا رسميًا"
 * - Trust indicators: 4 lightweight checkmarks
 * - Top badge
 * - Illustration asset (hero-illustration.webp / .png)
 * - Animation system (staggered fadeInUp)
 * - Grid layout (5 cols: 3 text + 2 illustration)
 * - RTL layout correctness
 * - CTA destinations (UNCHANGED)
 * - All routing/screening/booking/auth/admin/Supabase logic (UNCHANGED)
 */

import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";

// ─── Trust indicator data ─────────────────────────────────────────────────────

const TRUST_ITEMS = [
  "فحص أولي",
  "خصوصية محفوظة",
  "للأطفال والبالغين",
  "توجيه للخطوة التالية",
] as const;

// ─── Component ────────────────────────────────────────────────────────────────

export default function HeroSection() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const animClass = (_delay: number) =>
    `transition-all duration-700 ease-out ${
      visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
    }`;

  const animStyle = (delay: number) => ({ transitionDelay: `${delay}ms` });

  return (
    <section
      id="hero"
      className="relative flex flex-col justify-center overflow-hidden"
      style={{
        background:
          "linear-gradient(160deg, #F4EFE8 0%, #DFF3F1 55%, #E8F4F3 100%)",
        minHeight: "100svh",
      }}
    >
      {/* ── Main content grid ── */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16 sm:pb-20">
        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 items-center">

          {/* ── Text column — 3 cols on desktop, first on mobile ── */}
          <div className="lg:col-span-3 order-1 lg:order-1">

            {/* Top badge */}
            <div
              className={`mb-5 sm:mb-6 inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full ${animClass(0)}`}
              style={{
                ...animStyle(0),
                background: "rgba(37,99,235,0.07)",
                border: "1px solid rgba(37,99,235,0.15)",
              }}
            >
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span
                className="text-xs font-semibold text-blue-700"
                style={{
                  fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                  letterSpacing: "0.02em",
                }}
              >
                فحص أولي لمؤشرات صعوبات التعلم وفرط الحركة
              </span>
            </div>

            {/* ── Main Headline ── */}
            <h1
              className={`text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 mb-4 sm:mb-5 ${animClass(100)}`}
              style={{
                ...animStyle(100),
                fontFamily: "'Cairo', sans-serif",
                fontWeight: 900,
                lineHeight: 1.2,
                letterSpacing: "-0.01em",
              }}
            >
              افهم مؤشرات{" "}
              <span
                style={{
                  background:
                    "linear-gradient(135deg, #1E4E8C 0%, #2BBDB6 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                صعوبات التعلم
              </span>
              <br />
              وفرط الحركة مبكرًا
            </h1>

            {/* ── Subheadline — shortened per Sprint 1.1 spec ── */}
            <p
              className={`text-base sm:text-lg text-slate-600 mb-7 sm:mb-8 max-w-lg ${animClass(200)}`}
              style={{
                ...animStyle(200),
                fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                fontWeight: 400,
                lineHeight: 1.8,
              }}
            >
              فحص أولي آمن لمؤشرات صعوبات التعلم وفرط الحركة وتشتت الانتباه،
              مع توجيه أوضح للخطوة التالية.
            </p>

            {/* ── CTAs ── */}
            <div
              className={`flex flex-col gap-3 mb-8 sm:mb-10 ${animClass(300)}`}
              style={animStyle(300)}
            >
              {/* Primary + Secondary row */}
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Primary CTA → /start */}
                <a
                  href="/start"
                  className="group flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl text-white font-bold text-base transition-all duration-200"
                  style={{
                    background:
                      "linear-gradient(135deg, #1E4E8C 0%, #1d4ed8 100%)",
                    fontFamily: "'Cairo', sans-serif",
                    fontWeight: 700,
                    boxShadow: "0 4px 16px rgba(37,99,235,0.30)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow =
                      "0 6px 24px rgba(37,99,235,0.42)";
                    (e.currentTarget as HTMLElement).style.transform =
                      "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow =
                      "0 4px 16px rgba(37,99,235,0.30)";
                    (e.currentTarget as HTMLElement).style.transform =
                      "translateY(0)";
                  }}
                >
                  ابدأ الفحص الأولي
                  <ArrowLeft
                    size={18}
                    className="transition-transform group-hover:-translate-x-1"
                  />
                </a>

                {/* Secondary CTA → #how-it-works */}
                <a
                  href="#how-it-works"
                  className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-medium text-sm transition-all duration-200"
                  style={{
                    color: "#4A6278",
                    border: "1.5px solid rgba(71,85,105,0.18)",
                    fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                    background: "rgba(248,250,252,0.85)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background =
                      "rgba(37,99,235,0.04)";
                    (e.currentTarget as HTMLElement).style.borderColor =
                      "rgba(37,99,235,0.25)";
                    (e.currentTarget as HTMLElement).style.color = "#1E4E8C";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background =
                      "rgba(248,250,252,0.85)";
                    (e.currentTarget as HTMLElement).style.borderColor =
                      "rgba(71,85,105,0.18)";
                    (e.currentTarget as HTMLElement).style.color = "#4A6278";
                  }}
                >
                  اعرف كيف يعمل
                </a>
              </div>

              {/* ── Reassurance line ── */}
              <p
                className="text-xs"
                style={{
                  color: "#64748B",
                  fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                  lineHeight: 1.7,
                }}
              >
                مجاني • سري • نتيجة أولية فورية • ليس تشخيصًا رسميًا
              </p>
            </div>

            {/* ── Trust indicators — lightweight checkmarks ── */}
            <div
              className={`flex flex-wrap gap-x-5 gap-y-2.5 ${animClass(400)}`}
              style={animStyle(400)}
            >
              {TRUST_ITEMS.map((item) => (
                <div key={item} className="flex items-center gap-1.5">
                  <span
                    className="flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(43,189,182,0.15)" }}
                  >
                    <svg
                      width="9"
                      height="9"
                      viewBox="0 0 9 9"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M1.5 4.5L3.5 6.5L7.5 2.5"
                        stroke="#2BBDB6"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span
                    className="text-xs text-slate-600"
                    style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                  >
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Illustration column — 2 cols on desktop, second on mobile ── */}
          <div
            className={`flex lg:col-span-2 order-2 lg:order-2 justify-center ${animClass(150)}`}
            style={animStyle(150)}
          >
            <div className="relative w-full max-w-sm lg:max-w-full">
              {/* Main illustration card — clean, minimal */}
              <div
                className="rounded-3xl overflow-hidden"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(37,99,235,0.05) 0%, rgba(20,184,166,0.05) 100%)",
                  border: "1px solid rgba(37,99,235,0.10)",
                  boxShadow:
                    "0 12px 40px rgba(37,99,235,0.08), 0 2px 8px rgba(0,0,0,0.04)",
                }}
              >
                <picture>
                  <source srcSet="/hero-illustration.webp" type="image/webp" />
                  <img
                    src="/hero-illustration.png"
                    alt="رسم توضيحي لمنصة تشخيصي"
                    className="w-full h-auto"
                    style={{
                      maxHeight: "360px",
                      objectFit: "contain",
                      padding: "2.5rem 2rem",
                    }}
                  />
                </picture>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
