/**
 * Account.tsx — Sprint 3 (Account Hub)
 * Route: /account
 *
 * Shows logged-in user info, quick actions, and self-assessment history.
 * Redirects to /login if not authenticated.
 */

import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import {
  User,
  LogOut,
  FolderOpen,
  PlayCircle,
  Clock,
  ChevronLeft,
  Brain,
  BookOpen,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { useSupabaseAuth, AUTH_MESSAGES } from "@/context/AuthContext";

// ─── نوع ملخص التقييم الذاتي ─────────────────────────────────────────────────
interface SelfAssessmentSummary {
  id: string;
  sessionId: string;
  name: string;
  age: string | number;
  mode?: string;
  pathType: "learning" | "adhd";
  screeningType?: string;
  completedAt: string;
  resultKey: string;
}

// ─── قراءة سجل التقييمات من localStorage ─────────────────────────────────────
function loadSelfHistory(): SelfAssessmentSummary[] {
  try {
    const raw = localStorage.getItem("tashkheesy_self_assessments");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as SelfAssessmentSummary[];
  } catch {
    return [];
  }
}

// ─── تنسيق التاريخ بالعربية ──────────────────────────────────────────────────
function formatArabicDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return isoString;
  }
}

export default function Account() {
  const { user, loading, signOut } = useSupabaseAuth();
  const [, navigate] = useLocation();
  const [history, setHistory] = useState<SelfAssessmentSummary[]>([]);
  const [showAllHistory, setShowAllHistory] = useState(false);

  // Redirect to /login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  // تحميل سجل التقييمات عند الدخول
  useEffect(() => {
    if (user) {
      const h = loadSelfHistory();
      h.sort(
        (a, b) =>
          new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
      );
      setHistory(h);
    }
  }, [user]);

  async function handleSignOut() {
    const { error } = await signOut();
    if (error) {
      toast.error(error);
      return;
    }
    toast.success(AUTH_MESSAGES.signOutSuccess);
    navigate("/");
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

  // Not logged in — redirect in progress, show nothing
  if (!user) return null;

  // Mask email for display: show first 2 chars + *** + domain
  const displayEmail = (() => {
    if (!user.email) return "—";
    const [local, domain] = user.email.split("@");
    if (!domain) return user.email;
    const masked =
      local.length <= 2 ? local + "***" : local.slice(0, 2) + "***";
    return `${masked}@${domain}`;
  })();

  // النتائج المعروضة (3 كحد أقصى في الوضع المطوي)
  const visibleHistory = showAllHistory ? history : history.slice(0, 3);

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
              <User size={28} className="text-white" />
            </div>
          </div>
          <h1
            className="text-2xl font-black text-white mb-1"
            style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900 }}
          >
            حسابي
          </h1>
          <p
            className="text-blue-100 text-sm"
            style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
          >
            أنت مسجل الدخول بالبريد الإلكتروني
          </p>
        </div>

        {/* User info */}
        <div className="px-8 py-6">
          <div
            className="rounded-2xl border border-slate-100 divide-y divide-slate-100 mb-6"
            style={{ background: "#F8FAFC" }}
          >
            <div className="flex items-center justify-between px-5 py-3.5">
              <span
                className="text-xs text-slate-400"
                style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
              >
                البريد الإلكتروني
              </span>
              <span
                className="text-sm font-semibold text-slate-800"
                style={{ fontFamily: "'Cairo', sans-serif", direction: "ltr" }}
              >
                {displayEmail}
              </span>
            </div>
          </div>

          {/* Quick actions */}
          <div className="space-y-3 mb-6">
            <a
              href="/children"
              className="flex items-center gap-3 w-full px-5 py-3.5 rounded-2xl border border-slate-200 text-slate-700 font-medium text-sm hover:border-blue-300 hover:bg-blue-50 transition-all"
              style={{ fontFamily: "'Cairo', sans-serif" }}
            >
              <FolderOpen
                size={18}
                className="flex-shrink-0"
                style={{ color: "#1E4E8C" }}
              />
              ملفات أطفالي
            </a>

            {/* أقيّم نفسي — learning */}
            <a
              href="/self-assessment?pathType=learning&mode=self"
              className="flex items-center gap-3 w-full px-5 py-3.5 rounded-2xl border border-slate-200 text-slate-700 font-medium text-sm hover:border-teal-300 hover:bg-teal-50 transition-all"
              style={{ fontFamily: "'Cairo', sans-serif" }}
            >
              <BookOpen
                size={18}
                className="flex-shrink-0"
                style={{ color: "#2BBDB6" }}
              />
              تقييم ذاتي — صعوبات التعلم
            </a>

            {/* أقيّم نفسي — adhd */}
            <a
              href="/self-assessment?pathType=adhd&mode=self"
              className="flex items-center gap-3 w-full px-5 py-3.5 rounded-2xl border border-slate-200 text-slate-700 font-medium text-sm hover:border-purple-300 hover:bg-purple-50 transition-all"
              style={{ fontFamily: "'Cairo', sans-serif" }}
            >
              <Zap
                size={18}
                className="flex-shrink-0"
                style={{ color: "#8B5CF6" }}
              />
              تقييم ذاتي — فرط الحركة وتشتت الانتباه
            </a>

            <a
              href="/start"
              className="flex items-center gap-3 w-full px-5 py-3.5 rounded-2xl border border-slate-200 text-slate-700 font-medium text-sm hover:border-teal-300 hover:bg-teal-50 transition-all"
              style={{ fontFamily: "'Cairo', sans-serif" }}
            >
              <PlayCircle
                size={18}
                className="flex-shrink-0"
                style={{ color: "#2BBDB6" }}
              />
              ابدأ فحصًا جديدًا لطفل
            </a>
          </div>

          {/* ─── نتائج التقييم الذاتي ─────────────────────────────────────── */}
          {history.length > 0 && (
            <div
              className="rounded-2xl p-5 mb-6"
              style={{
                background: "#F8FAFC",
                border: "1px solid rgba(30,78,140,0.1)",
              }}
            >
              {/* العنوان */}
              <div className="flex items-center gap-2 mb-4">
                <Clock size={15} style={{ color: "#1E4E8C" }} aria-hidden="true" />
                <h2
                  className="text-sm font-bold text-slate-800"
                  style={{ fontFamily: "'Cairo', sans-serif" }}
                >
                  نتائج تقييماتك الذاتية
                </h2>
              </div>

              {/* قائمة النتائج */}
              <div className="flex flex-col gap-2.5">
                {visibleHistory.map((item) => (
                  <div
                    key={item.sessionId}
                    className="flex items-center justify-between gap-3 rounded-xl px-4 py-3"
                    style={{
                      background:
                        item.pathType === "adhd"
                          ? "rgba(139,92,246,0.06)"
                          : "rgba(20,184,166,0.06)",
                      border: `1px solid ${
                        item.pathType === "adhd"
                          ? "rgba(139,92,246,0.15)"
                          : "rgba(20,184,166,0.15)"
                      }`,
                    }}
                  >
                    {/* أيقونة + معلومات */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{
                          background:
                            item.pathType === "adhd"
                              ? "rgba(139,92,246,0.12)"
                              : "rgba(20,184,166,0.12)",
                        }}
                      >
                        {item.pathType === "adhd" ? (
                          <Zap size={14} style={{ color: "#8B5CF6" }} />
                        ) : (
                          <Brain size={14} style={{ color: "#0D9488" }} />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p
                          className="text-xs font-bold truncate"
                          style={{
                            color:
                              item.pathType === "adhd" ? "#7C3AED" : "#0D9488",
                            fontFamily: "'Cairo', sans-serif",
                          }}
                        >
                          {item.pathType === "adhd"
                            ? "فرط الحركة وتشتت الانتباه"
                            : "صعوبات التعلم"}
                        </p>
                        <p
                          className="text-xs text-slate-400 truncate"
                          style={{
                            fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                          }}
                        >
                          {item.name} · {formatArabicDate(item.completedAt)}
                        </p>
                      </div>
                    </div>

                    {/* زر العرض */}
                    <button
                      onClick={() =>
                        navigate(
                          `/screening-result/${item.sessionId}?name=${encodeURIComponent(item.name)}&pathType=${item.pathType}`
                        )
                      }
                      className="flex items-center gap-1 text-xs font-medium rounded-lg px-3 py-1.5 flex-shrink-0 transition-colors"
                      style={{
                        background:
                          item.pathType === "adhd"
                            ? "rgba(139,92,246,0.1)"
                            : "rgba(20,184,166,0.1)",
                        color:
                          item.pathType === "adhd" ? "#7C3AED" : "#0D9488",
                        fontFamily: "'Cairo', sans-serif",
                        border: `1px solid ${
                          item.pathType === "adhd"
                            ? "rgba(139,92,246,0.2)"
                            : "rgba(20,184,166,0.2)"
                        }`,
                      }}
                    >
                      عرض
                      <ChevronLeft size={12} />
                    </button>
                  </div>
                ))}
              </div>

              {/* زر عرض المزيد */}
              {history.length > 3 && (
                <button
                  onClick={() => setShowAllHistory((prev) => !prev)}
                  className="mt-3 w-full text-center text-xs text-slate-400 hover:text-slate-600 transition-colors py-1"
                  style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                >
                  {showAllHistory
                    ? "عرض أقل"
                    : `عرض ${history.length - 3} نتيجة إضافية`}
                </button>
              )}

              {/* ملاحظة الخصوصية */}
              <p
                className="mt-3 text-xs text-slate-400 leading-relaxed"
                style={{
                  fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                  lineHeight: 1.7,
                }}
              >
                هذه النتائج محفوظة على هذا الجهاز فقط.
              </p>
            </div>
          )}

          {/* Sign out */}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-red-200 text-red-600 font-medium text-sm hover:bg-red-50 transition-all"
            style={{ fontFamily: "'Cairo', sans-serif" }}
          >
            <LogOut size={16} />
            تسجيل الخروج
          </button>
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
