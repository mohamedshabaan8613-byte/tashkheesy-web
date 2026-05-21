/**
 * useRealtimeBookingSync
 *
 * React hook that wires MultiTabRealtimeSync into the booking lifecycle.
 *
 * Responsibilities:
 *   • Subscribe to DB-level consultation changes on mount.
 *   • Detect stale local state when another tab mutates the same consultation.
 *   • Fetch authoritative state from DB on invalidation.
 *   • Expose stale UI warning banner state for consumer components.
 *   • Block mutations when client is behind server version.
 *   • Teardown channel on unmount (no leaks).
 *
 * Authority rules:
 *   • DB is the single source of truth. Never localStorage.
 *   • No alert(). No window.location.reload(). No force refresh hacks.
 *   • UI decisions (banner, block, redirect) are made by consumers.
 *
 * Layer: hooks
 * Depends on: reliability/MultiTabRealtimeSync, Supabase client.
 * Must NOT import: orchestrators, repositories, page components.
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { SupabaseClient }     from '@supabase/supabase-js';
import { MultiTabRealtimeSync, SyncInvalidationPayload } from '../reliability/MultiTabRealtimeSync';

export interface RealtimeSyncState {
  /** True while an authoritative refresh is in progress after invalidation. */
  isRefreshing: boolean;
  /** True if the client version is behind server — show stale banner. */
  isStale: boolean;
  /** The latest server version received from realtime or DB fetch. */
  serverVersion: number | null;
  /** The action that triggered the last invalidation. */
  lastAction: SyncInvalidationPayload['action'] | null;
  /** Dismiss the stale banner manually (e.g. after user acknowledges). */
  dismissStaleBanner: () => void;
  /** Imperatively re-fetch authoritative state. */
  forceRefresh: () => Promise<void>;
}

export interface UseRealtimeBookingSyncOptions {
  consultationId: string | null | undefined;
  clientVersion:  number | null | undefined;
  supabase:       SupabaseClient;
  /** Callback invoked with the latest consultation row on invalidation/refresh. */
  onAuthoritativeUpdate: (row: Record<string, unknown>) => void;
}

export function useRealtimeBookingSync({
  consultationId,
  clientVersion,
  supabase,
  onAuthoritativeUpdate,
}: UseRealtimeBookingSyncOptions): RealtimeSyncState {
  const syncRef     = useRef<MultiTabRealtimeSync | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isStale,      setIsStale]      = useState(false);
  const [serverVersion, setServerVersion] = useState<number | null>(null);
  const [lastAction,   setLastAction]   = useState<SyncInvalidationPayload['action'] | null>(null);

  // ----------------------------------------------------------------
  // Authoritative DB fetch — called on invalidation or manual refresh.
  // ----------------------------------------------------------------
  const fetchAuthoritativeState = useCallback(async () => {
    if (!consultationId) return;
    setIsRefreshing(true);
    try {
      const { data, error } = await supabase
        .from('consultations')
        .select('*')
        .eq('id', consultationId)
        .single();

      if (!error && data) {
        onAuthoritativeUpdate(data as Record<string, unknown>);
        const dbVersion = (data as Record<string, unknown>)['lifecycle_version'] as number;
        setServerVersion(dbVersion);
        // Clear stale flag only if clientVersion is now current.
        if (clientVersion !== null && clientVersion !== undefined && clientVersion >= dbVersion) {
          setIsStale(false);
        }
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [consultationId, supabase, onAuthoritativeUpdate, clientVersion]);

  // ----------------------------------------------------------------
  // Subscribe to realtime channel when consultationId is available.
  // ----------------------------------------------------------------
  useEffect(() => {
    if (!consultationId) return;

    // Create a new sync instance per consultation subscription.
    const sync = new MultiTabRealtimeSync(supabase);
    syncRef.current = sync;

    sync.subscribe(consultationId, (payload: SyncInvalidationPayload) => {
      const incomingVersion = payload.newServerVersion;
      setServerVersion(incomingVersion);
      setLastAction(payload.action);

      // Detect staleness: if client is behind the invalidation version.
      const currentClientVersion = clientVersion ?? 0;
      if (sync.isStale(currentClientVersion, incomingVersion)) {
        setIsStale(true);
        // Fetch authoritative state automatically on invalidation.
        fetchAuthoritativeState();
      }
    });

    return () => {
      sync.cleanup();
      syncRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [consultationId, supabase]);
  // NOTE: intentionally NOT including clientVersion/fetchAuthoritativeState
  // in deps — the channel subscription must not restart on every version tick.

  // ----------------------------------------------------------------
  // Stale detection on clientVersion change.
  // If the parent updates clientVersion after a refresh, clear the flag.
  // ----------------------------------------------------------------
  useEffect(() => {
    if (serverVersion === null || clientVersion === null || clientVersion === undefined) return;
    if (clientVersion >= serverVersion) {
      setIsStale(false);
    } else {
      setIsStale(true);
    }
  }, [clientVersion, serverVersion]);

  const dismissStaleBanner = useCallback(() => setIsStale(false), []);

  return {
    isRefreshing,
    isStale,
    serverVersion,
    lastAction,
    dismissStaleBanner,
    forceRefresh: fetchAuthoritativeState,
  };
}
