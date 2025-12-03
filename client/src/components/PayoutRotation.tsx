import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CalendarDays, TrendingUp, Users, ArrowRight, Star } from "lucide-react";
import { MemberRatingModal } from "@/components/MemberRatingModal";

/**
 * Types for Payout Rotation
 * TODO: Move these to shared/schema.ts when backend is ready
 */
interface PayoutMember {
  id: string;
  name: string;
  avatarUrl?: string;
  rotationNumber: number;
  payoutDate: Date;
  payoutAmount: number;
  status: "completed" | "current" | "upcoming";
}

interface PayoutGroup {
  id: string;
  name: string;
  contributionAmount: number;
  frequency: "weekly" | "bi-weekly" | "monthly";
  members: PayoutMember[];
  currentRotation: number;
  totalRotations: number;
}

/**
 * DUMMY DATA - Replace with API call when backend is ready
 * 
 * API Endpoint (to be implemented):
 * GET /api/groups/:groupId/payout-rotation
 * Response: PayoutGroup
 * 
 * GET /api/groups/my-payout-schedule
 * Response: { nextPayout: { groupId, groupName, date, amount }, groups: PayoutGroup[] }
 */
const dummyGroups: PayoutGroup[] = [
  {
    id: "group-1",
    name: "Tech Professionals Circle",
    contributionAmount: 500,
    frequency: "monthly",
    currentRotation: 3,
    totalRotations: 10,
    members: [
      {
        id: "1",
        name: "Alice Johnson",
        avatarUrl: undefined,
        rotationNumber: 1,
        payoutDate: new Date("2024-10-15"),
        payoutAmount: 5000,
        status: "completed",
      },
      {
        id: "2",
        name: "Bob Smith",
        avatarUrl: undefined,
        rotationNumber: 2,
        payoutDate: new Date("2024-11-15"),
        payoutAmount: 5000,
        status: "completed",
      },
      {
        id: "demo-user-123",
        name: "Demo User (You)",
        avatarUrl: undefined,
        rotationNumber: 3,
        payoutDate: new Date("2024-12-15"),
        payoutAmount: 5000,
        status: "current",
      },
      {
        id: "4",
        name: "Carol Davis",
        avatarUrl: undefined,
        rotationNumber: 4,
        payoutDate: new Date("2025-01-15"),
        payoutAmount: 5000,
        status: "upcoming",
      },
      {
        id: "5",
        name: "David Wilson",
        avatarUrl: undefined,
        rotationNumber: 5,
        payoutDate: new Date("2025-02-15"),
        payoutAmount: 5000,
        status: "upcoming",
      },
    ],
  },
  {
    id: "group-2",
    name: "Small Business Owners Network",
    contributionAmount: 1000,
    frequency: "bi-weekly",
    currentRotation: 2,
    totalRotations: 6,
    members: [
      {
        id: "6",
        name: "Emma Brown",
        avatarUrl: undefined,
        rotationNumber: 1,
        payoutDate: new Date("2024-11-01"),
        payoutAmount: 6000,
        status: "completed",
      },
      {
        id: "7",
        name: "Frank Miller",
        avatarUrl: undefined,
        rotationNumber: 2,
        payoutDate: new Date("2024-11-15"),
        payoutAmount: 6000,
        status: "current",
      },
      {
        id: "demo-user-123",
        name: "Demo User (You)",
        avatarUrl: undefined,
        rotationNumber: 3,
        payoutDate: new Date("2024-12-01"),
        payoutAmount: 6000,
        status: "upcoming",
      },
    ],
  },
];

export function PayoutRotation() {
  const [selectedGroupId, setSelectedGroupId] = useState<string>(dummyGroups[0]?.id || "");
  const [selectedMember, setSelectedMember] = useState<PayoutMember | null>(null);
  
  // Find selected group
  const selectedGroup = dummyGroups.find(g => g.id === selectedGroupId);
  
  // Find user's next payout across all groups
  const userNextPayout = dummyGroups
    .flatMap(group => 
      group.members
        .filter(m => m.id === "demo-user-123" && m.status === "current")
        .map(m => ({ ...m, groupName: group.name }))
    )
    .sort((a, b) => a.payoutDate.getTime() - b.payoutDate.getTime())[0];

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric", 
      year: "numeric" 
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
    }).format(amount);
  };

  const getStatusColor = (status: PayoutMember["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "current":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "upcoming":
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase();
  };

  if (!selectedGroup) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payout Rotation</CardTitle>
          <CardDescription>No groups available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl">Payout Rotation Schedule</CardTitle>
            <CardDescription>Track when you and your group members receive payouts</CardDescription>
          </div>
          <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Select a group" />
            </SelectTrigger>
            <SelectContent>
              {dummyGroups.map(group => (
                <SelectItem key={group.id} value={group.id}>
                  {group.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* User's Next Payout Banner */}
        {userNextPayout && (
          <div className="mt-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-lg">Your Next Payout</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  From {userNextPayout.groupName} • Rotation #{userNextPayout.rotationNumber}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">
                  {formatCurrency(userNextPayout.payoutAmount)}
                </div>
                <div className="flex items-center space-x-1 text-sm text-muted-foreground mt-1">
                  <CalendarDays className="w-4 h-4" />
                  <span>{formatDate(userNextPayout.payoutDate)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Group Info */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center space-x-3">
            <Users className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">
                Rotation {selectedGroup.currentRotation} of {selectedGroup.totalRotations}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(selectedGroup.contributionAmount)} {selectedGroup.frequency}
              </p>
            </div>
          </div>
          <Badge variant="outline" className="font-normal">
            {selectedGroup.members.length} Members
          </Badge>
        </div>

        {/* Members List */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Payout Order
          </h3>
          
          <div className="space-y-2">
            {selectedGroup.members
              .sort((a, b) => a.rotationNumber - b.rotationNumber)
              .map((member, index) => (
                <div
                  key={member.id}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                    member.status === "current"
                      ? "bg-blue-50 border-blue-200 shadow-sm"
                      : "bg-white hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarImage src={member.avatarUrl} />
                        <AvatarFallback className="text-xs">
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium text-sm truncate">
                            {member.name}
                          </p>
                          {member.status === "current" && (
                            <Badge className="bg-blue-500 hover:bg-blue-600 text-xs">
                              Next Up
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Rotation #{member.rotationNumber} • {formatDate(member.payoutDate)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 flex-shrink-0">
                      <div className="text-right">
                        <p className="font-semibold text-sm">
                          {formatCurrency(member.payoutAmount)}
                        </p>
                      </div>
                      
                      <Badge 
                        variant="outline" 
                        className={`${getStatusColor(member.status)} text-xs capitalize min-w-[85px] justify-center`}
                      >
                        {member.status}
                      </Badge>

                      {/* Rate Member Button - Only show for completed rotations */}
                      {member.status === "completed" && member.id !== "demo-user-123" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedMember(member)}
                          className="text-primary hover:text-primary/80"
                          title="Rate this member"
                        >
                          <Star className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Footer Note */}
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground flex items-center space-x-1">
            <ArrowRight className="w-3 h-3" />
            <span>
              Payouts are processed automatically on the scheduled date
            </span>
          </p>
        </div>
      </CardContent>

      {/* Member Rating Modal */}
      <MemberRatingModal
        isOpen={!!selectedMember}
        onClose={() => setSelectedMember(null)}
        member={selectedMember ? {
          id: selectedMember.id,
          name: selectedMember.name,
          avatarUrl: selectedMember.avatarUrl,
          rotationNumber: selectedMember.rotationNumber,
        } : null}
        groupId={selectedGroupId}
        groupName={selectedGroup?.name || ""}
      />
    </Card>
  );
}

/**
 * API Integration Guide
 * =====================
 * 
 * 1. Fetch User's Payout Schedule:
 *    GET /api/groups/my-payout-schedule
 *    Returns: { 
 *      nextPayout: { groupId, groupName, date, amount, rotationNumber },
 *      groups: PayoutGroup[]
 *    }
 * 
 * 2. Fetch Specific Group Rotation:
 *    GET /api/groups/:groupId/payout-rotation
 *    Returns: PayoutGroup (with members array)
 * 
 * 3. Replace dummy data with React Query:
 * 
 *    const { data: payoutSchedule } = useQuery({
 *      queryKey: ["/api/groups/my-payout-schedule"],
 *    });
 * 
 *    const { data: groupRotation } = useQuery({
 *      queryKey: [`/api/groups/${selectedGroupId}/payout-rotation`],
 *      enabled: !!selectedGroupId,
 *    });
 * 
 * 4. Update component to use API data instead of dummyGroups
 */
