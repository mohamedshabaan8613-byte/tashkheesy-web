/**
 * Login.tsx — Sprint 1B (Email Magic Link)
 * Route: /login
 *
 * User flow:
 * 1. User enters email → clicks "إرسال رابط الدخول"
 * 2. Success state: tells user to check email
 * 3. User clicks magic link in email → redirected to /account
 *
 * No phone OTP. No SMS. No Twilio.
 * Arabic RTL. Brand-consistent design.
 */

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Mail, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useSupabaseAuth, AUTH_MESSAGES, isValidEmail } from "@/context/AuthContext";
import { isSupabaseConfigured } from "@/lib/supabaseClient";

export default function Login() {
  const { user, loading, signInWithEmail } = useSupabaseAuth();
  const [, navigate] = useLocation();

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  // ─── قراءة redirect query parameter ──────────────────────────────────────────────────
  const searchParams = new URLSearchParams(window.location.search);
  const rawRedirect = searchParams.get("redirect") ?? "";
  // حماية open redirect: قبول المسارات الداخلية فقط
  const redirectPath =
    rawRedirect.startsWith("/") && !rawRedirect.startsWith("//")
      ? rawRedirect
      : "/account";

  // If already logged in, redirect to intended path
  useEffect(() => {
    if (!loading && user) {
      navigate(redirectPath);
    }
  }, [user, loading, navigate, redirectPath]);

  function validateEmail(): boolean {
    if (!email.trim()) {
      setEmailError(AUTH_MESSAGES.invalidEmail);
      return false;
    }
    if (!isValidEmail(email)) {
      setEmailError(AUTH_MESSAGES.invalidEmail);
      return false;
    }
    setEmailError(null);
    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateEmail()) return;

    setSubmitting(true);
    setEmailError(null);

    const { error } = await signInWithEmail(email);

    setSubmitting(false);

    if (error) {
      setEmailError(error);
      toast.error(error);
      return;
    }

    setSent(true);
    toast.success(AUTH_MESSAGES.sendSuccess);
  }

  // Loading state
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#F4EFE8" }}
      >
        <p
          className="text-slate-500 text-sm"
          style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
        >
          جارٍ التحميل...
        </p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      dir="rtl"
      style={{
        background: "linear-gradient(135deg, #F4EFE8 0%, #DFF3F1 100%)",
      }}
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
              <Mail size={28} className="text-white" />
            </div>
          </div>
          <h1
            className="text-2xl font-black text-white mb-1"
            style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900 }}
          >
            تسجيل الدخول
          </h1>
          <p
            className="text-blue-100 text-sm"
            style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
          >
            أدخل بريدك الإلكتروني لاستلام رابط الدخول
          </p>
        </div>

        {/* Body */}
        <div className="px-8 py-7">
          {/* Supabase not configured warning */}
          {!isSupabaseConfigured && (
            <div
              className="mb-5 flex items-start gap-3 rounded-2xl px-4 py-3"
              style={{ background: "#FEF3C7", border: "1px solid #FCD34D" }}
            >
              <AlertCircle
                size={18}
                className="flex-shrink-0 mt-0.5"
                style={{ color: "#D97706" }}
              />
              <p
                className="text-sm"
                style={{
                  fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                  color: "#92400E",
                  lineHeight: 1.65,
                }}
              >
                {AUTH_MESSAGES.notConfigured}
              </p>
            </div>
          )}

          {/* Success state */}
          {sent ? (
            <div className="text-center py-4">
              <div className="flex justify-center mb-4">
                <CheckCircle size={52} style={{ color: "#2BBDB6" }} />
              </div>
              <h2
                className="text-lg font-bold text-slate-800 mb-2"
                style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 800 }}
              >
                {AUTH_MESSAGES.sendSuccess}
              </h2>
              <p
                className="text-sm text-slate-600 mb-1"
                style={{
                  fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                  lineHeight: 1.7,
                }}
              >
                افتح الرسالة واضغط على الرابط لتسجيل الدخول بأمان.
              </p>
              <p
                className="text-xs text-slate-400 mt-2"
                style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
              >
                قد تصل الرسالة إلى البريد غير الهام أو التحديثات.
              </p>
              <button
                onClick={() => {
                  setSent(false);
                  setEmail("");
                }}
                className="mt-6 text-sm underline"
                style={{
                  fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                  color: "#1E4E8C",
                }}
              >
                إرسال إلى بريد آخر
              </button>
            </div>
          ) : (
            /* Login form */
            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-5">
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                  style={{ fontFamily: "'Cairo', sans-serif" }}
                >
                  البريد الإلكتروني
                </label>
                <input
                  id="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError(null);
                  }}
                  onBlur={validateEmail}
                  disabled={submitting}
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
                  style={{
                    fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                    direction: "ltr",
                    textAlign: "left",
                    borderColor: emailError ? "#EF4444" : "#CBD5E1",
                    background: emailError ? "#FEF2F2" : "#F8FAFC",
                    color: "#1E293B",
                  }}
                />
                {emailError && (
                  <p
                    className="mt-1.5 text-xs flex items-center gap-1"
                    style={{
                      color: "#EF4444",
                      fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                    }}
                  >
                    <AlertCircle size={12} />
                    {emailError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting || !isSupabaseConfigured}
                className="w-full py-3 rounded-2xl text-white font-bold text-sm transition-all duration-200"
                style={{
                  fontFamily: "'Cairo', sans-serif",
                  fontWeight: 800,
                  background:
                    submitting || !isSupabaseConfigured
                      ? "#94A3B8"
                      : "linear-gradient(135deg, #1E4E8C 0%, #2563eb 100%)",
                  cursor:
                    submitting || !isSupabaseConfigured
                      ? "not-allowed"
                      : "pointer",
                  boxShadow:
                    submitting || !isSupabaseConfigured
                      ? "none"
                      : "0 4px 14px rgba(30,78,140,0.25)",
                }}
              >
                {submitting ? "جارٍ الإرسال..." : "إرسال رابط الدخول"}
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
              "نستخدم بريدك الإلكتروني لحماية بياناتك وربط ملفات الأطفال ونتائج الفحص بحسابك فقط.",
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
