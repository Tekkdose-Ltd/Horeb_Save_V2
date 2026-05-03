// Global test setup — runs before every test file
import "@testing-library/jest-dom";
import { afterEach, beforeAll, afterAll } from "vitest";
import { cleanup } from "@testing-library/react";
import { server } from "./mocks/server";

// Start the MSW mock server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));

// Reset handlers after each test so they don't bleed into others
afterEach(() => {
  cleanup();          // unmount React trees
  server.resetHandlers();
});

// Stop mock server after all tests
afterAll(() => server.close());
