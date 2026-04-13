/**
 * Services — صفحة الخدمات المُعاد بناؤها
 *
 * التصميم: Editorial Healthcare Calm
 * الهوية البصرية: Cairo + IBM Plex Sans Arabic
 * اللوحة اللونية: #F4EFE8 خلفية | #1E4E8C أزرق | #2BBDB6 أخضر
 *
 * الهدف: شرح القمع الكامل (فحص → فهم → متخصص → دعم)
 * وبيعه بوضوح دون ادعاءات مبالغ فيها
 *
 * الهيكل:
 * 1. Hero — ما تقدمه المنصة بوضوح
 * 2. كيف يعمل القمع — 4 خطوات
 * 3. باقات الخدمة — 3 مستويات
 * 4. من يستفيد من المنصة
 * 5. Disclaimer + CTA
 */

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSEO } from "@/hooks/useSEO";
import { Link } from "wouter";
import {
  Brain,
  ArrowLeft,
  CheckCircle2,
  Shield,
  Sparkles,
  BookOpen,
  Target,
  Users,
  Star,
  Calendar,
  Heart,
  GraduationCap,
} from "lucide-react";

// ─── بيانات الخطوات ───────────────────────────────────────────────────────────
const FUNNEL_STEPS = [
  {
    num: "١",
    title: "فحص أولي مجاني",
    desc: "أسئلة منظمة تغطي مؤشرات صعوبات التعلم وفرط الحركة وتشتت الانتباه — تستغرق 10-15 دقيقة فقط.",
    icon: Brain,
    color: "#1E4E8C",
    bg: "#DFF3F1",
    border: "rgba(37,99,235,0.15)",
    tag: "مجاني تماماً",
    tagColor: "#059669",
  },
  {
    num: "٢",
    title: "فهم المؤشرات",
    desc: "تحليل أولي مدعوم بالذكاء الاصطناعي يشرح ما رصده الفحص في مجالات القراءة والكتابة والانتباه والتركيز.",
    icon: Target,
    color: "#2BBDB6",
    bg: "#DFF3F1",
    border: "rgba(20,184,166,0.15)",
    tag: "مُضمَّن في الفحص",
    tagColor: "#2BBDB6",
  },
  {
    num: "٣",
    title: "مطابقة المتخصص",
    desc: "قائمة متخصصين مقترحين بناءً على المؤشرات — مع تفاصيل التخصص والتقييم والسعر والتوفر.",
    icon: Users,
    color: "#8B5CF6",
    bg: "#F5F3FF",
    border: "rgba(139,92,246,0.15)",
    tag: "مُضمَّن في الفحص",
    tagColor: "#8B5CF6",
  },
  {
    num: "٤",
    title: "حجز الجلسة",
    desc: "حجز مباشر مع المتخصص المناسب — جلسة أولى تُعطيك تقييماً أعمق وخطة دعم مخصصة.",
    icon: Calendar,
    color: "#F4C46A",
    bg: "#FFFBEB",
    border: "rgba(245,158,11,0.15)",
    tag: "تبدأ من ٢٠٠ ريال",
    tagColor: "#D97706",
  },
];

// ─── باقات الخدمة ─────────────────────────────────────────────────────────────
const SERVICE_TIERS = [
  {
    id: "free",
    title: "الفحص الأولي",
    subtitle: "ابدأ هنا",
    price: "مجاني",
    priceNote: "بدون بطاقة ائتمان",
    color: "#1E4E8C",
    bg: "white",
    border: "rgba(37,99,235,0.2)",
    highlight: false,
    features: [
      { text: "فحص أولي شامل (10-15 دقيقة)", included: true },
      { text: "تحليل مؤشرات القراءة والكتابة والانتباه", included: true },
      { text: "شرح أولي مدعوم بالذكاء الاصطناعي", included: true },
      { text: "قائمة متخصصين مقترحين", included: true },
      { text: "جلسة مع متخصص", included: false },
      { text: "تقرير رسمي مفصل", included: false },
    ],
    cta: "ابدأ الفحص المجاني",
    ctaHref: "/start",
    ctaStyle: "outline" as const,
  },
  {
    id: "session",
    title: "جلسة مع متخصص",
    subtitle: "الأكثر طلباً",
    price: "تبدأ من ٢٠٠ ريال",
    priceNote: "للجلسة الواحدة",
    color: "#2BBDB6",
    bg: "linear-gradient(135deg, #243B53 0%, #1E3A8A 55%, #0F766E 100%)",
    border: "transparent",
    highlight: true,
    features: [
      { text: "فحص أولي مجاني مُضمَّن", included: true },
      { text: "تحليل مؤشرات شامل", included: true },
      { text: "مطابقة مع متخصص مناسب", included: true },
      { text: "جلسة تقييم أعمق (45-90 دقيقة)", included: true },
      { text: "خطة دعم مخصصة من المتخصص", included: true },
      { text: "متابعة بعد الجلسة", included: true },
    ],
    cta: "ابدأ الفحص للحجز",
    ctaHref: "/start",
    ctaStyle: "filled" as const,
  },
  {
    id: "institutional",
    title: "باقة مؤسسية",
    subtitle: "للمدارس والمراكز",
    price: "حسب الطلب",
    priceNote: "تواصل معنا للتفاصيل",
    color: "#8B5CF6",
    bg: "white",
    border: "rgba(139,92,246,0.2)",
    highlight: false,
    features: [
      { text: "فحص جماعي لعدد من الطلاب", included: true },
      { text: "تقارير تجميعية للمؤسسة", included: true },
      { text: "جلسات مع متخصصين متعددين", included: true },
      { text: "توصيات تربوية للمعلمين", included: true },
      { text: "دعم مستمر لفريق المدرسة", included: true },
      { text: "تخصيص حسب احتياجات المؤسسة", included: true },
    ],
    cta: "تواصل معنا",
    ctaHref: "/contact",
    ctaStyle: "outline" as const,
  },
];

// ─── من يستفيد ────────────────────────────────────────────────────────────────
const WHO_BENEFITS = [
  {
    icon: Heart,
    title: "أولياء الأمور",
    desc: "تلاحظ أن طفلك يجد صعوبة في القراءة أو الكتابة أو التركيز — وتريد فهماً أوضح قبل اتخاذ أي خطوة.",
    color: "#1E4E8C",
    bg: "#DFF3F1",
  },
  {
    icon: GraduationCap,
    title: "الطلاب والبالغون",
    desc: "تشعر بأن هناك تحديات في القراءة أو الانتباه أثرت على مسيرتك الأكاديمية أو المهنية.",
    color: "#2BBDB6",
    bg: "#DFF3F1",
  },
  {
    icon: BookOpen,
    title: "المعلمون والمرشدون",
    desc: "تلاحظ أنماطاً لدى طالب وتريد أداة منظمة تساعدك على توجيه الأسرة نحو الخطوة الصحيحة.",
    color: "#8B5CF6",
    bg: "#F5F3FF",
  },
];

// ─── المكوّن الرئيسي ──────────────────────────────────────────────────────────
export default function Services() {
  useSEO({
    title: "خدماتنا — تشخيصي | Tashkheesy",
    description:
      "فحص أولي لمؤشرات صعوبات التعلم، فرط الحركة وتشتت الانتباه — مع مطابقة متخصص وحجز جلسة مباشر.",
  });

  return (
    <div className="min-h-screen" dir="rtl" style={{ background: "#F4EFE8" }}>
      <Navbar />

      {/* ─── Hero ──────────────────────────────────────────────────────────────── */}
      <section className="pt-24 pb-16 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6"
            style={{
              background: "rgba(37,99,235,0.07)",
              border: "1px solid rgba(37,99,235,0.15)",
            }}
          >
            <Sparkles size={13} style={{ color: "#1E4E8C" }} />
            <span
              className="text-xs font-semibold"
              style={{ color: "#1E4E8C", fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
            >
              من الفحص إلى الدعم — في خطوات واضحة
            </span>
          </div>

          <h1
            className="text-3xl sm:text-4xl font-black text-slate-900 mb-4"
            style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900, lineHeight: 1.25 }}
          >
            خدمات تشخيصي
          </h1>
          <p
            className="text-base sm:text-lg text-slate-500 leading-relaxed max-w-2xl mx-auto"
            style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.8 }}
          >
            نبدأ بفحص أولي لمؤشرات صعوبات التعلم، فرط الحركة وتشتت الانتباه، ثم نوجهك نحو المتخصص المناسب — معك خطوة بخطوة نحو فهم أوضح.
          </p>
        </div>
      </section>

      {/* ─── كيف يعمل القمع ────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2
              className="text-2xl sm:text-3xl font-black text-slate-900 mb-3"
              style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900 }}
            >
              كيف يعمل المسار؟
            </h2>
            <p
              className="text-sm text-slate-500"
              style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
            >
              أربع خطوات من الفحص إلى الدعم الفعلي
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {FUNNEL_STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <div
                  key={i}
                  className="rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                  style={{
                    background: "white",
                    border: `1.5px solid ${step.border}`,
                    boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-black text-sm"
                      style={{ background: step.color, fontFamily: "'Cairo', sans-serif" }}
                    >
                      {step.num}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3
                          className="text-base font-black text-slate-900"
                          style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 800 }}
                        >
                          {step.title}
                        </h3>
                        <span
                          className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{
                            background: `${step.tagColor}15`,
                            color: step.tagColor,
                            fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                          }}
                        >
                          {step.tag}
                        </span>
                      </div>
                      <p
                        className="text-sm text-slate-500 leading-relaxed"
                        style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.7 }}
                      >
                        {step.desc}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── باقات الخدمة ──────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 sm:px-6" style={{ background: "white" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2
              className="text-2xl sm:text-3xl font-black text-slate-900 mb-3"
              style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900 }}
            >
              اختر ما يناسبك
            </h2>
            <p
              className="text-sm text-slate-500"
              style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
            >
              ابدأ مجاناً — وأضف الجلسة مع المتخصص عندما تكون جاهزاً
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-5">
            {SERVICE_TIERS.map((tier) => (
              <div
                key={tier.id}
                className="rounded-2xl p-6 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                style={{
                  background: tier.highlight ? tier.bg : "white",
                  border: tier.highlight ? "none" : `1.5px solid ${tier.border}`,
                  boxShadow: tier.highlight
                    ? "0 20px 60px rgba(15,23,42,0.25)"
                    : "0 2px 12px rgba(0,0,0,0.04)",
                }}
              >
                {/* Header */}
                <div className="mb-5">
                  {tier.highlight ? (
                    <div
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full mb-3"
                      style={{ background: "rgba(255,255,255,0.15)" }}
                    >
                      <Star size={11} style={{ color: "#F4C46A", fill: "#F4C46A" }} />
                      <span
                        className="text-xs font-bold text-white"
                        style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                      >
                        {tier.subtitle}
                      </span>
                    </div>
                  ) : (
                    <p
                      className="text-xs font-semibold mb-2"
                      style={{ color: tier.color, fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                    >
                      {tier.subtitle}
                    </p>
                  )}
                  <h3
                    className="text-lg font-black mb-1"
                    style={{
                      fontFamily: "'Cairo', sans-serif",
                      fontWeight: 900,
                      color: tier.highlight ? "white" : "#243B53",
                    }}
                  >
                    {tier.title}
                  </h3>
                  <div
                    className="text-2xl font-black"
                    style={{
                      fontFamily: "'Cairo', sans-serif",
                      color: tier.highlight ? "white" : tier.color,
                    }}
                  >
                    {tier.price}
                  </div>
                  <p
                    className="text-xs mt-0.5"
                    style={{
                      color: tier.highlight ? "rgba(255,255,255,0.6)" : "#94A3B8",
                      fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                    }}
                  >
                    {tier.priceNote}
                  </p>
                </div>

                {/* Features */}
                <ul className="space-y-2.5 flex-1 mb-6">
                  {tier.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2.5">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{
                          background: f.included
                            ? tier.highlight ? "rgba(255,255,255,0.15)" : `${tier.color}15`
                            : "transparent",
                        }}
                      >
                        {f.included ? (
                          <CheckCircle2
                            size={12}
                            style={{ color: tier.highlight ? "white" : tier.color }}
                          />
                        ) : (
                          <div
                            className="w-3 h-0.5 rounded-full"
                            style={{ background: tier.highlight ? "rgba(255,255,255,0.2)" : "#CBD5E1" }}
                          />
                        )}
                      </div>
                      <span
                        className="text-sm"
                        style={{
                          color: f.included
                            ? tier.highlight ? "rgba(255,255,255,0.9)" : "#374151"
                            : tier.highlight ? "rgba(255,255,255,0.35)" : "#CBD5E1",
                          fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                        }}
                      >
                        {f.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link href={tier.ctaHref}>
                  <button
                    className="w-full py-3 rounded-xl text-sm font-bold transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
                    style={{
                      fontFamily: "'Cairo', sans-serif",
                      ...(tier.ctaStyle === "filled"
                        ? {
                            background: "white",
                            color: "#243B53",
                            boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                          }
                        : {
                            background: "transparent",
                            color: tier.color,
                            border: `1.5px solid ${tier.color}40`,
                          }),
                    }}
                  >
                    {tier.cta}
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── من يستفيد ─────────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2
              className="text-2xl sm:text-3xl font-black text-slate-900 mb-3"
              style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900 }}
            >
              من يستفيد من تشخيصي؟
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-5">
            {WHO_BENEFITS.map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={i}
                  className="rounded-2xl p-6 text-center transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                  style={{
                    background: "white",
                    border: `1.5px solid ${item.color}20`,
                    boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    style={{ background: item.bg }}
                  >
                    <Icon size={22} style={{ color: item.color }} />
                  </div>
                  <h3
                    className="text-base font-black text-slate-900 mb-2"
                    style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 800 }}
                  >
                    {item.title}
                  </h3>
                  <p
                    className="text-sm text-slate-500 leading-relaxed"
                    style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.7 }}
                  >
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Disclaimer + CTA ──────────────────────────────────────────────────── */}
      <section className="py-16 px-4 sm:px-6" style={{ background: "white" }}>
        <div className="max-w-2xl mx-auto text-center">
          <div
            className="rounded-2xl p-5 mb-8 flex items-start gap-3 text-right"
            style={{
              background: "rgba(37,99,235,0.04)",
              border: "1px solid rgba(37,99,235,0.1)",
            }}
          >
            <Shield size={16} style={{ color: "#1E4E8C", flexShrink: 0, marginTop: "2px" }} />
            <p
              className="text-sm text-slate-500 leading-relaxed"
              style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.8 }}
            >
              <strong style={{ color: "#243B53" }}>تشخيصي منصة فحص أولي مجانية.</strong> لا تُصدر تشخيصاً طبياً أو نفسياً رسمياً. نتائج الفحص مؤشرات توجيهية أولية — التشخيص الرسمي يتطلب تقييماً شاملاً من متخصص معتمد.
            </p>
          </div>

          <h2
            className="text-2xl font-black text-slate-900 mb-3"
            style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900 }}
          >
            ابدأ بالفحص المجاني الآن
          </h2>
          <p
            className="text-sm text-slate-500 mb-6"
            style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
          >
            لا تحتاج إلى حساب أو بطاقة ائتمان — فقط 10-15 دقيقة للحصول على صورة أوضح
          </p>
          <Link href="/start">
            <button
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-white font-bold text-base transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: "linear-gradient(135deg, #1E4E8C 0%, #2BBDB6 100%)",
                fontFamily: "'Cairo', sans-serif",
                boxShadow: "0 8px 24px rgba(37,99,235,0.3)",
              }}
            >
              ابدأ الفحص المجاني
              <ArrowLeft size={16} />
            </button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
