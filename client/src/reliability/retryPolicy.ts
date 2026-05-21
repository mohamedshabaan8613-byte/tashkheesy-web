/**
 * retryPolicy.ts — Sprint 3.4.3
 *
 * PURPOSE:
 *   Lightweight retry wrapper for transient failures in READ operations.
 *
 * CRITICAL SCOPE CONSTRAINT:
 *   ✅ USE for: reservation fetch, recoverable reads, transient network errors
 *   ❌ NEVER USE for: confirm booking mutations, payment operations
 *
 * REASON FOR CONSTRAINT:
 *   Retrying a mutation (confirm, cancel, reschedule) on a transient failure
 *   risks duplicate side-effects (double booking, double charge).
 *   Server-side idempotency keys are the correct solution for mutations.
 *   This module intentionally does not support mutation retry.
 *
 * DESIGN:
 *   - Exponential backoff with jitter (prevents thundering herd)
 *   - Configurable attempts, base delay, max delay
 *   - Abortable via AbortSignal
 *   - Returns typed RetryResult — no exceptions bubble up
 *   - Retry predicate: callers decide which errors are retryable
 *
 * USAGE:
 *   const result = await withRetry(
 *     () => fetchSlotReservation(slotId),
 *     { attempts: 3, baseDelayMs: 300 },
 *   );
 *   if (result.success) {
 *     // use result.value
 *   } else {
 *     // result.lastError — final error after all attempts exhausted
 *   }
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface RetryOptions {
  /**
   * Maximum number of attempts (including the first call).
   * Default: 3
   */
  attempts?: number;

  /**
   * Base delay in ms for the first retry.
   * Subsequent retries use exponential backoff: baseDelay * 2^attempt + jitter
   * Default: 300ms
   */
  baseDelayMs?: number;

  /**
   * Maximum delay cap in ms (prevents runaway backoff).
   * Default: 5000ms
   */
  maxDelayMs?: number;

  /**
   * Optional AbortSignal — cancels remaining retries when aborted.
   */
  signal?: AbortSignal;

  /**
   * Predicate to decide if a caught error is retryable.
   * Return true → retry. Return false → fail immediately.
   * Default: always retry (all errors treated as transient).
   */
  isRetryable?: (error: unknown) => boolean;

  /**
   * Optional callback for observability (dev logging, metrics).
   * Called before each retry with the attempt number and error.
   */
  onRetry?: (attempt: number, error: unknown) => void;
}

export type RetryResult<T> =
  | { success: true; value: T; attempts: number }
  | { success: false; lastError: unknown; attempts: number };

// ─── Core implementation ──────────────────────────────────────────────────────

/**
 * withRetry
 *
 * Executes `fn` up to `options.attempts` times with exponential backoff + jitter.
 * Returns a typed RetryResult — never throws.
 *
 * ⚠️ READ-ONLY OPERATIONS ONLY. Do not use for confirm/cancel/reschedule mutations.
 *
 * @example
 * const result = await withRetry(
 *   () => supabase.from("consultation_slots").select("*").eq("id", slotId).single(),
 *   { attempts: 3, baseDelayMs: 300, maxDelayMs: 3000 },
 * );
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<RetryResult<T>> {
  const {
    attempts = 3,
    baseDelayMs = 300,
    maxDelayMs = 5000,
    signal,
    isRetryable = () => true,
    onRetry,
  } = options;

  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    // Check abort before attempting
    if (signal?.aborted) {
      return { success: false, lastError: new DOMException("Aborted", "AbortError"), attempts: attempt - 1 };
    }

    try {
      const value = await fn();
      return { success: true, value, attempts: attempt };
    } catch (err) {
      lastError = err;

      // Non-retryable error — fail immediately
      if (!isRetryable(err)) {
        return { success: false, lastError: err, attempts: attempt };
      }

      // Last attempt — don't wait, just return failure
      if (attempt === attempts) break;

      // Notify observer
      onRetry?.(attempt, err);

      // Exponential backoff with jitter
      const exponential = baseDelayMs * Math.pow(2, attempt - 1);
      const jitter = Math.random() * baseDelayMs * 0.5;
      const delay = Math.min(exponential + jitter, maxDelayMs);

      await sleep(delay, signal);
    }
  }

  return { success: false, lastError, attempts };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * sleep
 *
 * Promise-based delay. Resolves early if signal is aborted.
 */
function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });
}

/**
 * isNetworkError
 *
 * Common retryable error predicate for Supabase / fetch responses.
 * Pass as `isRetryable` option.
 *
 * @example
 * await withRetry(fn, { isRetryable: isNetworkError });
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError && error.message.includes("fetch")) return true;
  if (error instanceof DOMException && error.name === "AbortError") return false; // don't retry aborts
  if (typeof error === "object" && error !== null) {
    // Supabase error shape: { code: string, message: string }
    const code = (error as Record<string, unknown>).code;
    if (typeof code === "string") {
      // Retry on rate limit, timeout, unavailable
      return ["PGRST301", "ETIMEDOUT", "ECONNRESET", "503", "429"].includes(code);
    }
  }
  return false;
}

/**
 * withReadRetry
 *
 * Convenience wrapper with READ-optimized defaults.
 * Named explicitly to reinforce the constraint: reads only.
 *
 * @example
 * const result = await withReadRetry(() => fetchSlotAvailability(slotId));
 */
export async function withReadRetry<T>(fn: () => Promise<T>): Promise<RetryResult<T>> {
  return withRetry(fn, {
    attempts: 3,
    baseDelayMs: 300,
    maxDelayMs: 3000,
    isRetryable: isNetworkError,
    onRetry: (attempt, err) => {
      if (process.env.NODE_ENV !== "production") {
        console.warn(`[retryPolicy] Read retry attempt ${attempt}:`, err);
      }
    },
  });
}
