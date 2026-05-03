import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

/**
 * Inactivity Warning Component
 * 
 * Listens for the 'inactivity-warning' event dispatched by useTokenRefresh
 * and shows a toast notification warning the user they'll be logged out soon.
 */
export function InactivityWarning() {
  const { toast } = useToast();

  useEffect(() => {
    const handleInactivityWarning = (event: Event) => {
      const customEvent = event as CustomEvent<{ minutesRemaining: number }>;
      const minutes = customEvent.detail?.minutesRemaining || 5;

      toast({
        title: "⚠️ Inactivity Warning",
        description: `You'll be logged out in ${minutes} minutes due to inactivity. Move your mouse or press a key to stay logged in.`,
        variant: "destructive",
        duration: 10000, // Show for 10 seconds
      });
    };

    window.addEventListener("inactivity-warning", handleInactivityWarning);

    return () => {
      window.removeEventListener("inactivity-warning", handleInactivityWarning);
    };
  }, [toast]);

  return null;
}
