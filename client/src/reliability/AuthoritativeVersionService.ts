/**
 * AuthoritativeVersionService
 *
 * Single responsibility: DB-authoritative lifecycle_version enforcement.
 * — Reads version from DB before ANY mutation (never trusts client session).
 * — Rejects stale writes with typed rejection reasons.
 * — Increments version post-mutation via RPC (DB-driven, not local++).
 *
 * Layer: reliability
 * Depends on: Supabase client only.
 * Must NOT import: orchestrators, repositories, React, UI.
 */

import { SupabaseClient } from '@supabase/supabase-js';

export type VersionRejectionReason =
  | 'STALE_VERSION'
  | 'VERSION_MISMATCH'
  | 'NOT_FOUND'
  | 'DB_ERROR';

export interface VersionCheckResult {
  valid: boolean;
  serverVersion: number;
  clientVersion?: number;
  rejectionReason?: VersionRejectionReason;
}

export class AuthoritativeVersionService {
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Authoritative pre-mutation check.
   * MUST be called before any consultation mutation.
   * Reads lifecycle_version directly from DB — never from session cache.
   */
  async assertVersionBeforeMutation(
    consultationId: string,
    clientVersion: number
  ): Promise<VersionCheckResult> {
    const { data, error } = await this.supabase
      .from('consultations')
      .select('lifecycle_version')
      .eq('id', consultationId)
      .single();

    if (error || !data) {
      return {
        valid: false,
        serverVersion: 0,
        clientVersion,
        rejectionReason: 'NOT_FOUND',
      };
    }

    const serverVersion: number = data.lifecycle_version;

    if (clientVersion < serverVersion) {
      return {
        valid: false,
        serverVersion,
        clientVersion,
        rejectionReason: 'STALE_VERSION',
      };
    }

    if (clientVersion !== serverVersion) {
      return {
        valid: false,
        serverVersion,
        clientVersion,
        rejectionReason: 'VERSION_MISMATCH',
      };
    }

    return { valid: true, serverVersion };
  }

  /**
   * DB-driven version increment.
   * Calls increment_lifecycle_version RPC — NOT a local counter.
   * Returns new server version, or null on failure.
   */
  async incrementServerVersion(consultationId: string): Promise<number | null> {
    const { data, error } = await this.supabase.rpc('increment_lifecycle_version', {
      consultation_id: consultationId,
    });

    if (error) {
      console.error('[AuthoritativeVersionService] increment_lifecycle_version failed:', error.message);
      return null;
    }

    return data as number;
  }
}
