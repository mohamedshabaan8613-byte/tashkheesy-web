/**
 * reliability/index.ts — Sprint 3.4.3
 *
 * Public surface of the reliability module.
 * Import from here — do not import individual files directly.
 *
 * @example
 * import {
 *   useConfirmActionLock,
 *   validateLifecycleVersion,
 *   subscribeToBookingStorageEvents,
 *   broadcastBookingUpdate,
 *   checkSessionValidity,
 *   withReadRetry,
 * } from "../reliability";
 */

// 1. Confirm Action Lock
export type { ConfirmActionLock } from "./confirmActionLock";
export { createConfirmActionLock, useConfirmActionLock } from "./confirmActionLock";

// 2. Lifecycle Version Validator
export type { LifecycleVersion, VersionValidationResult } from "./lifecycleVersionValidator";
export {
  validateLifecycleVersion,
  extractVersionNumber,
  isNewerVersion,
  incrementVersion,
  LifecycleVersionGuard,
} from "./lifecycleVersionValidator";

// 3. Storage Event Sync
export type {
  BookingSyncEventType,
  BookingSyncPayload,
  StorageSyncHandler,
} from "./storageEventSync";
export {
  BOOKING_SYNC_KEY,
  broadcastBookingUpdate,
  subscribeToBookingStorageEvents,
  parseBookingSyncPayload,
} from "./storageEventSync";

// 4. Stale Session Invalidator
export type { InvalidationReason, InvalidationResult } from "./staleSessionInvalidator";
export {
  checkSessionValidity,
  buildInvalidationSummary,
  isSessionCorrupted,
} from "./staleSessionInvalidator";

// 5. Retry Policy — READ OPERATIONS ONLY
export type { RetryOptions, RetryResult } from "./retryPolicy";
export { withRetry, withReadRetry, isNetworkError } from "./retryPolicy";
