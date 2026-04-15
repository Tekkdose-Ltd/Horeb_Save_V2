import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { TokenRefreshIndicator } from "@/components/TokenRefreshIndicator";
import { useAuth } from "@/hooks/useAuth";
import { useTokenRefresh } from "@/hooks/useTokenRefresh";
import { useEffect } from "react";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import AuthPage from "@/pages/auth";
import Dashboard from "@/pages/dashboard";
import Groups from "@/pages/groups";
import GroupDetails from "@/pages/group-details";
import ManageGroup from "@/pages/manage-group";
import JoinGroup from "@/pages/join-group";
import InviteHandler from "@/pages/invite-handler";
import Transactions from "@/pages/transactions";
import Profile from "@/pages/profile";
import Notifications from "@/pages/notifications";
import Onboarding from "@/pages/onboarding";
import VerifyEmail from "@/pages/verify-email";
import TermsOfService from "@/pages/terms-of-service";
import PrivacyPolicy from "@/pages/privacy-policy";
import PaymentPolicy from "@/pages/payment-policy";
import GroupParticipationPolicy from "@/pages/group-participation-policy";
import AccountStatus from "@/pages/account-status";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [location, setLocation] = useLocation();
  
  // Enable automatic token refresh while user is active
  useTokenRefresh();

  // In development mode, allow access to all pages
  const isDev = import.meta.env.DEV;

  // List of public/auth pages that should not trigger profile completion redirect
  const publicPages = [
    '/',
    '/auth/register',
    '/auth/login',
    '/auth',
    '/login',
    '/register',
    '/verify-email',
    '/auth/verify-email',
    '/onboarding',
    '/terms',
    '/privacy',
    '/terms-of-service',
    '/privacy-policy',
    '/payment-policy',
    '/group-participation-policy',
    '/account-status',
  ];

  // Redirect to onboarding if profile is incomplete (only when authenticated)
  useEffect(() => {
    // Only apply redirect logic if user is authenticated and not loading
    if (!isLoading && isAuthenticated && user) {
      // Don't redirect if we're on a public/auth page
      const isPublicPage = publicPages.includes(location);
      
      // Check if profile is incomplete and not already on onboarding/public page
      if (!user.profileCompleted && !isPublicPage && location !== "/onboarding") {
        setLocation("/onboarding");
      }
      // If profile is complete and on onboarding, redirect to dashboard
      else if (user.profileCompleted && location === "/onboarding") {
        setLocation("/dashboard");
      }
    }
  }, [isLoading, isAuthenticated, user, location, setLocation]);

  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/auth/register" component={Onboarding} />
      <Route path="/auth/login" component={AuthPage} />
      <Route path="/auth/verify-email" component={VerifyEmail} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/login" component={AuthPage} />
      <Route path="/register" component={Onboarding} />
      <Route path="/verify-email" component={VerifyEmail} />
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/invite/:code" component={InviteHandler} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/groups" component={Groups} />
      <Route path="/groups/join" component={JoinGroup} />
      <Route path="/groups/:id/manage" component={ManageGroup} />
      <Route path="/groups/:id" component={GroupDetails} />
      <Route path="/transactions" component={Transactions} />
      <Route path="/profile" component={Profile} />
      <Route path="/notifications" component={Notifications} />
      <Route path="/terms" component={TermsOfService} />
      <Route path="/terms-of-service" component={TermsOfService} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/payment-policy" component={PaymentPolicy} />
      <Route path="/group-participation-policy" component={GroupParticipationPolicy} />
      <Route path="/account-status" component={AccountStatus} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <TokenRefreshIndicator />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
