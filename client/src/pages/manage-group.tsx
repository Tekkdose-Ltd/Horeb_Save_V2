import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient, getUserGroups } from "@/lib/queryClient";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Trash2, UserPlus, Send, PoundSterling, Eye, EyeOff, Lock, Unlock, AlertTriangle, Users, Ban } from "lucide-react";

export default function ManageGroup() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [match, params] = useRoute("/groups/:id/manage");
  const [, setLocation] = useLocation();
  const groupId = match ? (params as { id: string }).id : null;

  const [inviteEmail, setInviteEmail] = useState("");
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [warnMessage, setWarnMessage] = useState("");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to manage groups",
        variant: "destructive",
      });
      setLocation("/");
    }
  }, [isLoading, isAuthenticated, toast, setLocation]);

  // Fetch all user groups and find the specific one
  const { data: groups, isLoading: groupsLoading } = useQuery<any[]>({
    queryKey: ["/groups/my"],
    queryFn: getUserGroups,
    enabled: isAuthenticated,
  });

  const group = groups?.find(g => (g._id || g.id) === groupId);
  const groupLoading = groupsLoading;

  // Extract and normalize group data
  const groupData = group ? {
    ...group,
    id: group._id || group.id,
    status: group.group_status || group.status || 'draft',
    memberCount: group.member_count || group.memberCount || group.members?.length || 0,
    maxMembers: group.max_number_of_members || group.maxMembers || 0,
    contributionAmount: group.contribution_amount || group.contributionAmount || 0,
    contributionsActive: group.active_contribution_id !== null || group.contributionsActive,
    creatorId: group.creator_id || group.creatorId,
    currentRound: group.current_round || group.currentRound || 0,
    totalRounds: group.total_round || group.totalRounds || group.members?.length || 0,
    frequency: group.frequency || 'monthly',
  } : null;

  const displayGroup = groupData || group;

  // Check if current user is admin by looking in members array
  const members = displayGroup?.members || [];
  const currentUserMember = members.find((m: any) => {
    // Member structure: { id: { _id: "user_id", ... }, isAdmin: true, _id: "member_id" }
    const memberUserId = m.id?._id || m.id?.id || m.user_id || m.userId || m._id || m.id;
    const userId = (user as any)?._id || user?.id;
    return memberUserId === userId;
  });
  
  const isAdmin = currentUserMember?.isAdmin || currentUserMember?.is_admin || false;

  const inviteMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await apiRequest("POST", `/groups/${groupId}/invite`, { email });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/groups/${groupId}`] });
      queryClient.invalidateQueries({ queryKey: ["/groups/my"] });
      toast({
        title: "Invitation Sent",
        description: "The invitation has been sent successfully",
      });
      setInviteEmail("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send invitation",
        variant: "destructive",
      });
    },
  });

  const activateGroupMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/groups/activate_contribution`, {
        group_id: groupId,
        creator_of_group_id: (user as any)?._id || user?.id,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/groups/${groupId}`] });
      queryClient.invalidateQueries({ queryKey: ["/groups/my"] });
      toast({
        title: "Group Activated Successfully!",
        description: "Your group is now active and members can start contributing",
      });
      setLocation(`/groups/${groupId}`);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to activate group",
        variant: "destructive",
      });
    },
  });

  const deleteGroupMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", `/groups/${groupId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/groups/my"] });
      toast({
        title: "Group Deleted",
        description: "The group has been deleted successfully",
      });
      setLocation("/groups");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete group",
        variant: "destructive",
      });
    },
  });

  const toggleVisibilityMutation = useMutation({
    mutationFn: async (isPublic: boolean) => {
      const response = await apiRequest("PATCH", `/groups/${groupId}`, {
        is_public: isPublic,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/groups/${groupId}`] });
      queryClient.invalidateQueries({ queryKey: ["/groups/my"] });
      toast({
        title: "Visibility Updated",
        description: "Group visibility has been changed successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update group visibility",
        variant: "destructive",
      });
    },
  });

  const closeGroupMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("PATCH", `/groups/${groupId}`, {
        status: 'closed',
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/groups/${groupId}`] });
      queryClient.invalidateQueries({ queryKey: ["/groups/my"] });
      toast({
        title: "Group Closed",
        description: "The group has been closed successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to close group",
        variant: "destructive",
      });
    },
  });

  const reactivateGroupMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("PATCH", `/groups/${groupId}`, {
        status: 'active',
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/groups/${groupId}`] });
      queryClient.invalidateQueries({ queryKey: ["/groups/my"] });
      toast({
        title: "Group Reactivated",
        description: "The group has been reactivated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reactivate group",
        variant: "destructive",
      });
    },
  });

  const startRotationMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/groups/activate_contribution`, {
        group_id: groupId as string,
        creator_of_group_id: (user as any)?._id || user?.id,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/groups/${groupId}`] });
      queryClient.invalidateQueries({ queryKey: ["/groups/my"] });
      toast({
        title: "Payment rotation started",
        description: "The payout rotation has begun and contributions are now enabled.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to start payment rotation",
        variant: "destructive",
      });
    },
  });

  const warnMemberMutation = useMutation({
    mutationFn: async ({ memberId, message }: { memberId: string; message: string }) => {
      const response = await apiRequest("POST", `/groups/${groupId}/members/${memberId}/warn`, {
        message,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Warning Sent",
        description: "Member has been warned successfully",
      });
      setSelectedMember(null);
      setWarnMessage("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to warn member",
        variant: "destructive",
      });
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const response = await apiRequest("DELETE", `/groups/${groupId}/members/${memberId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/groups/${groupId}`] });
      queryClient.invalidateQueries({ queryKey: ["/groups/my"] });
      toast({
        title: "Member Removed",
        description: "Member has been removed from the group",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove member",
        variant: "destructive",
      });
    },
  });

  if (isLoading || groupLoading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar className="w-64" />
        <div className="flex-1 min-w-0 pt-14 lg:pt-0">
          <main className="container mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!displayGroup || !user || !isAdmin) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar className="w-64" />
        <div className="flex-1 min-w-0 pt-14 lg:pt-0">
          <main className="container mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
            <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-4">
              {!displayGroup ? "Group Not Found" : "Unauthorized"}
            </h2>
            <p className="text-muted-foreground mb-6">
              {!displayGroup 
                ? "The group you're looking for doesn't exist" 
                : "You don't have permission to manage this group. Only group admins can access this page."}
            </p>
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

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (inviteEmail && inviteEmail.includes("@")) {
      inviteMutation.mutate(inviteEmail);
    } else {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
    }
  };

  const canActivate = displayGroup.memberCount >= 2;
  const maxMembers = displayGroup.maxMembers || displayGroup.memberCount || 0;
  const allMembersJoined = maxMembers > 0 && displayGroup.memberCount >= maxMembers;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar className="w-64" />
      <div className="flex-1 min-w-0 pt-14 lg:pt-0">
      <main className="container mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => setLocation(`/groups/${groupId}`)}
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Group
          </Button>
        </div>

        <div className="max-w-4xl space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">
              Manage {displayGroup.name}
            </h1>
            <p className="text-muted-foreground">
              Configure your group settings and invite members
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Invite Members Card - Takes 2 columns */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Invite Members</CardTitle>
                <CardDescription>
                  Send invitations to people you want to join this group
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleInvite} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="invite-email">Email Address</Label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Input
                        id="invite-email"
                        type="email"
                        placeholder="friend@example.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="flex-1"
                        data-testid="input-invite-email"
                      />
                      <Button 
                        type="submit"
                        disabled={inviteMutation.isPending}
                        className="w-full sm:w-auto"
                        data-testid="button-send-invite"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        {inviteMutation.isPending ? "Sending..." : "Send Invite"}
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Members: {displayGroup.memberCount} of {displayGroup.maxMembers}
                  </p>
                </form>
              </CardContent>
            </Card>

            {/* Group Status Card - Takes 1 column */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Group:</span>
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${
                      displayGroup.status === 'active' ? 'bg-green-100 text-green-800' :
                      displayGroup.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      displayGroup.status === 'closed' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {displayGroup.status?.charAt(0).toUpperCase() + displayGroup.status?.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Visibility:</span>
                    <span className="text-xs font-medium">
                      {displayGroup.is_public || displayGroup.isPublic ? (
                        <span className="flex items-center gap-1">
                          <Unlock className="w-3 h-3" /> Public
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Private
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Contributions:</span>
                    <span className="text-xs font-medium">
                      {displayGroup.contributionsActive ? '✅ Active' : '⏸️ Paused'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Group Members Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Group Members
                  </CardTitle>
                  <CardDescription>
                    Manage your group members
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {members && members.length > 0 ? (
                <div className="space-y-2">
                  {members.map((member: any) => {
                    const memberUserId = member.id?._id || member._id;
                    const memberData = member.id || member;
                    const firstName = memberData.firstName || memberData.first_name || '';
                    const lastName = memberData.lastName || memberData.last_name || '';
                    const email = memberData.email || '';
                    const isCurrentUser = memberUserId === ((user as any)?._id || user?.id);
                    const isMemberAdmin = member.isAdmin || member.is_admin;
                    
                    return (
                      <div 
                        key={memberUserId}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border rounded-lg hover:bg-muted/50 gap-2"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {firstName} {lastName}
                            {isMemberAdmin && (
                              <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                Admin
                              </span>
                            )}
                            {isCurrentUser && (
                              <span className="ml-2 text-xs bg-secondary/10 text-secondary px-2 py-1 rounded">
                                You
                              </span>
                            )}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">{email}</p>
                        </div>
                        {!isCurrentUser && (
                          <div className="flex gap-2 flex-shrink-0">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setSelectedMember(member)}
                                >
                                  <AlertTriangle className="w-4 h-4 mr-1" />
                                  Warn
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Warn Member</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Send a warning message to {firstName} {lastName}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <div className="py-4">
                                  <Label htmlFor="warn-message">Warning Message</Label>
                                  <Textarea
                                    id="warn-message"
                                    value={warnMessage}
                                    onChange={(e) => setWarnMessage(e.target.value)}
                                    placeholder="Enter warning message..."
                                    className="mt-2"
                                  />
                                </div>
                                <AlertDialogFooter>
                                  <AlertDialogCancel onClick={() => {
                                    setSelectedMember(null);
                                    setWarnMessage("");
                                  }}>
                                    Cancel
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => {
                                      if (selectedMember && warnMessage.trim()) {
                                        warnMemberMutation.mutate({
                                          memberId: memberUserId,
                                          message: warnMessage,
                                        });
                                      }
                                    }}
                                    disabled={!warnMessage.trim()}
                                  >
                                    Send Warning
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                >
                                  <Ban className="w-4 h-4 mr-1" />
                                  Remove
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remove Member?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to remove {firstName} {lastName} from this group? 
                                    This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => removeMemberMutation.mutate(memberUserId)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Remove Member
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No members yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Group Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Group Settings</CardTitle>
              <CardDescription>
                Manage group visibility and status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Toggle Visibility */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg bg-muted/30 gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-muted-foreground">Group Visibility</p>
                    <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {displayGroup.is_public || displayGroup.isPublic 
                      ? 'Anyone can see and join this group'
                      : 'Only invited members can join this group'
                    }
                  </p>
                </div>
                <Button
                  variant="outline"
                  disabled={true}
                  className="opacity-50 cursor-not-allowed w-full sm:w-auto flex-shrink-0"
                >
                  {displayGroup.is_public || displayGroup.isPublic ? (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Make Private
                    </>
                  ) : (
                    <>
                      <Unlock className="w-4 h-4 mr-2" />
                      Make Public
                    </>
                  )}
                </Button>
              </div>

              {/* Close/Reactivate Group */}
              {displayGroup.status === 'active' && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg bg-muted/30 opacity-60 gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-muted-foreground">Close Group</p>
                      <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Temporarily pause all group activities
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    className="cursor-not-allowed w-full sm:w-auto flex-shrink-0"
                    disabled={true}
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Close Group
                  </Button>
                </div>
              )}

              {displayGroup.status === 'closed' && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border border-green-200 bg-green-50/50 rounded-lg opacity-60 gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-green-900">Reactivate Group</p>
                      <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
                    </div>
                    <p className="text-sm text-green-700">
                      Resume group activities and contributions
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    className="border-green-600 text-green-900 cursor-not-allowed w-full sm:w-auto flex-shrink-0"
                    disabled={true}
                  >
                    <Unlock className="w-4 h-4 mr-2" />
                    Reactivate
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {allMembersJoined && !displayGroup.contributionsActive && (
            <Card>
              <CardHeader>
                <CardTitle>Start Payment Rotation</CardTitle>
                <CardDescription>
                  All members have joined. Start the payout rotation and enable contributions.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm">
                    <strong>Members joined:</strong> {displayGroup.memberCount} of {maxMembers}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    This will begin the contribution cycle and set the first payout schedule.
                  </p>
                </div>
                <Button
                  onClick={() => startRotationMutation.mutate()}
                  disabled={startRotationMutation.isPending}
                  className="w-full"
                  size="lg"
                  data-testid="button-start-rotation"
                >
                  <PoundSterling className="w-5 h-5 mr-2" />
                  {startRotationMutation.isPending ? "Starting..." : "Start Payment Rotation"}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Activate Group - Visible for draft and completed groups */}
          {(displayGroup.status === 'draft' || displayGroup.status === 'completed') && (
            <Card>
              <CardHeader>
                <CardTitle>Activate Group & Start Contributions</CardTitle>
                <CardDescription>
                  Activate your group once all members have joined to start the savings cycle
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm">
                    <strong>Current Status:</strong> {displayGroup.status.charAt(0).toUpperCase() + displayGroup.status.slice(1)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {displayGroup.status === 'completed' 
                      ? `Great! All ${displayGroup.memberCount} members have joined. You can now activate the group to start the savings cycle and enable contributions.`
                      : `You need at least 2 members to activate this group. Current members: ${displayGroup.memberCount}`
                    }
                  </p>
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-xs text-blue-900">
                      💡 <strong>What happens when you activate:</strong>
                    </p>
                    <ul className="text-xs text-blue-800 mt-2 space-y-1 ml-4 list-disc">
                      <li>Group status changes to "Active"</li>
                      <li>Payout rotation begins</li>
                      <li>Members can start making contributions of £{displayGroup.contributionAmount} {displayGroup.frequency}</li>
                    </ul>
                  </div>
                </div>
                <Button
                  onClick={() => activateGroupMutation.mutate()}
                  disabled={!canActivate || activateGroupMutation.isPending}
                  className="w-full"
                  size="lg"
                  data-testid="button-activate-group"
                >
                  <PoundSterling className="w-5 h-5 mr-2" />
                  {activateGroupMutation.isPending ? "Activating..." : "Activate Group & Enable Contributions"}
                </Button>
                {!canActivate && (
                  <p className="text-sm text-destructive text-center font-medium">
                    ⚠️ Invite at least {2 - displayGroup.memberCount} more member(s) to activate
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Show success message for active groups */}
          {displayGroup.status === 'active' && (
            <Card className="border-green-500 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-700">🎉 Group is Active!</CardTitle>
                <CardDescription className="text-green-600">
                  Your group is now active and contributions are enabled
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-green-800">
                    ✅ Members can now make contributions of £{displayGroup.contributionAmount} {displayGroup.frequency}
                  </p>
                  <p className="text-sm text-green-800">
                    ✅ Payout rotation has started
                  </p>
                  <p className="text-sm text-green-800">
                    ✅ Next payout: Round {displayGroup.currentRound || 1} of {displayGroup.totalRounds || displayGroup.memberCount}
                  </p>
                </div>
                <Button
                  onClick={() => setLocation(`/groups/${groupId}`)}
                  className="w-full mt-4"
                  variant="outline"
                >
                  View Group Details
                </Button>
              </CardContent>
            </Card>
          )}

          {(displayGroup.status === 'draft' || displayGroup.status === 'completed') && (
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>
                  Permanently delete this group. This action cannot be undone.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" data-testid="button-delete-group">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Group
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete the group "{displayGroup.name}" and remove all associated data. 
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteGroupMutation.mutate()}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        data-testid="button-confirm-delete"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      </div>
    </div>
  );
}
