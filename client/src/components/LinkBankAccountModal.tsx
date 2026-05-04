import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Building2, 
  Shield,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Lock,
  Loader2
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface LinkBankAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  requirementContext?: "join_group" | "receive_payout" | "profile";
  groupId?: string;
  memberId?: string;
  contributionAmount?: number;
}

export function LinkBankAccountModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  requirementContext = "profile",
  groupId,
  memberId,
  contributionAmount
}: LinkBankAccountModalProps) {
  const { toast } = useToast();
  const [agreedToDirectDebit, setAgreedToDirectDebit] = useState(false);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setAgreedToDirectDebit(false);
    }
  }, [isOpen]);

  const linkAccountMutation = useMutation({
    mutationFn: async () => {
      const payload: any = {};
      
      if (requirementContext === "join_group" && groupId && memberId) {
        payload.member_id = memberId;
        payload.group_id = groupId;
        payload.amount = contributionAmount || 0;
      }

      const response = await apiRequest("GET", "/payment/account/link", payload);
      return response.json();
    },
    onSuccess: (response) => {
      // Extract URL from nested data object - check multiple possible locations
      const url = response.data?.redirectURL || response.data?.url || response.redirectURL || response.url;
      
      if (url) {
        toast({
          title: "Opening Stripe Account Setup",
          description: "Please complete the setup in the new tab.",
        });
        
        window.open(url, '_blank', 'noopener,noreferrer');
        
        if (onSuccess) {
          onSuccess();
        }
        
        onClose();
      } else {
        throw new Error("No account link URL received from server");
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to initialize account linking. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleContinueToAccountLink = () => {
    if (!agreedToDirectDebit) {
      toast({
        title: "Consent Required",
        description: "Please read and agree to the Direct Debit terms before proceeding.",
        variant: "destructive",
      });
      return;
    }

    linkAccountMutation.mutate();
  };

  const getContextMessage = () => {
    switch (requirementContext) {
      case "join_group":
        return "To join a savings group, you need to link your bank account with Stripe for Direct Debit contributions and payouts.";
      case "receive_payout":
        return "To receive your payout, please link your bank account through Stripe for secure fund transfers.";
      default:
        return "Link your bank account with Stripe to enable Direct Debit contributions and receive payouts.";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            Link Your Bank Account
          </DialogTitle>
          <DialogDescription>
            {getContextMessage()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Stripe Security Notice */}
          <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-900">
            <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <AlertDescription className="text-sm text-blue-700 dark:text-blue-300">
              <p className="font-semibold mb-1">Secure Payment Processing with Stripe</p>
              <p>
                We use Stripe, a PCI-DSS Level 1 certified payment processor. Your bank account 
                information is encrypted and never stored on our servers.
              </p>
            </AlertDescription>
          </Alert>

          {/* What to Expect */}
          <Card className="p-4 bg-muted/50">
            <div className="flex items-start gap-3 mb-3">
              <ExternalLink className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold mb-2">What happens next:</p>
                <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                  <li>You'll be redirected to Stripe's secure page in a new tab</li>
                  <li>Connect your bank account for Direct Debit</li>
                  <li>Stripe will verify your bank details</li>
                  <li>You can then receive payouts and make automated contributions</li>
                </ol>
              </div>
            </div>
          </Card>

          {/* How It Works */}
          <Card className="p-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold">Automatic Contributions via Direct Debit</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your contribution amount will be automatically collected via Direct Debit on your 
                    scheduled payment date each cycle.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold">Instant Payouts</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    When it's your turn to receive funds, the total pot will be automatically transferred 
                    to your linked bank account within 1-3 business days.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold">Protected Transactions</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    All transactions are monitored for fraud and protected by Stripe's advanced security 
                    systems and UK Direct Debit Guarantee.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Direct Debit Information */}
          <Alert className="bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-900">
            <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
            <AlertDescription className="text-sm text-yellow-700 dark:text-yellow-300">
              <p className="font-semibold mb-1">Direct Debit Mandate</p>
              <p>
                By linking your account, you authorize us to collect your group contribution 
                automatically on the agreed schedule. You can cancel or modify this authorization at 
                any time through your account settings.
              </p>
            </AlertDescription>
          </Alert>

          {/* Consent Checkbox */}
          <div className="space-y-4 border border-border rounded-lg p-4">
            <p className="text-sm font-semibold">Required Consent:</p>
            
            <div className="flex items-start space-x-3">
              <Checkbox 
                id="direct-debit-consent" 
                checked={agreedToDirectDebit}
                onCheckedChange={(checked) => setAgreedToDirectDebit(checked as boolean)}
              />
              <label 
                htmlFor="direct-debit-consent" 
                className="text-sm text-muted-foreground leading-tight cursor-pointer"
              >
                I authorize Horeb Save to collect my group contributions automatically via Direct Debit 
                according to my group's payment schedule. I understand that I can cancel this authorization 
                at any time, but must complete all committed payment cycles as per the{" "}
                <a href="/group-participation-policy" className="text-primary hover:underline font-medium" target="_blank">
                  Group Participation Policy
                </a>
                {" "}to avoid penalties and protect the integrity of the savings group.
              </label>
            </div>
          </div>

          {/* Important Notice */}
          <Alert>
            <CheckCircle2 className="w-4 h-4" />
            <AlertDescription className="text-xs">
              <p className="font-semibold mb-1">Your Financial Security Matters</p>
              <ul className="space-y-1">
                <li>• We never see or store your full bank account details</li>
                <li>• Stripe handles all sensitive payment information</li>
                <li>• You can update or remove payment methods anytime</li>
                <li>• All transactions are encrypted and monitored for fraud</li>
                <li>• You're protected by Stripe's Buyer Protection and UK Direct Debit Guarantee</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleContinueToAccountLink}
              disabled={linkAccountMutation.isPending || !agreedToDirectDebit}
              className="flex-1"
            >
              {linkAccountMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Opening Account Setup...
                </>
              ) : (
                <>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Link Your Account
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={linkAccountMutation.isPending}
            >
              Cancel
            </Button>
          </div>

          {/* Footer Note */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              🔒 Powered by Stripe · Trusted by millions worldwide
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
