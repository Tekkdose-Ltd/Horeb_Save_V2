import { useEffect, useRef } from 'react';
import { refreshToken } from '@/lib/queryClient';

// Token refresh configuration
const TOKEN_REFRESH_INTERVAL = 15 * 60 * 1000; // Check every 15 minutes if we should refresh
const INACTIVITY_TIMEOUT = 3 * 60 * 1000; // Log out after 3 minutes of inactivity
const INACTIVITY_WARNING_TIME = 2 * 60 * 1000; // Warn at 2 minutes (1 min before logout)
const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

/**
 * Hook to automatically refresh authentication token while user is active
 * Refreshes token every 15 minutes if user has been active
 * Logs out user after 3 minutes of inactivity
 */
export function useTokenRefresh() {
  const lastActivityRef = useRef<number>(Date.now());
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isRefreshingRef = useRef<boolean>(false);
  const isMountedRef = useRef<boolean>(true);

  useEffect(() => {
    isMountedRef.current = true;
    
    // Don't run on login/register pages
    const publicPaths = ['/login', '/register', '/auth', '/onboarding', '/verify-email', '/', '/terms-of-service', '/privacy-policy'];
    if (publicPaths.includes(window.location.pathname)) {
      console.log('🔓 Public page - token refresh and inactivity tracking disabled');
      return;
    }

    // Check if user is authenticated
    const token = localStorage.getItem('auth_token');
    if (!token) {
      console.log('🔓 No auth token - token refresh and inactivity tracking disabled');
      return;
    }

    console.log('🔐 Token auto-refresh and inactivity tracking activated');
    console.log(`⏱️ Inactivity timeout: ${INACTIVITY_TIMEOUT / 1000} seconds`);
    console.log(`⚠️ Inactivity warning: ${INACTIVITY_WARNING_TIME / 1000} seconds`);

    // Logout function
    const handleLogout = () => {
      if (!isMountedRef.current) return;
      
      console.log('⏱️ Inactivity timeout reached - logging out user');
      
      // Clear all timers
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }
      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current);
        warningTimerRef.current = null;
      }
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
      
      // Clear auth data
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      localStorage.removeItem('pendingInvite');
      
      // Redirect to login
      window.location.href = '/auth';
    };

    // Update last activity timestamp and reset inactivity timers
    const handleActivity = () => {
      if (!isMountedRef.current) return;
      
      const now = Date.now();
      lastActivityRef.current = now;
      
      console.log('👆 User activity detected, resetting inactivity timers');
      
      // Clear existing timers
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }
      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current);
        warningTimerRef.current = null;
      }
      
      // Set warning timer (1 minute before logout)
      warningTimerRef.current = setTimeout(() => {
        if (!isMountedRef.current) return;
        
        console.log('⚠️ Inactivity warning - 1 minute until logout');
        
        // Dispatch custom event for UI to show warning toast
        window.dispatchEvent(new CustomEvent('inactivity-warning', {
          detail: { minutesRemaining: 1 }
        }));
      }, INACTIVITY_WARNING_TIME);
      
      // Set inactivity logout timer
      inactivityTimerRef.current = setTimeout(() => {
        handleLogout();
      }, INACTIVITY_TIMEOUT);
    };

    // Perform token refresh
    const performTokenRefresh = async () => {
      if (!isMountedRef.current) return;
      
      // Prevent multiple simultaneous refresh attempts
      if (isRefreshingRef.current) {
        console.log('🔄 Token refresh already in progress, skipping...');
        return;
      }

      const currentToken = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('user_data');

      if (!currentToken || !userData) {
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
          token: currentToken,
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

    // Add activity listeners
    ACTIVITY_EVENTS.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Initialize the inactivity timer
    handleActivity();

    // Set up periodic token refresh
    refreshTimerRef.current = setInterval(async () => {
      const timeSinceActivity = Date.now() - lastActivityRef.current;
      
      // Only refresh if user has been active recently (within inactivity threshold)
      if (timeSinceActivity < INACTIVITY_TIMEOUT) {
        await performTokenRefresh();
      } else {
        console.log('⏸️ User inactive, skipping token refresh');
      }
    }, TOKEN_REFRESH_INTERVAL);

    // Cleanup function
    return () => {
      isMountedRef.current = false;
      console.log('🔐 Token auto-refresh and inactivity tracking deactivated');
      
      // Remove activity listeners
      ACTIVITY_EVENTS.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });

      // Clear refresh timer
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }

      // Clear inactivity timer
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }

      // Clear warning timer
      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current);
        warningTimerRef.current = null;
      }
    };
  }, []); // Empty dependency array - only run once on mount

  return null;
}

