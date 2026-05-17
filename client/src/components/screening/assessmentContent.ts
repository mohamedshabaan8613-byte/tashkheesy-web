/**
 * assessmentContent.ts
 * Sprint 2.2 — Step 2: Static content data
 *
 * يحتوي على البيانات الثابتة: محاور الفحص، القيم الثابتة.
 * لا يحتوي على منطق أو JSX أو imports من React.
 */

import {
  BookOpen,
  Pencil,
  Zap,
  Brain,
  Users,
  Hand,
  type LucideIcon,
} from "lucide-react";

// ─── مفتاح localStorage ────────────────────────────────────────────────────────
export const SELF_ASSESSMENTS_KEY = "tashkheesy_self_assessments";

// ─── قيم العمر ────────────────────────────────────────────────────────────────
export const AGE_MIN = 16;
export const AGE_MAX = 80;

// ─── محاور الفحص الستة ────────────────────────────────────────────────────────
export interface ScreeningArea {
  icon: LucideIcon;
  label: string;
  color: string;
  bg: string;
}

export const SCREENING_AREAS: ScreeningArea[] = [
  { icon: BookOpen, label: "القراءة والفهم",      color: "#1E4E8C", bg: "#DFF3F1" },
  { icon: Pencil,   label: "الكتابة والإملاء",    color: "#2BBDB6", bg: "#DFF3F1" },
  { icon: Zap,      label: "الانتباه والتركيز",   color: "#F4C46A", bg: "#FFFBEB" },
  { icon: Brain,    label: "الذاكرة والمعالجة",   color: "#8B5CF6", bg: "#F5F3FF" },
  { icon: Users,    label: "المهارات الاجتماعية", color: "#059669", bg: "#ECFDF5" },
  { icon: Hand,     label: "المهارات الحركية",    color: "#DC2626", bg: "#FEF2F2" },
];

// ─── ضمانات الثقة ─────────────────────────────────────────────────────────────
export const TRUST_BADGES = [
  "الفحص لا يستغرق أكثر من ١٠ دقائق",
  "النتيجة فورية مع شرح مفصّل من الذكاء الاصطناعي",
  "ليس تشخيصاً رسمياً — مؤشرات توجيهية أولية فقط",
] as const;

// ─── تسميات المسارات ──────────────────────────────────────────────────────────
export const PATH_LABELS: Record<string, string> = {
  adhd:     "فرط الحركة وتشتت الانتباه",
  learning: "صعوبات التعلم",
};

// ─── ألوان المسارات ───────────────────────────────────────────────────────────
export const PATH_COLORS: Record<string, {
  gradient: string;
  badge: string;
  text: string;
  shadow: string;
  bg: string;
  border: string;
}> = {
  adhd: {
    gradient: "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)",
    badge:    "rgba(139,92,246,0.12)",
    text:     "#7C3AED",
    shadow:   "0 3px 12px rgba(124,58,237,0.25)",
    bg:       "#F5F3FF",
    border:   "rgba(139,92,246,0.2)",
  },
  learning: {
    gradient: "linear-gradient(135deg, #2BBDB6 0%, #0D9488 100%)",
    badge:    "rgba(20,184,166,0.12)",
    text:     "#0D9488",
    shadow:   "0 3px 12px rgba(20,184,166,0.25)",
    bg:       "#DFF3F1",
    border:   "rgba(20,184,166,0.2)",
  },
};
