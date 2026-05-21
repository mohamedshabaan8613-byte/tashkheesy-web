/**
 * MultiTabRealtimeSync
 *
 * Single responsibility: Supabase Realtime channel subscription for
 * authoritative multi-tab invalidation.
 *
 * Contracts:
 * — emits typed SyncInvalidationPayload on DB-level UPDATE events.
 * — does NOT own UI decisions (no alert, no window.location.reload).
 * — does NOT use localStorage (sandbox-unsafe and not authoritative).
 * — consumers (React components/hooks) decide how to handle invalidation.
 * — exposes broadcastInvalidation for post-mutation fan-out.
 * — exposes cleanup() for React useEffect teardown.
 *
 * Layer: reliability
 * Depends on: Supabase client only.
 * Must NOT import: orchestrators, repositories, React state, UI components.
 */

import { SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';

export type SyncAction = 'RESCHEDULED' | 'CANCELLED' | 'UPDATED';

export interface SyncInvalidationPayload {
  consultationId: string;
  newServerVersion: number;
  action: SyncAction;
  timestamp: number;
}

export type OnInvalidateCallback = (payload: SyncInvalidationPayload) => void;

export class MultiTabRealtimeSync {
  private channel: RealtimeChannel | null = null;

  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Subscribe to DB-level consultation changes.
   * Calls onInvalidate on every server-side UPDATE.
   * Consumer is responsible for UI response (refresh, block mutation, etc.).
   */
  subscribe(consultationId: string, onInvalidate: OnInvalidateCallback): void {
    this.cleanup();

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
        (payload: { new: Record<string, unknown>; old: Record<string, unknown> }) => {
          onInvalidate({
            consultationId,
            newServerVersion: payload.new['lifecycle_version'] as number,
            action: this.resolveAction(payload.new, payload.old),
            timestamp: Date.now(),
          });
        }
      )
      .subscribe();
  }

  /**
   * Broadcast post-mutation invalidation to peer tabs.
   * Call after a successful reschedule to propagate the new version.
   */
  async broadcastInvalidation(payload: SyncInvalidationPayload): Promise<void> {
    if (!this.channel) {
      console.warn('[MultiTabRealtimeSync] broadcastInvalidation called before subscribe(). Skipping.');
      return;
    }

    await this.channel.send({
      type: 'broadcast',
      event: 'invalidate',
      payload,
    });
  }

  /**
   * Returns true if the client version is behind server — mutation should be blocked.
   * UI decision (prompt, redirect, re-fetch) remains with the caller.
   */
  isStale(clientVersion: number, serverVersion: number): boolean {
    return clientVersion < serverVersion;
  }

  /**
   * Teardown channel. Call in React useEffect cleanup or component unmount.
   */
  cleanup(): void {
    if (this.channel) {
      this.supabase.removeChannel(this.channel);
      this.channel = null;
    }
  }

  private resolveAction(
    next: Record<string, unknown>,
    prev: Record<string, unknown>
  ): SyncAction {
    if (next['status'] === 'CANCELLED' && prev['status'] !== 'CANCELLED') return 'CANCELLED';
    if (next['slot_id'] !== prev['slot_id']) return 'RESCHEDULED';
    return 'UPDATED';
  }
}
