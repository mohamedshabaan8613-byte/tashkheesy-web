/**
 * AssessmentHistory.tsx — سجل التقييمات السابقة
 *
 * Sprint 2.2 — Step 6: AssessmentHistory Extraction
 *
 * المبدأ:
 *   Controlled Component كامل — لا state داخلي، لا navigate، لا Supabase.
 *   كل شيء يأتي عبر props من SelfAssessment.
 *
 * ما يشمله:
 *   - بطاقة آخر نتيجة (latest result card)
 *   - النتائج الأقدم (collapsible)
 *   - نتائج مسارات أخرى
 *   - تحذير localStorage
 *
 * ما لا يشمله (يبقى في SelfAssessment):
 *   - orchestration flow
 *   - Supabase fetch
 *   - state management (showAllHistory)
 *   - routing (navigate)
 *
 * UX Debt مُسجَّل (لا يُصلح الآن):
 *   - spacing: البطاقة مزدحمة على موبايل
 *   - copy: تحذير localStorage يمكن تليينه مستقبلاً
 *   - animation: collapse toggle يستحق tween أنسب (Step 7+)
 */

import { CheckCircle2, ChevronDown, ChevronUp, Clock, Sparkles } from "lucide-react";
import { SelfAssessmentSummary } from "@/types/assessment";
import { formatArabicDate } from "@/lib/formatDate";

// ─── Props Contract ————————————————————————————————————
interface AssessmentHistoryProps {
  // بيانات السجلات (مشتقة في SelfAssessment، تُمرَّر كـ props)
  latestResult: SelfAssessmentSummary | null;
  olderResults: SelfAssessmentSummary[];
  otherPathResults: SelfAssessmentSummary[];

  // UI state (مملوك لـ SelfAssessment، تُمرَّر للتحكم)
  showAllHistory: boolean;
  onToggleHistory: () => void;

  // Navigation (التنسيق يبقى في SelfAssessment)
  onViewResult: (sessionId: string, name: string, pathType: string) => void;
  onStartNew: () => void;
}

export default function AssessmentHistory({
  latestResult,
  olderResults,
  otherPathResults,
  showAllHistory,
  onToggleHistory,
  onViewResult,
  onStartNew,
}: AssessmentHistoryProps) {
  if (!latestResult) return null;

  return (
    <div
      className="rounded-3xl p-5 sm:p-6 mb-6"
      style={{
        background: "white",
        border: "1.5px solid rgba(30,78,140,0.15)",
        boxShadow: "0 8px 32px rgba(30,78,140,0.07)",
      }}
    >
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 mb-1">
        <Clock size={15} style={{ color: "#1E4E8C" }} aria-hidden="true" />
        <h2
          className="text-sm font-bold text-slate-800"
          style={{ fontFamily: "'Cairo', sans-serif" }}
        >
          نتائجك السابقة على هذا الجهاز
        </h2>
      </div>
      <p
        className="text-xs text-slate-400 mb-4"
        style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
      >
        يمكنك عرض آخر نتيجة أو بدء تقييم جديد.
      </p>

      {/* ─── بطاقة آخر نتيجة ────────────────────────────────────────────── */}
      <div
        className="rounded-2xl p-4 mb-3"
        style={{
          background: latestResult.pathType === "adhd" ? "#F5F3FF" : "#DFF3F1",
          border: `1px solid ${
            latestResult.pathType === "adhd"
              ? "rgba(139,92,246,0.2)"
              : "rgba(20,184,166,0.2)"
          }`,
        }}
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <span
              className="inline-block text-xs font-bold px-2.5 py-1 rounded-full mb-1"
              style={{
                background:
                  latestResult.pathType === "adhd"
                    ? "rgba(139,92,246,0.12)"
                    : "rgba(20,184,166,0.12)",
                color: latestResult.pathType === "adhd" ? "#7C3AED" : "#0D9488",
                fontFamily: "'Cairo', sans-serif",
              }}
            >
              {latestResult.pathType === "adhd"
                ? "فرط الحركة وتشتت الانتباه"
                : "صعوبات التعلم"}
            </span>
            <p
              className="text-xs text-slate-500"
              style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
            >
              {latestResult.name} · {formatArabicDate(latestResult.completedAt)}
            </p>
          </div>
          <CheckCircle2
            size={18}
            style={{
              color: latestResult.pathType === "adhd" ? "#7C3AED" : "#0D9488",
              flexShrink: 0,
            }}
          />
        </div>

        {/* CTA البطاقة */}
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() =>
              onViewResult(
                latestResult.sessionId,
                latestResult.name,
                latestResult.pathType
              )
            }
            className="w-full sm:flex-1 flex items-center justify-center gap-2 rounded-xl font-bold text-sm transition-all duration-200 hover:-translate-y-0.5"
            style={{
              background:
                latestResult.pathType === "adhd"
                  ? "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)"
                  : "linear-gradient(135deg, #2BBDB6 0%, #0D9488 100%)",
              color: "white",
              fontFamily: "'Cairo', sans-serif",
              padding: "0.6rem 1rem",
              boxShadow:
                latestResult.pathType === "adhd"
                  ? "0 3px 12px rgba(124,58,237,0.25)"
                  : "0 3px 12px rgba(20,184,166,0.25)",
            }}
          >
            <CheckCircle2 size={14} aria-hidden="true" />
            عرض آخر نتيجة
          </button>
          <button
            onClick={onStartNew}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-xl text-sm font-medium transition-colors duration-200"
            style={{
              background: "transparent",
              border: "1.5px solid #D8E8E7",
              color: "#4A6278",
              fontFamily: "'IBM Plex Sans Arabic', sans-serif",
              padding: "0.6rem 1rem",
            }}
          >
            <Sparkles size={13} aria-hidden="true" />
            بدء تقييم جديد
          </button>
        </div>
      </div>

      {/* ─── النتائج الأقدم (collapsible) ─────────────────────────────────── */}
      {olderResults.length > 0 && (
        <div>
          <button
            onClick={onToggleHistory}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors mb-2"
            style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
          >
            {showAllHistory ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            {showAllHistory
              ? "إخفاء النتائج السابقة"
              : `عرض كل النتائج السابقة (${olderResults.length})`}
          </button>

          {showAllHistory && (
            <div className="flex flex-col gap-2">
              {olderResults.map((item) => (
                <div
                  key={item.sessionId}
                  className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5"
                  style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}
                >
                  <div>
                    <span
                      className="text-xs font-semibold"
                      style={{
                        color: item.pathType === "adhd" ? "#7C3AED" : "#0D9488",
                        fontFamily: "'Cairo', sans-serif",
                      }}
                    >
                      {item.pathType === "adhd" ? "فرط الحركة" : "صعوبات التعلم"}
                    </span>
                    <p
                      className="text-xs text-slate-400"
                      style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                    >
                      {formatArabicDate(item.completedAt)}
                    </p>
                  </div>
                  <button
                    onClick={() => onViewResult(item.sessionId, item.name, item.pathType)}
                    className="text-xs font-medium rounded-lg px-3 py-1.5 transition-colors"
                    style={{
                      background: "rgba(30,78,140,0.07)",
                      color: "#1E4E8C",
                      fontFamily: "'Cairo', sans-serif",
                      border: "1px solid rgba(30,78,140,0.12)",
                    }}
                  >
                    عرض النتيجة
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── تحذير localStorage ────────────────────────────────────────────── */}
      <p
        className="mt-3 text-xs text-slate-400 leading-relaxed"
        style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.7 }}
      >
        يتم حفظ هذه النتائج على هذا الجهاز فقط. لتخزينها بشكل دائم لاحقًا، سنوفر ربطها بحسابك.
      </p>

      {/* ─── نتائج مسارات أخرى ──────────────────────────────────────────────── */}
      {otherPathResults.length > 0 && (
        <div
          className="mt-4 rounded-xl p-3"
          style={{
            background: "rgba(148,163,184,0.06)",
            border: "1px solid rgba(148,163,184,0.15)",
          }}
        >
          <p
            className="text-xs font-medium mb-2"
            style={{ color: "#94A3B8", fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
          >
            نتائج أخرى محفوظة على هذا الجهاز
          </p>
          <div className="flex flex-col gap-2">
            {otherPathResults.slice(0, 3).map((item) => (
              <div
                key={item.sessionId}
                className="flex items-center justify-between gap-2 rounded-lg px-3 py-2"
                style={{
                  background: "rgba(148,163,184,0.08)",
                  border: "1px solid rgba(148,163,184,0.12)",
                }}
              >
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span
                    className="text-xs font-medium truncate"
                    style={{ color: "#64748B", fontFamily: "'Cairo', sans-serif" }}
                  >
                    {item.pathType === "adhd"
                      ? "فرط الحركة وتشتت الانتباه"
                      : "صعوبات التعلم"}
                  </span>
                  <span
                    className="text-xs"
                    style={{
                      color: "#94A3B8",
                      fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                    }}
                  >
                    {formatArabicDate(item.completedAt)}
                  </span>
                </div>
                <button
                  onClick={() => onViewResult(item.sessionId, item.name, item.pathType)}
                  className="text-xs rounded-lg px-2.5 py-1 transition-colors flex-shrink-0"
                  style={{
                    background: "rgba(148,163,184,0.12)",
                    color: "#64748B",
                    fontFamily: "'Cairo', sans-serif",
                    border: "1px solid rgba(148,163,184,0.18)",
                  }}
                >
                  عرض
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
