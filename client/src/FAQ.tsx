/*
 * تشخيصي — صفحة الأسئلة الشائعة
 * Editorial Healthcare · Arabic-first · Warm & Reassuring
 * Accordion layout · 5 sections · 18+ questions
 * Palette: #F8FAFC bg · #0F172A text · #2563EB accent · #14B8A6 secondary
 *
 * v2 — إضافة قسم "مخاوف شائعة لدى الأسر" بـ 8 أسئلة ثقافية وعاطفية
 */
import { useState } from "react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  ChevronDown,
  HelpCircle,
  Shield,
  UserCheck,
  Calendar,
  MessageCircle,
  ArrowLeft,
  Search,
  Sparkles,
  Heart,
} from "lucide-react";

// ─── بيانات الأسئلة الشائعة ──────────────────────────────────────────────────
const faqSections = [
  // ══════════════════════════════════════════════════════════════════════════
  // القسم الجديد: مخاوف شائعة لدى الأسر — يظهر أولاً لأنه الأكثر إلحاحاً
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "family-concerns",
    icon: Heart,
    title: "مخاوف شائعة لدى كثير من الأسر",
    color: "#7C3AED",
    bg: "#F5F3FF",
    border: "#DDD6FE",
    highlight: true, // يُستخدم لإبراز هذا القسم بصرياً
    questions: [
      {
        q: "هل صعوبات التعلم تعني أن طفلي أقل ذكاءً؟",
        a: "لا، وهذا من أكثر المفاهيم الخاطئة شيوعاً. صعوبات التعلم لا تعني ضعف الذكاء، وكثير من الأطفال الذين يواجهون صعوبة في القراءة أو الكتابة أو الحساب يمتلكون قدرات معرفية جيدة جداً — لكنهم يحتاجون طريقة دعم مختلفة. الذكاء أشكال متعددة، والطريقة التي يتعلم بها طفلك ليست مقياساً لقيمته أو إمكاناته.",
      },
      {
        q: "هل قد يتعرض طفلي للوصمة إذا ظهرت لديه صعوبة في التعلم؟",
        a: "هذا القلق مفهوم تماماً، وكثير من الأسر تشعر به. لكن الواقع أن الفهم المبكر يحمي طفلك أكثر مما يضره. حين تعرف ما يحتاجه طفلك، تستطيع توفير الدعم المناسب له في المدرسة والبيت — بدلاً من أن يُوصف بـ«الكسول» أو «غير المنتبه» دون سبب واضح. النتائج سرية تماماً، ولا تُشارك مع أي جهة دون موافقتك.",
      },
      {
        q: "هل هذا الفحص يُعتبر تشخيصاً رسمياً؟",
        a: "لا. فحص تشخيصي هو خطوة فهم أولية، وليس تشخيصاً طبياً رسمياً. هدفه مساعدتك على رؤية الصورة بشكل أوضح، وتحديد ما إذا كانت هناك مؤشرات تستحق المتابعة مع متخصص. التشخيص الرسمي يتطلب تقييماً شاملاً من أخصائي معتمد — وهو الخطوة التالية إذا أشارت النتائج إلى ذلك.",
      },
      {
        q: "هل يمكن أن يتحسن طفلي إذا بدأنا مبكراً؟",
        a: "نعم، والبدء المبكر يُحدث فرقاً حقيقياً. الدعم التربوي المناسب في المرحلة الأولى يساعد الطفل على بناء استراتيجيات تعلم تناسبه، ويمنع تراكم الفجوات الأكاديمية والعاطفية. كثير من الأطفال الذين تلقوا دعماً مبكراً أكملوا مسيرتهم التعليمية بثقة واستقلالية. الهدف ليس «علاج» طفلك، بل مساعدته على اكتشاف الطريقة التي تناسبه.",
      },
      {
        q: "كيف يمكنني شرح الأمر للمدرسة أو المعلمين؟",
        a: "يمكنك الاستعانة بنتائج الفحص كنقطة انطلاق للحديث مع المعلم. لا تحتاج إلى تفاصيل طبية — يكفي أن تقول: \"لاحظنا أن طفلنا يحتاج طريقة تعلم مختلفة في بعض المجالات، وأجرينا فحصاً أولياً يُشير إلى ذلك.\" معظم المعلمين يتجاوبون بشكل إيجابي حين يشعرون أن الأسرة تسعى للتعاون. إذا احتجت دعماً في هذه المحادثة، يمكن للأخصائي الذي تتواصل معه أن يساعدك في صياغتها.",
      },
      {
        q: "ماذا أفعل إذا شعرت أن النتيجة تستحق متابعة؟",
        a: "الخطوة التالية هي حجز استشارة مع أخصائي معتمد. الأخصائي سيراجع معك نتائج الفحص، ويساعدك على فهم ما تعنيه في سياق طفلك تحديداً، ثم يقترح خطة عملية واضحة. لا تحتاج إلى أن تكون متأكداً تماماً — الشعور بأن \"هناك شيئاً ما\" يكفي كسبب للتحدث مع متخصص. الاستشارة الأولى مصممة تحديداً لهذه اللحظة من عدم اليقين.",
      },
      {
        q: "هل الذكاء الاصطناعي يحكم على حالة طفلي؟",
        a: "لا. الذكاء الاصطناعي في تشخيصي لا يُصدر أحكاماً ولا يُصنّف طفلك. دوره هو تنظيم إجاباتك وشرح ما تعنيه بلغة واضحة، واقتراح الخطوات التالية المناسبة. الذكاء الاصطناعي أداة للفهم والتوجيه — القرار النهائي دائماً بيدك أنت وبيد المتخصص الذي تختار التواصل معه.",
      },
      {
        q: "كيف أستخدم النتيجة بطريقة تساعدني ولا تخيفني؟",
        a: "النتيجة ليست حكماً نهائياً — هي خريطة أولية تساعدك على فهم ما يحدث. إذا أشارت إلى مؤشرات معينة، اقرأها بهدوء وتذكر أنها نقطة انطلاق لا نهاية مسار. يمكنك مشاركتها مع شريكك أو أحد أفراد الأسرة الذين تثق بهم قبل اتخاذ أي خطوة. والأهم: لا تواجه هذه المعلومة وحدك — الأخصائي موجود بالضبط لمساعدتك على قراءتها بشكل صحيح وبناء خطة واضحة منها.",
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // الأقسام الأصلية المحفوظة
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "screening",
    icon: HelpCircle,
    title: "عن الفحص والتقييم",
    color: "#2563EB",
    bg: "#EFF6FF",
    border: "#BFDBFE",
    highlight: false,
    questions: [
      {
        q: "هل هذا الفحص يُعتبر تشخيصاً نهائياً؟",
        a: "لا. فحص تشخيصي هو أداة فرز وتوجيه أولي، وليس تشخيصاً طبياً رسمياً. هدفه مساعدتك على فهم ما قد يواجهه طفلك أو أنت من تحديات في التعلم أو الانتباه، ثم توجيهك نحو الخطوة المناسبة — سواء كانت استشارة متخصص أو متابعة تربوية. التشخيص الرسمي يتطلب تقييماً شاملاً من أخصائي معتمد.",
      },
      {
        q: "من يمكنه استخدام تشخيصي؟",
        a: "المنصة مصممة لثلاث فئات: أولياء أمور يلاحظون صعوبات في تعلم أطفالهم أو قراءتهم أو انتباههم، وطلاب المرحلة الثانوية والجامعية الذين يرغبون في فهم أنماط تعلمهم بشكل أعمق، والبالغون الذين يودون استكشاف ما إذا كانوا يعانون من صعوبات تعلم لم تُشخَّص من قبل.",
      },
      {
        q: "هل المنصة مناسبة للأطفال والبالغين؟",
        a: "نعم. تشخيصي يدعم فئات عمرية متعددة. لدينا فحوصات مصممة للأطفال من سن ٥ سنوات فما فوق، وفحوصات للمراهقين والبالغين. كل فحص يأخذ في الاعتبار المرحلة العمرية والسياق التعليمي المناسب.",
      },
      {
        q: "كم يستغرق الفحص؟",
        a: "يستغرق الفحص الأساسي بين ١٠ و١٥ دقيقة فقط. بعض الفحوصات الأكثر تفصيلاً قد تصل إلى ٢٠ دقيقة. يمكنك إيقاف الفحص مؤقتاً والعودة إليه لاحقاً دون فقدان إجاباتك.",
      },
      {
        q: "هل الذكاء الاصطناعي يقدّم تشخيصاً طبياً؟",
        a: "لا. محرك الذكاء الاصطناعي في تشخيصي يُحلّل إجاباتك ويقدّم شرحاً واضحاً لما تعنيه النتائج، ويقترح الخطوات التالية المناسبة. لكنه لا يُصدر تشخيصاً طبياً رسمياً. الذكاء الاصطناعي هنا أداة للفهم والتوجيه، وليس بديلاً عن الأخصائي.",
      },
    ],
  },
  {
    id: "privacy",
    icon: Shield,
    title: "الخصوصية وحماية البيانات",
    color: "#14B8A6",
    bg: "#F0FDFA",
    border: "#99F6E4",
    highlight: false,
    questions: [
      {
        q: "هل نتائجي وبياناتي سرية؟",
        a: "نعم، بشكل كامل. نتائج فحصك وبياناتك الشخصية لا تُشارك مع أي جهة خارجية دون موافقتك الصريحة. الوصول إلى بياناتك محدود بك وبالأخصائي الذي تختار التواصل معه فقط. نستخدم تشفير TLS 1.3 لحماية جميع البيانات المنقولة.",
      },
      {
        q: "كيف يتم التعامل مع معلوماتي الشخصية؟",
        a: "نجمع فقط المعلومات الضرورية لتقديم الخدمة: الاسم، البريد الإلكتروني، رقم الجوال عند الحجز، وإجابات الفحص. لا نبيع بياناتك ولا نستخدمها لأغراض إعلانية. يمكنك طلب حذف بياناتك في أي وقت عبر التواصل معنا.",
      },
      {
        q: "هل يمكنني حذف بياناتي؟",
        a: "نعم. يحق لك في أي وقت طلب حذف جميع بياناتك من منصتنا. ما عليك سوى التواصل معنا عبر البريد الإلكتروني أو واتساب وسنُنفّذ طلبك خلال ٧٢ ساعة عمل.",
      },
    ],
  },
  {
    id: "specialists",
    icon: UserCheck,
    title: "المتخصصون والاستشارات",
    color: "#2563EB",
    bg: "#EFF6FF",
    border: "#BFDBFE",
    highlight: false,
    questions: [
      {
        q: "ماذا يحدث بعد ظهور النتيجة؟",
        a: "بعد ظهور النتيجة ستحصل على: شرح واضح من الذكاء الاصطناعي لما تعنيه النتائج، وتوصية بالخطوة التالية المناسبة لحالتك. إذا أشارت النتائج إلى وجود مؤشرات تستحق المتابعة، سيُقترح عليك حجز استشارة مع أخصائي معتمد لفهم الصورة الكاملة.",
      },
      {
        q: "ماذا سأستفيد من الجلسة مع الأخصائي؟",
        a: "جلسة الاستشارة مع الأخصائي تمنحك: فهماً أعمق لنتائج الفحص وما تعنيه في السياق الفعلي لطفلك أو لك، وخطة عملية واضحة للخطوات التالية سواء كانت تقييماً إضافياً أو دعماً تربوياً أو تحويلاً لجهة متخصصة. الجلسة سرية تماماً وتُعقد عبر الإنترنت بشكل مريح.",
      },
      {
        q: "هل المتخصصون معتمدون؟",
        a: "نعم. جميع المتخصصين على منصة تشخيصي حاصلون على مؤهلات أكاديمية معتمدة في مجالات التربية الخاصة، وعلم النفس التربوي، وصعوبات التعلم. نتحقق من مؤهلات كل متخصص قبل انضمامه للمنصة.",
      },
    ],
  },
  {
    id: "booking",
    icon: Calendar,
    title: "الحجز والمتابعة",
    color: "#F59E0B",
    bg: "#FFFBEB",
    border: "#FDE68A",
    highlight: false,
    questions: [
      {
        q: "هل يمكنني الحجز مباشرة دون إجراء الفحص؟",
        a: "نعم، يمكنك حجز استشارة مباشرة دون إجراء الفحص إذا كنت تفضل ذلك. لكننا ننصح بإجراء الفحص أولاً لأنه يساعد الأخصائي على الاستعداد بشكل أفضل للجلسة وتقديم استشارة أكثر دقة وفائدة.",
      },
      {
        q: "كيف تُعقد الجلسة؟ هل هي حضورية أم عن بُعد؟",
        a: "جميع الجلسات تُعقد عبر الإنترنت (فيديو كول) لراحتك وسهولة الوصول من أي مكان في المملكة أو خارجها. ستصلك رسالة تأكيد برابط الجلسة قبل ٢٤ ساعة من موعدها.",
      },
      {
        q: "هل يمكنني إعادة جدولة الموعد أو إلغاؤه؟",
        a: "نعم. يمكنك إعادة الجدولة أو الإلغاء مجاناً حتى ٢٤ ساعة قبل موعد الجلسة. للإلغاء أو إعادة الجدولة، تواصل معنا عبر واتساب أو البريد الإلكتروني الوارد في رسالة التأكيد.",
      },
      {
        q: "كم تكلفة الجلسة مع الأخصائي؟",
        a: "تتراوح تكلفة الاستشارة الأولية بين ٢٠٠ و٣٥٠ ريال سعودي حسب المتخصص ونوع الجلسة. السعر يُعرض بوضوح قبل تأكيد الحجز دون أي رسوم مخفية. نقبل الدفع عبر مدى وفيزا وماستركارد.",
      },
    ],
  },
];

// ─── مكوّن سؤال واحد ─────────────────────────────────────────────────────────
function FAQItem({
  question,
  answer,
  accentColor,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  accentColor: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-200"
      style={{
        background: "white",
        border: `1px solid ${isOpen ? accentColor + "40" : "#F1F5F9"}`,
        boxShadow: isOpen
          ? `0 4px 20px ${accentColor}15`
          : "0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-3 px-4 sm:px-6 py-4 sm:py-5 text-right transition-colors"
        style={{
          background: isOpen ? `${accentColor}08` : "transparent",
        }}
      >
        <span
          className="text-base font-semibold text-slate-900 leading-relaxed text-right flex-1"
          style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 600 }}
        >
          {question}
        </span>
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300"
          style={{
            background: isOpen ? accentColor : "#F8FAFC",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          <ChevronDown
            size={16}
            style={{ color: isOpen ? "white" : "#94A3B8" }}
          />
        </div>
      </button>

      {isOpen && (
        <div
          className="px-6 pb-6 pt-1"
          style={{ borderTop: `1px solid ${accentColor}20` }}
        >
          <p
            className="text-slate-600 leading-relaxed text-sm"
            style={{
              fontFamily: "'IBM Plex Sans Arabic', sans-serif",
              lineHeight: 2,
            }}
          >
            {answer}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── المكوّن الرئيسي ──────────────────────────────────────────────────────────
export default function FAQ() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const toggleItem = (key: string) => {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // تصفية الأسئلة بناءً على البحث
  const filteredSections = faqSections
    .map((section) => ({
      ...section,
      questions: section.questions.filter(
        (item) =>
          !searchQuery ||
          item.q.includes(searchQuery) ||
          item.a.includes(searchQuery)
      ),
    }))
    .filter((section) => section.questions.length > 0);

  const totalQuestions = faqSections.reduce(
    (sum, s) => sum + s.questions.length,
    0
  );

  return (
    <div
      className="min-h-screen"
      style={{ background: "#F8FAFC", direction: "rtl" }}
    >
      <Navbar />

      {/* ─── Hero Section ─────────────────────────────────────────────────── */}
      <section
        className="pt-28 pb-16 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #EFF6FF 0%, #F0FDFA 50%, #F8FAFC 100%)",
        }}
      >
        {/* Decorative circles */}
        <div
          className="absolute top-0 left-0 w-96 h-96 rounded-full opacity-20 pointer-events-none"
          style={{
            background: "radial-gradient(circle, #2563EB40, transparent 70%)",
            transform: "translate(-40%, -40%)",
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-72 h-72 rounded-full opacity-20 pointer-events-none"
          style={{
            background: "radial-gradient(circle, #14B8A640, transparent 70%)",
            transform: "translate(30%, 30%)",
          }}
        />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          {/* Breadcrumb */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <Link href="/">
              <span
                className="text-sm text-slate-500 hover:text-blue-600 cursor-pointer transition-colors"
                style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
              >
                الرئيسية
              </span>
            </Link>
            <ArrowLeft size={14} className="text-slate-400" />
            <span
              className="text-sm text-blue-600 font-medium"
              style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
            >
              الأسئلة الشائعة
            </span>
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ background: "#EFF6FF", border: "1px solid #BFDBFE" }}>
            <Sparkles size={14} style={{ color: "#2563EB" }} />
            <span className="text-xs font-semibold text-blue-700" style={{ fontFamily: "'Cairo', sans-serif" }}>
              {totalQuestions} سؤالاً وجواباً
            </span>
          </div>

          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 mb-4 leading-tight"
            style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900 }}
          >
            أسئلة يسألها
            <span
              className="mx-3"
              style={{
                background: "linear-gradient(135deg, #2563EB, #14B8A6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              كثيرون
            </span>
          </h1>
          <p
            className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed"
            style={{
              fontFamily: "'IBM Plex Sans Arabic', sans-serif",
              lineHeight: 1.9,
            }}
          >
            إجابات صريحة وواضحة على أكثر الأسئلة شيوعاً حول الفحص، الخصوصية،
            المتخصصين، والحجز.
          </p>

          {/* Search */}
          <div className="relative max-w-xl mx-auto">
            <Search
              size={18}
              className="absolute top-1/2 -translate-y-1/2 text-slate-400"
              style={{ right: "1rem" }}
            />
            <input
              type="text"
              placeholder="ابحث في الأسئلة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-4 pr-12 pl-5 rounded-2xl text-sm text-slate-900 outline-none transition-all"
              style={{
                background: "white",
                border: "1.5px solid #E2E8F0",
                fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              }}
              onFocus={(e) =>
                (e.target.style.border = "1.5px solid #2563EB")
              }
              onBlur={(e) =>
                (e.target.style.border = "1.5px solid #E2E8F0")
              }
            />
          </div>
        </div>
      </section>

      {/* ─── Section Tabs ─────────────────────────────────────────────────── */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 py-3 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveSection(null)}
              className="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={{
                fontFamily: "'Cairo', sans-serif",
                background: !activeSection ? "#2563EB" : "#F8FAFC",
                color: !activeSection ? "white" : "#64748B",
                border: !activeSection ? "none" : "1px solid #E2E8F0",
              }}
            >
              الكل
            </button>
            {faqSections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() =>
                    setActiveSection(
                      activeSection === section.id ? null : section.id
                    )
                  }
                  className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
                  style={{
                    fontFamily: "'Cairo', sans-serif",
                    background:
                      activeSection === section.id
                        ? section.color
                        : section.highlight && !activeSection
                        ? "#F5F3FF"
                        : "#F8FAFC",
                    color:
                      activeSection === section.id
                        ? "white"
                        : section.highlight && !activeSection
                        ? "#7C3AED"
                        : "#64748B",
                    border:
                      activeSection === section.id
                        ? "none"
                        : section.highlight && !activeSection
                        ? "1px solid #DDD6FE"
                        : "1px solid #E2E8F0",
                  }}
                >
                  <Icon size={14} />
                  {section.title}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── FAQ Content ──────────────────────────────────────────────────── */}
      <section className="py-12 lg:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredSections.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🔍</div>
              <p
                className="text-slate-500 text-lg"
                style={{ fontFamily: "'Cairo', sans-serif" }}
              >
                لم نجد نتائج لـ "{searchQuery}"
              </p>
              <button
                onClick={() => setSearchQuery("")}
                className="mt-4 text-blue-600 text-sm underline"
                style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
              >
                مسح البحث
              </button>
            </div>
          ) : (
            <div className="space-y-12">
              {filteredSections
                .filter(
                  (s) => !activeSection || s.id === activeSection
                )
                .map((section) => {
                  const Icon = section.icon;
                  return (
                    <div key={section.id} id={`section-${section.id}`}>
                      {/* Section Header — مميّز للقسم الثقافي */}
                      {section.highlight ? (
                        <div
                          className="rounded-2xl p-6 mb-6 relative overflow-hidden"
                          style={{
                            background: "linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)",
                            border: "1.5px solid #DDD6FE",
                          }}
                        >
                          {/* Decorative glow */}
                          <div
                            className="absolute top-0 left-0 w-48 h-48 rounded-full pointer-events-none opacity-30"
                            style={{
                              background: "radial-gradient(circle, #7C3AED30, transparent 70%)",
                              transform: "translate(-30%, -30%)",
                            }}
                          />
                          <div className="relative flex items-start gap-4">
                            <div
                              className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5"
                              style={{ background: "#EDE9FE", border: "1px solid #DDD6FE" }}
                            >
                              <Icon size={22} style={{ color: "#7C3AED" }} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                                <h2
                                  className="text-xl font-bold"
                                  style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 700, color: "#3B0764" }}
                                >
                                  {section.title}
                                </h2>
                                <span
                                  className="text-xs font-semibold px-3 py-1 rounded-full"
                                  style={{
                                    background: "#7C3AED",
                                    color: "white",
                                    fontFamily: "'Cairo', sans-serif",
                                  }}
                                >
                                  جديد
                                </span>
                              </div>
                              <p
                                className="text-sm"
                                style={{ color: "#6D28D9", fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.75 }}
                              >
                                أسئلة يطرحها كثير من الأهالي — إجابات دافئة وعملية تُخفّف القلق وتُوضّح الطريق.
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-4 mb-6">
                          <div
                            className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                            style={{ background: section.bg, border: `1px solid ${section.border}` }}
                          >
                            <Icon size={22} style={{ color: section.color }} />
                          </div>
                          <div>
                            <h2
                              className="text-xl font-bold text-slate-900"
                              style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 700 }}
                            >
                              {section.title}
                            </h2>
                            <p
                              className="text-sm text-slate-500"
                              style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                            >
                              {section.questions.length} أسئلة
                            </p>
                          </div>
                          <div
                            className="h-px flex-1"
                            style={{ background: `linear-gradient(to left, transparent, ${section.color}30)` }}
                          />
                        </div>
                      )}

                      {/* Questions */}
                      <div className="space-y-3">
                        {section.questions.map((item, idx) => {
                          const key = `${section.id}-${idx}`;
                          return (
                            <FAQItem
                              key={key}
                              question={item.q}
                              answer={item.a}
                              accentColor={section.color}
                              isOpen={!!openItems[key]}
                              onToggle={() => toggleItem(key)}
                            />
                          );
                        })}
                      </div>

                      {/* نهاية القسم الثقافي — إشارة للخطوة التالية */}
                      {section.highlight && (
                        <div
                          className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl"
                          style={{
                            background: "white",
                            border: "1px solid #EDE9FE",
                          }}
                        >
                          <p
                            className="text-sm text-slate-600 text-center sm:text-right"
                            style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.75 }}
                          >
                            لا تزال لديك أسئلة؟ يمكنك التحدث مع أخصائي يفهم سياقك.
                          </p>
                          <Link href="/booking">
                            <span
                              className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all hover:-translate-y-0.5"
                              style={{
                                background: "linear-gradient(135deg, #7C3AED, #6D28D9)",
                                color: "white",
                                fontFamily: "'Cairo', sans-serif",
                                boxShadow: "0 4px 14px rgba(124,58,237,0.3)",
                              }}
                            >
                              احجز استشارة مجانية
                              <ArrowLeft size={14} />
                            </span>
                          </Link>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </section>

      {/* ─── لم تجد إجابتك؟ ───────────────────────────────────────────────── */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="rounded-3xl p-10 text-center relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #1E3A8A 0%, #0F172A 100%)",
            }}
          >
            {/* Decorative */}
            <div
              className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 pointer-events-none"
              style={{
                background: "radial-gradient(circle, #14B8A6, transparent 70%)",
                transform: "translate(30%, -30%)",
              }}
            />
            <div
              className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-10 pointer-events-none"
              style={{
                background: "radial-gradient(circle, #2563EB, transparent 70%)",
                transform: "translate(-30%, 30%)",
              }}
            />

            <div className="relative">
              <div
                className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.1)" }}
              >
                <MessageCircle size={28} className="text-teal-400" />
              </div>

              <h3
                className="text-2xl font-bold text-white mb-3"
                style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 700 }}
              >
                لم تجد إجابتك؟
              </h3>
              <p
                className="text-slate-300 mb-8 leading-relaxed"
                style={{
                  fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                  lineHeight: 1.9,
                }}
              >
                فريقنا جاهز للإجابة على أي سؤال يخطر ببالك.
                <br />
                تواصل معنا وسنردّ عليك خلال ساعات.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="https://wa.me/966500000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm transition-all hover:scale-105"
                  style={{
                    background: "#25D366",
                    color: "white",
                    fontFamily: "'Cairo', sans-serif",
                  }}
                >
                  <span>💬</span>
                  تواصل عبر واتساب
                </a>
                <Link href="/contact">
                  <span
                    className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm transition-all hover:scale-105 cursor-pointer"
                    style={{
                      background: "rgba(255,255,255,0.1)",
                      color: "white",
                      border: "1px solid rgba(255,255,255,0.2)",
                      fontFamily: "'Cairo', sans-serif",
                    }}
                  >
                    راسلنا بالبريد الإلكتروني
                  </span>
                </Link>
              </div>

              {/* Trust note */}
              <p
                className="text-xs text-slate-500 mt-6"
                style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
              >
                🔒 جميع استفساراتك تُعامل بسرية تامة
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Quick Links ──────────────────────────────────────────────────── */}
      <section className="pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                icon: "🔍",
                title: "ابدأ الفحص",
                desc: "أجرِ فحصاً مجانياً الآن",
                href: "/children",
                color: "#2563EB",
                bg: "#EFF6FF",
              },
              {
                icon: "📋",
                title: "شاهد نموذج النتائج",
                desc: "كيف تبدو نتائج الفحص",
                href: "/result-demo",
                color: "#14B8A6",
                bg: "#F0FDFA",
              },
              {
                icon: "📅",
                title: "احجز استشارة",
                desc: "تحدث مع متخصص معتمد",
                href: "/booking",
                color: "#F59E0B",
                bg: "#FFFBEB",
              },
            ].map((item, i) => (
              <a
                key={i}
                href={item.href}
                className="flex items-center gap-4 p-5 rounded-2xl transition-all hover:-translate-y-1 hover:shadow-md"
                style={{
                  background: item.bg,
                  border: `1px solid ${item.color}30`,
                  textDecoration: "none",
                }}
              >
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <p
                    className="font-semibold text-slate-900 text-sm"
                    style={{ fontFamily: "'Cairo', sans-serif" }}
                  >
                    {item.title}
                  </p>
                  <p
                    className="text-xs text-slate-500 mt-0.5"
                    style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                  >
                    {item.desc}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
