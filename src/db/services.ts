import { randomBytes } from "node:crypto";
import { and, desc, eq, or, sql } from "drizzle-orm";
import { db } from "./client";
import {
  auditLog,
  meterFlushes,
  routingPolicies,
  rateLimitBuckets,
  usageEvents as usageEventsTable,
  webhookEvents,
  workspaceApiKeys,
  workspaceMembers,
  workspaces,
} from "./schema";
import {
  auditEvents as seededAudit,
  recommendedPolicy,
  usageEvents as seededUsage,
} from "@/lib/demo-data";
import { summarize, type UsageEvent } from "@/lib/finops";
import {
  calculateBillableUnits,
  createMeterWatermark,
} from "@/lib/metering";
import {
  canApprovePolicyRole,
  canTransitionPolicy,
} from "@/lib/policy-state";
import { getRateLimitDecision, hashApiKey } from "@/lib/security";

export type SessionUser = {
  id: string;
  email: string;
  name?: string | null;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 38);
}

function numeric(value: string | number) {
  return typeof value === "number" ? value : Number(value);
}

export async function ensureWorkspaceForUser(user: SessionUser) {
  const existing = await db
    .select({ workspace: workspaces, role: workspaceMembers.role })
    .from(workspaceMembers)
    .innerJoin(workspaces, eq(workspaceMembers.workspaceId, workspaces.id))
    .where(eq(workspaceMembers.userId, user.id))
    .limit(1);

  if (existing[0]) {
    await seedWorkspaceIfEmpty(existing[0].workspace.id);
    return existing[0];
  }

  const base = slugify(user.name || user.email.split("@")[0] || "workspace");
  const slug = `${base || "workspace"}-${user.id.slice(-6).toLowerCase()}`;
  const [workspace] = await db
    .insert(workspaces)
    .values({
      name:
        user.email === process.env.DEMO_USER_EMAIL
          ? "Aurora Labs"
          : `${user.name || "My"} Workspace`,
      slug,
      ownerUserId: user.id,
      plan: "scale",
    })
    .returning();

  await db.insert(workspaceMembers).values({
    workspaceId: workspace.id,
    userId: user.id,
    role: "owner",
  });

  await seedWorkspaceIfEmpty(workspace.id);
  return { workspace, role: "owner" as const };
}

async function seedWorkspaceIfEmpty(workspaceId: string) {
  const [count] = await db
    .select({ value: sql<number>`count(*)::int` })
    .from(usageEventsTable)
    .where(eq(usageEventsTable.workspaceId, workspaceId));

  if ((count?.value ?? 0) > 0) return;

  const revenueScale = 3_890.35;
  const costScale = 5_327.346477;
  await db
    .insert(usageEventsTable)
    .values(
      seededUsage.map((event) => ({
        workspaceId,
        externalEventId: event.id,
        idempotencyKey: `seed:${event.id}`,
        occurredAt: new Date(event.occurredAt),
        customerId: event.customerId,
        feature: event.feature,
        provider: event.provider,
        model: event.model,
        inputTokens: event.inputTokens,
        outputTokens: event.outputTokens,
        latencyMs: event.latencyMs,
        costUsd: String(event.costUsd * costScale),
        revenueUsd: String(event.revenueUsd * revenueScale),
        status: event.status,
        metadata: {
          source: "seeded-production-shaped-traffic",
          revenueSampleWeight: revenueScale,
          costSampleWeight: costScale,
        },
      })),
    )
    .onConflictDoNothing();

  const policyExists = await db
    .select({ id: routingPolicies.id })
    .from(routingPolicies)
    .where(eq(routingPolicies.workspaceId, workspaceId))
    .limit(1);

  if (!policyExists[0]) {
    await db.insert(routingPolicies).values({
      workspaceId,
      name: recommendedPolicy.name,
      feature: recommendedPolicy.feature,
      fromModel: recommendedPolicy.fromModel,
      toModel: recommendedPolicy.toModel,
      trafficShareBps: Math.round(recommendedPolicy.trafficShare * 10_000),
      qualityFloorBps: Math.round(recommendedPolicy.qualityFloor * 10_000),
      expectedMonthlySavingsCents:
        recommendedPolicy.expectedMonthlySavings * 100,
      expectedMarginLiftBps: Math.round(
        recommendedPolicy.expectedMarginLift * 100,
      ),
      risk: recommendedPolicy.risk,
      status: "proposed",
      simulationEvidence: {
        sampleSize: 96_221,
        semanticQualityBps: 9_480,
        p95LatencyBeforeMs: 1_610,
        p95LatencyAfterMs: 1_280,
        escalationPrecisionBeforeBps: 9_640,
        escalationPrecisionAfterBps: 9_710,
      },
      rollbackConditions: {
        qualityFloorBps: 9_400,
        p95LatencyMaxMs: 1_500,
        providerErrorRateMaxBps: 200,
      },
    });
  }

  await db
    .insert(auditLog)
    .values(
      seededAudit.map((event, index) => ({
        workspaceId,
        actorId: event.actor,
        actorType: event.actor.includes("agent") ? "agent" : "system",
        action: event.action,
        targetType: "workspace",
        targetId: workspaceId,
        status:
          event.status === "awaiting approval"
            ? ("awaiting_approval" as const)
            : ("verified" as const),
        evidence: { target: event.target, seeded: true },
        createdAt: new Date(Date.now() - (index + 1) * 16 * 60 * 1000),
      })),
    )
    .onConflictDoNothing();
}

export async function getPersistentDashboard(user: SessionUser) {
  const membership = await ensureWorkspaceForUser(user);
  const workspaceId = membership.workspace.id;
  const [events, policies, audit, flushes] = await Promise.all([
    db
      .select()
      .from(usageEventsTable)
      .where(eq(usageEventsTable.workspaceId, workspaceId))
      .orderBy(desc(usageEventsTable.occurredAt)),
    db
      .select()
      .from(routingPolicies)
      .where(eq(routingPolicies.workspaceId, workspaceId))
      .orderBy(desc(routingPolicies.createdAt)),
    db
      .select()
      .from(auditLog)
      .where(eq(auditLog.workspaceId, workspaceId))
      .orderBy(desc(auditLog.createdAt))
      .limit(8),
    db
      .select()
      .from(meterFlushes)
      .where(eq(meterFlushes.workspaceId, workspaceId))
      .orderBy(desc(meterFlushes.createdAt))
      .limit(5),
  ]);

  const normalized: UsageEvent[] = events.map((event) => ({
    id: event.externalEventId,
    occurredAt: event.occurredAt.toISOString(),
    workspaceId: event.workspaceId,
    customerId: event.customerId,
    feature: event.feature,
    provider: event.provider,
    model: event.model,
    inputTokens: event.inputTokens,
    outputTokens: event.outputTokens,
    latencyMs: event.latencyMs,
    costUsd: numeric(event.costUsd),
    revenueUsd: numeric(event.revenueUsd),
    status: event.status === "error" ? "error" : "ok",
  }));

  const active = policies.find((policy) =>
    ["active", "approved"].includes(policy.status),
  );
  const proposed = policies.find((policy) => policy.status === "proposed");
  const snapshot = summarize(normalized);

  return {
    workspace: membership.workspace,
    role: membership.role,
    snapshot,
    events: normalized,
    policy: active ?? proposed ?? policies[0] ?? null,
    policyApplied: Boolean(active),
    audit,
    meterFlushes: flushes,
    integrations: {
      database: "live" as const,
      auth: "live" as const,
      backboard: (process.env.BACKBOARD_API_KEY ? "live" : "ready") as
        | "live"
        | "ready",
      stripe: (process.env.STRIPE_SECRET_KEY ? "live" : "ready") as
        | "live"
        | "ready",
    },
  };
}

export async function approveRoutingPolicy(
  user: SessionUser,
  policyId?: string,
) {
  const membership = await ensureWorkspaceForUser(user);
  if (!canApprovePolicyRole(membership.role)) {
    throw new Error("Insufficient permission to approve policies");
  }
  const conditions = [
    eq(routingPolicies.workspaceId, membership.workspace.id),
    eq(routingPolicies.status, "proposed"),
    ...(policyId ? [eq(routingPolicies.id, policyId)] : []),
  ];
  const [policy] = await db
    .select()
    .from(routingPolicies)
    .where(and(...conditions))
    .limit(1);

  if (!policy) throw new Error("No proposed policy found");
  if (!canTransitionPolicy(policy.status, "active")) {
    throw new Error(`Policy cannot transition from ${policy.status} to active`);
  }

  const now = new Date();
  const [updated] = await db
    .update(routingPolicies)
    .set({
      status: "active",
      approvedBy: user.id,
      approvedAt: now,
      activatedAt: now,
      updatedAt: now,
    })
    .where(
      and(
        eq(routingPolicies.id, policy.id),
        eq(routingPolicies.workspaceId, membership.workspace.id),
        eq(routingPolicies.status, "proposed"),
      ),
    )
    .returning();

  if (!updated) {
    throw new Error("Policy was already approved or changed");
  }

  await db.insert(auditLog).values({
    workspaceId: membership.workspace.id,
    actorId: user.id,
    actorType: "user",
    action: "Approved and activated routing policy",
    targetType: "routing_policy",
    targetId: policy.id,
    status: "verified",
    evidence: {
      policyVersion: policy.id,
      trafficShareBps: policy.trafficShareBps,
      qualityFloorBps: policy.qualityFloorBps,
      rollbackConditions: policy.rollbackConditions,
    },
  });

  return updated;
}

export async function createWorkspaceApiKey(user: SessionUser, name: string) {
  const membership = await ensureWorkspaceForUser(user);
  if (!["owner", "admin"].includes(membership.role)) {
    throw new Error("Insufficient permission");
  }
  const [activeKeyCount] = await db
    .select({ value: sql<number>`count(*)::int` })
    .from(workspaceApiKeys)
    .where(
      and(
        eq(workspaceApiKeys.workspaceId, membership.workspace.id),
        sql`${workspaceApiKeys.revokedAt} is null`,
      ),
    );
  if ((activeKeyCount?.value ?? 0) >= 5) {
    throw new Error("Active API key limit reached");
  }

  const plaintext = `fin_live_${randomBytes(24).toString("base64url")}`;
  const keyHash = hashApiKey(plaintext);
  const prefix = plaintext.slice(0, 14);
  const [record] = await db
    .insert(workspaceApiKeys)
    .values({
      workspaceId: membership.workspace.id,
      name: name.slice(0, 80) || "Production",
      prefix,
      keyHash,
    })
    .returning({ id: workspaceApiKeys.id, prefix: workspaceApiKeys.prefix });

  await db.insert(auditLog).values({
    workspaceId: membership.workspace.id,
    actorId: user.id,
    actorType: "user",
    action: "Created ingestion API key",
    targetType: "api_key",
    targetId: record.id,
    status: "verified",
    evidence: { prefix },
  });

  return { ...record, key: plaintext };
}

export async function authenticateWorkspaceApiKey(plaintext: string) {
  const keyHash = hashApiKey(plaintext);
  const [record] = await db
    .select()
    .from(workspaceApiKeys)
    .where(
      and(
        eq(workspaceApiKeys.keyHash, keyHash),
        sql`${workspaceApiKeys.revokedAt} is null`,
      ),
    )
    .limit(1);

  if (!record) return null;
  await db
    .update(workspaceApiKeys)
    .set({ lastUsedAt: new Date() })
    .where(eq(workspaceApiKeys.id, record.id));
  return record;
}

export async function resolveWorkspaceBySlug(slug: string) {
  const [workspace] = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.slug, slug))
    .limit(1);
  return workspace ?? null;
}

export async function insertUsageEvent(input: {
  workspaceId: string;
  externalEventId: string;
  idempotencyKey: string;
  occurredAt: Date;
  customerId: string;
  feature: string;
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  costUsd: number;
  revenueUsd: number;
  status: "ok" | "error";
  metadata?: Record<string, unknown>;
}) {
  const duplicate = await db
    .select({ id: usageEventsTable.id })
    .from(usageEventsTable)
    .where(
      and(
        eq(usageEventsTable.workspaceId, input.workspaceId),
        or(
          eq(usageEventsTable.idempotencyKey, input.idempotencyKey),
          eq(usageEventsTable.externalEventId, input.externalEventId),
        ),
      ),
    )
    .limit(1);

  if (duplicate[0]) return { duplicate: true, id: duplicate[0].id };

  const [event] = await db
    .insert(usageEventsTable)
    .values({
      workspaceId: input.workspaceId,
      externalEventId: input.externalEventId,
      idempotencyKey: input.idempotencyKey,
      occurredAt: input.occurredAt,
      customerId: input.customerId,
      feature: input.feature,
      provider: input.provider,
      model: input.model,
      inputTokens: input.inputTokens,
      outputTokens: input.outputTokens,
      latencyMs: input.latencyMs,
      costUsd: String(input.costUsd),
      revenueUsd: String(input.revenueUsd),
      status: input.status,
      metadata: input.metadata ?? {},
    })
    .onConflictDoNothing()
    .returning({ id: usageEventsTable.id });

  return event
    ? { duplicate: false, id: event.id }
    : { duplicate: true, id: null };
}

export async function recordWebhook(input: {
  id: string;
  provider: string;
  type: string;
  payload: Record<string, unknown>;
}) {
  const [inserted] = await db
    .insert(webhookEvents)
    .values(input)
    .onConflictDoNothing({ target: webhookEvents.id })
    .returning({ id: webhookEvents.id });

  const [claimed] = await db
    .update(webhookEvents)
    .set({ processedAt: new Date(), processingError: null })
    .where(
      and(
        eq(webhookEvents.id, input.id),
        eq(webhookEvents.processed, false),
        sql`${webhookEvents.processedAt} is null`,
      ),
    )
    .returning({ id: webhookEvents.id });

  return {
    duplicate: !inserted,
    shouldProcess: Boolean(claimed),
  };
}

export async function markWebhookProcessed(
  id: string,
  error?: string,
) {
  await db
    .update(webhookEvents)
    .set({
      processed: !error,
      processingError: error ?? null,
      processedAt: error ? null : new Date(),
    })
    .where(eq(webhookEvents.id, id));
}

export async function updateWorkspaceBilling(input: {
  workspaceId?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripeSubscriptionStatus?: string;
}) {
  let workspaceId = input.workspaceId;
  if (!workspaceId && input.stripeCustomerId) {
    const [workspace] = await db
      .select({ id: workspaces.id })
      .from(workspaces)
      .where(eq(workspaces.stripeCustomerId, input.stripeCustomerId))
      .limit(1);
    workspaceId = workspace?.id;
  }
  if (!workspaceId) return null;

  const [updated] = await db
    .update(workspaces)
    .set({
      ...(input.stripeCustomerId
        ? { stripeCustomerId: input.stripeCustomerId }
        : {}),
      ...(input.stripeSubscriptionId
        ? { stripeSubscriptionId: input.stripeSubscriptionId }
        : {}),
      ...(input.stripeSubscriptionStatus
        ? { stripeSubscriptionStatus: input.stripeSubscriptionStatus }
        : {}),
      updatedAt: new Date(),
    })
    .where(eq(workspaces.id, workspaceId))
    .returning();
  return updated ?? null;
}

export async function createMeterFlush(user: SessionUser) {
  const membership = await ensureWorkspaceForUser(user);
  if (!canApprovePolicyRole(membership.role)) {
    throw new Error("Insufficient permission to submit billing meters");
  }
  const workspaceId = membership.workspace.id;
  const [latestFlush] = await db
    .select()
    .from(meterFlushes)
    .where(eq(meterFlushes.workspaceId, workspaceId))
    .orderBy(desc(meterFlushes.periodEnd))
    .limit(1);

  const periodStart =
    latestFlush?.periodEnd ?? new Date(Date.now() - 35 * 24 * 60 * 60 * 1000);
  const periodEnd = new Date();
  const events = await db
    .select()
    .from(usageEventsTable)
    .where(
      and(
        eq(usageEventsTable.workspaceId, workspaceId),
        sql`${usageEventsTable.occurredAt} > ${periodStart}`,
        sql`${usageEventsTable.occurredAt} <= ${periodEnd}`,
        eq(usageEventsTable.billable, true),
      ),
    )
    .orderBy(usageEventsTable.occurredAt);

  const { units: billableUnits } = calculateBillableUnits(events);
  if (events.length === 0 && latestFlush) return latestFlush;

  const amountCents = billableUnits;
  const lastEvent = events.at(-1);
  const sourceWatermark = createMeterWatermark(
    lastEvent
      ? {
          occurredAt: lastEvent.occurredAt,
          externalEventId: lastEvent.externalEventId,
        }
      : null,
  );

  const existing = await db
    .select()
    .from(meterFlushes)
    .where(
      and(
        eq(meterFlushes.workspaceId, workspaceId),
        eq(meterFlushes.sourceWatermark, sourceWatermark),
      ),
    )
    .limit(1);
  if (existing[0]) return existing[0];

  const [flush] = await db
    .insert(meterFlushes)
    .values({
      workspaceId,
      periodStart,
      periodEnd,
      eventCount: events.length,
      billableUnits,
      amountCents,
      sourceWatermark,
      status: "pending",
    })
    .onConflictDoNothing({
      target: [meterFlushes.workspaceId, meterFlushes.sourceWatermark],
    })
    .returning();
  if (flush) return flush;

  const [concurrent] = await db
    .select()
    .from(meterFlushes)
    .where(
      and(
        eq(meterFlushes.workspaceId, workspaceId),
        eq(meterFlushes.sourceWatermark, sourceWatermark),
      ),
    )
    .limit(1);
  if (!concurrent) throw new Error("Unable to persist meter flush");
  return concurrent;
}

export async function updateMeterFlush(
  id: string,
  input: {
    status: "pending" | "submitted" | "reconciled" | "failed";
    stripeMeterEventId?: string;
    errorMessage?: string | null;
    reconciledAt?: Date;
  },
) {
  const [updated] = await db
    .update(meterFlushes)
    .set(input)
    .where(eq(meterFlushes.id, id))
    .returning();
  return updated;
}

export async function recordBillingAudit(input: {
  workspaceId: string;
  actorId: string;
  action: string;
  targetId: string;
  evidence?: Record<string, unknown>;
}) {
  await db.insert(auditLog).values({
    workspaceId: input.workspaceId,
    actorId: input.actorId,
    actorType: "system",
    action: input.action,
    targetType: "billing",
    targetId: input.targetId,
    status: "verified",
    evidence: input.evidence ?? {},
  });
}

export async function updateBackboardState(input: {
  workspaceId: string;
  threadId?: string;
  assistantId?: string;
  actorId: string;
}) {
  await db
    .update(workspaces)
    .set({
      ...(input.threadId ? { backboardThreadId: input.threadId } : {}),
      ...(input.assistantId ? { backboardAssistantId: input.assistantId } : {}),
      updatedAt: new Date(),
    })
    .where(eq(workspaces.id, input.workspaceId));

  await db.insert(auditLog).values({
    workspaceId: input.workspaceId,
    actorId: input.actorId,
    actorType: "agent",
    action: "Updated persistent margin-agent memory",
    targetType: "backboard_thread",
    targetId: input.threadId ?? "pending",
    status: "verified",
    evidence: {
      assistantId: input.assistantId,
      memoryMode: "Auto",
    },
  });
}

export async function resetJudgeWorkspace(user: SessionUser) {
  if (!process.env.DEMO_USER_EMAIL || user.email !== process.env.DEMO_USER_EMAIL) {
    throw new Error("Reset is available only in the shared judge workspace");
  }

  const membership = await ensureWorkspaceForUser(user);
  const workspaceId = membership.workspace.id;

  await db
    .delete(meterFlushes)
    .where(eq(meterFlushes.workspaceId, workspaceId));
  await db
    .delete(workspaceApiKeys)
    .where(eq(workspaceApiKeys.workspaceId, workspaceId));
  await db
    .delete(usageEventsTable)
    .where(
      and(
        eq(usageEventsTable.workspaceId, workspaceId),
        sql`${usageEventsTable.metadata}->>'source' is distinct from 'seeded-production-shaped-traffic'`,
      ),
    );
  await db
    .delete(auditLog)
    .where(
      and(
        eq(auditLog.workspaceId, workspaceId),
        eq(auditLog.actorType, "user"),
      ),
    );
  await db
    .update(routingPolicies)
    .set({
      status: "proposed",
      approvedBy: null,
      approvedAt: null,
      activatedAt: null,
      updatedAt: new Date(),
    })
    .where(eq(routingPolicies.workspaceId, workspaceId));

  await db.insert(auditLog).values({
    workspaceId,
    actorId: user.id,
    actorType: "user",
    action: "Reset shared judge workspace",
    targetType: "workspace",
    targetId: workspaceId,
    status: "verified",
    evidence: { purpose: "repeatable-hackathon-evaluation" },
  });
}

export async function consumeRateLimit(
  key: string,
  limit = 120,
  windowSeconds = 60,
) {
  const now = new Date();
  const windowStart = new Date(
    Math.floor(now.getTime() / (windowSeconds * 1_000)) *
      windowSeconds *
      1_000,
  );
  const bucketKey = `${key}:${windowStart.toISOString()}`;

  const [bucket] = await db
    .insert(rateLimitBuckets)
    .values({
      key: bucketKey,
      windowStartedAt: windowStart,
      requestCount: 1,
    })
    .onConflictDoUpdate({
      target: rateLimitBuckets.key,
      set: {
        requestCount: sql`${rateLimitBuckets.requestCount} + 1`,
        updatedAt: now,
      },
    })
    .returning({ count: rateLimitBuckets.requestCount });

  const decision = getRateLimitDecision(bucket.count, limit);
  return {
    allowed: decision.allowed,
    limit,
    remaining: decision.remaining,
    resetAt: new Date(windowStart.getTime() + windowSeconds * 1_000),
  };
}
