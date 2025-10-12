import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { CreateGroupModal } from "@/components/CreateGroupModal";
import { GroupCard } from "@/components/GroupCard";
import { TrustScore } from "@/components/TrustScore";
import { ActivityFeed } from "@/components/ActivityFeed";
import { Users, PoundSterling, Clock, Star, Plus, Bell } from "lucide-react";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Redirect to home if not authenticated
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

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/user/stats"],
    retry: false,
  });

  const { data: groups, isLoading: groupsLoading } = useQuery({
    queryKey: ["/api/groups/my"],
    retry: false,
  });

  const { data: publicGroups } = useQuery({
    queryKey: ["/api/groups/public"],
    retry: false,
  });

  const { data: transactions } = useQuery({
    queryKey: ["/api/transactions/my"],
    retry: false,
  });

  const { data: notifications } = useQuery({
    queryKey: ["/api/notifications"],
    retry: false,
  });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const userName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User' : 'User';
  const unreadNotifications = notifications?.filter((n: any) => !n.isRead).length || 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Hero */}
        <div className="mb-8">
          <div className="gradient-bg rounded-xl p-6 text-white mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h2 className="text-2xl font-bold mb-2" data-testid="text-welcome">
                  Welcome back, {userName}!
                </h2>
                <p className="text-white/90">
                  You have {stats?.activeGroups || 0} active groups and £{stats?.totalSaved || 0} in contributions this month.
                </p>
              </div>
              <Button 
                onClick={() => setShowCreateModal(true)}
                className="mt-4 md:mt-0 bg-white text-primary px-6 py-2 rounded-lg font-semibold hover:bg-white/90 transition-colors"
                data-testid="button-create-group"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New Group
              </Button>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-border" data-testid="card-active-groups">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Users className="text-primary text-xl" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-muted-foreground">Active Groups</p>
                    <p className="text-2xl font-bold" data-testid="text-active-groups-count">
                      {statsLoading ? '...' : stats?.activeGroups || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-border" data-testid="card-total-saved">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                    <PoundSterling className="text-secondary text-xl" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-muted-foreground">Total Saved</p>
                    <p className="text-2xl font-bold" data-testid="text-total-saved">
                      £{statsLoading ? '...' : stats?.totalSaved || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-border" data-testid="card-next-payout">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                    <Clock className="text-accent text-xl" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-muted-foreground">Next Payout</p>
                    <p className="text-lg font-bold">TBD</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-border" data-testid="card-trust-score">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Star className="text-primary text-xl" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-muted-foreground">Trust Score</p>
                    <p className="text-2xl font-bold text-secondary" data-testid="text-trust-score">
                      {statsLoading ? '...' : (stats?.trustScore || 0).toFixed(1)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Groups */}
          <div className="lg:col-span-2">
            <Card className="border-border" data-testid="card-active-groups-list">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold">Active Groups</h3>
                  <Button variant="ghost" className="text-primary hover:text-primary/80 font-medium text-sm">
                    View All
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {groupsLoading ? (
                    <div className="space-y-4">
                      {[1, 2].map((i) => (
                        <div key={i} className="border border-border rounded-lg p-4 animate-pulse">
                          <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                          <div className="h-3 bg-muted rounded w-1/2 mb-4"></div>
                          <div className="h-2 bg-muted rounded w-full mb-4"></div>
                          <div className="flex justify-between">
                            <div className="h-6 bg-muted rounded w-20"></div>
                            <div className="h-4 bg-muted rounded w-24"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : groups && groups.length > 0 ? (
                    groups.map((group: any) => (
                      <GroupCard key={group.id} group={group} />
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">You haven't joined any groups yet.</p>
                      <Button onClick={() => setShowCreateModal(true)} data-testid="button-create-first-group">
                        Create Your First Group
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Payment Reminder */}
            {unreadNotifications > 0 && (
              <Card className="bg-accent/5 border-accent/20" data-testid="card-payment-reminder">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Bell className="text-accent" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-accent-foreground mb-1">You have notifications</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        You have {unreadNotifications} unread notifications.
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                        data-testid="button-view-notifications"
                      >
                        View Notifications
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Activity */}
            <ActivityFeed transactions={transactions} />

            {/* Trust Score */}
            <TrustScore stats={stats} />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Browse Groups */}
          <Card className="border-border" data-testid="card-browse-groups">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Discover New Groups</h3>
              
              <div className="space-y-3">
                {publicGroups && publicGroups.length > 0 ? (
                  publicGroups.slice(0, 2).map((group: any) => (
                    <div key={group.id} className="border border-border rounded-lg p-4 hover:shadow-sm transition-shadow cursor-pointer">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{group.name}</h4>
                        <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs">Open</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {group.memberCount}/{group.maxMembers} members • £{group.contributionAmount}/{group.frequency}
                      </p>
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-muted-foreground">
                          {group.maxMembers - group.memberCount} spots left
                        </div>
                        <Button variant="outline" size="sm" data-testid={`button-join-group-${group.id}`}>
                          Join Group
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">No public groups available at the moment.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Transaction History */}
          <Card className="border-border" data-testid="card-transaction-history">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Recent Transactions</h3>
                <Button variant="ghost" className="text-primary hover:text-primary/80 font-medium text-sm">
                  View All
                </Button>
              </div>
              
              <div className="space-y-3">
                {transactions && transactions.length > 0 ? (
                  transactions.slice(0, 3).map((transaction: any) => (
                    <div key={transaction.id} className="flex justify-between items-center py-2">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          transaction.type === 'contribution' ? 'bg-destructive/10' : 'bg-secondary/10'
                        }`}>
                          <PoundSterling className={`text-xs ${
                            transaction.type === 'contribution' ? 'text-destructive' : 'text-secondary'
                          }`} />
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {transaction.type === 'contribution' ? 'Contribution sent' : 'Payout received'}
                          </p>
                          <p className="text-xs text-muted-foreground">{transaction.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${
                          transaction.type === 'contribution' ? 'text-destructive' : 'text-secondary'
                        }`}>
                          {transaction.type === 'contribution' ? '-' : '+'}£{transaction.amount}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">No transactions yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <CreateGroupModal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)} 
      />
    </div>
  );
}
