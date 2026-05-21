/**
 * supabase.ts — Official Supabase Client Authority
 *
 * Sprint 3.4.1 Build Stabilization
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * AUTHORITY RULE
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * This is the SINGLE official import path for the Supabase client.
 *
 * ✅ CORRECT — all repositories must import from here:
 *   import { supabase } from "../lib/supabase";
 *
 * ❌ WRONG — do not import from these paths:
 *   import { supabase } from "../lib/supabaseClient";   ← deprecated for repos
 *   import { supabase } from "../../lib/supabase";       ← wrong depth
 *   import { createClient } from "@supabase/supabase-js"; ← raw SDK
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHY THIS FILE EXISTS
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * ConsultationRepository.ts (Sprint 3.4) imports:
 *   import { supabase } from "../lib/supabase";
 *
 * But only supabaseClient.ts existed — causing build error:
 *   "Could not resolve '../lib/supabase'"
 *
 * Solution: this file acts as the canonical re-export.
 * supabaseClient.ts is preserved for backward compatibility
 * with legacy imports (accountData.ts, admin.ts, etc.).
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

export { supabase } from "./supabaseClient";
