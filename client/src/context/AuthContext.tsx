/**
 * AuthContext.tsx — Sprint 1A
 *
 * React Context provider for Supabase Phone OTP Auth.
 * Exports: AuthProvider, useSupabaseAuth
 *
 * Rules:
 * - Does NOT store OTP in localStorage.
 * - Does NOT log OTP codes.
 * - Does NOT log full phone numbers.
 * - Does NOT save children data to Supabase.
 * - Does NOT create database tables.
 */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";

// ─── Arabic error messages ────────────────────────────────────────────────────
export const AUTH_MESSAGES = {
  invalidPhone: "يرجى إدخال رقم جوال سعودي صحيح.",
  notConfigured: "لم يتم إعداد خدمة تسجيل الدخول بعد.",
  sendFailed: "تعذر إرسال رمز التحقق. حاول مرة أخرى.",
  invalidOtp: "رمز التحقق غير صحيح أو انتهت صلاحيته.",
  signInSuccess: "تم تسجيل الدخول بنجاح.",
  signOutSuccess: "تم تسجيل الخروج بنجاح.",
} as const;

// ─── Phone normalization ──────────────────────────────────────────────────────
/**
 * Accepts:
 *   05XXXXXXXX  ->  +9665XXXXXXXX
 *   5XXXXXXXX   ->  +9665XXXXXXXX
 *   9665XXXXXXXX -> +9665XXXXXXXX
 *   +9665XXXXXXXX -> +9665XXXXXXXX
 *   Arabic/Persian digits are converted first.
 *
 * Returns null for invalid input.
 */
export function normalizeSaudiPhone(raw: string): string | null {
  if (!raw || typeof raw !== "string") return null;

  // Convert Arabic-Indic digits (U+0660-U+0669) to ASCII
  let phone = raw
    .replace(/[\u0660-\u0669]/g, (d) =>
      String(d.codePointAt(0)! - 0x0660)
    )
    // Convert Extended Arabic-Indic digits (U+06F0-U+06F9) to ASCII
    .replace(/[\u06f0-\u06f9]/g, (d) =>
      String(d.codePointAt(0)! - 0x06f0)
    )
    .replace(/[\s\-().]/g, ""); // strip whitespace and separators

  // Normalize to +9665XXXXXXXX
  if (/^\+9665\d{8}$/.test(phone)) return phone;
  if (/^9665\d{8}$/.test(phone)) return `+${phone}`;
  if (/^05\d{8}$/.test(phone)) return `+966${phone.slice(1)}`;
  if (/^5\d{8}$/.test(phone)) return `+9665${phone.slice(1)}`;

  return null; // invalid
}

// ─── Context types ────────────────────────────────────────────────────────────
interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithPhone: (phone: string) => Promise<{ error: string | null }>;
  verifyOtp: (phone: string, token: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<{ error: string | null }>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    // Load initial session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    // Subscribe to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ─── signInWithPhone ────────────────────────────────────────────────────────
  async function signInWithPhone(
    phone: string
  ): Promise<{ error: string | null }> {
    const normalized = normalizeSaudiPhone(phone);
    if (!normalized) return { error: AUTH_MESSAGES.invalidPhone };
    if (!isSupabaseConfigured) return { error: AUTH_MESSAGES.notConfigured };

    const { error } = await supabase.auth.signInWithOtp({
      phone: normalized,
    });

    if (error) return { error: AUTH_MESSAGES.sendFailed };
    return { error: null };
  }

  // ─── verifyOtp ──────────────────────────────────────────────────────────────
  async function verifyOtp(
    phone: string,
    token: string
  ): Promise<{ error: string | null }> {
    const normalized = normalizeSaudiPhone(phone);
    if (!normalized) return { error: AUTH_MESSAGES.invalidPhone };
    if (!isSupabaseConfigured) return { error: AUTH_MESSAGES.notConfigured };

    const { error } = await supabase.auth.verifyOtp({
      phone: normalized,
      token,
      type: "sms",
    });

    if (error) return { error: AUTH_MESSAGES.invalidOtp };
    return { error: null };
  }

  // ─── signOut ────────────────────────────────────────────────────────────────
  async function signOut(): Promise<{ error: string | null }> {
    if (!isSupabaseConfigured) return { error: null };
    const { error } = await supabase.auth.signOut();
    if (error) return { error: error.message };
    return { error: null };
  }

  return (
    <AuthContext.Provider
      value={{ user, session, loading, signInWithPhone, verifyOtp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useSupabaseAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useSupabaseAuth must be used inside <AuthProvider>");
  }
  return ctx;
}
