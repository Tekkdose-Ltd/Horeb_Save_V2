import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { HorebSaveLogo } from "@/components/HorebSaveLogo";

export default function VerifyEmail() {
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<"idle" | "success" | "error">("idle");

  // Check for token in URL query params (from magic link)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    
    if (token) {
      setIsVerifying(true);
      verifyWithToken(token);
    }
  }, []);

  const verifyWithToken = async (token: string) => {
    try {
      const response = await apiRequest("GET", `/auth/verify-email?token=${token}`);
      await response.json();
      
      setVerificationStatus("success");
      toast({
        title: "Email verified!",
        description: "Your account has been activated. Redirecting to login...",
      });
      
      setTimeout(() => {
        setLocation("/auth/login");
      }, 2000);
    } catch (error: any) {
      setVerificationStatus("error");
      toast({
        title: "Verification failed",
        description: error?.message || "Invalid or expired verification link.",
        variant: "destructive",
      });
      setIsVerifying(false);
    }
  };

  const resendMutation = useMutation({
    mutationFn: async (emailAddress: string) => {
      const response = await apiRequest("POST", "/auth/resend-verification", { email: emailAddress });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Verification link sent!",
        description: "Please check your email for the new verification link.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to resend link",
        description: error?.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleResend = () => {
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address first.",
        variant: "destructive",
      });
      return;
    }
    resendMutation.mutate(email);
  };

  // Show loading state while verifying token
  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <h2 className="text-xl font-semibold">Verifying your email...</h2>
              <p className="text-sm text-muted-foreground text-center">
                Please wait while we verify your account.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show success state
  if (verificationStatus === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
              <h2 className="text-xl font-semibold">Email verified successfully!</h2>
              <p className="text-sm text-muted-foreground text-center">
                Your account is now active. Redirecting to login...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <HorebSaveLogo className="h-12" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Check Your Email</CardTitle>
            <CardDescription>
              We've sent a verification link to your email address
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <Mail className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              Click the verification link in your email to activate your account. The link will expire in 24 hours.
            </AlertDescription>
          </Alert>

          {verificationStatus === "error" && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                The verification link is invalid or has expired. Please request a new one below.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={resendMutation.isPending}
              />
            </div>

            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-3">
                Didn't receive the email?
              </p>
              <Button
                variant="outline"
                onClick={handleResend}
                disabled={resendMutation.isPending || !email}
                className="w-full"
              >
                {resendMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Resend Verification Link
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already verified?{" "}
              <a href="/auth/login" className="text-primary hover:underline font-medium">
                Sign in here
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
