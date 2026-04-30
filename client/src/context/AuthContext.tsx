/**
 * AuthContext.tsx
 * Sprint 1 — Phone OTP Authentication
 *
 * يوفر:
 * - user: بيانات المستخدم من Supabase
 * - session: الجلسة الحالية
 * - loading: حالة التحميل
 * - signInWithPhone(phone): إرسال OTP
 * - verifyOtp(phone, token): التحقق من الرمز
 * - signOut: تسجيل الخروج
 */
import { Session, User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState } from "react";
import { isSupabaseConfigured, supabase } from "../lib/supabaseClient";

// ─── تطبيع رقم الجوال السعودي إلى E.164 ──────────────────────────────────────
export function normalizeSaudiPhone(raw: string): string | null {
  const cleaned = raw.replace(/[\s\-().]/g, "");

  // +9665XXXXXXXX
  if (/^\+9665\d{8}$/.test(cleaned)) return cleaned;
  // 9665XXXXXXXX
  if (/^9665\d{8}$/.test(cleaned)) return `+${cleaned}`;
  // 05XXXXXXXX
  if (/^05\d{8}$/.test(cleaned)) return `+966${cleaned.slice(1)}`;
  // 5XXXXXXXX
  if (/^5\d{8}$/.test(cleaned)) return `+966${cleaned}`;

  return null;
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithPhone: (phone: string) => Promise<{ error: string | null }>;
  verifyOtp: (phone: string, token: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // قراءة الجلسة الحالية عند التحميل
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    // الاستماع لتغييرات حالة المصادقة
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setLoading(false);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // ─── إرسال OTP ──────────────────────────────────────────────────────────────
  const signInWithPhone = async (phone: string): Promise<{ error: string | null }> => {
    if (!isSupabaseConfigured) {
      return { error: "خدمة المصادقة غير مهيأة. يرجى التواصل مع الدعم." };
    }

    const normalized = normalizeSaudiPhone(phone);
    if (!normalized) {
      return { error: "يرجى إدخال رقم جوال سعودي صحيح. مثال صحيح: 05XXXXXXXX" };
    }

    const { error } = await supabase.auth.signInWithOtp({
      phone: normalized,
    });

    if (error) {
      console.error("[Auth] OTP send error:", error.message);
      return { error: "لم نتمكن من إرسال رمز التحقق. حاول مرة أخرى." };
    }

    return { error: null };
  };

  // ─── التحقق من OTP ──────────────────────────────────────────────────────────
  const verifyOtp = async (phone: string, token: string): Promise<{ error: string | null }> => {
    if (!isSupabaseConfigured) {
      return { error: "خدمة المصادقة غير مهيأة. يرجى التواصل مع الدعم." };
    }

    const normalized = normalizeSaudiPhone(phone);
    if (!normalized) {
      return { error: "رقم الجوال غير صحيح." };
    }

    const { error } = await supabase.auth.verifyOtp({
      phone: normalized,
      token: token.trim(),
      type: "sms",
    });

    if (error) {
      console.error("[Auth] OTP verify error:", error.message);
      if (error.message.includes("expired") || error.message.includes("invalid")) {
        return { error: "رمز التحقق غير صحيح أو انتهت صلاحيته." };
      }
      return { error: "تعذر التحقق من الرمز. حاول مرة أخرى." };
    }

    return { error: null };
  };

  // ─── تسجيل الخروج ───────────────────────────────────────────────────────────
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signInWithPhone, verifyOtp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useSupabaseAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useSupabaseAuth must be used within AuthProvider");
  return ctx;
}
