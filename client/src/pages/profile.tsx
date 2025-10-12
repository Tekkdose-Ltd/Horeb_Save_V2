import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PaymentMethodsModal } from "@/components/PaymentMethodsModal";
import { User, Mail, Shield, Award, Calendar } from "lucide-react";

export default function Profile() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
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
    <div className="min-h-screen bg-background">
      <Header />
      
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
                
                <div className="flex items-center space-x-4 mb-6">
                  <img 
                    src={user?.profileImageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=2563eb&color=fff`}
                    alt="Profile" 
                    className="w-20 h-20 rounded-full object-cover"
                    data-testid="img-profile-avatar"
                  />
                  <div>
                    <h3 className="text-lg font-semibold" data-testid="text-profile-name">
                      {userName}
                    </h3>
                    <p className="text-sm text-muted-foreground" data-testid="text-profile-email">
                      {user?.email}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                      <p className="text-foreground">{userName || 'Not set'}</p>
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
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-muted-foreground">Receive updates about your groups and payments</p>
                    </div>
                    <Button variant="outline" size="sm" data-testid="button-email-notifications">
                      Configure
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Payment Methods</p>
                      <p className="text-sm text-muted-foreground">Manage your saved payment methods</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setShowPaymentMethods(true)}
                      data-testid="button-payment-methods"
                    >
                      Manage
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Security</p>
                      <p className="text-sm text-muted-foreground">Update your password and security settings</p>
                    </div>
                    <Button variant="outline" size="sm" data-testid="button-security">
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
                    <Button variant="destructive" size="sm" data-testid="button-delete-account">
                      Delete Account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <PaymentMethodsModal 
        isOpen={showPaymentMethods} 
        onClose={() => setShowPaymentMethods(false)} 
      />
    </div>
  );
}
