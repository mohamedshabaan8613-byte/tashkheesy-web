/**
 * ConsultationBookingRepository.ts — Sprint 3.1 Priority 2 (updated pre-P3)
 *
 * Implementation باستخدام sessionStorage.
 * الجلسة تعيش خارج React state.
 *
 * التحديث pre-P3:
 * - setActive() / getActiveId() / loadActive() / clearActive()
 * - invalidate() تستخدم BookingRecoveryReason taxonomy
 * - loadLatest() تعتمد activeBookingSessionId أولاً
 *
 * Sprint 3.3 Safety Audit — Phase 1:
 * - invalidate(): JSON.parse محاط بـ try/catch لضمان سلامة corrupted payloads
 */

import type {
  BookingRecoveryReason,
  ConsultationBookingRepository,
  ConsultationBookingSession,
} from "../types/consultationBookingTypes";
import { isSessionExpired } from "../types/consultationBookingTypes";

const STORAGE_KEY  = "tashkheesy:cbs";          // consultation_booking_session
const ACTIVE_KEY   = "tashkheesy:cbs_active_id"; // activeBookingSessionId — صريح

class SessionStorageBookingRepository implements ConsultationBookingRepository {

  // ── save ──────────────────────────────────────────────────
  save(session: ConsultationBookingSession): void {
    try {
      sessionStorage.setItem(
        `${STORAGE_KEY}:${session.sessionId}`,
        JSON.stringify(session)
      );
    } catch (err) {
      console.warn("[BookingRepo] save failed:", err);
    }
  }

  // ── load ──────────────────────────────────────────────────
  load(sessionId: string): ConsultationBookingSession | null {
    try {
      const raw = sessionStorage.getItem(`${STORAGE_KEY}:${sessionId}`);
      if (!raw) return null;

      const session: ConsultationBookingSession = JSON.parse(raw);

      if (isSessionExpired(session)) {
        this.invalidate(sessionId, "ttl_expired");
        return null;
      }

      return session;
    } catch {
      return null;
    }
  }

  // ── setActive ────────────────────────────────────────────
  /** يحدد activeBookingSessionId صراحةً. يُستدعى بعد save() مباشرة. */
  setActive(sessionId: string): void {
    try {
      sessionStorage.setItem(ACTIVE_KEY, sessionId);
    } catch (err) {
      console.warn("[BookingRepo] setActive failed:", err);
    }
  }

  // ── getActiveId ───────────────────────────────────────────
  getActiveId(): string | null {
    try {
      return sessionStorage.getItem(ACTIVE_KEY);
    } catch {
      return null;
    }
  }

  // ── loadActive ────────────────────────────────────────────
  /** يحمِّل الجلسة النشطة بواسطة activeBookingSessionId — هذا مصدر الحقيقة */
  loadActive(): ConsultationBookingSession | null {
    const activeId = this.getActiveId();
    if (!activeId) return null;
    return this.load(activeId);
  }

  // ── loadLatest (alias لـ loadActive) ────────────────────────
  /**
   * ‹legacy alias› يتحوّل إلى loadActive().
   * تجنّب استخدامه في كود جديد — استخدم loadActive() بدلاً.
   */
  loadLatest(): ConsultationBookingSession | null {
    return this.loadActive();
  }

  // ── invalidate ────────────────────────────────────────────
  /**
   * يُبطل الجلسة ويحتفظ بسجل السبب (BookingRecoveryReason) للـ audit.
   * يتقبل taxonomy موحد بدل string حر.
   *
   * Sprint 3.3 Phase 1 Fix:
   *   JSON.parse محاط بـ try/catch منفصل.
   *   Corrupted payload → active pointer يُمسح فورًا، ولا crash.
   */
  invalidate(sessionId: string, reason: BookingRecoveryReason): void {
    try {
      const key = `${STORAGE_KEY}:${sessionId}`;
      const raw = sessionStorage.getItem(key);

      if (raw) {
        // ── Sprint 3.3 Phase 1: حماية JSON.parse من corrupted payloads ──────
        let session: ConsultationBookingSession;
        try {
          session = JSON.parse(raw);
        } catch {
          // Payload فاسد — امسح المؤشر النشط وابتعد بأمان.
          // لا تترك active pointer يشير لجلسة لا يمكن قراءتها.
          if (process.env.NODE_ENV === "development") {
            console.warn(
              "[BookingRepo] invalidate: corrupted payload for",
              sessionId,
              "— clearing active pointer",
            );
          }
          if (this.getActiveId() === sessionId) {
            this.clearActive();
          }
          return;
        }

        const invalidated: ConsultationBookingSession = {
          ...session,
          bookingFlowPhase: "EXPIRED",
          bookingStatus: "EXPIRED",
          recoveryState: {
            ...session.recoveryState,
            status: "invalidated",
            reason,                          // taxonomy موحد
            auditNote: `invalidated at ${new Date().toISOString()} — reason: ${reason}`,
          },
        };
        sessionStorage.setItem(key, JSON.stringify(invalidated));
      }

      if (this.getActiveId() === sessionId) {
        this.clearActive();
      }
    } catch (err) {
      console.warn("[BookingRepo] invalidate failed:", err);
    }
  }

  // ── clearActive ───────────────────────────────────────────
  /** يزيل activeBookingSessionId فقط بدون حذف بيانات الجلسة */
  clearActive(): void {
    try {
      sessionStorage.removeItem(ACTIVE_KEY);
    } catch (err) {
      console.warn("[BookingRepo] clearActive failed:", err);
    }
  }

  // ── clear (all sessions) ──────────────────────────────────
  clear(): void {
    try {
      const keys: string[] = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key?.startsWith(STORAGE_KEY)) keys.push(key);
      }
      keys.forEach(k => sessionStorage.removeItem(k));
      sessionStorage.removeItem(ACTIVE_KEY);
    } catch (err) {
      console.warn("[BookingRepo] clear failed:", err);
    }
  }
}

/** Singleton — instance واحد في كل التطبيق */
export const consultationBookingRepository: ConsultationBookingRepository =
  new SessionStorageBookingRepository();
