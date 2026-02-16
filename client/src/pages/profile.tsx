import { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SecurityModal } from "@/components/SecurityModal";
import { BankDetailsModal } from "@/components/BankDetailsModal";
import { User, Mail, Shield, Award, Calendar, Camera, Upload, Loader2, Building2, CheckCircle2, AlertCircle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
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

export default function Profile() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [showSecurity, setShowSecurity] = useState(false);
  const [showBankDetails, setShowBankDetails] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile picture upload mutation
  const uploadProfilePictureMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('profileImage', file);

      const response = await fetch('/api/user/profile-image', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload image');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Profile picture updated successfully!",
      });
      // Refresh user data
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setUploadingImage(false);
    },
    onError: (error: any) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload profile picture. Please try again.",
        variant: "destructive",
      });
      setUploadingImage(false);
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file (JPG, PNG, GIF, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploadingImage(true);
    uploadProfilePictureMutation.mutate(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Delete account mutation
  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", "/api/auth/account");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Account Deletion Request Submitted",
        description: "Your request will be reviewed by our admin team within 3-5 working days.",
      });
      setShowDeleteConfirm(false);
      // Logout after successful deletion request
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit account deletion request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDeleteAccount = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDeleteAccount = () => {
    deleteAccountMutation.mutate();
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const userName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User' : 'User';

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar className="w-64" />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-profile-title">
              Profile Settings
            </h1>
            <p className="text-muted-foreground">
              Manage your account information and preferences.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-border" data-testid="card-profile-info">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-6">Personal Information</h2>

                  <div className="flex items-center space-x-6 mb-6">
                    <div className="relative group">
                      <img
                        src={user?.profileImageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=2563eb&color=fff`}
                        alt="Profile"
                        className="w-24 h-24 rounded-full object-cover border-4 border-border"
                        data-testid="img-profile-avatar"
                      />
                      {/* Upload overlay */}
                      <div
                        className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        onClick={triggerFileInput}
                      >
                        {uploadingImage ? (
                          <Loader2 className="w-8 h-8 text-white animate-spin" />
                        ) : (
                          <Camera className="w-8 h-8 text-white" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-1" data-testid="text-profile-name">
                        {user?.firstName}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3" data-testid="text-profile-email">
                        {user?.email}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={triggerFileInput}
                        disabled={uploadingImage}
                        data-testid="button-upload-photo"
                      >
                        {uploadingImage ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Photo
                          </>
                        )}
                      </Button>
                      <p className="text-xs text-muted-foreground mt-2">
                        JPG, PNG or GIF (max 5MB)
                      </p>
                    </div>
                    {/* Hidden file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      data-testid="input-profile-image"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                        <p className="text-foreground">
                          {user?.firstName || user?.lastName
                            ? `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim()
                            : "Not set"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Email</p>
                        <p className="text-foreground">{user?.email || 'Not set'}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Member Since</p>
                        <p className="text-foreground">
                          {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          }) : 'Unknown'}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border" data-testid="card-account-settings">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-6">Account Settings</h2>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">Payment Method</p>
                          {user?.bankDetailsVerified ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-yellow-600" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {user?.bankDetailsVerified 
                            ? 'Your payment method is linked and verified with Stripe'
                            : 'Join a group first to link your payment method for contributions and payouts'
                          }
                        </p>
                        {user?.bankAccountHolderName && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {user.bankName} •••• {user.bankAccountNumber?.slice(-4)}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setLocation('/groups')}
                        data-testid="button-bank-details"
                      >
                        {user?.bankAccountHolderName ? 'View Groups' : 'Join a Group'}
                      </Button>
                    </div>

                    <div className="h-px bg-border" />

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-muted-foreground">Receive updates about your groups and payments</p>
                      </div>
                      <Button variant="outline" size="sm" data-testid="button-email-notifications">
                        Configure
                      </Button>
                    </div>

                    <div className="h-px bg-border" />

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Security</p>
                        <p className="text-sm text-muted-foreground">Update your password and security settings</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowSecurity(true)}
                        data-testid="button-security"
                      >
                        Update
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="border-border" data-testid="card-trust-score">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Award className="text-primary text-xl" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Trust Score</p>
                      <p className="text-2xl font-bold text-primary" data-testid="text-trust-score-value">
                        {user?.trustScore || '0.0'}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Your trust score is based on your payment history and completed groups.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border" data-testid="card-stats">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Account Statistics</h3>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Completed Groups</span>
                      <span className="font-semibold" data-testid="text-completed-groups">
                        {user?.totalGroupsCompleted || 0}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">On-time Payment Rate</span>
                      <span className="font-semibold" data-testid="text-payment-rate">
                        {user?.onTimePaymentRate || '0'}%
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Account Status</span>
                      <span className="font-semibold text-secondary">Active</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-destructive/5 border-destructive/20" data-testid="card-danger-zone">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-3">
                    <Shield className="w-5 h-5 text-destructive mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-destructive mb-2">Danger Zone</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Permanently delete your account and all associated data.
                      </p>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={handleDeleteAccount}
                        data-testid="button-delete-account"
                      >
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>

      <SecurityModal
        isOpen={showSecurity}
        onClose={() => setShowSecurity(false)}
      />

      <BankDetailsModal
        isOpen={showBankDetails}
        onClose={() => setShowBankDetails(false)}
        requirementContext="profile"
      />

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="max-w-lg" data-testid="dialog-delete-account">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              Delete Account - Important Notice
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4 text-left">
              <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-900 rounded-lg p-4">
                <p className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                  ⚠️ Before You Proceed
                </p>
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  Make sure that <strong>all payment cycles have been completed</strong> before you delete your account. 
                  According to our policy, all cycles must be fulfilled before leaving a group or deleting your account 
                  to mitigate fraudulent activities.
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">
                  Account Deletion Process:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Your request will be reviewed by our super admin</li>
                  <li>Approval will take <strong>3-5 working days</strong></li>
                  <li>All active group memberships must be settled</li>
                  <li>Outstanding payments must be completed</li>
                </ul>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-900 rounded-lg p-3">
                <p className="text-xs text-blue-900 dark:text-blue-100">
                  📄 Please refer to our <strong>Terms & Conditions</strong> and <strong>Policy Document</strong> for 
                  complete details on account deletion requirements and group participation obligations.
                </p>
              </div>

              <p className="text-sm text-muted-foreground">
                Are you sure you want to proceed with this account deletion request?
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteAccount}
              disabled={deleteAccountMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              {deleteAccountMutation.isPending ? "Submitting..." : "Yes, Delete My Account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
