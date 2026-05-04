import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { getUserGroups } from "@/lib/queryClient";
import { Sidebar } from "@/components/Sidebar";
import { MemberRatingModal } from "@/components/MemberRatingModal";
import { BankDetailsModal } from "@/components/BankDetailsModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  ArrowLeft, Users, PoundSterling, Calendar, 
  Clock, TrendingUp, Settings, Star, CreditCard, Share2
} from "lucide-react";

export default function GroupDetails() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [match, params] = useRoute("/groups/:id");
  const [, setLocation] = useLocation();
  const groupId = match ? (params as { id: string }).id : null;
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [showPaymentLinkModal, setShowPaymentLinkModal] = useState(false);

  // Handle invite link generation and sharing
  const handleShareInvite = () => {
    if (!groupData?.inviteCode) {
      toast({
        title: "Invite Code Unavailable",
        description: "Unable to generate invite link. Please try again later.",
        variant: "destructive",
      });
      return;
    }

    // ⚠️ IMPORTANT: Change this URL when going live
    // Development: window.location.origin (localhost:5000)
    // Production: Replace with your live domain (e.g., 'https://horebsave.com')
    const baseUrl = window.location.origin; // TODO: Change to 'https://horebsave.com' for production
    
    // Create invite URL with UUID code parameter
    // This route handles both new users (redirects to register) and existing users (redirects to group join)
    const inviteUrl = `${baseUrl}/invite/${groupData.inviteCode}`;
    const inviteMessage = `Join my savings group "${groupData?.name}" on Horeb Save!\n\n🔗 Click here to join: ${inviteUrl}\n\nInvitation Code: ${groupData.inviteCode}`;
    
    // Try to use Web Share API if available
    if (navigator.share) {
      navigator.share({
        title: `Join ${groupData?.name}`,
        text: inviteMessage,
      }).catch((error) => {
        // If share fails, fall back to clipboard
        copyInviteLink(inviteUrl, inviteMessage);
      });
    } else {
      // Fallback to clipboard copy
      copyInviteLink(inviteUrl, inviteMessage);
    }
  };

  const copyInviteLink = (url: string, message: string) => {
    navigator.clipboard.writeText(message).then(() => {
      toast({
        title: "Invite Link Copied!",
        description: "Share this link with people you want to invite to your group.",
      });
    }).catch(() => {
      toast({
        title: "Copy Failed",
        description: "Please manually share the link: " + url,
        variant: "destructive",
      });
    });
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to view group details",
        variant: "destructive",
      });
      setLocation("/");
    }
  }, [isLoading, isAuthenticated, toast, setLocation]);

  // Fetch all user groups
  const { data: groups, isLoading: groupsLoading, error: groupsError } = useQuery<any[]>({
    queryKey: ["/groups/my"],
    queryFn: getUserGroups,
    enabled: isAuthenticated,
    retry: false,
  });

  // Find the specific group from the list
  const group = groups?.find(g => (g._id || g.id) === groupId);
  const groupLoading = groupsLoading;
  const groupError = groupsError;

  // Extract group data - handle both snake_case and camelCase
  const groupData = group ? {
    id: group._id || group.id,
    name: group.name,
    description: group.description,
    status: group.group_status || group.status || 'draft',
    creatorId: group.creator_id || group.creatorId,
    contributionAmount: group.contribution_amount || group.contributionAmount || 0,
    frequency: group.frequency,
    memberCount: group.members?.length || 0,
    maxMembers: group.max_number_of_members || group.maxMembers || 0,
    currentRound: group.current_round || group.currentRound || 0,
    totalRounds: group.total_round || group.totalRounds || 0,
    nextPayoutDate: group.next_payout_date || group.nextPayoutDate,
    startDate: group.start_date || group.startDate,
    contributionsActive: group.active_contribution_id !== null || group.contributionsActive,
    inviteCode: group.invite_code || group.inviteCode,
    members: group.members || []
  } : null;

  const members = groupData?.members || [];

  if (isLoading || groupLoading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar className="w-64" />
        <div className="flex-1 min-w-0 pt-14 lg:pt-0">
          <main className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!groupData) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar className="w-64" />
        <div className="flex-1 min-w-0 pt-14 lg:pt-0">
          <main className="container mx-auto px-4 py-8">
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold mb-4">
                {groupError ? 'Error Loading Group' : 'Group Not Found'}
              </h2>
              {groupError && (
                <p className="text-muted-foreground mb-4">
                  {(groupError as any)?.message || 'Failed to load group details'}
                </p>
              )}
              <Button onClick={() => setLocation("/groups")} data-testid="button-back-groups">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Groups
              </Button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const progress = groupData.totalRounds 
    ? ((groupData.currentRound || 1) / groupData.totalRounds) * 100 
    : 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-secondary/10 text-secondary">Active</Badge>;
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'completed':
        return <Badge className="bg-primary/10 text-primary">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-GB', { 
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Check if current user is admin by looking in members array
  const currentUserMember = members.find((m: any) => {
    // Member structure: { id: { _id: "user_id", ... }, isAdmin: true, _id: "member_id" }
    const memberUserId = m.id?._id || m.id?.id || m.user_id || m.userId || m._id || m.id;
    const userId = (user as any)?._id || user?.id;
    return memberUserId === userId;
  });
  
  const isAdmin = currentUserMember?.isAdmin || currentUserMember?.is_admin || false;

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar className="w-64" />
      
      {/* Main Content */}
      <div className="flex-1 min-w-0 pt-14 lg:pt-0">
        <main className="container mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => setLocation("/groups")}
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Groups
          </Button>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-0">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                    <CardTitle className="text-2xl sm:text-3xl" data-testid="text-group-name">
                      {groupData.name}
                    </CardTitle>
                    {getStatusBadge(groupData.status)}
                  </div>
                  {groupData.description && (
                    <p className="text-muted-foreground mt-2" data-testid="text-group-description">
                      {groupData.description}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 sm:ml-4 sm:flex-nowrap">
                  {isAdmin && (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleShareInvite}
                        data-testid="button-share-invite"
                        className="flex-1 sm:flex-none"
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Invite
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setLocation(`/groups/${groupId}/manage`)}
                        data-testid="button-manage-group"
                        className="flex-1 sm:flex-none"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Manage Group
                      </Button>
                    </>
                  )}
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => setShowPaymentLinkModal(true)}
                    data-testid="button-link-payment"
                    className="flex-1 sm:flex-none"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Link Payment
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Members</p>
                    <p className="text-2xl font-semibold" data-testid="text-member-count">
                      {groupData.memberCount}/{groupData.maxMembers}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                    <PoundSterling className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Contribution</p>
                    <p className="text-2xl font-semibold" data-testid="text-contribution">
                      £{groupData.contributionAmount}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Frequency</p>
                    <p className="text-xl font-semibold capitalize" data-testid="text-frequency">
                      {groupData.frequency}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Pool</p>
                    <p className="text-2xl font-semibold" data-testid="text-total-pool">
                      £{(parseFloat(String(groupData.contributionAmount)) * groupData.maxMembers).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invite Section - visible to all members */}
          {groupData.memberCount < groupData.maxMembers && (
            <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
              <CardContent className="py-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0 sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                      <Share2 className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold">Grow the Group</p>
                      <p className="text-sm text-muted-foreground">
                        {groupData.maxMembers - groupData.memberCount} spot{groupData.maxMembers - groupData.memberCount !== 1 ? 's' : ''} remaining
                      </p>
                    </div>
                  </div>
                  <Button 
                    onClick={handleShareInvite}
                    size="sm"
                    className="w-full sm:w-auto"
                    data-testid="button-share-invite-inline"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Invite Link
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {groupData.status === 'active' && (
            <Card>
              <CardHeader>
                <CardTitle>Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Round Progress</span>
                    <span className="font-medium" data-testid="text-round-progress">
                      Round {groupData.currentRound || 1} of {groupData.totalRounds}
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Next payout:</span>
                  <span className="font-medium" data-testid="text-next-payout">
                    {formatDate(groupData.nextPayoutDate)}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Contribution Auto-Collection */}
          {groupData.status === 'active' && groupData.contributionsActive && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Contributions Auto-Collected
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Amount Due</p>
                  <p className="text-3xl font-bold text-primary">
                    £{parseFloat(String(groupData.contributionAmount)).toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Payment frequency: {groupData.frequency}
                  </p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-900">
                    🔒 <strong>Automatic Payments:</strong> Contributions are collected from your linked card.
                    No manual “Pay Now” action is required.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payout Schedule/Rotation */}
          {group.status === 'active' && members && members.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Payout Schedule & Rotation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                    <h4 className="font-semibold mb-2 text-primary">Next Payout</h4>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Recipient</p>
                        <p className="font-medium text-lg">
                          {(() => {
                            const nextRecipient = members.find((m: any) => 
                              (m.payout_order || m.payoutOrder) === groupData.currentRound
                            );
                            if (!nextRecipient) return 'To be determined';
                            const memberData = nextRecipient.id || nextRecipient;
                            const firstName = memberData.firstName || memberData.first_name || '';
                            const lastName = memberData.lastName || memberData.last_name || '';
                            return `${firstName} ${lastName}`;
                          })()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Amount</p>
                        <p className="text-2xl font-bold text-primary">
                          £{(parseFloat(String(groupData.contributionAmount)) * groupData.memberCount).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-primary/20">
                      <p className="text-sm text-muted-foreground">
                        <Clock className="w-4 h-4 inline mr-1" />
                        Expected date: {formatDate(groupData.nextPayoutDate)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Complete Rotation Order</h4>
                    <div className="grid gap-2">
                      {members
                        .sort((a: any, b: any) => {
                          const aOrder = a.payout_order || a.payoutOrder || 0;
                          const bOrder = b.payout_order || b.payoutOrder || 0;
                          return aOrder - bOrder;
                        })
                        .map((member: any, index: number) => {
                          const memberPayoutOrder = member.payout_order || member.payoutOrder || (index + 1);
                          const isPast = memberPayoutOrder < (groupData.currentRound || 1);
                          const isCurrent = memberPayoutOrder === (groupData.currentRound || 1);
                          const memberId = member.id?._id || member._id || member.id;
                          const memberData = member.id || member;
                          const firstName = memberData.firstName || memberData.first_name || '';
                          const lastName = memberData.lastName || memberData.last_name || '';
                          
                          return (
                            <div 
                              key={memberId}
                              className={`flex items-center justify-between p-3 rounded-lg border ${
                                isCurrent ? 'bg-primary/10 border-primary' : 
                                isPast ? 'bg-muted/50 opacity-60' : 
                                'bg-background'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                                  isCurrent ? 'bg-primary text-white' :
                                  isPast ? 'bg-muted text-muted-foreground' :
                                  'bg-secondary/10 text-secondary'
                                }`}>
                                  {memberPayoutOrder}
                                </div>
                                <div>
                                  <p className="font-medium">
                                    {firstName} {lastName}
                                    {memberId === ((user as any)?._id || user?.id) && (
                                      <span className="text-primary ml-2">(You)</span>
                                    )}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {isPast ? '✓ Paid out' : 
                                     isCurrent ? 'Current round' : 
                                     'Upcoming'}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium">
                                  £{(parseFloat(String(groupData.contributionAmount)) * groupData.memberCount).toFixed(2)}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Members</CardTitle>
            </CardHeader>
            <CardContent>
              {members && members.length > 0 ? (
                <div className="space-y-3">
                  {members.map((member: any, index: number) => {
                    const memberId = member.id?._id || member._id || member.id;
                    const memberData = member.id || member;
                    const firstName = memberData.firstName || memberData.first_name || '';
                    const lastName = memberData.lastName || memberData.last_name || '';
                    const memberPayoutOrder = member.payout_order || member.payoutOrder || (index + 1);
                    const isAdmin = member.isAdmin || member.is_admin;
                    
                    return (
                    <div 
                      key={memberId} 
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors gap-2"
                      data-testid={`member-${memberId}`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="flex-shrink-0">
                          <AvatarFallback>
                            {firstName?.[0]}{lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-medium truncate">
                            {firstName} {lastName}
                            {isAdmin && (
                              <Badge variant="outline" className="ml-2">Creator</Badge>
                            )}
                            {memberId === ((user as any)?._id || user?.id) && (
                              <Badge variant="secondary" className="ml-2">You</Badge>
                            )}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Member #{index + 1}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="text-right hidden sm:block">
                          <p className="text-sm text-muted-foreground">Payout Order</p>
                          <p className="font-semibold">#{memberPayoutOrder}</p>
                        </div>
                        <span className="text-xs font-semibold text-muted-foreground sm:hidden">
                          #{memberPayoutOrder}
                        </span>
                        {/* Rate Member Button - Only show for other members (not yourself) */}
                        {memberId !== user?.id && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedMember(member)}
                            className="text-primary hover:text-primary/80"
                            title="Rate this member"
                          >
                            <Star className="w-4 h-4 sm:mr-1" />
                            <span className="hidden sm:inline">Rate</span>
                          </Button>
                        )}
                      </div>
                    </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No members yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        </main>
      </div>

      {/* Member Rating Modal */}
      <MemberRatingModal
        isOpen={!!selectedMember}
        onClose={() => setSelectedMember(null)}
        member={selectedMember ? {
          id: selectedMember.id || selectedMember._id,
          name: `${selectedMember.firstName || selectedMember.first_name || ''} ${selectedMember.lastName || selectedMember.last_name || ''}`,
          avatarUrl: selectedMember.avatarUrl || selectedMember.avatar_url,
          rotationNumber: selectedMember.payout_order || selectedMember.payoutOrder || 0,
        } : null}
        groupId={groupId || ''}
        groupName={groupData?.name || ''}
      />

      {/* Payment Link Modal */}
      <BankDetailsModal
        isOpen={showPaymentLinkModal}
        onClose={() => setShowPaymentLinkModal(false)}
        requirementContext="join_group"
        groupId={groupId || ''}
        memberId={currentUserMember?._id || ''}
        contributionAmount={parseFloat(String(groupData?.contributionAmount || '0'))}
        onSuccess={() => {
          setShowPaymentLinkModal(false);
          toast({
            title: "Payment Method Linked",
            description: "Your payment method has been successfully linked to this group.",
          });
        }}
      />
    </div>
  );
}
