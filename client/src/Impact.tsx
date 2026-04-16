/**
 * Impact.tsx — صفحة "الرؤية والأثر"
 * ─────────────────────────────────────────────────────────────────
 * Design Philosophy: Editorial Healthcare — Calm, Credible, Human
 * Palette: #F4EFE8 bg | #FFFFFF surface | #243B53 text | #1E4E8C primary | #2BBDB6 teal | #F4C46A warm
 * Typography: Cairo (headings) + IBM Plex Sans Arabic (body)
 * Purpose: سرد قوي للهاكاثون — المشكلة الخفية، دور AI، الأثر الاجتماعي
 * Tone: دافئ، موثوق، غير طبي، عربي أولاً
 * ─────────────────────────────────────────────────────────────────
 */

import { useEffect, useRef, useState } from "react";
import { useSEO } from "@/hooks/useSEO";
import { Link } from "wouter";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import {
  Brain,
  Clock,
  Heart,
  Shield,
  Users,
  TrendingUp,
  BookOpen,
  Sparkles,
  ArrowLeft,
  CheckCircle,
  Globe,
  Lightbulb,
  Target,
  ChevronRight,
  AlertCircle,
  Compass,
  Eye,
  MessageCircle,
  Layers,
} from "lucide-react";

// ─── Fade In Hook ─────────────────────────────────────────────────
function useFadeIn(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);
  return { ref, visible };
}

// ─── Section Label ─────────────────────────────────────────────────
function SectionLabel({ children, color = "#1E4E8C" }: { children: React.ReactNode; color?: string }) {
  return (
    <span
      className="inline-flex items-center gap-2 text-xs font-bold px-4 py-1.5 rounded-full mb-5"
      style={{
        color,
        background: `${color}12`,
        border: `1px solid ${color}25`,
        fontFamily: "'IBM Plex Sans Arabic', sans-serif",
        letterSpacing: "0.06em",
      }}
    >
      {children}
    </span>
  );
}

// ─── Fade Card ────────────────────────────────────────────────────
function FadeCard({ children, delay = 0, className = "", style = {} }: {
  children: React.ReactNode; delay?: number; className?: string; style?: React.CSSProperties;
}) {
  const { ref, visible } = useFadeIn();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────
export default function Impact() {
  useSEO({
    title: "الرؤية والأثر",
    description: "تعرّف على رؤية تشخيصي وأثرها في دعم الأطفال وأسرهم — منصة الفحص المبكر لصعوبات التعلم وفرط الحركة وتشتت الانتباه.",
    canonical: "/impact",
  });
  return (
    <div
      className="min-h-screen"
      dir="rtl"
      style={{ background: "#F4EFE8", fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
    >
      <Navbar />

      {/* ════════════════════════════════════════════════════════════
          1. HERO — Problem-led, strong Arabic headline
      ════════════════════════════════════════════════════════════ */}
      <section
        className="relative pt-28 pb-24 lg:pt-36 lg:pb-32 overflow-hidden"
        style={{ background: "linear-gradient(160deg, #F0F7FF 0%, #F4EFE8 55%, #DFF3F1 100%)" }}
      >
        {/* Decorative blobs */}
        <div
          className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(circle, #1E4E8C 0%, transparent 70%)", transform: "translate(30%, -30%)" }}
        />
        <div
          className="absolute bottom-0 left-0 w-96 h-96 rounded-full opacity-15 blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(circle, #2BBDB6 0%, transparent 70%)", transform: "translate(-30%, 30%)" }}
        />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Breadcrumb */}
          <nav className="flex items-center justify-center gap-2 text-sm mb-8" style={{ color: "#64748B" }}>
            <Link href="/" className="hover:text-blue-600 transition-colors" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>
              الرئيسية
            </Link>
            <ChevronRight size={14} className="opacity-50" />
            <span style={{ color: "#1E4E8C", fontWeight: 600 }}>الرؤية والأثر</span>
          </nav>

          <SectionLabel color="#2BBDB6">
            <Sparkles size={12} />
            المشكلة والأثر
          </SectionLabel>

          <h1
            className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black mb-6"
            style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900, color: "#243B53", lineHeight: 1.2 }}
          >
            كثير من الأطفال يعانون في صمت
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, #1E4E8C 0%, #2BBDB6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              لأن أحداً لم يعرف من أين يبدأ
            </span>
          </h1>

          <p
            className="text-base sm:text-lg lg:text-xl max-w-2xl mx-auto mb-8 sm:mb-10"
            style={{ color: "#4A6278", fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.85 }}
          >
            صعوبات التعلم وتحديات الانتباه غالباً ما تكون خفية — الأسرة تلاحظ شيئاً ما، لكنها لا تعرف كيف تبدأ.
            تشخيصي وُجد ليكون تلك الخطوة الأولى الأكثر وضوحاً.
          </p>

          <div className="flex flex-col items-stretch sm:flex-row sm:items-center justify-center gap-3 sm:gap-4 mb-8 sm:mb-10 px-2 sm:px-0">
            <Link
              href="/start"
              className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 rounded-xl font-bold text-white transition-all hover:shadow-lg hover:-translate-y-0.5 w-full sm:w-auto"
              style={{
                background: "linear-gradient(135deg, #1E4E8C 0%, #1A3F73 100%)",
                fontFamily: "'Cairo', sans-serif",
                fontWeight: 700,
                fontSize: "1rem",
                boxShadow: "0 4px 14px rgba(37,99,235,0.3)",
              }}
            >
              ابدأ الفحص الأولي — مجاناً
              <ArrowLeft size={18} />
            </Link>
            <a
              href="#problem"
              className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 rounded-xl font-semibold transition-all hover:bg-blue-50 w-full sm:w-auto"
              style={{
                border: "1.5px solid #CBD5E1",
                color: "#4A6278",
                fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                fontSize: "0.95rem",
              }}
            >
              اقرأ القصة كاملة
            </a>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-6">
            {[
              { icon: <Shield size={14} />, text: "خصوصية تامة" },
              { icon: <CheckCircle size={14} />, text: "مجاني بالكامل" },
              { icon: <Clock size={14} />, text: "١٥ دقيقة فقط" },
              { icon: <Globe size={14} />, text: "عربي أولاً" },
            ].map((badge, i) => (
              <div key={i} className="flex items-center gap-1.5 text-sm" style={{ color: "#64748B", fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>
                <span style={{ color: "#2BBDB6" }}>{badge.icon}</span>
                {badge.text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          2. THE HIDDEN BARRIER — Problem framing
      ════════════════════════════════════════════════════════════ */}
      <section id="problem" className="py-20 lg:py-28" style={{ background: "#FFFFFF" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <SectionLabel color="#EF4444">
              <AlertCircle size={12} />
              المشكلة الخفية
            </SectionLabel>
            <h2
              className="text-3xl lg:text-4xl font-black mb-4"
              style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900, color: "#243B53" }}
            >
              الحاجز الحقيقي ليس الإعاقة — بل غياب الوضوح
            </h2>
            <p
              className="text-base max-w-2xl mx-auto"
              style={{ color: "#4A6278", fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.85 }}
            >
              معظم صعوبات التعلم لا تظهر بوضوح في البداية. وهذا بالضبط ما يجعلها أكثر خطورة على المدى البعيد.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: <Eye size={20} />,
                title: "مؤشرات خفية",
                desc: "صعوبات التعلم لا تبدو دائماً واضحة. كثير من الأطفال يُعوّضون بجهد مضاعف — مما يجعل المشكلة تمر دون أن يلاحظها أحد.",
                color: "#EF4444",
              },
              {
                icon: <Compass size={20} />,
                title: "الأسرة تلاحظ لكن لا تعرف",
                desc: "الأهل يشعرون أن شيئاً ما ليس على ما يرام، لكن لا يعرفون هل يتحدثون مع المعلمة أم الطبيب أم المرشد — فيبقون في دائرة الحيرة.",
                color: "#F4C46A",
              },
              {
                icon: <Clock size={20} />,
                title: "التأخير يُراكم الأثر",
                desc: "كل فصل دراسي بدون فهم يعني فجوة أكاديمية أكبر، وثقة بالنفس أقل، وصعوبة أكبر في اللحاق لاحقاً.",
                color: "#8B5CF6",
              },
              {
                icon: <Layers size={20} />,
                title: "الخيارات مشتتة ومكلفة",
                desc: "التقييم التقليدي يتطلب أشهراً من الانتظار وآلاف الريالات — مما يجعل كثيراً من الأسر تتأخر في اتخاذ الخطوة الأولى.",
                color: "#1E4E8C",
              },
            ].map((item, i) => (
              <FadeCard key={i} delay={i * 100}>
                <div
                  className="p-6 rounded-2xl h-full hover:-translate-y-1 transition-all duration-300"
                  style={{ background: "#F4EFE8", border: `1px solid ${item.color}20` }}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: `${item.color}12` }}
                  >
                    <span style={{ color: item.color }}>{item.icon}</span>
                  </div>
                  <h3
                    className="text-base font-bold mb-2"
                    style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 700, color: "#243B53" }}
                  >
                    {item.title}
                  </h3>
                  <p
                    className="text-sm"
                    style={{ color: "#4A6278", fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.8 }}
                  >
                    {item.desc}
                  </p>
                </div>
              </FadeCard>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          3. HUMAN STORY — Illustrative, respectful, non-dramatic
      ════════════════════════════════════════════════════════════ */}
      <section className="py-20 lg:py-28" style={{ background: "#F4EFE8" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeCard>
            <div
              className="rounded-3xl overflow-hidden"
              style={{ border: "1px solid #D8E8E7", background: "#FFFFFF" }}
            >
              {/* Top accent bar */}
              <div
                className="h-1 w-full"
                style={{ background: "linear-gradient(90deg, #1E4E8C, #2BBDB6)" }}
              />

              <div className="p-8 lg:p-12">
                <div className="flex items-center gap-3 mb-8">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: "#DFF3F1" }}
                  >
                    <MessageCircle size={18} style={{ color: "#1E4E8C" }} />
                  </div>
                  <div>
                    <p
                      className="text-xs font-bold text-blue-600 uppercase"
                      style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", letterSpacing: "0.08em" }}
                    >
                      قصة توضيحية
                    </p>
                    <p
                      className="text-xs text-slate-400"
                      style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                    >
                      تعكس تجارب حقيقية يرويها أهل وطلاب
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {[
                    {
                      emoji: "👦",
                      text: "ريان، ثمانية أعوام، يبذل جهداً مضاعفاً في القراءة كل يوم — لكن النتائج لا تعكس ما يبذله.",
                      color: "#1E4E8C",
                    },
                    {
                      emoji: "👨‍👩‍👦",
                      text: "أسرته تلاحظ أنه يتعب بسرعة من الكتابة، وأحياناً يقلب الحروف — لكنها لا تعرف هل هذا طبيعي في هذه السن أم يستحق متابعة.",
                      color: "#2BBDB6",
                    },
                    {
                      emoji: "💡",
                      text: "بعد فحص أولي أوضح أن لديه مؤشرات تستحق تقييماً متخصصاً، توجهت الأسرة بثقة نحو الخطوة التالية — بدلاً من الانتظار سنوات أخرى.",
                      color: "#F4C46A",
                    },
                  ].map((line, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <span className="text-2xl flex-shrink-0 mt-0.5">{line.emoji}</span>
                      <p
                        className="text-base"
                        style={{
                          color: "#334155",
                          fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                          lineHeight: 1.85,
                        }}
                      >
                        {line.text}
                      </p>
                    </div>
                  ))}
                </div>

                <div
                  className="mt-8 pt-6 flex items-start gap-3"
                  style={{ borderTop: "1px solid #DFF3F1" }}
                >
                  <div
                    className="w-1 rounded-full flex-shrink-0 mt-1"
                    style={{ height: "52px", background: "linear-gradient(180deg, #1E4E8C, #2BBDB6)" }}
                  />
                  <p
                    className="text-sm font-medium"
                    style={{ color: "#4A6278", fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.85 }}
                  >
                    هذا ما تفعله تشخيصي — لا تُصدر حكماً، بل تُقدّم وضوحاً. وضوح يُمكّن الأسرة من اتخاذ الخطوة الصحيحة في الوقت المناسب.
                  </p>
                </div>
              </div>
            </div>
          </FadeCard>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          4. WHY EARLY ACTION MATTERS
      ════════════════════════════════════════════════════════════ */}
      <section className="py-20 lg:py-28" style={{ background: "#FFFFFF" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <SectionLabel color="#2BBDB6">
              <Clock size={12} />
              لماذا التبكير مهم؟
            </SectionLabel>
            <h2
              className="text-3xl lg:text-4xl font-black mb-4"
              style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900, color: "#243B53" }}
            >
              الفهم المبكر يُغيّر المسار
            </h2>
            <p
              className="text-base max-w-2xl mx-auto"
              style={{ color: "#4A6278", fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.85 }}
            >
              الفهم المبكر لا يعني التشخيص الفوري — بل يعني أن الأسرة تملك خارطة طريق واضحة
              بدلاً من الحيرة والانتظار.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                step: "١",
                icon: <Lightbulb size={18} />,
                title: "الفهم يُزيل الحيرة والقلق",
                desc: "عندما تعرف الأسرة أن ما تلاحظه له تفسير، يتحول القلق إلى طاقة إيجابية نحو الحل. الوضوح وحده يُحدث فارقاً كبيراً في كيفية التعامل مع الموقف.",
                color: "#1E4E8C",
              },
              {
                step: "٢",
                icon: <Target size={18} />,
                title: "الخطوات الأذكى تبدأ مبكراً",
                desc: "الدعم المبكر يمنع تراكم الفجوات الأكاديمية ويُمكّن الطالب من الوصول لإمكاناته الحقيقية. كل فصل دراسي بوضوح أفضل من فصل بدونه.",
                color: "#2BBDB6",
              },
              {
                step: "٣",
                icon: <Heart size={18} />,
                title: "الثقة بالنفس تُبنى بالوضوح",
                desc: "الطفل الذي يُفهم أسلوب تعلمه يبني علاقة صحية مع التعلم بدلاً من الإحساس بالنقص. هذا الأثر النفسي لا يُقدَّر بثمن.",
                color: "#F4C46A",
              },
              {
                step: "٤",
                icon: <TrendingUp size={18} />,
                title: "المتابعة المنظمة تُحدث أثراً حقيقياً",
                desc: "رحلة الدعم لا تنتهي عند أول نتيجة — بل تبدأ منها. الخطوة الأولى الواضحة تُفتح الباب أمام سلسلة من الخطوات الصحيحة.",
                color: "#8B5CF6",
              },
            ].map((item, i) => (
              <FadeCard key={i} delay={i * 100}>
                <div
                  className="flex gap-5 p-6 rounded-2xl h-full"
                  style={{ background: "#F4EFE8", border: `1px solid ${item.color}20` }}
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 font-black text-white text-lg"
                    style={{ background: `linear-gradient(135deg, ${item.color} 0%, ${item.color}CC 100%)`, fontFamily: "'Cairo', sans-serif" }}
                  >
                    {item.step}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span style={{ color: item.color }}>{item.icon}</span>
                      <h3
                        className="text-base font-bold"
                        style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 700, color: "#243B53" }}
                      >
                        {item.title}
                      </h3>
                    </div>
                    <p
                      className="text-sm"
                      style={{ color: "#4A6278", fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.8 }}
                    >
                      {item.desc}
                    </p>
                  </div>
                </div>
              </FadeCard>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          5. WHY TASHKHEESY — Platform positioning
      ════════════════════════════════════════════════════════════ */}
      <section className="py-20 lg:py-28" style={{ background: "#F4EFE8" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <SectionLabel color="#1E4E8C">
              <Sparkles size={12} />
              الرؤية والأثر
            </SectionLabel>
            <h2
              className="text-3xl lg:text-4xl font-black mb-4"
              style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900, color: "#243B53" }}
            >
              الجسر من القلق إلى الوضوح
            </h2>
            <p
              className="text-base max-w-2xl mx-auto"
              style={{ color: "#4A6278", fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.85 }}
            >
              تشخيصي ليست بديلاً عن المتخصص — بل هي الخطوة التي تُمكّن الأسرة من الوصول إليه
              بثقة وبفهم أوضح.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {[
              {
                icon: <Globe size={22} />,
                title: "عربي أولاً",
                desc: "مصمّم للسياق العربي — اللغة، الثقافة، الحساسيات الاجتماعية. ليس ترجمة لأداة غربية، بل حل مبني من الداخل.",
                color: "#1E4E8C",
              },
              {
                icon: <Brain size={22} />,
                title: "مدعوم بالذكاء الاصطناعي",
                desc: "الذكاء الاصطناعي يُنظّم إجاباتك ويُقدّم شرحاً منظماً — لا يُصدر أحكاماً، بل يُضيء الصورة ويُساعدك على معرفة من أين تبدأ.",
                color: "#2BBDB6",
              },
              {
                icon: <Shield size={22} />,
                title: "آمن عاطفياً",
                desc: "لغة دافئة وغير مُقلقة. لا وصمة، لا أحكام، لا مصطلحات طبية مُخيفة. فضاء آمن للأسرة لتبدأ رحلة الفهم.",
                color: "#F4C46A",
              },
              {
                icon: <Target size={22} />,
                title: "خطوة أولى واضحة",
                desc: "بدلاً من الضياع بين الخيارات المتشتتة، تشخيصي تُقدّم بداية منظمة — فحص، شرح، توجيه نحو الخطوة التالية.",
                color: "#8B5CF6",
              },
              {
                icon: <Users size={22} />,
                title: "للأسرة والطالب معاً",
                desc: "سواء كنت أحد الوالدين تبحث عن فهم لطفلك، أو طالباً يلاحظ تحديات في مسيرته الأكاديمية — تشخيصي مصمّمة لك.",
                color: "#EF4444",
              },
              {
                icon: <BookOpen size={22} />,
                title: "جسر نحو المتخصص",
                desc: "تشخيصي لا تنهي الرحلة — بل تبدأها. نتائج الفحص تُساعدك على الوصول إلى المتخصص بفهم أوضح وسؤال أدق.",
                color: "#2BBDB6",
              },
            ].map((item, i) => (
              <FadeCard key={i} delay={i * 80}>
                <div
                  className="p-6 rounded-2xl h-full hover:-translate-y-1 transition-all duration-300"
                  style={{ background: "#FFFFFF", border: "1px solid #D8E8E7", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: `${item.color}10` }}
                  >
                    <span style={{ color: item.color }}>{item.icon}</span>
                  </div>
                  <h3
                    className="text-base font-bold mb-2"
                    style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 700, color: "#243B53" }}
                  >
                    {item.title}
                  </h3>
                  <p
                    className="text-sm"
                    style={{ color: "#4A6278", fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.8 }}
                  >
                    {item.desc}
                  </p>
                </div>
              </FadeCard>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          6. AI ROLE — Responsible, transparent, non-overstated
      ════════════════════════════════════════════════════════════ */}
      <section className="py-20 lg:py-28" style={{ background: "#FFFFFF" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <SectionLabel color="#8B5CF6">
              <Brain size={12} />
              دور الذكاء الاصطناعي
            </SectionLabel>
            <h2
              className="text-3xl lg:text-4xl font-black mb-4"
              style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900, color: "#243B53" }}
            >
              الذكاء الاصطناعي يُضيء — لا يُصدر أحكاماً
            </h2>
            <p
              className="text-base max-w-2xl mx-auto"
              style={{ color: "#4A6278", fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.85 }}
            >
              نؤمن بالشفافية الكاملة في كيفية استخدام الذكاء الاصطناعي. إليك ما يفعله وما لا يفعله.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* What AI does */}
            <FadeCard>
              <div
                className="rounded-2xl p-7 h-full"
                style={{ background: "#F0FDF4", border: "1px solid #BBF7D0" }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#DCFCE7" }}>
                    <CheckCircle size={18} style={{ color: "#16A34A" }} />
                  </div>
                  <h3
                    className="text-lg font-bold"
                    style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 700, color: "#243B53" }}
                  >
                    ما يفعله الذكاء الاصطناعي
                  </h3>
                </div>
                <div className="space-y-4">
                  {[
                    "يُنظّم إجاباتك ويُحوّلها إلى شرح منظم وقابل للفهم",
                    "يُحدّد المجالات التي تستحق متابعة أكثر من غيرها",
                    "يُقدّم توجيهاً واضحاً حول الخطوة التالية الأنسب",
                    "يُساعدك على معرفة الأسئلة الصحيحة التي تطرحها على المتخصص",
                    "يُقدّم المعلومات بلغة دافئة وغير مُقلقة",
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle size={16} className="flex-shrink-0 mt-0.5" style={{ color: "#16A34A" }} />
                      <p
                        className="text-sm"
                        style={{ color: "#374151", fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.75 }}
                      >
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </FadeCard>

            {/* What AI doesn't do */}
            <FadeCard delay={100}>
              <div
                className="rounded-2xl p-7 h-full"
                style={{ background: "#FFF7ED", border: "1px solid #FED7AA" }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#FFEDD5" }}>
                    <AlertCircle size={18} style={{ color: "#EA580C" }} />
                  </div>
                  <h3
                    className="text-lg font-bold"
                    style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 700, color: "#243B53" }}
                  >
                    ما لا يفعله الذكاء الاصطناعي
                  </h3>
                </div>
                <div className="space-y-4">
                  {[
                    "لا يُصدر تشخيصاً طبياً أو نفسياً رسمياً",
                    "لا يُحدّد نوع الإعاقة أو الاضطراب بشكل قاطع",
                    "لا يُغني عن التقييم الشامل من متخصص معتمد",
                    "لا يُقدّم توصيات علاجية أو دوائية",
                    "لا يُخزّن بياناتك أو يُشاركها مع أي جهة",
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5" style={{ borderColor: "#EA580C" }} />
                      <p
                        className="text-sm"
                        style={{ color: "#374151", fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.75 }}
                      >
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </FadeCard>
          </div>

          {/* AI principle statement */}
          <FadeCard delay={200}>
            <div
              className="mt-8 rounded-2xl p-7"
              style={{ background: "#F5F3FF", border: "1px solid #DDD6FE" }}
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#EDE9FE" }}>
                  <Lightbulb size={18} style={{ color: "#7C3AED" }} />
                </div>
                <div>
                  <h4
                    className="text-base font-bold mb-2"
                    style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 700, color: "#243B53" }}
                  >
                    مبدأ الشفافية الكاملة
                  </h4>
                  <p
                    className="text-sm"
                    style={{ color: "#4A6278", fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.85 }}
                  >
                    الذكاء الاصطناعي في تشخيصي أداة دعم للفهم — وليس بديلاً عن الحكم الإنساني المتخصص.
                    نتائج الفحص هي <strong style={{ color: "#7C3AED" }}>مؤشرات توجيهية أولية</strong>، مُراجَعة من متخصصين،
                    وتُقدَّم دائماً مع توصية واضحة بالتواصل مع متخصص معتمد للتقييم الشامل.
                  </p>
                </div>
              </div>
            </div>
          </FadeCard>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          7. SOCIAL RELEVANCE — Arab context, KSCDR alignment
      ════════════════════════════════════════════════════════════ */}
      <section className="py-20 lg:py-28" style={{ background: "#F4EFE8" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <SectionLabel color="#2BBDB6">
              <Globe size={12} />
              الأثر الاجتماعي
            </SectionLabel>
            <h2
              className="text-3xl lg:text-4xl font-black mb-4"
              style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900, color: "#243B53" }}
            >
              لماذا يهم هذا الآن في السياق العربي؟
            </h2>
            <p
              className="text-base max-w-2xl mx-auto"
              style={{ color: "#4A6278", fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.85 }}
            >
              صعوبات التعلم وتحديات الانتباه حاضرة في كل مجتمع — لكن الوصول إلى الدعم في العالم العربي
              يواجه تحديات إضافية تجعل الحل الرقمي العربي ضرورة وليس رفاهية.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {[
              {
                icon: "🌐",
                title: "فجوة الوصول",
                desc: "كثير من الأسر في المناطق البعيدة لا تستطيع الوصول إلى متخصصين. الحل الرقمي يُزيل هذا الحاجز الجغرافي.",
                color: "#1E4E8C",
              },
              {
                icon: "🤝",
                title: "الوصمة الاجتماعية",
                desc: "في كثير من السياقات العربية، البحث عن مساعدة نفسية أو تعليمية يحمل وصمة. تشخيصي توفر فضاءً خاصاً وآمناً للبداية.",
                color: "#2BBDB6",
              },
              {
                icon: "📚",
                title: "فجوة المحتوى العربي",
                desc: "معظم أدوات الفحص المتاحة مُترجمة من الإنجليزية وغير مُكيَّفة ثقافياً. تشخيصي مبنية من الصفر للسياق العربي.",
                color: "#F4C46A",
              },
            ].map((item, i) => (
              <FadeCard key={i} delay={i * 100}>
                <div
                  className="p-6 rounded-2xl text-center h-full"
                  style={{ background: "#FFFFFF", border: "1px solid #D8E8E7" }}
                >
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h3
                    className="text-base font-bold mb-3"
                    style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 700, color: "#243B53" }}
                  >
                    {item.title}
                  </h3>
                  <p
                    className="text-sm"
                    style={{ color: "#4A6278", fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.8 }}
                  >
                    {item.desc}
                  </p>
                </div>
              </FadeCard>
            ))}
          </div>

          {/* KSCDR alignment card */}
          <FadeCard delay={300}>
            <div
              className="rounded-3xl p-8"
              style={{
                background: "linear-gradient(135deg, #243B53 0%, #1E3A5F 60%, #0F4C4C 100%)",
                boxShadow: "0 20px 60px rgba(15,23,42,0.15)",
              }}
            >
              <div className="flex flex-col lg:flex-row items-start gap-8">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-yellow-400 text-xl">🏆</span>
                    <p
                      className="text-sm font-bold text-yellow-300"
                      style={{ fontFamily: "'Cairo', sans-serif" }}
                    >
                      هاكاثون الذكاء الاصطناعي في مجال الإعاقة · KSCDR 2026
                    </p>
                  </div>
                  <h3
                    className="text-xl font-black text-white mb-3"
                    style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900 }}
                  >
                    تشخيصي ضمن مسار التعليم والوصول للمعرفة
                  </h3>
                  <p
                    className="text-sm text-blue-200 mb-5"
                    style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.85 }}
                  >
                    صعوبات التعلم مُصنَّفة ضمن الإعاقات التعليمية في DSM-5 وICD-11 واتفاقية الأمم المتحدة لحقوق ذوي الإعاقة (CRPD).
                    تشخيصي تُعالج الحاجز الأول في مسار الوصول إلى الدعم لهذه الفئة.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { label: "DSM-5", color: "#60A5FA" },
                      { label: "ICD-11", color: "#34D399" },
                      { label: "CRPD", color: "#FCD34D" },
                    ].map((s, i) => (
                      <span
                        key={i}
                        className="text-xs font-black px-3 py-1 rounded-lg"
                        style={{
                          background: `${s.color}18`,
                          color: s.color,
                          border: `1px solid ${s.color}35`,
                          fontFamily: "'Cairo', sans-serif",
                        }}
                      >
                        {s.label}
                      </span>
                    ))}
                  </div>
                </div>
                <div
                  className="rounded-2xl p-6 lg:w-64 flex-shrink-0"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  <h4
                    className="text-sm font-bold text-teal-300 mb-4"
                    style={{ fontFamily: "'Cairo', sans-serif" }}
                  >
                    ما تُقدّمه تشخيصي
                  </h4>
                  <div className="space-y-3">
                    {[
                      "فحص أولي مجاني ومتاح للجميع",
                      "لغة عربية وسياق ثقافي مناسب",
                      "توجيه نحو الدعم المتخصص",
                      "خصوصية تامة وبدون وصمة",
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <CheckCircle size={14} style={{ color: "#34D399", flexShrink: 0 }} />
                        <span
                          className="text-xs text-slate-300"
                          style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                        >
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </FadeCard>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          8. IMPACT KPIs — ما الذي تقيسه المنصة
      ════════════════════════════════════════════════════════════ */}
      <section className="py-20 lg:py-28" style={{ background: "#FFFFFF" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeCard>
            {/* Header */}
            <div className="text-center mb-12">
              <SectionLabel color="#1E4E8C">
                <Target size={12} />
                إطار قياس الأثر
              </SectionLabel>
              <h2
                className="text-3xl lg:text-4xl font-black mb-4"
                style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900, color: "#243B53" }}
              >
                ما الذي تقيسه المنصة
              </h2>
              <p
                className="text-base max-w-2xl mx-auto"
                style={{ color: "#4A6278", fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.85 }}
              >
                نستهدف قياس الأثر الحقيقي للمنصة عبر مؤشرات واضحة ومحددة — هذه المؤشرات تمثّل أهدافنا التي نسعى لتحقيقها، لا إنجازات مؤكدة.
              </p>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
              {[
                {
                  icon: Users,
                  color: "#1E4E8C",
                  bg: "#DFF3F1",
                  border: "#DBEAFE",
                  label: "عدد الأسر التي تبدأ الفحص",
                  description: "نقيس كم أسرة وصلت إلى خطوة أولى واضحة بدلاً من الانتظار أو التردد.",
                  tag: "مؤشر رئيسي",
                },
                {
                  icon: TrendingUp,
                  color: "#2BBDB6",
                  bg: "#DFF3F1",
                  border: "#CCFBF1",
                  label: "نسبة الانتقال إلى خطوة دعم تالية",
                  description: "من الفحص الأولي إلى حجز متخصص أو طلب دعم من المدرسة أو الأسرة.",
                  tag: "مؤشر تحويل",
                },
                {
                  icon: Clock,
                  color: "#F4C46A",
                  bg: "#FFFBEB",
                  border: "#FEF3C7",
                  label: "الزمن بين القلق الأول وأول خطوة واضحة",
                  description: "نستهدف تقليص الفجوة بين لحظة الملاحظة الأولى وأول خطوة تدخل فعلي.",
                  tag: "مؤشر زمني",
                },
                {
                  icon: Heart,
                  color: "#EC4899",
                  bg: "#FDF2F8",
                  border: "#FCE7F3",
                  label: "نسبة من أفادوا بفهم أوضح",
                  description: "من المستخدمين الذين أفادوا بأن التفسير الأولي ساعدهم على فهم أوضح.",
                  tag: "مؤشر رضا",
                },
                {
                  icon: Compass,
                  color: "#7C3AED",
                  bg: "#F5F3FF",
                  border: "#EDE9FE",
                  label: "عدد الحالات الموجّهة إلى متخصص",
                  description: "من الفحص الأولي إلى جلسة تقييم متخصصة عند الحاجة.",
                  tag: "مؤشر توجيه",
                },
                {
                  icon: BookOpen,
                  color: "#0F766E",
                  bg: "#DFF3F1",
                  border: "#CCFBF1",
                  label: "نسبة الفحوص المكتملة",
                  description: "من بدأوا الفحص وأكملوه حتى النهاية وحصلوا على شرح الذكاء الاصطناعي.",
                  tag: "مؤشر تجربة",
                },
              ].map((kpi, i) => {
                const KpiIcon = kpi.icon;
                return (
                  <div
                    key={i}
                    className="rounded-2xl p-5 flex flex-col gap-3 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                    style={{
                      background: kpi.bg,
                      border: `1px solid ${kpi.border}`,
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: `${kpi.color}15`, border: `1px solid ${kpi.color}25` }}
                      >
                        <KpiIcon size={18} style={{ color: kpi.color }} />
                      </div>
                      <span
                        className="text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={{
                          background: `${kpi.color}12`,
                          color: kpi.color,
                          border: `1px solid ${kpi.color}22`,
                          fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {kpi.tag}
                      </span>
                    </div>
                    <h3
                      className="text-sm font-bold"
                      style={{ color: "#243B53", fontFamily: "'Cairo', sans-serif", fontWeight: 700, lineHeight: 1.5 }}
                    >
                      {kpi.label}
                    </h3>
                    <p
                      className="text-xs leading-relaxed"
                      style={{ color: "#64748B", fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.75 }}
                    >
                      {kpi.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Transparency note */}
            <div
              className="rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4"
              style={{ background: "linear-gradient(135deg, #243B53 0%, #1e3a8a 100%)" }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}
              >
                <Eye size={18} className="text-teal-300" />
              </div>
              <div className="flex-1">
                <p
                  className="text-sm font-semibold text-white mb-1"
                  style={{ fontFamily: "'Cairo', sans-serif" }}
                >
                  شفافية تامة في قياس الأثر
                </p>
                <p
                  className="text-xs text-blue-200"
                  style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.8 }}
                >
                  هذه المؤشرات تمثّل أهدافاً نسعى لقياسها — لا إنجازات مؤكدة. سننشر نتائج القياس بشفافية كاملة بعد إطلاق المنصة وتجميع بيانات كافية.
                </p>
              </div>
            </div>
          </FadeCard>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          9. CLOSING CTA
      ════════════════════════════════════════════════════════════ */}
      <section
        className="py-20 lg:py-28"
        style={{ background: "linear-gradient(135deg, #DFF3F1 0%, #DFF3F1 100%)" }}
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeCard>
            <SectionLabel color="#1E4E8C">
              <ArrowLeft size={12} />
              ابدأ الفحص الأولي — مجاناً
            </SectionLabel>
            <h2
              className="text-3xl lg:text-4xl font-black mb-5"
              style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900, color: "#243B53" }}
            >
              خطوتك الأولى نحو الوضوح
              <br />
              <span
                style={{
                  background: "linear-gradient(135deg, #1E4E8C 0%, #2BBDB6 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                تبدأ هنا
              </span>
            </h2>
            <p
              className="text-base mb-8"
              style={{ color: "#4A6278", fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.85 }}
            >
              فحص أولي مجاني، يستغرق ١٥ دقيقة، مدعوم بالذكاء الاصطناعي.
              لا تسجيل، لا بيانات شخصية مطلوبة، لا قلق.
            </p>
            <div className="flex flex-col items-stretch sm:flex-row sm:items-center justify-center gap-3 sm:gap-4 px-2 sm:px-0">
              <Link
                href="/start"
                className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-4 rounded-xl font-bold text-white transition-all hover:shadow-xl hover:-translate-y-0.5 w-full sm:w-auto"
                style={{
                  background: "linear-gradient(135deg, #1E4E8C 0%, #1A3F73 100%)",
                  fontFamily: "'Cairo', sans-serif",
                  fontWeight: 700,
                  fontSize: "1.05rem",
                  boxShadow: "0 6px 20px rgba(37,99,235,0.35)",
                }}
              >
                ابدأ الفحص الأولي — مجاناً
                <ArrowLeft size={18} />
              </Link>
              <Link
                href="/booking"
                className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-4 rounded-xl font-semibold transition-all hover:bg-white w-full sm:w-auto"
                style={{
                  border: "1.5px solid #CBD5E1",
                  color: "#4A6278",
                  fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                  fontSize: "0.95rem",
                }}
              >
                احجز جلسة مع متخصص
              </Link>
            </div>
            <p
              className="mt-6 text-xs"
              style={{ color: "#94A3B8", fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
            >
              نتائج الفحص هي مؤشرات توجيهية أولية وليست تشخيصاً طبياً رسمياً
            </p>
          </FadeCard>
        </div>
      </section>

      <Footer />
    </div>
  );
}
