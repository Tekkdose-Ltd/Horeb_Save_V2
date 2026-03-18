import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  AlertCircle, 
  Users, 
  PoundSterling,
  Clock,
  CheckCircle
} from "lucide-react";
import { PayoutApprovalModal } from "./PayoutApprovalModal";

interface PendingApproval {
  groupId: string;
  groupName: string;
  contributionAmount: number;
  memberCount: number;
  currentRound: number;
  recipientName: string;
  recipientId: string;
  totalPayout: number;
  pendingSince: string;
}

export function AdminApprovalWidget() {
  const [selectedGroup, setSelectedGroup] = useState<PendingApproval | null>(null);

  // Fetch pending approvals for groups where user is admin
  const { data: pendingApprovals, isLoading } = useQuery<PendingApproval[]>({
    queryKey: ["/groups/pending-approvals"],
    retry: false,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return null;
  }

  if (!pendingApprovals || pendingApprovals.length === 0) {
    return null;
  }

  return (
    <>
      <Card className="border-amber-200 bg-amber-50" data-testid="card-pending-approvals">
        <CardContent className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertCircle className="text-amber-700 w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-amber-900 mb-1">
                Admin Action Required
              </h4>
              <p className="text-sm text-amber-800">
                You have {pendingApprovals.length} payout{pendingApprovals.length > 1 ? 's' : ''} waiting for approval
              </p>
            </div>
            <Badge variant="destructive" className="animate-pulse">
              {pendingApprovals.length}
            </Badge>
          </div>

          <div className="space-y-3">
            {pendingApprovals.map((approval) => (
              <Alert key={approval.groupId} className="border-amber-300 bg-white">
                <AlertDescription>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold text-foreground">{approval.groupName}</p>
                      <p className="text-sm text-muted-foreground">
                        Round {approval.currentRound} • All members paid
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-secondary flex items-center gap-1">
                        <PoundSterling className="w-4 h-4" />
                        {approval.totalPayout.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {approval.memberCount} members
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>Recipient: <strong>{approval.recipientName}</strong></span>
                  </div>

                  <div className="flex items-center gap-2 mb-3 text-xs text-amber-700">
                    <Clock className="w-3 h-3" />
                    <span>
                      Pending since {new Date(approval.pendingSince).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  <Button
                    className="w-full bg-secondary hover:bg-secondary/90"
                    size="sm"
                    onClick={() => setSelectedGroup(approval)}
                    data-testid={`button-review-approval-${approval.groupId}`}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Review & Approve
                  </Button>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Approval Modal */}
      {selectedGroup && (
        <PayoutApprovalModal
          isOpen={!!selectedGroup}
          onClose={() => setSelectedGroup(null)}
          group={{
            id: selectedGroup.groupId,
            name: selectedGroup.groupName,
            contributionAmount: selectedGroup.contributionAmount,
            memberCount: selectedGroup.memberCount,
            currentRound: selectedGroup.currentRound,
            recipientName: selectedGroup.recipientName,
            recipientId: selectedGroup.recipientId,
            totalPayout: selectedGroup.totalPayout,
          }}
        />
      )}
    </>
  );
}
