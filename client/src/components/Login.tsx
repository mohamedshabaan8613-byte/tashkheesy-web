/**
 * Login.tsx — Sprint 1A
 * Route: /login
 *
 * Two-step Saudi phone OTP login page.
 * Step 1: Enter phone number → send OTP
 * Step 2: Enter OTP code → verify
 *
 * Arabic RTL. Uses existing brand style (Cairo + IBM Plex Sans Arabic).
 * Redirects to /account if already logged in.
 * Redirects to /children on successful login.
 */
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useSupabaseAuth, normalizeSaudiPhone, AUTH_MESSAGES } from "@/context/AuthContext";
import { Phone, ShieldCheck, ArrowLeft, RotateCcw } from "lucide-react";

export default function Login() {
  const { user, loading, signInWithPhone, verifyOtp } = useSupabaseAuth();
  const [, navigate] = useLocation();

  const [step, setStep] = useState<1 | 2>(1);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      navigate("/account");
    }
  }, [user, loading, navigate]);

  // ─── Step 1: Send OTP ───────────────────────────────────────────────────────
  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const normalized = normalizeSaudiPhone(phone);
    if (!normalized) {
      setError(AUTH_MESSAGES.invalidPhone);
      return;
    }

    setSubmitting(true);
    const { error: sendError } = await signInWithPhone(phone);
    setSubmitting(false);

    if (sendError) {
      setError(sendError);
      return;
    }

    setStep(2);
  }

  // ─── Step 2: Verify OTP ─────────────────────────────────────────────────────
  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!otp.trim() || otp.trim().length < 4) {
      setError("يرجى إدخال رمز التحقق المرسل إلى جوالك.");
      return;
    }

    setSubmitting(true);
    const { error: verifyError } = await verifyOtp(phone, otp.trim());
    setSubmitting(false);

    if (verifyError) {
      setError(verifyError);
      return;
    }

    setSuccessMsg(AUTH_MESSAGES.signInSuccess);
    setTimeout(() => navigate("/children"), 800);
  }

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#F4EFE8" }}
      >
        <div
          className="text-slate-500 text-sm"
          style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
        >
          جارٍ التحميل...
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      dir="rtl"
      style={{ background: "linear-gradient(135deg, #F4EFE8 0%, #DFF3F1 100%)" }}
    >
      {/* Card */}
      <div
        className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden"
        style={{ border: "1px solid #D8E8E7" }}
      >
        {/* Header */}
        <div
          className="px-8 pt-8 pb-6 text-center"
          style={{
            background: "linear-gradient(135deg, #1E4E8C 0%, #1d4ed8 100%)",
          }}
        >
          <div className="flex justify-center mb-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.15)" }}
            >
              {step === 1 ? (
                <Phone size={28} className="text-white" />
              ) : (
                <ShieldCheck size={28} className="text-white" />
              )}
            </div>
          </div>
          <h1
            className="text-2xl font-black text-white mb-1"
            style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900 }}
          >
            {step === 1 ? "تسجيل الدخول" : "رمز التحقق"}
          </h1>
          <p
            className="text-blue-100 text-sm"
            style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
          >
            {step === 1
              ? "أدخل رقم جوالك للمتابعة"
              : "أدخل الرمز المرسل إلى جوالك"}
          </p>
        </div>

        {/* Body */}
        <div className="px-8 py-7">
          {/* Step 1 — Phone input */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} noValidate>
              <div className="mb-5">
                <label
                  htmlFor="phone-input"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                  style={{ fontFamily: "'Cairo', sans-serif" }}
                >
                  رقم الجوال
                  <span className="text-red-400 mr-1">*</span>
                </label>
                <div className="relative">
                  <Phone
                    size={16}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    id="phone-input"
                    type="tel"
                    inputMode="tel"
                    placeholder="مثال: 05XXXXXXXX"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      setError(null);
                    }}
                    className="w-full pr-10 pl-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-base focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                    style={{
                      fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                      direction: "ltr",
                      textAlign: "right",
                    }}
                    disabled={submitting}
                    autoComplete="tel"
                  />
                </div>
              </div>

              {/* Error */}
              {error && (
                <div
                  className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm"
                  style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || !phone.trim()}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white font-bold text-base transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background: "linear-gradient(135deg, #1E4E8C 0%, #1d4ed8 100%)",
                  fontFamily: "'Cairo', sans-serif",
                  fontWeight: 700,
                  boxShadow: "0 6px 20px rgba(37,99,235,0.25)",
                }}
              >
                {submitting ? "جارٍ الإرسال..." : "إرسال رمز التحقق"}
                {!submitting && <ArrowLeft size={18} />}
              </button>
            </form>
          )}

          {/* Step 2 — OTP input */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} noValidate>
              <div className="mb-5">
                <label
                  htmlFor="otp-input"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                  style={{ fontFamily: "'Cairo', sans-serif" }}
                >
                  رمز التحقق
                  <span className="text-red-400 mr-1">*</span>
                </label>
                <input
                  id="otp-input"
                  type="text"
                  inputMode="numeric"
                  placeholder="أدخل الرمز المرسل إلى جوالك"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                    setError(null);
                  }}
                  maxLength={6}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-base text-center tracking-widest focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                  style={{
                    fontFamily: "'Cairo', sans-serif",
                    fontSize: "1.5rem",
                    letterSpacing: "0.3em",
                  }}
                  disabled={submitting}
                  autoComplete="one-time-code"
                  autoFocus
                />
              </div>

              {/* Error */}
              {error && (
                <div
                  className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm"
                  style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                >
                  {error}
                </div>
              )}

              {/* Success */}
              {successMsg && (
                <div
                  className="mb-4 px-4 py-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 text-sm"
                  style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                >
                  {successMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || otp.length < 4}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white font-bold text-base transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed mb-3"
                style={{
                  background: "linear-gradient(135deg, #1E4E8C 0%, #1d4ed8 100%)",
                  fontFamily: "'Cairo', sans-serif",
                  fontWeight: 700,
                  boxShadow: "0 6px 20px rgba(37,99,235,0.25)",
                }}
              >
                {submitting ? "جارٍ التحقق..." : "تأكيد الدخول"}
                {!submitting && <ShieldCheck size={18} />}
              </button>

              {/* Change phone */}
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setOtp("");
                  setError(null);
                  setSuccessMsg(null);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-slate-500 text-sm font-medium hover:bg-slate-50 transition-colors"
                style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
              >
                <RotateCcw size={14} />
                تغيير رقم الجوال
              </button>
            </form>
          )}
        </div>

        {/* Trust notes */}
        <div
          className="px-8 pb-7"
          style={{ borderTop: "1px solid #F1F5F9" }}
        >
          <div className="pt-5 space-y-2">
            {[
              "نستخدم رقم الجوال لحماية بياناتك وربط ملفات الأطفال ونتائج الفحص بحسابك فقط.",
              "لن يتم عرض بياناتك أو بيانات أطفالك لأي مستخدم آخر.",
              "هذه الخطوة تمهيدية لحفظ النتائج بشكل آمن في المراحل القادمة.",
            ].map((note, i) => (
              <div key={i} className="flex items-start gap-2">
                <span
                  className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                  style={{ background: "#2BBDB6" }}
                />
                <p
                  className="text-xs text-slate-500 leading-relaxed"
                  style={{
                    fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                    lineHeight: 1.65,
                  }}
                >
                  {note}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Back to home */}
      <a
        href="/"
        className="mt-6 text-sm text-slate-500 hover:text-slate-700 transition-colors"
        style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
      >
        العودة إلى الصفحة الرئيسية
      </a>
    </div>
  );
}
