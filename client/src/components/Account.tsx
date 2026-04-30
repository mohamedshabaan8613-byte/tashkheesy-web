/**
 * Account.tsx — صفحة الحساب الشخصي
 * Sprint 1: Phone OTP Authentication
 *
 * تعرض:
 * - رقم الجوال المسجّل
 * - زر تسجيل الخروج
 * - روابط سريعة للخدمات
 */
import { ChevronRight, LogOut, Phone, User } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useSupabaseAuth } from "../context/AuthContext";

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
        حسابي
      </span>
    </nav>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Account() {
  const [, navigate] = useLocation();
  const { user, loading, signOut } = useSupabaseAuth();

  // إذا لم يكن مسجلاً، أعده لصفحة الدخول
  if (!loading && !user) {
    navigate("/login");
    return null;
  }

  const phone = user?.phone ?? "—";
  const userId = user?.id ?? "";
  const shortId = userId ? `#${userId.slice(0, 8).toUpperCase()}` : "";

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
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
      <div className="h-16" />

      <section className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <Breadcrumb />

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div
              className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
              style={{ borderColor: "#1E4E8C", borderTopColor: "transparent" }}
            />
          </div>
        ) : (
          <div className="w-full max-w-md flex flex-col gap-4">
            {/* ─── بطاقة المعلومات ──────────────────────────────────────────── */}
            <div
              className="bg-white rounded-2xl shadow-lg p-6"
              style={{ border: "1px solid rgba(30,78,140,0.08)" }}
            >
              <div className="flex items-center gap-4 mb-5">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(30,78,140,0.07)" }}
                >
                  <User size={26} style={{ color: "#1E4E8C" }} />
                </div>
                <div>
                  <p
                    className="text-lg font-bold"
                    style={{ color: "#1E4E8C", fontFamily: "'Cairo', sans-serif" }}
                  >
                    حسابي
                  </p>
                  {shortId && (
                    <p className="text-xs text-gray-400" style={{ fontFamily: "monospace" }}>
                      {shortId}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div
                  className="flex items-center gap-3 rounded-xl p-3"
                  style={{ background: "rgba(30,78,140,0.04)" }}
                >
                  <Phone size={16} style={{ color: "#1E4E8C" }} />
                  <div>
                    <p className="text-xs text-gray-500">رقم الجوال</p>
                    <p className="text-sm font-medium text-gray-800" dir="ltr">
                      {phone}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ─── روابط سريعة ─────────────────────────────────────────────── */}
            <div
              className="bg-white rounded-2xl shadow-sm p-4 flex flex-col gap-2"
              style={{ border: "1px solid rgba(30,78,140,0.06)" }}
            >
              <p className="text-xs font-semibold text-gray-400 mb-1 px-1">روابط سريعة</p>
              {[
                { href: "/children", label: "ملفات أطفالي" },
                { href: "/booking", label: "احجز موعداً" },
                { href: "/services", label: "خدمات الدعم" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-gray-700 hover:bg-[#f0f7ff] transition-colors"
                >
                  <span>{link.label}</span>
                  <ChevronRight size={15} className="text-gray-400 rotate-180" />
                </Link>
              ))}
            </div>

            {/* ─── زر تسجيل الخروج ─────────────────────────────────────────── */}
            <button
              onClick={handleSignOut}
              className="w-full py-3 rounded-xl font-semibold text-red-600 bg-white border border-red-100 hover:bg-red-50 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <LogOut size={16} />
              تسجيل الخروج
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
