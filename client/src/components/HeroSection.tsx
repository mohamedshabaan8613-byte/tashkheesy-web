/*
 * تشخيصي HeroSection — Sprint 1.2 Hero Copy & CTA Patch
 *
 * Built on: sprint4/why-section-editorial-overhaul
 *
 * CHANGES IN THIS PATCH (Sprint 1.2 Review):
 *
 * 1. HEADLINE — person-centered, dual-audience
 *    BEFORE: "افهم مؤشرات صعوبات التعلم وفرط الحركة وتشتت الانتباه"
 *    AFTER:  "ابدأ بفهم أوضح لطفلك أو لنفسك"
 *    Reason: addresses visitor anxiety directly; confirms children + adults
 *            audience; complements eyebrow without redundancy.
 *
 * 2. PRIMARY CTA — less clinical word choice
 *    BEFORE: "ابدأ الفحص الأولي"
 *    AFTER:  "ابدأ التقييم الأولي"
 *    Reason: "فحص" carries hospital connotation in Gulf Arabic context.
 *            "تقييم" is professional, lighter, more appropriate for digital tool.
 *
 * 3. SECONDARY CTA — clear destination intent
 *    BEFORE: "كيف نوجهك؟"
 *    AFTER:  "كيف يعمل تشخيصي؟"
 *    Reason: visitor immediately understands what clicking does (→ #how-it-works).
 *            Removes the ambiguity of a question-as-CTA.
 *
 * 4. MICRO_TRUST — deduplicate against OUTCOME_CHIPS
 *    BEFORE: ["خصوصية محفوظة", "للأطفال والبالغين", "فهم أوضح للمؤشرات"]
 *    AFTER:  ["خصوصية محفوظة", "للأطفال والبالغين", "نتيجة أولية فورية"]
 *    Reason: "فهم أوضح للمؤشرات" was identical to OUTCOME_CHIPS[0], weakening
 *            both elements. New item aligns with reassurance line.
 *
 * 5. HOVER EFFECTS — JS inline → Tailwind CSS classes
 *    Removed onMouseEnter/onMouseLeave from both CTA elements.
 *    Applied hover:* and active:* Tailwind utilities instead.
 *    Reason: eliminates layout thrashing, respects reduced-motion,
 *            cleaner code, easier future maintenance.
 *
 * 6. ACCESSIBILITY — prefers-reduced-motion guard
 *    Added prefersReducedMotion check to animClass helper.
 *    Users who requested reduced motion get static layout, no forced transitions.
 *    Reason: critical for health platform; users may have vestibular sensitivity.
 *
 * PRESERVED (UNCHANGED):
 * - Eyebrow: "تشخيصي — منصة للفهم والتقييم الأولي" (already correct)
 * - Reassurance line: "مجاني • سري • نتيجة أولية فورية • ليس تشخيصًا رسميًا"
 * - OUTCOME_CHIPS content (3 items, human & calm)
 * - Grid layout (5 cols: 3 text + 2 illustration)
 * - Background gradient
 * - Animation system (staggered fadeInUp) — now motion-safe
 * - Human illustration + guidance card structure
 * - CTA hierarchy (primary dominant)
 * - All routing/screening/booking/auth/admin/Supabase logic (UNCHANGED)
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
// FIX 4: replaced "فهم أوضح للمؤشرات" (duplicate of OUTCOME_CHIPS[0])
//         with "نتيجة أولية فورية" — matches reassurance line, adds new info
const MICRO_TRUST = ["خصوصية محفوظة", "للأطفال والبالغين", "نتيجة أولية فورية"] as const;

// ─── Component ────────────────────────────────────────────────────────────────

export default function HeroSection() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // FIX 6: skip animation entirely if user prefers reduced motion
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

            {/* ── Main Headline — FIX 1: person-centered, dual-audience ── */}
            {/*
             * BEFORE: "افهم مؤشرات صعوبات التعلم وفرط الحركة وتشتت الانتباه"
             *   → Clinical descriptor, doesn't speak to the person's anxiety
             * AFTER:  "ابدأ بفهم أوضح لطفلك أو لنفسك"
             *   → Addresses visitor directly, confirms dual audience,
             *     gradient on "لطفلك" keeps visual accent on the core value
             */}
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
              ابدأ بفهم أوضح{" "}
              <span
                style={{
                  background:
                    "linear-gradient(135deg, #1E4E8C 0%, #2BBDB6 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                لطفلك
              </span>
              {" "}أو لنفسك
            </h1>

            {/* ── CTAs ── */}
            <div
              className={`flex flex-col gap-3 mb-8 sm:mb-10 ${animClass(200)}`}
              style={animStyle(200)}
            >
              <div className="flex flex-col xs:flex-row sm:flex-row gap-3">

                {/*
                 * PRIMARY CTA — FIX 2: "الفحص" → "التقييم"
                 * FIX 5: hover moved from JS inline handlers to Tailwind classes
                 */}
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

                {/*
                 * SECONDARY CTA — FIX 3: "كيف نوجهك؟" → "كيف يعمل تشخيصي؟"
                 * FIX 5: hover moved from JS inline handlers to Tailwind classes
                 */}
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

            {/* ── Micro Trust Row — FIX 4: deduplicated ── */}
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

          {/* ── Illustration column — 2 cols on desktop ── */}
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

            {/* ── Guidance card — outcome-focused, human, calm ── */}
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
