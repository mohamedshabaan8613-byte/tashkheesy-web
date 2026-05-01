/**
 * AuthContext.tsx — Sprint 1B (Email Magic Link)
 *
 * Provides:
 *   AuthProvider  — wrap app with this
 *   useSupabaseAuth — hook to read auth state
 *   AuthContext — raw context (for useContext in Navbar/ChildrenPage)
 *
 * Auth method: Supabase Email Magic Link ONLY.
 * No phone OTP. No Twilio. No SMS.
 *
 * Arabic error messages throughout.
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

// ─── Arabic messages ──────────────────────────────────────────────────────────
export const AUTH_MESSAGES = {
  invalidEmail: "يرجى إدخال بريد إلكتروني صحيح.",
  notConfigured: "لم يتم إعداد خدمة تسجيل الدخول بعد.",
  sendFailed: "تعذر إرسال رابط الدخول. حاول مرة أخرى.",
  sendSuccess: "تم إرسال رابط الدخول إلى بريدك الإلكتروني.",
  signOutSuccess: "تم تسجيل الخروج بنجاح.",
} as const;

// ─── Email validation ─────────────────────────────────────────────────────────
export function isValidEmail(email: string): boolean {
  if (!email || !email.trim()) return false;
  // Must have exactly one @, non-empty local part, domain with at least one dot
  const trimmed = email.trim();
  const atIndex = trimmed.indexOf("@");
  if (atIndex <= 0) return false; // no @ or @ at start
  if (atIndex !== trimmed.lastIndexOf("@")) return false; // multiple @
  const domain = trimmed.slice(atIndex + 1);
  if (!domain || !domain.includes(".")) return false; // no domain or no dot
  const dotIndex = domain.lastIndexOf(".");
  const tld = domain.slice(dotIndex + 1);
  if (!tld || tld.length < 2) return false; // TLD too short
  const localPart = trimmed.slice(0, atIndex);
  if (!localPart) return false;
  return true;
}

// ─── Context types ────────────────────────────────────────────────────────────
interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithEmail: (email: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<{ error: string | null }>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // ─── signInWithEmail (Magic Link) ─────────────────────────────────────────
  async function signInWithEmail(
    email: string
  ): Promise<{ error: string | null }> {
    if (!isSupabaseConfigured) {
      return { error: AUTH_MESSAGES.notConfigured };
    }

    if (!isValidEmail(email)) {
      return { error: AUTH_MESSAGES.invalidEmail };
    }

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          emailRedirectTo: `${window.location.origin}/account`,
          shouldCreateUser: true,
        },
      });

      if (error) {
        return { error: AUTH_MESSAGES.sendFailed };
      }

      return { error: null };
    } catch {
      return { error: AUTH_MESSAGES.sendFailed };
    }
  }

  // ─── signOut ──────────────────────────────────────────────────────────────
  async function signOut(): Promise<{ error: string | null }> {
    if (!isSupabaseConfigured) {
      return { error: AUTH_MESSAGES.notConfigured };
    }

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return { error: AUTH_MESSAGES.sendFailed };
      }
      return { error: null };
    } catch {
      return { error: AUTH_MESSAGES.sendFailed };
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, session, loading, signInWithEmail, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useSupabaseAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useSupabaseAuth must be used inside AuthProvider");
  }
  return ctx;
}
