import {
  bigint,
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const memberRole = pgEnum("member_role", [
  "owner",
  "admin",
  "analyst",
  "viewer",
]);
export const policyStatus = pgEnum("policy_status", [
  "draft",
  "proposed",
  "approved",
  "active",
  "rolled_back",
  "rejected",
]);
export const auditStatus = pgEnum("audit_status", [
  "verified",
  "awaiting_approval",
  "failed",
]);
export const meterStatus = pgEnum("meter_status", [
  "pending",
  "submitted",
  "reconciled",
  "failed",
]);

export const workspaces = pgTable(
  "workspaces",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    ownerUserId: text("owner_user_id").notNull(),
    plan: text("plan").notNull().default("scale"),
    targetMarginBps: integer("target_margin_bps").notNull().default(6000),
    stripeCustomerId: text("stripe_customer_id"),
    stripeSubscriptionId: text("stripe_subscription_id"),
    stripeSubscriptionStatus: text("stripe_subscription_status"),
    backboardAssistantId: text("backboard_assistant_id"),
    backboardThreadId: text("backboard_thread_id"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("workspaces_slug_uidx").on(table.slug),
    index("workspaces_owner_idx").on(table.ownerUserId),
  ],
);

export const workspaceMembers = pgTable(
  "workspace_members",
  {
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),
    role: memberRole("role").notNull().default("viewer"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.workspaceId, table.userId] }),
    index("workspace_members_user_idx").on(table.userId),
  ],
);

export const workspaceApiKeys = pgTable(
  "workspace_api_keys",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    prefix: text("prefix").notNull(),
    keyHash: text("key_hash").notNull(),
    lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("workspace_api_keys_hash_uidx").on(table.keyHash),
    index("workspace_api_keys_workspace_idx").on(table.workspaceId),
  ],
);

export const usageEvents = pgTable(
  "usage_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    externalEventId: text("external_event_id").notNull(),
    idempotencyKey: text("idempotency_key").notNull(),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
    customerId: text("customer_id").notNull(),
    feature: text("feature").notNull(),
    provider: text("provider").notNull(),
    model: text("model").notNull(),
    inputTokens: integer("input_tokens").notNull(),
    outputTokens: integer("output_tokens").notNull(),
    latencyMs: integer("latency_ms").notNull(),
    costUsd: numeric("cost_usd", { precision: 18, scale: 8 }).notNull(),
    revenueUsd: numeric("revenue_usd", { precision: 18, scale: 8 }).notNull(),
    status: text("status").notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
    billable: boolean("billable").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("usage_events_workspace_external_uidx").on(
      table.workspaceId,
      table.externalEventId,
    ),
    uniqueIndex("usage_events_workspace_idempotency_uidx").on(
      table.workspaceId,
      table.idempotencyKey,
    ),
    index("usage_events_workspace_time_idx").on(
      table.workspaceId,
      table.occurredAt,
    ),
    index("usage_events_workspace_feature_idx").on(
      table.workspaceId,
      table.feature,
    ),
    index("usage_events_workspace_customer_idx").on(
      table.workspaceId,
      table.customerId,
    ),
  ],
);

export const routingPolicies = pgTable(
  "routing_policies",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    feature: text("feature").notNull(),
    fromModel: text("from_model").notNull(),
    toModel: text("to_model").notNull(),
    trafficShareBps: integer("traffic_share_bps").notNull(),
    qualityFloorBps: integer("quality_floor_bps").notNull(),
    expectedMonthlySavingsCents: bigint("expected_monthly_savings_cents", {
      mode: "number",
    }).notNull(),
    expectedMarginLiftBps: integer("expected_margin_lift_bps").notNull(),
    status: policyStatus("status").notNull().default("proposed"),
    risk: text("risk").notNull().default("low"),
    simulationEvidence: jsonb("simulation_evidence")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    rollbackConditions: jsonb("rollback_conditions")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    proposedBy: text("proposed_by").notNull().default("margin-agent"),
    approvedBy: text("approved_by"),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    activatedAt: timestamp("activated_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("routing_policies_workspace_status_idx").on(
      table.workspaceId,
      table.status,
    ),
  ],
);

export const auditLog = pgTable(
  "audit_log",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    actorId: text("actor_id").notNull(),
    actorType: text("actor_type").notNull(),
    action: text("action").notNull(),
    targetType: text("target_type").notNull(),
    targetId: text("target_id").notNull(),
    status: auditStatus("status").notNull().default("verified"),
    evidence: jsonb("evidence")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    ipHash: text("ip_hash"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("audit_log_workspace_time_idx").on(
      table.workspaceId,
      table.createdAt,
    ),
  ],
);

export const meterFlushes = pgTable(
  "meter_flushes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    periodStart: timestamp("period_start", { withTimezone: true }).notNull(),
    periodEnd: timestamp("period_end", { withTimezone: true }).notNull(),
    eventCount: integer("event_count").notNull(),
    billableUnits: bigint("billable_units", { mode: "number" }).notNull(),
    amountCents: bigint("amount_cents", { mode: "number" }).notNull(),
    sourceWatermark: text("source_watermark").notNull(),
    stripeMeterEventId: text("stripe_meter_event_id"),
    status: meterStatus("status").notNull().default("pending"),
    errorMessage: text("error_message"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    reconciledAt: timestamp("reconciled_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("meter_flushes_watermark_uidx").on(
      table.workspaceId,
      table.sourceWatermark,
    ),
    index("meter_flushes_workspace_status_idx").on(
      table.workspaceId,
      table.status,
    ),
  ],
);

export const webhookEvents = pgTable(
  "webhook_events",
  {
    id: text("id").primaryKey(),
    provider: text("provider").notNull(),
    type: text("type").notNull(),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
    processed: boolean("processed").notNull().default(false),
    processingError: text("processing_error"),
    receivedAt: timestamp("received_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    processedAt: timestamp("processed_at", { withTimezone: true }),
  },
  (table) => [index("webhook_events_processed_idx").on(table.processed)],
);

export const rateLimitBuckets = pgTable(
  "rate_limit_buckets",
  {
    key: text("key").primaryKey(),
    windowStartedAt: timestamp("window_started_at", {
      withTimezone: true,
    }).notNull(),
    requestCount: integer("request_count").notNull().default(1),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("rate_limit_buckets_updated_idx").on(table.updatedAt)],
);
