import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Global Loading Indicator
 * 
 * Shows a loading overlay when the app is initializing or processing
 */
export function GlobalLoadingIndicator() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Hide loading indicator after initial mount
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (!isLoading) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
        <p className="text-sm text-muted-foreground">Loading Horeb Save...</p>
      </div>
    </div>
  );
}

/**
 * Loading Spinner Component
 * 
 * Reusable loading spinner for individual components
 */
export function LoadingSpinner({ 
  size = 'default',
  text
}: { 
  size?: 'small' | 'default' | 'large';
  text?: string;
}) {
  const sizeClasses = {
    small: 'w-4 h-4',
    default: 'w-8 h-8',
    large: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center py-8 space-y-3">
      <Loader2 className={`animate-spin text-primary ${sizeClasses[size]}`} />
      {text && (
        <p className="text-sm text-muted-foreground">{text}</p>
      )}
    </div>
  );
}

/**
 * Page Loading Skeleton
 * 
 * Full page loading state
 */
export function PageLoading({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
