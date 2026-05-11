/*
 * تشخيصي HeroSection — Hero Rebalancing Patch
 *
 * Built on Sprint 1.1 (main). Changes in this patch:
 *
 * EYEBROW:
 * - Top badge → refined eyebrow: "تشخيصي | منصة للفحص والتقييم الأولي"
 *   Pulse dot removed (too startup-y). Replaced with a subtle separator.
 *   Feels: premium, trustworthy, calm — NOT promotional.
 *
 * HEADLINE:
 * - Added "وتشتت الانتباه" to complete the specialization triad
 *   "افهم مؤشرات صعوبات التعلم وفرط الحركة وتشتت الانتباه"
 *   Max 2 lines desktop, max 3 lines mobile.
 *
 * SUPPORTING TEXT:
 * - Kept: "للأطفال والبالغين — بسرية وهدوء، مع توجيه واضح للخطوة التالية عند الحاجة."
 *   Calm, reassuring, emotionally intelligent.
 *
 * SECONDARY CTA:
 * - Changed: "اعرف كيف يعمل" → "شاهد مثالاً للنتيجة" → /result-demo
 *   Invitation-based, NOT process-oriented.
 *
 * VISUAL SIDE:
 * - Kept: hero-illustration image (human-centered, emotionally warm)
 * - Added: lightweight "guidance card" below illustration
 *   → 3 soft outcome chips (not process steps)
 *   → Feels: supportive, human, calm — NOT workflow/automation
 *   → Replaces the process step-flow from Sprint 3
 *   → No duplication with "How It Works" section
 *
 * TRUST CHIPS:
 * - Kept: 4 lightweight checkmarks (مجاني للبدء، خصوصية محفوظة، للأطفال والبالغين، توجيه للخطوة التالية)
 *
 * UNCHANGED:
 * - Primary CTA: "ابدأ الفحص الأولي" → /start
 * - Reassurance line: "مجاني • سري • نتيجة أولية فورية • ليس تشخيصًا رسميًا"
 * - Animation system (staggered fadeInUp)
 * - Grid layout (5 cols: 3 text + 2 illustration)
 * - Background gradient
 * - RTL layout correctness
 * - All routing/screening/booking/auth/admin/Supabase logic (UNCHANGED)
 */

import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";

// ─── Trust indicator data ─────────────────────────────────────────────────────

const TRUST_ITEMS = [
  "مجاني للبدء",
  "خصوصية محفوظة",
  "للأطفال والبالغين",
  "توجيه للخطوة التالية",
] as const;

// ─── Guidance outcome chips (replaces process step-flow) ─────────────────────

const OUTCOME_CHIPS = [
  { text: "فهم أوضح للمؤشرات", color: "#1E4E8C", bg: "rgba(30,78,140,0.07)" },
  { text: "نتيجة أولية موثّقة", color: "#2BBDB6", bg: "rgba(43,189,182,0.08)" },
  { text: "توجيه للخطوة التالية عند الحاجة", color: "#5B7FA6", bg: "rgba(91,127,166,0.07)" },
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
      aria-label="تشخيصي — منصة الفحص الأولي"
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

            {/* ── Eyebrow — premium, subtle, brand-clear ── */}
            <div
              className={`mb-5 sm:mb-6 inline-flex items-center gap-2.5 px-3.5 sm:px-4 py-1.5 rounded-full ${animClass(0)}`}
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
                style={{
                  width: "1px",
                  height: "12px",
                  background: "rgba(30,78,140,0.20)",
                  flexShrink: 0,
                }}
                aria-hidden="true"
              />
              <span
                className="text-xs"
                style={{
                  color: "#4A6278",
                  fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                  letterSpacing: "0.01em",
                }}
              >
                منصة للفحص والتقييم الأولي
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
              وفرط الحركة وتشتت الانتباه
            </h1>

            {/* ── Supporting text — calm, reassuring ── */}
            <p
              className={`text-base sm:text-lg text-slate-600 mb-7 sm:mb-8 max-w-lg ${animClass(200)}`}
              style={{
                ...animStyle(200),
                fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                fontWeight: 400,
                lineHeight: 1.85,
              }}
            >
              للأطفال والبالغين — بسرية وهدوء، مع توجيه واضح للخطوة التالية عند الحاجة.
            </p>

            {/* ── CTAs ── */}
            <div
              className={`flex flex-col gap-3 mb-8 sm:mb-10 ${animClass(300)}`}
              style={animStyle(300)}
            >
              {/* Primary + Secondary row */}
              <div className="flex flex-col xs:flex-row sm:flex-row gap-3">
                {/* Primary CTA → /start */}
                <a
                  href="/start"
                  className="group flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl text-white font-bold text-base transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
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
                    aria-hidden="true"
                  />
                </a>

                {/* Secondary CTA → /result-demo (invitation-based) */}
                <a
                  href="/result-demo"
                  className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-medium text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
                  style={{
                    color: "#4A6278",
                    border: "1.5px solid rgba(71,85,105,0.18)",
                    fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                    background: "rgba(248,250,252,0.85)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background =
                      "rgba(30,78,140,0.04)";
                    (e.currentTarget as HTMLElement).style.borderColor =
                      "rgba(30,78,140,0.22)";
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
                  شاهد مثالاً للنتيجة
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
                    aria-hidden="true"
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
            className={`flex flex-col lg:col-span-2 order-2 lg:order-2 items-center gap-4 ${animClass(150)}`}
            style={animStyle(150)}
          >
            <div className="relative w-full max-w-sm lg:max-w-full">
              {/* Main illustration card — human-centered, emotionally warm */}
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
                    alt="رسم توضيحي لمنصة تشخيصي — فحص أولي لمؤشرات صعوبات التعلم وفرط الحركة"
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
            {/* Replaces process step-flow. No duplication with "How It Works" section. */}
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
                ما ستحصل عليه بعد الفحص
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
              <p
                className="text-xs text-slate-400 mt-3 pt-3"
                style={{
                  fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                  lineHeight: 1.6,
                  borderTop: "1px solid rgba(30,78,140,0.07)",
                }}
              >
                ليس تشخيصاً رسمياً — التقييم المتخصص يبقى الخطوة التالية عند الحاجة.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
