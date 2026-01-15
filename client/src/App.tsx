// import { Toaster } from "./Toaster";
// import { TooltipProvider } from "./TooltipProvider";
import NotFound from "./components/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./components/Home";
// import Services from "./Services";
// import Pricing from "./Pricing";
// import Specialists from "./Specialists";
// import Schools from "./Schools";
import Knowledge from "./Knowledge";
// import Privacy from "./Privacy";
// import Disclaimer from "./Disclaimer";
import Contact from "./Contact";
import Booking from "./Booking";

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
        {/* <TooltipProvider> */}
          {/* <Toaster /> */}
          <Router />
        {/* </TooltipProvider> */}
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
