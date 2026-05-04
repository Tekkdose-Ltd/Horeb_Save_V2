import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  useStripe,
  useElements,
  PaymentElement,
  Elements,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CreditCard, Trash2, Plus } from "lucide-react";

// Allow development without Stripe keys configured
const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
const stripePromise = stripePublicKey && stripePublicKey.startsWith('pk_') 
  ? loadStripe(stripePublicKey) 
  : null;

interface PaymentMethod {
  id: string;
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
}

function AddPaymentMethodForm({ onSuccess }: { onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isReady, setIsReady] = useState(false);

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

    const paymentElement = elements.getElement(PaymentElement);
    if (!paymentElement) {
      toast({
        title: "Error",
        description:
          "Payment form not ready. Please wait a moment and try again.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
    const { setupIntent, error } = await stripe.confirmSetup({
      elements,
      confirmParams: { return_url: window.location.origin + "/profile" },
      redirect: "if_required",
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to add payment method",
        variant: "destructive",
      });
    } else if (setupIntent?.status === "succeeded") {
      toast({
        title: "Success",
        description: "Payment method added successfully",
      });
      onSuccess();
    } else {
      toast({
        title: "Info",
        description: "Payment setup is pending confirmation.",
      });
    }
    } catch (err) {
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
      <PaymentElement
        onReady={() => setIsReady(true)}
        options={{
          layout: "tabs",
        }}
      />
      <Button
        type="submit"
        className="w-full"
        disabled={!stripe || !elements || isProcessing || !isReady}
        data-testid="button-add-payment-method"
      >
        {!isReady
          ? "Loading..."
          : isProcessing
            ? "Processing..."
            : "Add Payment Method"}
      </Button>
    </form>
  );
}

interface PaymentMethodsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PaymentMethodsModal({
  isOpen,
  onClose,
}: PaymentMethodsModalProps) {
  const { toast } = useToast();
  const [showAddForm, setShowAddForm] = useState(false);
  const [clientSecret, setClientSecret] = useState("");

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setShowAddForm(false);
      setClientSecret("");
    }
  }, [isOpen]);

  const {
    data: paymentMethods = [],
    isLoading,
    error,
    refetch,
  } = useQuery<PaymentMethod[]>({
    queryKey: ["/payment-methods"],
    enabled: isOpen,
    retry: (failureCount, error: any) => {
      if (error?.status === 401 || error?.message?.includes("Unauthorized")) {
        return false;
      }
      return failureCount < 2; // Reduce retry attempts
    },
    retryDelay: 1000,
    staleTime: 30000, // Cache for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });

  const createSetupIntentMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/payment/create-setup-intent");
      return response.json();
    },
    onSuccess: (data) => {
      setClientSecret(data.clientSecret);
      setShowAddForm(true);
    },
    onError: (error: any) => {
      const message =
        error?.status === 401
          ? "Please log in to add payment methods."
          : "Failed to initialize payment setup. Please try again.";

      toast({
        title: error?.status === 401 ? "Authentication Required" : "Error",
        description: message,
        variant: "destructive",
      });
    },
  });

  const deletePaymentMethodMutation = useMutation({
    mutationFn: async (paymentMethodId: string) => {
      const response = await apiRequest(
        "DELETE",
        `/payment-methods/${paymentMethodId}`,
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/payment-methods"] });
      toast({
        title: "Success",
        description: "Payment method removed",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove payment method. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSuccess = () => {
    setShowAddForm(false);
    setClientSecret("");
    queryClient.invalidateQueries({ queryKey: ["/payment-methods"] });
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setClientSecret("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment Methods
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!showAddForm ? (
            <>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="w-8 h-8 text-red-500" />
                  </div>
                  <p className="text-red-600 mb-4">
                    {(error as any)?.status === 401
                      ? "Please log in to manage payment methods"
                      : "Failed to load payment methods"}
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    Error details: {(error as any)?.message || "Unknown error"}
                  </p>
                  {(error as any)?.status !== 401 && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        refetch();
                      }}
                      className="mb-4"
                    >
                      Try Again
                    </Button>
                  )}
                </div>
              ) : paymentMethods.length > 0 ? (
                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <Card key={method.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {method.card?.brand?.toUpperCase()} ••••{" "}
                              {method.card?.last4}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Expires {method.card?.exp_month}/
                              {method.card?.exp_year}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            deletePaymentMethodMutation.mutate(method.id)
                          }
                          disabled={deletePaymentMethodMutation.isPending}
                          data-testid={`button-delete-${method.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground mb-4">
                    No payment methods added yet
                  </p>
                </div>
              )}

              <Button
                onClick={() => createSetupIntentMutation.mutate()}
                className="w-full"
                disabled={createSetupIntentMutation.isPending}
                data-testid="button-show-add-form"
              >
                <Plus className="w-4 h-4 mr-2" />
                {createSetupIntentMutation.isPending
                  ? "Initializing..."
                  : "Add Payment Method"}
              </Button>
            </>
          ) : (
            <div>
              {clientSecret ? (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <AddPaymentMethodForm onSuccess={handleSuccess} />
                </Elements>
              ) : (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              )}
              <Button
                variant="ghost"
                onClick={handleCancel}
                className="w-full mt-4"
                data-testid="button-cancel-add"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
