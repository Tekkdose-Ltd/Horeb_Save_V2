import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { getEnvironmentConfig, isStripeConfigured, getStripeConfigError } from "@/lib/env";
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
  CreditCard, 
  Shield,
  AlertCircle,
  CheckCircle2,
  Lock,
  Loader2
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Initialize Stripe
let stripePromise: Promise<any> | null = null;

const getStripe = () => {
  if (!stripePromise) {
    const config = getEnvironmentConfig();
    if (config.stripePublicKey) {
      stripePromise = loadStripe(config.stripePublicKey);
    }
  }
  return stripePromise;
};

// Card Form Component
interface CardFormProps {
  clientSecret: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

function CardForm({ clientSecret, onSuccess, onError }: CardFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const handleLoadError = (event: any) => {
    let errorMessage = event.error?.message || "Failed to load payment form.";
    
    if (errorMessage.includes("does not match") || errorMessage.includes("publishable key")) {
      errorMessage = "⚠️ Stripe Account Mismatch: The backend and frontend are using different Stripe accounts. Please ensure both use matching keys from the same Stripe account.";
    }
    
    setLoadError(errorMessage);
    onError(errorMessage);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error, setupIntent } = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: window.location.origin,
        },
        redirect: "if_required",
      });

      if (error) {
        onError(error.message || "Failed to confirm card setup");
      } else if (setupIntent && setupIntent.status === "succeeded") {
        onSuccess();
      }
    } catch (err: any) {
      onError(err.message || "An unexpected error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {loadError ? (
        <Alert variant="destructive" className="border-2">
          <AlertCircle className="w-5 h-5" />
          <AlertDescription>
            <p className="font-semibold mb-2 text-base">Payment Form Error</p>
            <div className="text-sm whitespace-pre-line">{loadError}</div>
          </AlertDescription>
        </Alert>
      ) : !stripe || !elements ? (
        <div className="p-4 border border-border rounded-lg bg-background">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
            <span className="text-sm text-muted-foreground">Loading payment form...</span>
          </div>
        </div>
      ) : (
        <div className="p-4 border border-border rounded-lg bg-background">
          <PaymentElement 
            onLoadError={handleLoadError}
            options={{
              layout: {
                type: 'tabs',
                defaultCollapsed: false,
              },
              fields: {
                billingDetails: {
                  address: {
                    country: 'auto',
                  }
                }
              }
            }}
          />
        </div>
      )}
      
      <Button
        type="submit"
        disabled={!stripe || !elements || isProcessing || !!loadError}
        className="w-full"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4 mr-2" />
            Confirm Card Details
          </>
        )}
      </Button>
    </form>
  );
}

interface LinkCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function LinkCardModal({ 
  isOpen, 
  onClose, 
  onSuccess,
}: LinkCardModalProps) {
  const { toast } = useToast();
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [cardIntentData, setCardIntentData] = useState<any>(null);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setAgreedToTerms(false);
      setCardIntentData(null);
    }
  }, [isOpen]);

  const linkCardMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("GET", "/payment/linkCard");
      return response.json();
    },
    onSuccess: (response) => {
      const clientSecret = response.data?.client_secret || response.data?.clientSecret || response.client_secret || response.clientSecret;
      
      const normalizedData = {
        ...response,
        client_secret: clientSecret
      };
      
      setCardIntentData(normalizedData);
      
      if (normalizedData.client_secret) {
        toast({
          title: "Card Setup Ready",
          description: "Please enter your card details below.",
        });
      } else {
        toast({
          title: "Setup Error",
          description: "No client secret received. Please try again.",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to initialize card linking. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCardSetupSuccess = () => {
    toast({
      title: "Card Linked Successfully",
      description: "Your card has been securely linked to your account.",
    });
    if (onSuccess) {
      onSuccess();
    }
    onClose();
  };

  const handleCardSetupError = (error: string) => {
    toast({
      title: "Card Setup Failed",
      description: error,
      variant: "destructive",
    });
  };

  const handleInitializeCardSetup = () => {
    if (!agreedToTerms) {
      toast({
        title: "Consent Required",
        description: "Please read and agree to the terms before proceeding.",
        variant: "destructive",
      });
      return;
    }

    linkCardMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Link Your Card
          </DialogTitle>
          <DialogDescription>
            Link your debit or credit card for automatic contributions and secure payments.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Stripe Security Notice */}
          <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-900">
            <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <AlertDescription className="text-sm text-blue-700 dark:text-blue-300">
              <p className="font-semibold mb-1">Secure Payment Processing with Stripe</p>
              <p>
                We use Stripe, a PCI-DSS Level 1 certified payment processor. Your card information 
                is encrypted and never stored on our servers.
              </p>
            </AlertDescription>
          </Alert>

          {/* Card Form - Show when we have client secret */}
          {cardIntentData?.client_secret && (
            <Card className="p-4">
              <div className="mb-4">
                <h3 className="text-sm font-semibold flex items-center gap-2 mb-2">
                  <CreditCard className="w-4 h-4 text-primary" />
                  Enter Your Card Details
                </h3>
                <p className="text-xs text-muted-foreground">
                  Your card information is processed securely by Stripe. We never see your full card details.
                </p>
              </div>
              
              {isStripeConfigured() ? (
                <Elements 
                  stripe={getStripe()} 
                  options={{
                    clientSecret: cardIntentData.client_secret,
                    appearance: {
                      theme: 'stripe',
                      variables: {
                        colorPrimary: '#0070f3',
                        colorBackground: '#ffffff',
                        colorText: '#1a1a1a',
                        fontFamily: 'system-ui, sans-serif',
                        spacingUnit: '4px',
                        borderRadius: '8px',
                      },
                    },
                    loader: 'auto',
                  }}
                >
                  <CardForm 
                    clientSecret={cardIntentData.client_secret}
                    onSuccess={handleCardSetupSuccess}
                    onError={handleCardSetupError}
                  />
                </Elements>
              ) : (
                <Alert variant="destructive">
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>
                    {getStripeConfigError()}
                  </AlertDescription>
                </Alert>
              )}
            </Card>
          )}

          {/* Consent Checkbox */}
          {!cardIntentData?.client_secret && (
            <>
              <Card className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CreditCard className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold">Automatic Contributions</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Your card will be used for automatic contributions to your savings groups.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Lock className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold">Protected Transactions</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        All transactions are monitored for fraud and protected by Stripe's security.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              <div className="space-y-4 border border-border rounded-lg p-4">
                <p className="text-sm font-semibold">Required Consent:</p>
                
                <div className="flex items-start space-x-3">
                  <Checkbox 
                    id="terms-consent" 
                    checked={agreedToTerms}
                    onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                  />
                  <label 
                    htmlFor="terms-consent" 
                    className="text-sm text-muted-foreground leading-tight cursor-pointer"
                  >
                    I have read and agree to the{" "}
                    <a href="/terms-of-service" className="text-primary hover:underline font-medium" target="_blank">
                      Terms of Service
                    </a>
                    ,{" "}
                    <a href="/privacy-policy" className="text-primary hover:underline font-medium" target="_blank">
                      Privacy Policy
                    </a>
                    , and{" "}
                    <a href="/payment-policy" className="text-primary hover:underline font-medium" target="_blank">
                      Payment Policy
                    </a>
                    . I understand that my payment information will be securely processed by Stripe.
                  </label>
                </div>
              </div>

              <Alert>
                <CheckCircle2 className="w-4 h-4" />
                <AlertDescription className="text-xs">
                  <p className="font-semibold mb-1">Your Financial Security Matters</p>
                  <ul className="space-y-1">
                    <li>• We never see or store your full card details</li>
                    <li>• Stripe handles all sensitive payment information</li>
                    <li>• You can update or remove your card anytime</li>
                    <li>• All transactions are encrypted and monitored for fraud</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleInitializeCardSetup}
                  disabled={linkCardMutation.isPending || !agreedToTerms}
                  className="flex-1"
                >
                  {linkCardMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Initializing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Initialize Card Setup
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={linkCardMutation.isPending}
                >
                  Cancel
                </Button>
              </div>
            </>
          )}

          {cardIntentData?.client_secret && (
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-full"
            >
              Cancel
            </Button>
          )}

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
