# Migration Audit — Sprint 3.7.1

> Last updated: Sprint 3.7.1 — Production Validation Layer

## Migration Ordering

| Order | File | Purpose | Status |
|-------|------|---------|--------|
| 001 | _(base schema)_ | Initial tables | ✅ |
| 002 | `002_account_data_persistence.sql` | Account + user data | ✅ |
| 003 | `003_screening_results_analytics.sql` | Screening analytics | ✅ |
| 004 | `004_remove_screening_analytics_delete_policy.sql` | RLS policy cleanup | ✅ |
| 005 | `005_self_assessment_results_persistence.sql` | Assessment data | ✅ |
| 006 | `006_admin_booking_data_foundation.sql` | Consultations + slots base schema | ✅ |
| 007 | `007_admin_dashboard_read_policies.sql` | Admin read RLS | ✅ |
| 008 | `008_funnel_instrumentation.sql` | Funnel analytics | ✅ |
| 009 | `009_child_funnel_booking_columns.sql` | Child booking columns | ✅ |
| 010 | `010_anonymous_funnel_tracking.sql` | Anonymous tracking | ✅ |
| 011 | `011_sprint36_m2_reschedule.sql` | Reschedule columns + indexes | ✅ |
| 012 | `012_atomic_reschedule_transaction.sql` | Atomic reschedule RPC | ✅ |

## Dependency Analysis

### 011 depends on:
- `consultations` table (006)
- `consultation_slots` table (006)
- No circular dependency.

### 012 depends on:
- `consultations.lifecycle_version` column (011)
- `consultations.reschedule_count` column (011)
- `consultations.ownership_token` column (011)
- `consultation_slots.status` enum (006)
- No circular dependency.

## Rollback Feasibility

| Migration | Rollback Strategy | Notes |
|-----------|------------------|---------|
| 011 | `DROP COLUMN` for added columns; `DROP INDEX` for added indexes. | Downtime-free on Postgres 12+. |
| 012 | `DROP FUNCTION atomic_reschedule(...)` | Safe. No data mutation. |

## Existing Data Safety

- `lifecycle_version` backfill: `UPDATE consultations SET lifecycle_version = 1 WHERE lifecycle_version IS NULL` — already in 011.
- `reschedule_count` default: `DEFAULT 0 NOT NULL` — safe for all existing rows.
- `ownership_token`: nullable initially, populated at booking creation — no existing row corruption.

## No Circular Dependencies

All functions reference only base tables. No function calls another function. Confirmed no circular SQL dependency.

## RLS Policy Validity

Migrations 011 and 012 do NOT introduce new RLS policies. The `atomic_reschedule` RPC runs as `SECURITY DEFINER` (declared in 012) which bypasses RLS at the function boundary. Client-level RLS policies on `consultations` and `consultation_slots` remain unchanged and valid.
