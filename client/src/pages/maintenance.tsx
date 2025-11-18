import { Button } from "@/components/ui/button";
import { HorebSaveLogo } from "@/components/HorebSaveLogo";
import { WaitlistModal } from "@/components/WaitlistModal";
import { useState } from "react";
import { Construction, Mail } from "lucide-react";

export default function Maintenance() {
  const [waitlistOpen, setWaitlistOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <HorebSaveLogo className="w-12 h-12" />
            <h1 className="text-2xl font-bold text-foreground">Horeb Save</h1>
          </div>
          
          <div className="mb-6">
            <Construction className="w-24 h-24 mx-auto text-primary animate-pulse" />
          </div>
          
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            We're Building Something Amazing!
          </h2>
          
          <p className="text-xl text-gray-600 mb-8 max-w-lg mx-auto">
            Horeb Save is currently under construction. We're working hard to bring you 
            the best peer-to-peer savings platform.
          </p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <Mail className="w-8 h-8 text-primary" />
            </div>
          </div>
          
          <h3 className="text-2xl font-semibold text-center mb-2">
            Join Our Waitlist
          </h3>
          
          <p className="text-gray-600 text-center mb-6">
            Be the first to know when we launch and get exclusive early access!
          </p>
          
          <div className="flex justify-center">
            <Button
              size="lg"
              onClick={() => setWaitlistOpen(true)}
              className="bg-primary text-white hover:bg-primary/90 px-8 py-3 text-lg"
            >
              Join Waitlist Now
            </Button>
          </div>
        </div>

        <div className="text-center space-y-2">
          <p className="text-sm text-gray-500">
            Have questions? We'd love to hear from you!
          </p>
          <p className="text-sm text-gray-600">
            Contact us at{" "}
            <a 
              href="mailto:support@horebsave.com" 
              className="text-primary hover:underline font-medium"
            >
              support@horebsave.com
            </a>
          </p>
        </div>
      </div>

      <WaitlistModal 
        isOpen={waitlistOpen} 
        onClose={() => setWaitlistOpen(false)} 
      />
    </div>
  );
}
