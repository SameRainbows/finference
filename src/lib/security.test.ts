import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  getRateLimitDecision,
  hashApiKey,
  verifyHmacSha256,
} from "./security";

describe("API key hashing", () => {
  it("stores a deterministic one-way digest instead of plaintext", () => {
    const plaintext = "fin_live_test_secret";
    const digest = hashApiKey(plaintext);
    expect(digest).toMatch(/^[a-f0-9]{64}$/);
    expect(digest).not.toContain(plaintext);
    expect(hashApiKey(plaintext)).toBe(digest);
    expect(hashApiKey(`${plaintext}_other`)).not.toBe(digest);
  });
});

describe("HMAC verification", () => {
  it("accepts only an exact body signature under the configured secret", () => {
    const body = JSON.stringify({ eventId: "evt_secure" });
    const secret = "test-signing-secret";
    const signature = `sha256=${createHmac("sha256", secret)
      .update(body)
      .digest("hex")}`;

    expect(verifyHmacSha256(body, signature, secret)).toBe(true);
    expect(verifyHmacSha256(`${body} `, signature, secret)).toBe(false);
    expect(verifyHmacSha256(body, signature, "wrong-secret")).toBe(false);
    expect(verifyHmacSha256(body, null, secret)).toBe(false);
  });
});

describe("rate-limit decisions", () => {
  it("allows the boundary request and rejects the next request", () => {
    expect(getRateLimitDecision(120, 120)).toEqual({
      allowed: true,
      remaining: 0,
    });
    expect(getRateLimitDecision(121, 120)).toEqual({
      allowed: false,
      remaining: 0,
    });
  });
});
