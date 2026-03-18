import { useEffect, useState } from 'react';
import { Shield } from 'lucide-react';

/**
 * Visual indicator that shows when token is being refreshed
 * Only visible during refresh operations (brief animation)
 */
export function TokenRefreshIndicator() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Listen for custom token refresh events
    const handleRefreshStart = () => {
      setIsVisible(true);
    };

    const handleRefreshEnd = () => {
      // Keep visible for a moment then fade
      setTimeout(() => setIsVisible(false), 2000);
    };

    window.addEventListener('token-refresh-start', handleRefreshStart);
    window.addEventListener('token-refresh-end', handleRefreshEnd);

    return () => {
      window.removeEventListener('token-refresh-start', handleRefreshStart);
      window.removeEventListener('token-refresh-end', handleRefreshEnd);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="bg-primary/10 backdrop-blur-sm border border-primary/20 rounded-lg px-4 py-2 flex items-center gap-2 shadow-lg">
        <Shield className="w-4 h-4 text-primary animate-pulse" />
        <span className="text-sm text-primary font-medium">
          Session refreshed
        </span>
      </div>
    </div>
  );
}
