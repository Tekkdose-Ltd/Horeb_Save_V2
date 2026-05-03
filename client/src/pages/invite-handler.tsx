import { useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

/**
 * Invite Handler Component
 * 
 * This component handles incoming invite links with UUID codes.
 * It checks the user's authentication status and redirects accordingly:
 * 
 * - Unauthenticated users → Registration page with invite code preserved
 *   Shows a toast informing them they need to sign up first
 * - Authenticated users → Group join page to directly join the group
 * 
 * Route: /invite/:code
 * Example URL: https://horebsave.com/invite/c34fe039-ee8c-4fa9-aaac-9d38c5ac7069
 */
export default function InviteHandler() {
  const [match, params] = useRoute("/invite/:code");
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading, user } = useAuth();
  const { toast } = useToast();
  const inviteCode = match ? (params as { code: string }).code : null;

  useEffect(() => {
    // Wait for auth check to complete
    if (isLoading) return;

    // If no invite code, redirect to groups page
    if (!inviteCode) {
      setLocation("/groups");
      return;
    }

    // Route based on authentication status
    if (isAuthenticated && user) {
      // User is logged in → Verify they have an account and direct to join page
      toast({
        title: "Welcome back!",
        description: `Hi ${user.firstName || 'there'}, you're being directed to join the group.`,
      });
      setLocation(`/groups/join?code=${inviteCode}`);
    } else {
      // User is not logged in → Store invite code and show toast
      // Store the invite code for after login/registration
      localStorage.setItem('pendingInvite', inviteCode);
      
      toast({
        title: "Sign Up or Log In Required",
        description: "You need to create an account or log in before you can join a group.",
        variant: "default",
        duration: 6000,
      });
      
      // Redirect to registration with invite code (user can switch to login tab)
      setLocation(`/register?invite=${inviteCode}`);
    }
  }, [isAuthenticated, isLoading, inviteCode, user, setLocation, toast]);

  // Show loading state while checking authentication
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Processing Invite...
              </h2>
              <p className="text-sm text-gray-600 mt-2">
                Please wait while we redirect you
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
