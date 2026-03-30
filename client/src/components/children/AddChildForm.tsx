/**
 * AddChildForm — نموذج إضافة/تعديل ملف الطفل
 *
 * التحسينات:
 * - يعمل بـ callback مباشر بدون API (لا تأخير)
 * - validation فوري
 * - تصميم واضح وسهل الاستخدام
 */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

// ─── أنواع البيانات ───────────────────────────────────────────────────────────
interface ChildFormData {
  name: string;
  dateOfBirth: string;
  gender: "male" | "female";
  gradeLevel?: string;
  schoolName?: string;
  notes?: string;
  avatarEmoji: string;
  parentId: string;
}

interface AddChildFormProps {
  parentId: string;
  initialData?: {
    id?: string;
    name?: string;
    dateOfBirth?: string;
    gender?: "male" | "female";
    gradeLevel?: string;
    schoolName?: string;
    notes?: string;
    avatarEmoji?: string;
  };
  onSuccess: (data: ChildFormData) => void;
}

// ─── خيارات الأفاتار ──────────────────────────────────────────────────────────
const AVATAR_OPTIONS = [
  { emoji: "👦", label: "ولد" },
  { emoji: "👧", label: "بنت" },
  { emoji: "🧒", label: "طفل" },
  { emoji: "👶", label: "رضيع" },
  { emoji: "🌟", label: "نجمة" },
  { emoji: "🦁", label: "أسد" },
  { emoji: "🐻", label: "دب" },
  { emoji: "🦋", label: "فراشة" },
];

// ─── مستويات الصف الدراسي ────────────────────────────────────────────────────
const GRADE_LEVELS = [
  "روضة أولى",
  "روضة ثانية",
  "الصف الأول الابتدائي",
  "الصف الثاني الابتدائي",
  "الصف الثالث الابتدائي",
  "الصف الرابع الابتدائي",
  "الصف الخامس الابتدائي",
  "الصف السادس الابتدائي",
  "الصف الأول المتوسط",
  "الصف الثاني المتوسط",
  "الصف الثالث المتوسط",
  "الصف الأول الثانوي",
  "الصف الثاني الثانوي",
  "الصف الثالث الثانوي",
  "المرحلة الجامعية",
];

// ─── المكوّن الرئيسي ──────────────────────────────────────────────────────────
export default function AddChildForm({
  parentId,
  initialData,
  onSuccess,
}: AddChildFormProps) {
  const isEditing = !!initialData?.id;

  const [form, setForm] = useState({
    name: initialData?.name ?? "",
    dateOfBirth: initialData?.dateOfBirth ?? "",
    gender: initialData?.gender ?? ("male" as "male" | "female"),
    gradeLevel: initialData?.gradeLevel ?? "",
    schoolName: initialData?.schoolName ?? "",
    notes: initialData?.notes ?? "",
    avatarEmoji: initialData?.avatarEmoji ?? "👦",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // ─── Validation ───────────────────────────────────────────────────────────
  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    if (!form.name.trim() || form.name.trim().length < 2) {
      newErrors.name = "الاسم يجب أن يكون حرفين على الأقل";
    }

    if (!form.dateOfBirth) {
      newErrors.dateOfBirth = "تاريخ الميلاد مطلوب";
    } else {
      const dob = new Date(form.dateOfBirth);
      const now = new Date();
      const ageYears = now.getFullYear() - dob.getFullYear();
      if (ageYears < 2 || ageYears > 35) {
        newErrors.dateOfBirth = "العمر يجب أن يكون بين 2 و 35 سنة";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // ─── Submit ───────────────────────────────────────────────────────────────
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const data: ChildFormData = {
      parentId,
      name: form.name.trim(),
      dateOfBirth: form.dateOfBirth,
      gender: form.gender,
      gradeLevel: form.gradeLevel || undefined,
      schoolName: form.schoolName || undefined,
      notes: form.notes || undefined,
      avatarEmoji: form.avatarEmoji,
    };

    onSuccess(data);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" dir="rtl">
      {/* ─── اختيار الأفاتار ─────────────────────────────────────────────── */}
      <div>
        <Label className="text-sm font-medium mb-2 block">الأيقونة</Label>
        <div className="flex gap-2 flex-wrap">
          {AVATAR_OPTIONS.map((opt) => (
            <button
              key={opt.emoji}
              type="button"
              onClick={() => setForm((f) => ({ ...f, avatarEmoji: opt.emoji }))}
              className={`text-2xl p-2 rounded-lg border-2 transition-all ${
                form.avatarEmoji === opt.emoji
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              title={opt.label}
            >
              {opt.emoji}
            </button>
          ))}
        </div>
      </div>

      {/* ─── الاسم ───────────────────────────────────────────────────────── */}
      <div>
        <Label htmlFor="name" className="text-sm font-medium">
          اسم الطفل <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="أدخل اسم الطفل"
          className={`mt-1 ${errors.name ? "border-red-400" : ""}`}
        />
        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
      </div>

      {/* ─── تاريخ الميلاد والجنس ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="dob" className="text-sm font-medium">
            تاريخ الميلاد <span className="text-red-500">*</span>
          </Label>
          <Input
            id="dob"
            type="date"
            value={form.dateOfBirth}
            onChange={(e) => setForm((f) => ({ ...f, dateOfBirth: e.target.value }))}
            className={`mt-1 ${errors.dateOfBirth ? "border-red-400" : ""}`}
            max={new Date().toISOString().split("T")[0]}
          />
          {errors.dateOfBirth && (
            <p className="text-xs text-red-500 mt-1">{errors.dateOfBirth}</p>
          )}
        </div>

        <div>
          <Label className="text-sm font-medium">الجنس</Label>
          <Select
            value={form.gender}
            onValueChange={(v) => setForm((f) => ({ ...f, gender: v as "male" | "female" }))}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">👦 ذكر</SelectItem>
              <SelectItem value="female">👧 أنثى</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ─── الصف الدراسي ────────────────────────────────────────────────── */}
      <div>
        <Label className="text-sm font-medium">الصف الدراسي (اختياري)</Label>
        <Select
          value={form.gradeLevel}
          onValueChange={(v) => setForm((f) => ({ ...f, gradeLevel: v }))}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="اختر الصف الدراسي" />
          </SelectTrigger>
          <SelectContent>
            {GRADE_LEVELS.map((g) => (
              <SelectItem key={g} value={g}>{g}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ─── اسم المدرسة ─────────────────────────────────────────────────── */}
      <div>
        <Label htmlFor="school" className="text-sm font-medium">
          اسم المدرسة (اختياري)
        </Label>
        <Input
          id="school"
          value={form.schoolName}
          onChange={(e) => setForm((f) => ({ ...f, schoolName: e.target.value }))}
          placeholder="اسم المدرسة أو المؤسسة التعليمية"
          className="mt-1"
        />
      </div>

      {/* ─── ملاحظات ─────────────────────────────────────────────────────── */}
      <div>
        <Label htmlFor="notes" className="text-sm font-medium">
          ملاحظات (اختياري)
        </Label>
        <Textarea
          id="notes"
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          placeholder="أي ملاحظات إضافية عن الطفل..."
          className="mt-1 resize-none"
          rows={3}
        />
      </div>

      {/* ─── زر الحفظ ────────────────────────────────────────────────────── */}
      <Button
        type="submit"
        className="w-full h-11 bg-blue-600 hover:bg-blue-700 font-semibold"
      >
        {isEditing ? "💾 حفظ التعديلات" : "✅ إضافة الطفل"}
      </Button>
    </form>
  );
}
