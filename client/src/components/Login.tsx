/**
 * Login.tsx — صفحة تسجيل الدخول بـ OTP
 * Sprint 1: Phone OTP Authentication
 *
 * خطوتان:
 * 1. إدخال رقم الجوال السعودي وإرسال OTP
 * 2. إدخال رمز التحقق والتأكيد
 */
import { ChevronRight, Loader2, Phone, Shield, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { normalizeSaudiPhone, useSupabaseAuth } from "../context/AuthContext";

// ─── Breadcrumb ───────────────────────────────────────────────────────────────
function Breadcrumb() {
  return (
    <nav
      dir="rtl"
      className="flex items-center justify-center gap-2 text-sm mb-6"
      style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
    >
      <Link href="/" className="text-gray-500 hover:text-[#1E4E8C] transition-colors">
        الرئيسية
      </Link>
      <ChevronRight size={14} className="text-gray-400 rotate-180" />
      <span style={{ color: "#1E4E8C" }} className="font-medium">
        تسجيل الدخول
      </span>
    </nav>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Login() {
  const [, navigate] = useLocation();
  const { user, signInWithPhone, verifyOtp } = useSupabaseAuth();

  const [step, setStep] = useState<1 | 2>(1);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // إذا كان المستخدم مسجلاً بالفعل، أعده للحساب
  if (user) {
    navigate("/account");
    return null;
  }

  // ─── Step 1: إرسال OTP ──────────────────────────────────────────────────────
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const normalized = normalizeSaudiPhone(phone);
    if (!normalized) {
      setError("يرجى إدخال رقم جوال سعودي صحيح. مثال صحيح: 05XXXXXXXX");
      return;
    }

    setLoading(true);
    const { error: sendError } = await signInWithPhone(phone);
    setLoading(false);

    if (sendError) {
      setError(sendError);
      return;
    }

    setSuccessMsg("تم إرسال رمز التحقق إلى جوالك.");
    setStep(2);
  };

  // ─── Step 2: التحقق من OTP ──────────────────────────────────────────────────
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!otp || otp.trim().length < 4) {
      setError("يرجى إدخال رمز التحقق المرسل إلى جوالك.");
      return;
    }

    setLoading(true);
    const { error: verifyError } = await verifyOtp(phone, otp);
    setLoading(false);

    if (verifyError) {
      setError(verifyError);
      return;
    }

    setSuccessMsg("تم تسجيل الدخول بنجاح.");
    navigate("/children");
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen flex flex-col"
      style={{
        background: "linear-gradient(135deg, #f0f7ff 0%, #e8f4fd 50%, #f5f9ff 100%)",
        fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif",
      }}
    >
      {/* ─── Navbar placeholder ─────────────────────────────────────────────── */}
      <div className="h-16" />

      {/* ─── Hero ───────────────────────────────────────────────────────────── */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <Breadcrumb />

        {/* Card */}
        <div
          className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8"
          style={{ border: "1px solid rgba(30,78,140,0.08)" }}
        >
          {/* Icon + Title */}
          <div className="flex flex-col items-center mb-6">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
              style={{ background: "rgba(30,78,140,0.07)" }}
            >
              {step === 1 ? (
                <Phone size={26} style={{ color: "#1E4E8C" }} />
              ) : (
                <ShieldCheck size={26} style={{ color: "#2BBDB6" }} />
              )}
            </div>
            <h1
              className="text-2xl font-bold text-center"
              style={{ color: "#1E4E8C", fontFamily: "'Cairo', sans-serif" }}
            >
              {step === 1 ? "تسجيل الدخول" : "أدخل رمز التحقق"}
            </h1>
            <p className="text-sm text-gray-500 text-center mt-1">
              {step === 1
                ? "أدخل رقم جوالك للمتابعة"
                : `تم إرسال رمز التحقق إلى ${phone}`}
            </p>
          </div>

          {/* ─── Step 1 Form ────────────────────────────────────────────────── */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  رقم الجوال
                </label>
                <input
                  id="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="مثال: 05XXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={loading}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-right text-base focus:outline-none focus:ring-2 focus:ring-[#1E4E8C]/30 focus:border-[#1E4E8C] transition-all disabled:opacity-60"
                  style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 text-right">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || !phone.trim()}
                className="w-full py-3 rounded-xl font-semibold text-white transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg, #1E4E8C 0%, #2BBDB6 100%)" }}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    جارٍ الإرسال...
                  </>
                ) : (
                  "إرسال رمز التحقق"
                )}
              </button>
            </form>
          )}

          {/* ─── Step 2 Form ────────────────────────────────────────────────── */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
              {successMsg && (
                <p className="text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2 text-right">
                  {successMsg}
                </p>
              )}

              <div>
                <label
                  htmlFor="otp"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  رمز التحقق
                </label>
                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="أدخل الرمز المرسل إلى جوالك"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  disabled={loading}
                  maxLength={6}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-center text-xl tracking-widest focus:outline-none focus:ring-2 focus:ring-[#2BBDB6]/30 focus:border-[#2BBDB6] transition-all disabled:opacity-60"
                  style={{ fontFamily: "monospace, sans-serif", letterSpacing: "0.3em" }}
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 text-right">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || otp.length < 4}
                className="w-full py-3 rounded-xl font-semibold text-white transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg, #1E4E8C 0%, #2BBDB6 100%)" }}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    جارٍ التحقق...
                  </>
                ) : (
                  "تأكيد الدخول"
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setOtp("");
                  setError(null);
                  setSuccessMsg(null);
                }}
                className="text-sm text-gray-500 hover:text-[#1E4E8C] transition-colors text-center"
              >
                تغيير رقم الجوال
              </button>
            </form>
          )}

          {/* ─── Trust Notes ────────────────────────────────────────────────── */}
          <div
            className="mt-6 rounded-xl p-4 flex flex-col gap-2"
            style={{ background: "rgba(43,189,182,0.06)", border: "1px solid rgba(43,189,182,0.15)" }}
          >
            <div className="flex items-start gap-2">
              <Shield size={15} className="mt-0.5 flex-shrink-0" style={{ color: "#2BBDB6" }} />
              <p className="text-xs text-gray-600 leading-relaxed">
                نستخدم رقم الجوال لحماية بياناتك وربط ملفات الأطفال ونتائج الفحص بحسابك فقط.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <Shield size={15} className="mt-0.5 flex-shrink-0" style={{ color: "#2BBDB6" }} />
              <p className="text-xs text-gray-600 leading-relaxed">
                لن يتم عرض بياناتك أو بيانات أطفالك لأي مستخدم آخر.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
