/*
 * ScreeningResult — صفحة نتائج الفحص المُطوَّرة v4 (Conversion-First)
 *
 * تصميم: Editorial Healthcare Calm
 * الهوية البصرية: Cairo + IBM Plex Sans Arabic
 * اللوحة اللونية:
 *   - خلفية: #F8FAFC | سطح: #FFFFFF | نص أساسي: #0F172A
 *   - أزرق أساسي: #2563EB | أخضر ثانوي: #14B8A6 | ذهبي دافئ: #F59E0B
 *
 * هيكل الصفحة (مسار التحويل):
 * 0. شريط التنقل الثابت
 * 1. Hero النتيجة — هادئ وغير مُقلق + شريط التقدم
 * 2. بطاقة الطمأنينة الفورية
 * 3. شرح الذكاء الاصطناعي — محوري ومنظم في 3 أقسام
 * 4. تفصيل النتائج حسب المجال — مرئي وواضح
 * 5. كتلة الطمأنينة العاطفية + إحصاءات الثقة
 * 6. بطاقات المتخصصين + التوصيات المخصصة
 * 7. كتلة تحويل الحجز الرئيسية (CTA)
 * 8. معالجة الاعتراضات + الأسئلة الشائعة
 * 9. شريط رحلة المستخدم
 * 10. تذييل الصفحة
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
  ArrowRight,
  Info,
  Phone,
  Video,
  MapPin,
  BadgeCheck,
  Zap,
  ChevronRight,
  Award,
  FileText,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";

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
    shortLabel: "منخفض",
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
    ctaHeadline: "حافظ على هذا التقدم",
    ctaSubtext: "جلسة متابعة دورية تُساعدك على ضمان استمرار النمو الإيجابي",
    urgencyText: "متابعة دورية موصى بها",
    urgencyColor: "#059669",
  },
  medium: {
    label: "مؤشرات تستحق المتابعة",
    shortLabel: "متوسط",
    icon: AlertCircle,
    color: "#D97706",
    borderColor: "#FDE68A",
    accentBg: "#FFFBEB",
    progressColor: "#F59E0B",
    headline: "رصد الفحص بعض الأنماط التي تستحق الاهتمام",
    subheadline:
      "هذه المؤشرات ليست سبباً للقلق — بل هي فرصة لفهم احتياجات طفلك بشكل أفضل والتصرف في الوقت المناسب.",
    reassurance:
      "كثير من الأطفال يُظهرون مؤشرات مشابهة، والتدخل المبكر يُحدث فارقاً كبيراً في مسيرتهم التعليمية. أنت تتصرف بالطريقة الصحيحة بالبحث عن الدعم المناسب.",
    ctaHeadline: "الوقت المناسب للتصرف هو الآن",
    ctaSubtext: "مناقشة هذه النتائج مع متخصص ستُعطيك خارطة طريق واضحة للدعم",
    urgencyText: "مناقشة مع متخصص موصى بها",
    urgencyColor: "#D97706",
  },
  high: {
    label: "مؤشرات تستدعي الاهتمام",
    shortLabel: "مرتفع",
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
    ctaHeadline: "طفلك يستحق الدعم المناسب",
    ctaSubtext: "التقييم المتخصص سيُعطيك خطة دعم مخصصة وفعّالة",
    urgencyText: "تقييم متخصص موصى به بشدة",
    urgencyColor: "#EA580C",
  },
  critical: {
    label: "مؤشرات تستدعي تقييماً شاملاً",
    shortLabel: "مرتفع جداً",
    icon: XCircle,
    color: "#DC2626",
    borderColor: "#FECACA",
    accentBg: "#FEF2F2",
    progressColor: "#EF4444",
    headline: "الفحص رصد مؤشرات مرتفعة تستدعي تقييماً شاملاً",
    subheadline:
      "هذه النتائج تُشير إلى أهمية التحرك السريع — لكن تذكر: الفهم المبكر هو أفضل هدية يمكنك تقديمها لطفلك.",
    reassurance:
      "الوصول إلى متخصص الآن يعني أن طفلك سيحصل على الدعم الذي يحتاجه في الوقت المناسب. هذا القرار يُمكن أن يُغيّر مساره التعليمي بشكل جذري.",
    ctaHeadline: "التصرف الآن يُحدث الفارق",
    ctaSubtext: "تقييم شامل من متخصص معتمد هو الخطوة الأهم التي يمكنك اتخاذها اليوم",
    urgencyText: "تقييم شامل مطلوب في أقرب وقت",
    urgencyColor: "#DC2626",
  },
};

const CATEGORY_INFO: Record<string, { label: string; icon: string; desc: string }> = {
  reading: { label: "القراءة والفهم", icon: "📖", desc: "القدرة على قراءة النصوص وفهم معناها" },
  writing: { label: "الكتابة والإملاء", icon: "✏️", desc: "مهارات الكتابة والتهجئة الصحيحة" },
  attention: { label: "الانتباه والتركيز", icon: "🎯", desc: "القدرة على التركيز وإتمام المهام" },
  memory: { label: "الذاكرة والمعالجة", icon: "🧠", desc: "استيعاب المعلومات وتذكرها" },
  social: { label: "المهارات الاجتماعية", icon: "🤝", desc: "التفاعل مع الأقران والبيئة المحيطة" },
  motor: { label: "المهارات الحركية", icon: "🖐️", desc: "التنسيق الحركي والمهارات الدقيقة" },
};

// ─── أسئلة شائعة ─────────────────────────────────────────────────────────────
const FAQ_ITEMS = [
  {
    q: "هل هذه النتائج تُعدّ تشخيصاً طبياً رسمياً؟",
    a: "لا. نتائج هذا الفحص هي مؤشرات توجيهية أولية فقط، وليست تشخيصاً طبياً أو نفسياً رسمياً. التشخيص الدقيق يتطلب تقييماً شاملاً من متخصص معتمد. هدف هذا الفحص هو مساعدتك على فهم ما يحتاج إلى متابعة وتوجيهك نحو الخطوة الصحيحة.",
    icon: Info,
    color: "#2563EB",
    bg: "#EFF6FF",
  },
  {
    q: "هل نتائجي وبيانات طفلي خاصة وسرية تماماً؟",
    a: "نعم، بشكل كامل. بياناتك وبيانات طفلك محمية بتشفير كامل ولن تُشارك مع أي جهة خارجية تحت أي ظرف. نحن نلتزم بأعلى معايير الخصوصية وحماية البيانات. يمكنك الاطلاع على سياسة الخصوصية الكاملة لمزيد من التفاصيل.",
    icon: Lock,
    color: "#14B8A6",
    bg: "#F0FDFA",
  },
  {
    q: "ماذا يحدث بعد حجز الجلسة مع المتخصص؟",
    a: "بعد الحجز، ستتلقى تأكيداً فورياً مع تفاصيل الموعد. سيطلع المتخصص على نتائج فحصك قبل الجلسة ليكون مستعداً. خلال الجلسة (٤٥-٦٠ دقيقة)، ستناقشون النتائج بالتفصيل، وستحصل على تقييم أعمق وخطة دعم مخصصة لاحتياجات طفلك.",
    icon: Calendar,
    color: "#F59E0B",
    bg: "#FFFBEB",
  },
  {
    q: "كم تكلف جلسة الاستشارة مع المتخصص؟",
    a: "تختلف تكلفة الجلسات حسب نوع الخدمة والمتخصص. يمكنك الاطلاع على تفاصيل الأسعار الكاملة والباقات المتاحة في صفحة الخدمات، أو التواصل معنا مباشرة للاستفسار.",
    icon: Star,
    color: "#2563EB",
    bg: "#EFF6FF",
  },
  {
    q: "هل يمكنني إجراء الجلسة عن بُعد (أونلاين)؟",
    a: "نعم. نقدم خيار الجلسات عبر الفيديو أونلاين بنفس جودة الجلسات الحضورية. يمكنك اختيار الوقت والطريقة المناسبة لك عند الحجز. متخصصونا معتمدون ومدربون على تقديم الجلسات الرقمية بفاعلية عالية.",
    icon: Video,
    color: "#14B8A6",
    bg: "#F0FDFA",
  },
];

// ─── خطوات الرحلة ────────────────────────────────────────────────────────────
const JOURNEY_STEPS = [
  {
    num: "١",
    title: "أتممت الفحص",
    desc: "خطوة شجاعة ومهمة",
    color: "#2563EB",
    done: true,
    current: false,
  },
  {
    num: "٢",
    title: "راجع النتائج",
    desc: "افهم ما رصده الفحص",
    color: "#14B8A6",
    done: true,
    current: false,
  },
  {
    num: "٣",
    title: "ناقش مع متخصص",
    desc: "خطة دعم مخصصة لك",
    color: "#F59E0B",
    done: false,
    current: true,
  },
  {
    num: "٤",
    title: "خطة الدعم",
    desc: "مسار واضح للأمام",
    color: "#94A3B8",
    done: false,
    current: false,
  },
];

// ─── بيانات المتخصصين ─────────────────────────────────────────────────────────
const SPECIALISTS = [
  {
    name: "",
    title: "أخصائية صعوبات التعلم",
    specialties: ["الديسلكسيا", "صعوبات القراءة", "التدخل المبكر"],
    rating: 0,
    sessions: 0,
    available: "متاحة هذا الأسبوع",
    mode: ["أونلاين", "حضوري"],
    color: "#2563EB",
    initials: "أت",
  },
  {
    name: "",
    title: "أخصائي نفسي تربوي",
    specialties: ["اضطراب الانتباه", "صعوبات التعلم", "التقييم الشامل"],
    rating: 0,
    sessions: 0,
    available: "متاح غداً",
    mode: ["أونلاين"],
    color: "#14B8A6",
    initials: "أن",
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
        border: isOpen ? `1.5px solid ${item.color}30` : "1.5px solid #F1F5F9",
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
            background: isOpen ? item.color : "#F1F5F9",
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
    <div className="h-3 rounded-full overflow-hidden" style={{ background: "#F1F5F9" }}>
      <div
        className="h-full rounded-full transition-all duration-1000 ease-out relative"
        style={{ width: `${width}%`, background: color }}
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)",
          }}
        />
      </div>
    </div>
  );
}

// ─── مكوّن شريط التقدم مع علامة الموضع ─────────────────────────────────────
function ProgressBarWithMarker({ percentage, color }: { percentage: number; color: string }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => setWidth(percentage), 600);
    return () => clearTimeout(timer);
  }, [percentage]);
  return (
    <div
      className="h-full rounded-full transition-all duration-1000 ease-out relative"
      style={{ width: `${width}%`, background: color }}
    >
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.35) 50%, transparent 100%)",
        }}
      />
      {/* علامة الموضع */}
      <div
        className="absolute -left-1 top-1/2 w-4 h-4 rounded-full border-2 border-white shadow-md"
        style={{
          background: color,
          transform: "translateY(-50%)",
          boxShadow: `0 2px 8px ${color}50`,
        }}
      />
    </div>
  );
}

// ─── مكوّن بطاقة المتخصص ─────────────────────────────────────────────────────
function SpecialistCard({ specialist, onBook }: { specialist: typeof SPECIALISTS[0]; onBook: () => void }) {
  return (
    <div
      className="rounded-2xl p-5 transition-all duration-300 hover:shadow-lg"
      style={{
        background: "white",
        border: "1.5px solid #F1F5F9",
        boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
      }}
    >
      <div className="flex items-start gap-4 mb-4">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 text-white font-black text-base"
          style={{
            background: `linear-gradient(135deg, ${specialist.color} 0%, ${specialist.color}CC 100%)`,
            fontFamily: "'Cairo', sans-serif",
          }}
        >
          {specialist.initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3
              className="text-base font-black text-slate-900"
              style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900 }}
            >
              {specialist.title}
            </h3>
            <div
              className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
              style={{ background: "#ECFDF5", color: "#059669" }}
            >
              <BadgeCheck size={11} />
              معتمد
            </div>
          </div>
          <p
            className="text-slate-500 text-sm mb-2"
            style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
          >
            متخصص معتمد من فريق تشخيصي
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {specialist.specialties.map((s, i) => (
          <span
            key={i}
            className="text-xs px-2.5 py-1 rounded-full font-medium"
            style={{
              background: `${specialist.color}10`,
              color: specialist.color,
              border: `1px solid ${specialist.color}20`,
              fontFamily: "'IBM Plex Sans Arabic', sans-serif",
            }}
          >
            {s}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span
            className="text-xs font-semibold text-emerald-600"
            style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
          >
            {specialist.available}
          </span>
        </div>
        <div className="flex gap-1.5">
          {specialist.mode.map((m, i) => (
            <span
              key={i}
              className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
              style={{ background: "#F8FAFC", color: "#475569", border: "1px solid #E2E8F0", fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
            >
              {m === "أونلاين" ? <Video size={10} /> : <MapPin size={10} />}
              {m}
            </span>
          ))}
        </div>
      </div>

      <button
        onClick={onBook}
        className="w-full py-3 rounded-xl text-white font-bold text-sm transition-all duration-200 hover:opacity-90"
        style={{
          background: `linear-gradient(135deg, ${specialist.color} 0%, ${specialist.color}CC 100%)`,
          fontFamily: "'Cairo', sans-serif",
          fontWeight: 700,
          boxShadow: `0 4px 16px ${specialist.color}30`,
        }}
      >
        احجز جلسة مع هذا المتخصص
      </button>
    </div>
  );
}

// ─── المكوّن الرئيسي ──────────────────────────────────────────────────────────
interface ScreeningResultProps {
  sessionId: string;
}

export default function ScreeningResult({ sessionId }: ScreeningResultProps) {
  const [, navigate] = useLocation();
  const [data, setData] = useState<StoredResult | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<"ai" | "categories">("ai");
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(`result_${sessionId}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setData(parsed);
        setTimeout(() => setVisible(true), 100);
        return;
      } catch {
        // ignore
      }
    }
    setNotFound(true);
  }, [sessionId]);

  // IntersectionObserver للأقسام
  useEffect(() => {
    if (!data) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll(".fade-in-up").forEach((el, i) => {
              setTimeout(() => el.classList.add("visible"), i * 80);
            });
          }
        });
      },
      { threshold: 0.06 }
    );
    sectionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });
    return () => observer.disconnect();
  }, [data]);

  function handleShare() {
    const name = data?.childName ?? "المستخدم";
    const level = data ? RISK_CONFIG[data.result.riskLevel].shortLabel : "";
    const text = `أتممت فحص ${name} على منصة تشخيصي — مستوى المؤشر: ${level}. للمزيد: https://tashkheesy.com`;
    if (navigator.share) {
      navigator.share({ text, title: "نتيجة فحص تشخيصي" });
    } else {
      navigator.clipboard.writeText(text);
      toast.success("تم نسخ النتيجة للحافظة");
    }
  }

  // ─── حالة عدم وجود نتيجة ─────────────────────────────────────────────────
  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" dir="rtl" style={{ background: "#F8FAFC" }}>
        <div
          className="max-w-md w-full text-center rounded-3xl p-10"
          style={{ background: "white", boxShadow: "0 8px 40px rgba(0,0,0,0.08)", border: "1px solid #F1F5F9" }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: "#EFF6FF" }}
          >
            <HelpCircle size={28} style={{ color: "#2563EB" }} />
          </div>
          <h2 className="text-xl font-black text-slate-900 mb-3" style={{ fontFamily: "'Cairo', sans-serif" }}>
            لم يتم العثور على النتيجة
          </h2>
          <p className="text-slate-500 text-sm mb-6 leading-relaxed" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.8 }}>
            قد تكون النتيجة انتهت صلاحيتها أو لم يكتمل الفحص بعد.
          </p>
          <button
            onClick={() => navigate("/children")}
            className="w-full py-3.5 rounded-2xl text-white font-bold text-sm transition-all duration-200"
            style={{
              background: "linear-gradient(135deg, #2563EB 0%, #1d4ed8 100%)",
              fontFamily: "'Cairo', sans-serif",
              boxShadow: "0 4px 16px rgba(37,99,235,0.3)",
            }}
          >
            العودة لقائمة الأطفال
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl" style={{ background: "#F8FAFC" }}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-sm" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>
            جاري تحميل نتائجك...
          </p>
        </div>
      </div>
    );
  }

  const { result } = data;
  const config = RISK_CONFIG[result.riskLevel] ?? RISK_CONFIG.medium;
  const RiskIcon = config.icon;
  const completedDate = new Date(data.completedAt).toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const sortedCategories = Object.entries(result.categoryScores).sort(
    ([, a], [, b]) => b.percentage - a.percentage
  );

  // تحليل الذكاء الاصطناعي — تقسيمه إلى 3 أقسام
  const aiText = result.aiExplanation ?? "";
  const aiSections = [
    {
      title: "ما الذي رصده الفحص؟",
      icon: Brain,
      color: "#2563EB",
      bg: "#EFF6FF",
      content:
        aiText.length > 0
          ? aiText.substring(0, Math.floor(aiText.length * 0.35))
          : `رصد الفحص مجموعة من الأنماط في مجالات ${sortedCategories.slice(0, 2).map(([k]) => CATEGORY_INFO[k]?.label ?? k).join(" و")} تستحق الاهتمام والمتابعة.`,
    },
    {
      title: "ماذا قد يعني ذلك؟",
      icon: Sparkles,
      color: "#14B8A6",
      bg: "#F0FDFA",
      content:
        aiText.length > 0
          ? aiText.substring(Math.floor(aiText.length * 0.35), Math.floor(aiText.length * 0.7))
          : "هذه الأنماط قد تُشير إلى بعض صعوبات التعلم أو الانتباه التي يمكن معالجتها بشكل فعّال مع الدعم المناسب والمبكر.",
    },
    {
      title: "ما الخطوة التالية الأنسب؟",
      icon: ArrowLeft,
      color: "#F59E0B",
      bg: "#FFFBEB",
      content:
        aiText.length > 0
          ? aiText.substring(Math.floor(aiText.length * 0.7))
          : "يُنصح بمناقشة هذه النتائج مع متخصص معتمد لوضع خطة دعم مناسبة ومخصصة لاحتياجات طفلك الفريدة.",
    },
  ];

  const animClass = `transition-all duration-700 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`;

  // حساب تسمية التقدم
  const progressLabel = result.percentage >= 70 ? "مرتفع جداً" : result.percentage >= 50 ? "مرتفع" : result.percentage >= 30 ? "متوسط" : "منخفض";

  return (
    <div
      className="min-h-screen"
      dir="rtl"
      style={{ background: "#F8FAFC", fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
    >
      {/* ─── CSS للرسوم المتحركة ──────────────────────────────────────────────── */}
      <style>{`
        .fade-in-up {
          opacity: 0;
          transform: translateY(18px);
          transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }
        .fade-in-up.visible {
          opacity: 1;
          transform: translateY(0);
        }
        .specialist-card:hover {
          transform: translateY(-2px);
        }
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
        }
      `}</style>

      {/* ─── 0. شريط التنقل الثابت ───────────────────────────────────────────── */}
      <nav
        className="sticky top-0 z-50 no-print"
        style={{
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid #F1F5F9",
          boxShadow: "0 1px 12px rgba(0,0,0,0.05)",
        }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #2563EB 0%, #14B8A6 100%)" }}
            >
              <span className="text-white text-sm font-black" style={{ fontFamily: "'Cairo', sans-serif" }}>ت</span>
            </div>
            <div>
              <span className="text-sm font-black text-slate-900 block" style={{ fontFamily: "'Cairo', sans-serif" }}>
                تشخيصي
              </span>
              <span className="text-xs text-slate-400" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>
                نتيجة فحص {data.childName}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-500 text-xs font-medium transition-all duration-200 hover:bg-slate-50 hover:text-slate-700"
              style={{ fontFamily: "'Cairo', sans-serif" }}
            >
              <Share2 size={14} />
              <span className="hidden sm:inline">مشاركة</span>
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-500 text-xs font-medium transition-all duration-200 hover:bg-slate-50 hover:text-slate-700"
              style={{ fontFamily: "'Cairo', sans-serif" }}
            >
              <Printer size={14} />
              <span className="hidden sm:inline">طباعة</span>
            </button>
            <button
              onClick={() => navigate("/children")}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-500 text-xs font-medium transition-all duration-200 hover:bg-slate-50 hover:text-slate-700"
              style={{ fontFamily: "'Cairo', sans-serif" }}
            >
              <ArrowRight size={14} />
              <span className="hidden sm:inline">رجوع</span>
            </button>
            <button
              onClick={() => navigate("/booking")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-xs font-bold transition-all duration-200 hover:opacity-90 no-print"
              style={{
                background: "linear-gradient(135deg, #2563EB 0%, #1d4ed8 100%)",
                fontFamily: "'Cairo', sans-serif",
                boxShadow: "0 2px 8px rgba(37,99,235,0.3)",
              }}
            >
              <Calendar size={13} />
              احجز الآن
            </button>
          </div>
        </div>
      </nav>

      {/* ─── 1. Hero النتيجة ─────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden pt-10 pb-14"
        style={{ background: "linear-gradient(160deg, #F8FAFC 0%, #EFF6FF 55%, #F0FDFA 100%)" }}
      >
        {/* نقاط زخرفية خفية */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(37,99,235,0.15) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        {/* Blobs زخرفية */}
        <div
          className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(37,99,235,0.05) 0%, transparent 70%)",
            transform: "translate(-40%, -40%)",
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(20,184,166,0.05) 0%, transparent 70%)",
            transform: "translate(40%, 40%)",
          }}
        />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6">
          {/* شارة التاريخ والمعلومات */}
          <div className={`text-center mb-6 ${animClass}`} style={{ transitionDelay: "0ms" }}>
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-3"
              style={{
                background: "rgba(37,99,235,0.07)",
                border: "1px solid rgba(37,99,235,0.15)",
              }}
            >
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span
                className="text-xs font-semibold text-blue-700"
                style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
              >
                {completedDate} · {data.answeredCount} سؤالاً مجاباً من {data.totalCount}
              </span>
            </div>
          </div>

          {/* بطاقة النتيجة الرئيسية */}
          <div
            className={`rounded-3xl p-7 sm:p-10 mb-6 ${animClass}`}
            style={{
              transitionDelay: "100ms",
              background: "white",
              border: `2px solid ${config.borderColor}`,
              boxShadow: `0 24px 80px ${config.color}12, 0 8px 24px rgba(0,0,0,0.06)`,
            }}
          >
            {/* شريط اسم الطفل في الأعلى */}
            <div
              className="flex items-center gap-2 mb-6 pb-4"
              style={{ borderBottom: `1px solid ${config.borderColor}60` }}
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-black flex-shrink-0"
                style={{ background: `linear-gradient(135deg, ${config.color} 0%, ${config.color}CC 100%)`, fontFamily: "'Cairo', sans-serif" }}
              >
                {data.childName.charAt(0)}
              </div>
              <div>
                <span
                  className="text-sm font-bold text-slate-900"
                  style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 700 }}
                >
                  نتيجة فحص {data.childName}
                </span>
                <span
                  className="text-xs text-slate-400 mx-2"
                  style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                >
                  ·
                </span>
                <span
                  className="text-xs text-slate-400"
                  style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                >
                  {data.screeningType}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {/* أيقونة المستوى */}
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0 relative"
                style={{
                  background: `linear-gradient(135deg, ${config.accentBg} 0%, white 100%)`,
                  border: `2px solid ${config.borderColor}`,
                  boxShadow: `0 8px 32px ${config.color}20`,
                }}
              >
                <RiskIcon size={36} style={{ color: config.color }} />
                <div
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    background: `radial-gradient(circle at 30% 30%, ${config.color}08, transparent 60%)`,
                  }}
                />
              </div>

              {/* النص */}
              <div className="flex-1">
                <div
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-3"
                  style={{
                    background: config.accentBg,
                    color: config.color,
                    border: `1px solid ${config.borderColor}`,
                    fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: config.color }} />
                  {config.label}
                </div>
                <h1
                  className="text-2xl sm:text-3xl font-black text-slate-900 mb-2 leading-tight"
                  style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900, lineHeight: 1.3 }}
                >
                  {config.headline}
                </h1>
                <p
                  className="text-slate-600 leading-relaxed text-sm sm:text-base"
                  style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.85 }}
                >
                  {config.subheadline}
                </p>
              </div>
            </div>

            {/* شريط النسبة المحسّن */}
            <div className="mt-8 pt-6" style={{ borderTop: "1px solid #F1F5F9" }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span
                    className="text-sm font-semibold text-slate-600 block mb-0.5"
                    style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                  >
                    مستوى المؤشرات الإجمالي
                  </span>
                  <span
                    className="text-xs px-2.5 py-0.5 rounded-full font-semibold"
                    style={{
                      background: `${config.color}12`,
                      color: config.color,
                      fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                    }}
                  >
                    {progressLabel}
                  </span>
                </div>
                <div className="text-right">
                  <span
                    className="text-3xl font-black block leading-none"
                    style={{ fontFamily: "'Cairo', sans-serif", color: config.color }}
                  >
                    {result.percentage}%
                  </span>
                  <span
                    className="text-xs text-slate-400"
                    style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                  >
                    من أصل 100
                  </span>
                </div>
              </div>
              {/* شريط تقدم محسّن بأربعة أقسام */}
              <div className="relative h-4 rounded-full overflow-hidden" style={{ background: "#F1F5F9" }}>
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: "linear-gradient(to left, #EF4444 0%, #F97316 33%, #F59E0B 66%, #10B981 100%)",
                    opacity: 0.15,
                  }}
                />
                <ProgressBarWithMarker percentage={result.percentage} color={config.progressColor} />
              </div>
              <div className="flex justify-between mt-2.5">
                {[
                  { label: "منخفض", color: "#059669" },
                  { label: "متوسط", color: "#D97706" },
                  { label: "مرتفع", color: "#EA580C" },
                  { label: "عالٍ جداً", color: "#DC2626" },
                ].map((item, i) => (
                  <span
                    key={i}
                    className="text-xs font-medium"
                    style={{ color: item.color, fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                  >
                    {item.label}
                  </span>
                ))}
              </div>
            </div>

            {/* تذكير هادئ */}
            <div
              className="mt-5 flex items-start gap-3 p-4 rounded-2xl"
              style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: "#EFF6FF" }}
              >
                <Shield size={15} style={{ color: "#2563EB" }} />
              </div>
              <p
                className="text-slate-500 text-xs leading-relaxed"
                style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.9 }}
              >
                <strong className="text-slate-700">تذكير مهم:</strong> هذا الفحص هو أداة توجيهية أولية وليس تشخيصاً طبياً رسمياً. نتائجه تُساعدك على فهم ما يحتاج إلى متابعة وتوجيهك نحو الدعم المناسب.
              </p>
            </div>
          </div>

          {/* CTA سريع بعد النتيجة مباشرة */}
          <div
            className={`rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 ${animClass}`}
            style={{
              transitionDelay: "200ms",
              background: `linear-gradient(135deg, ${config.color}08 0%, ${config.color}04 100%)`,
              border: `1.5px solid ${config.color}20`,
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${config.color}15` }}
              >
                <Zap size={18} style={{ color: config.color }} />
              </div>
              <div>
                <p
                  className="text-sm font-bold text-slate-900"
                  style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 700 }}
                >
                  {config.urgencyText}
                </p>
                <p
                  className="text-xs text-slate-500"
                  style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                >
                  {config.ctaSubtext}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/booking")}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-sm transition-all duration-200 hover:opacity-90 whitespace-nowrap no-print"
              style={{
                background: `linear-gradient(135deg, ${config.color} 0%, ${config.color}CC 100%)`,
                fontFamily: "'Cairo', sans-serif",
                fontWeight: 700,
                boxShadow: `0 4px 16px ${config.color}30`,
              }}
            >
              <Calendar size={15} />
              احجز جلسة مناقشة
              <ArrowLeft size={15} />
            </button>
          </div>
        </div>
      </section>

      {/* ─── 2. شرح الذكاء الاصطناعي + تفصيل النتائج (تابز) ──────────────────── */}
      <section
        className="py-16"
        style={{ background: "white" }}
        ref={(el) => { sectionRefs.current[0] = el; }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          {/* رأس القسم */}
          <div className="text-center mb-8 fade-in-up">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
              style={{
                background: "linear-gradient(135deg, rgba(37,99,235,0.08) 0%, rgba(20,184,166,0.08) 100%)",
                border: "1px solid rgba(37,99,235,0.15)",
              }}
            >
              <Sparkles size={14} style={{ color: "#2563EB" }} />
              <span
                className="text-xs font-semibold text-blue-700"
                style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
              >
                تحليل مدعوم بالذكاء الاصطناعي
              </span>
            </div>
            <h2
              className="text-3xl sm:text-4xl font-black text-slate-900 mb-4"
              style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900 }}
            >
              فهم نتائجك{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #2563EB 0%, #14B8A6 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                بوضوح كامل
              </span>
            </h2>
            <p
              className="text-slate-500 max-w-xl mx-auto leading-relaxed"
              style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.85 }}
            >
              حلّل نظام الذكاء الاصطناعي إجاباتك وأعدّ لك شرحاً مفصلاً ومفهوماً لما رصده الفحص.
            </p>
          </div>

          {/* تابز */}
          <div className="flex gap-2 mb-8 fade-in-up justify-center">
            {[
              { key: "ai", label: "تحليل الذكاء الاصطناعي", icon: Brain },
              { key: "categories", label: "النتائج حسب المجال", icon: TrendingUp },
            ].map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as "ai" | "categories")}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
                  style={{
                    background: isActive ? "#2563EB" : "white",
                    color: isActive ? "white" : "#475569",
                    border: isActive ? "none" : "1.5px solid #E2E8F0",
                    fontFamily: "'Cairo', sans-serif",
                    boxShadow: isActive ? "0 4px 16px rgba(37,99,235,0.25)" : "none",
                  }}
                >
                  <TabIcon size={15} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* محتوى التاب: شرح الذكاء الاصطناعي */}
          {activeTab === "ai" && (
            <div className="space-y-4">
              {aiSections.map((section, i) => {
                const SectionIcon = section.icon;
                return (
                  <div
                    key={i}
                    className="fade-in-up rounded-2xl p-6 sm:p-8 transition-all duration-300 hover:shadow-md"
                    style={{
                      background: "white",
                      border: `1.5px solid ${section.color}20`,
                      boxShadow: `0 4px 20px ${section.color}06`,
                    }}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                        style={{ background: section.bg, border: `1px solid ${section.color}25` }}
                      >
                        <SectionIcon size={22} style={{ color: section.color }} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <h3
                            className="text-base font-black text-slate-900"
                            style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 800 }}
                          >
                            {section.title}
                          </h3>
                          <div
                            className="h-px flex-1"
                            style={{ background: `${section.color}15` }}
                          />
                        </div>
                        <p
                          className="text-slate-600 leading-relaxed text-sm"
                          style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.95 }}
                        >
                          {section.content}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* بطاقة جودة التحليل */}
              <div
                className="fade-in-up rounded-2xl p-5 flex items-center gap-4"
                style={{
                  background: "linear-gradient(135deg, #EFF6FF 0%, #F0FDFA 100%)",
                  border: "1.5px solid rgba(37,99,235,0.12)",
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "white", boxShadow: "0 2px 8px rgba(37,99,235,0.12)" }}
                >
                  <Award size={18} style={{ color: "#2563EB" }} />
                </div>
                <div className="flex-1">
                  <p
                    className="text-sm font-bold text-slate-800 mb-1"
                    style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 700 }}
                  >
                    تحليل مبني على {data.answeredCount} إجابة
                  </p>
                  <p
                    className="text-xs text-slate-500"
                    style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                  >
                    نظام الذكاء الاصطناعي يُحلل الأنماط عبر {Object.keys(result.categoryScores).length} مجالات مختلفة لتقديم صورة شاملة
                  </p>
                </div>
                <div
                  className="text-xs font-semibold px-3 py-1.5 rounded-full"
                  style={{ background: "#ECFDF5", color: "#059669", fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                >
                  تحليل مكتمل
                </div>
              </div>
            </div>
          )}

          {/* محتوى التاب: النتائج حسب المجال */}
          {activeTab === "categories" && sortedCategories.length > 0 && (
            <div className="grid sm:grid-cols-2 gap-4">
              {sortedCategories.map(([cat, scores], i) => {
                const catInfo = CATEGORY_INFO[cat] ?? { label: cat, icon: "📊", desc: "" };
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
                  barColor = "#F59E0B";
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
                      border: "1.5px solid #F1F5F9",
                      boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                      transitionDelay: `${i * 60}ms`,
                    }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                          style={{ background: "#F8FAFC", border: "1px solid #F1F5F9" }}
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
        </div>
      </section>

      {/* ─── 3. كتلة الطمأنينة العاطفية + إحصاءات الثقة ─────────────────────── */}
      <section
        className="py-16 relative overflow-hidden"
        style={{ background: "#F8FAFC" }}
        ref={(el) => { sectionRefs.current[1] = el; }}
      >
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6">
          <div
            className="fade-in-up rounded-3xl overflow-hidden relative"
            style={{
              background: "linear-gradient(135deg, #F0FDFA 0%, #ECFDF5 100%)",
              border: "1.5px solid #A7F3D0",
              boxShadow: "0 8px 40px rgba(20,184,166,0.08)",
            }}
          >
            {/* صورة الاستشارة */}
            <div className="flex flex-col lg:flex-row">
              {/* المحتوى */}
              <div className="flex-1 p-8 sm:p-10">
                <div
                  className="absolute top-0 left-0 w-64 h-64 rounded-full pointer-events-none"
                  style={{
                    background: "radial-gradient(circle, rgba(20,184,166,0.1) 0%, transparent 70%)",
                    transform: "translate(-30%, -30%)",
                  }}
                />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-5">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center"
                      style={{ background: "white", boxShadow: "0 2px 12px rgba(20,184,166,0.15)" }}
                    >
                      <Heart size={22} style={{ color: "#14B8A6" }} />
                    </div>
                    <h2
                      className="text-2xl font-black text-slate-900"
                      style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900 }}
                    >
                      أنت لست وحدك في هذا
                    </h2>
                  </div>

              <p
                className="text-slate-700 leading-relaxed mb-8 text-base max-w-2xl"
                style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.95 }}
              >
                {config.reassurance}
              </p>

              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  {
                    icon: Users,
                    color: "#14B8A6",
                    stat: "١ من كل ٥",
                    title: "أطفال",
                    desc: "يُظهر بعض مؤشرات صعوبات التعلم",
                  },
                  {
                    icon: Clock,
                    color: "#2563EB",
                    stat: "٨٠٪",
                    title: "نجاح",
                    desc: "نسبة التحسن مع التدخل المبكر المناسب",
                  },
                  {
                    icon: Lock,
                    color: "#F59E0B",
                    stat: "١٠٠٪",
                    title: "خصوصية",
                    desc: "بياناتك محمية ولن تُشارك مع أي جهة",
                  },
                ].map((item, i) => {
                  const ItemIcon = item.icon;
                  return (
                    <div
                      key={i}
                      className="rounded-2xl p-5 flex items-start gap-3"
                      style={{
                        background: "white",
                        border: "1px solid rgba(255,255,255,0.8)",
                        boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                      }}
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: `${item.color}12` }}
                      >
                        <ItemIcon size={18} style={{ color: item.color }} />
                      </div>
                      <div>
                        <div
                          className="text-xl font-black mb-0.5"
                          style={{ fontFamily: "'Cairo', sans-serif", color: item.color }}
                        >
                          {item.stat}{" "}
                          <span className="text-sm text-slate-700">{item.title}</span>
                        </div>
                        <div
                          className="text-xs text-slate-500 leading-relaxed"
                          style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.7 }}
                        >
                          {item.desc}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
                </div>
              </div>
              {/* صورة الاستشارة */}
              <div
                className="hidden lg:block w-72 flex-shrink-0 relative overflow-hidden"
                style={{ minHeight: "320px" }}
              >
                <img
                  src="https://d2xsxph8kpxj0f.cloudfront.net/310519663154655019/kcWP7YGcBeWb4AM3qXYGBt/result-specialist-consult-B2JtPbJfTMGfAGPmJBbqRZ.webp"
                  alt="استشارة متخصص"
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ filter: "brightness(0.92) saturate(0.9)" }}
                />
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(to right, rgba(240,253,250,0.6) 0%, transparent 40%)" }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 4. بطاقات المتخصصين + التوصيات ────────────────────────────────── */}
      <section
        className="py-16"
        style={{ background: "white" }}
        ref={(el) => { sectionRefs.current[2] = el; }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 fade-in-up">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
              style={{
                background: "rgba(245,158,11,0.08)",
                border: "1px solid rgba(245,158,11,0.2)",
              }}
            >
              <Star size={14} style={{ color: "#F59E0B" }} />
              <span
                className="text-xs font-semibold"
                style={{ color: "#B45309", fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
              >
                الخطوة التالية الموصى بها
              </span>
            </div>
            <h2
              className="text-3xl sm:text-4xl font-black text-slate-900 mb-4"
              style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900 }}
            >
              {config.ctaHeadline}
            </h2>
            <p
              className="text-slate-500 max-w-xl mx-auto"
              style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.85 }}
            >
              {config.ctaSubtext}
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* بطاقات المتخصصين */}
            <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
              {SPECIALISTS.map((specialist, i) => (
                <div key={i} className="fade-in-up specialist-card transition-all duration-300" style={{ transitionDelay: `${i * 100}ms` }}>
                  <SpecialistCard
                    specialist={specialist}
                    onBook={() => navigate("/booking")}
                  />
                </div>
              ))}

              {/* بطاقة صورة الاستشارة */}
              <div
                className="fade-in-up sm:col-span-2 rounded-2xl overflow-hidden relative"
                style={{
                  height: "180px",
                  border: "1.5px solid #BFDBFE",
                  boxShadow: "0 4px 20px rgba(37,99,235,0.08)",
                }}
              >
                <img
                  src="https://d2xsxph8kpxj0f.cloudfront.net/310519663154655019/kcWP7YGcBeWb4AM3qXYGBt/result-specialist-consult-aTMiy3r6ccGFEfwBH8RfxS.webp"
                  alt="جلسة استشارة مع متخصص تشخيصي"
                  className="w-full h-full object-cover"
                />
                <div
                  className="absolute inset-0 flex items-end p-5"
                  style={{ background: "linear-gradient(to top, rgba(15,23,42,0.7) 0%, transparent 60%)" }}
                >
                  <div>
                    <p
                      className="text-white font-black text-lg mb-1"
                      style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900 }}
                    >
                      جلسة مناقشة النتائج
                    </p>
                    <p
                      className="text-blue-200 text-sm"
                      style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                    >
                      ٤٥-٦٠ دقيقة مع متخصص معتمد · أونلاين أو حضوري
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* التوصيات المخصصة */}
            <div className="fade-in-up flex flex-col gap-4">
              {/* بطاقة التوصيات */}
              <div
                className="rounded-2xl p-6 flex-1"
                style={{
                  background: "white",
                  border: "1.5px solid #F1F5F9",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
                }}
              >
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center"
                    style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }}
                  >
                    <FileText size={20} style={{ color: "#F59E0B" }} />
                  </div>
                  <h3
                    className="text-base font-black text-slate-900"
                    style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 800 }}
                  >
                    توصيات مخصصة لك
                  </h3>
                </div>
                <div className="space-y-3">
                  {(result.recommendations.length > 0
                    ? result.recommendations.slice(0, 4)
                    : [
                        "تحدث مع معلم طفلك عن ملاحظاتك",
                        "احجز جلسة مناقشة مع متخصص معتمد",
                        "تابع تطور طفلك كل ٣ أشهر",
                        "استعن بأنشطة دعم تعليمي في المنزل",
                      ]
                  ).map((rec, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }}
                      >
                        <span
                          className="text-xs font-black"
                          style={{ color: "#F59E0B", fontFamily: "'Cairo', sans-serif" }}
                        >
                          {i + 1}
                        </span>
                      </div>
                      <p
                        className="text-slate-600 text-sm leading-relaxed"
                        style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.8 }}
                      >
                        {rec}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* بطاقة السعر */}
              <div
                className="rounded-2xl p-5"
                style={{
                  background: "linear-gradient(135deg, #EFF6FF 0%, #F0FDFA 100%)",
                  border: "1.5px solid rgba(37,99,235,0.15)",
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <BadgeCheck size={16} style={{ color: "#2563EB" }} />
                  <span
                    className="text-sm font-bold text-slate-900"
                    style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 700 }}
                  >
                    احجز جلسة مناقشة النتائج
                  </span>
                </div>
                <p
                  className="text-sm text-slate-600 mb-4 leading-relaxed"
                  style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.75 }}
                >
                  جلسة ٤٥-٦٠ دقيقة مع متخصص معتمد — أونلاين أو حضوري حسب تفضيلك.
                </p>
                <button
                  onClick={() => navigate("/booking")}
                  className="w-full py-2.5 rounded-xl text-white font-bold text-sm transition-all duration-200 hover:opacity-90 no-print"
                  style={{
                    background: "linear-gradient(135deg, #2563EB 0%, #1d4ed8 100%)",
                    fontFamily: "'Cairo', sans-serif",
                    fontWeight: 700,
                    boxShadow: "0 4px 16px rgba(37,99,235,0.25)",
                  }}
                >
                  احجز الآن
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 5. كتلة تحويل الحجز الرئيسية ─────────────────────────────────── */}
      <section
        className="py-20 relative overflow-hidden"
        ref={(el) => { sectionRefs.current[3] = el; }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(135deg, #1e3a8a 0%, #2563EB 45%, #0f766e 100%)",
          }}
        />
        {/* دوائر زخرفية */}
        <div
          className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 70%)",
            transform: "translate(30%, -30%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(20,184,166,0.15) 0%, transparent 70%)",
            transform: "translate(-30%, 30%)",
          }}
        />
        {/* نقاط زخرفية */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div
            className="fade-in-up inline-flex items-center gap-2 px-5 py-2.5 rounded-full mb-7"
            style={{
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.2)",
              backdropFilter: "blur(10px)",
            }}
          >
            <span className="w-2 h-2 rounded-full bg-teal-300 animate-pulse" />
            <span
              className="text-white text-xs font-medium"
              style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
            >
              الخطوة الأهم بعد الفحص
            </span>
          </div>

          <h2
            className="fade-in-up text-4xl sm:text-5xl font-black text-white mb-5"
            style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900, lineHeight: 1.2 }}
          >
            تحدث مع متخصص
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, #5eead4 0%, #a5f3fc 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              عن هذه النتائج
            </span>
          </h2>

          <p
            className="fade-in-up text-blue-100 text-lg max-w-xl mx-auto mb-10 leading-relaxed"
            style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.85 }}
          >
            لا تترك هذه النتائج بدون متابعة. محادثة واحدة مع متخصص معتمد يمكن أن تُغيّر مسار طفلك تماماً.
          </p>

          {/* أزرار CTA */}
          <div className="fade-in-up flex flex-col sm:flex-row gap-4 justify-center mb-10 no-print">
            <button
              onClick={() => navigate("/booking")}
              className="group flex items-center justify-center gap-3 rounded-2xl font-black text-base transition-all duration-300 hover:-translate-y-1"
              style={{
                background: "white",
                color: "#1e3a8a",
                fontFamily: "'Cairo', sans-serif",
                fontWeight: 800,
                boxShadow: "0 10px 40px rgba(0,0,0,0.25)",
                padding: "1.1rem 2rem",
              }}
            >
              <Calendar size={18} />
              احجز جلسة مناقشة النتائج
              <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
            </button>
            <button
              onClick={() => navigate("/services")}
              className="flex items-center justify-center gap-2 rounded-2xl font-semibold text-base transition-all duration-200 hover:bg-white/20"
              style={{
                background: "rgba(255,255,255,0.12)",
                color: "white",
                border: "1.5px solid rgba(255,255,255,0.25)",
                fontFamily: "'Cairo', sans-serif",
                backdropFilter: "blur(10px)",
                padding: "1.1rem 2rem",
              }}
            >
              استكشف خيارات الدعم
            </button>
          </div>

          {/* ضمانات */}
          <div className="fade-in-up flex flex-wrap justify-center gap-5">
            {[
              { icon: Lock, text: "خصوصية كاملة — بياناتك لن تُشارك" },
              { icon: Shield, text: "لا ضغط — أنت تتحكم في كل خطوة" },
              { icon: Phone, text: "دعم مستمر بعد الجلسة" },
            ].map((item, i) => {
              const ItemIcon = item.icon;
              return (
                <div key={i} className="flex items-center gap-2 text-blue-100">
                  <ItemIcon size={14} className="text-teal-300 flex-shrink-0" />
                  <span className="text-sm" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>
                    {item.text}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── 6. معالجة الاعتراضات + الأسئلة الشائعة ─────────────────────────── */}
      <section
        className="py-16"
        style={{ background: "#F8FAFC" }}
        ref={(el) => { sectionRefs.current[4] = el; }}
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          {/* معالجة الاعتراضات */}
          <div
            className="fade-in-up rounded-3xl p-7 sm:p-8 mb-10"
            style={{
              background: "white",
              border: "1.5px solid #F1F5F9",
              boxShadow: "0 4px 24px rgba(0,0,0,0.05)",
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "#EFF6FF" }}
              >
                <MessageCircle size={18} style={{ color: "#2563EB" }} />
              </div>
              <h3
                className="text-xl font-black text-slate-900"
                style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900 }}
              >
                قبل أن تتردد...
              </h3>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                {
                  concern: "لست متأكداً إن كانت النتائج دقيقة",
                  answer: "هذا بالضبط سبب وجود المتخصص — ليُقيّم ويُؤكد أو يُوضح ما رصده الفحص.",
                  icon: "🎯",
                },
                {
                  concern: "أخشى أن تكون النتائج مقلقة",
                  answer: "المعرفة المبكرة هي أفضل هدية — التدخل المبكر يُحدث فارقاً جوهرياً.",
                  icon: "💙",
                },
                {
                  concern: "لا أعرف ما الذي سيحدث في الجلسة",
                  answer: "جلسة هادئة ومريحة — مناقشة النتائج، الإجابة على أسئلتك، ووضع خطة واضحة.",
                  icon: "☕",
                },
                {
                  concern: "هل التكلفة تستحق؟",
                  answer: "جلسة واحدة تُعطيك وضوحاً كاملاً وخطة دعم مخصصة — استثمار يستحق.",
                  icon: "✨",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="rounded-2xl p-4"
                  style={{ background: "#F8FAFC", border: "1px solid #F1F5F9" }}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl flex-shrink-0 mt-0.5">{item.icon}</span>
                    <div>
                      <p
                        className="text-sm font-bold text-slate-700 mb-1.5"
                        style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 700 }}
                      >
                        "{item.concern}"
                      </p>
                      <p
                        className="text-xs text-slate-500 leading-relaxed"
                        style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.8 }}
                      >
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* الأسئلة الشائعة */}
          <div className="text-center mb-8 fade-in-up">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
              style={{
                background: "rgba(37,99,235,0.07)",
                border: "1px solid rgba(37,99,235,0.15)",
              }}
            >
              <HelpCircle size={14} style={{ color: "#2563EB" }} />
              <span
                className="text-xs font-semibold text-blue-700"
                style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
              >
                أسئلة شائعة
              </span>
            </div>
            <h2
              className="text-3xl sm:text-4xl font-black text-slate-900 mb-3"
              style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900 }}
            >
              لديك تساؤلات؟
            </h2>
            <p
              className="text-slate-500 max-w-md mx-auto"
              style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.85 }}
            >
              إجابات مباشرة على أكثر الأسئلة التي يطرحها مستخدمو تشخيصي.
            </p>
          </div>

          <div className="space-y-3 fade-in-up">
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

      {/* ─── 7. شريط رحلة المستخدم ───────────────────────────────────────────── */}
      <section
        className="py-16 relative overflow-hidden"
        style={{ background: "white" }}
        ref={(el) => { sectionRefs.current[5] = el; }}
      >
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url(https://d2xsxph8kpxj0f.cloudfront.net/310519663154655019/kcWP7YGcBeWb4AM3qXYGBt/result-journey-visual-mPzc4LJkiGfs97kEemdjAC.webp)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 fade-in-up">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
              style={{
                background: "rgba(37,99,235,0.07)",
                border: "1px solid rgba(37,99,235,0.15)",
              }}
            >
              <ChevronRight size={14} style={{ color: "#2563EB" }} />
              <span
                className="text-xs font-semibold text-blue-700"
                style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
              >
                رحلتك مع تشخيصي
              </span>
            </div>
            <h2
              className="text-3xl sm:text-4xl font-black text-slate-900 mb-4"
              style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900 }}
            >
              المسار يستمر بأمان وبوضوح
            </h2>
            <p
              className="text-slate-500 max-w-xl mx-auto"
              style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.85 }}
            >
              الفحص هو البداية فقط — ما يليه هو الجزء الأهم والأكثر قيمة.
            </p>
          </div>

          {/* خطوات الرحلة */}
          <div className="relative">
            {/* خط الربط */}
            <div
              className="absolute top-10 right-0 left-0 h-0.5 hidden sm:block"
              style={{
                background: "linear-gradient(to left, #E2E8F0 0%, #2563EB 33%, #14B8A6 66%, #F59E0B 100%)",
                margin: "0 10%",
              }}
            />

            <div className="grid sm:grid-cols-4 gap-6 sm:gap-4">
              {JOURNEY_STEPS.map((step, i) => (
                <div
                  key={i}
                  className="fade-in-up flex flex-col items-center text-center relative"
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4 relative z-10 transition-all duration-300"
                    style={{
                      background:
                        step.done || step.current
                          ? `linear-gradient(135deg, ${step.color}18 0%, ${step.color}08 100%)`
                          : "#F8FAFC",
                      border: step.current
                        ? `2px solid ${step.color}`
                        : step.done
                        ? `2px solid ${step.color}60`
                        : "2px solid #E2E8F0",
                      boxShadow: step.current ? `0 8px 24px ${step.color}25` : "none",
                    }}
                  >
                    {step.done && !step.current ? (
                      <CheckCircle2 size={28} style={{ color: step.color }} />
                    ) : (
                      <span
                        className="text-2xl font-black"
                        style={{
                          fontFamily: "'Cairo', sans-serif",
                          color: step.done || step.current ? step.color : "#CBD5E1",
                        }}
                      >
                        {step.num}
                      </span>
                    )}
                    {step.current && (
                      <div
                        className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: step.color }}
                      >
                        <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                      </div>
                    )}
                  </div>

                  <h3
                    className="text-sm font-bold mb-1"
                    style={{
                      fontFamily: "'Cairo', sans-serif",
                      fontWeight: 700,
                      color: step.done || step.current ? "#0F172A" : "#94A3B8",
                    }}
                  >
                    {step.title}
                  </h3>
                  <p
                    className="text-xs leading-relaxed"
                    style={{
                      fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                      color: step.done || step.current ? "#475569" : "#CBD5E1",
                      lineHeight: 1.7,
                    }}
                  >
                    {step.desc}
                  </p>
                  {step.current && (
                    <div
                      className="mt-3 px-3 py-1 rounded-full text-xs font-semibold"
                      style={{
                        background: `${step.color}15`,
                        color: step.color,
                        border: `1px solid ${step.color}30`,
                        fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                      }}
                    >
                      أنت هنا الآن
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* CTA نهائي */}
          <div className="text-center mt-12 fade-in-up">
            <button
              onClick={() => navigate("/booking")}
              className="group inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-white font-bold text-base transition-all duration-300 hover:-translate-y-1 no-print"
              style={{
                background: "linear-gradient(135deg, #2563EB 0%, #1d4ed8 100%)",
                fontFamily: "'Cairo', sans-serif",
                fontWeight: 700,
                boxShadow: "0 6px 24px rgba(37,99,235,0.3)",
              }}
            >
              <Calendar size={18} />
              انتقل للخطوة التالية — احجز الآن
              <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
            </button>
            <p
              className="text-slate-400 text-xs mt-3"
              style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
            >
              لا حاجة لأي التزام مسبق — يمكنك الإلغاء في أي وقت
            </p>
          </div>
        </div>
      </section>

      {/* ─── تذييل الصفحة ────────────────────────────────────────────────────── */}
      <footer
        className="py-10"
        style={{ background: "#0F172A", borderTop: "1px solid #1E293B" }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-6">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #2563EB 0%, #14B8A6 100%)" }}
              >
                <span className="text-white text-sm font-black" style={{ fontFamily: "'Cairo', sans-serif" }}>ت</span>
              </div>
              <div>
                <span className="text-white font-black text-sm block" style={{ fontFamily: "'Cairo', sans-serif" }}>تشخيصي</span>
                <span className="text-slate-500 text-xs" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>منصة الفحص والتقييم التعليمي</span>
              </div>
            </div>
            <button
              onClick={() => navigate("/booking")}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-sm transition-all duration-200 hover:opacity-90 no-print"
              style={{
                background: "linear-gradient(135deg, #2563EB 0%, #14B8A6 100%)",
                fontFamily: "'Cairo', sans-serif",
                fontWeight: 700,
                boxShadow: "0 4px 16px rgba(37,99,235,0.3)",
              }}
            >
              <Calendar size={15} />
              احجز جلسة الآن
            </button>
          </div>

          <div
            className="py-5 mb-5"
            style={{ borderTop: "1px solid #1E293B", borderBottom: "1px solid #1E293B" }}
          >
            <p
              className="text-slate-500 text-xs leading-relaxed text-center max-w-2xl mx-auto"
              style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.9 }}
            >
              <strong className="text-slate-400">إخلاء مسؤولية:</strong> هذه النتائج هي لأغراض توجيهية أولية فقط ولا تُعدّ تشخيصاً طبياً أو نفسياً رسمياً.
              يُرجى استشارة متخصص معتمد للحصول على تقييم دقيق وشامل. منصة تشخيصي لا تتحمل مسؤولية أي قرارات تُتخذ بناءً على هذه النتائج وحدها.
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
