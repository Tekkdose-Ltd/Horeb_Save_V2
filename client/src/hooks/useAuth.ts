import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

/**
 * Authentication hook
 * 
 * Toggle USE_MOCK_AUTH to switch between mock data and real API
 * Set to false when your backend authentication is ready
 */

// 🚨 CHANGE THIS TO FALSE WHEN YOUR BACKEND IS READY 🚨
const USE_MOCK_AUTH = true;

// Mock user data for development
const mockUser: User = {
  id: "demo-user-123",
  email: "demo@horebsave.com",
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
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
