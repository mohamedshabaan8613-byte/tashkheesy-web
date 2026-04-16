/*
 * تشخيصي | Tashkheesy — Footer
 * روابط حقيقية لـ FAQ والخصوصية + شريط الثقة + تصميم محسّن
 * Palette: #0A0F1E bg · white text · #1E4E8C accent · #2BBDB6 secondary
 * Updated: 2026 — removed broken social links, softened privacy claim
 */
import { Link } from "wouter";
import { Shield, Lock, Heart, Award } from "lucide-react";

// ─── إشارات الثقة ──────────────────────────────────────────────────────────────
const trustSignals = [
  { icon: Shield, text: "نحمي بياناتك بعناية", color: "#2BBDB6" },
  { icon: Lock, text: "لا مشاركة مع أطراف ثالثة", color: "#1E4E8C" },
  { icon: Heart, text: "مراجعة من متخصصين معتمدين", color: "#F4C46A" },
  { icon: Award, text: "منصة عربية موثوقة", color: "#2BBDB6" },
];

// ─── روابط المنصة (جميعها موجودة فعلياً) ──────────────────────────────────────
const platformLinks = [
  { label: "ابدأ الفحص", href: "/start" },
  { label: "كيف يعمل", href: "/#how-it-works" },
  { label: "خدمات الدعم", href: "/services" },
  { label: "الأسعار والباقات", href: "/pricing" },
  { label: "احجز موعداً", href: "/booking" },
];

// ─── روابط الدعم ───────────────────────────────────────────────────────────────
const supportLinks = [
  { label: "رؤيتنا", href: "/impact" },
  { label: "الأسئلة الشائعة", href: "/faq" },
  { label: "سياسة الخصوصية", href: "/privacy" },
  { label: "إخلاء المسؤولية", href: "/disclaimer" },
  { label: "تواصل معنا", href: "/contact" },
  { label: "نموذج النتائج", href: "/result-demo" },
];

export default function Footer() {
  return (
    <footer style={{ background: "#0A0F1E", direction: "rtl" }}>
      {/* ─── شريط الثقة ────────────────────────────────────────────────────── */}
      <div
        className="border-b"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap justify-center gap-3 sm:gap-6 lg:gap-10">
            {trustSignals.map((signal, i) => {
              const Icon = signal.icon;
              return (
                <div key={i} className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${signal.color}18`, border: `1px solid ${signal.color}30` }}
                  >
                    <Icon size={15} style={{ color: signal.color }} />
                  </div>
                  <span
                    className="text-sm text-slate-400"
                    style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                  >
                    {signal.text}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── المحتوى الرئيسي ────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #1E4E8C, #2BBDB6)" }}
              >
                <span
                  className="text-white font-bold text-base"
                  style={{ fontFamily: "'Cairo', sans-serif" }}
                >
                  ت
                </span>
              </div>
              <div>
                <span
                  className="text-2xl font-black text-white block leading-tight"
                  style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 800 }}
                >
                  تشخيصي
                </span>
                <span
                  className="text-xs text-slate-500 tracking-wider"
                  style={{ fontFamily: "sans-serif", letterSpacing: "0.08em" }}
                >
                  Tashkheesy
                </span>
              </div>
            </div>
            <p
              className="text-sm text-slate-400 leading-relaxed max-w-sm mb-6"
              style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.85 }}
            >
              منصة عربية متخصصة تساعدك على فهم مؤشرات صعوبات التعلم والانتباه، والوصول إلى الدعم المناسب بخطوات واضحة وبلغتك.
            </p>

            {/* Trust mini-badges */}
            <div className="flex flex-wrap gap-2 mb-6">
              {["🔒 بيانات آمنة", "👨‍⚕️ متخصصون معتمدون", "🇸🇦 منصة عربية"].map((badge, i) => (
                <span
                  key={i}
                  className="text-xs px-3 py-1.5 rounded-full"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#94A3B8",
                    fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                  }}
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4
              className="text-sm font-bold text-white mb-5"
              style={{ fontFamily: "'Cairo', sans-serif" }}
            >
              المنصة
            </h4>
            <ul className="space-y-3">
              {platformLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href}>
                    <span
                      className="text-sm text-slate-400 hover:text-white transition-colors cursor-pointer"
                      style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                    >
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4
              className="text-sm font-bold text-white mb-5"
              style={{ fontFamily: "'Cairo', sans-serif" }}
            >
              الدعم والمعلومات
            </h4>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href}>
                    <span
                      className="text-sm text-slate-400 hover:text-white transition-colors cursor-pointer"
                      style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                    >
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            {/* FAQ highlight */}
            <div
              className="mt-6 p-4 rounded-xl"
              style={{
                background: "linear-gradient(135deg, rgba(37,99,235,0.15), rgba(20,184,166,0.15))",
                border: "1px solid rgba(37,99,235,0.2)",
              }}
            >
              <p
                className="text-xs text-slate-300 mb-2"
                style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
              >
                لديك سؤال؟
              </p>
              <Link href="/faq">
                <span
                  className="text-sm font-semibold cursor-pointer hover:opacity-80 transition-opacity"
                  style={{
                    background: "linear-gradient(135deg, #60A5FA, #2DD4BF)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    fontFamily: "'Cairo', sans-serif",
                  }}
                >
                  اقرأ الأسئلة الشائعة ←
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* ─── Bottom bar ──────────────────────────────────────────────────── */}
        <div
          className="border-t pt-8 flex flex-col items-center sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 text-center sm:text-right"
          style={{ borderColor: "rgba(255,255,255,0.06)" }}
        >
          <p
            className="text-xs text-slate-600"
            style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
          >
            © ٢٠٢٦ تشخيصي | Tashkheesy. جميع الحقوق محفوظة.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy">
              <span
                className="text-xs text-slate-600 hover:text-slate-400 transition-colors cursor-pointer"
                style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
              >
                الخصوصية
              </span>
            </Link>
            <span className="text-slate-700 text-xs">·</span>
            <Link href="/disclaimer">
              <span
                className="text-xs text-slate-600 hover:text-slate-400 transition-colors cursor-pointer"
                style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
              >
                إخلاء المسؤولية
              </span>
            </Link>
            <span className="text-slate-700 text-xs">·</span>
            <Link href="/faq">
              <span
                className="text-xs text-slate-600 hover:text-slate-400 transition-colors cursor-pointer"
                style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
              >
                الأسئلة الشائعة
              </span>
            </Link>
          </div>
          <p
            className="text-xs text-slate-700"
            style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
          >
            تشخيصي ليس بديلاً عن التشخيص الطبي المتخصص.
          </p>
        </div>
      </div>
    </footer>
  );
}
