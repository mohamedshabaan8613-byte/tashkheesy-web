/**
 * تشخيصي — صفحة رؤى الذكاء الاصطناعي
 * Editorial Healthcare Design System
 */
import Navbar from "@/components/Navbar";
import { useSEO } from "@/hooks/useSEO";
import Footer from "@/components/Footer";
import { Link } from "wouter";
import { Brain, Sparkles, Shield, Target, Layers, ChevronLeft, CheckCircle2, Zap, BookOpen, Users, Info, Heart, ArrowLeft, Star, MessageCircle } from "lucide-react";

const features = [
  { icon: Brain, title: "تحليل متعدد الأبعاد", desc: "يحلل الذكاء الاصطناعي إجاباتك عبر ٦ محاور معرفية متكاملة لتقديم صورة شاملة ودقيقة.", color: "blue" },
  { icon: Target, title: "تخصيص حسب العمر", desc: "يأخذ النظام في الاعتبار عمر الطفل وجنسه ومرحلته الدراسية لتقديم تفسير ملائم.", color: "teal" },
  { icon: Shield, title: "لغة آمنة وغير مُخيفة", desc: "صُمِّمت مخرجات الذكاء الاصطناعي بعناية لتكون مطمئنة وغير إكلينيكية مُفزِّعة.", color: "warm" },
  { icon: Layers, title: "شرح تفصيلي حسب المجال", desc: "يُقدّم النظام شرحاً منفصلاً لكل مجال: القراءة، الانتباه، الذاكرة، المعالجة البصرية.", color: "blue" },
  { icon: Zap, title: "توصيات فورية", desc: "بعد الفحص مباشرة، يُنشئ النظام توصيات عملية يمكن تطبيقها في المنزل والمدرسة.", color: "teal" },
  { icon: Users, title: "دعم قرار المتخصص", desc: "يُزوّد التقرير المتخصص بملخص منظّم يوفّر وقت التقييم ويُحسّن دقة التشخيص.", color: "warm" }
];

const howItWorks = [
  { step: "01", title: "جمع البيانات", desc: "يجمع النظام إجاباتك على أسئلة الفحص المُصمَّمة وفق معايير DSM-5 وICD-11." },
  { step: "02", title: "التحليل الذكي", desc: "يُعالج نموذج الذكاء الاصطناعي الإجابات عبر خوارزميات مدرَّبة على آلاف الحالات." },
  { step: "03", title: "توليد الشرح", desc: "يُنشئ النظام شرحاً مخصصاً بلغة عربية واضحة تراعي السياق الأسري والثقافي." },
  { step: "04", title: "التوصية بالخطوة التالية", desc: "يُقدّم النظام توصية واضحة بالخطوة الأنسب: متابعة منزلية أو استشارة متخصص." }
];

const principles = [
  "لا يُصدر النظام تشخيصاً طبياً — بل يُرشد نحو الفهم",
  "جميع الشروحات مراجَعة من متخصصين في صعوبات التعلم",
  "اللغة المستخدمة دافئة وغير قضائية",
  "النتائج سرية ولا تُشارَك مع أي طرف ثالث",
  "النظام يُكمل دور المتخصص ولا يحلّ محله"
];

export default function AIInsights() {
  useSEO({
    title: "رؤى الذكاء الاصطناعي | تشخيصي",
    description: "تعرّف على كيفية استخدام تشخيصي للذكاء الاصطناعي لتقديم شروحات مخصصة وموثوقة لنتائج فحص صعوبات التعلم.",
    canonical: "/ai-insights",
  });

  return (
    <div className="ts-page">
      <Navbar />
      <main className="flex-1">
        <section className="ts-page-header">
          <div className="container relative z-10">
            <div className="text-center max-w-3xl mx-auto">
              <span className="section-label block mb-4">محرّك الذكاء الاصطناعي</span>
              <h1 className="text-4xl md:text-5xl font-bold text-[#243B53] mb-5 leading-tight">
                كيف يُفسّر <span className="tashkhisi-gradient-text">الذكاء الاصطناعي</span> نتائجك؟
              </h1>
              <p className="text-lg text-[#4A6278] leading-relaxed max-w-2xl mx-auto">
                لا مجرد أرقام — بل شرح إنساني دقيق يُحوّل نتيجة الفحص إلى فهم حقيقي وخطوة عملية واضحة.
              </p>
            </div>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="container">
            <div className="text-center mb-14">
              <span className="section-label block mb-3">ما يُميّز محرّكنا</span>
              <h2 className="text-3xl font-bold text-[#243B53]">قدرات الذكاء الاصطناعي في تشخيصي</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {features.map((f, i) => (
                <div key={i} className="ts-card rounded-2xl p-6">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                    f.color === "blue" ? "bg-[#DFF3F1] text-[#1E4E8C]" :
                    f.color === "teal" ? "bg-[#DFF3F1] text-[#2BBDB6]" :
                    "bg-[#FFFBEB] text-[#F4C46A]"
                  }`}>
                    <f.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-[#243B53] mb-2">{f.title}</h3>
                  <p className="text-sm text-[#4A6278] leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-[#F4EFE8]">
          <div className="container">
            <div className="text-center mb-14">
              <span className="section-label block mb-3">خطوة بخطوة</span>
              <h2 className="text-3xl font-bold text-[#243B53]">كيف يعمل المحرّك؟</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {howItWorks.map((step, i) => (
                <div key={i} className="ts-card rounded-2xl p-6 relative">
                  <div className="text-4xl font-black text-[#1E4E8C]/10 mb-3">{step.step}</div>
                  <h3 className="font-bold text-[#243B53] mb-2">{step.title}</h3>
                  <p className="text-sm text-[#4A6278] leading-relaxed">{step.desc}</p>
                  {i < howItWorks.length - 1 && (
                    <div className="hidden lg:flex absolute -left-3 top-1/2 -translate-y-1/2 z-10">
                      <ChevronLeft className="w-6 h-6 text-[#1E4E8C]/30" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <span className="section-label block mb-3">مبادئنا الأساسية</span>
                  <h2 className="text-3xl font-bold text-[#243B53] mb-6">الذكاء الاصطناعي بمسؤولية</h2>
                  <p className="text-[#4A6278] leading-relaxed mb-8">
                    نؤمن بأن الذكاء الاصطناعي في الرعاية الصحية يجب أن يكون شفافاً وأخلاقياً ومسؤولاً.
                  </p>
                  <div className="space-y-3">
                    {principles.map((p, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-[#2BBDB6] flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-[#4A6278]">{p}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-[#DFF3F1] to-[#DFF3F1] rounded-3xl p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                      <Sparkles className="w-6 h-6 text-[#1E4E8C]" />
                    </div>
                    <div>
                      <p className="font-bold text-[#243B53]">نموذج الشرح</p>
                      <p className="text-xs text-[#4A6278]">مثال على مخرجات الذكاء الاصطناعي</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl p-5 shadow-sm">
                    <p className="text-sm text-[#243B53] leading-relaxed mb-4">
                      <span className="font-semibold text-[#1E4E8C]">تحليل مجال القراءة:</span>{" "}
                      تُظهر الإجابات أنماطاً تتوافق مع صعوبات في الطلاقة القرائية. هذا لا يعني ضعف الذكاء — كثير من الأطفال الموهوبين يواجهون هذه الصعوبة وتتحسن بشكل ملحوظ مع الدعم المناسب.
                    </p>
                    <div className="flex items-center gap-2 text-xs text-[#4A6278]">
                      <Shield className="w-3.5 h-3.5 text-[#2BBDB6]" />
                      <span>مراجَع من متخصص معتمد</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── قسم قصة AI للحكام ─── */}
        <section className="py-20 bg-[#F4EFE8]">
          <div className="container">
            <div className="text-center mb-14">
              <span className="section-label block mb-3">شفافية كاملة</span>
              <h2
                className="text-3xl font-bold text-[#243B53] mb-4"
                style={{ fontFamily: "'Cairo', sans-serif" }}
              >
                قصة الذكاء الاصطناعي في{" "}
                <span
                  style={{
                    background: "linear-gradient(135deg, #1E4E8C 0%, #2BBDB6 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  تشخيصي
                </span>
              </h2>
              <p
                className="text-[#4A6278] max-w-2xl mx-auto leading-relaxed"
                style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.8 }}
              >
                كيف بنينا محرك التحليل — ولماذا صممناه بهذه الطريقة تحديداً
              </p>
            </div>

            {/* الخط الزمني لقصة AI */}
            <div className="max-w-4xl mx-auto">
              {/* بطاقة المشكلة */}
              <div
                className="rounded-3xl p-6 sm:p-8 mb-6 relative overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, #243B53 0%, #1e3a8a 55%, #0f766e 100%)",
                  boxShadow: "0 20px 60px rgba(15,23,42,0.22)",
                }}
              >
                <div
                  className="absolute inset-0 pointer-events-none opacity-10"
                  style={{
                    backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)",
                    backgroundSize: "28px 28px",
                  }}
                />
                <div className="relative">
                  <div className="flex items-start gap-4 mb-6">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }}
                    >
                      <span className="text-2xl">❓</span>
                    </div>
                    <div>
                      <h3
                        className="text-lg font-black text-white mb-1"
                        style={{ fontFamily: "'Cairo', sans-serif" }}
                      >
                        المشكلة التي أردنا حلها
                      </h3>
                      <p
                        className="text-blue-200 text-sm leading-relaxed"
                        style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.8 }}
                      >
                        الأهل يرون أرقام الفحص لكن لا يفهمون ماذا تعني — فيشعرون بالقلق والضياع. التشخيص الطبي التقليدي يستغرق أشهراً ويكلف آلاف الريالات — وكثير من الأسر لا تصل إليه أبداً.
                      </p>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-4">
                    {[
                      { icon: "📊", label: "أرقام بدون سياق", color: "rgba(252,165,165,0.15)", border: "rgba(252,165,165,0.25)" },
                      { icon: "⏳", label: "انتظار أشهر للتشخيص", color: "rgba(252,211,77,0.15)", border: "rgba(252,211,77,0.25)" },
                      { icon: "💸", label: "تكلفة باهظة للتقييم", color: "rgba(252,165,165,0.15)", border: "rgba(252,165,165,0.25)" },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="rounded-2xl p-4 flex items-center gap-3"
                        style={{ background: item.color, border: `1px solid ${item.border}` }}
                      >
                        <span className="text-2xl">{item.icon}</span>
                        <span
                          className="text-sm text-white font-medium"
                          style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                        >
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* سهم الانتقال */}
              <div className="flex justify-center mb-6">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: "#DFF3F1", border: "2px solid #DBEAFE" }}
                >
                  <ArrowLeft size={18} className="text-blue-600 rotate-90" />
                </div>
              </div>

              {/* بطاقة الحل */}
              <div
                className="rounded-3xl p-6 sm:p-8 mb-6"
                style={{
                  background: "linear-gradient(135deg, #ECFDF5 0%, #DFF3F1 100%)",
                  border: "1.5px solid rgba(20,184,166,0.25)",
                  boxShadow: "0 8px 32px rgba(20,184,166,0.1)",
                }}
              >
                <div className="flex items-start gap-4 mb-6">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(20,184,166,0.15)", border: "1px solid rgba(20,184,166,0.25)" }}
                  >
                    <Brain size={22} className="text-teal-600" />
                  </div>
                  <div>
                    <h3
                      className="text-lg font-black text-slate-900 mb-1"
                      style={{ fontFamily: "'Cairo', sans-serif" }}
                    >
                      حلنا: شرح فوري بلغة إنسانية
                    </h3>
                    <p
                      className="text-slate-600 text-sm leading-relaxed"
                      style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.8 }}
                    >
                      بعد إتمام الفحص، يُحلّل نظام الذكاء الاصطناعي كل إجابة عبر ٦ محاور معرفية، ويُنشئ شرحاً مخصصاً يُجيب على أربعة أسئلة جوهرية.
                    </p>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    { q: "ما الذي رصده الفحص؟", color: "#1E4E8C", bg: "#DFF3F1" },
                    { q: "ماذا قد يعني ذلك؟", color: "#2BBDB6", bg: "#DFF3F1" },
                    { q: "لماذا يهمّ ذلك؟", color: "#059669", bg: "#ECFDF5" },
                    { q: "ما الخطوة التالية الأنسب؟", color: "#D97706", bg: "#FFFBEB" },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="rounded-xl p-3 flex items-center gap-3"
                      style={{ background: item.bg, border: `1px solid ${item.color}20` }}
                    >
                      <div
                        className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-black"
                        style={{ background: item.color, color: "white", fontFamily: "'Cairo', sans-serif" }}
                      >
                        {i + 1}
                      </div>
                      <span
                        className="text-sm font-semibold"
                        style={{ color: item.color, fontFamily: "'Cairo', sans-serif" }}
                      >
                        {item.q}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* مبدأ الشفافية */}
              <div
                className="rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4"
                style={{
                  background: "white",
                  border: "1.5px solid #DFF3F1",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "#DFF3F1" }}
                >
                  <Info size={18} className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <p
                    className="text-sm font-bold text-slate-800 mb-1"
                    style={{ fontFamily: "'Cairo', sans-serif" }}
                  >
                    مبدأ الشفافية الكاملة
                  </p>
                  <p
                    className="text-xs text-slate-500 leading-relaxed"
                    style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.7 }}
                  >
                    كل شرح يُنشئه الذكاء الاصطناعي يحمل تنبيهاً واضحاً: "هذا شرح توجيهي — ليس تشخيصاً طبياً". نؤمن بأن الأهل يستحقون معرفة حدود التكنولوجيا التي يستخدمونها.
                  </p>
                </div>
                <div
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl flex-shrink-0"
                  style={{ background: "#ECFDF5", border: "1px solid rgba(5,150,105,0.2)" }}
                >
                  <CheckCircle2 size={13} className="text-emerald-600" />
                  <span
                    className="text-xs font-semibold text-emerald-700"
                    style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                  >
                    ملتزمون بهذا المبدأ
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-[#F4EFE8]">
          <div className="container">
            <div className="text-center mb-12">
              <span className="section-label block mb-3">اعرف أكثر</span>
              <h2 className="text-3xl font-bold text-[#243B53]">مصادر ذات صلة</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                { icon: BookOpen, title: "مكتبة المعرفة", desc: "مقالات وأدلة حول صعوبات التعلم", href: "/knowledge" },
                { icon: Brain, title: "جرّب الفحص", desc: "اختبر محرّك الذكاء الاصطناعي بنفسك", href: "/result-demo" },
                { icon: Users, title: "تواصل مع متخصص", desc: "احجز استشارة مع أحد خبرائنا", href: "/booking" },
              ].map((r, i) => (
                <Link key={i} href={r.href}>
                  <div className="ts-card rounded-2xl p-6 flex flex-col items-center text-center cursor-pointer group">
                    <div className="w-12 h-12 bg-[#DFF3F1] text-[#1E4E8C] rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#DBEAFE] transition-colors">
                      <r.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-[#243B53] mb-1">{r.title}</h3>
                    <p className="text-sm text-[#4A6278]">{r.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="container">
            <div className="ts-cta-section max-w-4xl mx-auto">
              <div className="relative z-10 text-center">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">جاهز لرؤية الذكاء الاصطناعي في العمل؟</h2>
                <p className="text-blue-100 mb-6">ابدأ الفحص الآن وستحصل على شرح مفصّل فور الانتهاء.</p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <Link href="/children">
                    <button className="bg-white text-[#1E4E8C] font-semibold px-8 py-3 rounded-xl hover:bg-blue-50 transition-colors shadow-md">
                      ابدأ الفحص المجاني
                    </button>
                  </Link>
                  <Link href="/result-demo">
                    <button className="border-2 border-white/40 text-white font-semibold px-8 py-3 rounded-xl hover:bg-white/10 transition-colors">
                      شاهد نموذج النتائج
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
