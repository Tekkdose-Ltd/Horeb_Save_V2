import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  XCircle, 
  Users, 
  PoundSterling, 
  AlertCircle,
  Loader2 
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface PayoutApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: {
    id: string;
    name: string;
    contributionAmount: number;
    memberCount: number;
    currentRound: number;
    recipientName: string;
    recipientId: string;
    totalPayout: number;
  };
}

export function PayoutApprovalModal({ isOpen, onClose, group }: PayoutApprovalModalProps) {
  const { toast } = useToast();
  const [reason, setReason] = useState("");

  // Approve payout mutation
  const approveMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/groups/${group.id}/approve-payout`, {
        round: group.currentRound,
        recipient_id: group.recipientId,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Payout Approved",
        description: `Payment of £${group.totalPayout} has been sent to ${group.recipientName}.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      queryClient.invalidateQueries({ queryKey: [`/api/groups/${group.id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Approval Failed",
        description: error.message || "Failed to approve payout. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Decline payout mutation
  const declineMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/groups/${group.id}/decline-payout`, {
        round: group.currentRound,
        reason: reason || "No reason provided",
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Payout Declined",
        description: "The payout has been declined. Members will be notified.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      queryClient.invalidateQueries({ queryKey: [`/api/groups/${group.id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Decline Failed",
        description: error.message || "Failed to decline payout. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleApprove = () => {
    approveMutation.mutate();
  };

  const handleDecline = () => {
    if (!reason.trim()) {
      toast({
        title: "Reason Required",
        description: "Please provide a reason for declining the payout.",
        variant: "destructive",
      });
      return;
    }
    declineMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-amber-500" />
            Payout Approval Required
          </DialogTitle>
          <DialogDescription>
            As the group admin, you need to approve or decline this payout request.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Group Info */}
          <Alert className="border-primary/20 bg-primary/5">
            <AlertDescription>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Group:</span>
                  <span className="font-semibold">{group.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Round:</span>
                  <Badge variant="outline">{group.currentRound}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Members:</span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {group.memberCount}
                  </span>
                </div>
              </div>
            </AlertDescription>
          </Alert>

          {/* Recipient Info */}
          <div className="border border-border rounded-lg p-4 bg-secondary/5">
            <h4 className="font-semibold mb-3">Payout Details</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Recipient:</span>
                <span className="font-medium">{group.recipientName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Amount:</span>
                <span className="font-bold text-lg text-secondary flex items-center gap-1">
                  <PoundSterling className="w-5 h-5" />
                  {group.totalPayout.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Per Member:</span>
                <span className="font-medium">£{group.contributionAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Status Message */}
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              All {group.memberCount} members have successfully contributed for Round {group.currentRound}.
              The funds are ready to be disbursed.
            </AlertDescription>
          </Alert>

          {/* Decline Reason (conditionally shown) */}
          {declineMutation.isPending || reason ? (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Reason for Declining (required):
              </label>
              <textarea
                className="w-full min-h-[80px] p-3 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Explain why you're declining this payout..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          ) : null}

          {/* Warning */}
          <Alert className="border-amber-200 bg-amber-50">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800 text-sm">
              <strong>Important:</strong> Once approved, the payment will be processed immediately
              and cannot be reversed. Please verify all details are correct.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {!reason && (
            <>
              <Button
                variant="outline"
                onClick={() => setReason(" ")}
                disabled={approveMutation.isPending || declineMutation.isPending}
                className="w-full sm:w-auto"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Decline Payout
              </Button>
              <Button
                onClick={handleApprove}
                disabled={approveMutation.isPending || declineMutation.isPending}
                className="w-full sm:w-auto bg-secondary hover:bg-secondary/90"
              >
                {approveMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Approving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve Payout
                  </>
                )}
              </Button>
            </>
          )}
          {reason && (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setReason("");
                }}
                disabled={approveMutation.isPending || declineMutation.isPending}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDecline}
                disabled={approveMutation.isPending || declineMutation.isPending}
                className="w-full sm:w-auto"
              >
                {declineMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Declining...
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 mr-2" />
                    Confirm Decline
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
