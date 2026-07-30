import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";

const eventSchema = z.object({
  eventId: z.string().min(6).max(128),
  occurredAt: z.iso.datetime(),
  workspaceId: z.string().min(3).max(128),
  customerId: z.string().min(3).max(128),
  feature: z.string().min(1).max(120),
  provider: z.string().min(1).max(80),
  model: z.string().min(1).max(120),
  inputTokens: z.number().int().nonnegative(),
  outputTokens: z.number().int().nonnegative(),
  latencyMs: z.number().int().nonnegative(),
  costUsd: z.number().nonnegative(),
  revenueUsd: z.number().nonnegative(),
  status: z.enum(["ok", "error"]).default("ok"),
});

const globalStore = globalThis as typeof globalThis & {
  finferenceIdempotency?: Map<string, number>;
};

const idempotency = (globalStore.finferenceIdempotency ??= new Map());

function validSignature(body: string, signature: string | null) {
  const secret = process.env.FINFERENCE_INGEST_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";
  if (!signature?.startsWith("sha256=")) return false;

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

export async function POST(request: Request) {
  const rawBody = await request.text();
  if (!validSignature(rawBody, request.headers.get("x-finference-signature"))) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  try {
    const event = eventSchema.parse(JSON.parse(rawBody));
    const idempotencyKey =
      request.headers.get("idempotency-key") ?? event.eventId;

    if (idempotency.has(idempotencyKey)) {
      return NextResponse.json(
        { accepted: true, duplicate: true, eventId: event.eventId },
        { status: 200 },
      );
    }

    idempotency.set(idempotencyKey, Date.now());
    if (idempotency.size > 5_000) {
      const cutoff = Date.now() - 24 * 60 * 60 * 1000;
      for (const [key, timestamp] of idempotency) {
        if (timestamp < cutoff) idempotency.delete(key);
      }
    }

    return NextResponse.json(
      {
        accepted: true,
        duplicate: false,
        eventId: event.eventId,
        normalizedAt: new Date().toISOString(),
      },
      { status: 202 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: "Invalid economic event",
        issues: error instanceof z.ZodError ? error.issues : undefined,
      },
      { status: 400 },
    );
  }
}

