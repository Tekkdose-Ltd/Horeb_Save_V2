import { useState } from "react";
import { useLocation } from "wouter";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

/**
 * Payment Setup Page
 * 
 * Users add their card for secure payments via Stripe
 * All payments go to Horeb's Stripe account (escrow model)
 */

export default function PaymentSetup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Card form state
  const [cardDetails, setCardDetails] = useState({
    cardHolderName: "",
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
  });

  // Setup payment method mutation
  const setupPaymentMutation = useMutation({
    mutationFn: async (data: any) => {
      // Step 1: Create setup intent
      const setupIntentResponse = await apiRequest("POST", "/payment/setup-intent", {});
      const setupIntentData = await setupIntentResponse.json();
      
      if (!setupIntentData.clientSecret) {
        throw new Error("Failed to create payment setup intent");
      }

      // Step 2: Add payment method with the client secret
      const response = await apiRequest("POST", "/payment/methods", {
        ...data,
        clientSecret: setupIntentData.clientSecret,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Payment Method Added",
        description: "Your payment method has been set up successfully.",
      });
      setLocation("/dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "Setup Failed",
        description: error?.message || "Failed to add payment method. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setupPaymentMutation.mutate({
      type: "card",
      ...cardDetails,
    });
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar className="w-64" />
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4 min-h-full">
          <div className="max-w-2xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Set Up Payment Method</h1>
          <p className="text-muted-foreground">
            Add your card for secure payments via Stripe
          </p>
        </div>

        {/* Info Alert */}
        <Alert className="mb-6 border-blue-200 bg-blue-50">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>How it works:</strong> Your payments will be securely processed via Stripe on the due date
            and held by Horeb Save until your payout turn. This ensures everyone contributes
            before anyone receives funds.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Add Card Details</CardTitle>
            <CardDescription>
              Your card information is securely processed through Stripe
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCardSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cardHolderName">Cardholder Name *</Label>
                <Input
                  id="cardHolderName"
                  placeholder="John Doe"
                  value={cardDetails.cardHolderName}
                  onChange={(e) => setCardDetails({ ...cardDetails, cardHolderName: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number *</Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  value={cardDetails.cardNumber}
                  onChange={(e) => {
                    // Auto-format card number
                    let value = e.target.value.replace(/[^0-9]/g, '');
                    value = value.match(/.{1,4}/g)?.join(' ') || value;
                    setCardDetails({ ...cardDetails, cardNumber: value });
                  }}
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiryMonth">Month *</Label>
                  <Input
                    id="expiryMonth"
                    placeholder="MM"
                    maxLength={2}
                    value={cardDetails.expiryMonth}
                    onChange={(e) => setCardDetails({ ...cardDetails, expiryMonth: e.target.value.replace(/[^0-9]/g, '') })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiryYear">Year *</Label>
                  <Input
                    id="expiryYear"
                    placeholder="YY"
                    maxLength={2}
                    value={cardDetails.expiryYear}
                    onChange={(e) => setCardDetails({ ...cardDetails, expiryYear: e.target.value.replace(/[^0-9]/g, '') })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV *</Label>
                  <Input
                    id="cvv"
                    placeholder="123"
                    type="password"
                    maxLength={4}
                    value={cardDetails.cvv}
                    onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value.replace(/[^0-9]/g, '') })}
                    required
                  />
                </div>
              </div>

              <Alert className="border-green-200 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>Secure & Protected:</strong> Your card details are encrypted and processed
                  securely through Stripe. Horeb Save never stores your complete card information.
                </AlertDescription>
              </Alert>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={setupPaymentMutation.isPending}
              >
                {setupPaymentMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  "Add Card"
                )}
              </Button>
            </form>

            {/* Skip Option */}
            <div className="mt-6 text-center">
              <Button
                variant="ghost"
                onClick={() => setLocation("/dashboard")}
              >
                Skip for now
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>
            🔒 Your payment information is encrypted and secured by Stripe.
            <br />
            Horeb Save is PCI DSS compliant and never stores your full payment details.
          </p>
        </div>
          </div>
        </div>
      </div>
    </div>
  );
}
