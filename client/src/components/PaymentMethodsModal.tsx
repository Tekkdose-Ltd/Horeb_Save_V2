import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useStripe, useElements, PaymentElement, Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { apiRequest, queryClient } from "@/lib/queryClient";
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
import { CreditCard, Trash2, Plus } from "lucide-react";

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

function AddPaymentMethodForm({ onSuccess }: { onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmSetup({
      elements,
      confirmParams: {
        return_url: window.location.origin + '/profile',
      },
      redirect: 'if_required',
    });

    setIsProcessing(false);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Payment method added successfully",
      });
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <Button 
        type="submit" 
        className="w-full" 
        disabled={!stripe || isProcessing}
        data-testid="button-add-payment-method"
      >
        {isProcessing ? "Processing..." : "Add Payment Method"}
      </Button>
    </form>
  );
}

interface PaymentMethodsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PaymentMethodsModal({ isOpen, onClose }: PaymentMethodsModalProps) {
  const { toast } = useToast();
  const [showAddForm, setShowAddForm] = useState(false);
  const [clientSecret, setClientSecret] = useState("");

  const { data: paymentMethods, isLoading } = useQuery({
    queryKey: ["/api/payment-methods"],
    enabled: isOpen,
  });

  const createSetupIntentMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/create-setup-intent");
      return response.json();
    },
    onSuccess: (data) => {
      setClientSecret(data.clientSecret);
      setShowAddForm(true);
    },
  });

  const deletePaymentMethodMutation = useMutation({
    mutationFn: async (paymentMethodId: string) => {
      const response = await apiRequest("DELETE", `/api/payment-methods/${paymentMethodId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payment-methods"] });
      toast({
        title: "Success",
        description: "Payment method removed",
      });
    },
  });

  const handleAddPaymentMethod = () => {
    createSetupIntentMutation.mutate();
  };

  const handleSuccess = () => {
    setShowAddForm(false);
    setClientSecret("");
    queryClient.invalidateQueries({ queryKey: ["/api/payment-methods"] });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" data-testid="modal-payment-methods">
        <DialogHeader>
          <DialogTitle>Manage Payment Methods</DialogTitle>
          <DialogDescription>
            Add or remove payment methods for your contributions.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!showAddForm ? (
            <>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : paymentMethods && paymentMethods.length > 0 ? (
                <div className="space-y-3">
                  {paymentMethods.map((method: any) => (
                    <Card key={method.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {method.card?.brand?.toUpperCase()} •••• {method.card?.last4}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Expires {method.card?.exp_month}/{method.card?.exp_year}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deletePaymentMethodMutation.mutate(method.id)}
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
                  <p className="text-muted-foreground mb-4">No payment methods added yet</p>
                </div>
              )}

              <Button 
                onClick={handleAddPaymentMethod} 
                className="w-full"
                disabled={createSetupIntentMutation.isPending}
                data-testid="button-show-add-form"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Payment Method
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
                onClick={() => {
                  setShowAddForm(false);
                  setClientSecret("");
                }}
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
