/**
 * AssessmentForm.tsx
 * Sprint 2.2 — Step 5: Form UX Layer
 *
 * Controlled Component — ZERO internal state.
 * كل values + errors + handlers + submit action
 * تأتي عبر props من SelfAssessment.tsx.
 *
 * ما يحتويه هذا الملف:
 *   ✅ form fields (name + age)
 *   ✅ validation UI (error messages)
 *   ✅ privacy notice
 *   ✅ CTA button
 *   ✅ SCREENING_AREAS progress/trust grid
 *   ✅ trust copy (reassurance bullets)
 *   ✅ local focus/blur interaction handlers
 *
 * ما لا يحتويه:
 *   ❌ useState / useEffect
 *   ❌ navigate / routing
 *   ❌ localStorage / Supabase
 *   ❌ orchestration أو business flow
 *   ❌ analytics (deferred — insertion point جاهز في assessmentAnalytics.ts)
 *
 * نقاط UX المُلاحَظة (لا تُصلح الآن — سُجِّلت للـ copy/UX sprint):
 *   - spacing fatigue: padding السخي يجعل الفورم طويلاً على موبايل
 *   - copy anxiety: إشعار الخصوصية دافئ لكن يمكن تليينه أكثر
 *   - CTA pressure: gradient + ArrowLeft قد يبدو ملحّاً بعض الشيء
 *   - validation tone: رسالة خطأ العمر للأقل من ١٦ طويلة وتوجيهية
 *   - progress clarity: لا يوجد step indicator داخل الفورم
 */

import {
  Shield,
  Sparkles,
  ArrowLeft,
  Info,
  CheckCircle2,
  BookOpen,
  Pencil,
  Zap,
  Brain,
  Users,
  Hand,
} from "lucide-react";

// ─── محاور الفحص الستة ────────────────────────────────────────────────────────
const SCREENING_AREAS = [
  { icon: BookOpen, label: "القراءة والفهم",      color: "#1E4E8C", bg: "#DFF3F1" },
  { icon: Pencil,   label: "الكتابة والإملاء",    color: "#2BBDB6", bg: "#DFF3F1" },
  { icon: Zap,      label: "الانتباه والتركيز",   color: "#F4C46A", bg: "#FFFBEB" },
  { icon: Brain,    label: "الذاكرة والمعالجة",   color: "#8B5CF6", bg: "#F5F3FF" },
  { icon: Users,    label: "المهارات الاجتماعية", color: "#059669", bg: "#ECFDF5" },
  { icon: Hand,     label: "المهارات الحركية",    color: "#DC2626", bg: "#FEF2F2" },
];

// ─── Props Contract ──────────────────────────────────────────────────────────
export interface AssessmentFormProps {
  /** القيم */
  name: string;
  age: string;
  /** رسائل الخطأ — فارغة تعني لا خطأ */
  nameError: string;
  ageError: string;
  /** المسار الحالي — يؤثر فقط على نص الـ CTA */
  pathType: "learning" | "adhd";
  /** آخر نتيجة — يغيّر نص الـ CTA فقط (null = لا يوجد سجل) */
  latestResult: { sessionId: string } | null;
  /** Handlers — كل ما يغيّر state يأتي من الـ parent */
  onNameChange: (value: string) => void;
  onAgeChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function AssessmentForm({
  name,
  age,
  nameError,
  ageError,
  latestResult,
  onNameChange,
  onAgeChange,
  onSubmit,
}: AssessmentFormProps) {
  return (
    <>
      {/* ─── نموذج البيانات ─────────────────────────────────────────── */}
      <form
        id="self-assessment-form"
        onSubmit={onSubmit}
        className="rounded-3xl p-5 sm:p-7 lg:p-8 mb-6"
        style={{
          background: "white",
          border: "1.5px solid rgba(20,184,166,0.12)",
          boxShadow: "0 8px 40px rgba(20,184,166,0.07)",
        }}
        noValidate
      >
        <h2
          className="text-base font-bold text-slate-800 mb-5"
          style={{ fontFamily: "'Cairo', sans-serif" }}
        >
          بعض المعلومات الأساسية
        </h2>

        {/* حقل الاسم ─────────────────────────────────────────────────── */}
        <div className="mb-5">
          <label
            htmlFor="self-name"
            className="block text-sm font-semibold text-slate-700 mb-2"
            style={{ fontFamily: "'Cairo', sans-serif" }}
          >
            اسمك (أو اسم مستعار)
          </label>
          <input
            id="self-name"
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="مثال: أحمد أو مستخدم"
            className="w-full rounded-xl px-4 py-3 text-sm text-slate-800 outline-none transition-all duration-200"
            style={{
              fontFamily: "'IBM Plex Sans Arabic', sans-serif",
              border: nameError ? "1.5px solid #EF4444" : "1.5px solid #D8E8E7",
              background: "#F4EFE8",
              boxShadow: "inset 0 1px 3px rgba(0,0,0,0.04)",
            }}
            onFocus={(e) => {
              e.target.style.border = "1.5px solid #2BBDB6";
              e.target.style.boxShadow = "0 0 0 3px rgba(20,184,166,0.1)";
            }}
            onBlur={(e) => {
              e.target.style.border = nameError ? "1.5px solid #EF4444" : "1.5px solid #D8E8E7";
              e.target.style.boxShadow = "inset 0 1px 3px rgba(0,0,0,0.04)";
            }}
            autoComplete="off"
            aria-describedby={nameError ? "name-error" : undefined}
          />
          {nameError && (
            <p
              id="name-error"
              className="mt-1.5 text-xs text-red-500"
              style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
            >
              {nameError}
            </p>
          )}
        </div>

        {/* حقل العمر ─────────────────────────────────────────────────── */}
        <div className="mb-6">
          <label
            htmlFor="self-age"
            className="block text-sm font-semibold text-slate-700 mb-2"
            style={{ fontFamily: "'Cairo', sans-serif" }}
          >
            عمرك (بالسنوات)
          </label>
          <input
            id="self-age"
            type="number"
            value={age}
            onChange={(e) => onAgeChange(e.target.value)}
            placeholder="مثال: 22"
            min={16}
            max={80}
            className="w-full rounded-xl px-4 py-3 text-sm text-slate-800 outline-none transition-all duration-200"
            style={{
              fontFamily: "'IBM Plex Sans Arabic', sans-serif",
              border: ageError ? "1.5px solid #EF4444" : "1.5px solid #D8E8E7",
              background: "#F4EFE8",
              boxShadow: "inset 0 1px 3px rgba(0,0,0,0.04)",
            }}
            onFocus={(e) => {
              e.target.style.border = "1.5px solid #2BBDB6";
              e.target.style.boxShadow = "0 0 0 3px rgba(20,184,166,0.1)";
            }}
            onBlur={(e) => {
              e.target.style.border = ageError ? "1.5px solid #EF4444" : "1.5px solid #D8E8E7";
              e.target.style.boxShadow = "inset 0 1px 3px rgba(0,0,0,0.04)";
            }}
            aria-describedby={ageError ? "age-error" : "age-hint"}
          />
          {ageError ? (
            <p
              id="age-error"
              className="mt-1.5 text-xs text-red-500"
              style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
            >
              {ageError}
            </p>
          ) : (
            <p
              id="age-hint"
              className="mt-1.5 text-xs text-slate-400"
              style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
            >
              هذا المسار مخصص للأعمار ١٦ سنة فأكثر
            </p>
          )}
        </div>

        {/* إشعار الخصوصية ─────────────────────────────────────────────── */}
        <div
          className="flex items-start gap-3 rounded-xl p-3.5 mb-6"
          style={{ background: "#DFF3F1", border: "1px solid rgba(20,184,166,0.15)" }}
        >
          <Shield
            size={14}
            style={{ color: "#0D9488", flexShrink: 0, marginTop: "2px" }}
            aria-hidden="true"
          />
          <p
            className="text-xs text-teal-700 leading-relaxed"
            style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.7 }}
          >
            بياناتك محمية وسرية تماماً — لا تُشارك مع أي جهة. هذا الفحص لا يُعدّ تشخيصاً رسمياً.
          </p>
        </div>

        {/* زر البدء (CTA) ──────────────────────────────────────────────── */}
        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2.5 rounded-2xl font-bold text-base transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98]"
          style={{
            background: "linear-gradient(135deg, #2BBDB6 0%, #0D9488 100%)",
            color: "white",
            fontFamily: "'Cairo', sans-serif",
            fontWeight: 700,
            padding: "0.9rem 1.5rem",
            boxShadow: "0 4px 20px rgba(20,184,166,0.3)",
          }}
        >
          <Sparkles size={16} aria-hidden="true" />
          {latestResult ? "ابدأ تقييماً جديداً" : "ابدأ التقييم الذاتي"}
          <ArrowLeft size={16} aria-hidden="true" />
        </button>
      </form>

      {/* ─── ما يشمله الفحص (progress / trust grid) ────────────────── */}
      <div
        className="rounded-2xl p-5"
        style={{
          background: "white",
          border: "1px solid #DFF3F1",
          boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
        }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Info size={14} style={{ color: "#64748B" }} aria-hidden="true" />
          <h3
            className="text-sm font-bold text-slate-700"
            style={{ fontFamily: "'Cairo', sans-serif" }}
          >
            ما يشمله هذا الفحص
          </h3>
        </div>

        {/* شبكة المحاور الستة */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {SCREENING_AREAS.map(({ icon: Icon, label, color, bg }) => (
            <div
              key={label}
              className="flex items-center gap-2 rounded-xl px-3 py-2.5"
              style={{ background: bg, border: `1px solid ${color}18` }}
            >
              <Icon size={13} style={{ color, flexShrink: 0 }} aria-hidden="true" />
              <span
                className="text-xs font-medium"
                style={{ color: "#374151", fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* ضمانات الثقة */}
        <div className="mt-4 pt-4" style={{ borderTop: "1px solid #DFF3F1" }}>
          <div className="flex flex-col gap-2">
            {[
              { text: "الفحص لا يستغرق أكثر من ١٠ دقائق" },
              { text: "النتيجة فورية مع شرح مفصّل من الذكاء الاصطناعي" },
              { text: "ليس تشخيصاً رسمياً — مؤشرات توجيهية أولية فقط" },
            ].map(({ text }) => (
              <div key={text} className="flex items-start gap-2">
                <CheckCircle2
                  size={13}
                  style={{ color: "#059669", flexShrink: 0, marginTop: "2px" }}
                  aria-hidden="true"
                />
                <span
                  className="text-xs text-slate-500"
                  style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.6 }}
                >
                  {text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
