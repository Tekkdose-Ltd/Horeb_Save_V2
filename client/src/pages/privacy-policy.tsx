import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PrivacyPolicy() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleDownloadPDF = () => {
    const content = document.getElementById('privacy-content');
    if (!content) return;

    toast({
      title: "Preparing Download",
      description: "Your Privacy Policy PDF is being generated...",
    });

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Horeb Save - Privacy Policy</title>
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
            <CardTitle className="text-3xl">Privacy Policy</CardTitle>
            <p className="text-sm text-muted-foreground">Last updated: January 28, 2026</p>
          </CardHeader>
          <CardContent id="privacy-content" className="prose prose-sm max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
              
              <h3 className="text-lg font-semibold mb-2 mt-4">Personal Information</h3>
              <p className="text-muted-foreground mb-2">
                When you create an account, we collect:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Name and email address</li>
                <li>Phone number</li>
                <li>Date of birth</li>
                <li>Address information</li>
                <li>Profile picture (optional)</li>
              </ul>

              <h3 className="text-lg font-semibold mb-2 mt-4">Financial Information</h3>
              <p className="text-muted-foreground">
                Payment card information is collected and processed directly by Stripe, our payment processor. 
                We do not store your complete card details on our servers.
              </p>

              <h3 className="text-lg font-semibold mb-2 mt-4">Usage Information</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Groups you join and create</li>
                <li>Contribution history</li>
                <li>Trust score and ratings</li>
                <li>Platform activity and interactions</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. How We Use Your Information</h2>
              <p className="text-muted-foreground mb-2">
                We use your information to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Provide and maintain the Service</li>
                <li>Process payments and contributions</li>
                <li>Calculate and display trust scores</li>
                <li>Send notifications about group activity</li>
                <li>Prevent fraud and ensure platform security</li>
                <li>Improve our services</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. Information Sharing</h2>
              
              <h3 className="text-lg font-semibold mb-2 mt-4">With Other Users</h3>
              <p className="text-muted-foreground">
                Your profile information, trust score, and contribution history may be visible to other users, 
                particularly within groups you join.
              </p>

              <h3 className="text-lg font-semibold mb-2 mt-4">With Service Providers</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>Stripe:</strong> Payment processing</li>
                <li><strong>Cloud Hosting:</strong> Data storage and application hosting</li>
                <li><strong>Email Services:</strong> Transactional emails and notifications</li>
              </ul>

              <h3 className="text-lg font-semibold mb-2 mt-4">For Legal Reasons</h3>
              <p className="text-muted-foreground">
                We may disclose information if required by law or to protect our rights, safety, or the rights 
                and safety of our users.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Data Security</h2>
              <p className="text-muted-foreground mb-2">
                We implement security measures to protect your information:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Encryption of data in transit and at rest</li>
                <li>Secure authentication with JWT tokens</li>
                <li>PCI-DSS compliant payment processing via Stripe</li>
                <li>Regular security audits and updates</li>
                <li>Access controls and monitoring</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Your Rights</h2>
              <p className="text-muted-foreground mb-2">
                You have the right to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Access your personal information</li>
                <li>Update or correct your information</li>
                <li>Delete your account (subject to outstanding obligations)</li>
                <li>Export your data</li>
                <li>Opt out of marketing communications</li>
                <li>Lodge a complaint with supervisory authorities</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Data Retention</h2>
              <p className="text-muted-foreground">
                We retain your information for as long as your account is active or as needed to provide services. 
                After account deletion, we may retain certain information for legal compliance, dispute resolution, 
                and fraud prevention.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Cookies and Tracking</h2>
              <p className="text-muted-foreground mb-2">
                We use cookies and similar technologies to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Maintain your session</li>
                <li>Remember your preferences</li>
                <li>Analyze usage patterns</li>
                <li>Improve platform performance</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Children's Privacy</h2>
              <p className="text-muted-foreground">
                Our Service is not intended for users under 18 years of age. We do not knowingly collect information 
                from children under 18.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">9. International Data Transfers</h2>
              <p className="text-muted-foreground">
                Your information may be transferred to and processed in countries other than your country of residence. 
                We ensure appropriate safeguards are in place for such transfers.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">10. Changes to Privacy Policy</h2>
              <p className="text-muted-foreground">
                We may update this Privacy Policy from time to time. We will notify you of any material changes via 
                email or platform notification.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">11. Contact Us</h2>
              <p className="text-muted-foreground">
                For questions or concerns about this Privacy Policy or our data practices, please contact us at:
              </p>
              <p className="text-muted-foreground mt-2">
                <strong>Email:</strong> privacy@horebsave.com<br />
                <strong>Data Protection Officer:</strong> dpo@horebsave.com
              </p>
            </section>

            <div className="border-t pt-6 mt-8">
              <p className="text-sm text-muted-foreground">
                By using Horeb Save, you acknowledge that you have read and understood this Privacy Policy.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
