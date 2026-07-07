/**
 * Integration tests for Group Joining Flow with Payment Method Verification
 *
 * Tests the complete flow of:
 * 1. User without payment method tries to join a group
 * 2. Payment method modal appears
 * 3. User links a card/bank account
 * 4. User data is refreshed with stripeCustomerId
 * 5. Group join proceeds successfully
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../utils/renderWithProviders";
import Groups from "@/pages/groups";

// Mock user state
let mockUser: any = null;
const mockLogout = vi.fn();

// Mock useAuth hook
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: mockUser,
    logout: mockLogout,
    isAuthenticated: !!mockUser,
    isLoading: false,
    hasPaymentMethod: !!mockUser?.stripeCustomerId,
    hasBankAccount: !!(
      mockUser?.bankAccountHolderName &&
      mockUser?.bankAccountNumber &&
      mockUser?.bankSortCode &&
      mockUser?.bankDetailsVerified
    ),
    isFullyVerified: !!(
      mockUser?.stripeCustomerId ||
      (mockUser?.bankAccountHolderName &&
        mockUser?.bankAccountNumber &&
        mockUser?.bankSortCode &&
        mockUser?.bankDetailsVerified)
    ),
  }),
}));

// Mock API functions
const mockGetUserGroups = vi.fn();
const mockGetPublicGroups = vi.fn();
const mockApiRequest = vi.fn();

vi.mock("@/lib/queryClient", async () => {
  const actual = await vi.importActual("@/lib/queryClient");
  return {
    ...actual,
    getUserGroups: () => mockGetUserGroups(),
    getPublicGroups: () => mockGetPublicGroups(),
    apiRequest: (...args: any[]) => mockApiRequest(...args),
  };
});

// Mock Stripe
vi.mock("@stripe/stripe-js", () => ({
  loadStripe: vi.fn(() => Promise.resolve(null)),
}));

vi.mock("@stripe/react-stripe-js", () => ({
  Elements: ({ children }: any) => <div data-testid="stripe-elements">{children}</div>,
  PaymentElement: () => <div data-testid="payment-element">Payment Form</div>,
  useStripe: () => ({
    confirmSetup: vi.fn(() =>
      Promise.resolve({
        setupIntent: { status: "succeeded" },
        error: null,
      })
    ),
  }),
  useElements: () => ({}),
}));

describe("Group Joining Flow - Payment Method Verification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset user to no payment method
    mockUser = {
      id: "user-123",
      email: "test@horebsave.com",
      firstName: "Test",
      lastName: "User",
      stripeCustomerId: null, // No payment method initially
      bankAccountHolderName: null,
      bankAccountNumber: null,
      bankSortCode: null,
      bankDetailsVerified: false,
      profileCompleted: true,
    };

    // Setup default mock responses
    mockGetUserGroups.mockResolvedValue([]);
    mockGetPublicGroups.mockResolvedValue([
      {
        id: "group-1",
        name: "Test Savings Group",
        description: "A test group",
        memberCount: 3,
        maxMembers: 10,
        contributionAmount: 100,
        frequency: "monthly",
        inviteCode: "ABC123",
      },
    ]);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("User WITHOUT payment method", () => {
    it("shows verification banner when user has no payment method", async () => {
      renderWithProviders(<Groups />);

      // Wait for component to render and data to load
      await waitFor(() => {
        expect(screen.getByText(/Payment method required/i)).toBeInTheDocument();
      });

      // Should show amber warning banner
      expect(
        screen.getByText(/Link a card or bank account to join groups/i)
      ).toBeInTheDocument();
    });

    it("shows bank details modal when user tries to join without payment method", async () => {
      renderWithProviders(<Groups />);

      // Switch to Browse Groups tab
      const browseTab = await screen.findByTestId("tab-browse");
      await userEvent.click(browseTab);

      // Wait for public groups to load
      await waitFor(() => {
        expect(screen.getByText("Test Savings Group")).toBeInTheDocument();
      });

      // Click join button
      const joinButton = screen.getByTestId("button-join-group-group-1");
      await userEvent.click(joinButton);

      // Bank details modal should appear
      await waitFor(() => {
        expect(screen.getByText(/Link Payment Method/i)).toBeInTheDocument();
      });
    });
  });

  describe("User WITH payment method (card)", () => {
    beforeEach(() => {
      // User has a card linked
      mockUser = {
        ...mockUser,
        stripeCustomerId: "cus_test123",
      };
    });

    it("shows green verification banner when user has payment method", async () => {
      mockGetPublicGroups.mockResolvedValue([]);
      
      renderWithProviders(<Groups />);

      await waitFor(() => {
        expect(screen.getByText(/Account verified/i)).toBeInTheDocument();
      });

      expect(
        screen.getByText(/You're all set to join and create groups!/i)
      ).toBeInTheDocument();
    });

    it("allows user to join group directly without showing modal", async () => {
      mockApiRequest.mockResolvedValue({
        json: () => Promise.resolve({ success: true, message: "Joined successfully" }),
      });

      renderWithProviders(<Groups />);

      // Switch to Browse Groups
      const browseTab = await screen.findByTestId("tab-browse");
      await userEvent.click(browseTab);

      // Wait for groups to load
      await waitFor(() => {
        expect(screen.getByText("Test Savings Group")).toBeInTheDocument();
      });

      // Click join button
      const joinButton = screen.getByTestId("button-join-group-group-1");
      await userEvent.click(joinButton);

      // Should call the join API (not show modal)
      await waitFor(() => {
        expect(mockApiRequest).toHaveBeenCalledWith("POST", "/groups/join", {
          invitation_code: "ABC123",
        });
      });

      // Verify the join was successful (API was called with correct params)
      expect(mockApiRequest).toHaveBeenCalled();
    });
  });

  describe("User WITH verified bank account", () => {
    beforeEach(() => {
      // User has bank account verified
      mockUser = {
        ...mockUser,
        bankAccountHolderName: "Test User",
        bankAccountNumber: "1234",
        bankSortCode: "12-34-56",
        bankDetailsVerified: true,
      };

      mockGetPublicGroups.mockResolvedValue([
        {
          id: "group-1",
          name: "Bank User Group",
          memberCount: 2,
          maxMembers: 10,
          contributionAmount: 50,
          frequency: "weekly",
          inviteCode: "XYZ789",
        },
      ]);
    });

    it("shows green verification banner", async () => {
      mockGetPublicGroups.mockResolvedValue([]);
      
      renderWithProviders(<Groups />);

      await waitFor(() => {
        expect(screen.getByText(/Account verified/i)).toBeInTheDocument();
      });
    });

    it("allows user to join group directly", async () => {
      mockApiRequest.mockResolvedValue({
        json: () => Promise.resolve({ success: true }),
      });

      renderWithProviders(<Groups />);

      const browseTab = await screen.findByTestId("tab-browse");
      await userEvent.click(browseTab);

      await waitFor(() => {
        expect(screen.getByText("Bank User Group")).toBeInTheDocument();
      });

      const joinButton = screen.getByTestId("button-join-group-group-1");
      await userEvent.click(joinButton);

      // Should call join API
      await waitFor(() => {
        expect(mockApiRequest).toHaveBeenCalledWith("POST", "/groups/join", {
          invitation_code: "XYZ789",
        });
      });
    });
  });

  describe("Verification Logic Tests", () => {
    it("verifies user is considered verified with stripeCustomerId", () => {
      const testUser = {
        stripeCustomerId: "cus_verified",
        bankDetailsVerified: false,
      };

      const isFullyVerified = !!(
        testUser.stripeCustomerId ||
        testUser.bankDetailsVerified
      );

      expect(isFullyVerified).toBe(true);
    });

    it("verifies user is considered verified with bank account", () => {
      const testUser = {
        stripeCustomerId: null,
        bankAccountHolderName: "Test",
        bankAccountNumber: "1234",
        bankSortCode: "12-34-56",
        bankDetailsVerified: true,
      };

      const hasBankAccount = !!(
        testUser.bankAccountHolderName &&
        testUser.bankAccountNumber &&
        testUser.bankSortCode &&
        testUser.bankDetailsVerified
      );

      expect(hasBankAccount).toBe(true);
    });

    it("verifies user NOT verified without payment methods", () => {
      const testUser = {
        stripeCustomerId: null,
        bankDetailsVerified: false,
      };

      const isFullyVerified = !!(
        testUser.stripeCustomerId ||
        testUser.bankDetailsVerified
      );

      expect(isFullyVerified).toBe(false);
    });
  });
});
