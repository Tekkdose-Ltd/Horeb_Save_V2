/**
 * Unit tests — Phone number normalisation utility
 *
 * Tests the logic from onboarding.tsx that ensures phone numbers
 * are always sent to the backend as +44XXXXXXXXXX
 */
import { describe, it, expect } from "vitest";

// Extracted normalisation logic (mirrors onboarding.tsx exactly)
function normalisePhone(raw: string): string {
  const stripped = raw.replace(/[\s\-().]/g, "");
  if (stripped.startsWith("+")) return stripped;
  if (stripped.startsWith("07")) return "+44" + stripped.slice(1);
  if (stripped.startsWith("7")) return "+44" + stripped;
  return stripped;
}

describe("normalisePhone", () => {
  it("keeps +44 numbers as-is", () => {
    expect(normalisePhone("+447911123456")).toBe("+447911123456");
  });

  it("converts 07xxx to +447xxx", () => {
    expect(normalisePhone("07911123456")).toBe("+447911123456");
  });

  it("converts bare 7xxx to +447xxx", () => {
    expect(normalisePhone("7911123456")).toBe("+447911123456");
  });

  it("strips spaces from +44 numbers", () => {
    expect(normalisePhone("+44 7911 123 456")).toBe("+447911123456");
  });

  it("strips spaces from 07xxx numbers", () => {
    expect(normalisePhone("07911 123 456")).toBe("+447911123456");
  });

  it("strips dashes", () => {
    expect(normalisePhone("07911-123-456")).toBe("+447911123456");
  });

  it("passes through non-UK numbers with + prefix unchanged", () => {
    expect(normalisePhone("+12025550123")).toBe("+12025550123");
  });
});
