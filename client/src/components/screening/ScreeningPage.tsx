/**
 * ScreeningPage — صفحة الفحص التفاعلي المُحسَّنة
 *
 * التحسينات:
 * - الأسئلة تُحسب محلياً بدون انتظار API (لا تأخير)
 * - الإجابات تُحفظ في localStorage فوراً
 * - النتيجة تُحسب محلياً وتُعرض فوراً بدون انتظار server
 * - تصميم أكثر وضوحاً وسهولة في الاستخدام
 */
import { useState, useCallback, useEffect } from "react";
import { useLocation } from "wouter";
import { upsertScreeningResultAnalytics } from "@/lib/screeningAnalytics";
import {
  upsertRemoteScreeningResult,
  syncLocalSelfAssessmentsToSupabase,
} from "@/lib/screeningResults";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  X,
  ClipboardList,
} from "lucide-react";

// ─── بنك الأسئلة المحلي (لا يحتاج API) ──────────────────────────────────────
interface Question {
  id: string;
  text: string;
  category: string;
  categoryLabel: string;
  weight: number;
  ageGroups: string[];
}

const ALL_QUESTIONS: Question[] = [
  // القراءة والكتابة
  { id: "r1", text: "يجد صعوبة في التعرف على الحروف أو قراءتها بشكل صحيح", category: "reading", categoryLabel: "القراءة", weight: 2.0, ageGroups: ["preschool", "school"] },
  { id: "r2", text: "يقرأ ببطء شديد مقارنة بزملائه في نفس المرحلة", category: "reading", categoryLabel: "القراءة", weight: 1.8, ageGroups: ["school", "teen"] },
  { id: "r3", text: "يخلط بين الحروف المتشابهة مثل (ب، ت، ث) أو (د، ذ)", category: "reading", categoryLabel: "القراءة", weight: 1.9, ageGroups: ["school"] },
  { id: "r4", text: "يصعب عليه فهم ما يقرأه حتى لو نطق الكلمات بشكل صحيح", category: "reading", categoryLabel: "القراءة", weight: 1.7, ageGroups: ["school", "teen"] },
  { id: "r5", text: "يتجنب القراءة بصوت عالٍ أمام الآخرين", category: "reading", categoryLabel: "القراءة", weight: 1.5, ageGroups: ["school", "teen"] },
  // الكتابة
  { id: "w1", text: "يكتب الحروف أو الأرقام بشكل معكوس (مثل كتابة الأرقام من اليسار لليمين)", category: "writing", categoryLabel: "الكتابة", weight: 1.9, ageGroups: ["preschool", "school"] },
  { id: "w2", text: "خطه صعب القراءة أو غير منتظم بشكل واضح", category: "writing", categoryLabel: "الكتابة", weight: 1.5, ageGroups: ["school", "teen"] },
  { id: "w3", text: "يرتكب أخطاء إملائية متكررة في نفس الكلمات", category: "writing", categoryLabel: "الكتابة", weight: 1.7, ageGroups: ["school", "teen"] },
  { id: "w4", text: "يجد صعوبة في نسخ الكلمات أو الجمل من السبورة", category: "writing", categoryLabel: "الكتابة", weight: 1.6, ageGroups: ["school"] },
  // الانتباه والتركيز
  { id: "a1", text: "يفقد تركيزه بسرعة أثناء الدراسة أو أداء المهام", category: "attention", categoryLabel: "الانتباه", weight: 1.8, ageGroups: ["preschool", "school", "teen"] },
  { id: "a2", text: "يتشتت انتباهه بأي صوت أو حركة في محيطه", category: "attention", categoryLabel: "الانتباه", weight: 1.6, ageGroups: ["school", "teen"] },
  { id: "a3", text: "يصعب عليه إتمام مهمة واحدة دون التنقل إلى مهمة أخرى", category: "attention", categoryLabel: "الانتباه", weight: 1.7, ageGroups: ["school", "teen"] },
  { id: "a4", text: "يُبدي نشاطاً حركياً مفرطاً لا يتناسب مع الموقف", category: "attention", categoryLabel: "الانتباه", weight: 1.5, ageGroups: ["preschool", "school"] },
  { id: "a5", text: "يتصرف باندفاع دون التفكير في العواقب", category: "attention", categoryLabel: "الانتباه", weight: 1.6, ageGroups: ["school", "teen"] },
  // الذاكرة والمعالجة
  { id: "m1", text: "ينسى التعليمات بسرعة حتى لو سمعها للتو", category: "memory", categoryLabel: "الذاكرة", weight: 1.7, ageGroups: ["preschool", "school", "teen"] },
  { id: "m2", text: "يجد صعوبة في تذكر الأرقام أو التسلسلات (مثل جدول الضرب)", category: "memory", categoryLabel: "الذاكرة", weight: 1.8, ageGroups: ["school", "teen"] },
  { id: "m3", text: "يعاني من صعوبة في ترتيب الأفكار أو المعلومات بشكل منطقي", category: "memory", categoryLabel: "الذاكرة", weight: 1.6, ageGroups: ["school", "teen"] },
  { id: "m4", text: "يحتاج وقتاً أطول من غيره لمعالجة المعلومات والإجابة", category: "memory", categoryLabel: "الذاكرة", weight: 1.5, ageGroups: ["school", "teen"] },
  // المهارات الاجتماعية
  { id: "s1", text: "يجد صعوبة في فهم القواعد الاجتماعية أو التصرف المناسب", category: "social", categoryLabel: "الاجتماعي", weight: 1.4, ageGroups: ["preschool", "school", "teen"] },
  { id: "s2", text: "يُفضّل اللعب بمفرده ويتجنب التفاعل مع الأقران", category: "social", categoryLabel: "الاجتماعي", weight: 1.3, ageGroups: ["preschool", "school"] },
  { id: "s3", text: "يُظهر ردود فعل عاطفية مبالغاً فيها أو غير متوقعة", category: "social", categoryLabel: "الاجتماعي", weight: 1.4, ageGroups: ["school", "teen"] },
  // المهارات الحركية
  { id: "mo1", text: "يجد صعوبة في الإمساك بالقلم أو استخدام المقص بشكل صحيح", category: "motor", categoryLabel: "الحركي", weight: 1.5, ageGroups: ["preschool", "school"] },
  { id: "mo2", text: "يُعاني من ضعف في التنسيق الحركي (يتعثر، يسقط الأشياء كثيراً)", category: "motor", categoryLabel: "الحركي", weight: 1.3, ageGroups: ["preschool", "school"] },
];

// ─── حساب النتيجة محلياً ─────────────────────────────────────────────────────
interface ScreeningResult {
  percentage: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  riskLabel: string;
  categoryScores: Record<string, { score: number; max: number; percentage: number }>;
  recommendations: string[];
}

function calculateLocalScore(answers: Record<string, number>, questions: Question[]): ScreeningResult {
  let totalScore = 0;
  let maxScore = 0;
  const catScores: Record<string, { score: number; max: number }> = {};

  for (const q of questions) {
    const val = answers[q.id];
    if (!val) continue;
    const ws = val * q.weight;
    const wm = 5 * q.weight;
    totalScore += ws;
    maxScore += wm;
    if (!catScores[q.category]) catScores[q.category] = { score: 0, max: 0 };
    catScores[q.category].score += ws;
    catScores[q.category].max += wm;
  }

  const pct = maxScore > 0 ? Math.round((totalScore / maxScore) * 1000) / 10 : 0;
  let riskLevel: "low" | "medium" | "high" | "critical";
  let riskLabel: string;
  if (pct < 30) { riskLevel = "low"; riskLabel = "منخفض"; }
  else if (pct < 50) { riskLevel = "medium"; riskLabel = "متوسط"; }
  else if (pct < 70) { riskLevel = "high"; riskLabel = "مرتفع"; }
  else { riskLevel = "critical"; riskLabel = "مرتفع جداً"; }

  const categoryScores: Record<string, { score: number; max: number; percentage: number }> = {};
  for (const [cat, s] of Object.entries(catScores)) {
    categoryScores[cat] = { ...s, percentage: s.max > 0 ? Math.round((s.score / s.max) * 1000) / 10 : 0 };
  }

  const recommendations: string[] = [];
  if (riskLevel === "low") {
    recommendations.push("استمر في دعم طفلك بالأنشطة التعليمية اليومية والقراءة المشتركة.");
    recommendations.push("راقب تطور طفلك بانتظام وأجرِ فحصاً دورياً كل 6 أشهر.");
    recommendations.push("شجع طفلك على الأنشطة الإبداعية التي تعزز الذاكرة والتركيز.");
  } else if (riskLevel === "medium") {
    recommendations.push("يُنصح بالتواصل مع معلم طفلك لمناقشة أسلوب التعلم المناسب له.");
    recommendations.push("جرّب تمارين القراءة اليومية لمدة 15 دقيقة في بيئة هادئة.");
    recommendations.push("أجرِ فحصاً متابعة بعد 3 أشهر لمراقبة التطور.");
    recommendations.push("فكّر في الاستشارة مع أخصائي تربية خاصة للحصول على تقييم أعمق.");
  } else if (riskLevel === "high") {
    recommendations.push("يُوصى بشدة بالتواصل مع أخصائي صعوبات تعلم في أقرب وقت.");
    recommendations.push("اطلب من المدرسة توفير دعم تعليمي إضافي لطفلك.");
    recommendations.push("ابدأ بتمارين التطوير الخاصة المقترحة في قسم التمارين.");
    recommendations.push("تجنب الضغط على طفلك وركز على تعزيز ثقته بنفسه.");
  } else {
    recommendations.push("يُنصح بإجراء تقييم متخصص شامل في أقرب وقت ممكن.");
    recommendations.push("تواصل مع طبيب الأطفال لاستبعاد أي أسباب طبية.");
    recommendations.push("احجز جلسة مع أخصائي صعوبات التعلم لتقييم احترافي دقيق.");
  }
  if ((categoryScores["attention"]?.percentage ?? 0) > 60) {
    recommendations.push("لاحظنا مؤشرات في مجال الانتباه — يُنصح بتمارين التركيز اليومية.");
  }
  if ((categoryScores["reading"]?.percentage ?? 0) > 60) {
    recommendations.push("لاحظنا مؤشرات في مجال القراءة — جرّب برامج القراءة المتخصصة.");
  }

  return { percentage: pct, riskLevel, riskLabel, categoryScores, recommendations };
}

// ─── خيارات الإجابة ───────────────────────────────────────────────────────────
const ANSWER_OPTIONS = [
  { value: 1, label: "أبداً", desc: "لا أُلاحظ هذا السلوك إطلاقاً", color: "border-green-400 bg-green-50 text-green-800" },
  { value: 2, label: "نادراً", desc: "مرة أو مرتين في الشهر", color: "border-lime-400 bg-lime-50 text-lime-800" },
  { value: 3, label: "أحياناً", desc: "يحدث أسبوعياً", color: "border-yellow-400 bg-yellow-50 text-yellow-800" },
  { value: 4, label: "كثيراً", desc: "عدة مرات في الأسبوع", color: "border-orange-400 bg-orange-50 text-orange-800" },
  { value: 5, label: "دائماً", desc: "يحدث يومياً أو بشكل شبه دائم", color: "border-red-400 bg-red-50 text-red-800" },
];

const CATEGORY_ICONS: Record<string, string> = {
  reading: "📖", writing: "✏️", attention: "🎯", memory: "🧠", social: "🤝", motor: "🖐️",
};

// ─── الفئة العمرية ────────────────────────────────────────────────────────────
function getAgeGroup(age: number): string {
  if (age <= 5) return "preschool";
  if (age <= 12) return "school";
  // البالغون (18+) يستخدمون أسئلة teen — وهي الأنسب للتقييم الذاتي
  return "teen";
}

// ─── المكوّن الرئيسي ──────────────────────────────────────────────────────────
interface ScreeningPageProps {
  childId: string;
}

type Phase = "intro" | "questions" | "submitting" | "done";
type ScreeningType = "general" | "dyslexia" | "adhd" | "autism";

export default function ScreeningPage({ childId }: ScreeningPageProps) {
  const [, navigate] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const childName = searchParams.get("name") ?? "الطفل";
  const childAge = parseInt(searchParams.get("age") ?? "8", 10);

  // قراءة pathType وmode من URL
  const urlPathType = searchParams.get("pathType") ?? "learning";
  const mode = searchParams.get("mode") ?? ""; // self | "" (child mode)
  // تعيين screeningType من pathType مباشرة — learning يُعيَّن كـ dyslexia (صعوبات التعلم)
  const initialScreeningType: ScreeningType = urlPathType === "adhd" ? "adhd" : "dyslexia";

  const [phase, setPhase] = useState<Phase>("intro");
  // screeningType مشتق من pathType فقط — لا setter مكشوف للـ UI
  const screeningType: ScreeningType = initialScreeningType;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  // ─── Sync localStorage → Supabase عند تحميل الصفحة (fire-and-forget) ────────
  useEffect(() => {
    void syncLocalSelfAssessmentsToSupabase();
  }, []);

  // ─── تصفية الأسئلة حسب العمر ─────────────────────────────────────────────
  const ageGroup = getAgeGroup(childAge);
  const questions = ALL_QUESTIONS.filter((q) => q.ageGroups.includes(ageGroup));
  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const progress = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;
  const isLastQuestion = currentIndex === totalQuestions - 1;
  const canComplete = answeredCount >= Math.ceil(totalQuestions * 0.7);

  // ─── حفظ الإجابات في localStorage ────────────────────────────────────────
  const STORAGE_KEY = `screening_${childId}_${screeningType}`;

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.answers) setAnswers(parsed.answers);
        if (parsed.currentIndex) setCurrentIndex(parsed.currentIndex);
      } catch {}
    }
  }, [STORAGE_KEY]);

  // ─── اختيار إجابة ────────────────────────────────────────────────────────
  const handleAnswer = useCallback(
    (value: number) => {
      if (!currentQuestion || animating) return;

      const newAnswers = { ...answers, [currentQuestion.id]: value };
      setAnswers(newAnswers);

      // حفظ فوري في localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ answers: newAnswers, currentIndex }));

      // إخفاء رسالة التحقق فور اختيار إجابة
      setShowValidation(false);
    },
    [currentQuestion, answers, currentIndex, totalQuestions, animating, STORAGE_KEY]
  );

  // ─── إنهاء الفحص وحساب النتيجة محلياً ───────────────────────────────────
  function handleComplete() {
    setPhase("submitting");
    const result = calculateLocalScore(answers, questions);

    // حفظ النتيجة في localStorage
    const sessionId = `session_${childId}_${Date.now()}`;
    const completedAt = new Date().toISOString();
    const resultPayload = {
      sessionId,
      childName,
      childId,
      childAge,
      screeningType,
      pathType: urlPathType,
      result,
      completedAt,
      answeredCount,
      totalCount: totalQuestions,
    };
    localStorage.setItem(`result_${sessionId}`, JSON.stringify(resultPayload));

    // إذا كان التقييم ذاتياً، حدّث سجل tashkheesy_self_assessments
    if (mode === "self") {
      try {
        const SELF_KEY = "tashkheesy_self_assessments";
        const existing = localStorage.getItem(SELF_KEY);
        const list: unknown[] = existing ? JSON.parse(existing) : [];
        const entry = {
          id: sessionId,
          sessionId,
          name: childName,
          age: childAge,
          mode,
          pathType: urlPathType,
          screeningType,
          completedAt,
          resultKey: `result_${sessionId}`,
        };
        list.unshift(entry); // أضف في البداية (الأحدث أولاً)
        localStorage.setItem(SELF_KEY, JSON.stringify(list));
      } catch {
        // تجاهل أخطاء localStorage
      }
    }

    // مسح بيانات الجلسة المؤقتة
    localStorage.removeItem(STORAGE_KEY);

    // ─── Sprint 5: Persist self-assessment result to Supabase (fire-and-forget) ──
    // Only for mode === 'self'. Never blocks UI. localStorage is primary source.
    if (mode === "self") {
      void upsertRemoteScreeningResult({
        sessionId,
        subjectName: childName,
        subjectAge: childAge,
        mode: "self",
        pathType: urlPathType as "learning" | "adhd",
        screeningType,
        resultJson: resultPayload as unknown as Record<string, unknown>,
        resultSummary: {
          score: result.percentage,
          percentage: result.percentage,
          riskLevel: result.riskLevel,
          riskLabel: result.riskLabel,
        },
        completedAt,
      });
    }

    // ─── Analytics: persist to Supabase (fire-and-forget) ────────────────────
    // Runs at completion time — does not block navigation or UI.
    // upsert by session_id prevents duplicates if ScreeningResult also calls it.
    void upsertScreeningResultAnalytics({
      sessionId,
      pathType: urlPathType,
      screeningType,
      mode: mode || undefined,
      subjectType: mode === "self" ? "self" : "child",
      subjectName: childName,
      subjectAge: String(childAge),
      result: resultPayload,
      completedAt,
      source: "screening_page_complete",
    });

    setTimeout(() => {
      navigate(`/screening-result/${sessionId}?name=${encodeURIComponent(childName)}&pathType=${urlPathType}`);
    }, 800);
  }

  // ─── مرحلة المقدمة (path-aware — بدون اختيار نوع مكرر) ──────────────────────
  if (phase === "intro") {
    // بيانات المسار المُختار مسبقاً من ChooseChildPath / ChooseSelfPath
    const isAdhd = urlPathType === "adhd";
    const pathTitle = isAdhd
      ? "فحص مؤشرات فرط الحركة وتشتت الانتباه"
      : "فحص مؤشرات صعوبات التعلم";
    const pathSubtitle = isAdhd
      ? "الانتباه · التركيز · الاندفاعية · فرط الحركة"
      : "القراءة · الكتابة · الفهم · الأداء الأكاديمي";
    const pathIcon = isAdhd ? "⚡" : "📖";
    const pathBadgeBg  = isAdhd ? "bg-purple-100 text-purple-700 border-purple-200" : "bg-blue-100 text-blue-700 border-blue-200";
    const pathCardBg   = isAdhd ? "bg-purple-50 border-purple-200" : "bg-blue-50 border-blue-200";
    const pathTextColor = isAdhd ? "text-purple-800" : "text-blue-800";
    const btnColor     = isAdhd ? "bg-purple-600 hover:bg-purple-700" : "bg-blue-600 hover:bg-blue-700";

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center p-4" dir="rtl">
        <Card className="max-w-lg w-full shadow-lg border-0">
          <CardContent className="p-8 space-y-6">

            {/* ─── رأس الصفحة ─────────────────────────────────────────────── */}
            <div className="text-center">
              <div className="text-5xl mb-3">{pathIcon}</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                {childName ? `فحص ${childName}` : "الفحص الأولي"}
              </h1>
              <p className="text-gray-500 text-sm">{pathSubtitle}</p>
            </div>

            {/* ─── بطاقة المسار المُختار (تأكيد، لا اختيار) ───────────────── */}
            <div className={`rounded-xl border p-4 ${pathCardBg}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${pathBadgeBg}`}>
                  المسار المُختار
                </span>
              </div>
              <p className={`text-base font-bold ${pathTextColor}`}>{pathTitle}</p>
              <p className={`text-sm mt-1 opacity-75 ${pathTextColor}`}>{pathSubtitle}</p>
            </div>

            {/* ─── معلومات الفحص ───────────────────────────────────────────── */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <ClipboardList className="w-4 h-4 flex-shrink-0 text-gray-500" />
                <span><strong>{questions.length} سؤالاً</strong> مناسباً لعمر {childAge} سنوات</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>⏱️</span>
                <span>يستغرق حوالي <strong>{Math.ceil(questions.length * 0.4)} دقائق</strong></span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>💾</span>
                <span>إجاباتك تُحفظ تلقائياً على جهازك</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>🤖</span>
                <span>تحليل أولي بالذكاء الاصطناعي عند الانتهاء</span>
              </div>
            </div>

            {/* ─── تنبيه قانوني ────────────────────────────────────────────── */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800 leading-relaxed">
                هذا فحص أولي لرصد المؤشرات — ليس تشخيصاً طبياً أو نفسياً رسمياً.
                نتائجه توجيهية تساعدك على اتخاذ الخطوة التالية بثقة.
              </p>
            </div>

            {/* ─── زر البدء ────────────────────────────────────────────────── */}
            <Button
              className={`w-full h-12 text-base font-semibold gap-2 ${btnColor}`}
              onClick={() => setPhase("questions")}
            >
              ابدأ الفحص الآن
              <ChevronLeft className="w-5 h-5" />
            </Button>

            <button
              onClick={() => window.history.back()}
              className="w-full text-sm text-gray-400 hover:text-gray-600 text-center"
            >
              ← العودة للخطوة السابقة
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── مرحلة الإرسال ───────────────────────────────────────────────────────
  if (phase === "submitting") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center" dir="rtl">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
          <p className="text-lg font-semibold text-gray-700">جاري تحليل النتائج...</p>
          <p className="text-sm text-gray-500">يُرجى الانتظار لحظة</p>
        </div>
      </div>
    );
  }

  // ─── مرحلة الأسئلة ───────────────────────────────────────────────────────
  if (phase === "questions" && currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50" dir="rtl">
        {/* ─── Top Bar ─────────────────────────────────────────────────────── */}
        <div className="bg-white border-b shadow-sm sticky top-0 z-10">
          <div className="max-w-2xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-800">
                  {currentIndex + 1}
                  <span className="text-gray-400 font-normal"> / {totalQuestions}</span>
                </span>
                <Badge variant="outline" className="text-xs">
                  {CATEGORY_ICONS[currentQuestion.category]} {currentQuestion.categoryLabel}
                </Badge>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400">{answeredCount} مجاب</span>
                <button onClick={() => setShowExitDialog(true)} className="text-gray-400 hover:text-gray-600 p-1 rounded">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <Progress value={progress} className="h-2.5" />
          </div>
        </div>

        {/* ─── Question Card ───────────────────────────────────────────────── */}
        <div className="max-w-2xl mx-auto px-4 py-6">
          <Card className={`shadow-md border-0 transition-opacity duration-200 ${animating ? "opacity-50" : "opacity-100"}`}>
            <CardContent className="p-6 md:p-8">
              {/* فئة السؤال */}
              <div className="flex items-center gap-2 mb-5">
                <span className="text-3xl">{CATEGORY_ICONS[currentQuestion.category]}</span>
                <div>
                  <p className="text-xs text-gray-400">السؤال {currentIndex + 1}</p>
                  <p className="text-sm font-semibold text-blue-600">{currentQuestion.categoryLabel}</p>
                </div>
              </div>

              {/* نص السؤال */}
              <h2 className="text-lg md:text-xl font-semibold text-gray-900 leading-relaxed mb-6">
                {currentQuestion.text}
              </h2>

              {/* خيارات الإجابة */}
              <div className="space-y-2.5">
                {ANSWER_OPTIONS.map((option) => {
                  const isSelected = answers[currentQuestion.id] === option.value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => handleAnswer(option.value)}
                      disabled={animating}
                      className={`w-full p-3.5 rounded-xl border-2 text-right transition-all flex items-center justify-between gap-3 ${
                        isSelected
                          ? `${option.color} scale-[1.01] shadow-sm`
                          : "border-gray-200 bg-white hover:border-blue-200 hover:bg-blue-50/50 text-gray-700"
                      }`}
                    >
                      <div>
                        <span className="font-semibold text-sm">{option.label}</span>
                        <span className="text-xs text-current opacity-70 mr-2">— {option.desc}</span>
                      </div>
                      {isSelected && <CheckCircle2 className="w-5 h-5 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* ─── Navigation ──────────────────────────────────────────────── */}
          <div className="flex items-center justify-between mt-5 gap-3">
            <Button
              variant="outline"
              onClick={() => { setCurrentIndex((i) => Math.max(0, i - 1)); setShowValidation(false); }}
              disabled={currentIndex === 0}
              className="gap-1.5"
            >
              <ChevronRight className="w-4 h-4" />
              السابق
            </Button>

            {/* مؤشرات التقدم */}
            <div className="flex gap-1.5 flex-wrap justify-center max-w-[200px]">
              {questions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => { setCurrentIndex(idx); setShowValidation(false); }}
                  className={`rounded-full transition-all ${
                    idx === currentIndex
                      ? "bg-blue-600 w-5 h-2"
                      : answers[q.id]
                      ? "bg-green-400 w-2 h-2"
                      : "bg-gray-300 w-2 h-2"
                  }`}
                />
              ))}
            </div>

            {isLastQuestion ? (
              <Button
                onClick={handleComplete}
                disabled={!canComplete}
                className="gap-1.5 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle2 className="w-4 h-4" />
                عرض النتيجة
              </Button>
            ) : (
              <Button
                onClick={() => {
                  if (!answers[currentQuestion.id]) {
                    setShowValidation(true);
                    return;
                  }
                  setShowValidation(false);
                  setCurrentIndex((i) => i + 1);
                }}
                className="gap-1.5 bg-blue-600 hover:bg-blue-700"
              >
                التالي
                <ChevronLeft className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* زر إنهاء مبكر */}
          {!isLastQuestion && canComplete && (
            <div className="text-center mt-4">
              <button
                onClick={handleComplete}
                className="text-sm text-blue-500 hover:text-blue-700 underline"
              >
                عرض النتيجة الآن ({answeredCount}/{totalQuestions} سؤال مجاب)
              </button>
            </div>
          )}

          {/* رسالة التحقق عند الضغط على التالي بدون إجابة */}
          {showValidation && !answers[currentQuestion.id] && (
            <div className="flex items-center justify-center gap-2 mt-3 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700 font-medium">
                يرجى اختيار إجابة قبل الانتقال للسؤال التالي
              </p>
            </div>
          )}
        </div>

        {/* ─── Exit Dialog ─────────────────────────────────────────────────── */}
        <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
          <AlertDialogContent dir="rtl">
            <AlertDialogHeader>
              <AlertDialogTitle>الخروج من الفحص</AlertDialogTitle>
              <AlertDialogDescription>
                تقدمك ({answeredCount}/{totalQuestions} سؤال) محفوظ على جهازك. يمكنك العودة لإكماله لاحقاً.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-row-reverse gap-2">
              <AlertDialogCancel>متابعة الفحص</AlertDialogCancel>
              <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => navigate("/children")}>
                الخروج
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  return null;
}
