import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function GroupParticipationPolicy() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleDownloadPDF = () => {
    const content = document.getElementById('participation-content');
    if (!content) return;

    toast({
      title: "Preparing Download",
      description: "Your Group Participation Policy PDF is being generated...",
    });

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Horeb Save - Group Participation Policy</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; }
              h1 { color: #2563eb; margin-bottom: 10px; }
              h2 { color: #1e40af; margin-top: 24px; margin-bottom: 12px; }
              h3 { color: #1e3a8a; margin-top: 16px; margin-bottom: 8px; }
              p, li { color: #374151; margin-bottom: 8px; }
              .date { color: #6b7280; font-size: 14px; margin-bottom: 24px; }
              ul { margin-left: 20px; }
              .warning { background: #fef3c7; padding: 12px; border-left: 4px solid #f59e0b; margin: 16px 0; }
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
            <CardTitle className="text-3xl">Group Participation Policy</CardTitle>
            <p className="text-sm text-muted-foreground">Last updated: January 28, 2026</p>
          </CardHeader>
          <CardContent id="participation-content" className="prose prose-sm max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Commitment to Complete Payment Cycles</h2>
              
              <div className="bg-yellow-50 dark:bg-yellow-950 border-l-4 border-yellow-500 p-4 my-4">
                <p className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">⚠️ Fundamental Principle</p>
                <p className="text-yellow-800 dark:text-yellow-200">
                  All members MUST complete ALL payment cycles in any group they join before leaving the group 
                  or deleting their account. This is a binding commitment to protect the integrity of the savings 
                  group and prevent fraudulent activities.
                </p>
              </div>

              <h3 className="text-lg font-semibold mb-2 mt-4">What is a Payment Cycle?</h3>
              <p className="text-muted-foreground">
                A payment cycle is one complete round where all members make their scheduled contribution. The 
                total number of cycles equals the number of members in the group. Each member receives the pot 
                once during the group's lifetime.
              </p>

              <h3 className="text-lg font-semibold mb-2 mt-4">Cycle Completion Requirement</h3>
              <p className="text-muted-foreground">
                When you join a group, you commit to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Making contributions for ALL cycles until the group completes</li>
                <li>Contributing even after you've received your payout</li>
                <li>Maintaining active membership until the last member receives their payout</li>
                <li>Fulfilling your financial obligations regardless of personal circumstances</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Joining Groups</h2>
              
              <h3 className="text-lg font-semibold mb-2 mt-4">Eligibility Requirements</h3>
              <p className="text-muted-foreground">
                To join a group, you must:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Be at least 18 years of age</li>
                <li>Have completed profile verification</li>
                <li>Have linked a valid payment method via Stripe</li>
                <li>Have no outstanding debts to other groups</li>
                <li>Maintain a Trust Score of 3.0 or higher (for most groups)</li>
              </ul>

              <h3 className="text-lg font-semibold mb-2 mt-4">Joining Process</h3>
              <p className="text-muted-foreground">
                When joining a group:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Review the group's contribution amount, frequency, and rules</li>
                <li>Confirm you can commit to ALL payment cycles</li>
                <li>Read and accept this Group Participation Policy</li>
                <li>Wait for admin approval if required</li>
                <li>Select your preferred payout position (if available)</li>
              </ul>

              <h3 className="text-lg font-semibold mb-2 mt-4">Acceptance Confirmation</h3>
              <p className="text-muted-foreground">
                By clicking "Join Group", you legally agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Complete all payment cycles as scheduled</li>
                <li>Make timely contributions for the entire group duration</li>
                <li>Face penalties if you fail to fulfill your commitment</li>
                <li>Allow automatic payment collection via Direct Debit</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. Member Responsibilities</h2>
              
              <h3 className="text-lg font-semibold mb-2 mt-4">Financial Commitment</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Ensure sufficient funds are available on payment dates</li>
                <li>Keep your payment method active and valid</li>
                <li>Update payment details immediately if they change</li>
                <li>Pay any late fees or penalties promptly</li>
              </ul>

              <h3 className="text-lg font-semibold mb-2 mt-4">Communication</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Check notifications regularly for group updates</li>
                <li>Respond to admin requests within 48 hours</li>
                <li>Inform the group immediately if you face payment difficulties</li>
                <li>Participate in group discussions and decisions</li>
              </ul>

              <h3 className="text-lg font-semibold mb-2 mt-4">Conduct</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Treat all members with respect and courtesy</li>
                <li>Provide honest information about your financial situation</li>
                <li>Report suspicious activity or concerns to admins</li>
                <li>Follow all group rules set by the administrator</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Leaving a Group - Critical Rules</h2>
              
              <div className="bg-red-50 dark:bg-red-950 border-l-4 border-red-500 p-4 my-4">
                <p className="font-semibold text-red-900 dark:text-red-100 mb-2">🚫 Strict Policy</p>
                <p className="text-red-800 dark:text-red-200">
                  You CANNOT leave a group until ALL payment cycles are complete. Early departure is considered 
                  a breach of contract and will result in being reported to the credit reference agencies, legal action, and other penalties.
                </p>
              </div>

              <h3 className="text-lg font-semibold mb-2 mt-4">Prohibited Actions</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>❌ Leaving after receiving your payout but before group completion</li>
                <li>❌ Stopping contributions after your turn</li>
                <li>❌ Deleting your account with active group memberships</li>
                <li>❌ Blocking Direct Debit payments without valid reason</li>
                <li>❌ Creating a new account to avoid obligations</li>
              </ul>

              <h3 className="text-lg font-semibold mb-2 mt-4">Valid Exit Scenarios</h3>
              <p className="text-muted-foreground">
                You may only leave a group in these circumstances:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>All payment cycles have been completed by all members</li>
                <li>The group is disbanded by mutual agreement with compensation</li>
                <li>Proven fraud or violation by other members (with platform approval)</li>
                <li>Medical or emergency hardship (with documentation and approval)</li>
              </ul>

              <h3 className="text-lg font-semibold mb-2 mt-4">Emergency Exit Process</h3>
              <p className="text-muted-foreground">
                If you must leave for valid emergency reasons:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                <li>Contact support@horebsave.com immediately with documentation</li>
                <li>Provide evidence of your emergency situation</li>
                <li>Continue making payments during the review period (up to 14 days)</li>
                <li>Find a replacement member or pay all remaining contributions upfront</li>
                <li>Wait for approval from Horeb Save administration</li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Penalties for Non-Compliance</h2>
              
              <h3 className="text-lg font-semibold mb-2 mt-4">Missed Payments</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>First offense: £5-15 late fee + warning</li>
                <li>Second offense: £15-25 late fee + Trust Score reduction</li>
                <li>Third offense: Removal from group + legal action for owed amounts</li>
              </ul>

              <h3 className="text-lg font-semibold mb-2 mt-4">Early Departure (After Receiving Payout)</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Immediate debt collection for all remaining contributions</li>
                <li>Trust Score dropped to 0 (permanent)</li>
                <li>Account suspension and possible permanent ban</li>
                <li>Legal action to recover funds owed to group members</li>
                <li>Reporting to credit reference agencies</li>
                <li>Potential civil or criminal fraud charges</li>
              </ul>

              <h3 className="text-lg font-semibold mb-2 mt-4">Early Departure (Before Receiving Payout)</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Forfeiture of all contributions made</li>
                <li>£50-200 penalty fee</li>
                <li>Trust Score reduction by 2-3 points</li>
                <li>6-12 month suspension from joining new groups</li>
                <li>Contributions redistributed among remaining members</li>
              </ul>

              <h3 className="text-lg font-semibold mb-2 mt-4">Account Deletion with Active Groups</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Account deletion request will be DENIED</li>
                <li>Must complete all groups before account closure</li>
                <li>3-5 working day review by super admin</li>
                <li>Legal action if attempting to evade obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Trust Score Impact</h2>
              
              <h3 className="text-lg font-semibold mb-2 mt-4">How Trust Score Works</h3>
              <p className="text-muted-foreground">
                Your Trust Score (0-10) reflects your reliability and is visible to group admins when you apply 
                to join groups.
              </p>

              <h3 className="text-lg font-semibold mb-2 mt-4">Score Increases</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>+0.5 points for each on-time payment</li>
                <li>+1 point for completing a full group cycle</li>
                <li>+0.2 points for each month of good standing</li>
                <li>Bonus points for helping resolve group issues</li>
              </ul>

              <h3 className="text-lg font-semibold mb-2 mt-4">Score Decreases</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>-0.3 points for late payment (1-7 days)</li>
                <li>-1 point for very late payment (8+ days)</li>
                <li>-2 points for missed payment</li>
                <li>-5 points for early departure before payout</li>
                <li>-10 points (permanent 0) for abandoning after receiving payout</li>
              </ul>

              <h3 className="text-lg font-semibold mb-2 mt-4">Score Restrictions</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Score below 3.0: Limited to low-value groups only</li>
                <li>Score below 2.0: Cannot join any new groups for 6 months</li>
                <li>Score at 0: Permanent ban from platform</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Fraud Prevention</h2>
              
              <h3 className="text-lg font-semibold mb-2 mt-4">What Constitutes Fraud</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Receiving payout and stopping contributions</li>
                <li>Creating multiple accounts to join same group</li>
                <li>Providing false identity or financial information</li>
                <li>Colluding with others to manipulate payout order</li>
                <li>Initiating chargebacks on valid contributions</li>
                <li>Attempting to delete account to avoid payments</li>
              </ul>

              <h3 className="text-lg font-semibold mb-2 mt-4">Anti-Fraud Measures</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Identity verification for all users</li>
                <li>Payment method verification through Stripe</li>
                <li>Monitoring of suspicious activity patterns</li>
                <li>Cross-referencing of user data</li>
                <li>Mandatory waiting period for first-time users</li>
              </ul>

              <h3 className="text-lg font-semibold mb-2 mt-4">Consequences of Fraud</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Immediate account termination</li>
                <li>Full debt collection for all owed amounts</li>
                <li>Reporting to law enforcement</li>
                <li>Civil legal action for damages</li>
                <li>Criminal fraud charges if warranted</li>
                <li>Sharing information with credit agencies</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Group Completion</h2>
              
              <h3 className="text-lg font-semibold mb-2 mt-4">Successful Completion</h3>
              <p className="text-muted-foreground">
                A group is considered complete when:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>All members have received their payout</li>
                <li>All contributions have been collected</li>
                <li>All fees have been settled</li>
                <li>No outstanding disputes exist</li>
              </ul>

              <h3 className="text-lg font-semibold mb-2 mt-4">Post-Completion</h3>
              <p className="text-muted-foreground">
                After group completion:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Members can leave the group freely</li>
                <li>You can rate other members' reliability</li>
                <li>Group chat remains accessible for 30 days</li>
                <li>Transaction history remains permanently available</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">9. Dispute Resolution</h2>
              
              <h3 className="text-lg font-semibold mb-2 mt-4">Reporting Issues</h3>
              <p className="text-muted-foreground">
                If you have concerns about a group member or admin:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                <li>Document the issue with screenshots or evidence</li>
                <li>Report to the group admin first (if not the issue)</li>
                <li>Contact support@horebsave.com if unresolved</li>
                <li>Provide all relevant details and evidence</li>
                <li>Continue making payments during investigation</li>
              </ol>

              <h3 className="text-lg font-semibold mb-2 mt-4">Investigation Process</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Initial review within 2 business days</li>
                <li>Full investigation within 10 business days</li>
                <li>All parties contacted for statements</li>
                <li>Decision communicated with rationale</li>
                <li>Appeals can be filed within 14 days</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">10. Contact and Support</h2>
              <p className="text-muted-foreground">
                For group participation questions or issues:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>General inquiries: support@horebsave.com</li>
                <li>Emergency situations: emergency@horebsave.com</li>
                <li>Fraud reports: fraud@horebsave.com</li>
                <li>Phone: +44 (0) 20 1234 5678</li>
                <li>Live chat: Available in app 9am-6pm GMT</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">11. Acknowledgment</h2>
              <div className="bg-blue-50 dark:bg-blue-950 border-l-4 border-blue-500 p-4 my-4">
                <p className="font-semibold text-blue-900 dark:text-blue-100 mb-2">📋 Your Agreement</p>
                <p className="text-blue-800 dark:text-blue-200">
                  By joining any group on Horeb Save, you acknowledge that you have read, understood, and agree 
                  to comply with this Group Participation Policy. You understand that failure to complete payment 
                  cycles is a serious breach that will result in penalties, legal action, and permanent ban from 
                  the platform.
                </p>
              </div>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
