import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import type { User } from "@shared/schema";

/**
 * Authentication hook
 * 
 * Toggle USE_MOCK_AUTH to switch between mock data and real API
 * Set to false when your backend authentication is ready
 */

// 🚨 CHANGE THIS TO FALSE WHEN YOUR BACKEND IS READY 🚨
const USE_MOCK_AUTH = false;

// Mock user data for development
const mockUser: User = {
  id: "demo-user-123",
  email: "demo@horebsave.com",
  password: "mock-password-hash",
  firstName: "Demo",
  lastName: "User",
  profileImageUrl: null,
  phoneNumber: "+1234567890",
  dateOfBirth: new Date("1990-01-01"),
  addressLine1: "123 Demo Street",
  addressLine2: null,
  city: "London",
  postcode: "SW1A 1AA",
  country: "United Kingdom",
  profileCompleted: true,
  stripeCustomerId: null,
  trustScore: "85.00",
  totalGroupsCompleted: 3,
  onTimePaymentRate: "95.50",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date(),
};

export function useAuth() {
  // Use mock user for development
  if (USE_MOCK_AUTH) {
    return {
      user: mockUser,
      isLoading: false,
      isAuthenticated: true,
    };
  }

  // Real API authentication - will be used when USE_MOCK_AUTH is false
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/auth/user"],
    retry: false,
    staleTime: Infinity, // Never consider data stale
    gcTime: Infinity, // Keep in cache forever
    refetchOnMount: false, // Don't refetch when component mounts
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnReconnect: false, // Don't refetch on reconnect
    // If query fails, try to get from localStorage
    initialData: () => {
      try {
        const stored = localStorage.getItem('user_data');
        return stored ? JSON.parse(stored) : undefined;
      } catch {
        return undefined;
      }
    },
  });

  // Check if we have user data in the query cache or localStorage
  const hasUser = !!user;

  // Logout function
  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    
    // Clear React Query cache
    queryClient.setQueryData(["/auth/user"], null);
    queryClient.clear();
    
    // Redirect to landing page
    window.location.href = "/";
  };

  return {
    user: user || null,
    isLoading,
    isAuthenticated: hasUser,
    logout,
  };
}
