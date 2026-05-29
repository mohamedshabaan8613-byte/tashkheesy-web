/**
 * ChildrenPage — صفحة إدارة ملفات الأطفال
 *
 * Sprint 2: Supabase sync
 * - عند تسجيل الدخول: تحميل الأطفال من Supabase أولاً ثم localStorage كـ fallback
 * - migration notice: إذا وُجد أطفال في localStorage ولا يوجد في Supabase → اعرض notice
 * - CRUD: كل عملية تُحدَّث في localStorage + Supabase (fire-and-forget)
 * - بدون تسجيل دخول: يعمل كالمعتاد من localStorage فقط
 */
import { useState, useEffect, useContext } from "react";
import { useLocation } from "wouter";
import { AuthContext } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  ClipboardList,
  Edit2,
  Trash2,
  ArrowRight,
  History,
  Home,
} from "lucide-react";
import AddChildForm from "./AddChildForm";
import { toast } from "sonner";
import {
  fetchRemoteChildren,
  upsertRemoteChild,
  updateRemoteChild,
  deleteRemoteChild,
  syncLocalChildrenToSupabase,
  type RemoteChild,
} from "@/lib/accountData";
import { isSupabaseConfigured } from "@/lib/supabaseClient";

// ─── أنواع البيانات ───────────────────────────────────────────────────────────
interface ScreeningResult {
  sessionId?: string;
  childId?: string;
  childName?: string;
  screeningType?: string;
  completedAt?: string;
  [key: string]: any;
}

export interface Child {
  id: string;
  /** Supabase UUID — populated only when the record was loaded from Supabase.
   * Used exclusively for updateRemoteChild() which filters by .eq("id", ...) */
  supabaseId?: string;
  name: string;
  dateOfBirth: string;
  gender: "male" | "female";
  gradeLevel?: string;
  schoolName?: string;
  notes?: string;
  avatarEmoji: string;
  ageYears: number;
  ageGroup: string;
  parentId: string;
  createdAt: string;
  updatedAt: string;
}

// ─── مفتاح localStorage ───────────────────────────────────────────────────────
const CHILDREN_KEY = "tashkheesy_children";

// ─── حساب العمر ──────────────────────────────────────────────────────────────
function calculateAge(dateOfBirth: string): { years: number; ageGroup: string } {
  const dob = new Date(dateOfBirth);
  const today = new Date();
  let years = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) years--;
  let ageGroup = "school";
  if (years <= 5) ageGroup = "preschool";
  else if (years <= 12) ageGroup = "school";
  else if (years <= 17) ageGroup = "teen";
  else ageGroup = "adult";
  return { years, ageGroup };
}

// ─── تسميات الفئة العمرية ────────────────────────────────────────────────────
const AGE_GROUP_LABELS: Record<string, string> = {
  preschool: "ما قبل المدرسة (3-5)",
  school: "الابتدائية (6-12)",
  teen: "المراهقة (13-17)",
  adult: "البالغون (18+)",
};

// ─── تحويل RemoteChild → Child ───────────────────────────────────────────────
function remoteToLocal(r: RemoteChild): Child {
  const { years, ageGroup } = calculateAge((r.date_of_birth ?? "") as string);
  return {
    id: (r.local_child_id || r.id) as string,
    supabaseId: r.id as string,
    name: r.name as string,
    dateOfBirth: r.date_of_birth as string,
    gender: r.gender as "male" | "female",
    gradeLevel: r.grade_level ?? undefined,
    schoolName: r.school_name ?? undefined,
    notes: r.notes ?? undefined,
    avatarEmoji: r.avatar_emoji as string,
    ageYears: years,
    ageGroup,
    parentId: (r.user_id ?? "") as string,
    createdAt: (r.created_at ?? new Date().toISOString()) as string,
    updatedAt: (r.updated_at ?? new Date().toISOString()) as string,
  };
}

// ─── المكوّن الرئيسي ──────────────────────────────────────────────────────────
export default function ChildrenPage() {
  const [, navigate] = useLocation();
  const [children, setChildren] = useState<Child[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showMigrationNotice, setShowMigrationNotice] = useState(false);

  // ─── Auth context (graceful degradation if AuthProvider not mounted) ──────
  const authCtx = useContext(AuthContext);
  const isLoggedIn = !!(authCtx && !authCtx.loading && authCtx.user);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [childToDelete, setChildToDelete] = useState<Child | null>(null);
  const [editingChild, setEditingChild] = useState<Child | null>(null);

  // ─── تحميل الأطفال ───────────────────────────────────────────────────────
  useEffect(() => {
    async function loadChildren() {
      // 1. تحميل من localStorage دائماً
      const stored = localStorage.getItem(CHILDREN_KEY);
      let localList: Child[] = [];
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as Child[];
          localList = parsed.map((c) => {
            const { years, ageGroup } = calculateAge(c.dateOfBirth);
            return { ...c, ageYears: years, ageGroup };
          });
        } catch {}
      }

      // 2. إذا لم يكن مسجلاً أو Supabase غير مُهيَّأ → localStorage فقط
      if (!isLoggedIn || !isSupabaseConfigured) {
        setChildren(localList);
        return;
      }

      // 3. تحميل من Supabase
      setIsSyncing(true);
      try {
        const remoteList = await fetchRemoteChildren();
        if (remoteList.length > 0) {
          // Supabase هو المصدر الأساسي
          const converted = remoteList.map(remoteToLocal);
          setChildren(converted);
          localStorage.setItem(CHILDREN_KEY, JSON.stringify(converted));
          // إذا كان localStorage يحتوي على أطفال غير موجودين في Supabase → migration notice
          const remoteIds = new Set(remoteList.map((r) => r.local_child_id || r.id));
          const hasUnsynced = localList.some((c) => !remoteIds.has(c.id));
          if (hasUnsynced) setShowMigrationNotice(true);
        } else if (localList.length > 0) {
          // Supabase فارغ لكن localStorage يحتوي بيانات → migration notice
          setChildren(localList);
          setShowMigrationNotice(true);
        } else {
          setChildren([]);
        }
      } catch {
        // Supabase فشل → fallback إلى localStorage
        setChildren(localList);
      } finally {
        setIsSyncing(false);
      }
    }

    loadChildren();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  // ─── حفظ الأطفال في localStorage ─────────────────────────────────────────
  function saveChildren(list: Child[]) {
    localStorage.setItem(CHILDREN_KEY, JSON.stringify(list));
    setChildren(list);
  }

  // ─── إضافة طفل جديد ──────────────────────────────────────────────────────
  async function handleAddChild(childData: Omit<Child, "id" | "ageYears" | "ageGroup" | "createdAt" | "updatedAt">) {
    const { years, ageGroup } = calculateAge(childData.dateOfBirth);
    const newChild: Child = {
      ...childData,
      id: `child_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      ageYears: years,
      ageGroup,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [...children, newChild];
    saveChildren(updated);
    setIsAddDialogOpen(false);
    toast.success(`تم إضافة ملف ${newChild.name} بنجاح ✅`);

    // Supabase sync (fire-and-forget)
    if (isLoggedIn && isSupabaseConfigured) {
      upsertRemoteChild({
        local_child_id: newChild.id,
        name: newChild.name,
        date_of_birth: newChild.dateOfBirth,
        gender: newChild.gender,
        grade_level: newChild.gradeLevel ?? null,
        school_name: newChild.schoolName ?? null,
        notes: newChild.notes ?? null,
        avatar_emoji: newChild.avatarEmoji,
      }).catch(() => {});
    }
  }

  // ─── تعديل طفل ───────────────────────────────────────────────────────────
  async function handleUpdateChild(childData: Partial<Child> & { id: string }) {
    const updated = children.map((c) => {
      if (c.id !== childData.id) return c;
      const merged = { ...c, ...childData, updatedAt: new Date().toISOString() };
      if (childData.dateOfBirth) {
        const { years, ageGroup } = calculateAge(childData.dateOfBirth);
        merged.ageYears = years;
        merged.ageGroup = ageGroup;
      }
      return merged;
    });
    saveChildren(updated);
    setEditingChild(null);
    toast.success("تم تحديث بيانات الطفل بنجاح ✅");

    // Supabase sync (fire-and-forget)
    if (isLoggedIn && isSupabaseConfigured) {
      // R1 FIX: use supabaseId (Supabase UUID) not id (local_child_id)
      // updateRemoteChild filters by .eq("id", ...) which matches the Supabase UUID column
      const remoteId = children.find((c) => c.id === childData.id)?.supabaseId ?? childData.id;
      updateRemoteChild(remoteId, {
        name: childData.name,
        date_of_birth: childData.dateOfBirth,
        gender: childData.gender,
        grade_level: childData.gradeLevel ?? null,
        school_name: childData.schoolName ?? null,
        notes: childData.notes ?? null,
        avatar_emoji: childData.avatarEmoji,
      }).catch(() => {});
    }
  }

  // ─── حذف طفل ─────────────────────────────────────────────────────────────
  async function handleDeleteChild(id: string) {
    const updated = children.filter((c) => c.id !== id);
    saveChildren(updated);
    setChildToDelete(null);
    toast.success("تم حذف ملف الطفل بنجاح");

    // Supabase sync (fire-and-forget)
    if (isLoggedIn && isSupabaseConfigured) {
      deleteRemoteChild(id).catch(() => {});
    }
  }

  // ─── عدد الفحوصات السابقة لطفل ───────────────────────────────────────────
  function isResultForChild(
    key: string,
    parsed: ScreeningResult,
    childId: string,
    derivedSessionId?: string
  ): boolean {
    if (parsed?.childId === childId) return true;
    if (
      typeof parsed?.sessionId === "string" &&
      parsed.sessionId.startsWith(`session_${childId}_`)
    ) return true;
    if (
      typeof derivedSessionId === "string" &&
      derivedSessionId.startsWith(`session_${childId}_`)
    ) return true;
    if (key.includes(`session_${childId}_`)) return true;
    return false;
  }

  function getSortTimeFromResult(parsed: ScreeningResult, sessionId: string): number {
    const dateCandidate =
      parsed.completedAt ||
      parsed.completed_at ||
      parsed.createdAt ||
      parsed.timestamp ||
      parsed.date ||
      "";
    const parsedDate = new Date(dateCandidate as string);
    if (!isNaN(parsedDate.getTime())) return parsedDate.getTime();
    const lastToken = sessionId.split("_").pop();
    const timestamp = Number(lastToken);
    if (Number.isFinite(timestamp) && timestamp > 0) return timestamp;
    return 0;
  }

  function getLatestScreeningResult(childId: string): ScreeningResult | null {
    const usableResults: (ScreeningResult & { key: string; _sortTime: number; sessionId: string })[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith("result_")) continue;
      try {
        const stored = localStorage.getItem(key);
        if (!stored) continue;
        const parsed = JSON.parse(stored) as ScreeningResult;
        const fallbackSessionId = key.replace(/^result_/, "");
        const sessionId =
          typeof parsed.sessionId === "string" && parsed.sessionId.trim()
            ? parsed.sessionId
            : fallbackSessionId;
        if (!sessionId) continue;
        if (!isResultForChild(key, parsed, childId, sessionId)) continue;
        const sortTime = getSortTimeFromResult(parsed, sessionId);
        usableResults.push({ ...parsed, sessionId, key, _sortTime: sortTime });
      } catch {
        // Skip malformed entries silently
      }
    }
    if (usableResults.length === 0) return null;
    usableResults.sort((a, b) => b._sortTime - a._sortTime);
    return usableResults[0] || null;
  }

  function getScreeningCount(childId: string): number {
    let count = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith("result_")) continue;
      try {
        const stored = localStorage.getItem(key);
        if (!stored) continue;
        const parsed = JSON.parse(stored) as ScreeningResult;
        const fallbackSessionId = key.replace(/^result_/, "");
        const sessionId =
          typeof parsed.sessionId === "string" && parsed.sessionId.trim()
            ? parsed.sessionId
            : fallbackSessionId;
        if (!sessionId) continue;
        if (isResultForChild(key, parsed, childId, sessionId)) count++;
      } catch {
        // Skip malformed entries silently
      }
    }
    return count;
  }

  // ─── Auth loading state ────────────────────────────────────────────────────
  if (authCtx && authCtx.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#F4EFE8" }}>
        <p className="text-slate-500 text-sm" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>
          جارٍ التحميل...
        </p>
      </div>
    );
  }

  // ─── Unauthenticated state ─────────────────────────────────────────────────
  if (authCtx && !authCtx.loading && !authCtx.user) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
        dir="rtl"
        style={{ background: "linear-gradient(135deg, #F4EFE8 0%, #DFF3F1 100%)" }}
      >
        <div
          className="w-full max-w-sm bg-white rounded-3xl shadow-xl p-8 text-center"
          style={{ border: "1px solid #D8E8E7" }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: "linear-gradient(135deg, #1E4E8C 0%, #2563eb 100%)" }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <h2
            className="text-xl font-black text-slate-800 mb-3"
            style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900 }}
          >
            تسجيل الدخول مطلوب
          </h2>
          <p
            className="text-sm text-slate-600 mb-6"
            style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.7 }}
          >
            لحماية بيانات الأطفال، يرجى تسجيل الدخول بالبريد الإلكتروني لعرض ملفات الأطفال.
          </p>
          <a
            href="/login"
            className="block w-full py-3 rounded-2xl text-white font-bold text-sm text-center"
            style={{
              fontFamily: "'Cairo', sans-serif",
              fontWeight: 800,
              background: "linear-gradient(135deg, #1E4E8C 0%, #2563eb 100%)",
              boxShadow: "0 4px 14px rgba(30,78,140,0.25)",
            }}
          >
            تسجيل الدخول
          </a>
          <a
            href="/"
            className="block mt-4 text-sm text-slate-400 hover:text-slate-600 transition-colors"
            style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
          >
            العودة إلى الصفحة الرئيسية
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50" dir="rtl">
      {/* ─── Header ──────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="text-gray-400 p-2">
              <Home className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">ملفات الأطفال</h1>
              <p className="text-gray-500 text-xs mt-0.5">إدارة ملفات أطفالك وإجراء الفحوصات</p>
            </div>
          </div>
          <Button
            className="gap-2 bg-blue-600 hover:bg-blue-700"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="w-4 h-4" />
            إضافة طفل
          </Button>
        </div>
      </div>

      {/* ─── Content ─────────────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 py-6">

        {/* ─── Syncing indicator ────────────────────────────────────────────── */}
        {isSyncing && (
          <div className="flex items-center gap-2 text-blue-600 text-sm mb-4 bg-blue-50 rounded-lg px-4 py-2">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span>جارٍ مزامنة بياناتك على السحاب…</span>
          </div>
        )}

        {/* ─── Migration notice ─────────────────────────────────────────────── */}
        {showMigrationNotice && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="text-amber-500 text-2xl">📦</div>
            <div className="flex-1">
              <p className="font-semibold text-amber-800 text-sm">لديك بيانات محفوظة على هذا الجهاز</p>
              <p className="text-amber-700 text-xs mt-0.5">هل تريد نقلها إلى حسابك حتى تتمكن من الوصول إليها من أي جهاز؟</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button
                size="sm"
                className="bg-amber-600 hover:bg-amber-700 text-white text-xs"
                onClick={async () => {
                  setIsSyncing(true);
                  try {
                    await syncLocalChildrenToSupabase(children);
                    setShowMigrationNotice(false);
                    toast.success("تم نقل بياناتك بنجاح ✅");
                  } catch {
                    toast.error("حدث خطأ أثناء النقل، حاول مرة أخرى");
                  } finally {
                    setIsSyncing(false);
                  }
                }}
              >
                نعم، انقل البيانات
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-xs"
                onClick={() => setShowMigrationNotice(false)}
              >
                لاحقاً
              </Button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {children.length === 0 && !isSyncing && (
          <div className="text-center py-20">
            <div className="text-7xl mb-4">👶</div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">لا توجد ملفات أطفال بعد</h2>
            <p className="text-gray-500 mb-6 text-sm">أضف ملف طفلك الأول لتبدأ رحلة الفحص والمتابعة</p>
            <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4" />
              إضافة أول طفل
            </Button>
          </div>
        )}

        {/* Children Grid */}
        {children.length > 0 && (
          <>
            <p className="text-gray-500 text-sm mb-4">
              {children.length} {children.length === 1 ? "طفل مسجل" : "أطفال مسجلين"}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {children.map((child) => {
                const screeningCount = getScreeningCount(child.id);
                const latestResult = getLatestScreeningResult(child.id);
                const pathType = latestResult?.screeningType === "adhd" ? "adhd" : "learning";
                return (
                  <Card key={child.id} className="hover:shadow-md transition-all border-2 hover:border-blue-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-4xl">{child.avatarEmoji}</div>
                          <div>
                            <CardTitle className="text-lg">{child.name}</CardTitle>
                            <p className="text-sm text-gray-500">{child.ageYears} سنوات</p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingChild(child)}
                            className="h-8 w-8 p-0 text-gray-400 hover:text-blue-600"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setChildToDelete(child)}
                            className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-3">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {child.gender === "male" ? "👦 ذكر" : "👧 أنثى"}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {AGE_GROUP_LABELS[child.ageGroup] ?? child.ageGroup}
                        </Badge>
                        {child.gradeLevel && (
                          <Badge variant="outline" className="text-xs">{child.gradeLevel}</Badge>
                        )}
                      </div>

                      {child.schoolName && (
                        <p className="text-xs text-gray-500">🏫 {child.schoolName}</p>
                      )}

                      {child.notes && (
                        <p className="text-xs text-gray-400 italic line-clamp-2">"{child.notes}"</p>
                      )}

                      {/* سجل الفحوصات */}
                      {screeningCount > 0 && (
                        <div className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 rounded-lg px-2.5 py-1.5">
                          <History className="w-3.5 h-3.5" />
                          <span>{screeningCount} فحص سابق مكتمل</span>
                        </div>
                      )}

                      {/* أزرار الإجراءات */}
                      <div className="flex flex-col sm:flex-row gap-2 pt-1">
                        {latestResult ? (
                          <>
                            {/* Primary: Show Latest Result */}
                            <Button
                              className="w-full sm:flex-1 gap-2 bg-blue-600 hover:bg-blue-700 text-sm h-9"
                              onClick={() =>
                                navigate(
                                  `/screening-result/${latestResult.sessionId}?name=${encodeURIComponent(child.name)}&pathType=${pathType}`
                                )
                              }
                            >
                              <ClipboardList className="w-4 h-4" />
                              عرض آخر نتيجة
                            </Button>

                            {/* Secondary: New Screening */}
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full sm:w-auto gap-1 text-sm h-9 px-3"
                              onClick={() =>
                                navigate(
                                  `/choose-child-path/${child.id}?name=${encodeURIComponent(child.name)}&age=${child.ageYears}&ageGroup=${child.ageGroup}`
                                )
                              }
                            >
                              <ClipboardList className="w-3 h-3" />
                              فحص جديد
                            </Button>
                          </>
                        ) : (
                          <>
                            {/* Default: Start Screening */}
                            <Button
                              className="w-full sm:flex-1 gap-2 bg-blue-600 hover:bg-blue-700 text-sm h-9"
                              onClick={() =>
                                navigate(
                                  `/choose-child-path/${child.id}?name=${encodeURIComponent(child.name)}&age=${child.ageYears}&ageGroup=${child.ageGroup}`
                                )
                              }
                            >
                              <ClipboardList className="w-4 h-4" />
                              بدء الفحص
                            </Button>
                          </>
                        )}

                        {/* Booking Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full sm:w-auto gap-1 text-sm h-9 px-3"
                          onClick={() => {
                            const bookingParams = new URLSearchParams({
                              child: child.name,
                            });
                            if (latestResult?.sessionId) {
                              bookingParams.set("sessionId", latestResult.sessionId);
                            }
                            if (pathType) {
                              bookingParams.set("pathType", pathType);
                            }
                            navigate(`/booking?${bookingParams.toString()}`);
                          }}
                        >
                          <ArrowRight className="w-3 h-3" />
                          حجز
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* ─── Add Dialog ──────────────────────────────────────────────────────── */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right">إضافة ملف طفل جديد</DialogTitle>
          </DialogHeader>
          <AddChildForm
            parentId="local_parent"
            onSuccess={(child) => handleAddChild(child as any)}
          />
        </DialogContent>
      </Dialog>

      {/* ─── Edit Dialog ─────────────────────────────────────────────────────── */}
      {editingChild && (
        <Dialog open={!!editingChild} onOpenChange={() => setEditingChild(null)}>
          <DialogContent className="max-w-lg" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-right">تعديل ملف {editingChild.name}</DialogTitle>
            </DialogHeader>
            <AddChildForm
              parentId="local_parent"
              initialData={editingChild}
              onSuccess={(child) => handleUpdateChild({ ...child as any, id: editingChild.id })}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* ─── Delete Confirmation ─────────────────────────────────────────────── */}
      <AlertDialog open={!!childToDelete} onOpenChange={() => setChildToDelete(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف ملف الطفل</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف ملف <strong>{childToDelete?.name}</strong>؟
              سيتم حذف جميع بياناته بشكل نهائي.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => childToDelete && handleDeleteChild(childToDelete.id)}
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
