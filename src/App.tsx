import { AnimatePresence } from "framer-motion";
import { Suspense, lazy, useEffect } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import { AppFrame } from "./components/AppFrame";
import { WorthMatchProvider } from "./context/WorthMatchContext";

const LandingPage = lazy(async () => ({
  default: (await import("./pages/LandingPage")).LandingPage,
}));
const DemoRunPage = lazy(async () => ({
  default: (await import("./pages/DemoRunPage")).DemoRunPage,
}));
const OnboardingPage = lazy(async () => ({
  default: (await import("./pages/OnboardingPage")).OnboardingPage,
}));
const DashboardPage = lazy(async () => ({
  default: (await import("./pages/DashboardPage")).DashboardPage,
}));
const IntakeDeskPage = lazy(async () => ({
  default: (await import("./pages/IntakeDeskPage")).IntakeDeskPage,
}));
const PlatformSearchPage = lazy(async () => ({
  default: (await import("./pages/PlatformSearchPage")).PlatformSearchPage,
}));
const OpportunitiesPage = lazy(async () => ({
  default: (await import("./pages/OpportunitiesPage")).OpportunitiesPage,
}));
const OpportunityDetailPage = lazy(async () => ({
  default: (await import("./pages/OpportunityDetailPage")).OpportunityDetailPage,
}));
const ComparePage = lazy(async () => ({
  default: (await import("./pages/ComparePage")).ComparePage,
}));
const InterviewPrepPage = lazy(async () => ({
  default: (await import("./pages/InterviewPrepPage")).InterviewPrepPage,
}));
const ServiceStudioPage = lazy(async () => ({
  default: (await import("./pages/ServiceStudioPage")).ServiceStudioPage,
}));
const TrackerPage = lazy(async () => ({
  default: (await import("./pages/TrackerPage")).TrackerPage,
}));
const ResumeStudioPage = lazy(async () => ({
  default: (await import("./pages/ResumeStudioPage")).ResumeStudioPage,
}));
const WorkspacePage = lazy(async () => ({
  default: (await import("./pages/WorkspacePage")).WorkspacePage,
}));

function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  return null;
}

function RouteLoader() {
  return (
    <div className="route-loader" role="status" aria-live="polite">
      <div className="route-loader__pulse" />
      <div>
        <strong>Loading WorthMatch workspace...</strong>
        <p>Preparing the next screen.</p>
      </div>
    </div>
  );
}

function RoutedApp() {
  const location = useLocation();

  return (
    <AppFrame>
      <ScrollToTop />
      <Suspense fallback={<RouteLoader />}>
        <AnimatePresence mode="wait">
          <Routes key={location.pathname} location={location}>
            <Route element={<LandingPage />} path="/" />
            <Route element={<DemoRunPage />} path="/demo" />
            <Route element={<OnboardingPage />} path="/onboarding" />
            <Route element={<DashboardPage />} path="/dashboard" />
            <Route element={<IntakeDeskPage />} path="/intake" />
            <Route element={<PlatformSearchPage />} path="/search" />
            <Route element={<OpportunitiesPage />} path="/opportunities" />
            <Route element={<OpportunityDetailPage />} path="/opportunities/:id" />
            <Route element={<ComparePage />} path="/compare" />
            <Route element={<InterviewPrepPage />} path="/interview" />
            <Route element={<ServiceStudioPage />} path="/services" />
            <Route element={<TrackerPage />} path="/tracker" />
            <Route element={<ResumeStudioPage />} path="/resume" />
            <Route element={<WorkspacePage />} path="/workspace" />
            <Route element={<Navigate replace to="/" />} path="*" />
          </Routes>
        </AnimatePresence>
      </Suspense>
    </AppFrame>
  );
}

export default function App() {
  return (
    <WorthMatchProvider>
      <BrowserRouter
        future={{
          v7_relativeSplatPath: true,
          v7_startTransition: true,
        }}
      >
        <RoutedApp />
      </BrowserRouter>
    </WorthMatchProvider>
  );
}
