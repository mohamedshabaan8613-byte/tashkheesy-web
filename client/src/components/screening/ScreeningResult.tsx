/*
 * ScreeningResult — صفحة نتائج الفحص v5 (Clean Funnel)
 *
 * التصميم: Editorial Healthcare Calm
 * الهوية البصرية: Cairo + IBM Plex Sans Arabic
 *
 * هيكل الصفحة (مسار واضح ونظيف):
 * 1. Hero النتيجة — ملخص واضح وهادئ
 * 2. شرح الذكاء الاصطناعي — 4 أقسام
 * 3. تفصيل النتائج حسب المجال + التوصيات
 * 4. معاينة فريق المتخصصين (path-aware، بدون أسماء شخصية، بدون أزرار حجز فردية)
 * 5. الأسئلة الشائعة
 * 6. CTA واحد فقط في نهاية الصفحة
 *
 * القواعد الصارمة:
 * - CTA واحد فقط في الصفحة بالكامل (في نهاية الصفحة)
 * - لا أسعار في صفحة النتيجة
 * - لا أسماء شخصية في معاينة المتخصصين
 * - معاينة المتخصصين تعكس pathType فقط (learning أو adhd)
 * - لا sticky CTA
 * - لا أزرار حجز متكررة
 */
import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import {
  ArrowLeft,
  Shield,
  Brain,
  Calendar,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  XCircle,
  Share2,
  Printer,
  TrendingUp,
  Lock,
  Heart,
  Star,
  MessageCircle,
  Clock,
  Users,
  Sparkles,
  Info,
  BadgeCheck,
  ChevronRight,
  FileText,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";
import { upsertScreeningResultAnalytics } from "@/lib/screeningAnalytics";

// ─── أنواع البيانات ───────────────────────────────────────────────────────────
interface CategoryScore {
  score: number;
  max: number;
  percentage: number;
}

interface StoredResult {
  sessionId: string;
  childName: string;
  childAge: number;
  screeningType: string;
  result: {
    percentage: number;
    riskLevel: "low" | "medium" | "high" | "critical";
    riskLabel: string;
    categoryScores: Record<string, CategoryScore>;
    recommendations: string[];
    aiExplanation?: string;
  };
  completedAt: string;
  answeredCount: number;
  totalCount: number;
}

// ─── إعدادات مستويات المؤشرات ────────────────────────────────────────────────
const RISK_CONFIG = {
  low: {
    label: "مؤشرات في النطاق الطبيعي",
    icon: CheckCircle2,
    color: "#059669",
    borderColor: "#A7F3D0",
    accentBg: "#ECFDF5",
    progressColor: "#10B981",
    headline: "نتائجك تُظهر مؤشرات في النطاق الطبيعي",
    subheadline:
      "رصد الفحص بعض الأنماط التي تستحق المتابعة الدورية — وهو أمر إيجابي أن تكون على دراية بها مبكراً.",
    reassurance:
      "معظم الأطفال في هذه الفئة يتطورون بشكل طبيعي مع دعم بسيط ومنتظم من المنزل والمدرسة. الوعي المبكر بهذه الأنماط يُمكّنك من تقديم الدعم الصحيح في الوقت المناسب.",
  },
  medium: {
    label: "مؤشرات تستحق المتابعة",
    icon: AlertCircle,
    color: "#D97706",
    borderColor: "#FDE68A",
    accentBg: "#FFFBEB",
    progressColor: "#F4C46A",
    headline: "رصد الفحص بعض الأنماط التي تستحق الاهتمام",
    subheadline:
      "هذه المؤشرات ليست سبباً للقلق — بل هي فرصة لفهم احتياجاتك بشكل أفضل والتصرف في الوقت المناسب.",
    reassurance:
      "كثير من الأطفال يُظهرون مؤشرات مشابهة، والتدخل المبكر يُحدث فارقاً كبيراً في مسيرتهم التعليمية.",
  },
  high: {
    label: "مؤشرات تستدعي الاهتمام",
    icon: AlertTriangle,
    color: "#EA580C",
    borderColor: "#FED7AA",
    accentBg: "#FFF7ED",
    progressColor: "#F97316",
    headline: "الفحص رصد مؤشرات تستحق تقييماً متخصصاً",
    subheadline:
      "هذه النتائج تُشير إلى أن طفلك قد يستفيد كثيراً من دعم متخصص — وهذا بالضبط ما صُمِّم تشخيصي لمساعدتك فيه.",
    reassurance:
      "الخطوة الأولى نحو الدعم هي الأصعب — وأنت قطعتها بالفعل بإتمام هذا الفحص. الآن لديك صورة واضحة تُمكّنك من التصرف بثقة.",
  },
  critical: {
    label: "مؤشرات تستدعي تقييماً شاملاً",
    icon: XCircle,
    color: "#DC2626",
    borderColor: "#FECACA",
    accentBg: "#FEF2F2",
    progressColor: "#EF4444",
    headline: "الفحص رصد مؤشرات مرتفعة تستدعي تقييماً شاملاً",
    subheadline:
      "هذه النتائج تُشير إلى أهمية التحرك السريع — لكن تذكر: الفهم المبكر هو أفضل هدية يمكنك تقديمها لطفلك.",
    reassurance:
      "الوصول إلى متخصص الآن يعني أن طفلك سيحصل على الدعم الذي يحتاجه في الوقت المناسب.",
  },
};

// ─── معلومات المجالات ─────────────────────────────────────────────────────────
const CATEGORY_INFO: Record<string, { label: string; icon: string; desc: string }> = {
  reading: { label: "القراءة والفهم", icon: "📖", desc: "القدرة على قراءة النصوص وفهم معناها" },
  writing: { label: "الكتابة والإملاء", icon: "✏️", desc: "مهارات الكتابة والتهجئة الصحيحة" },
  attention: { label: "الانتباه والتركيز", icon: "🎯", desc: "القدرة على التركيز وإتمام المهام" },
  memory: { label: "الذاكرة والمعالجة", icon: "🧠", desc: "استيعاب المعلومات وتذكرها" },
  social: { label: "المهارات الاجتماعية", icon: "🤝", desc: "التفاعل مع الأقران والبيئة المحيطة" },
  motor: { label: "المهارات الحركية", icon: "🖐️", desc: "التنسيق الحركي والمهارات الدقيقة" },
  hyperactivity: { label: "فرط الحركة", icon: "⚡", desc: "مستوى النشاط الحركي والاندفاعية" },
  impulsivity: { label: "الاندفاعية", icon: "🔥", desc: "التحكم في الاندفاعات والاستجابات" },
  focus: { label: "التركيز والانتباه", icon: "🎯", desc: "القدرة على الانتباه والتركيز المستمر" },
};

// ─── معاينة فريق المتخصصين (path-aware، بدون أسماء شخصية) ──────────────────
const SPECIALIST_PREVIEW: Record<string, {
  heading: string;
  description: string;
  cards: { role: string; specialties: string[]; color: string; icon: string }[];
}> = {
  learning: {
    heading: "فريق متخصصي صعوبات التعلم",
    description:
      "مناقشة نتائج هذا الفحص مع أخصائي صعوبات التعلم يُساعدك على فهم المؤشرات بعمق أكبر، والحصول على خطة دعم مخصصة لمجالات القراءة والكتابة والانتباه والتركيز.",
    cards: [
      {
        role: "أخصائي صعوبات التعلم",
        specialties: ["صعوبات القراءة", "الكتابة والإملاء", "التدخل المبكر"],
        color: "#1E4E8C",
        icon: "📖",
      },
      {
        role: "أخصائية صعوبات التعلم",
        specialties: ["الديسلكسيا", "الفهم القرائي", "دعم مهارات التعلم"],
        color: "#7C3AED",
        icon: "✏️",
      },
      {
        role: "أخصائي نفسي تربوي",
        specialties: ["التقييم الشامل", "صعوبات التعلم", "الدعم الأكاديمي"],
        color: "#0891B2",
        icon: "🧠",
      },
    ],
  },
  adhd: {
    heading: "فريق متخصصي فرط الحركة وتشتت الانتباه",
    description:
      "مناقشة نتائج هذا الفحص مع أخصائي ADHD يُساعدك على فهم مؤشرات فرط الحركة والاندفاعية وتشتت الانتباه، والحصول على استراتيجيات دعم عملية ومخصصة.",
    cards: [
      {
        role: "أخصائي فرط الحركة وتشتت الانتباه",
        specialties: ["ADHD", "الاندفاعية", "إدارة السلوك"],
        color: "#7C3AED",
        icon: "⚡",
      },
      {
        role: "أخصائية فرط الحركة وتشتت الانتباه",
        specialties: ["تشتت الانتباه", "دعم التركيز", "التدخل السلوكي"],
        color: "#1E4E8C",
        icon: "🎯",
      },
      {
        role: "أخصائي نفسي تربوي",
        specialties: ["التقييم الشامل", "ADHD", "الدعم الأسري"],
        color: "#0891B2",
        icon: "🧠",
      },
    ],
  },
};

// ─── الأسئلة الشائعة ─────────────────────────────────────────────────────────
const FAQ_ITEMS = [
  {
    q: "هل هذه النتائج تُعدّ تشخيصاً طبياً رسمياً؟",
    a: "لا. نتائج هذا الفحص هي مؤشرات توجيهية أولية فقط، وليست تشخيصاً طبياً أو نفسياً رسمياً. التشخيص الدقيق يتطلب تقييماً شاملاً من متخصص معتمد. هدف هذا الفحص هو مساعدتك على فهم ما يحتاج إلى متابعة وتوجيهك نحو الخطوة الصحيحة.",
    icon: Info,
    color: "#1E4E8C",
    bg: "#DFF3F1",
  },
  {
    q: "هل نتائجي وبيانات طفلي خاصة وسرية تماماً؟",
    a: "نعم، بشكل كامل. بياناتك وبيانات طفلك محمية بتشفير كامل ولن تُشارك مع أي جهة خارجية تحت أي ظرف. نحن نلتزم بأعلى معايير الخصوصية وحماية البيانات.",
    icon: Lock,
    color: "#2BBDB6",
    bg: "#DFF3F1",
  },
  {
    q: "ماذا يحدث بعد حجز الجلسة مع المتخصص؟",
    a: "بعد الحجز، ستتلقى تأكيداً فورياً مع تفاصيل الموعد. سيطلع المتخصص على نتائج فحصك قبل الجلسة ليكون مستعداً. خلال الجلسة، ستناقشون النتائج بالتفصيل وستحصل على تقييم أعمق وخطة دعم مخصصة.",
    icon: Calendar,
    color: "#F4C46A",
    bg: "#FFFBEB",
  },
  {
    q: "هل يمكنني إجراء الجلسة عن بُعد (أونلاين)؟",
    a: "نعم. نقدم خيار الجلسات عبر الفيديو أونلاين بنفس جودة الجلسات الحضورية. يمكنك اختيار الوقت والطريقة المناسبة لك عند الحجز.",
    icon: MessageCircle,
    color: "#2BBDB6",
    bg: "#DFF3F1",
  },
];

// ─── مكوّن الأكورديون ─────────────────────────────────────────────────────────
function AccordionItem({
  item,
  isOpen,
  onToggle,
}: {
  item: (typeof FAQ_ITEMS)[0];
  isOpen: boolean;
  onToggle: () => void;
}) {
  const Icon = item.icon;
  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-300"
      style={{
        border: isOpen ? `1.5px solid ${item.color}30` : "1.5px solid #DFF3F1",
        background: isOpen ? item.bg : "white",
        boxShadow: isOpen ? `0 4px 20px ${item.color}12` : "0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
      <button
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-right"
        onClick={onToggle}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: item.bg, border: `1px solid ${item.color}20` }}
          >
            <Icon size={16} style={{ color: item.color }} />
          </div>
          <span
            className="text-base font-bold text-slate-900 text-right"
            style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 700 }}
          >
            {item.q}
          </span>
        </div>
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200"
          style={{
            background: isOpen ? item.color : "#DFF3F1",
            color: isOpen ? "white" : "#94A3B8",
          }}
        >
          {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>
      {isOpen && (
        <div className="px-6 pb-5">
          <div className="h-px mb-4" style={{ background: `${item.color}20` }} />
          <p
            className="text-slate-600 leading-relaxed text-sm"
            style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.9 }}
          >
            {item.a}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── مكوّن شريط التقدم المتحرك ───────────────────────────────────────────────
function AnimatedProgressBar({ percentage, color }: { percentage: number; color: string }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => setWidth(percentage), 500);
    return () => clearTimeout(timer);
  }, [percentage]);
  return (
    <div className="h-3 rounded-full overflow-hidden" style={{ background: "#DFF3F1" }}>
      <div
        className="h-full rounded-full transition-all duration-1000 ease-out relative"
        style={{ width: `${width}%`, background: color }}
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)",
          }}
        />
      </div>
    </div>
  );
}

// ─── المكوّن الرئيسي ──────────────────────────────────────────────────────────
interface ScreeningResultProps {
  sessionId: string;
}

export default function ScreeningResult({ sessionId }: ScreeningResultProps) {
  const [, navigate] = useLocation();
  const urlSearchParams = new URLSearchParams(window.location.search);
  const urlPathType = urlSearchParams.get("pathType") ?? "learning";

  const [data, setData] = useState<StoredResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiText, setAiText] = useState<string>("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // ─── تحميل البيانات ───────────────────────────────────────────────────────
  useEffect(() => {
    const stored = localStorage.getItem(`result_${sessionId}`);
    if (stored) {
      try {
        const parsed: StoredResult = JSON.parse(stored);
        setData(parsed);
        if (parsed.result.aiExplanation) {
          setAiText(parsed.result.aiExplanation);
        }
      } catch {
        navigate("/start");
      }
    } else {
      navigate("/start");
    }
    setLoading(false);
  }, [sessionId, navigate]);

  // ─── Analytics: upsert completed screening result to Supabase ──────────
  // Fire-and-forget: never blocks rendering, never shows error to user
  useEffect(() => {
    if (!sessionId || !data) return;

    // Determine subjectType
    let subjectType: "self" | "child" | "unknown" = "unknown";
    const urlMode = new URLSearchParams(window.location.search).get("mode");
    if (
      urlMode === "self" ||
      sessionId.startsWith("session_self") ||
      sessionId.startsWith("self_")
    ) {
      subjectType = "self";
    } else if (
      data.childName ||
      urlMode === "child" ||
      sessionId.startsWith("session_child")
    ) {
      subjectType = "child";
    }

    // Determine localChildId from URL or result
    const urlParams = new URLSearchParams(window.location.search);
    const localChildId =
      urlParams.get("childId") ||
      urlParams.get("localChildId") ||
      null;

    upsertScreeningResultAnalytics({
      sessionId,
      pathType: urlPathType,
      screeningType: data.screeningType,
      mode: urlMode ?? undefined,
      subjectType,
      subjectName: data.childName || undefined,
      subjectAge: data.childAge ? String(data.childAge) : undefined,
      localChildId: localChildId ?? undefined,
      result: data,
      completedAt: data.completedAt,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  // ─── تفعيل fade-in-up ────────────────────────────────────────────────────
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );
    const elements = document.querySelectorAll(".fade-in-up");
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [data]);

  // ─── دالة الحجز الوحيدة في الصفحة ───────────────────────────────────────
  const handleBooking = () => {
    const params = new URLSearchParams({
      pathType: urlPathType,
      sessionId,
      from: "result",
    });
    navigate(`/specialists?${params.toString()}`);
  };

  // ─── دالة المشاركة ───────────────────────────────────────────────────────
  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("تم نسخ رابط النتائج");
    } catch {
      toast.error("تعذّر نسخ الرابط");
    }
  };

  // ─── حالة التحميل ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#F4EFE8" }}
        dir="rtl"
      >
        <div className="text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse"
            style={{ background: "linear-gradient(135deg, #1E4E8C 0%, #2BBDB6 100%)" }}
          >
            <Brain size={28} className="text-white" />
          </div>
          <p
            className="text-slate-500 text-sm"
            style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
          >
            جاري تحميل النتائج...
          </p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const config = RISK_CONFIG[data.result.riskLevel] ?? RISK_CONFIG.medium;
  const RiskIcon = config.icon;
  const sortedCategories = Object.entries(data.result.categoryScores).sort(
    ([, a], [, b]) => b.percentage - a.percentage
  );
  const specialistPreview =
    SPECIALIST_PREVIEW[urlPathType] ?? SPECIALIST_PREVIEW.learning;

  return (
    <div
      className="min-h-screen"
      style={{ background: "#F4EFE8", fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
      dir="rtl"
    >
      {/* ─── Navbar ──────────────────────────────────────────────────────────── */}
      <nav
        className="sticky top-0 z-30 no-print"
        style={{
          background: "rgba(255,255,255,0.97)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(226,232,240,0.8)",
          boxShadow: "0 1px 12px rgba(15,23,42,0.05)",
        }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 transition-opacity hover:opacity-70"
          >
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #1E4E8C 0%, #2BBDB6 100%)" }}
            >
              <Brain size={16} className="text-white" />
            </div>
            <span
              className="text-base font-black text-slate-900"
              style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900 }}
            >
              تشخيصي
            </span>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 hover:bg-slate-100 no-print"
              title="طباعة النتائج"
            >
              <Printer size={16} className="text-slate-500" />
            </button>
            <button
              onClick={handleShare}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 hover:bg-slate-100 no-print"
              title="مشاركة النتائج"
            >
              <Share2 size={16} className="text-slate-500" />
            </button>
          </div>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════════════════════════
          1. Hero النتيجة
      ═══════════════════════════════════════════════════════════════════════ */}
      <section
        className="py-12 sm:py-16"
        style={{
          background: `linear-gradient(160deg, ${config.accentBg} 0%, #F4EFE8 60%)`,
          borderBottom: `1px solid ${config.borderColor}`,
        }}
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6">

          {/* Badge المستوى */}
          <div className="flex justify-center mb-6 fade-in-up">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
              style={{
                background: `${config.color}12`,
                border: `1px solid ${config.color}30`,
              }}
            >
              <RiskIcon size={14} style={{ color: config.color }} />
              <span
                className="text-sm font-bold"
                style={{
                  color: config.color,
                  fontFamily: "'Cairo', sans-serif",
                  fontWeight: 700,
                }}
              >
                {config.label}
              </span>
            </div>
          </div>

          {/* العنوان الرئيسي */}
          <h1
            className="fade-in-up text-3xl sm:text-4xl font-black text-slate-900 text-center mb-4"
            style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900, lineHeight: 1.25 }}
          >
            {config.headline}
          </h1>
          <p
            className="fade-in-up text-slate-600 text-center text-base leading-relaxed mb-8 max-w-xl mx-auto"
            style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.85 }}
          >
            {config.subheadline}
          </p>

          {/* بطاقة النتيجة الرئيسية */}
          <div
            className="fade-in-up rounded-3xl p-6 sm:p-8"
            style={{
              background: "white",
              border: `1.5px solid ${config.borderColor}`,
              boxShadow: `0 4px 24px ${config.color}10`,
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <span
                className="text-sm font-semibold text-slate-500"
                style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
              >
                مستوى المؤشرات الكلي
              </span>
              <span
                className="text-3xl font-black"
                style={{ fontFamily: "'Cairo', sans-serif", color: config.color }}
              >
                {Math.round(data.result.percentage)}%
              </span>
            </div>
            <div className="h-4 rounded-full overflow-hidden mb-5" style={{ background: "#DFF3F1" }}>
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${data.result.percentage}%`,
                  background: `linear-gradient(90deg, ${config.progressColor} 0%, ${config.color} 100%)`,
                }}
              />
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                {
                  label: "الأسئلة المُجابة",
                  value: `${data.answeredCount ?? "—"}`,
                },
                {
                  label: "المجالات المُقيَّمة",
                  value: `${sortedCategories.length}`,
                },
                { label: "اسم المُقيَّم", value: data.childName },
              ].map((item, i) => (
                <div
                  key={i}
                  className="rounded-xl p-3"
                  style={{ background: "#F4EFE8", border: "1px solid #DFF3F1" }}
                >
                  <div
                    className="text-base font-black text-slate-900 mb-0.5"
                    style={{ fontFamily: "'Cairo', sans-serif" }}
                  >
                    {item.value}
                  </div>
                  <div
                    className="text-xs text-slate-400"
                    style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                  >
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Disclaimer واضح */}
          <div
            className="fade-in-up mt-5 flex items-start gap-3 rounded-2xl px-5 py-4"
            style={{
              background: "rgba(37,99,235,0.05)",
              border: "1px solid rgba(37,99,235,0.12)",
            }}
          >
            <Shield
              size={16}
              style={{ color: "#1E4E8C", flexShrink: 0, marginTop: "2px" }}
            />
            <p
              className="text-xs text-slate-500 leading-relaxed"
              style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.8 }}
            >
              <strong className="text-slate-700">ملاحظة مهمة:</strong> هذا الفحص يرصد مؤشرات أولية فقط ولا يُعدّ تشخيصاً طبياً أو نفسياً رسمياً. الذكاء الاصطناعي يدعم الفهم الأولي — التشخيص الدقيق يتطلب تقييماً شاملاً من متخصص معتمد.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          2. شرح الذكاء الاصطناعي
      ═══════════════════════════════════════════════════════════════════════ */}
      <section
        className="py-14"
        style={{
          background: "linear-gradient(160deg, #243B53 0%, #1E3A5F 50%, #0F2A3F 100%)",
        }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* عنوان القسم */}
          <div className="text-center mb-10 fade-in-up">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
              style={{
                background: "rgba(99,102,241,0.15)",
                border: "1px solid rgba(99,102,241,0.3)",
              }}
            >
              <Sparkles size={14} style={{ color: "#A5B4FC" }} />
              <span
                className="text-xs font-semibold"
                style={{
                  color: "#A5B4FC",
                  fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                }}
              >
                تحليل مدعوم بالذكاء الاصطناعي
              </span>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-semibold"
                style={{
                  background: "rgba(99,102,241,0.2)",
                  color: "#C7D2FE",
                  fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                }}
              >
                شرح توجيهي — ليس تشخيصاً طبياً
              </span>
            </div>
            <h2
              className="text-2xl sm:text-3xl font-black text-white mb-3"
              style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900 }}
            >
              ماذا تعني هذه النتائج؟
            </h2>
            <p
              className="text-blue-200 text-sm max-w-lg mx-auto"
              style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.8 }}
            >
              تحليل أولي يساعدك على فهم ما رصده الفحص — لا يُغني عن تقييم المتخصص
            </p>
          </div>

          {/* الـ 4 أقسام */}
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {
                num: "١",
                title: "ما الذي رصده الفحص؟",
                icon: Brain,
                color: "#93C5FD",
                bg: "rgba(147,197,253,0.1)",
                border: "rgba(147,197,253,0.2)",
                content:
                  aiText.length > 0
                    ? aiText.substring(0, Math.floor(aiText.length * 0.3))
                    : `رصد الفحص مجموعة من الأنماط في مجالات ${sortedCategories
                        .slice(0, 2)
                        .map(([k]) => CATEGORY_INFO[k]?.label ?? k)
                        .join(" و")} تستحق الاهتمام والمتابعة الدقيقة.`,
              },
              {
                num: "٢",
                title: "ماذا قد يعني ذلك؟",
                icon: Sparkles,
                color: "#6EE7B7",
                bg: "rgba(110,231,183,0.1)",
                border: "rgba(110,231,183,0.2)",
                content:
                  aiText.length > 0
                    ? aiText.substring(
                        Math.floor(aiText.length * 0.3),
                        Math.floor(aiText.length * 0.6)
                      )
                    : "هذه الأنماط قد تُشير إلى بعض صعوبات التعلم أو الانتباه التي يمكن معالجتها بشكل فعّال مع الدعم المناسب والمبكر.",
              },
              {
                num: "٣",
                title: "لماذا يهمّ ذلك؟",
                icon: Heart,
                color: "#FCA5A5",
                bg: "rgba(252,165,165,0.1)",
                border: "rgba(252,165,165,0.2)",
                content:
                  aiText.length > 0
                    ? aiText.substring(
                        Math.floor(aiText.length * 0.6),
                        Math.floor(aiText.length * 0.82)
                      )
                    : "الفهم المبكر لهذه المؤشرات يُمكّنك من اتخاذ خطوات دعم مناسبة في الوقت الصحيح — وهذا يُحدث فارقاً حقيقياً في المسيرة التعليمية.",
              },
              {
                num: "٤",
                title: "ما الخطوة التالية الأنسب؟",
                icon: ArrowLeft,
                color: "#FCD34D",
                bg: "rgba(252,211,77,0.1)",
                border: "rgba(252,211,77,0.2)",
                content:
                  aiText.length > 0
                    ? aiText.substring(Math.floor(aiText.length * 0.82))
                    : "يُنصح بمناقشة هذه النتائج مع متخصص معتمد لوضع خطة دعم مناسبة ومخصصة لاحتياجاتك.",
              },
            ].map((section, i) => {
              const SectionIcon = section.icon;
              return (
                <div
                  key={i}
                  className="fade-in-up rounded-2xl p-5"
                  style={{
                    background: section.bg,
                    border: `1px solid ${section.border}`,
                    transitionDelay: `${i * 80}ms`,
                  }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: "rgba(255,255,255,0.1)",
                        border: `1px solid ${section.border}`,
                      }}
                    >
                      <SectionIcon size={16} style={{ color: section.color }} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-lg font-black"
                        style={{
                          color: section.color,
                          fontFamily: "'Cairo', sans-serif",
                          opacity: 0.6,
                        }}
                      >
                        {section.num}
                      </span>
                      <h3
                        className="text-sm font-bold"
                        style={{
                          color: section.color,
                          fontFamily: "'Cairo', sans-serif",
                          fontWeight: 700,
                        }}
                      >
                        {section.title}
                      </h3>
                    </div>
                  </div>
                  <p
                    className="text-sm leading-relaxed"
                    style={{
                      color: "rgba(255,255,255,0.82)",
                      fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                      lineHeight: 1.85,
                    }}
                  >
                    {section.content}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          3. تفصيل النتائج حسب المجال
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-14" style={{ background: "white" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 fade-in-up">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
              style={{
                background: "rgba(37,99,235,0.07)",
                border: "1px solid rgba(37,99,235,0.15)",
              }}
            >
              <TrendingUp size={14} style={{ color: "#1E4E8C" }} />
              <span
                className="text-xs font-semibold text-blue-700"
                style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
              >
                تفصيل النتائج
              </span>
            </div>
            <h2
              className="text-2xl sm:text-3xl font-black text-slate-900 mb-3"
              style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900 }}
            >
              النتائج حسب المجال
            </h2>
            <p
              className="text-slate-500 max-w-lg mx-auto"
              style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.8 }}
            >
              تفصيل دقيق لكل مجال تم تقييمه في الفحص
            </p>
          </div>

          {sortedCategories.length > 0 && (
            <div className="grid sm:grid-cols-2 gap-4">
              {sortedCategories.map(([cat, scores], i) => {
                const catInfo = CATEGORY_INFO[cat] ?? {
                  label: cat,
                  icon: "📊",
                  desc: "",
                };
                const pct = Math.round(scores.percentage);
                let barColor = "#10B981";
                let badgeText = "جيد";
                let badgeBg = "#ECFDF5";
                let badgeColor = "#059669";
                if (pct >= 70) {
                  barColor = "#EF4444";
                  badgeText = "يحتاج اهتماماً";
                  badgeBg = "#FEF2F2";
                  badgeColor = "#DC2626";
                } else if (pct >= 50) {
                  barColor = "#F97316";
                  badgeText = "يحتاج متابعة";
                  badgeBg = "#FFF7ED";
                  badgeColor = "#EA580C";
                } else if (pct >= 30) {
                  barColor = "#F4C46A";
                  badgeText = "متوسط";
                  badgeBg = "#FFFBEB";
                  badgeColor = "#D97706";
                }
                return (
                  <div
                    key={cat}
                    className="fade-in-up rounded-2xl p-5 sm:p-6 transition-all duration-300 hover:shadow-md"
                    style={{
                      background: "white",
                      border: "1.5px solid #DFF3F1",
                      boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                      transitionDelay: `${i * 60}ms`,
                    }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                          style={{ background: "#F4EFE8", border: "1px solid #DFF3F1" }}
                        >
                          {catInfo.icon}
                        </div>
                        <div>
                          <div
                            className="text-sm font-bold text-slate-900"
                            style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 700 }}
                          >
                            {catInfo.label}
                          </div>
                          <div
                            className="text-xs text-slate-400 mt-0.5"
                            style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                          >
                            {catInfo.desc}
                          </div>
                        </div>
                      </div>
                      <span
                        className="text-2xl font-black"
                        style={{ fontFamily: "'Cairo', sans-serif", color: barColor }}
                      >
                        {pct}%
                      </span>
                    </div>
                    <AnimatedProgressBar percentage={pct} color={barColor} />
                    <div className="mt-3 flex justify-between items-center">
                      <span
                        className="text-xs text-slate-400"
                        style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                      >
                        {scores.score} من {scores.max} نقطة
                      </span>
                      <span
                        className="text-xs font-semibold px-3 py-1 rounded-full"
                        style={{
                          background: badgeBg,
                          color: badgeColor,
                          fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                        }}
                      >
                        {badgeText}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* التوصيات المخصصة */}
          {data.result.recommendations.length > 0 && (
            <div
              className="fade-in-up mt-8 rounded-2xl p-6"
              style={{ background: "#FFFBEB", border: "1.5px solid #FDE68A" }}
            >
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: "#FEF3C7", border: "1px solid #FDE68A" }}
                >
                  <FileText size={18} style={{ color: "#F4C46A" }} />
                </div>
                <h3
                  className="text-base font-black text-slate-900"
                  style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 800 }}
                >
                  توصيات مخصصة لك
                </h3>
              </div>
              <div className="space-y-3">
                {data.result.recommendations.slice(0, 4).map((rec, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: "#FEF3C7", border: "1px solid #FDE68A" }}
                    >
                      <span
                        className="text-xs font-black"
                        style={{ color: "#F4C46A", fontFamily: "'Cairo', sans-serif" }}
                      >
                        {i + 1}
                      </span>
                    </div>
                    <p
                      className="text-slate-600 text-sm leading-relaxed"
                      style={{
                        fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                        lineHeight: 1.8,
                      }}
                    >
                      {rec}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          4. معاينة فريق المتخصصين (path-aware، بدون أسماء شخصية)
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-14" style={{ background: "#F4EFE8" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 fade-in-up">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
              style={{
                background: "rgba(20,184,166,0.08)",
                border: "1px solid rgba(20,184,166,0.2)",
              }}
            >
              <Users size={14} style={{ color: "#2BBDB6" }} />
              <span
                className="text-xs font-semibold"
                style={{ color: "#0F766E", fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
              >
                الخطوة التالية
              </span>
            </div>
            <h2
              className="text-2xl sm:text-3xl font-black text-slate-900 mb-3"
              style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900 }}
            >
              {specialistPreview.heading}
            </h2>
            <p
              className="text-slate-500 max-w-xl mx-auto"
              style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.85 }}
            >
              {specialistPreview.description}
            </p>
          </div>

          {/* بطاقات المتخصصين — معاينة فقط، بدون أزرار حجز فردية */}
          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            {specialistPreview.cards.map((card, i) => (
              <div
                key={i}
                className="fade-in-up rounded-2xl p-5 transition-all duration-300"
                style={{
                  background: "white",
                  border: "1.5px solid #DFF3F1",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                  transitionDelay: `${i * 80}ms`,
                }}
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-4"
                  style={{
                    background: `${card.color}10`,
                    border: `1px solid ${card.color}20`,
                  }}
                >
                  {card.icon}
                </div>
                <h3
                  className="text-sm font-black text-slate-900 mb-3"
                  style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 800 }}
                >
                  {card.role}
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {card.specialties.map((s, j) => (
                    <span
                      key={j}
                      className="text-xs px-2.5 py-1 rounded-full font-medium"
                      style={{
                        background: `${card.color}10`,
                        color: card.color,
                        border: `1px solid ${card.color}20`,
                        fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* ملاحظة توضيحية */}
          <div
            className="fade-in-up flex items-start gap-3 rounded-2xl px-5 py-4"
            style={{
              background: "rgba(20,184,166,0.06)",
              border: "1px solid rgba(20,184,166,0.15)",
            }}
          >
            <Info
              size={15}
              style={{ color: "#2BBDB6", flexShrink: 0, marginTop: "2px" }}
            />
            <p
              className="text-xs text-slate-500 leading-relaxed"
              style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.8 }}
            >
              هذه معاينة لنوع المتخصصين المناسبين لنتائج فحصك. بعد الضغط على زر الحجز أدناه، ستتمكن من الاطلاع على التفاصيل الكاملة لكل متخصص واختيار الأنسب لك.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          5. الأسئلة الشائعة
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-14" style={{ background: "white" }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 fade-in-up">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
              style={{
                background: "rgba(37,99,235,0.07)",
                border: "1px solid rgba(37,99,235,0.15)",
              }}
            >
              <HelpCircle size={14} style={{ color: "#1E4E8C" }} />
              <span
                className="text-xs font-semibold text-blue-700"
                style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
              >
                أسئلة شائعة
              </span>
            </div>
            <h2
              className="text-2xl font-black text-slate-900"
              style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900 }}
            >
              قبل أن تتخذ خطوتك التالية
            </h2>
          </div>
          <div className="space-y-3">
            {FAQ_ITEMS.map((item, i) => (
              <AccordionItem
                key={i}
                item={item}
                isOpen={openFaq === i}
                onToggle={() => setOpenFaq(openFaq === i ? null : i)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          6. CTA الوحيد — نهاية الصفحة
      ═══════════════════════════════════════════════════════════════════════ */}
      <section
        className="py-20 relative overflow-hidden no-print"
        style={{
          background: "linear-gradient(135deg, #1e3a8a 0%, #1E4E8C 45%, #0f766e 100%)",
        }}
      >
        {/* دوائر زخرفية */}
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)",
            transform: "translate(30%, -30%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-80 h-80 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(20,184,166,0.12) 0%, transparent 70%)",
            transform: "translate(-30%, 30%)",
          }}
        />

        <div className="relative max-w-2xl mx-auto px-4 sm:px-6 text-center">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 fade-in-up"
            style={{
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <ChevronRight size={14} className="text-teal-300" />
            <span
              className="text-xs font-semibold text-teal-200"
              style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
            >
              الخطوة الأهم بعد الفحص
            </span>
          </div>

          {/* العنوان */}
          <h2
            className="fade-in-up text-3xl sm:text-4xl font-black text-white mb-4"
            style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900, lineHeight: 1.25 }}
          >
            تحتاج مساعدة في فهم هذه النتيجة؟
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, #5eead4 0%, #a5f3fc 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              نحن هنا لمساعدتك
            </span>
          </h2>

          <p
            className="fade-in-up text-blue-100 text-base max-w-lg mx-auto mb-5 leading-relaxed"
            style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.9 }}
          >
            {config.reassurance}
          </p>

          {/* ملاحظة دعم تحت الـ reassurance */}
          <p
            className="fade-in-up text-blue-200 text-sm max-w-md mx-auto mb-10 leading-relaxed"
            style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.85, opacity: 0.85 }}
          >
            يمكنك حجز استشارة أولية لمناقشة المؤشرات والحصول على توجيه أوضح — بهدوء وبدون ضغط.
          </p>

          {/* ─── CTA الوحيد في الصفحة بالكامل ─── */}
          <button
            onClick={handleBooking}
            className="fade-in-up group flex items-center justify-center gap-3 rounded-2xl font-black text-base transition-all duration-300 hover:-translate-y-1 w-full sm:w-auto mx-auto no-print"
            style={{
              background: "white",
              color: "#1e3a8a",
              fontFamily: "'Cairo', sans-serif",
              fontWeight: 800,
              boxShadow: "0 10px 40px rgba(0,0,0,0.25)",
              padding: "1.1rem 2.5rem",
            }}
          >
            <Calendar size={18} />
            احجز استشارة لفهم النتيجة
            <ArrowLeft
              size={18}
              className="transition-transform group-hover:-translate-x-1"
            />
          </button>

          {/* ضمانات */}
          <div className="fade-in-up flex flex-wrap justify-center gap-5 mt-8">
            {[
              { icon: Lock, text: "خصوصية كاملة — بياناتك لن تُشارك" },
              { icon: Shield, text: "لا ضغط — أنت تتحكم في كل خطوة" },
              { icon: BadgeCheck, text: "متخصصون معتمدون" },
            ].map((item, i) => {
              const ItemIcon = item.icon;
              return (
                <div key={i} className="flex items-center gap-2 text-blue-100">
                  <ItemIcon size={14} className="text-teal-300 flex-shrink-0" />
                  <span
                    className="text-sm"
                    style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                  >
                    {item.text}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="py-10" style={{ background: "#243B53" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div
            className="py-5 mb-5"
            style={{
              borderTop: "1px solid #1E293B",
              borderBottom: "1px solid #1E293B",
            }}
          >
            <p
              className="text-slate-500 text-xs leading-relaxed text-center max-w-2xl mx-auto"
              style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.9 }}
            >
              <strong className="text-slate-400">إخلاء مسؤولية:</strong> هذه النتائج هي لأغراض توجيهية أولية فقط ولا تُعدّ تشخيصاً طبياً أو نفسياً رسمياً. يُرجى استشارة متخصص معتمد للحصول على تقييم دقيق وشامل. منصة تشخيصي لا تتحمل مسؤولية أي قرارات تُتخذ بناءً على هذه النتائج وحدها.
            </p>
          </div>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            {[
              { label: "سياسة الخصوصية", path: "/privacy" },
              { label: "إخلاء المسؤولية", path: "/disclaimer" },
              { label: "الخدمات", path: "/services" },
              { label: "الصفحة الرئيسية", path: "/" },
            ].map((link, i) => (
              <button
                key={i}
                onClick={() => navigate(link.path)}
                className="text-slate-500 text-xs hover:text-slate-300 transition-colors"
                style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
