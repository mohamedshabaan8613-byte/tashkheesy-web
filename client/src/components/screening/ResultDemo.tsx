/*
 * ResultDemo — صفحة عرض تجريبي لنتائج الفحص
 * تُحاكي جميع مستويات المؤشرات لأغراض العرض
 */
import { useEffect } from "react";
import { useLocation } from "wouter";

const DEMO_RESULTS = {
  medium: {
    sessionId: "demo_medium",
    childName: "أحمد",
    childAge: 9,
    screeningType: "general",
    result: {
      percentage: 42,
      riskLevel: "medium" as const,
      riskLabel: "متوسط",
      categoryScores: {
        reading: { score: 14.4, max: 27, percentage: 53.3 },
        writing: { score: 11.2, max: 24, percentage: 46.7 },
        attention: { score: 16.8, max: 36, percentage: 46.7 },
        memory: { score: 10.5, max: 27, percentage: 38.9 },
        social: { score: 5.6, max: 18.9, percentage: 29.6 },
        motor: { score: 5.2, max: 16.8, percentage: 31.0 },
      },
      recommendations: [
        "يُنصح بالتواصل مع معلم طفلك لمناقشة أسلوب التعلم المناسب له.",
        "جرّب تمارين القراءة اليومية لمدة 15 دقيقة في بيئة هادئة.",
        "أجرِ فحصاً متابعة بعد 3 أشهر لمراقبة التطور.",
        "فكّر في الاستشارة مع أخصائي تربية خاصة للحصول على تقييم أعمق.",
        "لاحظنا مؤشرات في مجال القراءة — جرّب برامج القراءة المتخصصة.",
      ],
      aiExplanation:
        "رصد الفحص بعض الأنماط في مجالات القراءة والانتباه تستحق الاهتمام والمتابعة. أحمد يُظهر مستوى متوسطاً من المؤشرات التي قد تُشير إلى بعض التحديات في معالجة المعلومات المكتوبة والحفاظ على التركيز لفترات طويلة. هذه الأنماط شائعة جداً في هذه المرحلة العمرية وقابلة للتحسن بشكل كبير مع الدعم المناسب. ما يُلاحظ من إجاباتك هو أن أحمد يجد بعض الصعوبة في التعرف على الحروف المتشابهة وقد يحتاج وقتاً أطول من زملائه لإتمام المهام القرائية. هذا لا يعني وجود مشكلة خطيرة، بل يُشير إلى أن أسلوب التعلم المناسب له قد يختلف قليلاً عن الأسلوب التقليدي. الخطوة الأنسب الآن هي مناقشة هذه النتائج مع متخصص معتمد يمكنه تقييم احتياجات أحمد بدقة أكبر ووضع خطة دعم مخصصة تُساعده على التقدم بثقة وسهولة. التدخل المبكر في هذه المرحلة يُحدث فارقاً كبيراً جداً في المسيرة التعليمية.",
    },
    completedAt: new Date().toISOString(),
    answeredCount: 18,
    totalCount: 22,
  },
  high: {
    sessionId: "demo_high",
    childName: "سارة",
    childAge: 8,
    screeningType: "dyslexia",
    result: {
      percentage: 61,
      riskLevel: "high" as const,
      riskLabel: "مرتفع",
      categoryScores: {
        reading: { score: 22.5, max: 27, percentage: 83.3 },
        writing: { score: 17.6, max: 24, percentage: 73.3 },
        attention: { score: 19.8, max: 36, percentage: 55.0 },
        memory: { score: 14.4, max: 27, percentage: 53.3 },
        social: { score: 6.3, max: 18.9, percentage: 33.3 },
        motor: { score: 7.8, max: 16.8, percentage: 46.4 },
      },
      recommendations: [
        "يُوصى بشدة بالتواصل مع أخصائي صعوبات تعلم في أقرب وقت.",
        "اطلب من المدرسة توفير دعم تعليمي إضافي لطفلك.",
        "ابدأ بتمارين التطوير الخاصة المقترحة في قسم التمارين.",
        "تجنب الضغط على طفلك وركز على تعزيز ثقته بنفسه.",
        "لاحظنا مؤشرات في مجال الانتباه — يُنصح بتمارين التركيز اليومية.",
        "لاحظنا مؤشرات في مجال القراءة — جرّب برامج القراءة المتخصصة.",
      ],
      aiExplanation:
        "رصد الفحص مؤشرات مرتفعة في مجالات القراءة والكتابة تستحق تقييماً متخصصاً شاملاً. سارة تُظهر أنماطاً تتوافق مع ما يُعرف بصعوبات القراءة (الديسلكسيا)، وهي حالة شائعة جداً تؤثر على نحو 10-15% من الأطفال في مرحلة التعلم. الأنماط التي رصدها الفحص تشمل صعوبة في التعرف على الحروف المتشابهة، والخلط بين الأصوات، وبطء في معالجة النصوص المكتوبة. هذه الأنماط لا تعكس مستوى ذكاء سارة أو قدراتها — فكثير من الأشخاص الموهوبين جداً يُعانون من نفس الصعوبات. ما يعنيه ذلك هو أن سارة تحتاج إلى أسلوب تعليمي مختلف ومخصص يتناسب مع طريقة معالجة دماغها للمعلومات. الخطوة الأهم الآن هي الحصول على تقييم متخصص شامل من أخصائي صعوبات تعلم معتمد يمكنه تأكيد هذه المؤشرات ووضع خطة دعم تعليمي مخصصة لسارة. التدخل في هذه المرحلة العمرية يُعطي نتائج ممتازة جداً.",
    },
    completedAt: new Date().toISOString(),
    answeredCount: 20,
    totalCount: 22,
  },
  low: {
    sessionId: "demo_low",
    childName: "يوسف",
    childAge: 10,
    screeningType: "general",
    result: {
      percentage: 22,
      riskLevel: "low" as const,
      riskLabel: "منخفض",
      categoryScores: {
        reading: { score: 7.2, max: 27, percentage: 26.7 },
        writing: { score: 5.6, max: 24, percentage: 23.3 },
        attention: { score: 9.0, max: 36, percentage: 25.0 },
        memory: { score: 6.3, max: 27, percentage: 23.3 },
        social: { score: 3.8, max: 18.9, percentage: 20.1 },
        motor: { score: 2.8, max: 16.8, percentage: 16.7 },
      },
      recommendations: [
        "استمر في دعم طفلك بالأنشطة التعليمية اليومية والقراءة المشتركة.",
        "راقب تطور طفلك بانتظام وأجرِ فحصاً دورياً كل 6 أشهر.",
        "شجع طفلك على الأنشطة الإبداعية التي تعزز الذاكرة والتركيز.",
      ],
      aiExplanation:
        "تُظهر نتائج الفحص أن يوسف في النطاق الطبيعي في جميع المجالات المُقيَّمة. الأنماط التي رصدها الفحص تُشير إلى أن يوسف يتطور بشكل جيد ومناسب لعمره في مجالات القراءة والكتابة والانتباه والذاكرة. هذا أمر إيجابي جداً ويعكس جهودك في دعم نمو طفلك. بعض الأنماط البسيطة التي رصدها الفحص هي أمور طبيعية تماماً في هذه المرحلة العمرية ولا تستدعي قلقاً. الخطوة الأنسب الآن هي الاستمرار في الدعم الطبيعي والمتابعة الدورية للتأكد من استمرار التطور الإيجابي. يمكنك إجراء فحص متابعة بعد 6 أشهر للاطمئنان على استمرار التقدم. إذا لاحظت أي تغيرات في أداء يوسف، لا تتردد في التواصل مع متخصص للحصول على رأي مهني.",
    },
    completedAt: new Date().toISOString(),
    answeredCount: 22,
    totalCount: 22,
  },
};

export default function ResultDemo() {
  const [, navigate] = useLocation();

  useEffect(() => {
    // حفظ جميع النتائج التجريبية في localStorage
    Object.values(DEMO_RESULTS).forEach((demo) => {
      localStorage.setItem(`result_${demo.sessionId}`, JSON.stringify(demo));
    });
  }, []);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      dir="rtl"
      style={{ background: "#F4EFE8", fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
    >
      <div className="max-w-lg w-full">
        {/* رأس الصفحة */}
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "linear-gradient(135deg, #1E4E8C 0%, #2BBDB6 100%)" }}
          >
            <span className="text-white text-2xl font-black" style={{ fontFamily: "'Cairo', sans-serif" }}>ت</span>
          </div>
          <h1
            className="text-2xl font-black text-slate-900 mb-2"
            style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900 }}
          >
            عرض تجريبي — صفحة النتائج
          </h1>
          <p
            className="text-slate-500 text-sm leading-relaxed"
            style={{ lineHeight: 1.8 }}
          >
            اختر مستوى المؤشرات لمعاينة تجربة صفحة النتائج المُطوَّرة
          </p>
        </div>

        {/* بطاقات الاختيار */}
        <div className="space-y-3 mb-6">
          {[
            {
              key: "medium",
              label: "مؤشرات متوسطة",
              desc: "أحمد، ٩ سنوات — فحص شامل",
              color: "#D97706",
              bg: "#FFFBEB",
              border: "#FDE68A",
              emoji: "🟡",
              pct: "٤٢٪",
            },
            {
              key: "high",
              label: "مؤشرات مرتفعة",
              desc: "سارة، ٨ سنوات — فحص عسر القراءة",
              color: "#EA580C",
              bg: "#FFF7ED",
              border: "#FED7AA",
              emoji: "🟠",
              pct: "٦١٪",
            },
            {
              key: "low",
              label: "مؤشرات منخفضة",
              desc: "يوسف، ١٠ سنوات — فحص شامل",
              color: "#059669",
              bg: "#ECFDF5",
              border: "#A7F3D0",
              emoji: "🟢",
              pct: "٢٢٪",
            },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => navigate(`/screening-result/demo_${item.key}`)}
              className="w-full rounded-2xl p-5 text-right transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
              style={{
                background: item.bg,
                border: `1.5px solid ${item.border}`,
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.emoji}</span>
                  <div>
                    <div
                      className="text-base font-bold mb-0.5"
                      style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 700, color: item.color }}
                    >
                      {item.label}
                    </div>
                    <div
                      className="text-xs text-slate-500"
                      style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                    >
                      {item.desc}
                    </div>
                  </div>
                </div>
                <div
                  className="text-xl font-black"
                  style={{ fontFamily: "'Cairo', sans-serif", color: item.color }}
                >
                  {item.pct}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* رابط الصفحة الرئيسية */}
        <div className="text-center">
          <button
            onClick={() => navigate("/")}
            className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
            style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
          >
            ← العودة للصفحة الرئيسية
          </button>
        </div>
      </div>
    </div>
  );
}
