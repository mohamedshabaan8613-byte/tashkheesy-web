/*
 * تشخيصي — Step4Confirmation
 * Editorial Healthcare | Light mode | Arabic RTL
 *
 * ما تغيّر:
 * - إزالة كل لغة الدفع (بوابة الدفع، ضريبة، CreditCard، trpc.bookings.create)
 * - الخطوة الرابعة أصبحت "مراجعة وإرسال طلب الحجز"
 * - عند الضغط تظهر شاشة تأكيد احترافية مع رقم حجز منسق TK-2026-XXXX
 * - ملخص كامل: الخدمة، الموعد، المتخصص، بيانات الوالد، بيانات الطفل
 * - شرح الخطوات التالية + ضمانات الخصوصية
 * - لا يوجد backend call — يعمل كـ MVP كامل
 *
 * Palette: #F4EFE8 bg, #FFFFFF surface, #243B53 text, #1E4E8C primary, #2BBDB6 secondary
 */

import { useState, useEffect } from "react";
import { useBooking } from "@/contexts/BookingContext";
import { useLocation } from "wouter";
import {
  CheckCircle2,
  Calendar,
  Clock,
  User,
  Baby,
  GraduationCap,
  Mail,
  Phone,
  MapPin,
  Shield,
  Sparkles,
  ChevronLeft,
  ArrowLeft,
  MessageCircle,
  FileText,
  Bell,
} from "lucide-react";

// ─── توليد رقم حجز منسق ─────────────────────────────────────────────────────
function generateBookingRef(): string {
  const year = new Date().getFullYear();
  const num = Math.floor(1000 + Math.random() * 8999);
  return `TK-${year}-${num}`;
}

// ─── تسميات الخدمة ────────────────────────────────────────────────────────────
const SERVICE_LABELS: Record<string, string> = {
  CHILD: "تقييم صعوبات التعلم — للأطفال",
  UNIVERSITY: "تقييم صعوبات التعلم — طلاب الجامعة",
};

// ─── الخطوات التالية بعد الحجز ───────────────────────────────────────────────
const NEXT_STEPS = [
  {
    icon: Bell,
    color: "#1E4E8C",
    bg: "#DFF3F1",
    title: "تأكيد خلال ٢٤ ساعة",
    desc: "سيتواصل معك المتخصص أو فريق تشخيصي لتأكيد الموعد وترتيب الخطوة التالية",
  },
  {
    icon: MessageCircle,
    color: "#2BBDB6",
    bg: "#DFF3F1",
    title: "تنسيق الجلسة",
    desc: "ستتلقى تفاصيل الجلسة ورابط الاجتماع عبر البريد الإلكتروني أو الجوال",
  },
  {
    icon: FileText,
    color: "#F4C46A",
    bg: "#FFFBEB",
    title: "تقرير مفصل",
    desc: "بعد الجلسة ستحصل على تقرير تقييم شامل مع توصيات واضحة للخطوات التالية",
  },
];

export default function Step4Confirmation() {
  const { bookingData, prevStep, resetBooking } = useBooking();
  const [, navigate] = useLocation();
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [bookingRef, setBookingRef] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  const isChildService = bookingData.serviceType === "CHILD";

  // ─── إرسال طلب الحجز ─────────────────────────────────────────────────────
  function handleSubmitRequest() {
    if (!bookingData.serviceType || !bookingData.selectedDate || !bookingData.selectedTimeSlot) {
      return;
    }
    setIsSubmitting(true);
    // محاكاة تأخير إرسال الطلب (MVP — بدون backend حقيقي)
    setTimeout(() => {
      const ref = generateBookingRef();
      setBookingRef(ref);
      setIsConfirmed(true);
      setIsSubmitting(false);
    }, 1200);
  }

  // ─── شاشة التأكيد النهائية ────────────────────────────────────────────────
  if (isConfirmed && bookingRef) {
    return (
      <div
        className="max-w-2xl mx-auto py-8 px-2"
        style={{ direction: "rtl", fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
      >
        {/* أيقونة النجاح */}
        <div className="text-center mb-8">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{
              background: "linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)",
              boxShadow: "0 8px 32px rgba(16,185,129,0.2)",
            }}
          >
            <CheckCircle2 size={40} className="text-emerald-600" />
          </div>
          <h2
            className="text-2xl font-black text-slate-900 mb-2"
            style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900 }}
          >
            تم استلام طلب الحجز بنجاح
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            شكراً لك — تم تسجيل طلبك وسيتم التواصل معك قريباً لتأكيد الموعد
          </p>
        </div>

        {/* رقم الحجز */}
        <div
          className="rounded-2xl p-5 mb-6 text-center"
          style={{
            background: "linear-gradient(135deg, #DFF3F1 0%, #DFF3F1 100%)",
            border: "1.5px solid rgba(37,99,235,0.15)",
          }}
        >
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
            رقم طلب الحجز
          </p>
          <p
            className="text-3xl font-black tracking-wider"
            style={{
              fontFamily: "'Cairo', sans-serif",
              background: "linear-gradient(135deg, #1E4E8C 0%, #2BBDB6 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {bookingRef}
          </p>
          <p className="text-xs text-slate-400 mt-2">احتفظ بهذا الرقم للمتابعة</p>
        </div>

        {/* ملخص الحجز */}
        <div
          className="rounded-2xl p-5 mb-6"
          style={{ background: "white", border: "1px solid #D8E8E7", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
        >
          <h3
            className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4"
            style={{ letterSpacing: "0.08em" }}
          >
            ملخص الطلب
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">الخدمة</span>
              <span className="font-semibold text-slate-800">
                {SERVICE_LABELS[bookingData.serviceType ?? "CHILD"]}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">التاريخ</span>
              <span className="font-semibold text-slate-800">{bookingData.selectedDate}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">الوقت</span>
              <span className="font-semibold text-slate-800">{bookingData.selectedTimeSlot}</span>
            </div>
            {bookingData.parentName && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500">الاسم</span>
                <span className="font-semibold text-slate-800">{bookingData.parentName}</span>
              </div>
            )}
            {bookingData.parentPhone && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500">الجوال</span>
                <span className="font-semibold text-slate-800 dir-ltr">{bookingData.parentPhone}</span>
              </div>
            )}
          </div>
        </div>

        {/* الخطوات التالية */}
        <div className="space-y-3 mb-8">
          {NEXT_STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={i}
                className="flex items-start gap-3 rounded-xl p-4"
                style={{ background: step.bg, border: `1px solid ${step.bg}` }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "white", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}
                >
                  <Icon size={15} style={{ color: step.color }} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 mb-0.5" style={{ fontFamily: "'Cairo', sans-serif" }}>
                    {step.title}
                  </p>
                  <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* ضمان الخصوصية */}
        <div
          className="flex items-center gap-2 justify-center mb-6 text-xs text-slate-400"
        >
          <Shield size={13} className="text-teal-500" />
          <span>بياناتك تُعامل بسرية تامة وتُستخدم فقط لتنسيق الموعد</span>
        </div>

        {/* أزرار الإجراء */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate("/")}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl text-white font-bold text-sm transition-all duration-200 hover:-translate-y-0.5"
            style={{
              background: "linear-gradient(135deg, #1E4E8C 0%, #1d4ed8 100%)",
              fontFamily: "'Cairo', sans-serif",
              boxShadow: "0 4px 16px rgba(37,99,235,0.3)",
            }}
          >
            العودة إلى الصفحة الرئيسية
            <ArrowLeft size={16} />
          </button>
          <button
            onClick={resetBooking}
            className="sm:w-auto flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5"
            style={{
              background: "white",
              color: "#4A6278",
              border: "1.5px solid #D8E8E7",
              fontFamily: "'Cairo', sans-serif",
            }}
          >
            حجز موعد آخر
          </button>
        </div>
      </div>
    );
  }

  // ─── شاشة المراجعة قبل الإرسال ───────────────────────────────────────────
  const anim = (delay: number) =>
    `transition-all duration-600 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`;
  const animStyle = (delay: number) => ({ transitionDelay: `${delay}ms` });

  return (
    <div
      className="max-w-3xl mx-auto"
      style={{ direction: "rtl", fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
    >
      {/* ─── رأس القسم ─────────────────────────────────────────────────────── */}
      <div className={`mb-6 ${anim(0)}`} style={animStyle(0)}>
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-3 text-xs font-semibold"
          style={{ background: "#DFF3F1", color: "#1E4E8C", border: "1px solid rgba(37,99,235,0.15)" }}
        >
          <CheckCircle2 size={13} />
          الخطوة الأخيرة
        </div>
        <h2
          className="text-xl font-black text-slate-900 mb-1"
          style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900 }}
        >
          مراجعة طلب الحجز
        </h2>
        <p className="text-sm text-slate-500">
          راجع بياناتك قبل إرسال الطلب — يمكنك العودة لتعديل أي خطوة
        </p>
      </div>

      {/* ─── ملخص الخدمة والموعد ───────────────────────────────────────────── */}
      <div
        className={`rounded-2xl p-5 mb-4 ${anim(80)}`}
        style={{
          ...animStyle(80),
          background: "white",
          border: "1px solid #D8E8E7",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}
      >
        <h3
          className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4"
          style={{ letterSpacing: "0.08em" }}
        >
          تفاصيل الموعد
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "#DFF3F1" }}
            >
              <Sparkles size={14} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">نوع الخدمة</p>
              <p className="text-sm font-bold text-slate-800">
                {SERVICE_LABELS[bookingData.serviceType ?? "CHILD"]}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "#DFF3F1" }}
            >
              <Calendar size={14} className="text-teal-600" />
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">التاريخ</p>
              <p className="text-sm font-bold text-slate-800">
                {bookingData.selectedDate || "—"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "#FFFBEB" }}
            >
              <Clock size={14} className="text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">الوقت</p>
              <p className="text-sm font-bold text-slate-800">
                {bookingData.selectedTimeSlot || "—"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "#F5F3FF" }}
            >
              <User size={14} className="text-violet-600" />
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">المتخصص</p>
              <p className="text-sm font-bold text-slate-800">
                {bookingData.autoAssign ? "اختيار تلقائي من الفريق" : bookingData.specialistId ? "متخصص محدد" : "اختيار تلقائي"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── بيانات الوالد / المستخدم ──────────────────────────────────────── */}
      <div
        className={`rounded-2xl p-5 mb-4 ${anim(160)}`}
        style={{
          ...animStyle(160),
          background: "white",
          border: "1px solid #D8E8E7",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}
      >
        <h3
          className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4"
          style={{ letterSpacing: "0.08em" }}
        >
          بياناتك
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {bookingData.parentName && (
            <div className="flex items-center gap-2">
              <User size={14} className="text-slate-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-slate-400">الاسم</p>
                <p className="text-sm font-semibold text-slate-800">{bookingData.parentName}</p>
              </div>
            </div>
          )}
          {bookingData.parentEmail && (
            <div className="flex items-center gap-2">
              <Mail size={14} className="text-slate-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-slate-400">البريد الإلكتروني</p>
                <p className="text-sm font-semibold text-slate-800">{bookingData.parentEmail}</p>
              </div>
            </div>
          )}
          {bookingData.parentPhone && (
            <div className="flex items-center gap-2">
              <Phone size={14} className="text-slate-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-slate-400">الجوال</p>
                <p className="text-sm font-semibold text-slate-800">{bookingData.parentPhone}</p>
              </div>
            </div>
          )}
          {bookingData.parentCountry && (
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-slate-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-slate-400">بلد الإقامة</p>
                <p className="text-sm font-semibold text-slate-800">{bookingData.parentCountry}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── بيانات الطفل / الطالب ─────────────────────────────────────────── */}
      {(bookingData.patientName || bookingData.patientAge) && (
        <div
          className={`rounded-2xl p-5 mb-4 ${anim(240)}`}
          style={{
            ...animStyle(240),
            background: "white",
            border: "1px solid #D8E8E7",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          <h3
            className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4"
            style={{ letterSpacing: "0.08em" }}
          >
            {isChildService ? "بيانات الطفل" : "بيانات الطالب"}
          </h3>
          <div className="grid sm:grid-cols-3 gap-4">
            {bookingData.patientName && (
              <div className="flex items-center gap-2">
                {isChildService ? (
                  <Baby size={14} className="text-slate-400 flex-shrink-0" />
                ) : (
                  <GraduationCap size={14} className="text-slate-400 flex-shrink-0" />
                )}
                <div>
                  <p className="text-xs text-slate-400">الاسم</p>
                  <p className="text-sm font-semibold text-slate-800">{bookingData.patientName}</p>
                </div>
              </div>
            )}
            {bookingData.patientAge != null && (
              <div>
                <p className="text-xs text-slate-400">العمر</p>
                <p className="text-sm font-semibold text-slate-800">{bookingData.patientAge} سنة</p>
              </div>
            )}
            {isChildService && bookingData.patientGrade && (
              <div>
                <p className="text-xs text-slate-400">الصف الدراسي</p>
                <p className="text-sm font-semibold text-slate-800">{bookingData.patientGrade}</p>
              </div>
            )}
            {!isChildService && bookingData.patientUniversity && (
              <div>
                <p className="text-xs text-slate-400">الجامعة</p>
                <p className="text-sm font-semibold text-slate-800">{bookingData.patientUniversity}</p>
              </div>
            )}
            {!isChildService && bookingData.patientYear && (
              <div>
                <p className="text-xs text-slate-400">السنة الدراسية</p>
                <p className="text-sm font-semibold text-slate-800">{bookingData.patientYear}</p>
              </div>
            )}
          </div>
          {bookingData.notes && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-400 mb-1">ملاحظات إضافية</p>
              <p className="text-sm text-slate-700 leading-relaxed">{bookingData.notes}</p>
            </div>
          )}
        </div>
      )}

      {/* ─── بطاقة ما يحدث بعد الإرسال ────────────────────────────────────── */}
      <div
        className={`rounded-2xl p-5 mb-6 ${anim(320)}`}
        style={{
          ...animStyle(320),
          background: "linear-gradient(135deg, rgba(15,23,42,0.93) 0%, rgba(30,58,138,0.93) 60%, rgba(15,118,110,0.93) 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <Bell size={15} className="text-blue-300" />
            <h3
              className="text-sm font-black text-white"
              style={{ fontFamily: "'Cairo', sans-serif" }}
            >
              ماذا يحدث بعد إرسال الطلب؟
            </h3>
          </div>
          <ul className="space-y-2">
            {[
              "سيتواصل معك المتخصص أو فريق تشخيصي خلال ٢٤ ساعة لتأكيد الموعد",
              "ستتلقى تفاصيل الجلسة ورابط الاجتماع عبر البريد أو الجوال",
              "بعد الجلسة ستحصل على تقرير تقييم مفصل مع توصيات واضحة",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle2 size={13} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-xs text-blue-200 leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ─── ضمان الخصوصية ─────────────────────────────────────────────────── */}
      <div
        className={`flex items-center gap-2 justify-center mb-6 ${anim(400)}`}
        style={animStyle(400)}
      >
        <Shield size={13} className="text-teal-500" />
        <span className="text-xs text-slate-400">
          بياناتك تُعامل بسرية تامة وتُستخدم فقط لتنسيق الموعد المناسب
        </span>
      </div>

      {/* ─── أزرار التنقل ──────────────────────────────────────────────────── */}
      <div
        className={`flex justify-between gap-3 pt-5 border-t border-slate-100 ${anim(480)}`}
        style={animStyle(480)}
      >
        <button
          onClick={prevStep}
          disabled={isSubmitting}
          className="flex items-center gap-2 py-3 px-5 rounded-xl font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50"
          style={{
            background: "white",
            color: "#4A6278",
            border: "1.5px solid #D8E8E7",
            fontFamily: "'Cairo', sans-serif",
          }}
        >
          <ChevronLeft size={16} />
          السابق
        </button>

        <button
          onClick={handleSubmitRequest}
          disabled={isSubmitting || !bookingData.serviceType || !bookingData.selectedDate}
          className="flex items-center justify-center gap-2 py-3 px-8 rounded-xl text-white font-bold text-sm transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
          style={{
            background: isSubmitting
              ? "#94A3B8"
              : "linear-gradient(135deg, #1E4E8C 0%, #1d4ed8 100%)",
            fontFamily: "'Cairo', sans-serif",
            minWidth: "180px",
            boxShadow: isSubmitting ? "none" : "0 4px 16px rgba(37,99,235,0.3)",
          }}
        >
          {isSubmitting ? (
            <>
              <span
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
              />
              جاري إرسال الطلب...
            </>
          ) : (
            <>
              إرسال طلب الحجز
              <ArrowLeft size={16} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
