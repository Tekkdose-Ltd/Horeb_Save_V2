import { useEffect, useRef } from 'react';
import { refreshToken } from '@/lib/queryClient';

// Token refresh configuration
const TOKEN_REFRESH_INTERVAL = 15 * 60 * 1000; // Refresh every 15 minutes
const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

/**
 * Hook to automatically refresh authentication token while user is active
 * Refreshes token every 15 minutes if user has been active
 */
export function useTokenRefresh() {
  const lastActivityRef = useRef<number>(Date.now());
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isRefreshingRef = useRef<boolean>(false);

  // Update last activity timestamp
  const updateActivity = () => {
    lastActivityRef.current = Date.now();
  };

  // Perform token refresh
  const performTokenRefresh = async () => {
    // Prevent multiple simultaneous refresh attempts
    if (isRefreshingRef.current) {
      console.log('🔄 Token refresh already in progress, skipping...');
      return;
    }

    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');

    if (!token || !userData) {
      console.log('⚠️ No token or user data found, skipping refresh');
      return;
    }

    try {
      isRefreshingRef.current = true;
      console.log('🔄 Refreshing authentication token...');
      
      // Dispatch event for UI indicator
      window.dispatchEvent(new CustomEvent('token-refresh-start'));

      // Parse user data to get user_id
      const parsedUserData = JSON.parse(userData);
      const userId = parsedUserData._id || parsedUserData.id || parsedUserData.user_id;

      if (!userId) {
        console.warn('⚠️ No user ID found, cannot refresh token');
        return;
      }

      // Call refresh token endpoint
      const response = await refreshToken({
        token: token,
        user_id: userId,
      });

      // Extract new token from response
      const newToken = response.data?.token || response.token || response.data?.access_token;

      if (newToken) {
        // Update stored token
        localStorage.setItem('auth_token', newToken);
        console.log('✅ Token refreshed successfully');
        
        // Dispatch success event
        window.dispatchEvent(new CustomEvent('token-refresh-end'));
      } else {
        console.warn('⚠️ No new token in refresh response');
      }
    } catch (error: any) {
      console.error('❌ Token refresh failed:', error.message);
      
      // If refresh fails with auth error, let the axios interceptor handle logout
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.warn('🔒 Refresh token expired or invalid - user will be logged out');
      }
    } finally {
      isRefreshingRef.current = false;
    }
  };

  useEffect(() => {
    // Don't run on login/register pages
    const publicPaths = ['/login', '/register', '/auth', '/onboarding', '/verify-email', '/', '/terms-of-service', '/privacy-policy'];
    if (publicPaths.includes(window.location.pathname)) {
      return;
    }

    // Check if user is authenticated
    const token = localStorage.getItem('auth_token');
    if (!token) {
      return;
    }

    console.log('🔐 Token auto-refresh activated');

    // Add activity listeners
    ACTIVITY_EVENTS.forEach((event) => {
      window.addEventListener(event, updateActivity);
    });

    // Set up periodic token refresh
    const startRefreshTimer = () => {
      refreshTimerRef.current = setInterval(async () => {
        const timeSinceActivity = Date.now() - lastActivityRef.current;
        
        // Only refresh if user has been active in the last 30 minutes
        if (timeSinceActivity < 30 * 60 * 1000) {
          await performTokenRefresh();
        } else {
          console.log('⏸️ User inactive, skipping token refresh');
        }
      }, TOKEN_REFRESH_INTERVAL);
    };

    // Start the refresh timer
    startRefreshTimer();

    // Cleanup function
    return () => {
      // Remove activity listeners
      ACTIVITY_EVENTS.forEach((event) => {
        window.removeEventListener(event, updateActivity);
      });

      // Clear refresh timer
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }

      console.log('🔐 Token auto-refresh deactivated');
    };
  }, []);

  return null;
}
