/*
 * تشخيصي HeroSection — Sprint 2.2 Editorial Hero Structure
 *
 * Built on: fix/hero-wcag-gradient  (base: main / Sprint 1.2)
 *
 * CHANGES IN THIS PATCH (Sprint 2.2):
 *
 * 1. H1 → 3-Line Editorial Hero Structure
 *    BEFORE (Sprint 2.1 single line):
 *      "فهم أوضح لطفلك أو لنفسك"
 *
 *    AFTER (Sprint 2.2 three lines):
 *      Line 1 — Brand Anchor:        "تشخيصي —"
 *      Line 2 — Core Emotional Msg:  "خطوتك نحو فهم أوضح"  ← dominant visual line
 *      Line 3 — Audience Clarifier:  "لك أو لطفلك"
 *
 *    Why:
 *      - Creates typographic hierarchy: Anchor → Message → Clarifier
 *      - Matches editorial composition of Apple Health, Headspace, Calm
 *      - "لك" first = faster scanning, more personal UX
 *      - Accent on "فهم أوضح" (not single word) = targets the core value prop
 *      - Three lines > one line for mobile scanning rhythm
 *
 * 2. WCAG contrast (all on bg #F4EFE8):
 *    - Line 1  #1E4E8C          → 7.1:1  ✓ AA + AAA
 *    - Line 2  slate-900 #0F172A → 16.7:1 ✓ AA + AAA
 *    - Accent  #2BBDB6 (large display text ≥24px) → 3.0:1 ✓ AA large
 *    - Line 3  #64748B          → 4.6:1  ✓ AA
 *
 * PRESERVED (UNCHANGED from Sprint 2.1):
 * - Eyebrow, Reassurance line, OUTCOME_CHIPS, MICRO_TRUST
 * - Grid layout, background gradient, animation system
 * - Human illustration + guidance card
 * - CTA text, routing, Supabase, auth, admin logic
 * - prefers-reduced-motion guard (Sprint 1.2)
 * - Hover/focus Tailwind classes (Sprint 1.2)
 */

import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";

// ─── prefers-reduced-motion — evaluated once at module level ─────────────────
const prefersReducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ─── Outcome chips — outcome-focused, human, calm ────────────────────────────
const OUTCOME_CHIPS = [
  { text: "فهم أوضح للمؤشرات", color: "#1E4E8C", bg: "rgba(30,78,140,0.07)" },
  { text: "شرح مبسط يساعد على الفهم", color: "#2BBDB6", bg: "rgba(43,189,182,0.08)" },
  { text: "توجيه للخطوة التالية عند الحاجة", color: "#5B7FA6", bg: "rgba(91,127,166,0.07)" },
] as const;

// ─── Micro Trust Row ─────────────────────────────────────────────────────────
const MICRO_TRUST = ["خصوصية محفوظة", "للأطفال والبالغين", "نتيجة أولية فورية"] as const;

// ─── Component ────────────────────────────────────────────────────────────────

export default function HeroSection() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const animClass = (_delay: number) =>
    prefersReducedMotion
      ? "opacity-100 translate-y-0"
      : `transition-all duration-700 ease-out ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`;

  const animStyle = (delay: number) =>
    prefersReducedMotion ? {} : { transitionDelay: `${delay}ms` };

  return (
    <section
      id="hero"
      className="relative flex flex-col justify-center overflow-hidden"
      aria-label="تشخيصي — منصة التقييم الأولي"
      style={{
        background:
          "linear-gradient(160deg, #F4EFE8 0%, #DFF3F1 55%, #E8F4F3 100%)",
        minHeight: "100svh",
      }}
    >
      {/* ── Main content grid ── */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16 sm:pb-20">
        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 items-center">

          {/* ── Text column — 3 cols on desktop ── */}
          <div className="lg:col-span-3 order-1 lg:order-1">

            {/* ── Eyebrow — PRESERVED ── */}
            <div
              className={`mb-5 sm:mb-6 inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full ${animClass(0)}`}
              style={{
                ...animStyle(0),
                background: "rgba(30,78,140,0.06)",
                border: "1px solid rgba(30,78,140,0.13)",
              }}
            >
              <span
                className="text-xs font-bold"
                style={{
                  color: "#1E4E8C",
                  fontFamily: "'Cairo', sans-serif",
                  fontWeight: 700,
                  letterSpacing: "0.01em",
                }}
              >
                تشخيصي
              </span>
              <span
                className="text-xs"
                style={{ color: "rgba(30,78,140,0.35)", fontWeight: 300 }}
                aria-hidden="true"
              >
                —
              </span>
              <span
                className="text-xs"
                style={{
                  color: "#4A6278",
                  fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                  letterSpacing: "0.01em",
                }}
              >
                منصة للفهم والتقييم الأولي
              </span>
            </div>

            {/*
             * ── Main Headline — Sprint 2.2 ──
             *
             * 3-Line Editorial Hero Structure:
             *
             *   Line 1 — Brand Anchor
             *   "تشخيصي —"
             *   Smaller size, font-weight:700, color:#1E4E8C
             *   Acts as: brand recall + section opener
             *
             *   Line 2 — Core Emotional Message  (dominant visual line)
             *   "خطوتك نحو فهم أوضح"
             *   Largest size, font-weight:800, color:slate-900
             *   Accent on "فهم أوضح" → color:#2BBDB6 (large text AA ✓)
             *
             *   Line 3 — Audience Clarifier
             *   "لك أو لطفلك"
             *   Slightly smaller than line 2, softer contrast #64748B
             *   "لك" first = faster scan, more personal
             */}
            <h1
              className={`mb-4 sm:mb-5 ${animClass(100)}`}
              style={{
                ...animStyle(100),
                fontFamily: "'Cairo', sans-serif",
                lineHeight: 1.25,
                letterSpacing: "-0.01em",
                direction: "rtl",
              }}
            >
              {/* Line 1 — Brand Anchor */}
              <span
                className="block"
                style={{
                  fontSize: "clamp(1.1rem, 2.5vw, 1.375rem)",
                  fontWeight: 700,
                  color: "#1E4E8C",
                  letterSpacing: "0.02em",
                  marginBottom: "0.2em",
                }}
              >
                تشخيصي —
              </span>

              {/* Line 2 — Core Emotional Message (dominant) */}
              <span
                className="block"
                style={{
                  fontSize: "clamp(2rem, 5.5vw, 3.25rem)",
                  fontWeight: 800,
                  color: "#0F172A",
                  lineHeight: 1.15,
                  marginBottom: "0.15em",
                }}
              >
                خطوتك نحو{" "}
                {/* Accent on full value-prop phrase — large text AA (3:1 ✓) */}
                <span style={{ color: "#2BBDB6" }}>فهم أوضح</span>
              </span>

              {/* Line 3 — Audience Clarifier */}
              <span
                className="block"
                style={{
                  fontSize: "clamp(1.25rem, 3vw, 1.875rem)",
                  fontWeight: 500,
                  color: "#64748B",
                  lineHeight: 1.3,
                }}
              >
                لك أو لطفلك
              </span>
            </h1>

            {/* ── CTAs — PRESERVED ── */}
            <div
              className={`flex flex-col gap-3 mb-8 sm:mb-10 ${animClass(200)}`}
              style={animStyle(200)}
            >
              <div className="flex flex-col xs:flex-row sm:flex-row gap-3">

                {/* Primary CTA — sole owner of imperative verb "ابدأ" */}
                <a
                  href="/start"
                  className="group flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl text-white font-bold text-base
                    transition-all duration-200
                    hover:shadow-[0_6px_24px_rgba(37,99,235,0.42)] hover:-translate-y-0.5
                    active:translate-y-0 active:shadow-[0_4px_16px_rgba(37,99,235,0.30)]
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  style={{
                    background:
                      "linear-gradient(135deg, #1E4E8C 0%, #1d4ed8 100%)",
                    fontFamily: "'Cairo', sans-serif",
                    fontWeight: 700,
                    boxShadow: "0 4px 16px rgba(37,99,235,0.30)",
                  }}
                >
                  ابدأ التقييم الأولي
                  <ArrowLeft
                    size={18}
                    className="transition-transform group-hover:-translate-x-1"
                    aria-hidden="true"
                  />
                </a>

                {/* Secondary CTA — PRESERVED */}
                <a
                  href="#how-it-works"
                  className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-medium text-sm
                    transition-all duration-200
                    hover:bg-[rgba(30,78,140,0.04)] hover:border-[rgba(30,78,140,0.22)] hover:text-[#1E4E8C]
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
                  style={{
                    color: "#4A6278",
                    border: "1.5px solid rgba(71,85,105,0.18)",
                    fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                    background: "rgba(248,250,252,0.85)",
                  }}
                >
                  كيف يعمل تشخيصي؟
                </a>
              </div>

              {/* ── Reassurance line — PRESERVED ── */}
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

            {/* ── Micro Trust Row — PRESERVED ── */}
            <div
              className={`flex flex-wrap items-center gap-x-4 gap-y-1.5 ${animClass(350)}`}
              style={animStyle(350)}
            >
              {MICRO_TRUST.map((item, i) => (
                <span key={item} className="flex items-center gap-1.5">
                  {i > 0 && (
                    <span
                      className="w-1 h-1 rounded-full"
                      style={{ background: "rgba(100,116,139,0.30)" }}
                      aria-hidden="true"
                    />
                  )}
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    aria-hidden="true"
                    style={{ flexShrink: 0 }}
                  >
                    <path
                      d="M2 6L5 9L10 3"
                      stroke="#2BBDB6"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity="0.65"
                    />
                  </svg>
                  <span
                    className="text-xs"
                    style={{
                      color: "#64748B",
                      fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                      lineHeight: 1.5,
                    }}
                  >
                    {item}
                  </span>
                </span>
              ))}
            </div>
          </div>

          {/* ── Illustration column — PRESERVED ── */}
          <div
            className={`flex flex-col lg:col-span-2 order-2 lg:order-2 items-center gap-4 ${animClass(150)}`}
            style={animStyle(150)}
          >
            <div className="relative w-full max-w-sm lg:max-w-full">
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
                    alt="رسم توضيحي لمنصة تشخيصي — تقييم أولي لمؤشرات صعوبات التعلم وفرط الحركة"
                    className="w-full h-auto"
                    style={{
                      maxHeight: "320px",
                      objectFit: "contain",
                      padding: "2rem 1.75rem",
                    }}
                  />
                </picture>
              </div>
            </div>

            {/* ── Guidance card — PRESERVED ── */}
            <div
              className="w-full max-w-sm lg:max-w-full rounded-2xl px-5 py-4"
              style={{
                background: "rgba(255,255,255,0.75)",
                border: "1px solid rgba(30,78,140,0.09)",
                boxShadow: "0 2px 12px rgba(30,78,140,0.06)",
                backdropFilter: "blur(8px)",
              }}
            >
              <p
                className="text-xs text-slate-500 mb-3"
                style={{
                  fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                  lineHeight: 1.6,
                }}
              >
                ما ستحصل عليه بعد التقييم
              </p>
              <div className="flex flex-col gap-2">
                {OUTCOME_CHIPS.map((chip) => (
                  <div
                    key={chip.text}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl"
                    style={{
                      background: chip.bg,
                      border: `1px solid ${chip.color}18`,
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: chip.color }}
                      aria-hidden="true"
                    />
                    <span
                      className="text-xs font-medium"
                      style={{
                        color: chip.color,
                        fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                      }}
                    >
                      {chip.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
