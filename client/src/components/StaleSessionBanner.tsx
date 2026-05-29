/**
 * StaleSessionBanner
 *
 * Non-blocking UI warning displayed when the client detects that its
 * local consultation state is behind the authoritative server version.
 *
 * This replaces all previous alert() / window.location.reload() patterns.
 *
 * Rules:
 *   • Never redirects automatically.
 *   • Never blocks the page.
 *   • Provides a "Refresh" CTA that triggers an authoritative DB fetch.
 *   • Can be dismissed without refreshing.
 *
 * Layer: components (presentation only)
 * Depends on: nothing outside React + Tailwind.
 */

import React from 'react';

export interface StaleSessionBannerProps {
  /** Whether to show the banner at all. */
  visible: boolean;
  /** Action type that triggered the stale state. */
  action?: 'RESCHEDULED' | 'CANCELLED' | 'UPDATED' | null;
  /** Whether an authoritative refresh is currently in progress. */
  isRefreshing?: boolean;
  /** Called when user clicks “Refresh”. */
  onRefresh: () => void;
  /** Called when user dismisses the banner. */
  onDismiss: () => void;
}

const ACTION_MESSAGES: Record<string, string> = {
  RESCHEDULED: 'This consultation was rescheduled in another tab.',
  CANCELLED:   'This consultation was cancelled in another tab.',
  UPDATED:     'This consultation was updated in another tab.',
};

export const StaleSessionBanner: React.FC<StaleSessionBannerProps> = ({
  visible,
  action,
  isRefreshing = false,
  onRefresh,
  onDismiss,
}) => {
  if (!visible) return null;

  const message = (action && ACTION_MESSAGES[action])
    ?? 'Your booking state may be out of date.';

  return (
    <div
      role="alert"
      aria-live="polite"
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3
                 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 shadow-md
                 text-sm text-amber-900 max-w-md w-full mx-4"
    >
      {/* Warning icon */}
      <svg
        className="h-5 w-5 shrink-0 text-amber-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
        />
      </svg>

      {/* Message */}
      <span className="flex-1">{message}</span>

      {/* Refresh CTA */}
      <button
        onClick={onRefresh}
        disabled={isRefreshing}
        className="shrink-0 rounded-md bg-amber-100 px-3 py-1.5 text-xs font-semibold
                   text-amber-800 hover:bg-amber-200 disabled:opacity-50
                   transition-colors duration-150"
        aria-label="Refresh consultation state"
      >
        {isRefreshing ? 'Refreshing…' : 'Refresh'}
      </button>

      {/* Dismiss */}
      <button
        onClick={onDismiss}
        className="shrink-0 rounded-md p-1 text-amber-600 hover:bg-amber-100
                   transition-colors duration-150"
        aria-label="Dismiss stale session warning"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24"
          stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export default StaleSessionBanner;
