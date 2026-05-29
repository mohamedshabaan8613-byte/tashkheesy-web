/*
 * ResultDemo — معاينة داخلية لصفحة النتائج
 * مخصصة للفريق الداخلي فقط عبر /admin/preview
 * محمية بـ isCurrentUserAdmin() — لا تُعرض للمستخدم النهائي أبداً
 */
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { isCurrentUserAdmin } from "@/lib/admin";
import { getLoginUrl } from "@/const";

// ─── بيانات المعاينة — أسماء محايدة، لا أسماء بشرية حقيقية ──────────────────
const PREVIEW_RESULTS = {
  medium: {
    sessionId: "preview_medium",
    childName: "الحالة أ",
    childAge: 9,
    screeningType: "general",
    result: {
      percentage: 42,
      riskLevel: "medium" as const,
      riskLabel: "متوسط",
      categoryScores: {
        reading:   { score: 14.4, max: 27,   percentage: 53.3 },
        writing:   { score: 11.2, max: 24,   percentage: 46.7 },
        attention: { score: 16.8, max: 36,   percentage: 46.7 },
        memory:    { score: 10.5, max: 27,   percentage: 38.9 },
        social:    { score:  5.6, max: 18.9, percentage: 29.6 },
        motor:     { score:  5.2, max: 16.8, percentage: 31.0 },
      },
      recommendations: [
        "يُنصح بالتواصل مع معلم الطفل لمناقشة أسلوب التعلم المناسب.",
        "جرّب تمارين القراءة اليومية لمدة 15 دقيقة في بيئة هادئة.",
        "أجرِ فحصاً متابعة بعد 3 أشهر لمراقبة التطور.",
        "فكّر في الاستشارة مع أخصائي تربية خاصة للحصول على تقييم أعمق.",
        "لاحظنا مؤشرات في مجال القراءة — جرّب برامج القراءة المتخصصة.",
      ],
      aiExplanation:
        "رصد الفحص بعض الأنماط في مجالات القراءة والانتباه تستحق الاهتمام والمتابعة. تُظهر الحالة مستوى متوسطاً من المؤشرات التي قد تُشير إلى بعض التحديات في معالجة المعلومات المكتوبة والحفاظ على التركيز لفترات طويلة. هذه الأنماط شائعة جداً في هذه المرحلة العمرية وقابلة للتحسن بشكل كبير مع الدعم المناسب. الخطوة الأنسب الآن هي مناقشة هذه النتائج مع متخصص معتمد يمكنه تقييم الاحتياجات بدقة أكبر ووضع خطة دعم مخصصة. التدخل المبكر في هذه المرحلة يُحدث فارقاً كبيراً جداً في المسيرة التعليمية.",
    },
    completedAt: new Date().toISOString(),
    answeredCount: 18,
    totalCount: 22,
  },
  high: {
    sessionId: "preview_high",
    childName: "الحالة ب",
    childAge: 8,
    screeningType: "dyslexia",
    result: {
      percentage: 61,
      riskLevel: "high" as const,
      riskLabel: "مرتفع",
      categoryScores: {
        reading:   { score: 22.5, max: 27,   percentage: 83.3 },
        writing:   { score: 17.6, max: 24,   percentage: 73.3 },
        attention: { score: 19.8, max: 36,   percentage: 55.0 },
        memory:    { score: 14.4, max: 27,   percentage: 53.3 },
        social:    { score:  6.3, max: 18.9, percentage: 33.3 },
        motor:     { score:  7.8, max: 16.8, percentage: 46.4 },
      },
      recommendations: [
        "يُوصى بشدة بالتواصل مع أخصائي صعوبات تعلم في أقرب وقت.",
        "اطلب من المدرسة توفير دعم تعليمي إضافي.",
        "ابدأ بتمارين التطوير الخاصة المقترحة في قسم التمارين.",
        "تجنب الضغط وركز على تعزيز الثقة بالنفس.",
        "لاحظنا مؤشرات في مجال الانتباه — يُنصح بتمارين التركيز اليومية.",
        "لاحظنا مؤشرات في مجال القراءة — جرّب برامج القراءة المتخصصة.",
      ],
      aiExplanation:
        "رصد الفحص مؤشرات مرتفعة في مجالات القراءة والكتابة تستحق تقييماً متخصصاً شاملاً. الأنماط المرصودة تتوافق مع ما يُعرف بصعوبات القراءة (الديسلكسيا)، وهي حالة شائعة جداً تؤثر على نحو 10-15% من الأطفال في مرحلة التعلم. هذه الأنماط لا تعكس مستوى الذكاء أو القدرات — فكثير من الأشخاص الموهوبين جداً يُعانون من نفس الصعوبات. الخطوة الأهم الآن هي الحصول على تقييم متخصص شامل من أخصائي صعوبات تعلم معتمد يمكنه تأكيد هذه المؤشرات ووضع خطة دعم تعليمي مخصصة. التدخل في هذه المرحلة العمرية يُعطي نتائج ممتازة جداً.",
    },
    completedAt: new Date().toISOString(),
    answeredCount: 20,
    totalCount: 22,
  },
  low: {
    sessionId: "preview_low",
    childName: "الحالة ج",
    childAge: 10,
    screeningType: "general",
    result: {
      percentage: 22,
      riskLevel: "low" as const,
      riskLabel: "منخفض",
      categoryScores: {
        reading:   { score:  7.2, max: 27,   percentage: 26.7 },
        writing:   { score:  5.6, max: 24,   percentage: 23.3 },
        attention: { score:  9.0, max: 36,   percentage: 25.0 },
        memory:    { score:  6.3, max: 27,   percentage: 23.3 },
        social:    { score:  3.8, max: 18.9, percentage: 20.1 },
        motor:     { score:  2.8, max: 16.8, percentage: 16.7 },
      },
      recommendations: [
        "استمر في دعم الطفل بالأنشطة التعليمية اليومية والقراءة المشتركة.",
        "راقب التطور بانتظام وأجرِ فحصاً دورياً كل 6 أشهر.",
        "شجع على الأنشطة الإبداعية التي تعزز الذاكرة والتركيز.",
      ],
      aiExplanation:
        "تُظهر نتائج الفحص أن الحالة في النطاق الطبيعي في جميع المجالات المُقيَّمة. الأنماط المرصودة تُشير إلى تطور جيد ومناسب للعمر في مجالات القراءة والكتابة والانتباه والذاكرة. بعض الأنماط البسيطة المرصودة هي أمور طبيعية تماماً في هذه المرحلة العمرية ولا تستدعي قلقاً. الخطوة الأنسب الآن هي الاستمرار في الدعم الطبيعي والمتابعة الدورية للتأكد من استمرار التطور الإيجابي.",
    },
    completedAt: new Date().toISOString(),
    answeredCount: 22,
    totalCount: 22,
  },
};

// ─── Access states ────────────────────────────────────────────────────────────
type AccessState = "loading" | "not_logged_in" | "not_admin" | "granted";

export default function ResultDemo() {
  const [, navigate] = useLocation();
  const [access, setAccess] = useState<AccessState>("loading");

  // ── Auth guard — نفس نمط AdminDashboard ──────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    async function check() {
      const result = await isCurrentUserAdmin();
      if (cancelled) return;
      if (!result.ok && result.reason === "supabase_not_configured") {
        setAccess("not_logged_in");
        return;
      }
      if (result.reason === "not_authenticated") {
        setAccess("not_logged_in");
        return;
      }
      if (!result.isAdmin) {
        setAccess("not_admin");
        return;
      }
      setAccess("granted");
    }
    check();
    return () => { cancelled = true; };
  }, []);

  // ── حفظ بيانات المعاينة في localStorage بعد التحقق فقط ───────────────────
  useEffect(() => {
    if (access !== "granted") return;
    Object.values(PREVIEW_RESULTS).forEach((p) => {
      localStorage.setItem(`result_${p.sessionId}`, JSON.stringify(p));
    });
  }, [access]);

  // ─── Loading ──────────────────────────────────────────────────────────────
  if (access === "loading") {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        dir="rtl"
        style={{ background: "#F4EFE8" }}
      >
        <div className="flex flex-col items-center gap-4 text-[#6B5E4E]">
          <div className="w-10 h-10 border-4 border-[#1E4E8C] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>
            جاري التحقق من الصلاحيات…
          </p>
        </div>
      </div>
    );
  }

  // ─── Not logged in ────────────────────────────────────────────────────────
  if (access === "not_logged_in") {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        dir="rtl"
        style={{ background: "#F4EFE8", fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
      >
        <div className="bg-white rounded-2xl border border-[#E8E0D5] shadow-sm p-10 max-w-sm w-full text-center flex flex-col gap-5">
          <div className="w-12 h-12 rounded-full bg-[#EEF3FB] flex items-center justify-center mx-auto">
            <svg className="w-6 h-6 text-[#1E4E8C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#1a1a1a] mb-1" style={{ fontFamily: "'Cairo', sans-serif" }}>
              صفحة مخصصة للفريق الداخلي
            </h1>
            <p className="text-sm text-[#6B5E4E] leading-relaxed">
              يرجى تسجيل الدخول بحساب إداري للوصول.
            </p>
          </div>
          <a
            href={getLoginUrl()}
            className="bg-[#1E4E8C] text-white font-semibold rounded-lg px-5 py-2.5 text-sm hover:bg-[#163d70] transition-colors"
            style={{ fontFamily: "'Cairo', sans-serif" }}
          >
            تسجيل الدخول
          </a>
        </div>
      </div>
    );
  }

  // ─── Not admin ────────────────────────────────────────────────────────────
  if (access === "not_admin") {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        dir="rtl"
        style={{ background: "#F4EFE8", fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
      >
        <div className="bg-white rounded-2xl border border-[#E8E0D5] shadow-sm p-10 max-w-sm w-full text-center flex flex-col gap-5">
          <div className="w-12 h-12 rounded-full bg-[#FEF3F2] flex items-center justify-center mx-auto">
            <svg className="w-6 h-6 text-[#D92D20]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#1a1a1a] mb-1" style={{ fontFamily: "'Cairo', sans-serif" }}>
              غير مصرح
            </h1>
            <p className="text-sm text-[#6B5E4E] leading-relaxed">
              هذه الصفحة مخصصة للفريق الداخلي فقط.
            </p>
          </div>
          <button
            onClick={() => navigate("/")}
            className="bg-[#F4EFE8] text-[#1E4E8C] font-semibold rounded-lg px-5 py-2.5 text-sm hover:bg-[#E8E0D5] transition-colors border border-[#E8E0D5]"
            style={{ fontFamily: "'Cairo', sans-serif" }}
          >
            العودة إلى الرئيسية
          </button>
        </div>
      </div>
    );
  }

  // ─── Granted: admin preview UI ────────────────────────────────────────────
  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      dir="rtl"
      style={{ background: "#F4EFE8", fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
    >
      <div className="max-w-lg w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "linear-gradient(135deg, #1E4E8C 0%, #2BBDB6 100%)" }}
          >
            <span className="text-white text-2xl font-black" style={{ fontFamily: "'Cairo', sans-serif" }}>ت</span>
          </div>
          <div
            className="inline-block bg-[#EEF3FB] text-[#1E4E8C] text-xs font-semibold px-3 py-1 rounded-full mb-3"
            style={{ fontFamily: "'Cairo', sans-serif" }}
          >
            للفريق الداخلي — معاينة صفحة النتائج
          </div>
          <h1
            className="text-xl font-black text-slate-900 mb-2"
            style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900 }}
          >
            اختر سيناريو المعاينة
          </h1>
          <p
            className="text-slate-500 text-sm leading-relaxed"
            style={{ lineHeight: 1.8 }}
          >
            اختر مستوى المؤشرات لمراجعة تجربة صفحة النتائج داخلياً
          </p>
        </div>

        {/* Scenario cards */}
        <div className="space-y-3 mb-6">
          {([
            {
              key: "medium" as const,
              label: "مؤشرات متوسطة",
              desc: "الحالة أ — ٩ سنوات — فحص شامل",
              color: "#D97706",
              bg: "#FFFBEB",
              border: "#FDE68A",
              pct: "٤٢٪",
            },
            {
              key: "high" as const,
              label: "مؤشرات مرتفعة",
              desc: "الحالة ب — ٨ سنوات — فحص عسر القراءة",
              color: "#EA580C",
              bg: "#FFF7ED",
              border: "#FED7AA",
              pct: "٦١٪",
            },
            {
              key: "low" as const,
              label: "مؤشرات منخفضة",
              desc: "الحالة ج — ١٠ سنوات — فحص شامل",
              color: "#059669",
              bg: "#ECFDF5",
              border: "#A7F3D0",
              pct: "٢٢٪",
            },
          ] as const).map((item) => (
            <button
              key={item.key}
              onClick={() => navigate(`/screening-result/preview_${item.key}`)}
              className="w-full rounded-2xl p-5 text-right transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
              style={{
                background: item.bg,
                border: `1.5px solid ${item.border}`,
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}
            >
              <div className="flex items-center justify-between">
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

        {/* Back to admin */}
        <div className="text-center">
          <button
            onClick={() => navigate("/admin")}
            className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
            style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
          >
            ← العودة للوحة الإدارة
          </button>
        </div>
      </div>
    </div>
  );
}
