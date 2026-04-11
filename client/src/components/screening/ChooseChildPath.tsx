/*
 * ChooseChildPath — اختيار مسار الفحص للطفل
 *
 * يظهر بعد اختيار الطفل من ChildrenPage
 * يسمح للوالد باختيار:
 *   A. كشف أولي لمؤشرات صعوبات التعلم (learning)
 *   B. كشف أولي لمؤشرات فرط الحركة وتشتت الانتباه (adhd)
 *
 * يمرر: mode=child, childId, pathType, childName, childAge, ageGroup
 * إلى: /screening-intro/:childId?pathType=...&name=...&age=...&mode=child
 *
 * التصميم: Editorial Healthcare Calm
 * اللوحة اللونية: #F8FAFC | #2563EB | #14B8A6 | #F59E0B
 */

import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import {
  ArrowLeft,
  Brain,
  BookOpen,
  Zap,
  CheckCircle2,
  Shield,
  ChevronLeft,
} from "lucide-react";

interface ChooseChildPathProps {
  childId: string;
}

const PATHS = [
  {
    id: "learning",
    title: "كشف أولي لمؤشرات صعوبات التعلم",
    subtitle: "القراءة والكتابة والفهم والأداء الأكاديمي",
    description:
      "يُركّز هذا المسار على رصد المؤشرات المرتبطة بصعوبات القراءة والكتابة والفهم والأداء الأكاديمي — ويساعدك على فهم ما قد يواجهه طفلك في بيئة التعلم.",
    areas: ["القراءة", "الكتابة", "الفهم", "الأداء الأكاديمي", "الملاحظات المدرسية"],
    icon: BookOpen,
    color: "#2563EB",
    bg: "#EFF6FF",
    border: "#BFDBFE",
    badge: "صعوبات التعلم",
    badgeBg: "#EFF6FF",
    badgeColor: "#1D4ED8",
    duration: "١٠–١٥ دقيقة",
  },
  {
    id: "adhd",
    title: "كشف أولي لمؤشرات فرط الحركة وتشتت الانتباه",
    subtitle: "الانتباه والتركيز والاندفاعية وفرط الحركة",
    description:
      "يُركّز هذا المسار على رصد المؤشرات المرتبطة بتشتت الانتباه وصعوبة التركيز والاندفاعية وفرط الحركة — ويساعدك على فهم أنماط سلوك طفلك بشكل أوضح.",
    areas: ["الانتباه", "التركيز", "الاندفاعية", "فرط الحركة", "الالتزام بالتعليمات"],
    icon: Zap,
    color: "#F59E0B",
    bg: "#FFFBEB",
    border: "#FDE68A",
    badge: "فرط الحركة وتشتت الانتباه",
    badgeBg: "#FFFBEB",
    badgeColor: "#B45309",
    duration: "١٠–١٥ دقيقة",
  },
];

export default function ChooseChildPath({ childId }: ChooseChildPathProps) {
  const [, navigate] = useLocation();
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  const searchParams = new URLSearchParams(window.location.search);
  const childName = searchParams.get("name") ?? "طفلك";
  const childAge = searchParams.get("age") ?? "";
  const ageGroup = searchParams.get("ageGroup") ?? "school";

  useEffect(() => {
    document.title = `اختر مسار الفحص — ${childName} — تشخيصي`;
    setTimeout(() => setVisible(true), 80);
  }, [childName]);

  function handleChoose(pathType: string) {
    setSelected(pathType);
    setTimeout(() => {
      navigate(
        `/screening-intro/${childId}?pathType=${pathType}&mode=child&name=${encodeURIComponent(childName)}&age=${childAge}&ageGroup=${ageGroup}`
      );
    }, 200);
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      dir="rtl"
      style={{ background: "linear-gradient(160deg, #F8FAFC 0%, #EFF6FF 50%, #F0FDFA 100%)" }}
    >
      {/* ─── شريط التنقل ─────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-30 flex items-center justify-between px-5 sm:px-8"
        style={{
          height: "60px",
          background: "rgba(248,250,252,0.92)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(226,232,240,0.7)",
        }}
      >
        <button
          onClick={() => navigate("/children")}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors duration-200"
          style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", fontSize: "0.875rem" }}
          aria-label="العودة إلى ملفات الأطفال"
        >
          <ArrowLeft size={16} />
          <span>ملفات الأطفال</span>
        </button>
        <a
          href="/"
          className="flex items-center gap-2"
          style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 800, fontSize: "1.1rem", color: "#1e3a8a", textDecoration: "none" }}
          aria-label="تشخيصي — الصفحة الرئيسية"
        >
          <span
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #2563EB 0%, #14B8A6 100%)" }}
            aria-hidden="true"
          >
            <Brain size={14} style={{ color: "white" }} />
          </span>
          تشخيصي
        </a>
      </header>

      {/* ─── مؤشر الخطوات ─────────────────────────────────────────────────── */}
      <div
        className="px-5 sm:px-8 py-3"
        style={{ borderBottom: "1px solid rgba(226,232,240,0.5)" }}
      >
        <div className="max-w-2xl mx-auto flex items-center gap-2 text-xs text-slate-400" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>
          <span className="text-slate-500 font-medium">اختيار الطفل</span>
          <ChevronLeft size={12} />
          <span className="text-blue-600 font-semibold">اختيار المسار</span>
          <ChevronLeft size={12} />
          <span>مقدمة الفحص</span>
          <ChevronLeft size={12} />
          <span>الفحص</span>
          <ChevronLeft size={12} />
          <span>النتائج</span>
        </div>
      </div>

      {/* ─── المحتوى الرئيسي ─────────────────────────────────────────────── */}
      <main
        className="flex-1 flex flex-col items-center px-4 py-10 sm:py-14"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(16px)",
          transition: "opacity 0.5s ease, transform 0.5s ease",
        }}
      >
        <div className="w-full max-w-2xl">
          {/* ─── العنوان ─────────────────────────────────────────────────── */}
          <div className="text-center mb-10">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-5 text-sm font-semibold"
              style={{
                background: "rgba(37,99,235,0.08)",
                color: "#2563EB",
                fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                border: "1px solid rgba(37,99,235,0.15)",
              }}
            >
              <Brain size={14} aria-hidden="true" />
              فحص أولي مجاني
            </div>
            <h1
              className="text-2xl sm:text-3xl font-black text-slate-900 mb-3"
              style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900, lineHeight: 1.3 }}
            >
              ماذا تريد أن تفهم عن{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #2563EB 0%, #14B8A6 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {childName}؟
              </span>
            </h1>
            <p
              className="text-slate-500 text-base leading-relaxed max-w-lg mx-auto"
              style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.75 }}
            >
              اختر المسار الأنسب — لكل مسار أسئلته الخاصة وتقريره الأولي المخصص.
              يمكنك إجراء الفحصين في جلستين منفصلتين.
            </p>
          </div>

          {/* ─── بطاقتا المسار ───────────────────────────────────────────── */}
          <div className="grid sm:grid-cols-2 gap-5 mb-8">
            {PATHS.map((path) => {
              const Icon = path.icon;
              const isSelected = selected === path.id;
              return (
                <button
                  key={path.id}
                  onClick={() => handleChoose(path.id)}
                  className="text-right w-full rounded-3xl p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  style={{
                    background: isSelected ? path.bg : "white",
                    border: `2px solid ${isSelected ? path.color : "#E2E8F0"}`,
                    boxShadow: isSelected
                      ? `0 8px 32px ${path.color}22`
                      : "0 2px 12px rgba(0,0,0,0.04)",
                    transform: isSelected ? "translateY(-4px)" : undefined,
                  }}
                  aria-label={`اختيار مسار: ${path.title}`}
                >
                  {/* أيقونة + badge */}
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center"
                      style={{ background: path.bg, border: `1.5px solid ${path.border}` }}
                    >
                      <Icon size={22} style={{ color: path.color }} aria-hidden="true" />
                    </div>
                    <span
                      className="text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={{
                        background: path.badgeBg,
                        color: path.badgeColor,
                        fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                        border: `1px solid ${path.border}`,
                      }}
                    >
                      {path.badge}
                    </span>
                  </div>

                  {/* العنوان والوصف */}
                  <h2
                    className="text-base font-bold text-slate-900 mb-2"
                    style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 700, lineHeight: 1.4 }}
                  >
                    {path.title}
                  </h2>
                  <p
                    className="text-sm text-slate-500 mb-4 leading-relaxed"
                    style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.7 }}
                  >
                    {path.description}
                  </p>

                  {/* مجالات التركيز */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {path.areas.map((area) => (
                      <span
                        key={area}
                        className="text-xs px-2.5 py-1 rounded-lg font-medium"
                        style={{
                          background: path.bg,
                          color: path.color,
                          fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                        }}
                      >
                        {area}
                      </span>
                    ))}
                  </div>

                  {/* مدة الفحص + CTA */}
                  <div className="flex items-center justify-between pt-3" style={{ borderTop: `1px solid ${path.border}` }}>
                    <span
                      className="text-xs text-slate-400"
                      style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                    >
                      ⏱ {path.duration}
                    </span>
                    <span
                      className="text-sm font-bold flex items-center gap-1.5"
                      style={{ color: path.color, fontFamily: "'Cairo', sans-serif" }}
                    >
                      ابدأ هذا المسار
                      <ChevronLeft size={14} />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* ─── ضمانات الثقة ─────────────────────────────────────────────── */}
          <div
            className="rounded-2xl p-5"
            style={{ background: "white", border: "1px solid #F1F5F9", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
          >
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { icon: Shield, text: "فحص أولي مجاني — ليس تشخيصاً رسمياً", color: "#14B8A6" },
                { icon: CheckCircle2, text: "بيانات طفلك محمية وسرية تماماً", color: "#2563EB" },
                { icon: Brain, text: "تقرير أولي مدعوم بالذكاء الاصطناعي بعد الانتهاء", color: "#F59E0B" },
              ].map(({ icon: Icon, text, color }) => (
                <div key={text} className="flex items-start gap-2.5">
                  <Icon size={14} style={{ color, flexShrink: 0, marginTop: "2px" }} aria-hidden="true" />
                  <span
                    className="text-xs text-slate-500 leading-relaxed"
                    style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.65 }}
                  >
                    {text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
