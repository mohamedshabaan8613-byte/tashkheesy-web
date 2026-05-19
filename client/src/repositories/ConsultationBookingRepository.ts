/**
 * ConsultationBookingRepository.ts — Sprint 3.1 Priority 2
 *
 * Implementation باستخدام sessionStorage.
 * الجلسة تعيش خارج React state — تبقى عند page refresh.
 *
 * التصميم المقصود:
 * - الواجهة ثابتة (ConsultationBookingRepository interface)
 * - الـ implementation قابلة للتبديل إلى Supabase دون تغيير API
 * - TTL: 2 ساعة — auto-expire عند load
 */

import type {
  ConsultationBookingSession,
  ConsultationBookingRepository,
} from "../types/consultationBookingTypes";
import { isSessionExpired } from "../types/consultationBookingTypes";

const STORAGE_KEY = "tashkheesy:consultation_booking_session";
const LATEST_KEY  = "tashkheesy:consultation_booking_latest_id";

// ─── SessionStorage Implementation ───────────────────────────────────────
class SessionStorageBookingRepository implements ConsultationBookingRepository {
  /**
   * يحفظ الجلسة في sessionStorage ويسجّل sessionId كـ latest.
   */
  save(session: ConsultationBookingSession): void {
    try {
      const key = `${STORAGE_KEY}:${session.sessionId}`;
      sessionStorage.setItem(key, JSON.stringify(session));
      sessionStorage.setItem(LATEST_KEY, session.sessionId);
    } catch (err) {
      // sessionStorage ممكن يكون ممتلئ أو محجوب في بعض البيئات
      console.warn("[BookingRepository] Failed to save session:", err);
    }
  }

  /**
   * يُحمِّل جلسة بواسطة sessionId.
   * يُعيد null إذا انتهت صلاحيتها ويحذفها تلقائيًا.
   */
  load(sessionId: string): ConsultationBookingSession | null {
    try {
      const key = `${STORAGE_KEY}:${sessionId}`;
      const raw = sessionStorage.getItem(key);
      if (!raw) return null;

      const session: ConsultationBookingSession = JSON.parse(raw);

      // Auto-expire
      if (isSessionExpired(session)) {
        this.invalidate(sessionId, "TTL_EXPIRED");
        return null;
      }

      return session;
    } catch {
      return null;
    }
  }

  /**
   * يُحمِّل آخر جلسة نشطة.
   * يُستخدم عند العودة للصفحة أو page refresh لـ recovery.
   */
  loadLatest(): ConsultationBookingSession | null {
    try {
      const latestId = sessionStorage.getItem(LATEST_KEY);
      if (!latestId) return null;
      return this.load(latestId);
    } catch {
      return null;
    }
  }

  /**
   * يُبطل الجلسة ويحذفها من storage.
   * يُستخدم عند: entitlement expired, specialist unavailable, explicit cancel.
   */
  invalidate(sessionId: string, reason: string): void {
    try {
      const key = `${STORAGE_KEY}:${sessionId}`;
      const raw = sessionStorage.getItem(key);

      if (raw) {
        const session: ConsultationBookingSession = JSON.parse(raw);
        // نحتفظ بسجل الإبطال لـ debugging
        const invalidated = {
          ...session,
          bookingFlowPhase: "EXPIRED" as const,
          bookingStatus: "EXPIRED" as const,
          recoveryState: {
            ...session.recoveryState,
            status: "invalidated" as const,
            failureReason: reason,
          },
        };
        sessionStorage.setItem(key, JSON.stringify(invalidated));
      }

      // إزالة من latest إذا كانت هي الأخيرة
      const latestId = sessionStorage.getItem(LATEST_KEY);
      if (latestId === sessionId) {
        sessionStorage.removeItem(LATEST_KEY);
      }
    } catch (err) {
      console.warn("[BookingRepository] Failed to invalidate session:", err);
    }
  }

  /**
   * يمسح كل جلسات الحجز (logout / new flow).
   */
  clear(): void {
    try {
      const keys: string[] = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key?.startsWith(STORAGE_KEY)) keys.push(key);
      }
      keys.forEach(k => sessionStorage.removeItem(k));
      sessionStorage.removeItem(LATEST_KEY);
    } catch (err) {
      console.warn("[BookingRepository] Failed to clear sessions:", err);
    }
  }
}

// ─── Singleton Export ──────────────────────────────────────────────────────
/**
 * instance واحد يُستخدم في كل التطبيق.
 * لا تُنشئ instances جديدة في المكوّنات.
 */
export const consultationBookingRepository: ConsultationBookingRepository =
  new SessionStorageBookingRepository();
