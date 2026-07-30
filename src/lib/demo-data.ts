import type { RoutingPolicy, UsageEvent } from "./finops";

const models = [
  {
    provider: "OpenAI",
    model: "gpt-5.2",
    feature: "Research agent",
    cost: 0.029,
    revenue: 0.061,
    latency: 1840,
  },
  {
    provider: "Anthropic",
    model: "claude-sonnet-4.5",
    feature: "Support copilot",
    cost: 0.021,
    revenue: 0.049,
    latency: 1610,
  },
  {
    provider: "Google",
    model: "gemini-3-flash",
    feature: "Document extraction",
    cost: 0.006,
    revenue: 0.033,
    latency: 780,
  },
  {
    provider: "Backboard",
    model: "memory-pro",
    feature: "Persistent memory",
    cost: 0.009,
    revenue: 0.041,
    latency: 920,
  },
];

export const usageEvents: UsageEvent[] = Array.from({ length: 160 }, (_, i) => {
  const model = models[i % models.length];
  const multiplier = 0.7 + ((i * 17) % 61) / 100;
  return {
    id: `evt_${String(i + 1).padStart(5, "0")}`,
    occurredAt: new Date(Date.now() - i * 11 * 60 * 1000).toISOString(),
    workspaceId: "ws_aurora",
    customerId: `cus_${["northstar", "hearth", "kinetic", "arc", "nova"][i % 5]}`,
    feature: model.feature,
    provider: model.provider,
    model: model.model,
    inputTokens: Math.round(1400 * multiplier),
    outputTokens: Math.round(620 * multiplier),
    latencyMs: Math.round(model.latency * multiplier),
    costUsd: model.cost * multiplier,
    revenueUsd: model.revenue * multiplier,
    status: i % 47 === 0 ? "error" : "ok",
  };
});

export const recommendedPolicy: RoutingPolicy = {
  id: "pol_margin_01",
  name: "Protect support margin",
  fromModel: "claude-sonnet-4.5",
  toModel: "gemini-3-flash",
  feature: "Support copilot",
  trafficShare: 0.72,
  qualityFloor: 0.94,
  expectedMonthlySavings: 2864,
  expectedMarginLift: 9.8,
  risk: "low",
};

export const marginSeries = [
  { day: "Jul 01", revenue: 790, cost: 510, protected: 430 },
  { day: "Jul 05", revenue: 890, cost: 574, protected: 468 },
  { day: "Jul 09", revenue: 970, cost: 625, protected: 491 },
  { day: "Jul 13", revenue: 1070, cost: 704, protected: 524 },
  { day: "Jul 17", revenue: 1190, cost: 742, protected: 553 },
  { day: "Jul 21", revenue: 1285, cost: 809, protected: 582 },
  { day: "Jul 25", revenue: 1420, cost: 900, protected: 614 },
  { day: "Jul 29", revenue: 1538, cost: 962, protected: 641 },
];

export const modelRows = [
  {
    model: "gpt-5.2",
    provider: "OpenAI",
    requests: 128_430,
    cost: 6120,
    revenue: 9320,
    margin: 34.3,
    latency: 1840,
  },
  {
    model: "claude-sonnet-4.5",
    provider: "Anthropic",
    requests: 96_221,
    cost: 4780,
    revenue: 6610,
    margin: 27.7,
    latency: 1610,
  },
  {
    model: "gemini-3-flash",
    provider: "Google",
    requests: 221_840,
    cost: 1910,
    revenue: 7340,
    margin: 74,
    latency: 780,
  },
  {
    model: "memory-pro",
    provider: "Backboard",
    requests: 81_099,
    cost: 1480,
    revenue: 5230,
    margin: 71.7,
    latency: 920,
  },
];

export const auditEvents = [
  {
    time: "14:32:08",
    actor: "Margin agent",
    action: "Proposed routing policy",
    target: "Support copilot",
    status: "awaiting approval",
  },
  {
    time: "14:18:41",
    actor: "Maya Chen",
    action: "Approved budget guardrail",
    target: "$18k / month",
    status: "verified",
  },
  {
    time: "13:54:17",
    actor: "Stripe webhook",
    action: "Meter flush completed",
    target: "1,284 billable units",
    status: "verified",
  },
  {
    time: "13:40:02",
    actor: "Backboard memory",
    action: "Learned quality preference",
    target: "Northstar workspace",
    status: "verified",
  },
];

