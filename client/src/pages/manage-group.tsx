import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { ArrowLeft, Trash2, UserPlus, Send } from "lucide-react";

export default function ManageGroup() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [, params] = useRoute("/groups/:id/manage");
  const [, setLocation] = useLocation();
  const groupId = params?.id;

  const [inviteEmail, setInviteEmail] = useState("");

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

  const { data: group, isLoading: groupLoading } = useQuery<any>({
    queryKey: [`/api/groups/${groupId}`],
    enabled: !!groupId && isAuthenticated,
  });

  const inviteMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await apiRequest("POST", `/api/groups/${groupId}/invite`, { email });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/groups/${groupId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/groups/my"] });
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
      const response = await apiRequest("POST", `/api/groups/${groupId}/activate`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/groups/${groupId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/groups/my"] });
      toast({
        title: "Group Activated",
        description: "The group has been activated successfully",
      });
      setLocation(`/groups/${groupId}`);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to activate group",
        variant: "destructive",
      });
    },
  });

  const deleteGroupMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", `/api/groups/${groupId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups/my"] });
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

  if (isLoading || groupLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        </main>
      </div>
    );
  }

  if (!group || group.creatorId !== user?.id) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-4">
              {!group ? "Group Not Found" : "Unauthorized"}
            </h2>
            <p className="text-muted-foreground mb-6">
              {!group 
                ? "The group you're looking for doesn't exist" 
                : "You don't have permission to manage this group"}
            </p>
            <Button onClick={() => setLocation("/groups")} data-testid="button-back-groups">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Groups
            </Button>
          </div>
        </main>
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

  const canActivate = group.memberCount >= 2;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
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
              Manage {group.name}
            </h1>
            <p className="text-muted-foreground">
              Configure your group settings and invite members
            </p>
          </div>

          <Card>
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
                  <div className="flex gap-2">
                    <Input
                      id="invite-email"
                      type="email"
                      placeholder="friend@example.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      data-testid="input-invite-email"
                    />
                    <Button 
                      type="submit"
                      disabled={inviteMutation.isPending}
                      data-testid="button-send-invite"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {inviteMutation.isPending ? "Sending..." : "Send Invite"}
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Members: {group.memberCount} of {group.maxMembers}
                </p>
              </form>
            </CardContent>
          </Card>

          {group.status === 'draft' && (
            <Card>
              <CardHeader>
                <CardTitle>Group Status</CardTitle>
                <CardDescription>
                  Activate your group once you have enough members
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm">
                    <strong>Current Status:</strong> {group.status.charAt(0).toUpperCase() + group.status.slice(1)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    You need at least 2 members to activate this group. 
                    Current members: {group.memberCount}
                  </p>
                </div>
                <Button
                  onClick={() => activateGroupMutation.mutate()}
                  disabled={!canActivate || activateGroupMutation.isPending}
                  className="w-full"
                  data-testid="button-activate-group"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  {activateGroupMutation.isPending ? "Activating..." : "Activate Group"}
                </Button>
                {!canActivate && (
                  <p className="text-sm text-muted-foreground text-center">
                    Invite at least {2 - group.memberCount} more member(s) to activate
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {group.status === 'draft' && (
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
                        This will permanently delete the group "{group.name}" and remove all associated data. 
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
  );
}
