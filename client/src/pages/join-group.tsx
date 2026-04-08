import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useBankDetailsRequired } from "@/hooks/useBankDetailsRequired";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { BankDetailsModal } from "@/components/BankDetailsModal";
import { Users, Check, AlertCircle } from "lucide-react";

export default function JoinGroup() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [, setLocation] = useLocation();
  const [inviteCode, setInviteCode] = useState("");
  const [pendingInviteCode, setPendingInviteCode] = useState<string | null>(null);
  
  const {
    showBankDetailsModal,
    setShowBankDetailsModal,
    requireBankDetails,
    handleBankDetailsSuccess,
  } = useBankDetailsRequired();

  // Get invite code from URL parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
      setInviteCode(code);
    }
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please login to join a group",
        variant: "destructive",
      });
      setLocation("/");
    }
  }, [isLoading, isAuthenticated, toast, setLocation]);

  const joinGroupMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await apiRequest("POST", "/groups/join", { 
        invitation_code: code 
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/groups/my"] });
      queryClient.invalidateQueries({ queryKey: ["/groups/my-active-groups"] });
      queryClient.invalidateQueries({ queryKey: ["/groups/public"] });
      queryClient.invalidateQueries({ queryKey: ["/user/stats"] });
      
      toast({
        title: "Success!",
        description: "You have successfully joined the group!",
      });
      
      // Redirect to groups page or group details
      setTimeout(() => {
        setLocation("/groups");
      }, 1500);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Join Group",
        description: error.message || "Invalid invitation code or group is full",
        variant: "destructive",
      });
    },
  });

  const handleJoinGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) {
      toast({
        title: "Invitation Code Required",
        description: "Please enter the invitation code",
        variant: "destructive",
      });
      return;
    }
    
    // Check if bank details are required
    const canProceed = requireBankDetails(() => {
      // If bank details exist, proceed with joining
      joinGroupMutation.mutate(inviteCode.trim());
    });

    // If bank details don't exist, store the code to join after completion
    if (!canProceed) {
      setPendingInviteCode(inviteCode.trim());
    }
  };

  const handleBankDetailsComplete = () => {
    handleBankDetailsSuccess(() => {
      // After bank details are saved, join with the pending code
      if (pendingInviteCode) {
        joinGroupMutation.mutate(pendingInviteCode);
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar className="w-64" />
        <div className="flex-1 min-w-0 pt-14 lg:pt-0">
          <Header />
          <main className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar className="w-64" />
      <div className="flex-1 min-w-0 pt-14 lg:pt-0">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Join a Group</CardTitle>
                    <CardDescription>
                      Enter your invitation code to join a savings group
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleJoinGroup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="invite-code">Invitation Code</Label>
                    <Input
                      id="invite-code"
                      type="text"
                      placeholder="Enter invite code (e.g., c34fe039-ee8c-...)"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value.trim())}
                      className="font-mono text-sm"
                      disabled={joinGroupMutation.isPending}
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter the invitation code shared by the group creator
                    </p>
                  </div>

                  {joinGroupMutation.isSuccess && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <Check className="w-5 h-5 text-green-600" />
                      <p className="text-sm text-green-900">
                        Successfully joined! Redirecting...
                      </p>
                    </div>
                  )}

                  {joinGroupMutation.isError && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <p className="text-sm text-red-900">
                        {(joinGroupMutation.error as any)?.message || "Failed to join group"}
                      </p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={!inviteCode.trim() || joinGroupMutation.isPending}
                  >
                    {joinGroupMutation.isPending ? "Joining..." : "Join Group"}
                  </Button>

                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground text-center">
                      Don't have an invitation code?{" "}
                      <Button
                        variant="link"
                        className="p-0 h-auto"
                        onClick={() => setLocation("/groups")}
                      >
                        Browse public groups
                      </Button>
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      <BankDetailsModal
        isOpen={showBankDetailsModal}
        onClose={() => setShowBankDetailsModal(false)}
        onSuccess={handleBankDetailsComplete}
        requirementContext="join_group"
      />
    </div>
  );
}
