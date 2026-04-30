/**
 * supabaseClient.ts
 * Supabase client — Sprint 1 (Phone OTP Auth)
 *
 * يستخدم متغيرات البيئة فقط. لا يُكشف أي مفتاح في الكود.
 * يفشل بأمان إذا كانت المتغيرات غير موجودة في بيئة التطوير.
 */
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "[Supabase] VITE_SUPABASE_URL أو VITE_SUPABASE_ANON_KEY غير محدد. " +
      "تأكد من إضافة المتغيرات في ملف .env أو في إعدادات Vercel."
  );
}

// نُنشئ الـ client دائماً — إذا كانت المتغيرات فارغة سيفشل عند الاستخدام الفعلي فقط
export const supabase: SupabaseClient = createClient(
  supabaseUrl ?? "https://placeholder.supabase.co",
  supabaseAnonKey ?? "placeholder-anon-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  }
);

export const isSupabaseConfigured =
  !!supabaseUrl &&
  supabaseUrl !== "https://placeholder.supabase.co" &&
  !!supabaseAnonKey &&
  supabaseAnonKey !== "placeholder-anon-key";
