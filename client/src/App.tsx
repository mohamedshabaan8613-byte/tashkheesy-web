import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Services from "./pages/Services";
import Pricing from "./pages/Pricing";
import Specialists from "./pages/Specialists";
import Schools from "./pages/Schools";
import Knowledge from "./pages/Knowledge";
import Privacy from "./pages/Privacy";
import Disclaimer from "./pages/Disclaimer";
import Contact from "./pages/Contact";
import Booking from "./pages/Booking";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/services"} component={Services} />
      <Route path={"/pricing"} component={Pricing} />
      <Route path={"/specialists"} component={Specialists} />
      <Route path={"/schools"} component={Schools} />
      <Route path={"/knowledge"} component={Knowledge} />
      <Route path={"/privacy"} component={Privacy} />
      <Route path={"/disclaimer"} component={Disclaimer} />
      <Route path={"/contact"} component={Contact} />
      <Route path={"/booking"} component={Booking} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
