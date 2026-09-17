/*
 * تشخيصي — TrustSignals
 * Sprint 1.3 — Refinement (3 targeted fixes)
 *
 * التغييرات:
 * 1. خلفية معمّقة قليلاً: #F2F0EC بدل #F8F7F4 — تمييز بصري واضح عن السكشنز المجاورة
 * 2. تلطيف نص 'وضوح حدود الخدمة' — تجنب تكرار رسالة 'ليست تشخيصاً رسمياً' في أكثر من موضع
 * 3. إضافة رابط 'تعرّف على الفريق' في بطاقة 'معايير مهنية' — يربط الادعاء بدليل قادم
 *
 * ثوابت لم تتغير:
 * - هيكل البطاقات الثلاث
 * - animations (fadeUp، stagger، easeOut)
 * - شريط الطمأنة السفلي
 * - الخطوط الفاصلة العلوية والسفلية
 * - RTL + Arabic only
 *
 * fix(ts): add explicit Variants type annotation on fadeUp
 *   — resolves TS2322 / [Gate] TypeScript failure in CI
 */
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { Lock, BadgeCheck, AlertCircle } from "lucide-react";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.55, ease: "easeOut" },
  }),
};

const pillars = [
  {
    icon: Lock,
    title: "سرية تامة لبيانات طفلك",
    body: "معلوماتك وبيانات أسرتك لا تُشارك مع أي جهة خارجية دون موافقتك. البيانات مشفّرة وتُستخدم فقط لإعداد نتيجة الفحص.",
    color: "#2BBDB6",
    link: null,
  },
  {
    icon: BadgeCheck,
    title: "معايير مهنية معتمدة",
    body: "أدوات الفحص مبنية على أطر علمية معترف بها دولياً، وتُراجَع بإشراف أخصائيين نفسيين وتربويين متخصصين.",
    color: "#1E4E8C",
    // رابط مؤقت للـ anchor — يُفعَّل عند إنشاء Team section
    link: { href: "#our-team", label: "تعرّف على الفريق" },
  },
  {
    icon: AlertCircle,
    // Sprint 1.3: تلطيف الصياغة — الرسالة ذاتها لكن بأسلوب إيجابي لتجنب التكرار مع WhyTashkheesy
    title: "خطوة توجيهية، لا حكم نهائي",
    body: "الفحص يرصد المؤشرات ويُنظّمها بشكل واضح، ثم يوجّهك نحو الخطوة المتخصصة الأنسب لحالتك أو حالة طفلك.",
    color: "#64748B",
    link: null,
  },
];

export default function TrustSignals() {
  return (
    <section
      id="trust-signals"
      dir="rtl"
      className="relative py-16 lg:py-20 overflow-hidden"
      // Sprint 1.3: #F2F0EC بدل #F8F7F4 — فرق خفيف لكن كافٍ لتمييز القسم بصرياً
      style={{ background: "#F2F0EC" }}
    >
      {/* خط فاصل علوي ناعم */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        {/* رأس القسم */}
        <motion.div
          custom={0}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={fadeUp}
          className="mb-12 lg:mb-14"
        >
          <p className="text-sm font-medium text-slate-400 mb-4 tracking-wide">
            الثقة والشفافية
          </p>
          <h2 className="text-2xl lg:text-3xl font-semibold text-slate-800 leading-snug max-w-xl">
            التزامنا تجاهك{" "}
            <span className="font-light text-slate-500">واضح ومكتوب.</span>
          </h2>
        </motion.div>

        {/* بطاقات المحاور الثلاثة */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {pillars.map((pillar, i) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.title}
                custom={i + 1}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                variants={fadeUp}
                className="group bg-white border border-slate-200/70 rounded-3xl p-7 relative overflow-hidden
                           hover:border-slate-300 hover:shadow-sm transition-all duration-300"
              >
                {/* خلفية ظل لوني خفيف خلف الأيقونة */}
                <div
                  className="absolute top-5 right-5 w-16 h-16 rounded-full opacity-[0.06] blur-xl"
                  style={{ background: pillar.color }}
                />

                {/* الأيقونة */}
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-5 bg-slate-50 relative z-10">
                  <Icon size={19} style={{ color: pillar.color }} strokeWidth={1.8} />
                </div>

                {/* المحتوى */}
                <h3 className="text-[15px] font-semibold text-slate-800 mb-3 leading-snug">
                  {pillar.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {pillar.body}
                </p>

                {/* Sprint 1.3: رابط 'تعرّف على الفريق' — يظهر فقط في بطاقة المعايير المهنية */}
                {pillar.link && (
                  <a
                    href={pillar.link.href}
                    className="inline-flex items-center gap-1 mt-4 text-xs font-medium
                               text-slate-400 hover:text-slate-600 transition-colors duration-200"
                  >
                    <span>{pillar.link.label}</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="11"
                      height="11"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      // RTL: السهم يشير لليسار
                      className="rotate-180"
                      aria-hidden="true"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </a>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* شريط الطمأنة السفلي */}
        <motion.div
          custom={4}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={fadeUp}
          className="mt-10 flex justify-center"
        >
          <span
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full
                       bg-white border border-slate-200/80 text-sm text-slate-500"
          >
            <Lock size={13} className="text-slate-400" strokeWidth={2} />
            بياناتك محمية — لن تُشارك دون إذنك
          </span>
        </motion.div>
      </div>

      {/* خط فاصل سفلي ناعم */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
    </section>
  );
}
