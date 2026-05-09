import { lazy, Suspense, useEffect, type ReactNode } from "react";
import { Route, Switch, useParams } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
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
const ResultDemo      = lazy(() => import("./components/screening/ResultDemo"));
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
// ─── لوحة الإدارة (Sprint 6B) ────────────────────────────────────────────
const AdminDashboard = lazy(() => import("./components/AdminDashboard"));
// ────────────────────────────────────────────────────────────────

// ─── SEO Guard: منع فهرسة الصفحات الحساسة ───────────────────────────────────
// الهدف: حماية صفحات الحجز، الفحص، النتائج، ومسارات رحلة المستخدم من الظهور في Google.
// ملاحظة: هذا لا يغير التصميم أو منطق الحجز أو الفحص، فقط يضيف meta robots للصفحات الحساسة.
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

    // نطبّقها فورًا، ثم نعيد تطبيقها بعد تحميل الصفحة لتجنب أي override من useSEO داخل الصفحة.
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
  return (
    <SensitiveNoIndex>
      <Booking />
    </SensitiveNoIndex>
  );
}

function ChildrenNoIndex() {
  return (
    <SensitiveNoIndex>
      <ChildrenPage />
    </SensitiveNoIndex>
  );
}

function ResultDemoNoIndex() {
  return (
    <SensitiveNoIndex>
      <ResultDemo />
    </SensitiveNoIndex>
  );
}

function AssessmentStartNoIndex() {
  return (
    <SensitiveNoIndex>
      <AssessmentStart />
    </SensitiveNoIndex>
  );
}

function SelfAssessmentNoIndex() {
  return (
    <SensitiveNoIndex>
      <SelfAssessment />
    </SensitiveNoIndex>
  );
}

function ChooseSelfPathNoIndex() {
  return (
    <SensitiveNoIndex>
      <ChooseSelfPath />
    </SensitiveNoIndex>
  );
}

function SpecialistsMatchNoIndex() {
  return (
    <SensitiveNoIndex>
      <SpecialistsMatch />
    </SensitiveNoIndex>
  );
}

function Router() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Switch>
        {/* ─── الصفحات الرئيسية العامة القابلة للفهرسة ───────────────────── */}
        <Route path="/"                  component={Home} />
        <Route path="/services"          component={Services} />
        <Route path="/pricing"           component={Pricing} />
        <Route path="/team"              component={Team} />
        <Route path="/knowledge"         component={Knowledge} />
        <Route path="/contact"           component={Contact} />
        <Route path="/privacy"           component={Privacy} />
        <Route path="/disclaimer"        component={Disclaimer} />
        <Route path="/terms"             component={Terms} />
        <Route path="/refund-policy"     component={RefundPolicy} />
        <Route path="/ai-insights"       component={AIInsights} />
        <Route path="/faq"               component={FAQ} />
        <Route path="/impact"            component={Impact} />

        {/* ─── صفحات الحجز والفحص الحساسة: noindex, nofollow ─────────────── */}
        <Route path="/booking"                     component={BookingNoIndex} />
        <Route path="/children"                    component={ChildrenNoIndex} />
        <Route path="/screening-intro/:childId"    component={ScreeningIntroWrapper} />
        <Route path="/screening/:childId"          component={ScreeningWrapper} />
        <Route path="/screening-result/:sessionId" component={ScreeningResultWrapper} />
        <Route path="/result-demo"                 component={ResultDemoNoIndex} />

        {/* ─── مسارات القمع الجديدة الحساسة: noindex, nofollow ───────────── */}
        <Route path="/start"                      component={AssessmentStartNoIndex} />
        <Route path="/self-assessment"            component={SelfAssessmentNoIndex} />
        <Route path="/choose-self-path"           component={ChooseSelfPathNoIndex} />
        <Route path="/choose-child-path/:childId" component={ChooseChildPathWrapper} />
        <Route path="/specialists"                component={SpecialistsMatchNoIndex} />

        {/* ─── صفحات المصادقة (Sprint 1B) ────────────────────────────── */}
        <Route path="/login"   component={Login} />
        <Route path="/account" component={Account} />
        {/* ─── لوحة الإدارة (Sprint 6B) — noindex ───────────────────────── */}
        <Route path="/admin"   component={() => <SensitiveNoIndex><AdminDashboard /></SensitiveNoIndex>} />
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
          <Router />
          <WhatsAppButton />
          <Toaster richColors position="top-center" />
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
