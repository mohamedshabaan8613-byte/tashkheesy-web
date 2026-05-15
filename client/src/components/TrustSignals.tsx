/*
 * تشخيصي TrustSignals — Sprint 1.1 Full Rebuild
 *
 * Changes from previous version:
 * - Removed: Emoji logos (🇸🇦 🌐 🎓 🤝) — هذا يدمر المصداقية
 * - Removed: ادعاءات شراكة غير موثقة (وزارة التعليم، هيئة التخصصات)
 * - Added: 4 أعمدة ثقة حقيقية وقابلة للتحقق
 * - Added: Framer Motion fadeUp — متسق مع WhyTashkheesy / HowItWorks
 * - Added: dir="rtl" صريح
 * - Added: Lucide React icons فقط
 * - Added: Disclaimer seal في الأسفل
 * - Kept: bg-slate-50 / border-y palette (لا ألوان جديدة)
 *
 * الأعمدة الأربعة:
 *   01 — سرية البيانات   (LockKeyhole)
 *   02 — عربي ومحلي     (Globe)
 *   03 — منهجية مقننة  (BookOpen)
 *   04 — يوجّه لا يحكم  (Compass)
 */

import { motion } from "framer-motion";
import { LockKeyhole, Globe, BookOpen, Compass, Info } from "lucide-react";

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

const pillars = [
  {
    icon: LockKeyhole,
    title: "سرية تامة للبيانات",
    body: "بيانات طفلك أو بياناتك لا تُشارك مع أي جهة خارجية دون موافقتك الصريحة.",
    num: "01",
  },
  {
    icon: Globe,
    title: "مصمم للسياق العربي",
    body: "المحتوى مكتوب بالعربية ومراعاة الحساسية الثقافية للأسرة السعودية والخليجية.",
    num: "02",
  },
  {
    icon: BookOpen,
    title: "منهجية مبنية على أسس علمية",
    body: "أدوات الفحص مستندة إلى أطر تقييم معتمدة في مجالَي صعوبات التعلم والانتباه.",
    num: "03",
  },
  {
    icon: Compass,
    title: "يوجّهك… لا يحكم عليك",
    body: "النتيجة ليست تشخيصاً رسمياً، بل فهم أولي يساعدك على اتخاذ الخطوة التالية بثقة.",
    num: "04",
  },
];

export default function TrustSignals() {
  return (
    <section
      dir="rtl"
      className="relative py-20 lg:py-24 bg-slate-50 border-y border-slate-100 overflow-hidden"
    >
      {/* Subtle background texture */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(148,163,184,0.06),transparent_60%)]"
      />

      <div className="max-w-5xl mx-auto px-6 lg:px-8 relative z-10">

        {/* Label */}
        <motion.p
          custom={0}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={fadeUp}
          className="text-sm font-medium tracking-[0.18em] uppercase text-slate-400 mb-5 text-center"
        >
          TRUST & TRANSPARENCY
        </motion.p>

        {/* Heading */}
        <motion.h2
          custom={1}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={fadeUp}
          className="text-3xl lg:text-4xl font-semibold text-slate-800 leading-snug mb-4 text-center"
        >
          الثقة ليست شعاراً…
          <br />
          <span className="font-light text-slate-500">
            بل مبدأ نبنيه في كل خطوة.
          </span>
        </motion.h2>

        {/* Subtext */}
        <motion.p
          custom={2}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={fadeUp}
          className="text-base text-slate-500 leading-relaxed text-center max-w-xl mx-auto mb-14"
        >
          نؤمن بأن الوضوح أساس الثقة — لذلك نخبرك بالضبط كيف نعمل،
          وكيف نحمي بياناتك، وما الذي تتوقعه من الفحص.
        </motion.p>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
          {pillars.map((pillar, i) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.num}
                custom={i + 3}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                variants={fadeUp}
                className="bg-white border border-slate-200/60 rounded-3xl p-7 relative overflow-hidden group hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                {/* Watermark number */}
                <span
                  aria-hidden="true"
                  className="absolute -top-6 -right-3 text-[7rem] font-thin text-slate-100 leading-none select-none pointer-events-none z-0"
                >
                  {pillar.num}
                </span>

                {/* Content */}
                <div className="relative z-10">
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center mb-4 group-hover:bg-slate-200 transition-colors">
                    <Icon size={20} className="text-slate-500" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-2 leading-snug">
                    {pillar.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {pillar.body}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Disclaimer Seal — consistent with WhyTashkheesy bottom seal */}
        <motion.div
          custom={7}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={fadeUp}
          className="flex justify-center"
        >
          <span className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white border border-slate-200/80 text-sm font-medium text-slate-500 shadow-sm">
            <Info size={15} className="shrink-0 text-slate-400" />
            الفحص الأولي لا يُعد تشخيصاً طبياً أو نفسياً رسمياً.
          </span>
        </motion.div>

      </div>
    </section>
  );
}
