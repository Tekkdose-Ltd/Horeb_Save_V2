import { useState } from "react";
import { LinkCardModal } from "./LinkCardModal";
import { LinkBankAccountModal } from "./LinkBankAccountModal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CreditCard, Building2, CheckCircle } from "lucide-react";

interface BankDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  requirementContext?: "join_group" | "receive_payout" | "profile";
  groupId?: string;
  memberId?: string;
  contributionAmount?: number;
}

/**
 * BankDetailsModal - Payment Method Selection
 * 
 * This modal allows users to choose between linking a card or bank account.
 * Each option opens its own independent modal for the specific flow.
 */
export function BankDetailsModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  requirementContext = "profile",
  groupId,
  memberId,
  contributionAmount
}: BankDetailsModalProps) {
  const [showLinkCard, setShowLinkCard] = useState(false);
  const [showLinkBank, setShowLinkBank] = useState(false);

  const handleCardSuccess = () => {
    if (onSuccess) {
      onSuccess();
    }
  };

  const handleBankSuccess = () => {
    if (onSuccess) {
      onSuccess();
    }
  };

  const handleClose = () => {
    setShowLinkCard(false);
    setShowLinkBank(false);
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Link Payment Method</DialogTitle>
            <DialogDescription>
              Choose which payment method you'd like to link. You can link both if needed.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Card 
              className="p-4 cursor-pointer hover:border-primary transition-colors border-2"
              onClick={() => setShowLinkCard(true)}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Link Card</h3>
                  <p className="text-sm text-muted-foreground">
                    Link your debit or credit card for automatic contributions and payments.
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-xs text-muted-foreground">Instant setup</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card 
              className="p-4 cursor-pointer hover:border-primary transition-colors border-2"
              onClick={() => setShowLinkBank(true)}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Link Account</h3>
                  <p className="text-sm text-muted-foreground">
                    Connect your bank account for Direct Debit contributions and receive payouts.
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-xs text-muted-foreground">Secure Direct Debit</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <Button variant="outline" onClick={handleClose} className="w-full">
            Close
          </Button>
        </DialogContent>
      </Dialog>

      {/* Independent Card Linking Modal */}
      <LinkCardModal
        isOpen={showLinkCard}
        onClose={() => setShowLinkCard(false)}
        onSuccess={handleCardSuccess}
      />

      {/* Independent Bank Account Linking Modal */}
      <LinkBankAccountModal
        isOpen={showLinkBank}
        onClose={() => setShowLinkBank(false)}
        onSuccess={handleBankSuccess}
        requirementContext={requirementContext}
        groupId={groupId}
        memberId={memberId}
        contributionAmount={contributionAmount}
      />
    </>
  );
}

// Export individual modals for direct use
export { LinkCardModal } from "./LinkCardModal";
export { LinkBankAccountModal } from "./LinkBankAccountModal";
