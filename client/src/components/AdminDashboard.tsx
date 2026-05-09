/**
 * AdminDashboard.tsx — Sprint 6B / Polish: admin-dashboard-layout
 *
 * Protected admin-only dashboard page.
 * Route: /admin
 *
 * Access states:
 * - Loading: spinner
 * - Not logged in: login CTA
 * - Logged in but not admin: Arabic "غير مصرح لك بالوصول"
 * - Admin: full dashboard with KPI cards + tables
 *
 * Security:
 * - Uses isCurrentUserAdmin() which reads admin_users via RLS (own-row policy).
 * - Uses fetchAdminDashboardData() which reads via admin SELECT RLS policies.
 * - No service_role key. No hardcoded admin emails.
 * - RLS enforces access — frontend hiding is secondary only.
 *
 * Polish (admin-dashboard-layout branch):
 * - Added pt-16 sm:pt-20 top padding to main to clear navbar.
 * - Increased vertical gap between sections: gap-y-10 sm:gap-y-14.
 * - Header section: border-bottom separator, pb-6, stacked on mobile / row on sm+.
 * - "تحديث البيانات" button: self-start on mobile, self-auto on sm+.
 * - KPI grid: 1-col on mobile (< 390px), 2-col on sm, 3-col on md, 4-col on lg.
 * - Section headings: larger text-lg, bottom border, pb-3.
 * - Tables: rounded-2xl, slightly more padding on cells.
 */

import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  isCurrentUserAdmin,
  fetchAdminDashboardData,
  type AdminDashboardData,
} from "@/lib/admin";
import { getLoginUrl } from "@/const";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function subjectTypeLabel(val: string | null | undefined): string {
  if (val === "child") return "طفل";
  if (val === "self")  return "ذاتي";
  return val ?? "—";
}

function pathTypeLabel(val: string | null | undefined): string {
  if (val === "learning") return "صعوبات التعلم";
  if (val === "adhd")     return "فرط الحركة";
  return val ?? "—";
}

function boolLabel(val: boolean | null | undefined): string {
  return val ? "نعم" : "لا";
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string;
  value: string | number;
  accent?: boolean;
}

function KpiCard({ label, value, accent }: KpiCardProps) {
  return (
    <div
      className={`rounded-xl border p-5 flex flex-col gap-2 shadow-sm transition-shadow hover:shadow-md ${
        accent
          ? "bg-[#1E4E8C] text-white border-[#1E4E8C]"
          : "bg-white border-[#E8E0D5] text-[#1a1a1a]"
      }`}
    >
      <p className={`text-xs sm:text-sm font-medium leading-snug ${accent ? "text-blue-100" : "text-[#6B5E4E]"}`}>
        {label}
      </p>
      <p className={`text-2xl sm:text-3xl font-bold font-cairo ${accent ? "text-white" : "text-[#1E4E8C]"}`}>
        {value}
      </p>
    </div>
  );
}

// ─── Section Heading ──────────────────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-lg font-bold font-cairo text-[#1a1a1a] pb-3 border-b border-[#E8E0D5]">
      {children}
    </h2>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

type AccessState = "loading" | "not_logged_in" | "not_admin" | "admin";

export default function AdminDashboard() {
  const [accessState, setAccessState] = useState<AccessState>("loading");
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState(false);

  // ── Check admin access ────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function checkAccess() {
      const result = await isCurrentUserAdmin();

      if (cancelled) return;

      if (!result.ok && result.reason === "supabase_not_configured") {
        setAccessState("not_logged_in");
        return;
      }

      if (result.reason === "not_authenticated") {
        setAccessState("not_logged_in");
        return;
      }

      if (!result.isAdmin) {
        setAccessState("not_admin");
        return;
      }

      setAccessState("admin");
    }

    checkAccess();
    return () => { cancelled = true; };
  }, []);

  // ── Fetch dashboard data once admin is confirmed ──────────────────────────
  const loadData = useCallback(async () => {
    setDataLoading(true);
    setDataError(false);
    const result = await fetchAdminDashboardData();
    setDataLoading(false);
    if (!result) {
      setDataError(true);
      return;
    }
    setData(result);
  }, []);

  useEffect(() => {
    if (accessState === "admin") {
      loadData();
    }
  }, [accessState, loadData]);

  // ─────────────────────────────────────────────────────────────────────────
  // Render: Loading
  // ─────────────────────────────────────────────────────────────────────────
  if (accessState === "loading") {
    return (
      <div className="min-h-screen bg-[#F4EFE8] flex flex-col" dir="rtl">
        <Navbar />
        <main className="flex-1 flex items-center justify-center pt-16 sm:pt-20">
          <div className="flex flex-col items-center gap-4 text-[#6B5E4E]">
            <div className="w-10 h-10 border-4 border-[#1E4E8C] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium">جاري التحقق من الصلاحيات…</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Render: Not logged in
  // ─────────────────────────────────────────────────────────────────────────
  if (accessState === "not_logged_in") {
    return (
      <div className="min-h-screen bg-[#F4EFE8] flex flex-col" dir="rtl">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 pt-16 sm:pt-20">
          <div className="bg-white rounded-2xl border border-[#E8E0D5] shadow-sm p-10 max-w-md w-full text-center flex flex-col gap-6">
            <div className="w-14 h-14 rounded-full bg-[#EEF3FB] flex items-center justify-center mx-auto">
              <svg className="w-7 h-7 text-[#1E4E8C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold font-cairo text-[#1a1a1a] mb-2">لوحة إدارة تشخيصي</h1>
              <p className="text-[#6B5E4E] text-sm leading-relaxed">
                يرجى تسجيل الدخول للوصول إلى لوحة الإدارة.
              </p>
            </div>
            <a
              href={getLoginUrl()}
              className="inline-block bg-[#1E4E8C] text-white font-semibold font-cairo rounded-lg px-6 py-3 text-sm hover:bg-[#163d70] transition-colors"
            >
              تسجيل الدخول
            </a>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Render: Logged in but not admin
  // ─────────────────────────────────────────────────────────────────────────
  if (accessState === "not_admin") {
    return (
      <div className="min-h-screen bg-[#F4EFE8] flex flex-col" dir="rtl">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 pt-16 sm:pt-20">
          <div className="bg-white rounded-2xl border border-[#E8E0D5] shadow-sm p-10 max-w-md w-full text-center flex flex-col gap-6">
            <div className="w-14 h-14 rounded-full bg-[#FEF3F2] flex items-center justify-center mx-auto">
              <svg className="w-7 h-7 text-[#D92D20]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold font-cairo text-[#1a1a1a] mb-2">غير مصرح</h1>
              <p className="text-[#6B5E4E] text-sm leading-relaxed">
                غير مصرح لك بالوصول إلى هذه الصفحة.
              </p>
            </div>
            <Link
              href="/"
              className="inline-block bg-[#F4EFE8] text-[#1E4E8C] font-semibold font-cairo rounded-lg px-6 py-3 text-sm hover:bg-[#E8E0D5] transition-colors border border-[#E8E0D5]"
            >
              العودة إلى الرئيسية
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Render: Admin dashboard
  // ─────────────────────────────────────────────────────────────────────────
  const t = data?.totals;

  return (
    <div className="min-h-screen bg-[#F4EFE8] flex flex-col" dir="rtl">
      <Navbar />

      {/*
        pt-16 sm:pt-20 — clears the fixed navbar height on mobile and desktop.
        pb-16           — breathing room at the bottom before footer.
        gap-y-10 sm:gap-y-14 — generous vertical rhythm between sections.
      */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-16 sm:pt-20 pb-16 flex flex-col gap-y-10 sm:gap-y-14">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        {/*
          pb-6 + border-b: visually separates the header from the content below.
          flex-col on mobile (title above button), flex-row on sm+.
          gap-4 ensures comfortable spacing between title block and button.
        */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-6 border-b border-[#E8E0D5]">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-cairo text-[#1a1a1a] leading-tight">
              لوحة إدارة تشخيصي
            </h1>
            <p className="text-sm text-[#6B5E4E] mt-2 leading-relaxed">
              نظرة تشغيلية سريعة على الفحوصات والحجوزات أثناء الإطلاق التجريبي.
            </p>
          </div>
          <button
            onClick={loadData}
            disabled={dataLoading}
            className="flex items-center gap-2 bg-white border border-[#E8E0D5] text-[#1E4E8C] font-semibold font-cairo rounded-lg px-4 py-2.5 text-sm hover:bg-[#F4EFE8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed self-start sm:self-auto shrink-0"
          >
            <svg
              className={`w-4 h-4 ${dataLoading ? "animate-spin" : ""}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            تحديث البيانات
          </button>
        </div>

        {/* ── Data loading spinner ────────────────────────────────────────── */}
        {dataLoading && !data && (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-4 text-[#6B5E4E]">
              <div className="w-10 h-10 border-4 border-[#1E4E8C] border-t-transparent rounded-full animate-spin" />
              <p className="text-sm">جاري تحميل البيانات…</p>
            </div>
          </div>
        )}

        {/* ── Data error ─────────────────────────────────────────────────── */}
        {dataError && !dataLoading && (
          <div className="bg-[#FEF3F2] border border-[#FECDCA] rounded-xl p-6 text-center text-[#D92D20] text-sm">
            تعذّر تحميل البيانات. يرجى المحاولة مرة أخرى.
          </div>
        )}

        {/* ── KPI Cards ──────────────────────────────────────────────────── */}
        {data && (
          <>
            <section className="flex flex-col gap-5">
              <SectionHeading>المؤشرات الرئيسية</SectionHeading>
              {/*
                Grid breakpoints:
                  - < 390px  (xs mobile) : 1 column  — grid-cols-1
                  - 390px+   (sm)        : 2 columns — sm:grid-cols-2
                  - 768px+   (md)        : 3 columns — md:grid-cols-3
                  - 1024px+  (lg)        : 4 columns — lg:grid-cols-4
                gap-4 on mobile, gap-5 on sm+
              */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                <KpiCard label="إجمالي الفحوصات"                value={t!.totalScreenings} />
                <KpiCard label="فحوصات الأطفال"                 value={t!.childScreenings} />
                <KpiCard label="تقييمات أقيّم نفسي"             value={t!.selfAssessments} />
                <KpiCard label="صعوبات التعلم"                  value={t!.learningScreenings} />
                <KpiCard label="فرط الحركة وتشتت الانتباه"      value={t!.adhdScreenings} />
                <KpiCard label="إجمالي الحجوزات"                value={t!.totalBookings} />
                <KpiCard label="حجوزات بعد نتيجة فحص"           value={t!.bookingsAfterResult} />
                <KpiCard
                  label="نسبة التحويل من الفحص إلى الحجز"
                  value={`${t!.conversionRate}%`}
                  accent
                />
              </div>
            </section>

            {/* ── Latest Screenings Table ─────────────────────────────────── */}
            <section className="flex flex-col gap-5">
              <SectionHeading>آخر الفحوصات</SectionHeading>
              {data.latestScreenings.length === 0 ? (
                <div className="bg-white border border-[#E8E0D5] rounded-2xl p-10 text-center text-[#6B5E4E] text-sm">
                  لا توجد فحوصات مسجلة بعد.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-[#E8E0D5] bg-white shadow-sm">
                  <table className="w-full text-sm text-right">
                    <thead className="bg-[#F4EFE8] text-[#6B5E4E] text-xs font-semibold">
                      <tr>
                        <th className="px-5 py-3.5 font-semibold">التاريخ</th>
                        <th className="px-5 py-3.5 font-semibold">النوع</th>
                        <th className="px-5 py-3.5 font-semibold">المسار</th>
                        <th className="px-5 py-3.5 font-semibold">مستوى المؤشر</th>
                        <th className="px-5 py-3.5 font-semibold">حجز بعد النتيجة؟</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F4EFE8]">
                      {data.latestScreenings.map((row) => (
                        <tr key={row.id} className="hover:bg-[#FAFAF8] transition-colors">
                          <td className="px-5 py-4 text-[#1a1a1a] whitespace-nowrap">
                            {formatDate(row.completed_at ?? row.created_at)}
                          </td>
                          <td className="px-5 py-4 text-[#1a1a1a]">
                            {subjectTypeLabel(row.subject_type)}
                          </td>
                          <td className="px-5 py-4 text-[#1a1a1a]">
                            {pathTypeLabel(row.path_type)}
                          </td>
                          <td className="px-5 py-4 text-[#1a1a1a]">
                            {row.result_level ?? row.risk_level ?? "—"}
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                                row.booked_after_result
                                  ? "bg-[#D1FAE5] text-[#065F46]"
                                  : "bg-[#F3F4F6] text-[#6B7280]"
                              }`}
                            >
                              {boolLabel(row.booked_after_result)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* ── Latest Bookings Table ───────────────────────────────────── */}
            <section className="flex flex-col gap-5">
              <SectionHeading>آخر الحجوزات</SectionHeading>
              {data.latestBookings.length === 0 ? (
                <div className="bg-white border border-[#E8E0D5] rounded-2xl p-10 text-center text-[#6B5E4E] text-sm">
                  لا توجد حجوزات مسجلة بعد.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-[#E8E0D5] bg-white shadow-sm">
                  <table className="w-full text-sm text-right">
                    <thead className="bg-[#F4EFE8] text-[#6B5E4E] text-xs font-semibold">
                      <tr>
                        <th className="px-5 py-3.5 font-semibold">التاريخ</th>
                        <th className="px-5 py-3.5 font-semibold">الاسم</th>
                        <th className="px-5 py-3.5 font-semibold">البريد</th>
                        <th className="px-5 py-3.5 font-semibold">الهاتف</th>
                        <th className="px-5 py-3.5 font-semibold">الخدمة</th>
                        <th className="px-5 py-3.5 font-semibold">المتخصص</th>
                        <th className="px-5 py-3.5 font-semibold">مرتبط بنتيجة؟</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F4EFE8]">
                      {data.latestBookings.map((row) => (
                        <tr key={row.id} className="hover:bg-[#FAFAF8] transition-colors">
                          <td className="px-5 py-4 text-[#1a1a1a] whitespace-nowrap">
                            {formatDate(row.created_at)}
                          </td>
                          <td className="px-5 py-4 text-[#1a1a1a]">
                            {row.full_name ?? "—"}
                          </td>
                          <td className="px-5 py-4 text-[#1a1a1a] text-xs">
                            {row.email ?? "—"}
                          </td>
                          <td className="px-5 py-4 text-[#1a1a1a]">
                            {row.phone ?? "—"}
                          </td>
                          <td className="px-5 py-4 text-[#1a1a1a]">
                            {row.service_title ?? "—"}
                          </td>
                          <td className="px-5 py-4 text-[#1a1a1a]">
                            {row.specialist_name ?? "—"}
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                                row.booked_after_result
                                  ? "bg-[#D1FAE5] text-[#065F46]"
                                  : "bg-[#F3F4F6] text-[#6B7280]"
                              }`}
                            >
                              {boolLabel(row.booked_after_result)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
