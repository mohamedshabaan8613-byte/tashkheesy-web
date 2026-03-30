/**
 * ChildrenPage — صفحة إدارة ملفات الأطفال المُحسَّنة
 *
 * التحسينات:
 * - تخزين الأطفال في localStorage (لا تأخير، لا API)
 * - إضافة/تعديل/حذف فوري
 * - عرض سجل الفحوصات السابقة من localStorage
 * - تصميم أوضح وأكثر سهولة
 */
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
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

// ─── أنواع البيانات ───────────────────────────────────────────────────────────
export interface Child {
  id: string;
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

// ─── المكوّن الرئيسي ──────────────────────────────────────────────────────────
export default function ChildrenPage() {
  const [, navigate] = useLocation();
  const [children, setChildren] = useState<Child[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [childToDelete, setChildToDelete] = useState<Child | null>(null);
  const [editingChild, setEditingChild] = useState<Child | null>(null);

  // ─── تحميل الأطفال من localStorage ──────────────────────────────────────
  useEffect(() => {
    const stored = localStorage.getItem(CHILDREN_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Child[];
        // تحديث الأعمار عند التحميل
        const updated = parsed.map((c) => {
          const { years, ageGroup } = calculateAge(c.dateOfBirth);
          return { ...c, ageYears: years, ageGroup };
        });
        setChildren(updated);
      } catch {}
    }
  }, []);

  // ─── حفظ الأطفال في localStorage ─────────────────────────────────────────
  function saveChildren(list: Child[]) {
    localStorage.setItem(CHILDREN_KEY, JSON.stringify(list));
    setChildren(list);
  }

  // ─── إضافة طفل جديد ──────────────────────────────────────────────────────
  function handleAddChild(childData: Omit<Child, "id" | "ageYears" | "ageGroup" | "createdAt" | "updatedAt">) {
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
  }

  // ─── تعديل طفل ───────────────────────────────────────────────────────────
  function handleUpdateChild(childData: Partial<Child> & { id: string }) {
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
  }

  // ─── حذف طفل ─────────────────────────────────────────────────────────────
  function handleDeleteChild(id: string) {
    const updated = children.filter((c) => c.id !== id);
    saveChildren(updated);
    setChildToDelete(null);
    toast.success("تم حذف ملف الطفل بنجاح");
  }

  // ─── عدد الفحوصات السابقة لطفل ───────────────────────────────────────────
  function getScreeningCount(childId: string): number {
    let count = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("result_") && key.includes(childId)) count++;
    }
    return count;
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
        {/* Empty State */}
        {children.length === 0 && (
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
                      <div className="flex gap-2 pt-1">
                        <Button
                          className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700 text-sm h-9"
                          onClick={() =>
                            navigate(`/screening/${child.id}?name=${encodeURIComponent(child.name)}&age=${child.ageYears}`)
                          }
                        >
                          <ClipboardList className="w-4 h-4" />
                          بدء الفحص
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1 text-sm h-9 px-3"
                          onClick={() => navigate(`/booking?child=${encodeURIComponent(child.name)}`)}
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
