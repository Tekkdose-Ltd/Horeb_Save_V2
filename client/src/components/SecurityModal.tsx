import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Shield, 
  Lock, 
  LogOut, 
  ExternalLink, 
  Monitor, 
  Smartphone,
  AlertCircle
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SecurityModal({ isOpen, onClose }: SecurityModalProps) {
  const { toast } = useToast();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const { data: sessions = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/sessions"],
    enabled: isOpen,
  });

  const logoutAllMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/auth/logout-all");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Logging out all sessions...",
      });
      // Force reload to clear all state and trigger authentication check
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to logout all sessions",
        variant: "destructive",
      });
    },
  });

  const handleLogoutAll = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogoutAll = () => {
    logoutAllMutation.mutate();
    setShowLogoutConfirm(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="modal-security">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Security Settings
            </DialogTitle>
            <DialogDescription>
              Manage your account security and privacy settings.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Password & Authentication Section */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Password & Authentication
              </h3>
              <Card className="p-4">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium">Password</p>
                      <p className="text-sm text-muted-foreground">
                        Your password is managed through your Replit account
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open("https://replit.com/account", "_blank")}
                      data-testid="button-change-password"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Replit Settings
                    </Button>
                  </div>

                  <Separator />

                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open("https://replit.com/account/security", "_blank")}
                      data-testid="button-2fa-settings"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Configure
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Active Sessions Section */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Active Sessions</h3>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : (
                <Card className="p-4">
                  <div className="space-y-4">
                    {sessions && sessions.length > 0 ? (
                      sessions.map((session: any, index: number) => (
                        <div key={session.sid || index} className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mt-1">
                              {session.isCurrent ? (
                                <Monitor className="w-5 h-5 text-primary" />
                              ) : (
                                <Smartphone className="w-5 h-5 text-primary" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">
                                {session.isCurrent ? "Current Session" : "Other Session"}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Last active: {new Date(session.lastActive).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-sm text-muted-foreground">
                          Current session information unavailable
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              <Button
                variant="outline"
                className="w-full mt-3"
                onClick={handleLogoutAll}
                disabled={logoutAllMutation.isPending}
                data-testid="button-logout-all"
              >
                <LogOut className="w-4 h-4 mr-2" />
                {logoutAllMutation.isPending ? "Logging out..." : "Logout All Devices"}
              </Button>
            </div>

            {/* Privacy Settings Section */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Privacy Settings</h3>
              <Card className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium">Profile Visibility</p>
                      <p className="text-sm text-muted-foreground">
                        Control who can see your profile information
                      </p>
                    </div>
                    <Button variant="outline" size="sm" data-testid="button-profile-visibility">
                      Members Only
                    </Button>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium">Transaction History</p>
                      <p className="text-sm text-muted-foreground">
                        Who can view your transaction history
                      </p>
                    </div>
                    <Button variant="outline" size="sm" data-testid="button-transaction-privacy">
                      Private
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Security Tips */}
            <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-900 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                    Security Tips
                  </h4>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• Enable two-factor authentication for enhanced security</li>
                    <li>• Regularly review your active sessions</li>
                    <li>• Use a strong, unique password for your Replit account</li>
                    <li>• Logout from all devices if you suspect unauthorized access</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <AlertDialogContent data-testid="dialog-logout-confirm">
          <AlertDialogHeader>
            <AlertDialogTitle>Logout All Devices?</AlertDialogTitle>
            <AlertDialogDescription>
              This will log you out of all active sessions on all devices. You will need to log in again to access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-logout">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmLogoutAll}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-logout"
            >
              Logout All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
