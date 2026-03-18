import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, CheckCircle2, Mail, User, ArrowRight, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WaitlistModal({ isOpen, onClose }: WaitlistModalProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    savingMethod: "",
    incomePattern: "",
    priority: "",
    goal: "",
    earlyAccess: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/waitlist/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to join waitlist");
      }

      setSubmitSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      savingMethod: "",
      incomePattern: "",
      priority: "",
      goal: "",
      earlyAccess: "",
    });
    setSubmitSuccess(false);
    setError(null);
    onClose();
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.firstName || !formData.lastName || !formData.email) {
        setError("Please fill in all required fields");
        return;
      }
      setError(null);
      setStep(2);
    }
  };

  const handleBack = () => {
    setError(null);
    setStep(1);
  };



  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        {submitSuccess ? (
          <div className="py-8 text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="w-16 h-16 text-green-500" />
            </div>
            <DialogHeader className="mb-4">
              <DialogTitle className="text-2xl">
                You're on the list! 🎉
              </DialogTitle>
              <DialogDescription className="text-base mt-2">
                Thank you for joining the HorebSave Early Community! We'll notify you as soon as
                we launch and give you exclusive early access.
              </DialogDescription>
            </DialogHeader>
            <p className="text-sm text-muted-foreground mt-4">
              🕊️ Be part of the movement to make saving social, safe, and rewarding.
            </p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">
                Join the Waitlist {step === 2 && "- Quick Survey"}
              </DialogTitle>
              <DialogDescription className="text-base">
                {step === 1 
                  ? "Join the HorebSave Early Community and get exclusive rewards!"
                  : "Help us build the perfect ROSCA platform for you"
                }
              </DialogDescription>
              <div className="flex gap-2 mt-4">
                <div className={`h-1 flex-1 rounded ${step >= 1 ? 'bg-primary' : 'bg-gray-200'}`} />
                <div className={`h-1 flex-1 rounded ${step >= 2 ? 'bg-primary' : 'bg-gray-200'}`} />
              </div>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6 mt-4">
              {step === 1 && (
                <>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        First Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="firstName"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={(e) =>
                          setFormData({ ...formData, firstName: e.target.value })
                        }
                        required
                        className="text-base"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Last Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="lastName"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={(e) =>
                          setFormData({ ...formData, lastName: e.target.value })
                        }
                        required
                        className="text-base"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email Address <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john.doe@example.com"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        required
                        className="text-base"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">
                        Phone Number (Optional)
                      </Label>
                      <Input
                        id="phoneNumber"
                        type="tel"
                        placeholder="+44 7700 900000"
                        value={formData.phoneNumber}
                        onChange={(e) =>
                          setFormData({ ...formData, phoneNumber: e.target.value })
                        }
                        className="text-base"
                      />
                    </div>
                  </div>
                </>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  {/* Question 1: How do you currently save */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">
                      1️⃣ How do you currently save or contribute with others?
                    </Label>
                    <RadioGroup
                      value={formData.savingMethod}
                      onValueChange={(value) =>
                        setFormData({ ...formData, savingMethod: value })
                      }
                    >
                      <div className="flex items-start space-x-2">
                        <RadioGroupItem value="Offline ROSCA" id="method-offline" className="mt-1" />
                        <Label htmlFor="method-offline" className="font-normal cursor-pointer leading-relaxed">
                          I'm part of a local ajo/esusu group (offline)
                        </Label>
                      </div>
                      <div className="flex items-start space-x-2">
                        <RadioGroupItem value="Manual Apps" id="method-manual" className="mt-1" />
                        <Label htmlFor="method-manual" className="font-normal cursor-pointer leading-relaxed">
                          I save alone or with friends using messaging apps
                        </Label>
                      </div>
                      <div className="flex items-start space-x-2">
                        <RadioGroupItem value="Digital App" id="method-digital" className="mt-1" />
                        <Label htmlFor="method-digital" className="font-normal cursor-pointer leading-relaxed">
                          I use a savings app or digital bank
                        </Label>
                      </div>
                      <div className="flex items-start space-x-2">
                        <RadioGroupItem value="New User" id="method-new" className="mt-1" />
                        <Label htmlFor="method-new" className="font-normal cursor-pointer leading-relaxed">
                          I haven't joined any group savings yet but I'd love to try
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Question 2: Income Pattern */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">
                      2️⃣ What best describes your cash-flow or income pattern?
                    </Label>
                    <RadioGroup
                      value={formData.incomePattern}
                      onValueChange={(value) =>
                        setFormData({ ...formData, incomePattern: value })
                      }
                    >
                      <div className="flex items-start space-x-2">
                        <RadioGroupItem value="Daily/Weekly" id="income-daily" className="mt-1" />
                        <Label htmlFor="income-daily" className="font-normal cursor-pointer leading-relaxed">
                          I receive income daily or weekly (trader, gig, or wage earner)
                        </Label>
                      </div>
                      <div className="flex items-start space-x-2">
                        <RadioGroupItem value="Monthly" id="income-monthly" className="mt-1" />
                        <Label htmlFor="income-monthly" className="font-normal cursor-pointer leading-relaxed">
                          I'm paid monthly (salary or contract)
                        </Label>
                      </div>
                      <div className="flex items-start space-x-2">
                        <RadioGroupItem value="Irregular" id="income-irregular" className="mt-1" />
                        <Label htmlFor="income-irregular" className="font-normal cursor-pointer leading-relaxed">
                          My income is irregular (depends on business or projects)
                        </Label>
                      </div>
                      <div className="flex items-start space-x-2">
                        <RadioGroupItem value="Prefer Not to Say" id="income-prefer" className="mt-1" />
                        <Label htmlFor="income-prefer" className="font-normal cursor-pointer leading-relaxed">
                          Prefer not to say
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Question 3: Priority */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">
                      3️⃣ What matters most to you in a group savings platform?
                    </Label>
                    <RadioGroup
                      value={formData.priority}
                      onValueChange={(value) =>
                        setFormData({ ...formData, priority: value })
                      }
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Transparency" id="priority-transparency" />
                        <Label htmlFor="priority-transparency" className="font-normal cursor-pointer">
                          Transparency and trust
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Automation" id="priority-automation" />
                        <Label htmlFor="priority-automation" className="font-normal cursor-pointer">
                          Automatic reminders and payouts
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Security" id="priority-security" />
                        <Label htmlFor="priority-security" className="font-normal cursor-pointer">
                          Security and data protection
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Ease of Use" id="priority-ease" />
                        <Label htmlFor="priority-ease" className="font-normal cursor-pointer">
                          Ease of use / simple interface
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Question 4: Goal */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">
                      4️⃣ What's your biggest goal for joining a ROSCA platform like HorebSave?
                    </Label>
                    <RadioGroup
                      value={formData.goal}
                      onValueChange={(value) =>
                        setFormData({ ...formData, goal: value })
                      }
                    >
                      <div className="flex items-start space-x-2">
                        <RadioGroupItem value="Discipline" id="goal-discipline" className="mt-1" />
                        <Label htmlFor="goal-discipline" className="font-normal cursor-pointer leading-relaxed">
                          Grow discipline in saving regularly
                        </Label>
                      </div>
                      <div className="flex items-start space-x-2">
                        <RadioGroupItem value="Access Lump Sum" id="goal-lumpsum" className="mt-1" />
                        <Label htmlFor="goal-lumpsum" className="font-normal cursor-pointer leading-relaxed">
                          Access lump sums when needed
                        </Label>
                      </div>
                      <div className="flex items-start space-x-2">
                        <RadioGroupItem value="Trust/Accountability" id="goal-trust" className="mt-1" />
                        <Label htmlFor="goal-trust" className="font-normal cursor-pointer leading-relaxed">
                          Build trust and accountability within a group
                        </Label>
                      </div>
                      <div className="flex items-start space-x-2">
                        <RadioGroupItem value="Investment" id="goal-investment" className="mt-1" />
                        <Label htmlFor="goal-investment" className="font-normal cursor-pointer leading-relaxed">
                          Invest or build joint assets (e.g. land, business, etc.)
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Question 5: Early Access */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">
                      5️⃣ Would you like early access to HorebSave and exclusive rewards for our first users?
                    </Label>
                    <RadioGroup
                      value={formData.earlyAccess}
                      onValueChange={(value) =>
                        setFormData({ ...formData, earlyAccess: value })
                      }
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Yes" id="early-yes" />
                        <Label htmlFor="early-yes" className="font-normal cursor-pointer">
                          Yes, sign me up!
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Maybe" id="early-maybe" />
                        <Label htmlFor="early-maybe" className="font-normal cursor-pointer">
                          Maybe later, keep me updated
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <DialogFooter className="mt-6 gap-2">
                {step === 1 ? (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClose}
                    >
                      Cancel
                    </Button>
                    <Button type="button" onClick={handleNext}>
                      Next <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBack}
                      disabled={isSubmitting}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90">
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Joining...
                        </>
                      ) : (
                        "Join the HorebSave Early Community"
                      )}
                    </Button>
                  </>
                )}
              </DialogFooter>
            </form>

            <div className="mt-4 text-center text-xs text-muted-foreground">
              🕊️ We respect your privacy. Your information will only be used to improve HorebSave and notify you about our launch.
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
