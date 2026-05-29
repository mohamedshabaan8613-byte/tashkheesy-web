/*
 * تشخيصي WhyTashkheesy — Sprint 4: Editorial & UX Overhaul
 *
 * Merge strategy: best of commit 8414b9f + Sprint 2 main version
 *
 * What changed from main:
 * ─────────────────────────────────────────────────────────────────
 * KEPT from main (Sprint 2):
 *   - 4 reasons cards (content accurate, dual-audience)
 *   - Functional value grid: مجاني / عربي / ٦ محاور / خطوة واضحة
 *   - id="why-tashkheesy" for anchor navigation
 *   - Arabic section-label (لماذا تشخيصي؟)
 *
 * ADOPTED from commit 8414b9f (editorial branch):
 *   - Framer Motion stagger (replaces raw IntersectionObserver)
 *   - Refined body copy — tighter, dual-audience explicit
 *   - Editorial 3-col asymmetric grid [1.1fr 0.95fr 0.95fr] for context blocks
 *   - Radial micro-glow behind heading area
 *   - Bottom seal pill: product-framing disclaimer
 *   - Gradient: from-white to-[#FAFAF8] (matches rest of Home)
 *
 * IMPROVED vs both versions:
 *   - Heading now explicitly mentions: صعوبات التعلم، فرط الحركة، تشتت الانتباه
 *   - Explicit dual-audience mention (أطفال + بالغون) in heading + body paragraph
 *   - "WHY TASHKHEESY" English label removed → replaced with Arabic section-label
 *   - Value grid placed directly after body copy (emotional → functional flow)
 *   - Reasons cards remain as functional proof, below value grid
 *   - Unified vertical spacing: pt-24/pt-32 pb-20/pb-28 (matches sprint3 sections)
 *   - All inline font-family overrides removed → let global CSS cascade
 *
 * Design direction: "Controlled Premium Calmness"
 * Motion: fade + y:10→0, stagger 100ms, duration 0.6s, easeOut, once
 * Palette: slate-800/600/500/400 + existing brand accents (#1E4E8C / #2BBDB6)
 * RTL: dir="rtl" on section root
 * ─────────────────────────────────────────────────────────────────
 */

import { motion, Variants} from "framer-motion";
import { Brain, BookOpen, Languages, Compass, Info, Focus, Shield } from "lucide-react";

// ─── Animation variant ────────────────────────────────────────────────────────
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: any) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.6,
      ease: "easeOut",
    },
  }),
};

// ─── Context blocks (editorial 3-col grid) ────────────────────────────────────
const blocks = [
  {
    num: "01",
    icon: <Focus size={20} className="text-slate-400" />,
    title: "فهم أدق قبل التسرّع",
    body: "بعض المؤشرات قد تبدو متشابهة، لكن فهمها بشكل أوضح يساعد على اتخاذ خطوة أنسب — سواء للطفل أو للبالغ.",
  },
  {
    num: "02",
    icon: <Shield size={20} className="text-slate-400" />,
    title: "مساحة أكثر هدوءًا وخصوصية",
    body: "التجربة صُممت لتمنح الأسر والأفراد شعورًا بالوضوح والراحة أثناء التقييم الأولي — دون ضغط أو أحكام.",
  },
  {
    num: "03",
    icon: <Compass size={20} className="text-slate-400" />,
    title: "التقنية تدعم… والإنسان يوجّه",
    body: "الهدف ليس إطلاق الأحكام، بل المساعدة على فهم ما قد يحتاج إلى انتباه أو متابعة متخصصة.",
  },
];

// ─── Value grid (functional proof) ───────────────────────────────────────────
const valueGrid = [
  { value: "مجاني",      label: "فحص أولي بدون أي رسوم",            color: "#2BBDB6" },
  { value: "عربي",       label: "شرح بالعربية — لغةً وثقافةً",       color: "#1E4E8C" },
  { value: "٦ محاور",   label: "تغطية مؤشرات التعلم والانتباه",     color: "#2BBDB6" },
  { value: "خطوة واضحة", label: "توجيه للخطوة التالية الأنسب",       color: "#1E4E8C" },
];

// ─── Reasons cards (feature proof) ───────────────────────────────────────────
const reasons = [
  {
    icon: Brain,
    title: "تحليل أولي مدعوم بالذكاء الاصطناعي",
    desc: "بعد إتمام الفحص، يُنظّم الذكاء الاصطناعي المؤشرات ويشرحها بلغة عربية واضحة — دون إصدار حكم أو تشخيص رسمي.",
    color: "#1E4E8C",
    bg: "#DFF3F1",
  },
  {
    icon: BookOpen,
    title: "مؤشرات القراءة والكتابة والانتباه والتركيز",
    desc: "الفحص يُغطي مؤشرات صعوبات التعلم وفرط الحركة وتشتت الانتباه — بصورة منظمة وقابلة للفهم.",
    color: "#2BBDB6",
    bg: "#FFFBEB",
  },
  {
    icon: Languages,
    title: "تجربة مبنية للسياق العربي",
    desc: "المحتوى مكتوب بالعربية ومصمم لمراعاة الحساسية الثقافية للأسرة العربية — دون تعقيد طبي.",
    color: "#2BBDB6",
    bg: "#DFF3F1",
  },
  {
    icon: Compass,
    title: "خطوة أولى منظمة بدل الحيرة",
    desc: "تحصل على فهم أولي واضح للمؤشرات وتوجيه نحو الخطوة التالية الأكثر ملاءمة — بدلاً من الانتظار.",
    color: "#1E4E8C",
    bg: "#DFF3F1",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function WhyTashkheesy() {
  return (
    <section
      id="why-tashkheesy"
      dir="rtl"
      className="relative pt-24 lg:pt-32 pb-20 lg:pb-28 bg-gradient-to-b from-white to-[#FAFAF8] overflow-hidden"
    >
      {/* Micro-atmosphere: radial glow behind heading only — no blobs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(ellipse_at_top,rgba(148,163,184,0.07),transparent_65%)]"
      />

      <div className="max-w-5xl mx-auto px-6 lg:px-8 relative z-10">

        {/* ── Section label ──────────────────────────────────────────── */}
        <motion.p
          custom={0}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={fadeUp}
          className="section-label mb-5"
        >
          لماذا تشخيصي؟
        </motion.p>

        {/* ── Main heading ───────────────────────────────────────────── */}
        <motion.h2
          custom={1}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={fadeUp}
          className="text-3xl lg:text-4xl font-semibold text-slate-800 leading-snug mb-5"
        >
          لكل طفل أو بالغ يعاني من صعوبات التعلم أو فرط الحركة أو تشتت الانتباه…
          <br />
          <span className="font-light text-slate-500">
            تشخيصي تساعدك على فهم المؤشرات بهدوء، قبل أي خطوة أخرى.
          </span>
        </motion.h2>

        {/* ── Supporting paragraph — explicit dual-audience ──────────── */}
        <motion.p
          custom={2}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={fadeUp}
          className="text-base lg:text-lg text-slate-500 leading-relaxed max-w-2xl mb-12"
        >
          تشخيصي ليست اختبارًا سريعًا أو تقريرًا تلقائيًا، بل تجربة أولية صُممت
          لتقديم فهم أكثر وضوحًا لما يستحق الانتباه — سواء كنت والدًا يبحث عن
          إجابات لطفله، أو بالغًا يسعى لفهم تجربته الخاصة.
        </motion.p>

        {/* ── Editorial context blocks — asymmetric 3-col ───────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.95fr_0.95fr] gap-5 lg:gap-6 mb-12">
          {blocks.map((block, i) => (
            <motion.div
              key={block.num}
              custom={i + 3}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={fadeUp}
              className="bg-white/60 backdrop-blur-sm border border-slate-200/60 rounded-3xl p-7 relative overflow-hidden"
            >
              {/* Watermark number */}
              <span
                aria-hidden="true"
                className="text-[9rem] font-thin text-slate-100/60 absolute -top-8 -right-4 z-0 pointer-events-none leading-none select-none"
              >
                {block.num}
              </span>
              <div className="relative z-10">
                <div className="mb-4">{block.icon}</div>
                <h3 className="text-sm font-semibold text-slate-700 mb-2 leading-snug">
                  {block.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {block.body}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Value grid — functional / emotional proof ─────────────── */}
        <motion.div
          custom={6}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={fadeUp}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-12"
        >
          {valueGrid.map((item, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow text-center"
            >
              <div
                className="text-xl font-black mb-1.5"
                style={{ color: item.color }}
              >
                {item.value}
              </div>
              <div className="text-xs text-slate-500 leading-snug">
                {item.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* ── Reasons cards — feature proof ─────────────────────────── */}
        <motion.div
          custom={7}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={fadeUp}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-12"
        >
          {reasons.map((reason, index) => {
            const Icon = reason.icon;
            return (
              <div
                key={index}
                className="group flex items-start gap-4 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105"
                  style={{ background: reason.bg }}
                >
                  <Icon size={18} style={{ color: reason.color }} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-1">
                    {reason.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {reason.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* ── Bottom seal — product-framing disclaimer ───────────────── */}
        <motion.div
          custom={8}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={fadeUp}
          className="flex justify-center"
        >
          <span className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-100/60 border border-slate-200/80 text-sm font-medium text-slate-500">
            <Info size={14} className="shrink-0 text-slate-400" />
            ليست أداة تشخيص رسمي — بل خطوة أولى أكثر وضوحًا.
          </span>
        </motion.div>

      </div>
    </section>
  );
}
