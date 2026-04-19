/**
 * تشخيصي — صفحة الأسعار
 * Editorial Healthcare Design System
 * Background: #F4EFE8 | Surface: #FFFFFF | Primary: #1E4E8C | Secondary: #2BBDB6 | Warm: #F4C46A
 */
import Navbar from "@/components/Navbar";
import { useSEO } from "@/hooks/useSEO";
import Footer from "@/components/Footer";
import { Link } from "wouter";
import { CheckCircle2, Sparkles, Shield, Clock, FileText, ArrowLeft, Building2, Users, BadgeCheck, ChevronRight } from "lucide-react";

const pricingPlans = [
  {
    id: "child",
    name: "باقة طفل واحد",
    subtitle: "للأهل الذين يرغبون في فهم طفلهم",
    price: "299",
    currency: "ر.س",
    description: "جلسة تقييم شاملة مع تقرير رسمي وخطة دعم للأسرة والمدرسة",
    features: [
      "جلسة تشخيص 60–90 دقيقة",
      "تقرير رسمي PDF مفصَّل",
      "توصيات للأهل والمدرسة",
      "اتصال متابعة 15 دقيقة",
      "دعم عبر البريد الإلكتروني"
    ],
    popular: false,
    badge: null,
    color: "blue"
  },
  {
    id: "university",
    name: "باقة طالب جامعي",
    subtitle: "للطلاب الجامعيين الذين يحتاجون تقريراً رسمياً",
    price: "349",
    currency: "ر.س",
    description: "تقييم متخصص مع تقرير قابل للتقديم للجامعة والحصول على تسهيلات أكاديمية",
    features: [
      "جلسة تقييم 75 دقيقة",
      "تقرير قابل للتقديم للجامعة",
      "توصيات للتسهيلات الأكاديمية",
      "استشارة متابعة 20 دقيقة",
      "دعم مباشر عبر الواتساب"
    ],
    popular: true,
    badge: "الأكثر طلباً",
    color: "blue"
  },
  {
    id: "family",
    name: "باقة عائلة",
    subtitle: "وفّر 100 ر.س عند تشخيص طفلين",
    price: "499",
    currency: "ر.س",
    description: "تشخيص شامل لطفلين من نفس الأسرة مع جلسة استشارية عائلية",
    features: [
      "تشخيص لطفلين من نفس الأسرة",
      "تقرير مفصَّل لكل طفل",
      "خطة متابعة موحَّدة",
      "جلسة استشارية عائلية 30 دقيقة",
      "أولوية في الحجز"
    ],
    popular: false,
    badge: "وفّر 100 ر.س",
    color: "teal"
  }
];

const institutionalFeatures = [
  "تشخيص جماعي لعدد من الطلاب",
  "تقارير فردية مفصلة لكل طالب",
  "تقرير تجميعي للمؤسسة",
  "ورش عمل توعوية للمعلمين",
  "استشارات تربوية متخصصة",
  "خصومات على الأعداد الكبيرة",
  "متابعة دورية وتقييم التقدم",
  "مدير حساب مخصص"
];

const trustPoints = [
  { icon: Shield, label: "خصوصية تامة", desc: "بياناتك محمية ومشفرة" },
  { icon: BadgeCheck, label: "متخصصون معتمدون", desc: "فريق مؤهَّل ومرخَّص" },
  { icon: Clock, label: "نتائج خلال 48 ساعة", desc: "تقرير رسمي سريع" },
  { icon: FileText, label: "تقرير PDF رسمي", desc: "مقبول لدى المدارس والجامعات" },
];

export default function Pricing() {
  useSEO({
    title: "الأسعار والباقات",
    description: "أسعار شفافة وواضحة لخدمات تشخيصي: باقة تشخيص الأطفال بـ 299 ر.س وباقة طلاب الجامعة بـ 349 ر.س. شامل تقرير رسمي PDF وجلسة متابعة.",
    keywords: "أسعار تشخيص صعوبات تعلم, تكلفة تشخيص ديسلكسيا, باقات تشخيص, سعر تقرير صعوبات تعلم",
    canonical: "/pricing",
  });

  return (
    <div className="ts-page">
      <Navbar />

      <main className="flex-1">
        {/* ── Page Header ─────────────────────────────────────── */}
        <section className="ts-page-header">
          <div className="container relative z-10">
            <div className="text-center max-w-3xl mx-auto">
              {/* Breadcrumb */}
              <nav className="flex items-center justify-center gap-2 text-sm mb-5" style={{ color: "#64748B" }}>
                <Link href="/" className="hover:text-blue-600 transition-colors" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>
                  الرئيسية
                </Link>
                <ChevronRight size={14} className="opacity-50" />
                <span style={{ color: "#1E4E8C", fontWeight: 600, fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>الأسعار والباقات</span>
              </nav>
              <span className="section-label block mb-4">الأسعار والباقات</span>
              <h1 className="text-4xl md:text-5xl font-bold text-[#243B53] mb-5 leading-tight">
                أسعار شفافة،{" "}
                <span className="tashkhisi-gradient-text">قيمة حقيقية</span>
              </h1>
              <p className="text-lg text-[#4A6278] leading-relaxed max-w-2xl mx-auto">
                كل باقة مصمَّمة لتقديم أقصى قيمة ممكنة. لا رسوم خفية، لا مفاجآت — فقط دعم واضح وموثوق.
              </p>
            </div>
          </div>
        </section>

        {/* ── Trust Strip ─────────────────────────────────────── */}
        <section className="py-8 bg-white border-b border-[#D8E8E7]">
          <div className="container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {trustPoints.map((tp, i) => (
                <div key={i} className="flex items-center gap-3 p-3">
                  <div className="ts-icon-blue">
                    <tp.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#243B53]">{tp.label}</p>
                    <p className="text-xs text-[#4A6278]">{tp.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pricing Cards ─────────────────────────────────────── */}
        <section className="py-20 bg-[#F4EFE8]">
          <div className="container">
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {pricingPlans.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative flex flex-col rounded-2xl overflow-visible ${
                    plan.popular
                      ? "bg-white border-2 border-[#1E4E8C] shadow-xl shadow-blue-100"
                      : "ts-card"
                  }`}
                >
                  {/* Badge */}
                  {plan.badge && (
                    <div className="absolute -top-4 right-1/2 translate-x-1/2 z-10">
                      <div className={`px-4 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1.5 shadow-md ${
                        plan.popular
                          ? "bg-[#1E4E8C] text-white"
                          : "bg-[#2BBDB6] text-white"
                      }`}>
                        <Sparkles className="w-3.5 h-3.5" />
                        {plan.badge}
                      </div>
                    </div>
                  )}

                  <div className="p-8 flex flex-col flex-1">
                    {/* Plan Name */}
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-[#243B53] mb-1">{plan.name}</h3>
                      <p className="text-sm text-[#4A6278]">{plan.subtitle}</p>
                    </div>

                    {/* Price */}
                    <div className="mb-6 pb-6 border-b border-[#DFF3F1]">
                      <div className="flex items-baseline gap-1.5 mb-2">
                        <span className="text-5xl font-extrabold text-[#243B53]">{plan.price}</span>
                        <span className="text-lg text-[#4A6278] font-medium">{plan.currency}</span>
                      </div>
                      <p className="text-sm text-[#4A6278] leading-relaxed">{plan.description}</p>
                    </div>

                    {/* Features */}
                    <ul className="space-y-3 mb-8 flex-1">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <CheckCircle2 className="w-4.5 h-4.5 text-[#2BBDB6] flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-[#4A6278]">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <Link href="/booking">
                      <button className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                        plan.popular
                          ? "bg-[#1E4E8C] text-white hover:bg-[#1A3F73] shadow-md shadow-blue-200 hover:shadow-lg hover:-translate-y-0.5"
                          : "border-1.5 border-[#1E4E8C] text-[#1E4E8C] hover:bg-[#DFF3F1]"
                      }`}>
                        احجز الآن
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Disclaimer */}
            <div className="mt-10 max-w-2xl mx-auto">
              <div className="ts-disclaimer-note">
                <Shield className="w-5 h-5 text-[#F4C46A] flex-shrink-0 mt-0.5" />
                <p>
                  <strong>ضمان الرضا:</strong> يمكن استرداد المبلغ كاملاً في حال الإلغاء قبل 24 ساعة من موعد الجلسة. نحن ملتزمون بتقديم قيمة حقيقية أو استرداد المبلغ.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Institutional Section ─────────────────────────────── */}
        <section className="py-20 bg-white">
          <div className="container">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-14">
                <span className="section-label block mb-3">للمؤسسات التعليمية</span>
                <h2 className="text-3xl md:text-4xl font-bold text-[#243B53] mb-4">
                  حلول مخصصة للمدارس والجامعات
                </h2>
                <p className="text-[#4A6278] max-w-2xl mx-auto">
                  نقدم برامج متكاملة للمؤسسات التعليمية مع خصومات على الأعداد الكبيرة ودعم مستمر.
                </p>
              </div>

              <div className="ts-card rounded-2xl overflow-hidden">
                <div className="grid md:grid-cols-2 gap-0">
                  {/* Features List */}
                  <div className="p-8 md:p-10">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="ts-icon-blue">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <h3 className="text-xl font-bold text-[#243B53]">ما نقدمه للمؤسسات</h3>
                    </div>
                    <ul className="space-y-3">
                      {institutionalFeatures.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <CheckCircle2 className="w-4.5 h-4.5 text-[#1E4E8C] flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-[#4A6278]">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Discount Tiers */}
                  <div className="bg-gradient-to-br from-[#DFF3F1] to-[#DFF3F1] p-8 md:p-10">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="ts-icon-teal">
                        <Users className="w-5 h-5" />
                      </div>
                      <h3 className="text-xl font-bold text-[#243B53]">خصومات الأعداد</h3>
                    </div>

                    <div className="space-y-3 mb-8">
                      {[
                        { range: "10–50 طالب", discount: "خصم 15%", color: "blue" },
                        { range: "50–100 طالب", discount: "خصم 25%", color: "teal" },
                        { range: "أكثر من 100 طالب", discount: "خصم 35%", color: "amber" },
                      ].map((tier, i) => (
                        <div key={i} className="bg-white rounded-xl p-4 flex items-center justify-between shadow-sm">
                          <span className="text-sm text-[#4A6278]">{tier.range}</span>
                          <span className={`font-bold text-lg ${
                            tier.color === "blue" ? "text-[#1E4E8C]" :
                            tier.color === "teal" ? "text-[#2BBDB6]" : "text-[#F4C46A]"
                          }`}>{tier.discount}</span>
                        </div>
                      ))}
                    </div>

                    <Link href="/contact">
                      <button className="ts-btn-primary w-full justify-center">
                        احصل على عرض سعر مخصص
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ Section ─────────────────────────────────────── */}
        <section className="py-20 bg-[#F4EFE8]">
          <div className="container">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-[#243B53] mb-3">أسئلة شائعة عن الأسعار</h2>
                <p className="text-[#4A6278]">إجابات واضحة على أكثر الأسئلة شيوعاً</p>
              </div>

              <div className="space-y-3">
                {[
                  {
                    q: "هل السعر يشمل التقرير الرسمي؟",
                    a: "نعم، جميع الباقات تشمل تقريراً رسمياً مفصلاً بصيغة PDF مع توصيات عملية للأهل والمدرسة."
                  },
                  {
                    q: "هل يمكن استرداد المبلغ؟",
                    a: "يمكن استرداد المبلغ كاملاً في حال الإلغاء قبل 24 ساعة من موعد الجلسة. نحن ملتزمون برضاك الكامل."
                  },
                  {
                    q: "هل هناك رسوم إضافية؟",
                    a: "لا، السعر المعلن يشمل كل شيء: الجلسة، التقرير، والمتابعة. لا توجد رسوم خفية من أي نوع."
                  },
                  {
                    q: "كيف يمكنني الدفع؟",
                    a: "نقبل الدفع عبر البطاقات الائتمانية (Visa, Mastercard, Mada) وApple Pay وSTC Pay."
                  },
                  {
                    q: "هل يمكن الدفع بالتقسيط؟",
                    a: "نعم، نوفر خيار التقسيط عبر تمارا وتابي لجميع الباقات بدون فوائد."
                  }
                ].map((faq, i) => (
                  <div key={i} className="ts-card rounded-2xl p-6">
                    <h3 className="font-semibold text-[#243B53] mb-2 text-base">{faq.q}</h3>
                    <p className="text-sm text-[#4A6278] leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>

              <div className="text-center mt-8">
                <Link href="/faq">
                  <button className="ts-btn-secondary">
                    عرض جميع الأسئلة الشائعة
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA Section ─────────────────────────────────────── */}
        <section className="py-20 bg-white">
          <div className="container">
            <div className="ts-cta-section max-w-4xl mx-auto">
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  جاهز للبدء؟
                </h2>
                <p className="text-blue-100 mb-8 text-lg max-w-xl mx-auto">
                  ابدأ بالفحص المجاني الآن، ثم احجز مع متخصص إذا أشارت النتائج إلى ذلك.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href="/start">
                    <button className="bg-white text-[#1E4E8C] font-semibold px-8 py-3 rounded-xl hover:bg-blue-50 transition-colors shadow-md">
                      ابدأ الفحص المجاني
                    </button>
                  </Link>
                  <Link href="/booking">
                    <button className="border-2 border-white/40 text-white font-semibold px-8 py-3 rounded-xl hover:bg-white/10 transition-colors">
                      احجز موعداً مباشرة
                    </button>
                  </Link>
                </div>
                <p className="text-blue-200 text-sm mt-5">
                  الفحص مجاني تماماً — لا يلزم إدخال بيانات الدفع
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
