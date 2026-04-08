import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { apiRequest, queryClient, getUserGroups, getUserActiveGroups, getPublicGroups, getUserTransactions } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { CreateGroupModal } from "@/components/CreateGroupModal";
import { GroupCard } from "@/components/GroupCard";
import { TrustScore } from "@/components/TrustScore";
import { ActivityFeed } from "@/components/ActivityFeed";
import { PayoutRotation } from "@/components/PayoutRotation";
import { RecentRatings } from "@/components/RecentRatings";
import { AdminApprovalWidget } from "@/components/AdminApprovalWidget";
import { Users, PoundSterling, Clock, Star, Plus, Bell } from "lucide-react";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [, setLocation] = useLocation();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [joiningGroupId, setJoiningGroupId] = useState<string | null>(null);

  // Don't redirect if authenticated - let queries fail gracefully
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !user) {
      toast({
        title: "Unauthorized",
        description: "Please log in to continue",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, user, toast]);

  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ["/user/stats"],
    retry: false,
    enabled: !!user, // Only fetch if user exists
  });

  // Fetch active groups count for stats card
  const { data: activeGroups, isLoading: activeGroupsLoading } = useQuery({
    queryKey: ["/groups/my-active-groups"],
    queryFn: getUserActiveGroups,
    retry: false,
    enabled: !!user, // Only fetch if user exists
  });

  const { data: groups, isLoading: groupsLoading, error: groupsError } = useQuery({
    queryKey: ["/groups/my"],
    queryFn: getUserGroups,
    retry: false,
    enabled: !!user, // Only fetch if user exists
  });

  const { data: publicGroups } = useQuery({
    queryKey: ["/groups/public"],
    queryFn: getPublicGroups,
    retry: false,
    enabled: !!user, // Only fetch if user exists
  });

  const { data: transactions } = useQuery({
    queryKey: ["/payment/transaction/my"],
    queryFn: getUserTransactions,
    retry: false,
    enabled: !!user, // Only fetch if user exists
  });

  const { data: notifications } = useQuery({
    queryKey: ["/notifications"],
    retry: false,
    enabled: !!user, // Only fetch if user exists
  });

  const { data: userRatings, isLoading: ratingsLoading } = useQuery({
    queryKey: ["/user/ratings/received"],
    enabled: !!user?.id,
    retry: false,
  });

  const joinGroupMutation = useMutation({
    mutationFn: async (inviteCode: string) => {
      // Redirect to join page with invite code
      setLocation(`/groups/join?code=${inviteCode}`);
      return Promise.resolve();
    },
    onError: (error: any) => {
      setJoiningGroupId(null);
      toast({
        title: "Error",
        description: error.message || "Failed to redirect to join page",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // If not authenticated and no user data, return null (redirect will handle it)
  if (!isAuthenticated && !user) {
    return null;
  }

  const userName = user?.firstName || (user as any)?.first_name || 'User';
  const unreadNotifications = Array.isArray(notifications) ? notifications.filter((n: any) => !n.isRead).length : 0;

  return (
    <div className="flex min-h-screen bg-zinc-100">
      {/* Sidebar (handles its own mobile/desktop rendering) */}
      <Sidebar className="w-64" />

      {/* Main Content — offset on mobile for the fixed top bar */}
      <div className="flex-1 min-w-0 pt-14 lg:pt-0">
        <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
          {/* Dashboard Hero */}
          <div className="mb-6 sm:mb-8">
            <div className="relative bg-primary rounded-xl p-6 sm:p-8 lg:p-12 text-white mb-6 overflow-hidden">

              {/* Top-left SVG */}
              <div className="absolute top-0 left-0 z-0">
                <svg
                  width="153"
                  height="96"
                  viewBox="0 0 153 96"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M-6 85.2178V13C-6 5.8203 -0.179702 0 7 0H153C153 0 127.01 51.527 113.76 42.9392C100.51 34.3514 96.8548 17.2389 78.5962 24.4423C60.3375 31.6457 66.3938 61.5772 55.1538 66.0603C43.9138 70.5434 29.6731 41.618 22.5385 47.5634C15.4038 53.5089 13.7246 90.6185 10.3077 95.1269C6.89082 99.6352 -6 85.2178 -6 85.2178Z"
                    fill="white"
                    fillOpacity="0.31"
                  />
                </svg>
              </div>

              <div className="hidden md:block absolute bottom-12 -right-[32rem] h-full w-full scale-y-112">
                <img
                  src="/images/442dfe608d3d6b6c6453f02262602dcfdbe48cf1.png"
                  alt="Banner illustration"
                  className="w-full object-cover"
                />
              </div>

              {/* Left content */}
              <div className="relative z-10 max-w-full md:max-w-[55%]">
                <h2
                  className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2"
                  data-testid="text-welcome"
                >
                  Welcome back, {userName}!
                </h2>

                <p className="text-white/90 text-sm sm:text-base lg:text-lg mb-4 sm:mb-6">
                  You have{' '}
                  {typeof stats === 'object' && stats !== null && 'activeGroups' in stats
                    ? (stats as any).activeGroups
                    : 0}{' '}
                  active groups and £
                  {typeof stats === 'object' && stats !== null && 'totalSaved' in stats
                    ? (stats as any).totalSaved
                    : 0}{' '}
                  in contributions this month.
                </p>

                <Button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-white text-primary px-4 sm:px-6 py-2 rounded-sm font-semibold hover:bg-white/90 transition-colors text-sm sm:text-base"
                  data-testid="button-create-group"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Group
                </Button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <Card className="border-border" data-testid="card-active-groups">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Users className="text-primary w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="ml-3 sm:ml-4 min-w-0">
                      <p className="text-xs sm:text-sm text-muted-foreground">Active Groups</p>
                      <p className="text-xl sm:text-2xl font-bold" data-testid="text-active-groups-count">
                        {groupsLoading ? '...' : (Array.isArray(groups) ? groups.length : 0)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border" data-testid="card-total-saved">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-secondary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <PoundSterling className="text-secondary w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="ml-3 sm:ml-4 min-w-0">
                      <p className="text-xs sm:text-sm text-muted-foreground">Total Saved</p>
                      <p className="text-xl sm:text-2xl font-bold" data-testid="text-total-saved">
                        £{statsLoading ? '...' : (typeof stats === 'object' && stats !== null && 'totalSaved' in stats ? (stats as any).totalSaved : 0)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border" data-testid="card-next-payout">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="text-accent w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="ml-3 sm:ml-4 min-w-0">
                      <p className="text-xs sm:text-sm text-muted-foreground">Next Payout</p>
                      <p className="text-base sm:text-lg font-bold">TBD</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border" data-testid="card-trust-score">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Star className="text-primary w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="ml-3 sm:ml-4 min-w-0">
                      <p className="text-xs sm:text-sm text-muted-foreground">Trust Score</p>
                      <p className="text-xl sm:text-2xl font-bold text-secondary" data-testid="text-trust-score">
                        {statsLoading ? '...' : (typeof stats === 'object' && stats !== null && 'trustScore' in stats ? ((stats as any).trustScore || 0).toFixed(1) : '0.0')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Active Groups */}
            <div className="lg:col-span-2">
              <Card className="border-border" data-testid="card-active-groups-list">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex justify-between items-center mb-4 sm:mb-6">
                    <h3 className="text-lg sm:text-xl font-bold">Active Groups</h3>
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
                    ) : Array.isArray(groups) && groups.length > 0 ? (
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

              {/* Payout Rotation Section */}
              <div className="mt-4 sm:mt-6">
                <PayoutRotation />
              </div>
            </div>

            {/* Right sidebar widgets */}
            <div className="space-y-4 sm:space-y-6">
              <AdminApprovalWidget />

              {unreadNotifications > 0 && (
                <Card className="bg-accent/5 border-accent/20" data-testid="card-payment-reminder">
                  <CardContent className="p-4 sm:p-6">
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

              <ActivityFeed transactions={Array.isArray(transactions) ? transactions : undefined} />
              <TrustScore
                stats={typeof stats === 'object' && stats !== null && 'trustScore' in stats ? (stats as any) : undefined}
                user={user || undefined}
              />
              <RecentRatings
                ratings={Array.isArray(userRatings) ? userRatings : undefined}
                isLoading={ratingsLoading}
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 sm:mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Browse Groups */}
            <Card className="border-border" data-testid="card-browse-groups">
              <CardContent className="p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold mb-4">Discover New Groups</h3>
                <div className="space-y-3">
                  {Array.isArray(publicGroups) && publicGroups.length > 0 ? (
                    publicGroups.slice(0, 2).map((group: any) => (
                      <div key={group.id} className="border border-border rounded-lg p-3 sm:p-4 hover:shadow-sm transition-shadow cursor-pointer">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-sm sm:text-base">{group.name}</h4>
                          <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs">Open</span>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                          {group.memberCount}/{group.maxMembers} members • £{group.contributionAmount}/{group.frequency}
                        </p>
                        <div className="flex justify-between items-center">
                          <div className="text-xs sm:text-sm text-muted-foreground">
                            {group.maxMembers - group.memberCount} spots left
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (group.inviteCode || group.invite_code) {
                                setJoiningGroupId(group.id);
                                joinGroupMutation.mutate(group.inviteCode || group.invite_code);
                              } else {
                                toast({
                                  title: "Error",
                                  description: "This group doesn't have an invite code",
                                  variant: "destructive",
                                });
                              }
                            }}
                            disabled={group.memberCount >= group.maxMembers || joiningGroupId === group.id}
                            data-testid={`button-join-group-${group.id}`}
                          >
                            {joiningGroupId === group.id ? 'Joining...' : 'Join Group'}
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
              <CardContent className="p-4 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base sm:text-lg font-semibold">Recent Transactions</h3>
                  <Button variant="ghost" className="text-primary hover:text-primary/80 font-medium text-sm">
                    View All
                  </Button>
                </div>
                <div className="space-y-3">
                  {Array.isArray(transactions) && transactions.length > 0 ? (
                    transactions.slice(0, 3).map((transaction: any) => (
                      <div key={transaction.id} className="flex justify-between items-center py-2">
                        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${transaction.type === 'contribution' ? 'bg-destructive/10' : 'bg-secondary/10'}`}>
                            <PoundSterling className={`text-xs ${transaction.type === 'contribution' ? 'text-destructive' : 'text-secondary'}`} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-medium truncate">
                              {transaction.type === 'contribution' ? 'Contribution sent' : 'Payout received'}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">{transaction.description}</p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          <p className={`text-xs sm:text-sm font-medium ${transaction.type === 'contribution' ? 'text-destructive' : 'text-secondary'}`}>
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
    </div>
  );
}
