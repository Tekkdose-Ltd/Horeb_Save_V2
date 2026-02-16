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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Shield, 
  Lock, 
  LogOut, 
  Monitor, 
  Smartphone,
  AlertCircle,
  Eye,
  EyeOff
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
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const { data: sessions = [], isLoading } = useQuery<any[]>({
    queryKey: ["/sessions"],
    enabled: isOpen,
  });

  // Change password mutation (using dummy API for now)
  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      // TODO: Replace with actual API endpoint when backend is ready
      // const response = await apiRequest("POST", "/auth/change-password", data);
      // return response.json();
      
      // Dummy API - simulate success after 1 second
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ success: true, message: "Password changed successfully" });
        }, 1000);
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Your password has been changed successfully!",
      });
      setShowPasswordForm(false);
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to change password. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      });
      return;
    }
    
    changePasswordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });
  };

  const logoutAllMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/auth/logout-all");
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
                  {!showPasswordForm ? (
                    <>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium">Password</p>
                          <p className="text-sm text-muted-foreground">
                            Update your password to keep your account secure
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowPasswordForm(true)}
                          data-testid="button-change-password"
                        >
                          Change Password
                        </Button>
                      </div>

                      <Separator />

                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium">Two-Factor Authentication</p>
                          <p className="text-sm text-muted-foreground">
                            Add an extra layer of security to your account
                          </p>
                          <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded">
                            Coming Soon
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled
                          data-testid="button-2fa-settings"
                        >
                          Configure
                        </Button>
                      </div>
                    </>
                  ) : (
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="current-password">Current Password</Label>
                        <div className="relative">
                          <Input
                            id="current-password"
                            type={showCurrentPassword ? "text" : "password"}
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                            placeholder="Enter current password"
                            required
                            data-testid="input-current-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <div className="relative">
                          <Input
                            id="new-password"
                            type={showNewPassword ? "text" : "password"}
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            placeholder="Enter new password"
                            required
                            minLength={8}
                            data-testid="input-new-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Must be at least 8 characters long
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                        <div className="relative">
                          <Input
                            id="confirm-password"
                            type={showConfirmPassword ? "text" : "password"}
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            placeholder="Confirm new password"
                            required
                            data-testid="input-confirm-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          type="submit"
                          disabled={changePasswordMutation.isPending}
                          data-testid="button-submit-password"
                        >
                          {changePasswordMutation.isPending ? "Updating..." : "Update Password"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setShowPasswordForm(false);
                            setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
                          }}
                          data-testid="button-cancel-password"
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  )}
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

            {/* Security Tips */}
            <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-900 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                    Security Tips
                  </h4>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• Use a strong, unique password for your account</li>
                    <li>• Change your password regularly to maintain security</li>
                    <li>• Regularly review your active sessions</li>
                    <li>• Logout from all devices if you suspect unauthorized access</li>
                    <li>• Two-factor authentication will be available soon for enhanced security</li>
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
