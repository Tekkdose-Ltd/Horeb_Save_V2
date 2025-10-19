import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Groups from "@/pages/groups";
import GroupDetails from "@/pages/group-details";
import ManageGroup from "@/pages/manage-group";
import Transactions from "@/pages/transactions";
import Profile from "@/pages/profile";
import Notifications from "@/pages/notifications";
import Onboarding from "@/pages/onboarding";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [location, setLocation] = useLocation();

  // Redirect to onboarding if profile is incomplete
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      // Check if profile is incomplete and not already on onboarding page
      if (!user.profileCompleted && location !== "/onboarding") {
        setLocation("/onboarding");
      }
      // If profile is complete and on onboarding, redirect to dashboard
      if (user.profileCompleted && location === "/onboarding") {
        setLocation("/dashboard");
      }
    }
  }, [isLoading, isAuthenticated, user, location, setLocation]);

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/onboarding" component={Onboarding} />
          <Route path="/" component={Dashboard} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/groups" component={Groups} />
          <Route path="/groups/:id" component={GroupDetails} />
          <Route path="/groups/:id/manage" component={ManageGroup} />
          <Route path="/transactions" component={Transactions} />
          <Route path="/profile" component={Profile} />
          <Route path="/notifications" component={Notifications} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
