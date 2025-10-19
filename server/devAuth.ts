// Development-only authentication bypass for testing Stripe integration
// This allows local testing without Replit authentication

export const devAuthMiddleware = (req: any, res: any, next: any) => {
  // Only enable in development mode
  if (process.env.NODE_ENV !== "development") {
    return next();
  }

  // Mock user for development testing
  if (!req.user) {
    req.user = {
      claims: {
        sub: "dev-user-123", // Mock user ID
        email: "test@example.com",
        name: "Test User",
      },
    };
  }

  next();
};

// Mock user data for development
export const mockDevUser = {
  id: "dev-user-123",
  email: "test@example.com",
  firstName: "Test",
  lastName: "User",
  stripeCustomerId: null, // Will be created when needed
};
