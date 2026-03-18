import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { updateProfileSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, User, MapPin, Calendar, Mail, CheckCircle2, Inbox, Eye, EyeOff, Upload, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { HorebSaveLogo } from "@/components/HorebSaveLogo";

// Full registration schema (email, password + profile details)
const registrationSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
  suretyEmail: z.string().email("Invalid guarantor email address"),
}).merge(updateProfileSchema).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegistrationData = z.infer<typeof registrationSchema>;

export default function Onboarding() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);

  // Get invite code from URL parameters (if user came from an invite link)
  const urlParams = new URLSearchParams(window.location.search);
  const inviteCode = urlParams.get('invite');
  
  // Store invite code in localStorage if present (for auto-join after registration)
  if (inviteCode && !localStorage.getItem('pendingInvite')) {
    localStorage.setItem('pendingInvite', inviteCode);
  }

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file (JPG, PNG, GIF, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setProfileImageFile(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeProfileImage = () => {
    setProfileImageFile(null);
    setProfileImagePreview(null);
  };

  const form = useForm<RegistrationData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      suretyEmail: "",
      firstName: "",
      lastName: "",
      phoneNumber: "",
      dateOfBirth: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      postcode: "",
      country: "United Kingdom",
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegistrationData) => {
      // Convert date to ISO string format
      const date = new Date(data.dateOfBirth);
      const isoDateString = date.toISOString();
      
      // Upload profile image first if provided
      let profileImageUrl = "";
      if (profileImageFile) {
        try {
          const formData = new FormData();
          formData.append('profileImage', profileImageFile);
          
          const uploadResponse = await fetch('/api/upload/profile-image', {
            method: 'POST',
            body: formData,
          });
          
          if (uploadResponse.ok) {
            const uploadResult = await uploadResponse.json();
            profileImageUrl = uploadResult.imageUrl || "";
          }
        } catch (uploadError) {
          console.warn('Image upload failed, continuing with registration:', uploadError);
          // Continue with registration even if image upload fails
        }
      }
      
      // Backend expects snake_case
      const backendData = {
        email: data.email,
        surety_email: data.suretyEmail,
        password: data.password,
        first_name: data.firstName,
        last_name: data.lastName,
        phone_number: data.phoneNumber,
        date_of_birth: isoDateString,
        address_line_1: data.addressLine1,
        address_line_2: data.addressLine2 || "",
        city: data.city,
        postalCode: data.postcode,
        country: data.country,
        profile_image_url: profileImageUrl,
      };
      
      console.log('Sending to backend:', backendData);
      
      try {
        const response = await apiRequest("POST", "/auth/register", backendData);
        const result = await response.json();
        return result;
      } catch (error: any) {
        console.error('Backend error response:', error);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/auth/user"] });
      setIsSubmitting(false);
      setRegisteredEmail(variables.email);
      setRegistrationSuccess(true);
      
      // Check if user came from an invite link
      const pendingInvite = localStorage.getItem('pendingInvite');
      if (pendingInvite) {
        // Clear the stored invite code
        localStorage.removeItem('pendingInvite');
        
        // Show success message and redirect to group join
        toast({
          title: "Account Created!",
          description: "Redirecting you to join the group...",
        });
        
        // Delay redirect slightly to allow success message to show
        setTimeout(() => {
          setLocation(`/groups/join?code=${pendingInvite}`);
        }, 1500);
      }
      
      // Clear the form
      form.reset();
    },
    onError: (error: any) => {
      console.error("Registration error:", error);
      
      // Check for specific error messages
      let errorMessage = "Failed to create account. Please try again.";
      
      if (error?.message) {
        const msg = error.message.toLowerCase();
        
        if (msg.includes("email") && (msg.includes("exist") || msg.includes("already") || msg.includes("taken"))) {
          errorMessage = "This email address is already registered. Please use a different email or try logging in.";
        } else if (msg.includes("password")) {
          errorMessage = "Password does not meet requirements. Please ensure it has 8+ characters with uppercase, lowercase, and number.";
        } else if (msg.includes("validation") || msg.includes("invalid")) {
          errorMessage = "Please check all fields and ensure they are filled correctly.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  const onSubmit = async (data: RegistrationData) => {
    setIsSubmitting(true);
    registerMutation.mutate(data);
  };

  // Show success page after registration
  if (registrationSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <HorebSaveLogo className="h-12" />
            </div>
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Check Your Email!</CardTitle>
            <CardDescription className="text-base">
              We've sent a verification link to
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <p className="font-semibold text-blue-900">{registeredEmail}</p>
            </div>

            <Alert className="border-blue-200 bg-blue-50">
              <Inbox className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <div className="space-y-2">
                  <p className="font-semibold">What's next?</p>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Check your email inbox (and spam folder)</li>
                    <li>Click the verification link in the email</li>
                    <li>You'll be redirected to login automatically</li>
                  </ol>
                </div>
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <p className="text-sm text-muted-foreground text-center">
                The verification link will expire in 24 hours.
              </p>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setRegistrationSuccess(false);
                    setRegisteredEmail("");
                  }}
                >
                  Register Another Account
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => setLocation("/auth/login")}
                >
                  Go to Login
                </Button>
              </div>
            </div>

            <div className="text-center pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-2">
                Didn't receive the email?
              </p>
              <Button
                variant="link"
                className="text-primary"
                onClick={() => setLocation("/verify-email")}
              >
                Resend verification link
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2" data-testid="text-onboarding-title">
            Create Your Account
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Join the Horeb Save community. Fill in your details to get started with secure peer-to-peer savings.
          </p>
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Button
                variant="link"
                className="p-0 h-auto font-semibold"
                onClick={() => setLocation("/login")}
              >
                Login here
              </Button>
            </p>
          </div>
        </div>

        {/* Form Card */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Registration Information</CardTitle>
            <CardDescription>
              All information is securely stored and used to build trust within the Horeb Save community.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Account Credentials Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
                    <Mail className="w-4 h-4" />
                    <span>Account Credentials</span>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address *</FormLabel>
                        <FormControl>
                          <Input 
                            type="email"
                            placeholder="your@email.com" 
                            {...field} 
                            data-testid="input-email"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="suretyEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Guarantor Email *</FormLabel>
                        <FormControl>
                          <Input 
                            type="email"
                            placeholder="guarantor@email.com" 
                            {...field} 
                            data-testid="input-surety-email"
                          />
                        </FormControl>
                        <p className="text-xs text-muted-foreground">
                          Enter the email of someone who can vouch for you. The person will have to confirm before you can be properly onboarded
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password *</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••" 
                                {...field} 
                                data-testid="input-password"
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
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password *</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="••••••••" 
                                {...field} 
                                data-testid="input-confirm-password"
                                className="pr-10"
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                tabIndex={-1}
                              >
                                {showConfirmPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Password must be 8+ characters with uppercase, lowercase, and number
                  </p>
                </div>

                {/* Personal Details Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
                    <User className="w-4 h-4" />
                    <span>Personal Details</span>
                  </div>

                  {/* Profile Picture Upload */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">
                      Profile Picture (Optional)
                    </label>
                    <div className="flex items-center space-x-4">
                      {profileImagePreview ? (
                        <div className="relative">
                          <img
                            src={profileImagePreview}
                            alt="Profile preview"
                            className="w-24 h-24 rounded-full object-cover border-4 border-border"
                          />
                          <button
                            type="button"
                            onClick={removeProfileImage}
                            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center border-2 border-dashed border-border">
                          <User className="w-10 h-10 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageSelect}
                          className="hidden"
                          id="profile-image-input"
                        />
                        <label htmlFor="profile-image-input">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => document.getElementById('profile-image-input')?.click()}
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            {profileImagePreview ? 'Change Photo' : 'Upload Photo'}
                          </Button>
                        </label>
                        <p className="text-xs text-muted-foreground mt-2">
                          JPG, PNG or GIF (max 5MB)
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="John" 
                              {...field} 
                              data-testid="input-first-name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Doe" 
                              {...field} 
                              data-testid="input-last-name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="+44 7XXX XXXXXX" 
                              {...field} 
                              data-testid="input-phone"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="dateOfBirth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of Birth *</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                              <Input 
                                type="date" 
                                className="pl-10"
                                {...field} 
                                data-testid="input-dob"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Address Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
                    <MapPin className="w-4 h-4" />
                    <span>Address</span>
                  </div>

                  <FormField
                    control={form.control}
                    name="addressLine1"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address Line 1 *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="123 High Street" 
                            {...field} 
                            data-testid="input-address-1"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="addressLine2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address Line 2 (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Apartment, suite, etc." 
                            {...field} 
                            data-testid="input-address-2"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="London" 
                              {...field} 
                              data-testid="input-city"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="postcode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Postcode *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="SW1A 1AA" 
                              {...field} 
                              data-testid="input-postcode"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger data-testid="select-country">
                                <SelectValue placeholder="Select country" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                              <SelectItem value="Ireland">Ireland</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Trust & Privacy Notice */}
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-primary mt-0.5" />
                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium text-foreground mb-1">Your privacy matters</p>
                      <p>
                        We collect this information to verify your identity and build trust in our community. 
                        Your data is encrypted and never shared without your consent.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isSubmitting}
                  data-testid="button-create-account"
                >
                  {isSubmitting ? "Creating Account..." : "Create Account"}
                </Button>

                {/* Login Link */}
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <a href="/auth/login" className="text-primary hover:underline font-medium">
                      Sign in here
                    </a>
                  </p>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Footer Note */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          By creating an account, you agree to our{" "}
          <a href="/terms" className="text-primary hover:underline">Terms of Service</a>
          {" "}and{" "}
          <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}