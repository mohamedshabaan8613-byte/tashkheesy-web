/**
 * SpecialistsMatch — صفحة مطابقة المتخصص المناسب
 *
 * التصميم: Editorial Healthcare Calm
 * الهوية البصرية: Cairo + IBM Plex Sans Arabic
 * اللوحة اللونية: #F4EFE8 خلفية | #1E4E8C أزرق | #2BBDB6 أخضر
 *
 * Flow: ScreeningResult → SpecialistsMatch (/specialists?pathType=...) → Booking (/booking?specialist=...)
 *
 * الغرض: تحويل نتيجة الفحص إلى حجز فعلي مع المتخصص المناسب
 * - يعرض 3 متخصصين مقترحين بناءً على pathType
 * - كل بطاقة تحتوي على: الاسم، التخصص، التقييم، السعر، زر الحجز
 * - disclaimer واضح: هذا توجيه أولي، المتخصص يُقرر مسار الدعم
 */

import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import {
  Brain,
  Star,
  ArrowLeft,
  ChevronLeft,
  Shield,
  Clock,
  CheckCircle2,
  Sparkles,
  Calendar,
  MessageCircle,
  GraduationCap,
  Heart,
} from "lucide-react";

// ─── بيانات المتخصصين ─────────────────────────────────────────────────────────
const LEARNING_SPECIALISTS = [
  {
    id: "sp1",
    name: "أ. سارة المنصور",
    title: "أخصائية صعوبات التعلم",
    credentials: "ماجستير تربية خاصة — ١٢ سنة خبرة",
    focus: ["صعوبات القراءة والكتابة", "الدسلكسيا", "التدخل المبكر"],
    rating: 4.9,
    reviewCount: 87,
    sessionPrice: "٢٥٠ ريال",
    sessionDuration: "٦٠ دقيقة",
    availability: "متاحة هذا الأسبوع",
    emoji: "👩‍🏫",
    color: "#1E4E8C",
    bg: "#DFF3F1",
    border: "rgba(37,99,235,0.15)",
    badge: "الأكثر طلباً",
    badgeColor: "#1E4E8C",
  },
  {
    id: "sp2",
    name: "د. خالد العمري",
    title: "معالج نفسي تربوي",
    credentials: "دكتوراه علم نفس تربوي — ٩ سنوات خبرة",
    focus: ["صعوبات التعلم", "القلق المدرسي", "الدعم الأسري"],
    rating: 4.8,
    reviewCount: 64,
    sessionPrice: "٣٠٠ ريال",
    sessionDuration: "٧٥ دقيقة",
    availability: "متاح الأسبوع القادم",
    emoji: "👨‍⚕️",
    color: "#2BBDB6",
    bg: "#DFF3F1",
    border: "rgba(20,184,166,0.15)",
    badge: "",
    badgeColor: "",
  },
  {
    id: "sp3",
    name: "أ. نورة الزهراني",
    title: "معلمة تربية خاصة معتمدة",
    credentials: "بكالوريوس تربية خاصة + شهادة CALT — ٧ سنوات",
    focus: ["التدريب على القراءة", "الدعم الأكاديمي", "مهارات الدراسة"],
    rating: 4.7,
    reviewCount: 52,
    sessionPrice: "٢٠٠ ريال",
    sessionDuration: "٤٥ دقيقة",
    availability: "متاحة اليوم",
    emoji: "👩‍🎓",
    color: "#8B5CF6",
    bg: "#F5F3FF",
    border: "rgba(139,92,246,0.15)",
    badge: "الأسرع توفراً",
    badgeColor: "#059669",
  },
];

const ADHD_SPECIALISTS = [
  {
    id: "sp4",
    name: "د. فيصل الحربي",
    title: "طبيب نفسي أطفال",
    credentials: "بورد طب نفسي أطفال — ١٥ سنة خبرة",
    focus: ["ADHD وفرط الحركة", "التقييم التشخيصي الرسمي", "الدعم الدوائي"],
    rating: 4.9,
    reviewCount: 112,
    sessionPrice: "٤٠٠ ريال",
    sessionDuration: "٩٠ دقيقة",
    availability: "متاح هذا الأسبوع",
    emoji: "👨‍⚕️",
    color: "#8B5CF6",
    bg: "#F5F3FF",
    border: "rgba(139,92,246,0.15)",
    badge: "تقييم رسمي",
    badgeColor: "#8B5CF6",
  },
  {
    id: "sp5",
    name: "أ. ريم القحطاني",
    title: "أخصائية تدريب سلوكي",
    credentials: "ماجستير تحليل سلوك تطبيقي (ABA) — ١٠ سنوات",
    focus: ["إدارة السلوك", "مهارات الانتباه", "التنظيم الذاتي"],
    rating: 4.8,
    reviewCount: 78,
    sessionPrice: "٢٨٠ ريال",
    sessionDuration: "٦٠ دقيقة",
    availability: "متاحة هذا الأسبوع",
    emoji: "👩‍🏫",
    color: "#1E4E8C",
    bg: "#DFF3F1",
    border: "rgba(37,99,235,0.15)",
    badge: "الأكثر طلباً",
    badgeColor: "#1E4E8C",
  },
  {
    id: "sp6",
    name: "د. منى السلمي",
    title: "معالجة نفسية أطفال",
    credentials: "دكتوراه علم نفس إكلينيكي — ٨ سنوات",
    focus: ["ADHD والقلق", "الدعم الأسري", "مهارات اجتماعية"],
    rating: 4.7,
    reviewCount: 59,
    sessionPrice: "٣٢٠ ريال",
    sessionDuration: "٦٠ دقيقة",
    availability: "متاحة الأسبوع القادم",
    emoji: "👩‍⚕️",
    color: "#2BBDB6",
    bg: "#DFF3F1",
    border: "rgba(20,184,166,0.15)",
    badge: "",
    badgeColor: "",
  },
];

// ─── المكوّن الرئيسي ──────────────────────────────────────────────────────────
export default function SpecialistsMatch() {
  const [, navigate] = useLocation();
  const [visible, setVisible] = useState(false);

  const searchParams = new URLSearchParams(window.location.search);
  const pathType   = searchParams.get("pathType")   ?? "learning";
  const childName  = searchParams.get("childName")  ?? "";
  const sessionId  = searchParams.get("sessionId")  ?? "";

  const specialists = pathType === "adhd" ? ADHD_SPECIALISTS : LEARNING_SPECIALISTS;
  const pathLabel   = pathType === "adhd"
    ? "فرط الحركة وتشتت الانتباه"
    : "صعوبات التعلم";

  useEffect(() => {
    document.title = "اختر متخصصك — تشخيصي | Tashkheesy";
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const anim = () =>
    `transition-all duration-700 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`;

  function handleBook(specialist: typeof specialists[0]) {
    const params = new URLSearchParams({
      specialistId: specialist.id,
      specialist: specialist.name,
      serviceId: "initial",
      pathType,
      from: "result",
      ...(childName ? { child: childName } : {}),
      ...(sessionId ? { sessionId } : {}),
    });
    navigate(`/booking?${params.toString()}`);
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      dir="rtl"
      style={{ background: "#F4EFE8" }}
    >
      {/* ─── Header ───────────────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50 border-b"
        style={{
          background: "rgba(248,250,252,0.92)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderColor: "#D8E8E7",
        }}
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-blue-600"
            style={{ color: "#4A6278", fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
          >
            <ChevronLeft size={16} />
            العودة للنتيجة
          </button>

          <a
            href="/"
            className="flex items-center gap-2"
            style={{ fontFamily: "'Cairo', sans-serif" }}
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #1E4E8C 0%, #2BBDB6 100%)" }}
            >
              <Brain size={14} className="text-white" />
            </div>
            <span className="font-black text-sm" style={{ color: "#243B53" }}>تشخيصي</span>
          </a>

          <div
            className="text-xs font-medium"
            style={{ color: "#94A3B8", fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
          >
            الخطوة التالية
          </div>
        </div>
      </header>

      {/* ─── المحتوى ──────────────────────────────────────────────────────────── */}
      <main className="flex-1 py-10 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">

          {/* ── العنوان ─────────────────────────────────────────────────────── */}
          <div className={`mb-8 ${anim()}`}>
            {/* Badge المسار */}
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
              style={{
                background: "rgba(37,99,235,0.07)",
                border: "1px solid rgba(37,99,235,0.15)",
              }}
            >
              <Sparkles size={12} style={{ color: "#1E4E8C" }} />
              <span
                className="text-xs font-semibold"
                style={{ color: "#1E4E8C", fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
              >
                بناءً على مؤشرات {pathLabel}
              </span>
            </div>

            <h1
              className="text-2xl sm:text-3xl font-black text-slate-900 mb-3"
              style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900, lineHeight: 1.3 }}
            >
              {childName
                ? <>متخصص مناسب لمناقشة نتيجة <span style={{ color: "#1E4E8C" }}>{childName}</span></>
                : <>متخصص مناسب لمناقشة نتيجتك</>
              }
            </h1>
            <p
              className="text-sm text-slate-500 leading-relaxed"
              style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.8 }}
            >
              اختر موعدًا مناسبًا لمراجعة المؤشرات والحصول على توجيه أوضح — بهدوء وبدون ضغط.
            </p>
          </div>

          {/* ── بطاقات المتخصصين ─────────────────────────────────────────────── */}
          <div className="space-y-4 mb-8">
            {specialists.map((sp, i) => (
              <div
                key={sp.id}
                className={`rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${anim()}`}
                style={{
                  background: "white",
                  border: `1.5px solid ${sp.border}`,
                  boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                  transitionDelay: `${i * 80}ms`,
                }}
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background: sp.bg }}
                  >
                    {sp.emoji}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2
                            className="text-base font-black text-slate-900"
                            style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 800 }}
                          >
                            {sp.name}
                          </h2>
                          {sp.badge && (
                            <span
                              className="text-xs font-semibold px-2 py-0.5 rounded-full"
                              style={{
                                background: `${sp.badgeColor}15`,
                                color: sp.badgeColor,
                                fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                              }}
                            >
                              {sp.badge}
                            </span>
                          )}
                        </div>
                        <p
                          className="text-sm font-semibold mt-0.5"
                          style={{ color: sp.color, fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                        >
                          {sp.title}
                        </p>
                        <p
                          className="text-xs text-slate-400 mt-0.5"
                          style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                        >
                          {sp.credentials}
                        </p>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Star size={13} style={{ color: "#F4C46A", fill: "#F4C46A" }} />
                        <span
                          className="text-sm font-bold text-slate-700"
                          style={{ fontFamily: "'Cairo', sans-serif" }}
                        >
                          {sp.rating}
                        </span>
                        <span
                          className="text-xs text-slate-400"
                          style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                        >
                          ({sp.reviewCount})
                        </span>
                      </div>
                    </div>

                    {/* Focus Tags */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {sp.focus.map((f) => (
                        <span
                          key={f}
                          className="text-xs px-2.5 py-1 rounded-full"
                          style={{
                            background: sp.bg,
                            color: sp.color,
                            border: `1px solid ${sp.border}`,
                            fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                          }}
                        >
                          {f}
                        </span>
                      ))}
                    </div>

                    {/* Meta + CTA */}
                    <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                          <Clock size={13} style={{ color: "#94A3B8" }} />
                          <span
                            className="text-xs text-slate-500"
                            style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                          >
                            {sp.sessionDuration}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} style={{ color: "#94A3B8" }} />
                          <span
                            className="text-xs"
                            style={{ color: "#059669", fontFamily: "'IBM Plex Sans Arabic', sans-serif", fontWeight: 600 }}
                          >
                            {sp.availability}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className="text-base font-black"
                          style={{ color: "#243B53", fontFamily: "'Cairo', sans-serif" }}
                        >
                          {sp.sessionPrice}
                        </span>
                        <button
                          onClick={() => handleBook(sp)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-sm font-bold transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
                          style={{
                            background: `linear-gradient(135deg, ${sp.color} 0%, ${sp.color}cc 100%)`,
                            fontFamily: "'Cairo', sans-serif",
                            boxShadow: `0 4px 12px ${sp.color}30`,
                          }}
                        >
                          احجز جلسة
                          <ArrowLeft size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Trust Block ──────────────────────────────────────────────────── */}
          <div
            className={`rounded-2xl p-5 mb-6 ${anim()}`}
            style={{
              background: "linear-gradient(135deg, #DFF3F1 0%, #DFF3F1 100%)",
              border: "1px solid rgba(20,184,166,0.2)",
            }}
          >
            <h3
              className="text-sm font-bold text-slate-700 mb-3"
              style={{ fontFamily: "'Cairo', sans-serif" }}
            >
              ماذا تتوقع من الجلسة الأولى؟
            </h3>
            <div className="space-y-2">
              {[
                { icon: MessageCircle, text: "استماع كامل لقلقك وملاحظاتك دون تسرع في الأحكام" },
                { icon: GraduationCap, text: "تقييم أعمق من المتخصص بناءً على الفحص الأولي" },
                { icon: Heart,         text: "خطة دعم مقترحة تناسب احتياجات طفلك تحديداً" },
                { icon: CheckCircle2,  text: "إجابات واضحة على أسئلتك وتوجيه للخطوات التالية" },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex items-start gap-2.5">
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: "rgba(20,184,166,0.12)" }}
                    >
                      <Icon size={12} style={{ color: "#2BBDB6" }} />
                    </div>
                    <p
                      className="text-sm text-slate-600 leading-relaxed"
                      style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.7 }}
                    >
                      {item.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Disclaimer ───────────────────────────────────────────────────── */}
          <div
            className="rounded-xl p-4 flex items-start gap-3"
            style={{
              background: "rgba(37,99,235,0.04)",
              border: "1px solid rgba(37,99,235,0.1)",
            }}
          >
            <Shield size={15} style={{ color: "#1E4E8C", flexShrink: 0, marginTop: "2px" }} />
            <p
              className="text-xs text-slate-500 leading-relaxed"
              style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.8 }}
            >
              هذه القائمة توجيهية — المتخصص هو من يُقرر مسار الدعم المناسب بعد التقييم الكامل. تشخيصي لا تُصدر تشخيصاً رسمياً ولا توصي بعلاج محدد.
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}
