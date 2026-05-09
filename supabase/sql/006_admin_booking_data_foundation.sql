-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 006: Admin and Booking Data Foundation
-- Purpose: Add admin_users and booking_requests tables to support an internal
--          admin dashboard and persist successful booking submissions.
--
-- Strategy:
--   Additive only — no DROP, no ALTER on existing tables.
--   RLS enabled on both tables.
--   No public SELECT. No anonymous SELECT.
--   Anonymous INSERT on booking_requests is SKIPPED (see decision below).
--   Admin access via admin_users table only — no service_role in frontend.
-- ─────────────────────────────────────────────────────────────────────────────

-- ─────────────────────────────────────────────────────────────────────────────
-- SECURITY DECISION: Anonymous booking persistence
-- ─────────────────────────────────────────────────────────────────────────────
-- Anonymous INSERT policies on booking_requests are intentionally NOT added.
-- Reason: Allowing anon INSERT without a user_id check creates a surface for
-- spam and data poisoning. Formspree already captures all bookings (including
-- anonymous ones) as the primary record. Supabase persistence is additive and
-- only runs for authenticated users. Anonymous bookings are not lost — they
-- remain in Formspree. This is the safest default for a beta product.
-- ─────────────────────────────────────────────────────────────────────────────

-- ─────────────────────────────────────────────────────────────────────────────
-- 0. Shared trigger function (idempotent — safe to re-run)
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Table: public.admin_users
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.admin_users (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  email       text not null,
  role        text not null default 'admin',
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint admin_users_user_id_unique unique (user_id)
);

-- Indexes
create index if not exists idx_admin_users_email     on public.admin_users (email);
create index if not exists idx_admin_users_is_active on public.admin_users (is_active);

-- Updated_at trigger
drop trigger if exists set_admin_users_updated_at on public.admin_users;
create trigger set_admin_users_updated_at
  before update on public.admin_users
  for each row execute function public.set_updated_at();

-- ─── RLS: admin_users ────────────────────────────────────────────────────────
alter table public.admin_users enable row level security;

-- A user can read their own admin_users row (to check if they are admin).
-- This is the ONLY SELECT policy on admin_users.
-- It uses only auth.uid() — a built-in JWT claim — with no sub-query on admin_users.
-- This avoids any same-table RLS recursion risk.
--
-- isCurrentUserAdmin() in admin.ts relies on this policy:
--   it queries admin_users filtered by user_id = auth.uid() and is_active = true.
--   This policy allows that query to succeed for the current user's own row.
--
-- The booking_requests SELECT/UPDATE policies check admin status via a cross-table
-- EXISTS query on admin_users — that is safe (cross-table, not same-table).
create policy "admin_users: own row select"
  on public.admin_users
  for select
  using (auth.uid() = user_id);

-- NOTE: The "active admins can select active admins" policy has been intentionally
-- removed to prevent same-table RLS recursion risk. If a future admin list UI is
-- needed, implement it via a SECURITY DEFINER function in a separate migration.

-- No INSERT/UPDATE/DELETE policies — admin rows are managed via SQL Editor only.

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Table: public.booking_requests
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.booking_requests (
  id                        uuid primary key default gen_random_uuid(),

  -- Auth
  user_id                   uuid null references auth.users(id) on delete set null,

  -- Contact info
  full_name                 text,
  email                     text,
  phone                     text,
  notes                     text,

  -- Service
  service_id                text,
  service_title             text,
  service_price             text,
  service_duration          text,

  -- Schedule
  selected_date             text,
  selected_time_id          text,
  selected_time_label       text,

  -- Specialist
  specialist_id             text,
  specialist_name           text,
  specialist_title          text,
  specialist_specialty      text,

  -- URL context
  source_url                text,
  url_session_id            text,
  url_path_type             text,
  url_child                 text,
  url_service_id            text,
  url_specialist_id         text,

  -- Screening context (summarized only — no raw result JSON)
  screening_session_id      text,
  screening_path_type       text,
  screening_type            text,
  screening_mode            text,
  screening_subject_name    text,
  screening_subject_age     text,
  screening_score           text,
  screening_level           text,
  screening_risk_level      text,
  screening_completed_at    text,
  screening_summary         text,
  screening_context_found   text,
  screening_context_source  text,

  -- Formspree status
  formspree_status          text,
  formspree_ok              boolean default false,

  -- Booking flags
  booked_after_result       boolean default false,

  -- Timestamps
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

-- Indexes
create index if not exists idx_booking_requests_user_id          on public.booking_requests (user_id);
create index if not exists idx_booking_requests_email            on public.booking_requests (email);
create index if not exists idx_booking_requests_created_at       on public.booking_requests (created_at desc);
create index if not exists idx_booking_requests_formspree_ok     on public.booking_requests (formspree_ok);
create index if not exists idx_booking_requests_booked_after     on public.booking_requests (booked_after_result);
create index if not exists idx_booking_requests_session_id       on public.booking_requests (screening_session_id);

-- Updated_at trigger
drop trigger if exists set_booking_requests_updated_at on public.booking_requests;
create trigger set_booking_requests_updated_at
  before update on public.booking_requests
  for each row execute function public.set_updated_at();

-- ─── RLS: booking_requests ───────────────────────────────────────────────────
alter table public.booking_requests enable row level security;

-- Authenticated users may insert their own booking request
create policy "booking_requests: authenticated insert own"
  on public.booking_requests
  for insert
  with check (
    auth.uid() is not null
    and user_id = auth.uid()
  );

-- Active admins can SELECT all booking requests
create policy "booking_requests: admin select all"
  on public.booking_requests
  for select
  using (
    exists (
      select 1 from public.admin_users au
      where au.user_id = auth.uid()
        and au.is_active = true
    )
  );

-- Active admins can UPDATE booking requests (for status management)
create policy "booking_requests: admin update"
  on public.booking_requests
  for update
  using (
    exists (
      select 1 from public.admin_users au
      where au.user_id = auth.uid()
        and au.is_active = true
    )
  );

-- No public SELECT. No anonymous SELECT. No DELETE policy.

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. First admin setup instructions
-- ─────────────────────────────────────────────────────────────────────────────
-- After the first admin user logs in via Magic Link, find their UUID in:
--   Supabase Dashboard → Authentication → Users
-- Then run the following in Supabase SQL Editor (replace values):
--
-- insert into public.admin_users (user_id, email, role, is_active)
-- values ('AUTH_USER_ID_HERE', 'support@tashkheesy.sa', 'owner', true);
--
-- Do NOT hardcode admin emails in frontend code.
-- Do NOT auto-insert unknown admin users.
-- ─────────────────────────────────────────────────────────────────────────────
