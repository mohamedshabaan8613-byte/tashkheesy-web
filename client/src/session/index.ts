/**
 * session/index.ts — Public API
 *
 * Sprint 3.7.1 Phase 1 + Phase 2
 */
export { BookingSessionStateMachine }        from "./BookingSessionStateMachine";
export type { SessionMachineState, SessionMachineEvent, SessionMutationType } from "./BookingSessionStateMachine";
export { SessionGuard }                       from "./SessionGuard";
export type { GuardCheckResult, GuardBlockedReason } from "./SessionGuard";
export { useSessionLifecycle }               from "./useSessionLifecycle";
export type { SessionLifecycleSnapshot }     from "./useSessionLifecycle";
