/**
 * RescheduleLimitsGuard
 *
 * Single responsibility: Business-rule enforcement for reschedule eligibility.
 * — Reads reschedule_count and last_rescheduled_at from DB authoritatively.
 * — Enforces max_reschedules cap and cooldown window.
 * — Increments count via RPC (NOT a client-side update with embedded rpc call).
 *
 * CRITICAL BUG FIXED from sprint36M2CompleteIntegration.ts:
 *   BEFORE (broken):
 *     .update({ reschedule_count: this.supabase.rpc('increment_reschedule_count') })
 *     This passes a Promise as a column value — invalid, silently corrupts the DB row.
 *   AFTER (correct):
 *     this.supabase.rpc('increment_reschedule_count', { consultation_id })
 *     Direct RPC call that runs the PL/pgSQL function server-side.
 *
 * Layer: reliability
 * Depends on: Supabase client only.
 * Must NOT import: orchestrators, repositories, React, UI.
 */

import { SupabaseClient } from '@supabase/supabase-js';

export interface RescheduleLimitsConfig {
  maxReschedules: number;
  cooldownWindowMs: number;
}

export type LimitRejectionReason =
  | 'MAX_RESCHEDULES_REACHED'
  | 'COOLDOWN_ACTIVE'
  | 'INVALID_STATE';

export interface RescheduleLimitCheckResult {
  allowed: boolean;
  rejectionReason?: LimitRejectionReason;
  remainingReschedules?: number;
  cooldownEndsAt?: Date;
}

export class RescheduleLimitsGuard {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly config: RescheduleLimitsConfig
  ) {}

  /**
   * DB-authoritative check — reads current limits from consultations row.
   * Must be called before executing any reschedule mutation.
   */
  async assertReschedulable(consultationId: string): Promise<RescheduleLimitCheckResult> {
    const { data, error } = await this.supabase
      .from('consultations')
      .select('reschedule_count, last_rescheduled_at, max_reschedules')
      .eq('id', consultationId)
      .single();

    if (error || !data) {
      return { allowed: false, rejectionReason: 'INVALID_STATE' };
    }

    const effectiveMax = data.max_reschedules ?? this.config.maxReschedules;
    const currentCount: number = data.reschedule_count ?? 0;

    if (currentCount >= effectiveMax) {
      return {
        allowed: false,
        rejectionReason: 'MAX_RESCHEDULES_REACHED',
        remainingReschedules: 0,
      };
    }

    if (data.last_rescheduled_at) {
      const lastMs = new Date(data.last_rescheduled_at).getTime();
      const elapsed = Date.now() - lastMs;

      if (elapsed < this.config.cooldownWindowMs) {
        return {
          allowed: false,
          rejectionReason: 'COOLDOWN_ACTIVE',
          cooldownEndsAt: new Date(lastMs + this.config.cooldownWindowMs),
        };
      }
    }

    return {
      allowed: true,
      remainingReschedules: effectiveMax - currentCount - 1,
    };
  }

  /**
   * Increment reschedule counter via server-side RPC.
   * MUST be called only after a verified successful reschedule persist.
   *
   * Uses direct .rpc() call — NOT .update({ reschedule_count: supabase.rpc(...) })
   * which was the critical bug in the original implementation.
   */
  async incrementRescheduleCount(consultationId: string): Promise<boolean> {
    const { error } = await this.supabase.rpc('increment_reschedule_count', {
      consultation_id: consultationId,
    });

    if (error) {
      console.error('[RescheduleLimitsGuard] increment_reschedule_count failed:', error.message);
      return false;
    }

    return true;
  }
}
