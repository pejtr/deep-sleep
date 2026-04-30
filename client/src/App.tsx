import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { I18nProvider } from "./contexts/I18nContext";
import Home from "./pages/Home";
import Quiz from "./pages/Quiz";
import QuizResult from "./pages/QuizResult";
import Order from "./pages/Order";
import Upsell1 from "./pages/Upsell1";
import Upsell2 from "./pages/Upsell2";
import Upsell3 from "./pages/Upsell3";
import ThankYou from "./pages/ThankYou";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import Affiliates from "./pages/Affiliates";
import Contact from "./pages/Contact";
import Feedback from "./pages/Feedback";
import AdminDashboard from "./pages/AdminDashboard";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import Protocol from "./pages/Protocol";
import RefundPolicy from "./pages/RefundPolicy";
import QuizFunnel from "./pages/QuizFunnel";
import SleepChatBot from "./components/SleepChatBot";

function Router() {
  return (
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
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
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
            <SleepChatBot />
          </TooltipProvider>
        </ThemeProvider>
      </I18nProvider>
    </ErrorBoundary>
  );
}

export default App;
