/*
 * تشخيصي — TrustSignals
 * Sprint 1.1 — مكوّن الثقة والشفافية
 *
 * التصميم الفلسفي:
 * - ثلاثة محاور: سرية البيانات، معايير مهنية، وضوح الحدود
 * - لا توجد كلمات إنجليزية في الواجهة
 * - نبرة: مهنية + هادئة + صادقة (لا مبالغة)
 * - ألوان: slate neutral + teal خافت للأيقونات فقط
 * - حركة: fadeUp بسيطة متناسقة مع باقي الصفحة
 * - الخط: IBM Plex Sans Arabic من الـ layout
 */
import { motion } from "framer-motion";
import { Lock, BadgeCheck, AlertCircle } from "lucide-react";

const fadeUp = {
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
  },
  {
    icon: BadgeCheck,
    title: "معايير مهنية معتمدة",
    body: "أدوات الفحص مبنية على أطر علمية معترف بها دولياً وتُراجَع بإشراف أخصائيين نفسيين وتربويين متخصصين.",
    color: "#1E4E8C",
  },
  {
    icon: AlertCircle,
    title: "وضوح حدود الخدمة",
    body: "تشخيصي تُقدّم فحصاً أولياً لرصد المؤشرات، ولا تُصدر تشخيصاً طبياً رسمياً. نتائج الفحص تُوجّهك نحو الخطوة المتخصصة الأنسب.",
    color: "#64748B",
  },
];

export default function TrustSignals() {
  return (
    <section
      id="trust-signals"
      dir="rtl"
      className="relative py-16 lg:py-20 overflow-hidden"
      style={{ background: "#F8F7F4" }}
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
            <span className="font-light text-slate-500">
              واضح ومكتوب.
            </span>
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
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center mb-5 bg-slate-50 relative z-10"
                >
                  <Icon size={19} style={{ color: pillar.color }} strokeWidth={1.8} />
                </div>

                {/* المحتوى */}
                <h3 className="text-[15px] font-semibold text-slate-800 mb-3 leading-snug">
                  {pillar.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {pillar.body}
                </p>
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
