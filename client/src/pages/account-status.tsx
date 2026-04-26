import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { HorebSaveLogo } from "@/components/HorebSaveLogo";
import { BankDetailsModal } from "@/components/BankDetailsModal";
import {
  MailCheck,
  CreditCard,
  Building2,
  RefreshCw,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Loader2,
} from "lucide-react";

/**
 * Account Status Page
 *
 * Users land here when:
 *  - Their email is not yet verified          (reason=unverified)
 *  - Their card/payment link has failed       (reason=payment-failed)
 *  - Their Stripe Connect linking failed      (reason=stripe-connect-failed)
 *    ↑ This is when Stripe redirects back via refresh_url after a failed/expired
 *      Connect onboarding session (sub-account linking under our Stripe org)
 *
 * URL examples:
 *   /account-status?reason=unverified
 *   /account-status?reason=payment-failed
 *   /account-status?reason=stripe-connect-failed
 *   /account-status?reason=unverified,stripe-connect-failed
 */

type StatusReason = "unverified" | "payment-failed" | "stripe-connect-failed";

export default function AccountStatus() {
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const [reasons, setReasons] = useState<StatusReason[]>([]);
  const [emailFromUrl, setEmailFromUrl] = useState<string>("");
  const [resendSent, setResendSent] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentLinked, setPaymentLinked] = useState(false);
  const [stripeConnectRetrying, setStripeConnectRetrying] = useState(false);
  const [stripeConnectDone, setStripeConnectDone] = useState(false);

  // Parse ?reason= and ?email= from the URL (supports multiple values)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    // Capture optional email param
    setEmailFromUrl(params.get("email") || "");
    const raw = params.getAll("reason") as StatusReason[];
    // Also support comma-separated: ?reason=unverified,payment-failed
    const parsed: StatusReason[] = [];
    raw.forEach((r) => {
      r.split(",").forEach((v) => {
        const trimmed = v.trim() as StatusReason;
        if (trimmed && !parsed.includes(trimmed)) parsed.push(trimmed);
      });
    });
    // Default to both if nothing supplied (safety net)
    setReasons(parsed.length > 0 ? parsed : ["unverified", "payment-failed"]);
  }, []);

  const hasUnverified = reasons.includes("unverified");
  const hasPaymentFailed = reasons.includes("payment-failed");
  const hasStripeConnectFailed = reasons.includes("stripe-connect-failed");

  // ── Retry Stripe Connect linking ───────────────────────────────────────────
  const retryStripeConnectMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("GET", "/payment/account/link", {});
      return response.json();
    },
    onSuccess: (response) => {
      const url =
        response.data?.redirectURL ||
        response.data?.url ||
        response.redirectURL ||
        response.url;
      if (url) {
        setStripeConnectRetrying(true);
        toast({
          title: "Opening Stripe Account Setup",
          description: "Complete the setup in the new tab, then return here.",
        });
        window.open(url, "_blank", "noopener,noreferrer");
        // After opening, show a "I've completed setup" confirmation button
      } else {
        throw new Error("No account link URL received. Please try again.");
      }
    },
    onError: (error: any) => {
      toast({
        title: "Failed to start account linking",
        description: error?.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  // ── Resend verification email ──────────────────────────────────────────────
  const resendMutation = useMutation({
    mutationFn: async () => {
      const email =
        emailFromUrl ||
        (user as any)?.email ||
        (user as any)?.emailAddress ||
        localStorage.getItem("pending_email") ||
        "";
      if (!email) throw new Error("No email address found for this account.");
      const response = await apiRequest("POST", "/auth/resend-verification", {
        email,
      });
      return response.json();
    },
    onSuccess: () => {
      setResendSent(true);
      toast({
        title: "Verification email sent",
        description: "Check your inbox and spam folder.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to resend",
        description:
          error?.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  // ── Payment linked successfully ────────────────────────────────────────────
  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    setPaymentLinked(true);
    toast({
      title: "Payment method linked!",
      description: "Your account is now fully set up.",
    });
  };

  // ── Both issues resolved → go to dashboard ────────────────────────────────
  const allResolved =
    (!hasUnverified || resendSent) &&
    (!hasPaymentFailed || paymentLinked) &&
    (!hasStripeConnectFailed || stripeConnectDone);

  const handleContinue = () => setLocation("/dashboard");
  const handleLogout = () => {
    logout();
    setLocation("/auth");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="mb-8 flex items-center gap-3">
        <HorebSaveLogo className="h-10 w-10" />
        <span className="text-2xl font-bold text-foreground">Horeb Save</span>
      </div>

      <div className="w-full max-w-lg space-y-4">
        {/* Page header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Action Required
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Complete the steps below to fully activate your account.
          </p>
        </div>

        {/* ── Unverified email card ─────────────────────────────────────── */}
        {hasUnverified && (
          <Card
            className={`border-2 ${
              resendSent ? "border-secondary/40 bg-secondary/5" : "border-accent/40 bg-accent/5"
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    resendSent
                      ? "bg-secondary/20 text-secondary"
                      : "bg-accent/20 text-accent-foreground"
                  }`}
                >
                  {resendSent ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <MailCheck className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <CardTitle className="text-base sm:text-lg">
                    {resendSent ? "Check your inbox" : "Verify your email"}
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm mt-0.5">
                    {resendSent
                      ? "We've sent a new verification link. Check spam if you don't see it."
                      : "Your email address hasn't been verified yet. You won't be able to receive group notifications or payouts until it's confirmed."}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              {!resendSent ? (
                <>
                  <Alert className="border-amber-200 bg-amber-50 text-amber-900 text-xs">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <AlertDescription>
                      Check your inbox for the original verification email first — it may be in your spam folder.
                    </AlertDescription>
                  </Alert>
                  <Button
                    onClick={() => resendMutation.mutate()}
                    disabled={resendMutation.isPending}
                    className="w-full"
                    variant="outline"
                  >
                    {resendMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    {resendMutation.isPending ? "Sending..." : "Resend Verification Email"}
                  </Button>
                </>
              ) : (
                <Alert className="border-secondary/30 bg-secondary/10 text-secondary-foreground text-xs">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <AlertDescription>
                    Email sent! Once verified, refresh the app or log back in.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* ── Payment / card link failed card ──────────────────────────── */}
        {hasPaymentFailed && (
          <Card
            className={`border-2 ${
              paymentLinked ? "border-secondary/40 bg-secondary/5" : "border-destructive/30 bg-destructive/5"
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    paymentLinked
                      ? "bg-secondary/20 text-secondary"
                      : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {paymentLinked ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <CreditCard className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <CardTitle className="text-base sm:text-lg">
                    {paymentLinked ? "Payment method linked" : "Payment link failed"}
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm mt-0.5">
                    {paymentLinked
                      ? "Your card has been linked successfully. You're ready to contribute."
                      : "We couldn't link a payment method to your account. Without this you won't be able to join or contribute to savings groups."}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              {!paymentLinked ? (
                <>
                  <Alert className="border-destructive/20 bg-destructive/5 text-destructive text-xs">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <AlertDescription>
                      This may have happened due to an invalid card number, expired card, or a temporary bank block. Try a different card if needed.
                    </AlertDescription>
                  </Alert>
                  <Button
                    onClick={() => setShowPaymentModal(true)}
                    className="w-full"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Link Payment Method
                  </Button>
                </>
              ) : (
                <Alert className="border-secondary/30 bg-secondary/10 text-secondary-foreground text-xs">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <AlertDescription>
                    Payment method saved. You can manage your cards in Profile &rarr; Payment Methods.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* ── Stripe Connect sub-account linking failed card ────────── */}
        {hasStripeConnectFailed && (
          <Card
            className={`border-2 ${
              stripeConnectDone
                ? "border-secondary/40 bg-secondary/5"
                : "border-destructive/30 bg-destructive/5"
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    stripeConnectDone
                      ? "bg-secondary/20 text-secondary"
                      : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {stripeConnectDone ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <Building2 className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <CardTitle className="text-base sm:text-lg">
                    {stripeConnectDone
                      ? "Bank account linked"
                      : "Bank account linking incomplete"}
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm mt-0.5">
                    {stripeConnectDone
                      ? "Your bank account has been linked to your Horeb Save account via Stripe."
                      : "Your Stripe account setup didn't complete — either it expired, was cancelled, or an error occurred. You need to link your bank account to contribute to groups and receive payouts."}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              {!stripeConnectDone ? (
                <>
                  <Alert className="border-amber-200 bg-amber-50 text-amber-900 text-xs">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <AlertDescription>
                      This link expires after a short period. If you previously started the setup, you'll need to begin again — your progress was not lost, just the session expired.
                    </AlertDescription>
                  </Alert>

                  {!stripeConnectRetrying ? (
                    <Button
                      onClick={() => retryStripeConnectMutation.mutate()}
                      disabled={retryStripeConnectMutation.isPending}
                      className="w-full"
                    >
                      {retryStripeConnectMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <ExternalLink className="w-4 h-4 mr-2" />
                      )}
                      {retryStripeConnectMutation.isPending
                        ? "Opening Stripe..."
                        : "Retry Bank Account Linking"}
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <Alert className="border-blue-200 bg-blue-50 text-blue-900 text-xs">
                        <ExternalLink className="h-3.5 w-3.5" />
                        <AlertDescription>
                          Stripe setup opened in a new tab. Complete the steps there, then click the button below.
                        </AlertDescription>
                      </Alert>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setStripeConnectDone(true)}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        I've completed the setup
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full text-xs text-muted-foreground"
                        onClick={() => {
                          setStripeConnectRetrying(false);
                          retryStripeConnectMutation.reset();
                        }}
                      >
                        Start again
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <Alert className="border-secondary/30 bg-secondary/10 text-secondary-foreground text-xs">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <AlertDescription>
                    Bank account linked. It may take a few minutes for Stripe to verify your details.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* ── Actions row ──────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {allResolved ? (
            <Button className="flex-1" onClick={handleContinue}>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Continue to Dashboard
            </Button>
          ) : (
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleContinue}
            >
              Skip for now
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
          <Button
            variant="ghost"
            className="flex-1 text-muted-foreground"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Log out
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground pb-4">
          Need help?{" "}
          <a
            href="mailto:support@horebsave.com"
            className="underline hover:text-foreground transition-colors"
          >
            Contact support
          </a>
        </p>
      </div>

      {/* Payment modal */}
      <BankDetailsModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handlePaymentSuccess}
        requirementContext="join_group"
      />
    </div>
  );
}
