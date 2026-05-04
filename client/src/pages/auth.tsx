import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, AlertCircle, Eye, EyeOff, Users } from "lucide-react";
import { HorebSaveLogo } from "@/components/HorebSaveLogo";
import { useLocation, Link } from "wouter";
import { useState, useEffect } from "react";

// Login schema
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Register schema
const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginData = z.infer<typeof loginSchema>;
type RegisterData = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [hasPendingInvite, setHasPendingInvite] = useState(false);

  // Check for pending invite on component mount
  useEffect(() => {
    const pendingInvite = localStorage.getItem('pendingInvite');
    setHasPendingInvite(!!pendingInvite);
  }, []);

  // Login form
  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Register form
  const registerForm = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      const response = await apiRequest("POST", "/auth/login", data);
      return response.json();
    },
    onSuccess: (data) => {
      
      // Store token if provided (for JWT authentication)
      // Check multiple possible token locations including inside data object
      let token = data.token || data.accessToken || data.access_token;
      
      // If not found at top level, check inside data.data
      if (!token && data.data) {
        token = data.data.token || data.data.accessToken || data.data.access_token;
      }
      
      if (token) {
        localStorage.setItem('auth_token', token);
      }
      
      // Store user data from login response - this is the source of truth
      const userData = data.user || data.data || data.userData;
      
      if (userData) {
        // Check if profileCompleted field exists, if not default to true for existing users
        const userWithProfile = {
          ...userData,
          profileCompleted: userData.profileCompleted !== undefined ? userData.profileCompleted : true
        };
        
        queryClient.setQueryData(["/auth/user"], userWithProfile);
        
        // Also store in localStorage as backup
        localStorage.setItem('user_data', JSON.stringify(userWithProfile));
        
        // Check if user came from an invite link
        const pendingInvite = localStorage.getItem('pendingInvite');
        
        // Redirect based on profile completion and pending invites
        if (pendingInvite) {
          // Clear the stored invite code
          localStorage.removeItem('pendingInvite');
          // Redirect to group join page with invite code
          setLocation(`/groups/join?code=${pendingInvite}`);
        } else if (userWithProfile.profileCompleted) {
          setLocation("/dashboard");
        } else {
          setLocation("/onboarding");
        }
      } else {
        // Default to dashboard if no user data
        setLocation("/dashboard");
      }
    },
    onError: (error: any) => {
      // Error handled by UI
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (data: Omit<RegisterData, "confirmPassword">) => {
      const response = await apiRequest("POST", "/auth/register", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/auth/user"] });
      setLocation("/dashboard");
    },
  });

  // Login submit handler
  const onLoginSubmit = loginForm.handleSubmit((data) => {
    loginMutation.mutate(data);
  });

  // Register submit handler
  const onRegisterSubmit = registerForm.handleSubmit((data) => {
    const { confirmPassword, ...registerData } = data;
    registerMutation.mutate(registerData);
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <HorebSaveLogo className="h-12" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Welcome to Horeb Save</CardTitle>
            <CardDescription>
              Join your community in saving and growing together
            </CardDescription>
          </div>
          
          {/* Show invite notification if user has a pending invite */}
          {hasPendingInvite && (
            <Alert className="text-left">
              <Users className="h-4 w-4" />
              <AlertDescription>
                You've been invited to join a group! Log in or create an account to continue.
              </AlertDescription>
            </Alert>
          )}
        </CardHeader>
        <CardContent>
          <Tabs value="login">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <Link href="/auth/register" className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm hover:bg-muted">
                Register
              </Link>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login" className="space-y-4">
              <form onSubmit={onLoginSubmit} className="space-y-4">
                {loginMutation.isError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {(loginMutation.error as any)?.message || "Login failed. Please try again."}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="your@email.com"
                    {...loginForm.register("email")}
                    disabled={loginMutation.isPending}
                  />
                  {loginForm.formState.errors.email && (
                    <p className="text-sm text-destructive">
                      {loginForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      {...loginForm.register("password")}
                      disabled={loginMutation.isPending}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {loginForm.formState.errors.password && (
                    <p className="text-sm text-destructive">
                      {loginForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>
              By signing up, you agree to our{" "}
              <a href="/terms" className="text-primary hover:underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
