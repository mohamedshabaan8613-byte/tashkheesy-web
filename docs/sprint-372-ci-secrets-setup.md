# Sprint 3.7.2 — Required GitHub Secrets Setup

> One-time manual step required by the repository owner.
> CI will remain blocked until these secrets are configured.

## Go To

`GitHub → Repository → Settings → Environments → dev`

## Required Secrets

| Secret Name | Where to Find | Notes |
|---|---|---|
| `SUPABASE_ACCESS_TOKEN` | supabase.com → Account → Access Tokens | Personal access token for CLI auth |
| `SUPABASE_PROJECT_ID` | supabase.com → Project → Settings → General → Reference ID | e.g. `abcdefghijklmnop` |
| `SUPABASE_DB_PASSWORD` | supabase.com → Project → Settings → Database → Database Password | Used by CLI + psql |
| `SUPABASE_DB_HOST` | `db.<project-ref>.supabase.co` | Used by psql schema verification |
| `SUPABASE_URL` | supabase.com → Project → Settings → API → Project URL | Used by integration tests |
| `SUPABASE_SERVICE_KEY` | supabase.com → Project → Settings → API → service_role key | Used by integration test fixtures |
| `SUPABASE_ANON_KEY` | supabase.com → Project → Settings → API → anon/public key | Used by RPC REST probe |

## Migration Strategy

The CI pipeline stages `011` and `012` SQL files as Supabase-format migrations under
`supabase/migrations/` (timestamp-prefixed) before running `supabase db push --include-all`.

`--include-all` means:
- Migrations **already applied** (tracked in `supabase_migrations.schema_migrations`) → skipped (idempotent).
- Migrations **not yet applied** → applied in order.

This replaces the previous `curl /rpc/exec_sql` approach which returned 404 on Supabase SaaS.

## Verification Steps (after secrets are set)

1. Re-run the failed workflow from the PR Actions tab.
2. Confirm `supabase db push` completes without error.
3. Confirm `psql` verifies `atomic_reschedule` in `pg_proc`.
4. Confirm `lifecycle_version` + `reschedule_count` columns exist.
5. Confirm RPC probe returns non-404.
