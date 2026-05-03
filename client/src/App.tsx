import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import { lazy, Suspense } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { I18nProvider } from "./contexts/I18nContext";

// ── Critical path: eager load (LCP pages) ─────────────────────────────────
import Home from "./pages/Home";
import QuizFunnel from "./pages/QuizFunnel";
import Order from "./pages/Order";
import NotFound from "@/pages/NotFound";

// ── Non-critical: lazy load (code splitting) ───────────────────────────────
const Quiz = lazy(() => import("./pages/Quiz"));
const QuizResult = lazy(() => import("./pages/QuizResult"));
const Upsell1 = lazy(() => import("./pages/Upsell1"));
const Upsell2 = lazy(() => import("./pages/Upsell2"));
const Upsell3 = lazy(() => import("./pages/Upsell3"));
const ThankYou = lazy(() => import("./pages/ThankYou"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const Affiliates = lazy(() => import("./pages/Affiliates"));
const Contact = lazy(() => import("./pages/Contact"));
const Feedback = lazy(() => import("./pages/Feedback"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const CheckoutSuccess = lazy(() => import("./pages/CheckoutSuccess"));
const Protocol = lazy(() => import("./pages/Protocol"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy"));
const BlogList = lazy(() => import("./pages/BlogList"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const SleepChatBot = lazy(() => import("./components/SleepChatBot"));

// ── Page loading fallback ──────────────────────────────────────────────────
function PageLoader() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/quiz" component={Quiz} />
        <Route path="/result" component={QuizResult} />
        <Route path="/order" component={Order} />
        <Route path="/upsell1" component={Upsell1} />
        <Route path="/upsell2" component={Upsell2} />
        <Route path="/upsell3" component={Upsell3} />
        <Route path="/thankyou" component={ThankYou} />
        <Route path="/privacy" component={PrivacyPolicy} />
        <Route path="/terms" component={TermsOfService} />
        <Route path="/refund" component={RefundPolicy} />
        <Route path="/affiliates" component={Affiliates} />
        <Route path="/contact" component={Contact} />
        <Route path="/feedback" component={Feedback} />
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/checkout/success" component={CheckoutSuccess} />
        <Route path="/protocol" component={Protocol} />
        <Route path="/quiz-funnel" component={QuizFunnel} />
        <Route path="/sleep-quiz" component={QuizFunnel} />
        <Route path="/blog/:slug" component={BlogPost} />
        <Route path="/blog" component={BlogList} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <I18nProvider>
        <ThemeProvider defaultTheme="dark">
          <TooltipProvider>
            <Toaster />
            <Router />
            <Suspense fallback={null}>
              <SleepChatBot />
            </Suspense>
          </TooltipProvider>
        </ThemeProvider>
      </I18nProvider>
    </ErrorBoundary>
  );
}

export default App;
