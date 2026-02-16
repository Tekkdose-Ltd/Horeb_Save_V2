import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Plus, Trash2, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

/**
 * Payment Methods Component
 * 
 * Display user's saved payment methods
 * Allow adding/removing payment methods
 */

interface PaymentMethod {
  id: string;
  type: "card";
  last4: string;
  cardBrand?: string;
  isDefault: boolean;
  status: "active" | "pending_verification" | "failed";
}

export function PaymentMethods() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Fetch user's payment methods
  const { data: paymentMethods, isLoading } = useQuery<PaymentMethod[]>({
    queryKey: ["//payment/methods"],
  });

  // Set default payment method
  const setDefaultMutation = useMutation({
    mutationFn: async (methodId: string) => {
      const response = await apiRequest("POST", "/payment/methods/default", {
        payment_method_id: methodId,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["//payment/methods"] });
      toast({
        title: "Default Updated",
        description: "Your default payment method has been updated.",
      });
    },
  });

  // Remove payment method
  const removeMutation = useMutation({
    mutationFn: async (methodId: string) => {
      const response = await apiRequest("DELETE", `//payment/methods/${methodId}`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["//payment/methods"] });
      toast({
        title: "Payment Method Removed",
        description: "The payment method has been removed.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Removal Failed",
        description: error?.message || "Failed to remove payment method.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Loading payment methods...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Payment Methods</h2>
          <p className="text-muted-foreground">
            Manage your cards for payments
          </p>
        </div>
        <Button onClick={() => setLocation("/payment-setup")}>
          <Plus className="w-4 h-4 mr-2" />
          Add Payment Method
        </Button>
      </div>

      {!paymentMethods || paymentMethods.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                <CreditCard className="w-8 h-8 text-muted-foreground" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">No Payment Methods</h3>
            <p className="text-muted-foreground mb-4">
              Add a card to start contributing to groups
            </p>
            <Button onClick={() => setLocation("/payment-setup")}>
              <Plus className="w-4 h-4 mr-2" />
              Add Payment Method
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {paymentMethods.map((method) => (
            <Card key={method.id}>
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">
                        {method.cardBrand || "Card"}
                      </p>
                      {method.isDefault && (
                        <Badge variant="secondary">Default</Badge>
                      )}
                      {method.status === "pending_verification" && (
                        <Badge variant="outline" className="border-amber-500 text-amber-600">
                          Pending
                        </Badge>
                      )}
                      {method.status === "active" && (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      •••• •••• •••• {method.last4}
                    </p>
                    {method.status === "pending_verification" && (
                      <p className="text-xs text-amber-600 mt-1">
                        Verification in progress
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!method.isDefault && method.status === "active" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDefaultMutation.mutate(method.id)}
                      disabled={setDefaultMutation.isPending}
                    >
                      Set as Default
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeMutation.mutate(method.id)}
                    disabled={removeMutation.isPending || method.isDefault}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Info Alert */}
      <Alert className="border-blue-200 bg-blue-50">
        <AlertDescription className="text-blue-800">
          <strong>Secure Payments:</strong> All card payments are securely processed by Stripe.
          Your payment information is encrypted and protected at all times.
        </AlertDescription>
      </Alert>
    </div>
  );
}
