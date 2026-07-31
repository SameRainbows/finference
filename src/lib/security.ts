import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export function hashApiKey(plaintext: string) {
  return createHash("sha256").update(plaintext).digest("hex");
}

export function verifyHmacSha256(
  body: string,
  signature: string | null,
  secret: string | undefined,
) {
  if (!secret || !signature?.startsWith("sha256=")) return false;

  const expected = `sha256=${createHmac("sha256", secret)
    .update(body)
    .digest("hex")}`;
  const receivedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  return (
    receivedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(receivedBuffer, expectedBuffer)
  );
}

export function getRateLimitDecision(count: number, limit: number) {
  if (!Number.isInteger(count) || count < 0) {
    throw new Error("count must be a non-negative integer");
  }
  if (!Number.isInteger(limit) || limit <= 0) {
    throw new Error("limit must be a positive integer");
  }
  return {
    allowed: count <= limit,
    remaining: Math.max(0, limit - count),
  };
}
