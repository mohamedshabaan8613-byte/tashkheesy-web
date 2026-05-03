/**
 * Account.tsx — Sprint 3 (Account Hub — Refined)
 * Route: /account
 *
 * Compact navigation hub for logged-in users.
 * Shows email, quick actions, and sign out.
 * Does NOT show self-assessment results (those appear in the dedicated flow).
 * Redirects to /login if not authenticated.
 */

import { useEffect } from "react";
import { useLocation } from "wouter";
import {
  User,
  LogOut,
  FolderOpen,
  PlayCircle,
  CalendarCheck,
  Brain,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { useSupabaseAuth, AUTH_MESSAGES } from "@/context/AuthContext";

// ─── Quick action definition ─────────────────────────────────────────────────
interface QuickAction {
  label: string;
  href: string;
  icon: React.ReactNode;
  accentColor: string;
  hoverBg: string;
  hoverBorder: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    label: "ملفات أطفالي",
    href: "/children",
    icon: <FolderOpen size={18} />,
    accentColor: "#1E4E8C",
    hoverBg: "hover:bg-blue-50",
    hoverBorder: "hover:border-blue-300",
  },
  {
    label: "تقييم ذاتي — صعوبات التعلم",
    href: "/self-assessment?pathType=learning&mode=self",
    icon: <Brain size={18} />,
    accentColor: "#0D9488",
    hoverBg: "hover:bg-teal-50",
    hoverBorder: "hover:border-teal-300",
  },
  {
    label: "تقييم ذاتي — فرط الحركة وتشتت الانتباه",
    href: "/self-assessment?pathType=adhd&mode=self",
    icon: <Zap size={18} />,
    accentColor: "#8B5CF6",
    hoverBg: "hover:bg-purple-50",
    hoverBorder: "hover:border-purple-300",
  },
  {
    label: "ابدأ فحصًا جديدًا لطفل",
    href: "/children",
    icon: <PlayCircle size={18} />,
    accentColor: "#2BBDB6",
    hoverBg: "hover:bg-teal-50",
    hoverBorder: "hover:border-teal-300",
  },
  {
    label: "احجز موعدًا",
    href: "/booking",
    icon: <CalendarCheck size={18} />,
    accentColor: "#D97706",
    hoverBg: "hover:bg-amber-50",
    hoverBorder: "hover:border-amber-300",
  },
];

export default function Account() {
  const { user, loading, signOut } = useSupabaseAuth();
  const [, navigate] = useLocation();

  // Redirect to /login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  async function handleSignOut() {
    const { error } = await signOut();
    if (error) {
      toast.error(error);
      return;
    }
    toast.success(AUTH_MESSAGES.signOutSuccess);
    navigate("/");
  }

  // ─── Loading state ────────────────────────────────────────────────────────
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

  // Not logged in — redirect in progress
  if (!user) return null;

  // Mask email: show first 2 chars + *** + domain
  const displayEmail = (() => {
    if (!user.email) return "—";
    const [local, domain] = user.email.split("@");
    if (!domain) return user.email;
    const masked =
      local.length <= 2 ? local + "***" : local.slice(0, 2) + "***";
    return `${masked}@${domain}`;
  })();

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      dir="rtl"
      style={{
        background: "linear-gradient(135deg, #F4EFE8 0%, #DFF3F1 100%)",
      }}
    >
      {/* ─── Card ─────────────────────────────────────────────────────────── */}
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

        {/* Body */}
        <div className="px-8 py-6">
          {/* Email display */}
          <div
            className="rounded-2xl border border-slate-100 mb-6"
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
          <div className="space-y-2.5 mb-6">
            {QUICK_ACTIONS.map((action) => (
              <a
                key={action.href + action.label}
                href={action.href}
                className={`flex items-center gap-3 w-full px-5 py-3.5 rounded-2xl border border-slate-200 text-slate-700 font-medium text-sm transition-all ${action.hoverBg} ${action.hoverBorder}`}
                style={{ fontFamily: "'Cairo', sans-serif" }}
              >
                <span
                  className="flex-shrink-0"
                  style={{ color: action.accentColor }}
                >
                  {action.icon}
                </span>
                {action.label}
              </a>
            ))}
          </div>

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
