/*
 * تشخيصي WhyTashkheesy — "Why Tashkheesy" Editorial & UX Overhaul
 *
 * Design philosophy: "Controlled Premium Calmness"
 * - Typography-first, no pastel, no heavy shadows, no spring animations
 * - Asymmetric grid [1.1fr 0.95fr 0.95fr] for editorial rhythm
 * - Micro-atmosphere: radial glow behind heading only
 * - Quiet Motion: stagger 100ms, fade + y:10→0, duration 0.6s, easeOut
 * - Icons: lucide-react (Focus, Shield, Compass) — muted slate colors
 * - RTL Arabic throughout
 */

import { motion } from "framer-motion";
import { Focus, Shield, Compass, Info } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.6,
      ease: "easeOut",
    },
  }),
};

const blocks = [
  {
    num: "01",
    icon: <Focus size={22} className="text-slate-400" />,
    title: "فهم أدق قبل التسرّع",
    body: "بعض المؤشرات قد تبدو متشابهة، لكن فهمها بشكل أوضح يساعد على اتخاذ خطوة أنسب.",
  },
  {
    num: "02",
    icon: <Shield size={22} className="text-slate-400" />,
    title: "مساحة أكثر هدوءًا وخصوصية",
    body: "التجربة صُممت لتمنح الأسر والأفراد شعورًا بالوضوح والراحة أثناء التقييم الأولي.",
  },
  {
    num: "03",
    icon: <Compass size={22} className="text-slate-400" />,
    title: "التقنية تدعم… والإنسان يوجّه",
    body: "الهدف ليس إطلاق الأحكام، بل المساعدة على فهم ما قد يحتاج إلى انتباه أو متابعة متخصصة.",
  },
];

export default function WhyTashkheesy() {
  return (
    <section
      id="why-tashkheesy"
      dir="rtl"
      className="relative pt-24 lg:pt-32 pb-20 lg:pb-28 bg-gradient-to-b from-white to-[#FAFAF8] overflow-hidden"
    >
      {/* Micro-atmosphere: subtle radial glow behind heading only */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,rgba(148,163,184,0.08),transparent_60%)]"
      />

      <div className="max-w-5xl mx-auto px-6 lg:px-8 relative z-10">

        {/* Small label */}
        <motion.p
          custom={0}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={fadeUp}
          className="text-sm font-medium tracking-[0.18em] uppercase text-slate-400 mb-5"
        >
          WHY TASHKHEESY
        </motion.p>

        {/* Main heading */}
        <motion.h2
          custom={1}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={fadeUp}
          className="text-3xl lg:text-4xl font-semibold text-slate-800 leading-snug mb-5"
        >
          البداية تصبح أوضح…
          <br />
          <span className="font-light text-slate-600">
            عندما نفهم المؤشرات بهدوء.
          </span>
        </motion.h2>

        {/* Supporting statement */}
        <motion.p
          custom={2}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={fadeUp}
          className="text-base lg:text-lg text-slate-500 leading-relaxed max-w-2xl mb-14"
        >
          تشخيصي ليست اختبارًا سريعًا أو تقريرًا تلقائيًا،{" "}
          <br className="hidden lg:block" />
          بل تجربة أولية صُممت لتقديم فهم أكثر وضوحًا لما يستحق الانتباه.
        </motion.p>

        {/* Editorial blocks — asymmetric grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.95fr_0.95fr] gap-6 lg:gap-8 mb-14">
          {blocks.map((block, i) => (
            <motion.div
              key={block.num}
              custom={i + 3}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={fadeUp}
              className="bg-white/60 backdrop-blur-sm border border-slate-200/60 rounded-3xl p-8 relative overflow-hidden"
            >
              {/* Watermark number — typographic background element */}
              <span
                aria-hidden="true"
                className="text-[10rem] font-thin text-slate-100/50 absolute -top-10 -right-6 z-0 pointer-events-none leading-none select-none"
              >
                {block.num}
              </span>

              {/* Content sits above watermark */}
              <div className="relative z-10">
                <div className="mb-4">{block.icon}</div>
                <h3 className="text-base font-semibold text-slate-700 mb-2 leading-snug">
                  {block.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {block.body}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom seal — product framing line */}
        <motion.div
          custom={6}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={fadeUp}
          className="flex justify-center"
        >
          <span className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-100/50 border border-slate-200/80 text-sm font-medium text-slate-500">
            <Info size={15} className="shrink-0 text-slate-400" />
            ليست أداة تشخيص تلقائي، بل خطوة أولى أكثر وضوحًا.
          </span>
        </motion.div>

      </div>
    </section>
  );
}
