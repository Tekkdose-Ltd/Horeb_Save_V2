import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useStripe, useElements, CardElement, Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CreditCard, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { makeContribution, queryClient } from "@/lib/queryClient";

// Initialize Stripe - use your publishable key from environment variables
const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
const stripePromise = stripePublicKey && stripePublicKey.startsWith('pk_') 
  ? loadStripe(stripePublicKey) 
  : null;

interface ContributeModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  contributionAmount: number;
  groupName: string;
}

// Stripe Card Element styling
const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    invalid: {
      color: '#9e2146',
    },
  },
};

function ContributeForm({
  onClose,
  groupId,
  contributionAmount,
  groupName,
}: Omit<ContributeModalProps, 'isOpen'>) {
  const { toast } = useToast();
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const contributeMutation = useMutation({
    mutationFn: async (paymentMethodId: string) => {
      const response = await makeContribution({
        group_id: groupId,
        amount: contributionAmount,
        payment_method_id: paymentMethodId,
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Contribution Successful",
        description: `Your £${contributionAmount.toFixed(2)} contribution has been processed.`,
      });
      queryClient.invalidateQueries({ queryKey: [`/groups/${groupId}`] });
      queryClient.invalidateQueries({ queryKey: ["/payment/transaction/my"] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Payment Failed",
        description: error?.message || "Failed to process your contribution. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      toast({
        title: "Error",
        description: "Payment system not ready. Please try again.",
        variant: "destructive",
      });
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      toast({
        title: "Error",
        description: "Card information is missing. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Create a payment method with Stripe
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (error) {
        toast({
          title: "Card Error",
          description: error.message || "Invalid card details. Please check and try again.",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      if (paymentMethod) {
        // Send the tokenized payment method to backend
        await contributeMutation.mutateAsync(paymentMethod.id);
      }
    } catch (err) {
      console.error("Payment error:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Alert className="border-blue-200 bg-blue-50">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Secure Payment:</strong> Your card details are processed securely through Stripe.
          We do not store your card information.
        </AlertDescription>
      </Alert>

      <div className="space-y-2">
        <label className="text-sm font-medium">Card Details</label>
        <div className="border rounded-md p-3 bg-white">
          <CardElement options={cardElementOptions} />
        </div>
        <p className="text-xs text-muted-foreground">
          Enter your card number, expiry date, and CVC
        </p>
      </div>

      <Alert className="border-green-200 bg-green-50">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          <strong>Amount Due:</strong> £{contributionAmount.toFixed(2)}
        </AlertDescription>
      </Alert>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isProcessing || contributeMutation.isPending}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!stripe || isProcessing || contributeMutation.isPending}
          className="flex-1"
        >
          {isProcessing || contributeMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Pay £${contributionAmount.toFixed(2)}`
          )}
        </Button>
      </div>
    </form>
  );
}

export function ContributeModal({
  isOpen,
  onClose,
  groupId,
  contributionAmount,
  groupName,
}: ContributeModalProps) {
  if (!stripePromise) {
    console.warn("Stripe publishable key not configured");
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Make Contribution
          </DialogTitle>
          <DialogDescription>
            Contribute £{contributionAmount.toFixed(2)} to {groupName}
          </DialogDescription>
        </DialogHeader>

        {stripePromise ? (
          <Elements stripe={stripePromise}>
            <ContributeForm
              onClose={onClose}
              groupId={groupId}
              contributionAmount={contributionAmount}
              groupName={groupName}
            />
          </Elements>
        ) : (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Payment system is not configured. Please contact support.
            </AlertDescription>
          </Alert>
        )}

        <p className="text-xs text-muted-foreground text-center">
          🔒 Your payment is secured by Stripe. Card details are not stored.
        </p>
      </DialogContent>
    </Dialog>
  );
}
