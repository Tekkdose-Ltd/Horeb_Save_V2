/**
 * MSW (Mock Service Worker) request handlers
 *
 * Add handlers here to intercept API calls during tests.
 * Group them by feature to keep things organised.
 */
import { http, HttpResponse } from "msw";

// ── Auth handlers ─────────────────────────────────────────────────────────────
const authHandlers = [
  // Successful login — matches both local proxy and direct render URL
  http.post(/\/auth\/login$/, () => {
    return HttpResponse.json({
      success: true,
      data: {
        token: "mock-jwt-token",
        user: {
          id: "user-1",
          email: "test@example.com",
          firstName: "Test",
          lastName: "User",
          profileCompleted: true,
          emailVerified: true,
        },
      },
    });
  }),

  // Resend verification email
  http.post(/\/auth\/resend-verification$/, () => {
    return HttpResponse.json({ success: true, message: "Email sent" });
  }),
];

// ── Payment handlers ──────────────────────────────────────────────────────────
const paymentHandlers = [
  // Stripe Connect account link
  http.get(/\/payment\/account\/link$/, () => {
    return HttpResponse.json({
      data: { redirectURL: "https://connect.stripe.com/mock-onboarding" },
    });
  }),

  // List payment methods
  http.get(/\/payment-methods$/, () => {
    return HttpResponse.json([
      {
        id: "pm_mock_1",
        card: { brand: "visa", last4: "4242", exp_month: 12, exp_year: 2027 },
      },
    ]);
  }),
];

// ── Groups handlers ───────────────────────────────────────────────────────────
const groupHandlers = [
  http.get(/\/groups$/, () => {
    return HttpResponse.json({
      success: true,
      data: [],
    });
  }),
];

export const handlers = [
  ...authHandlers,
  ...paymentHandlers,
  ...groupHandlers,
];
