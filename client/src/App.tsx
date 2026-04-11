import { lazy, Suspense } from "react";
import { Route, Switch, useParams } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import WhatsAppButton from "./components/WhatsAppButton";
import PageSkeleton from "./components/PageSkeleton";
import { Toaster } from "@/components/ui/sonner";

// ─── Lazy-loaded pages ─────────────────────────────────────────────────────────
const Home        = lazy(() => import("./components/Home"));
const Services    = lazy(() => import("./components/Services"));
const Pricing     = lazy(() => import("./components/Pricing"));
const Team        = lazy(() => import("./components/Team"));
const Knowledge   = lazy(() => import("./Knowledge"));
const Contact     = lazy(() => import("./Contact"));
const Booking     = lazy(() => import("./components/booking/Booking"));
const NotFound    = lazy(() => import("./components/NotFound"));
const Privacy     = lazy(() => import("./Privacy"));
const Disclaimer  = lazy(() => import("./Disclaimer"));
const AIInsights  = lazy(() => import("./AIInsights"));
const FAQ         = lazy(() => import("./FAQ"));
const Impact      = lazy(() => import("./Impact"));

// ─── صفحات ملف الطفل والفحص ────────────────────────────────────────────────
const ChildrenPage    = lazy(() => import("./components/children/ChildrenPage"));
const ScreeningPage   = lazy(() => import("./components/screening/ScreeningPage"));
const ScreeningResult = lazy(() => import("./components/screening/ScreeningResult"));
const ResultDemo      = lazy(() => import("./components/screening/ResultDemo"));
const ScreeningIntro  = lazy(() => import("./components/screening/ScreeningIntro"));
const AssessmentStart = lazy(() => import("./components/AssessmentStart"));
const SelfAssessment  = lazy(() => import("./components/SelfAssessment"));

// ─── صفحات القمع الجديدة ────────────────────────────────────────────────────
const ChooseChildPath  = lazy(() => import("./components/screening/ChooseChildPath"));
const ChooseSelfPath   = lazy(() => import("./components/screening/ChooseSelfPath"));
const SpecialistsMatch = lazy(() => import("./components/screening/SpecialistsMatch"));
// ───────────────────────────────────────────────────────────────────────────────

// ─── Wrapper Components لاستخراج URL Params ──────────────────────────────────
function ScreeningWrapper() {
  const params = useParams<{ childId: string }>();
  return <ScreeningPage childId={params.childId ?? ""} />;
}

function ScreeningResultWrapper() {
  const params = useParams<{ sessionId: string }>();
  return <ScreeningResult sessionId={params.sessionId ?? ""} />;
}

function ScreeningIntroWrapper() {
  const params = useParams<{ childId: string }>();
  return <ScreeningIntro childId={params.childId ?? ""} />;
}

function ChooseChildPathWrapper() {
  const params = useParams<{ childId: string }>();
  return <ChooseChildPath childId={params.childId ?? ""} />;
}

function Router() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Switch>
        {/* ─── الصفحات الرئيسية ─────────────────────────────────────────── */}
        <Route path="/"           component={Home} />
        <Route path="/services"   component={Services} />
        <Route path="/pricing"    component={Pricing} />
        <Route path="/team"       component={Team} />
        <Route path="/knowledge"  component={Knowledge} />
        <Route path="/contact"    component={Contact} />
        <Route path="/booking"    component={Booking} />
        <Route path="/privacy"    component={Privacy} />
        <Route path="/disclaimer" component={Disclaimer} />
        <Route path="/ai-insights" component={AIInsights} />
        <Route path="/faq"         component={FAQ} />
        <Route path="/impact"      component={Impact} />

        {/* ─── صفحات ملف الطفل والفحص ──────────────────────────────────── */}
        <Route path="/children"                        component={ChildrenPage} />
        <Route path="/screening-intro/:childId"        component={ScreeningIntroWrapper} />
        <Route path="/screening/:childId"              component={ScreeningWrapper} />
        <Route path="/screening-result/:sessionId"     component={ScreeningResultWrapper} />
        <Route path="/result-demo"                     component={ResultDemo} />

        {/* ─── مسارات القمع الجديدة ────────────────────────────────────── */}
        <Route path="/start"                           component={AssessmentStart} />
        <Route path="/self-assessment"                 component={SelfAssessment} />
        <Route path="/choose-self-path"                component={ChooseSelfPath} />
        <Route path="/choose-child-path/:childId"      component={ChooseChildPathWrapper} />
        <Route path="/specialists"                     component={SpecialistsMatch} />

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
        <Router />
        <WhatsAppButton />
        <Toaster richColors position="top-center" />
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
