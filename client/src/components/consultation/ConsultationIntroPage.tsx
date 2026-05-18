/**
 * ConsultationIntroPage.tsx — Sprint 3.0b | Issue #58
 *
 * صفحة الاستقبال السياقية للاستشارة. تعرض محتوى مخصص بناءً على:
 * - هل جاء المستخدم من نتيجة تقييم؟
 * - نوع المسار (تعلم / ADHD)
 * - وضع التقييم (ذاتي / طفل)
 *
 * الهدف: جعل الانتقال من نتيجة التقييم إلى الحجز سلساً وخالي من الاحتكاك.
 * CTA سياقي: "احجز استشارتك الآن" بدلاً من "ابدأ الآن".
 */
import { useEffect } from "react";
import { useLocation } from "wouter";
import { useConsultationContext } from "@/contexts/ConsultationContext";
import { useConsultationFlow } from "@/hooks/useConsultationFlow";
import { Calendar, CheckCircle2, User, Brain, Heart, ArrowLeft } from "lucide-react";

export default function ConsultationIntroPage() {
  const [, navigate] = useLocation();
  const { intent, hasActiveIntent } = useConsultationContext();
  const flow = useConsultationFlow();

  // ═══════════════════════════════════════════════════════════════════════════
  // إذا لم توجد نية نشطة — إعادة توجيه لصفحة الحجز العامة
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() {
    if (!hasActiveIntent) {
      void navigate("/booking", { replace: true });
    }
  }, [hasActiveIntent, navigate]);

  // ═══════════════════════════════════════════════════════════════════════════
  // استخراج السياق من الـ intent
  // ═══════════════════════════════════════════════════════════════════════════
  const isFromAssessment = intent?.entryPoint === "assessment_result";
  const result = intent?.assessmentResult;
  const pathType = result?.pathType ?? "learning";
  const subjectName = result?.subjectName ?? "";
  const isChildMode = result?.assessmentMode === "parent";

  // النصوص السياقية بناءً على المسار والوضع
  const pathLabels = {
    learning: "صعوبات التعلم",
    adhd: "فرط الحركة وتشتت الانتباه",
  };
  const pathLabel = pathLabels[pathType];

  // ═══════════════════════════════════════════════════════════════════════════
  // Handlers
  // ═══════════════════════════════════════════════════════════════════════════
  function handleConfirm() {
    flow.confirmAndBook();
    // التنقل لصفحة الحجز يحدث في useEffect في هذا الملف بمراقبة intent.confirmed
    void navigate("/booking");
  }

  function handleBack() {
    if (isFromAssessment && result?.sessionId) {
      void navigate(`/result/${result.sessionId}`);
    } else {
      void navigate("/");
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Loading State — قبل استقرار الـ intent
  // ═══════════════════════════════════════════════════════════════════════════
  if (!intent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Main Render
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* ─── زر الرجوع ───────────────────────────────────────────────── */}
        <button
          onClick={handleBack}
          className="mb-8 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>رجوع</span>
        </button>

        {/* ─── البطاقة الرئيسية ─────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          {/* ─── Header ──────────────────────────────────────────────────── */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              {isFromAssessment
                ? "أنت على بُعد خطوة واحدة من استشارتك"
                : "احجز استشارة متخصصة الآن"}
            </h1>
            <p className="text-lg text-gray-600">
              {isFromAssessment
                ? `بناءً على نتيجة التقييم، نقترح عليك حجز استشارة مع متخصص في ${pathLabel}.`
                : "احصل على استشارة فردية مع متخصص معتمد لتحديد الخطوات التالية."}
            </p>
          </div>

          {/* ─── السياق الشخصي (إذا جاء من تقييم) ─────────────────────────── */}
          {isFromAssessment && result && (
            <div className="bg-blue-50 rounded-xl p-6 mb-8 border border-blue-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5 text-blue-600" />
                <span>ملخص التقييم</span>
              </h2>
              <div className="space-y-3 text-gray-700">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium">الاسم: </span>
                    <span>{subjectName}</span>
                    {isChildMode && <span className="text-sm text-gray-500 mr-2">(طفل)</span>}
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Brain className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium">المسار: </span>
                    <span>{pathLabel}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── مميزات الاستشارة ───────────────────────────────────────────*/}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">ماذا ستحصل في الاستشارة؟</h2>
            <div className="space-y-4">
              {[
                {
                  icon: CheckCircle2,
                  title: "تقييم شامل ومهني",
                  desc: "جلسة تقييمية مع متخصص معتمد لفهم الحالة بدقة.",
                },
                {
                  icon: Heart,
                  title: "خطة علاجية مخصصة",
                  desc: "توصيات وخطة عمل واضحة بناءً على احتياجاتك الفردية.",
                },
                {
                  icon: Calendar,
                  title: "متابعة مستمرة",
                  desc: "إمكانية حجز جلسات متابعة ودعم مستمر.",
                },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{item.title}</h3>
                    <p className="text-gray-600 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ─── CTA Button ────────────────────────────────────────────────*/}
          <button
            onClick={handleConfirm}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-lg"
          >
            {isFromAssessment ? "احجز استشارتك الآن" : "ابدأ الحجز"}
          </button>
        </div>

        {/* ─── Footer Note ─────────────────────────────────────────────────*/}
        <p className="text-center text-sm text-gray-500">
          جميع الاستشارات تتم عبر الإنترنت بسرية تامة
        </p>
      </div>
    </div>
  );
}
