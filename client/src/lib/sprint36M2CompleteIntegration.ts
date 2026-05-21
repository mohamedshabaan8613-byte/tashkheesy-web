/**
 * Sprint 3.6 M2 — Complete Supabase Integration
 * 
 * This file implements all 4 priorities:
 * 1. Real Supabase Authoritative Checks (lifecycle_version)
 * 2. Real Reschedule Persistence Tests (Supabase dev environment)
 * 3. Reschedule Limits (reschedule_count, max_reschedules, cooldown)
 * 4. Multi-tab Real Sync (authoritative invalidation)
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ========================================
// 🔴 PRIORITY 1: Real Supabase Authoritative Checks
// ========================================

export interface VersionCheckResult {
  valid: boolean;
  currentVersion: number;
  attemptedVersion?: number;
  reason?: 'STALE_VERSION' | 'VERSION_MISMATCH' | 'NOT_FOUND';
}

export class SupabaseAuthoritativeVersionChecker {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  /**
   * Check lifecycle_version before ANY mutation
   * Usage: Call this in orchestrators before update/delete operations
   */
  async checkVersionBeforeMutation(
    consultationId: string,
    clientVersion: number
  ): Promise<VersionCheckResult> {
    try {
      // SELECT lifecycle_version FROM consultations WHERE id = ?
      const { data, error } = await this.supabase
        .from('consultations')
        .select('lifecycle_version')
        .eq('id', consultationId)
        .single();

      if (error || !data) {
        return {
          valid: false,
          currentVersion: 0,
          reason: 'NOT_FOUND',
        };
      }

      const serverVersion = data.lifecycle_version;

      // Reject stale writes
      if (clientVersion < serverVersion) {
        return {
          valid: false,
          currentVersion: serverVersion,
          attemptedVersion: clientVersion,
          reason: 'STALE_VERSION',
        };
      }

      if (clientVersion !== serverVersion) {
        return {
          valid: false,
          currentVersion: serverVersion,
          attemptedVersion: clientVersion,
          reason: 'VERSION_MISMATCH',
        };
      }

      return {
        valid: true,
        currentVersion: serverVersion,
      };
    } catch (error) {
      console.error('[VersionCheck] Error:', error);
      return {
        valid: false,
        currentVersion: 0,
        reason: 'NOT_FOUND',
      };
    }
  }

  /**
   * Update lifecycle_version after successful mutation
   */
  async incrementVersion(consultationId: string): Promise<number | null> {
    try {
      const { data, error } = await this.supabase.rpc('increment_lifecycle_version', {
        consultation_id: consultationId,
      });

      if (error) {
        console.error('[VersionCheck] Increment error:', error);
        return null;
      }

      return data as number;
    } catch (error) {
      console.error('[VersionCheck] Increment exception:', error);
      return null;
    }
  }
}

// ========================================
// 🔴 PRIORITY 2: Real Reschedule Persistence Tests
// ========================================

export interface RescheduleTestResult {
  success: boolean;
  error?: string;
  oldSlotReleased: boolean;
  newSlotReserved: boolean;
  dbUpdated: boolean;
  rollbackExecuted?: boolean;
}

export class RealReschedulePersistenceTester {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  /**
   * Test full reschedule persistence against Supabase dev environment
   * Steps:
   * 1. Reserve new slot
   * 2. Release old slot
   * 3. DB update
   * 4. Rollback on failure
   * 5. Concurrent updates protection
   */
  async testReschedulePersistence(
    consultationId: string,
    oldSlotId: string,
    newSlotId: string
  ): Promise<RescheduleTestResult> {
    let oldSlotReleased = false;
    let newSlotReserved = false;
    let dbUpdated = false;

    try {
      // Step 1: Reserve new slot
      const { error: reserveError } = await this.supabase
        .from('slots')
        .update({ status: 'RESERVED', consultation_id: consultationId })
        .eq('id', newSlotId)
        .eq('status', 'AVAILABLE'); // Optimistic locking

      if (reserveError) {
        return {
          success: false,
          error: 'NEW_SLOT_RESERVATION_FAILED',
          oldSlotReleased: false,
          newSlotReserved: false,
          dbUpdated: false,
        };
      }
      newSlotReserved = true;

      // Step 2: Release old slot
      const { error: releaseError } = await this.supabase
        .from('slots')
        .update({ status: 'AVAILABLE', consultation_id: null })
        .eq('id', oldSlotId);

      if (releaseError) {
        // Rollback: Release new slot
        await this.rollbackNewSlot(newSlotId);
        return {
          success: false,
          error: 'OLD_SLOT_RELEASE_FAILED',
          oldSlotReleased: false,
          newSlotReserved: true,
          dbUpdated: false,
          rollbackExecuted: true,
        };
      }
      oldSlotReleased = true;

      // Step 3: DB update (consultation record)
      const { error: updateError } = await this.supabase
        .from('consultations')
        .update({
          slot_id: newSlotId,
          rescheduled_at: new Date().toISOString(),
        })
        .eq('id', consultationId);

      if (updateError) {
        // Rollback: Release new slot, re-reserve old slot
        await this.rollbackFullReschedule(newSlotId, oldSlotId, consultationId);
        return {
          success: false,
          error: 'DB_UPDATE_FAILED',
          oldSlotReleased: true,
          newSlotReserved: true,
          dbUpdated: false,
          rollbackExecuted: true,
        };
      }
      dbUpdated = true;

      return {
        success: true,
        oldSlotReleased: true,
        newSlotReserved: true,
        dbUpdated: true,
      };
    } catch (error) {
      console.error('[ReschedulePersistence] Error:', error);

      // Attempt rollback
      if (newSlotReserved) {
        await this.rollbackFullReschedule(newSlotId, oldSlotId, consultationId);
      }

      return {
        success: false,
        error: 'EXCEPTION',
        oldSlotReleased,
        newSlotReserved,
        dbUpdated,
        rollbackExecuted: true,
      };
    }
  }

  private async rollbackNewSlot(newSlotId: string): Promise<void> {
    await this.supabase
      .from('slots')
      .update({ status: 'AVAILABLE', consultation_id: null })
      .eq('id', newSlotId);
  }

  private async rollbackFullReschedule(
    newSlotId: string,
    oldSlotId: string,
    consultationId: string
  ): Promise<void> {
    // Release new slot
    await this.rollbackNewSlot(newSlotId);

    // Re-reserve old slot
    await this.supabase
      .from('slots')
      .update({ status: 'RESERVED', consultation_id: consultationId })
      .eq('id', oldSlotId);
  }

  /**
   * Test concurrent updates protection
   */
  async testConcurrentUpdates(
    consultationId: string,
    slotId1: string,
    slotId2: string
  ): Promise<boolean> {
    // Simulate two concurrent reschedule attempts
    const [result1, result2] = await Promise.all([
      this.testReschedulePersistence(consultationId, slotId1, slotId2),
      this.testReschedulePersistence(consultationId, slotId1, slotId2),
    ]);

    // Only ONE should succeed
    const successCount = [result1.success, result2.success].filter(Boolean).length;
    return successCount === 1;
  }
}

// ========================================
// 🔴 PRIORITY 3: Reschedule Limits
// ========================================

export interface RescheduleLimitsConfig {
  maxReschedules: number;
  cooldownWindowMs: number;
}

export interface RescheduleLimitCheckResult {
  allowed: boolean;
  reason?: 'MAX_RESCHEDULES_REACHED' | 'COOLDOWN_ACTIVE' | 'INVALID_STATE';
  remainingReschedules?: number;
  cooldownEndsAt?: Date;
}

export class RescheduleLimitsGuard {
  private supabase: SupabaseClient;
  private config: RescheduleLimitsConfig;

  constructor(supabase: SupabaseClient, config: RescheduleLimitsConfig) {
    this.supabase = supabase;
    this.config = config;
  }

  /**
   * Check if reschedule is allowed based on limits
   * Business-critical: Prevents abuse and ensures fair usage
   */
  async checkRescheduleLimits(
    consultationId: string
  ): Promise<RescheduleLimitCheckResult> {
    try {
      // Fetch consultation with reschedule metadata
      const { data, error } = await this.supabase
        .from('consultations')
        .select('reschedule_count, last_rescheduled_at, status')
        .eq('id', consultationId)
        .single();

      if (error || !data) {
        return {
          allowed: false,
          reason: 'INVALID_STATE',
        };
      }

      // Check 1: Max reschedules reached?
      const currentCount = data.reschedule_count || 0;
      if (currentCount >= this.config.maxReschedules) {
        return {
          allowed: false,
          reason: 'MAX_RESCHEDULES_REACHED',
          remainingReschedules: 0,
        };
      }

      // Check 2: Cooldown window active?
      if (data.last_rescheduled_at) {
        const lastReschedule = new Date(data.last_rescheduled_at).getTime();
        const now = Date.now();
        const timeSinceLastReschedule = now - lastReschedule;

        if (timeSinceLastReschedule < this.config.cooldownWindowMs) {
          const cooldownEndsAt = new Date(lastReschedule + this.config.cooldownWindowMs);
          return {
            allowed: false,
            reason: 'COOLDOWN_ACTIVE',
            cooldownEndsAt,
          };
        }
      }

      return {
        allowed: true,
        remainingReschedules: this.config.maxReschedules - currentCount - 1,
      };
    } catch (error) {
      console.error('[RescheduleLimits] Check error:', error);
      return {
        allowed: false,
        reason: 'INVALID_STATE',
      };
    }
  }

  /**
   * Increment reschedule count after successful reschedule
   */
  async incrementRescheduleCount(consultationId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('consultations')
        .update({
          reschedule_count: this.supabase.rpc('increment_reschedule_count'),
          last_rescheduled_at: new Date().toISOString(),
        })
        .eq('id', consultationId);

      return !error;
    } catch (error) {
      console.error('[RescheduleLimits] Increment error:', error);
      return false;
    }
  }
}

// ========================================
// 🔴 PRIORITY 4: Multi-tab Real Sync
// ========================================

export interface SyncInvalidationPayload {
  consultationId: string;
  newVersion: number;
  action: 'RESCHEDULED' | 'CANCELLED' | 'UPDATED';
  timestamp: number;
}

export class MultiTabRealtimeSync {
  private supabase: SupabaseClient;
  private channel: any;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  /**
   * Setup real-time sync channel for authoritative invalidation
   * All tabs listen to this channel and force refresh on stale UI
   */
  setupSyncChannel(consultationId: string, onInvalidate: (payload: SyncInvalidationPayload) => void) {
    this.channel = this.supabase
      .channel(`consultation-sync:${consultationId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'consultations',
          filter: `id=eq.${consultationId}`,
        },
        (payload: any) => {
          // Authoritative invalidation
          const syncPayload: SyncInvalidationPayload = {
            consultationId,
            newVersion: payload.new.lifecycle_version,
            action: this.determineAction(payload.new, payload.old),
            timestamp: Date.now(),
          };

          console.log('[MultiTabSync] Received update:', syncPayload);
          onInvalidate(syncPayload);
        }
      )
      .subscribe();

    return this.channel;
  }

  /**
   * Broadcast invalidation to all tabs
   */
  async broadcastInvalidation(payload: SyncInvalidationPayload): Promise<void> {
    if (!this.channel) {
      console.warn('[MultiTabSync] Channel not initialized');
      return;
    }

    await this.channel.send({
      type: 'broadcast',
      event: 'invalidate',
      payload,
    });
  }

  /**
   * Force session refresh on stale UI
   * Called when current tab's version doesn't match server
   */
  forceSessionRefresh(consultationId: string, serverVersion: number): void {
    console.warn(
      `[MultiTabSync] Stale UI detected. Server version: ${serverVersion}. Forcing refresh...`
    );

    // Store sync event for debugging
    const syncEvent = {
      type: 'FORCED_REFRESH',
      consultationId,
      serverVersion,
      timestamp: new Date().toISOString(),
      reason: 'VERSION_MISMATCH',
    };

    localStorage.setItem(
      `sync-event:${consultationId}`,
      JSON.stringify(syncEvent)
    );

    // Trigger UI refresh (implementation depends on React state management)
    window.dispatchEvent(
      new CustomEvent('consultation-sync-invalidate', {
        detail: { consultationId, serverVersion },
      })
    );
  }

  /**
   * Stale UI rejection - block mutations from stale tabs
   */
  rejectStaleMutation(clientVersion: number, serverVersion: number): boolean {
    if (clientVersion < serverVersion) {
      console.error(
        `[MultiTabSync] REJECTED stale mutation. Client: ${clientVersion}, Server: ${serverVersion}`
      );

      // Show user notification
      this.showStaleUINotification();

      return true; // Mutation rejected
    }

    return false; // Mutation allowed
  }

  private determineAction(newData: any, oldData: any): 'RESCHEDULED' | 'CANCELLED' | 'UPDATED' {
    if (newData.status === 'CANCELLED' && oldData.status !== 'CANCELLED') {
      return 'CANCELLED';
    }
    if (newData.slot_id !== oldData.slot_id) {
      return 'RESCHEDULED';
    }
    return 'UPDATED';
  }

  private showStaleUINotification(): void {
    // Implementation depends on UI framework
    alert(
      'تم تحديث الجلسة من تبويب آخر. سيتم تحديث الصفحة تلقائياً...'
    );
    window.location.reload();
  }

  /**
   * Cleanup channel on unmount
   */
  cleanup(): void {
    if (this.channel) {
      this.supabase.removeChannel(this.channel);
      this.channel = null;
    }
  }
}

// ========================================
// Integrated Usage Example
// ========================================

export class Sprint36M2IntegratedOrchestrator {
  private versionChecker: SupabaseAuthoritativeVersionChecker;
  private persistenceTester: RealReschedulePersistenceTester;
  private limitsGuard: RescheduleLimitsGuard;
  private multiTabSync: MultiTabRealtimeSync;

  constructor(supabase: SupabaseClient) {
    this.versionChecker = new SupabaseAuthoritativeVersionChecker(supabase);
    this.persistenceTester = new RealReschedulePersistenceTester(supabase);
    this.limitsGuard = new RescheduleLimitsGuard(supabase, {
      maxReschedules: 3,
      cooldownWindowMs: 24 * 60 * 60 * 1000, // 24 hours
    });
    this.multiTabSync = new MultiTabRealtimeSync(supabase);
  }

  /**
   * Complete reschedule flow with all 4 priorities
   */
  async rescheduleWithFullProtection(
    consultationId: string,
    oldSlotId: string,
    newSlotId: string,
    clientVersion: number
  ): Promise<{ success: boolean; error?: string }> {
    // Priority 1: Check version BEFORE mutation
    const versionCheck = await this.versionChecker.checkVersionBeforeMutation(
      consultationId,
      clientVersion
    );

    if (!versionCheck.valid) {
      // Priority 4: Reject stale mutation
      this.multiTabSync.forceSessionRefresh(
        consultationId,
        versionCheck.currentVersion
      );

      return {
        success: false,
        error: `VERSION_CHECK_FAILED: ${versionCheck.reason}`,
      };
    }

    // Priority 3: Check reschedule limits
    const limitsCheck = await this.limitsGuard.checkRescheduleLimits(consultationId);

    if (!limitsCheck.allowed) {
      return {
        success: false,
        error: `LIMITS_CHECK_FAILED: ${limitsCheck.reason}`,
      };
    }

    // Priority 2: Execute reschedule with persistence tests
    const rescheduleResult = await this.persistenceTester.testReschedulePersistence(
      consultationId,
      oldSlotId,
      newSlotId
    );

    if (!rescheduleResult.success) {
      return {
        success: false,
        error: `PERSISTENCE_FAILED: ${rescheduleResult.error}`,
      };
    }

    // Priority 3: Increment reschedule count
    await this.limitsGuard.incrementRescheduleCount(consultationId);

    // Priority 1: Increment version
    const newVersion = await this.versionChecker.incrementVersion(consultationId);

    // Priority 4: Broadcast invalidation to other tabs
    if (newVersion) {
      await this.multiTabSync.broadcastInvalidation({
        consultationId,
        newVersion,
        action: 'RESCHEDULED',
        timestamp: Date.now(),
      });
    }

    return { success: true };
  }
}
