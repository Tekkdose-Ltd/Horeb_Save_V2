import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PaymentPolicy() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleDownloadPDF = () => {
    const content = document.getElementById('payment-content');
    if (!content) return;

    toast({
      title: "Preparing Download",
      description: "Your Payment Policy PDF is being generated...",
    });

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Horeb Save - Payment Policy</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; }
              h1 { color: #2563eb; margin-bottom: 10px; }
              h2 { color: #1e40af; margin-top: 24px; margin-bottom: 12px; }
              h3 { color: #1e3a8a; margin-top: 16px; margin-bottom: 8px; }
              p, li { color: #374151; margin-bottom: 8px; }
              .date { color: #6b7280; font-size: 14px; margin-bottom: 24px; }
              ul { margin-left: 20px; }
            </style>
          </head>
          <body>
            ${content.innerHTML}
          </body>
        </html>
      `);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost" 
            onClick={() => setLocation("/dashboard")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          
          <Button 
            variant="outline"
            onClick={handleDownloadPDF}
          >
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Payment Policy</CardTitle>
            <p className="text-sm text-muted-foreground">Last updated: January 28, 2026</p>
          </CardHeader>
          <CardContent id="payment-content" className="prose prose-sm max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Payment Processing</h2>
              
              <h3 className="text-lg font-semibold mb-2 mt-4">Payment Processor</h3>
              <p className="text-muted-foreground">
                All payments on Horeb Save are processed through Stripe, a PCI-DSS Level 1 certified payment processor. 
                This ensures the highest level of security for your financial information.
              </p>

              <h3 className="text-lg font-semibold mb-2 mt-4">Accepted Payment Methods</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>UK bank accounts (Direct Debit)</li>
                <li>Debit cards (Visa, Mastercard)</li>
                <li>Credit cards (Visa, Mastercard, American Express)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Direct Debit Authorization</h2>
              
              <h3 className="text-lg font-semibold mb-2 mt-4">Mandate Setup</h3>
              <p className="text-muted-foreground">
                By linking your payment method, you authorize Horeb Save to collect your group contributions 
                automatically via Direct Debit on your scheduled payment dates. This authorization remains active 
                for all groups you join until you cancel it.
              </p>

              <h3 className="text-lg font-semibold mb-2 mt-4">Payment Schedule</h3>
              <p className="text-muted-foreground">
                Contributions are collected according to your group's payment schedule (weekly, bi-weekly, or monthly). 
                You will receive advance notification before each payment is taken.
              </p>

              <h3 className="text-lg font-semibold mb-2 mt-4">Direct Debit Guarantee</h3>
              <p className="text-muted-foreground">
                All Direct Debit payments are protected by the Direct Debit Guarantee, which ensures:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Advance notice of collection amounts and dates</li>
                <li>Immediate refund from your bank if an error occurs</li>
                <li>Right to cancel at any time by contacting your bank</li>
                <li>Protection against unauthorized payments</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. Contribution Requirements</h2>
              
              <h3 className="text-lg font-semibold mb-2 mt-4">Timely Payments</h3>
              <p className="text-muted-foreground">
                You are required to make contributions on time according to your group's schedule. Late or missed 
                payments may result in:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Late payment fees</li>
                <li>Negative impact on your Trust Score</li>
                <li>Removal from the group</li>
                <li>Restriction from joining future groups</li>
              </ul>

              <h3 className="text-lg font-semibold mb-2 mt-4">Failed Payments</h3>
              <p className="text-muted-foreground">
                If a payment fails due to insufficient funds or other reasons:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>We will attempt to collect the payment again within 3 business days</li>
                <li>You will be notified immediately via email and in-app notification</li>
                <li>A failed payment fee may be applied</li>
                <li>You must update your payment method or add funds to your account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Payout Process</h2>
              
              <h3 className="text-lg font-semibold mb-2 mt-4">Receiving Payouts</h3>
              <p className="text-muted-foreground">
                When it's your turn to receive the group pot:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>The full amount is transferred to your linked bank account</li>
                <li>Transfers typically arrive within 1-3 business days</li>
                <li>You will receive confirmation once the transfer is initiated</li>
                <li>No fees are charged for receiving payouts</li>
              </ul>

              <h3 className="text-lg font-semibold mb-2 mt-4">Payout Requirements</h3>
              <p className="text-muted-foreground">
                To receive payouts, you must:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Have a verified bank account linked to your Horeb Save account</li>
                <li>Be in good standing with all contribution payments up to date</li>
                <li>Have completed identity verification</li>
                <li>Not have any pending disputes or issues</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Fees and Charges</h2>
              
              <h3 className="text-lg font-semibold mb-2 mt-4">Platform Fees</h3>
              <p className="text-muted-foreground">
                Horeb Save charges a small service fee to maintain the platform:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Group administration fee: 2% of each contribution</li>
                <li>Payment processing fee: Covered by the platform</li>
                <li>Payout fees: None - completely free</li>
              </ul>

              <h3 className="text-lg font-semibold mb-2 mt-4">Additional Charges</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Late payment fee: £5-15 depending on group size</li>
                <li>Failed payment fee: £2.50 per failed transaction</li>
                <li>Chargeback fee: £15 if you dispute a valid payment</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Refund Policy</h2>
              
              <h3 className="text-lg font-semibold mb-2 mt-4">Contribution Refunds</h3>
              <p className="text-muted-foreground">
                Contributions are generally non-refundable once made. However, refunds may be issued in cases of:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Duplicate or erroneous charges</li>
                <li>Group cancellation before completion</li>
                <li>Fraudulent activity by group members</li>
                <li>System errors that result in incorrect charges</li>
              </ul>

              <h3 className="text-lg font-semibold mb-2 mt-4">Refund Process</h3>
              <p className="text-muted-foreground">
                Approved refunds are processed within 5-10 business days and returned to your original payment method.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Payment Security</h2>
              
              <h3 className="text-lg font-semibold mb-2 mt-4">Data Protection</h3>
              <p className="text-muted-foreground">
                Your payment information is protected by:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>256-bit SSL encryption for all transactions</li>
                <li>PCI-DSS Level 1 compliance through Stripe</li>
                <li>Two-factor authentication for account access</li>
                <li>Regular security audits and monitoring</li>
              </ul>

              <h3 className="text-lg font-semibold mb-2 mt-4">Fraud Prevention</h3>
              <p className="text-muted-foreground">
                We employ multiple fraud prevention measures including:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Real-time transaction monitoring</li>
                <li>Identity verification for all users</li>
                <li>Machine learning fraud detection</li>
                <li>3D Secure authentication for card payments</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Cancellation and Modification</h2>
              
              <h3 className="text-lg font-semibold mb-2 mt-4">Cancelling Direct Debit</h3>
              <p className="text-muted-foreground">
                You can cancel your Direct Debit authorization at any time through:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Your Horeb Save account settings</li>
                <li>Contacting your bank directly</li>
                <li>Emailing support@horebsave.com</li>
              </ul>
              <p className="text-muted-foreground mt-2">
                <strong>Important:</strong> Cancelling your Direct Debit does not cancel your commitment to existing 
                groups. You must continue making contributions through alternative payment methods or follow the 
                proper group exit procedure.
              </p>

              <h3 className="text-lg font-semibold mb-2 mt-4">Updating Payment Methods</h3>
              <p className="text-muted-foreground">
                You can update your payment method at any time in your profile settings. Changes take effect 
                immediately for future payments.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">9. Disputes and Chargebacks</h2>
              
              <h3 className="text-lg font-semibold mb-2 mt-4">Dispute Resolution</h3>
              <p className="text-muted-foreground">
                If you believe a payment was made in error, contact us at support@horebsave.com within 30 days. 
                We will investigate and resolve the issue within 10 business days.
              </p>

              <h3 className="text-lg font-semibold mb-2 mt-4">Chargeback Policy</h3>
              <p className="text-muted-foreground">
                Initiating a chargeback for a valid contribution may result in:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Immediate suspension of your account</li>
                <li>Removal from all active groups</li>
                <li>A £15 chargeback fee</li>
                <li>Legal action to recover owed amounts</li>
                <li>Permanent ban from the platform for fraudulent chargebacks</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">10. Contact Information</h2>
              <p className="text-muted-foreground">
                For payment-related questions or issues, please contact us:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Email: payments@horebsave.com</li>
                <li>Support: support@horebsave.com</li>
                <li>Phone: +44 (0) 20 1234 5678</li>
                <li>Address: Horeb Save Ltd, 123 Financial Street, London, UK</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">11. Policy Changes</h2>
              <p className="text-muted-foreground">
                We may update this Payment Policy from time to time. Significant changes will be communicated via 
                email at least 30 days before they take effect. Your continued use of the platform after changes 
                constitutes acceptance of the updated policy.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
