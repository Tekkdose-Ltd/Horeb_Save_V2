import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    // Use jsdom so React components can render
    environment: "jsdom",

    // Run this setup file before every test file
    setupFiles: ["./client/src/test/setup.ts"],

    // Allow Jest-style globals (describe, it, expect, vi)
    globals: true,

    // Coverage via V8 (fast, no Babel needed)
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["client/src/**/*.{ts,tsx}", "server/**/*.ts"],
      exclude: [
        "client/src/test/**",
        "client/src/main.tsx",
        "**/*.d.ts",
        "**/node_modules/**",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
    },
  },
});
