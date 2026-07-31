import { NextResponse } from "next/server";
import { z } from "zod";
import {
  authenticateWorkspaceApiKey,
  consumeRateLimit,
  insertUsageEvent,
  resolveWorkspaceBySlug,
} from "@/db/services";
import { verifyHmacSha256 } from "@/lib/security";

const eventSchema = z.object({
  eventId: z.string().min(6).max(128),
  occurredAt: z.iso.datetime(),
  workspaceSlug: z.string().min(3).max(80).optional(),
  customerId: z.string().min(3).max(128),
  feature: z.string().min(1).max(120),
  provider: z.string().min(1).max(80),
  model: z.string().min(1).max(120),
  inputTokens: z.number().int().nonnegative().max(20_000_000),
  outputTokens: z.number().int().nonnegative().max(20_000_000),
  latencyMs: z.number().int().nonnegative().max(3_600_000),
  costUsd: z.number().nonnegative().max(1_000_000),
  revenueUsd: z.number().nonnegative().max(1_000_000),
  status: z.enum(["ok", "error"]).default("ok"),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

function validSignature(body: string, signature: string | null) {
  return verifyHmacSha256(
    body,
    signature,
    process.env.FINFERENCE_INGEST_SECRET,
  );
}

function extractApiKey(request: Request) {
  const explicit = request.headers.get("x-finference-key");
  if (explicit) return explicit;
  const authorization = request.headers.get("authorization");
  if (authorization?.startsWith("Bearer ")) {
    return authorization.slice("Bearer ".length);
  }
  return null;
}

export async function POST(request: Request) {
  const rawBody = await request.text();

  try {
    const event = eventSchema.parse(JSON.parse(rawBody));
    const apiKey = extractApiKey(request);
    const apiKeyRecord = apiKey
      ? await authenticateWorkspaceApiKey(apiKey)
      : null;

    let workspaceId = apiKeyRecord?.workspaceId ?? null;
    if (!workspaceId && validSignature(
      rawBody,
      request.headers.get("x-finference-signature"),
    )) {
      const workspace = event.workspaceSlug
        ? await resolveWorkspaceBySlug(event.workspaceSlug)
        : null;
      workspaceId = workspace?.id ?? null;
    }

    if (!workspaceId) {
      return NextResponse.json(
        {
          error:
            "Authentication failed. Use a workspace API key or a valid HMAC signature and workspaceSlug.",
        },
        { status: 401 },
      );
    }

    const rateLimit = await consumeRateLimit(
      apiKeyRecord ? `api-key:${apiKeyRecord.id}` : `hmac:${workspaceId}`,
    );
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded", resetAt: rateLimit.resetAt },
        {
          status: 429,
          headers: {
            "Retry-After": String(
              Math.max(
                1,
                Math.ceil((rateLimit.resetAt.getTime() - Date.now()) / 1_000),
              ),
            ),
            "X-RateLimit-Limit": String(rateLimit.limit),
            "X-RateLimit-Remaining": "0",
          },
        },
      );
    }

    const idempotencyKey =
      request.headers.get("idempotency-key") ?? event.eventId;
    const persisted = await insertUsageEvent({
      workspaceId,
      externalEventId: event.eventId,
      idempotencyKey,
      occurredAt: new Date(event.occurredAt),
      customerId: event.customerId,
      feature: event.feature,
      provider: event.provider,
      model: event.model,
      inputTokens: event.inputTokens,
      outputTokens: event.outputTokens,
      latencyMs: event.latencyMs,
      costUsd: event.costUsd,
      revenueUsd: event.revenueUsd,
      status: event.status,
      metadata: {
        ...event.metadata,
        authenticatedBy: apiKeyRecord ? "workspace-api-key" : "hmac",
      },
    });

    return NextResponse.json(
      {
        accepted: true,
        duplicate: persisted.duplicate,
        eventId: event.eventId,
        persistedId: persisted.id,
        normalizedAt: new Date().toISOString(),
      },
      {
        status: persisted.duplicate ? 200 : 202,
        headers: {
          "X-RateLimit-Limit": String(rateLimit.limit),
          "X-RateLimit-Remaining": String(rateLimit.remaining),
        },
      },
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
