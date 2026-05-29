import { lazy, Suspense, useEffect, type ReactNode } from "react";
import { Route, Switch, useParams } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { ConsultationProvider } from "./contexts/ConsultationContext";
import { ConsultationBookingProvider } from "./contexts/ConsultationBookingContext";
import { CONSULTATION_ROUTES } from "./constants/consultationRoutes";
import WhatsAppButton from "./components/WhatsAppButton";
import PageSkeleton from "./components/PageSkeleton";
import { Toaster } from "@/components/ui/sonner";

// ─── Lazy-loaded pages ───────────────────────────────────────────────────────
const Home         = lazy(() => import("./components/Home"));
const Services     = lazy(() => import("./components/Services"));
const Pricing      = lazy(() => import("./components/Pricing"));
const Team         = lazy(() => import("./components/Team"));
const Knowledge    = lazy(() => import("./Knowledge"));
const Contact      = lazy(() => import("./Contact"));
const Booking      = lazy(() => import("./components/booking/Booking"));
const NotFound     = lazy(() => import("./components/NotFound"));
const Privacy      = lazy(() => import("./Privacy"));
const Disclaimer   = lazy(() => import("./Disclaimer"));
const Terms        = lazy(() => import("./Terms"));
const RefundPolicy = lazy(() => import("./RefundPolicy"));
const AIInsights   = lazy(() => import("./AIInsights"));
const FAQ          = lazy(() => import("./FAQ"));
const Impact       = lazy(() => import("./Impact"));

// ─── صفحات ملف الطفل والفحص ───────────────────────────────────────────────
const ChildrenPage    = lazy(() => import("./components/children/ChildrenPage"));
const ScreeningPage   = lazy(() => import("./components/screening/ScreeningPage"));
const ScreeningResult = lazy(() => import("./components/screening/ScreeningResult"));
const ScreeningIntro  = lazy(() => import("./components/screening/ScreeningIntro"));
const AssessmentStart = lazy(() => import("./components/AssessmentStart"));
const SelfAssessment  = lazy(() => import("./components/SelfAssessment"));

// ─── صفحات القمع الجديدة ────────────────────────────────────────────────
const ChooseChildPath  = lazy(() => import("./components/screening/ChooseChildPath"));
const ChooseSelfPath   = lazy(() => import("./components/screening/ChooseSelfPath"));
const SpecialistsMatch = lazy(() => import("./components/screening/SpecialistsMatch"));

// ─── صفحات المصادقة (Sprint 1B) ────────────────────────────────────────
const Login   = lazy(() => import("./components/Login"));
const Account = lazy(() => import("./components/Account"));

// ─── لوحة الإدارة + معاينة النتائج (Sprint 6B) ─────────────────────────
const AdminDashboard     = lazy(() => import("./components/AdminDashboard"));
const AdminResultPreview = lazy(() => import("./components/screening/ResultDemo"));

// ─── صفحات الاستشارة السياقية (Sprint 3.0) ─────────────────────────────────
const ConsultationIntroPage   = lazy(
  () => import("./components/consultation/ConsultationIntroPage"),
);
const ConsultationBookingPage = lazy(
  () => import("./components/consultation/ConsultationBookingPage"),
);

// ─── صفحة مراجعة الحجز (Sprint 3.3 PHASE 1) ───────────────────────────────────────────────
const BookingReviewPage = lazy(
  () => import("./pages/BookingReviewPage"),
);

// ─── صفحات Sprint 3.2 (Specialist + Slot Selection) ──────────────────────────────
const SpecialistSelectionPage = lazy(
  () => import("./pages/consultation/SpecialistSelectionPage"),
);
const SlotSelectionPage = lazy(
  () => import("./pages/consultation/SlotSelectionPage"),
);
const ConsultationConfirmedPage = lazy(
  () => import("./pages/consultation/ConsultationConfirmedPage"),
);

// ─── SEO Guard: منع فهرسة الصفحات الحساسة ───────────────────────────────────
function SensitiveNoIndex({ children }: { children: ReactNode }) {
  useEffect(() => {
    const selector = 'meta[name="robots"]';

    const getOrCreateRobotsMeta = () => {
      let el = document.querySelector<HTMLMetaElement>(selector);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("name", "robots");
        document.head.appendChild(el);
      }
      return el;
    };

    const existingMeta = document.querySelector<HTMLMetaElement>(selector);
    const previousContent = existingMeta?.getAttribute("content") ?? null;
    const hadExistingMeta = Boolean(existingMeta);

    const applyNoIndex = () => {
      const robotsMeta = getOrCreateRobotsMeta();
      robotsMeta.setAttribute("content", "noindex, nofollow");
    };

    applyNoIndex();
    const reapplyTimer = window.setTimeout(applyNoIndex, 0);

    return () => {
      window.clearTimeout(reapplyTimer);
      const robotsMeta = document.querySelector<HTMLMetaElement>(selector);
      if (!robotsMeta) return;
      if (hadExistingMeta && previousContent) {
        robotsMeta.setAttribute("content", previousContent);
      } else if (hadExistingMeta && !previousContent) {
        robotsMeta.removeAttribute("content");
      } else {
        robotsMeta.remove();
      }
    };
  }, []);

  return <>{children}</>;
}

// ─── Wrapper Components لاستخراج URL Params ──────────────────────────────────
function ScreeningWrapper() {
  const params = useParams<{ childId: string }>();
  return (
    <SensitiveNoIndex>
      <ScreeningPage childId={params.childId ?? ""} />
    </SensitiveNoIndex>
  );
}

function ScreeningResultWrapper() {
  const params = useParams<{ sessionId: string }>();
  return (
    <SensitiveNoIndex>
      <ScreeningResult sessionId={params.sessionId ?? ""} />
    </SensitiveNoIndex>
  );
}

function ScreeningIntroWrapper() {
  const params = useParams<{ childId: string }>();
  return (
    <SensitiveNoIndex>
      <ScreeningIntro childId={params.childId ?? ""} />
    </SensitiveNoIndex>
  );
}

function ChooseChildPathWrapper() {
  const params = useParams<{ childId: string }>();
  return (
    <SensitiveNoIndex>
      <ChooseChildPath childId={params.childId ?? ""} />
    </SensitiveNoIndex>
  );
}

// ─── Wrapper Components للصفحات الحساسة بدون Params ─────────────────────────
function BookingNoIndex() {
  return <SensitiveNoIndex><Booking /></SensitiveNoIndex>;
}

function ChildrenNoIndex() {
  return <SensitiveNoIndex><ChildrenPage /></SensitiveNoIndex>;
}

function AssessmentStartNoIndex() {
  return <SensitiveNoIndex><AssessmentStart /></SensitiveNoIndex>;
}

function SelfAssessmentNoIndex() {
  return <SensitiveNoIndex><SelfAssessment /></SensitiveNoIndex>;
}

function ChooseSelfPathNoIndex() {
  return <SensitiveNoIndex><ChooseSelfPath /></SensitiveNoIndex>;
}

function SpecialistsMatchNoIndex() {
  return <SensitiveNoIndex><SpecialistsMatch /></SensitiveNoIndex>;
}

function ConsultationIntroNoIndex() {
  return (
    <SensitiveNoIndex>
      <ConsultationIntroPage />
    </SensitiveNoIndex>
  );
}

/**
 * ConsultationBookingNoIndex — Sprint 3.0c
 * Route: CONSULTATION_ROUTES.BOOKING
 */
function ConsultationBookingNoIndex() {
  return (
    <SensitiveNoIndex>
      <ConsultationBookingPage />
    </SensitiveNoIndex>
  );
}

/**
 * BookingReviewNoIndex — Sprint 3.3 PHASE 1 (Fix N4)
 * Route: CONSULTATION_ROUTES.REVIEW
 *
 * Fix N4: Route يستخدم CONSULTATION_ROUTES.REVIEW وليس string مباشرة.
 *
 * UX boundary — الصفحة قبل persistence commit.
 * الـ UI يعرض فقط — لا تأكيد، لا Supabase write، لا transitionTo() مباشر.
 */
function BookingReviewNoIndex() {
  return (
    <SensitiveNoIndex>
      <BookingReviewPage />
    </SensitiveNoIndex>
  );
}

function Router() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Switch>
        {/* ─── الصفحات الرئيسية العامة القابلة للفهرسة ───────────────────── */}
        <Route path="/"              component={Home} />
        <Route path="/services"      component={Services} />
        <Route path="/pricing"       component={Pricing} />
        <Route path="/team"          component={Team} />
        <Route path="/knowledge"     component={Knowledge} />
        <Route path="/contact"       component={Contact} />
        <Route path="/privacy"       component={Privacy} />
        <Route path="/disclaimer"    component={Disclaimer} />
        <Route path="/terms"         component={Terms} />
        <Route path="/refund-policy" component={RefundPolicy} />
        <Route path="/ai-insights"   component={AIInsights} />
        <Route path="/faq"           component={FAQ} />
        <Route path="/impact"        component={Impact} />

        {/* ─── صفحات الحجز والفحص الحساسة: noindex, nofollow ─────────────── */}
        <Route path="/booking"                     component={BookingNoIndex} />
        <Route path="/children"                    component={ChildrenNoIndex} />
        <Route path="/screening-intro/:childId"    component={ScreeningIntroWrapper} />
        <Route path="/screening/:childId"          component={ScreeningWrapper} />
        <Route path="/screening-result/:sessionId" component={ScreeningResultWrapper} />

        {/* ─── مسارات القمع الجديدة الحساسة: noindex, nofollow ───────────── */}
        <Route path="/start"                      component={AssessmentStartNoIndex} />
        <Route path="/self-assessment"            component={SelfAssessmentNoIndex} />
        <Route path="/choose-self-path"           component={ChooseSelfPathNoIndex} />
        <Route path="/choose-child-path/:childId" component={ChooseChildPathWrapper} />
        <Route path="/specialists"                component={SpecialistsMatchNoIndex} />

        {/*
         * ─── صفحات الاستشارة السياقية (Sprint 3.0 → 3.3) ───────────────────
         *
         * Fix N4: جميع المسارات تستخدم CONSULTATION_ROUTES.
         * لا توجد strings مباشرة هنا.
         *
         * ARCHITECTURE CONTRACT (Sprint 3.3):
         *   START   → ConsultationIntroPage  (نقطة دخول الـ funnel)
         *   BOOKING → ConsultationBookingPage (اختيار الأخصائي والموعد)
         *   REVIEW  → BookingReviewPage       (UX boundary — عرض فقط)
         *
         * ISOLATION RULE: BookingReviewPage لا تستورد ConsultationContext.
         * MUTATION RULE:  لا transitionTo() من الـ UI مباشرة.
         * SOURCE OF TRUTH: runtime session من useConsultationBooking() فقط.
         *                   URL = navigation concern فقط.
         */}
        <Route path={CONSULTATION_ROUTES.START}              component={ConsultationIntroNoIndex} />
        <Route path={CONSULTATION_ROUTES.BOOKING}             component={ConsultationBookingNoIndex} />
        <Route path={CONSULTATION_ROUTES.REVIEW}              component={BookingReviewNoIndex} />
        <Route path={CONSULTATION_ROUTES.BOOKING_SPECIALISTS} component={SpecialistSelectionPage} />
        <Route path={CONSULTATION_ROUTES.BOOKING_SLOTS}       component={SlotSelectionPage} />
        <Route path={CONSULTATION_ROUTES.CONFIRMED}           component={ConsultationConfirmedPage} />
        {/* ─── صفحات الاستشارة السياقية (Sprint 3.0+) ────────────────────── */}

        {/* ─── صفحات المصادقة (Sprint 1B) ────────────────────────────────── */}
        <Route path="/login"   component={Login} />
        <Route path="/account" component={Account} />

        {/* ─── لوحة الإدارة + معاينة النتائج الداخلية (admin-only) ─────────── */}
        <Route
          path="/admin"
          component={() => (
            <SensitiveNoIndex>
              <AdminDashboard />
            </SensitiveNoIndex>
          )}
        />
        <Route
          path="/admin/preview"
          component={() => (
            <SensitiveNoIndex>
              <AdminResultPreview />
            </SensitiveNoIndex>
          )}
        />

        {/* ─── صفحة 404 ─────────────────────────────────────────────────── */}
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          {/*
           * Provider Architecture — Sprint 3.3
           *
           * ─── Layer 1: ConsultationProvider ────────────────────────────
           * WHY + WHERE: intent + flow phase
           * Source: ConsultationContext.tsx
           *
           * ─── Layer 2: ConsultationBookingProvider ──────────────────────
           * HOW: booking session + lifecycle state machine
           * Source: ConsultationBookingContext.tsx
           *
           * ISOLATION RULE:
           *   ConsultationBookingProvider لا يقرأ ConsultationContext مباشرة.
           *   التداخل في الشجرة ≠ التداخل في المنطق.
           *
           * MUTATION RULE (Sprint 3.3):
           *   Phase mutations: transitionTo() عبر orchestrator فقط.
           *   UI → orchestrator → transitionTo() → domain event.
           *   لا تستدعي transitionTo() مباشرة من الـ UI.
           *
           * PERSISTENCE (Sprint 3.3 Phase 2):
           *   Supabase layer سيكون authoritative source of truth.
           *   Runtime context يصبح cache + orchestration layer.
           * ─── Provider Tree — Runtime Coordinator Architecture ──────────
           *
           * الترتيب محدد ومقصود:
           *
           *   ConsultationProvider
           *     → WHY + WHERE: intent + flow phase
           *     → يُحدد سبب الحجز ومصدره (تقييم / مباشر / إحالة)
           *
           *   ConsultationBookingProvider
           *     → HOW: booking session + lifecycle + runtime
           *     → Runtime Coordinator الوحيد للـ booking workflow:
           *         • hydration lifecycle (hydrateOnce guard)
           *         • runtime safety validation (runtimeSafetyCheck)
           *         • active booking recovery (recovery on mount)
           *         • expiration monitoring (polling 60s)
           *         • ownership state (ownershipToken)
           *         • transition dispatching (transitionTo)
           *         • booking runtime cache (sessionRef)
           *
           * ISOLATION RULE:
           *   ConsultationBookingProvider لا يقرأ ConsultationContext مباشرة.
           *   التداخل في الشجرة ≠ التداخل في المنطق.
           *   البيانات تُمرر عبر startBookingSession() params فقط.
           *
           * MUTATION RULE:
           *   لا توجد صفحة تُعدِّل booking phase مباشرة.
           *   جميع الانتقالات تمر عبر transitionTo() في Provider.
           * ────────────────────────────────────────────────────────────────
           */}
          <ConsultationProvider>
            <ConsultationBookingProvider>
              <Router />
              <WhatsAppButton />
              <Toaster richColors position="top-center" />
            </ConsultationBookingProvider>
          </ConsultationProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
