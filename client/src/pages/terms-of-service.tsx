import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function TermsOfService() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleDownloadPDF = () => {
    // Create the content for the PDF
    const content = document.getElementById('terms-content');
    if (!content) return;

    toast({
      title: "Preparing Download",
      description: "Your Terms of Service PDF is being generated...",
    });

    // For now, we'll use browser print functionality
    // In production, you'd want to use a proper PDF library like jsPDF or pdfmake
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Horeb Save - Terms of Service</title>
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
            <CardTitle className="text-3xl">Terms of Service</CardTitle>
            <p className="text-sm text-muted-foreground">Last updated: January 28, 2026</p>
          </CardHeader>
          <CardContent id="terms-content" className="prose prose-sm max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground">
                By accessing and using Horeb Save ("the Service"), you accept and agree to be bound by the terms 
                and provisions of this agreement. If you do not agree to these Terms of Service, please do not use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Description of Service</h2>
              <p className="text-muted-foreground">
                Horeb Save is a peer-to-peer savings platform that facilitates rotating savings and credit associations (ROSCAs). 
                Members contribute a fixed amount regularly, and each member receives the total pool in rotation.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. User Responsibilities</h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>You must be at least 18 years old to use this Service</li>
                <li>You are responsible for maintaining the confidentiality of your account</li>
                <li>You must make timely contributions to groups you join</li>
                <li>You must not engage in fraudulent activities</li>
                <li>You must provide accurate and complete information</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Payment Terms</h2>
              <p className="text-muted-foreground mb-2">
                All payments are processed securely through Stripe. By making a contribution:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>You authorize Horeb Save to process your payment</li>
                <li>Contributions are non-refundable once processed</li>
                <li>You are responsible for any fees charged by your card issuer</li>
                <li>Failed payments may result in removal from the group</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Group Participation</h2>
              <p className="text-muted-foreground mb-2">
                When you join a savings group:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>You commit to making all scheduled contributions</li>
                <li>You agree to the payout rotation schedule</li>
                <li>You may be rated by other group members</li>
                <li>Group creators have the authority to manage group settings</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Trust Score and Ratings</h2>
              <p className="text-muted-foreground">
                Your trust score is calculated based on your payment history and peer ratings. This score is visible 
                to other users and may affect your ability to join certain groups.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Dispute Resolution</h2>
              <p className="text-muted-foreground">
                In case of disputes between group members, users should first attempt to resolve the issue directly. 
                Horeb Save may intervene in cases of suspected fraud or Terms violation.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Limitation of Liability</h2>
              <p className="text-muted-foreground">
                Horeb Save acts as a facilitator and is not responsible for:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Non-payment by group members</li>
                <li>Disputes between members</li>
                <li>Financial losses incurred through participation</li>
                <li>Service interruptions or technical issues</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">9. Account Termination</h2>
              <p className="text-muted-foreground">
                We reserve the right to suspend or terminate accounts that violate these terms, engage in fraudulent 
                activity, or fail to meet payment obligations.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">10. Changes to Terms</h2>
              <p className="text-muted-foreground">
                We reserve the right to modify these terms at any time. Users will be notified of significant changes 
                via email or platform notification.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">11. Contact Information</h2>
              <p className="text-muted-foreground">
                For questions about these Terms of Service, please contact us at: support@horebsave.com
              </p>
            </section>

            <div className="border-t pt-6 mt-8">
              <p className="text-sm text-muted-foreground">
                By continuing to use Horeb Save, you acknowledge that you have read, understood, and agree to be 
                bound by these Terms of Service.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
