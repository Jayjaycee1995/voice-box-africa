import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import Index from "./pages/Index";
import Artists from "./pages/Artists";
import ArtistProfile from "./pages/ArtistProfile";
import BookingWizard from "./pages/BookingWizard";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import HowItWorks from "./pages/HowItWorks";
import Pricing from "./pages/Pricing";
import ClientDashboard from "./pages/ClientDashboard";
import TalentDashboard from "./pages/TalentDashboard";
import GigPosting from "./pages/GigPosting";
import BrowseGigs from "./pages/BrowseGigs";
import SubmitProposal from "./pages/SubmitProposal";
import Invitations from "./pages/Invitations";
import Messages from "./pages/Messages";
import AdminPanel from "./pages/AdminPanel";
import Terms from "./pages/Terms";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import CookieConsent from "./components/layout/CookieConsent";

const queryClient = new QueryClient();

import { useEffect } from 'react';
import { useAuthStore } from './store/useAuthStore';

type Role = "client" | "talent" | "admin";

const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user, loading } = useAuthStore();
  const location = useLocation();

  if (loading) return null;
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }

  return <>{children}</>;
};

const RequireRole = ({ roles, children }: { roles: Role[]; children: React.ReactNode }) => {
  const { isAuthenticated, user, loading } = useAuthStore();
  const location = useLocation();

  if (loading) return null;
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }
  if (!roles.includes(user.role as Role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const GuestOnly = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user, loading } = useAuthStore();

  if (loading) return null;
  if (isAuthenticated && user) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
};

const DashboardRedirect = () => {
  const { isAuthenticated, user, loading } = useAuthStore();

  if (loading) return null;
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
  if (user.role === "client") return <Navigate to="/client-dashboard" replace />;
  if (user.role === "talent") return <Navigate to="/talent-dashboard" replace />;
  return <Navigate to="/admin" replace />;
};

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <div
      key={location.key}
      className="animate-in fade-in slide-in-from-bottom-2 duration-500"
    >
      <Routes location={location}>
        <Route path="/" element={<Index />} />
        <Route path="/artists" element={<Artists />} />
        <Route path="/artists/:id" element={<ArtistProfile />} />
        <Route
          path="/book/:id"
          element={
            <RequireRole roles={["client"]}>
              <BookingWizard />
            </RequireRole>
          }
        />
        <Route
          path="/register"
          element={
            <GuestOnly>
              <Register />
            </GuestOnly>
          }
        />
        <Route
          path="/login"
          element={
            <GuestOnly>
              <Login />
            </GuestOnly>
          }
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/dashboard" element={<DashboardRedirect />} />
        <Route
          path="/client-dashboard"
          element={
            <RequireRole roles={["client"]}>
              <ClientDashboard />
            </RequireRole>
          }
        />
        <Route
          path="/talent-dashboard"
          element={
            <RequireRole roles={["talent"]}>
              <TalentDashboard />
            </RequireRole>
          }
        />
        <Route
          path="/post-gig"
          element={
            <RequireRole roles={["client"]}>
              <GigPosting />
            </RequireRole>
          }
        />
        <Route
          path="/browse-gigs"
          element={
            <RequireRole roles={["talent"]}>
              <BrowseGigs />
            </RequireRole>
          }
        />
        <Route
          path="/submit-proposal/:gigId"
          element={
            <RequireRole roles={["talent"]}>
              <SubmitProposal />
            </RequireRole>
          }
        />
        <Route
          path="/invitations"
          element={
            <RequireAuth>
              <Invitations />
            </RequireAuth>
          }
        />
        <Route
          path="/messages"
          element={
            <RequireAuth>
              <Messages />
            </RequireAuth>
          }
        />
        <Route
          path="/admin"
          element={
            <RequireRole roles={["admin"]}>
              <AdminPanel />
            </RequireRole>
          }
        />
        <Route
          path="/contact"
          element={<Contact />}
        />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

const App = () => {
  const initializeAuth = useAuthStore(state => state.initialize);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <AnimatedRoutes />
        <CookieConsent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
