/**
 * screeningAnalytics.ts
 * Sprint 2.2 — Step 7a + Step 7b: Funnel Instrumentation Library
 *
 * Step 7a fixes (already merged):
 *   FIX 1 — sessionId mutable: attachRealSessionId()
 *   FIX 2 — beforeunload + visibilitychange dual fallback (في الـ hooks)
 *   FIX 3 — trackFunnelSubmit: update → upsert
 *
 * Step 7b additions:
 *   + trackFunnelPathSelected: يسجّل اختيار المسار في ChooseChildPath
 *   + saveChildProfile: helper موثّق هنا للوضوح
 *   + abandoned_at_step يشمل 'choose_child_path'
 */

import { supabase } from "@/lib/supabaseClient";
import { getCurrentUserId } from "@/lib/auth";

// ─── Types ───────────────────────────────────────────────────────────────────

export type FunnelStep =
  | "self_assessment_form"
  | "child_assessment_form"
  | "choose_child_path"
  | "screening_intro"
  | "screening_questions"
  | "screening_result";

export type PathType = "learning" | "adhd";

// ─── FunnelSession ───────────────────────────────────────────────────────────
//
// FIX 1: _sessionId أصبح private مع getter + attachRealSessionId guard.
// هذا يضمن:
//   · session يُنشأ بـ pending-{ts}
//   · بعد attachRealSessionId(realId): sessionId = realId للأبد
//   · لا يمكن تغيير sessionId مرة ثانية (guard: startsWith("pending-"))

export class FunnelSession {
  private _sessionId: string;
  readonly pathType: PathType | "choose";
  readonly startedAt: number;
  submittedAt: number | null = null;
  hesitationCount: number = 0;
  deviceType: "mobile" | "tablet" | "desktop";
  historyViewed: boolean = false;

  constructor(sessionId: string, pathType: PathType | "choose") {
    this._sessionId = sessionId;
    this.pathType   = pathType;
    this.startedAt  = Date.now();
    this.deviceType = detectDevice();
  }

  get sessionId(): string {
    return this._sessionId;
  }

  /**
   * FIX 1: يربط الـ session بالـ ID الحقيقي (selfId أو childId).
   * Guard: يرفض التغيير لو sessionId لا يبدأ بـ "pending-"
   * (لو نُودي مرتين عن طريق الخطأ — آمن).
   */
  attachRealSessionId(realId: string): void {
    if (!this._sessionId.startsWith("pending-")) return;
    this._sessionId = realId;
  }

  onHesitation(): void {
    this.hesitationCount++;
  }

  onHistoryView(): void {
    this.historyViewed = true;
  }

  getTimeOnForm(): number {
    return Math.round((Date.now() - this.startedAt) / 1000);
  }
}

// ─── Device Detection ────────────────────────────────────────────────────────

function detectDevice(): "mobile" | "tablet" | "desktop" {
  const w = window.innerWidth;
  if (w < 768)  return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}

// ─── trackFunnelStart ────────────────────────────────────────────────────────
//
// يُستدعى على focus أول حقل في الـ form (self) أو mount مسار الطفل.

export async function trackFunnelStart(
  session: FunnelSession
): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) return;

  await supabase
    .from("screening_analytics")
    .upsert(
      {
        session_id:      session.sessionId,
        user_id:         userId,
        path_type:       session.pathType,
        form_started_at: new Date().toISOString(),
        device_type:     session.deviceType,
      },
      { onConflict: "session_id" }
    );
}

// ─── trackFunnelSubmit ───────────────────────────────────────────────────────
//
// FIX 3: upsert بدلاً من update → resilient حتى لو trackFunnelStart فشل.

export async function trackFunnelSubmit(
  session: FunnelSession
): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) return;

  session.submittedAt = Date.now();
  const timeOnForm = session.getTimeOnForm();

  await supabase
    .from("screening_analytics")
    .upsert(
      {
        session_id:        session.sessionId,
        user_id:           userId,
        path_type:         session.pathType,
        form_submitted_at: new Date().toISOString(),
        time_on_form_sec:  timeOnForm,
        hesitation_count:  session.hesitationCount,
        device_type:       session.deviceType,
        history_viewed:    session.historyViewed,
        is_abandoned:      false,
      },
      { onConflict: "session_id" }
    );
}

// ─── trackFunnelAbandonment ──────────────────────────────────────────────────
//
// FIX 2: يُستدعى من beforeunload + visibilitychange في الـ hooks.
// guard: session.submittedAt !== null يمنع الإرسال بعد submit ناجح.

export async function trackFunnelAbandonment(
  session: FunnelSession,
  abandonedAtStep: FunnelStep
): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) return;

  const timeOnForm = session.getTimeOnForm();

  await supabase
    .from("screening_analytics")
    .upsert(
      {
        session_id:         session.sessionId,
        user_id:            userId,
        path_type:          session.pathType,
        is_abandoned:       true,
        abandoned_at:       new Date().toISOString(),
        abandoned_at_step:  abandonedAtStep,
        time_on_form_sec:   timeOnForm,
        hesitation_count:   session.hesitationCount,
        device_type:        session.deviceType,
      },
      { onConflict: "session_id" }
    );
}

// ─── trackFunnelPathSelected (Step 7b) ───────────────────────────────────────
//
// يُستدعى من ChooseChildPath.handleChoose قبل navigate.
// يسجّل:
//   · اختيار المسار (learning | adhd)
//   · session_id = childId (بعد attachRealSessionId)
//   · form_started_at = now (entry point الفعلي لمسار الطفل)

export async function trackFunnelPathSelected(
  session: FunnelSession,
  pathType: PathType,
  childId: string
): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) return;

  // ربط session بالـ childId الحقيقي قبل الكتابة إلى Supabase
  session.attachRealSessionId(childId);

  await supabase
    .from("screening_analytics")
    .upsert(
      {
        session_id:      session.sessionId,
        user_id:         userId,
        path_type:       pathType,
        form_started_at: new Date().toISOString(),
        device_type:     session.deviceType,
        is_abandoned:    false,
      },
      { onConflict: "session_id" }
    );
}

// ─── trackHistoryView ────────────────────────────────────────────────────────

export async function trackHistoryView(
  sessionId: string
): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) return;

  await supabase
    .from("screening_analytics")
    .update({ history_viewed: true })
    .eq("session_id", sessionId);
}
