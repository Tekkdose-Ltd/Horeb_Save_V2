import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateGroupModal } from "@/components/CreateGroupModal";
import { BankDetailsModal } from "@/components/BankDetailsModal";
import { GroupCard } from "@/components/GroupCard";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useBankDetailsRequired } from "@/hooks/useBankDetailsRequired";
import { apiRequest, queryClient, getUserGroups, getPublicGroups } from "@/lib/queryClient";

export default function Groups() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [joiningGroupId, setJoiningGroupId] = useState<string | null>(null);
  const [pendingJoinGroupId, setPendingJoinGroupId] = useState<string | null>(null);
  const { toast } = useToast();
  
  const {
    showBankDetailsModal,
    setShowBankDetailsModal,
    requireBankDetails,
    handleBankDetailsSuccess,
  } = useBankDetailsRequired();

  const { data: myGroups, isLoading: myGroupsLoading } = useQuery({
    queryKey: ["/groups/my"],
    queryFn: getUserGroups,
    retry: false,
  });

  const { data: publicGroups, isLoading: publicGroupsLoading } = useQuery({
    queryKey: ["/groups/public"],
    queryFn: getPublicGroups,
    retry: false,
  });

  const joinGroupMutation = useMutation({
    mutationFn: async (groupId: string) => {
      setJoiningGroupId(groupId);
      // Find the group to get its invitation code
      const group = publicGroups?.find((g: any) => g.id === groupId);
      
      if (group?.inviteCode || group?.invite_code) {
        // Use invitation code endpoint if available
        const inviteCode = group.inviteCode || group.invite_code;
        if (import.meta.env.DEV) {
          console.log("Joining group with invitation code:", inviteCode);
        }
        return await apiRequest("POST", "/groups/join", { 
          invitation_code: inviteCode 
        });
      } else {
        // Fallback to direct join by ID (may not be supported by backend)
        if (import.meta.env.DEV) {
          console.warn("No invitation code found for group, trying direct join by ID");
        }
        return await apiRequest("POST", `/groups/${groupId}/join`);
      }
    },
    onSuccess: (data, groupId) => {
      setJoiningGroupId(null);
      setPendingJoinGroupId(null);
      toast({
        title: "Success",
        description: "You have successfully joined the group!",
      });
      queryClient.invalidateQueries({ queryKey: ["/groups/my"] });
      queryClient.invalidateQueries({ queryKey: ["/groups/my-active-groups"] });
      queryClient.invalidateQueries({ queryKey: ["/groups/public"] });
      queryClient.invalidateQueries({ queryKey: [`/groups/${groupId}`] });
    },
    onError: (error: any) => {
      setJoiningGroupId(null);
      setPendingJoinGroupId(null);
      
      // Provide more helpful error message
      const errorMessage = error.message || "Failed to join group";
      const helpText = errorMessage.includes("404") 
        ? "This group joining feature is not yet supported by the backend. Please ask the group creator for an invitation code."
        : errorMessage;
        
      toast({
        title: "Error",
        description: helpText,
        variant: "destructive",
      });
    },
  });

  const handleJoinGroup = (groupId: string) => {
    // Check if bank details are required
    const canProceed = requireBankDetails(() => {
      // If bank details exist, proceed with joining
      joinGroupMutation.mutate(groupId);
    });

    // If bank details don't exist, store the group ID to join after completion
    if (!canProceed) {
      setPendingJoinGroupId(groupId);
    }
  };

  const handleBankDetailsComplete = () => {
    handleBankDetailsSuccess(() => {
      // After bank details are saved, join the pending group
      if (pendingJoinGroupId) {
        joinGroupMutation.mutate(pendingJoinGroupId);
      }
    });
  };

  const filteredPublicGroups = Array.isArray(publicGroups) ? publicGroups.filter((group: any) =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar className="w-64" />
      
      {/* Main Content */}
      <div className="flex-1 min-w-0 pt-14 lg:pt-0">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2" data-testid="text-groups-title">
              Groups
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Manage your savings groups and discover new opportunities.
            </p>
          </div>
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="w-full sm:w-auto"
            data-testid="button-create-group"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Group
          </Button>
        </div>

        <Tabs defaultValue="my-groups" className="space-y-6">
          <TabsList data-testid="tabs-groups">
            <TabsTrigger value="my-groups" data-testid="tab-my-groups">My Groups</TabsTrigger>
            <TabsTrigger value="browse" data-testid="tab-browse">Browse Groups</TabsTrigger>
          </TabsList>

          <TabsContent value="my-groups" className="space-y-6">
            <Card className="border-border" data-testid="card-my-groups">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-6">Your Groups</h2>
                
                {myGroupsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="border border-border rounded-lg p-4 animate-pulse">
                        <div className="h-4 bg-muted rounded w-2/3 mb-2"></div>
                        <div className="h-3 bg-muted rounded w-1/2 mb-4"></div>
                        <div className="h-2 bg-muted rounded w-full mb-4"></div>
                        <div className="flex justify-between">
                          <div className="h-6 bg-muted rounded w-20"></div>
                          <div className="h-4 bg-muted rounded w-24"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : Array.isArray(myGroups) && myGroups.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myGroups.map((group: any) => (
                      <GroupCard key={group.id} group={group} showActions />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12" data-testid="empty-my-groups">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <Plus className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No groups yet</h3>
                    <p className="text-muted-foreground mb-6">
                      Create your first savings group or join an existing one.
                    </p>
                    <Button onClick={() => setShowCreateModal(true)} data-testid="button-create-first-group">
                      Create Your First Group
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="browse" className="space-y-6">
            <Card className="border-border">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search groups..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                      data-testid="input-search-groups"
                    />
                  </div>
                </div>

                <h2 className="text-xl font-semibold mb-6">Available Groups</h2>
                
                {publicGroupsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="border border-border rounded-lg p-4 animate-pulse">
                        <div className="h-4 bg-muted rounded w-2/3 mb-2"></div>
                        <div className="h-3 bg-muted rounded w-1/2 mb-4"></div>
                        <div className="h-2 bg-muted rounded w-full mb-4"></div>
                        <div className="flex justify-between">
                          <div className="h-6 bg-muted rounded w-20"></div>
                          <div className="h-8 bg-muted rounded w-20"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredPublicGroups.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPublicGroups.map((group: any) => (
                      <div key={group.id} className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow" data-testid={`card-public-group-${group.id}`}>
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold text-lg" data-testid={`text-group-name-${group.id}`}>
                              {group.name}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {group.memberCount}/{group.maxMembers} members • £{group.contributionAmount}/{group.frequency}
                            </p>
                          </div>
                          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium">
                            Open
                          </span>
                        </div>
                        
                        {group.description && (
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            {group.description}
                          </p>
                        )}
                        
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mt-3">
                          <div className="text-sm text-muted-foreground">
                            {group.maxMembers - group.memberCount} spots left
                          </div>
                          <Button 
                            size="sm"
                            onClick={() => handleJoinGroup(group.id)}
                            disabled={group.memberCount >= group.maxMembers || joiningGroupId === group.id}
                            className="w-full sm:w-auto"
                            data-testid={`button-join-group-${group.id}`}
                          >
                            {joiningGroupId === group.id ? 'Joining...' : group.memberCount >= group.maxMembers ? 'Full' : 'Join Group'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12" data-testid="empty-public-groups">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      {searchTerm ? 'No groups found' : 'No public groups available'}
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      {searchTerm 
                        ? 'Try adjusting your search terms or create a new group.'
                        : 'Be the first to create a public group for others to join.'
                      }
                    </p>
                    <Button onClick={() => setShowCreateModal(true)} data-testid="button-create-public-group">
                      Create Public Group
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          </Tabs>
        </main>
      </div>

      <CreateGroupModal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)} 
      />

      <BankDetailsModal
        isOpen={showBankDetailsModal}
        onClose={() => setShowBankDetailsModal(false)}
        onSuccess={handleBankDetailsComplete}
        requirementContext="join_group"
      />
    </div>
  );
}
