/**
 * Component tests — AccountStatus page
 *
 * Tests the three states the page can be in and the actions available on each.
 */
import { describe, it, expect, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../utils/renderWithProviders";
import AccountStatus from "@/pages/account-status";

// Mock useAuth so the page doesn't crash when user isn't logged in
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: { email: "test@example.com" },
    logout: vi.fn(),
    isAuthenticated: false,
    isLoading: false,
  }),
}));

function renderAtPath(search: string) {
  // jsdom doesn't change window.location automatically, so we set it manually
  Object.defineProperty(window, "location", {
    writable: true,
    value: { ...window.location, search },
  });
  return renderWithProviders(<AccountStatus />);
}

describe("AccountStatus — unverified email", () => {
  it("shows the email verification card", () => {
    renderAtPath("?reason=unverified");
    expect(screen.getByText(/verify your email/i)).toBeInTheDocument();
  });

  it("shows the resend button", () => {
    renderAtPath("?reason=unverified");
    expect(
      screen.getByRole("button", { name: /resend verification email/i })
    ).toBeInTheDocument();
  });

  it("shows 'Check your inbox' after resend is clicked", async () => {
    renderAtPath("?reason=unverified");
    const btn = screen.getByRole("button", { name: /resend verification email/i });
    await userEvent.click(btn);
    await waitFor(() =>
      expect(screen.getByText(/check your inbox/i)).toBeInTheDocument()
    );
  });
});

describe("AccountStatus — payment failed", () => {
  it("shows the payment link failed card", () => {
    renderAtPath("?reason=payment-failed");
    expect(screen.getByText(/payment link failed/i)).toBeInTheDocument();
  });

  it("shows the Link Payment Method button", () => {
    renderAtPath("?reason=payment-failed");
    expect(
      screen.getByRole("button", { name: /link payment method/i })
    ).toBeInTheDocument();
  });
});

describe("AccountStatus — stripe connect failed", () => {
  it("shows the bank account linking card", () => {
    renderAtPath("?reason=stripe-connect-failed");
    expect(
      screen.getByText(/bank account linking incomplete/i)
    ).toBeInTheDocument();
  });

  it("shows the retry button", () => {
    renderAtPath("?reason=stripe-connect-failed");
    expect(
      screen.getByRole("button", { name: /retry bank account linking/i })
    ).toBeInTheDocument();
  });
});

describe("AccountStatus — combined reasons", () => {
  it("shows both cards when reason=unverified,payment-failed", () => {
    renderAtPath("?reason=unverified,payment-failed");
    expect(screen.getByText(/verify your email/i)).toBeInTheDocument();
    expect(screen.getByText(/payment link failed/i)).toBeInTheDocument();
  });
});

describe("AccountStatus — actions", () => {
  it("shows 'Skip for now' button when issues are unresolved", () => {
    renderAtPath("?reason=unverified");
    expect(
      screen.getByRole("button", { name: /skip for now/i })
    ).toBeInTheDocument();
  });

  it("shows 'Log out' button", () => {
    renderAtPath("?reason=unverified");
    expect(
      screen.getByRole("button", { name: /log out/i })
    ).toBeInTheDocument();
  });
});
