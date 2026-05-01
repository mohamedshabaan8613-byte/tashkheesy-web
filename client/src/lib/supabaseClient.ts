/**
 * supabaseClient.ts — Sprint 1A
 *
 * Lightweight Supabase client.
 * Uses VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY only.
 * Never uses service role key.
 * Never crashes the site if env vars are missing.
 */
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * True only when both env vars are present and non-empty.
 * Use this flag before calling any auth action.
 */
export const isSupabaseConfigured =
  Boolean(supabaseUrl) && Boolean(supabaseAnonKey);

/**
 * Supabase client instance.
 * Falls back to placeholder values so the import never throws.
 * When isSupabaseConfigured is false, no real requests reach Supabase.
 */
export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-anon-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
