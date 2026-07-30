export type UsageEvent = {
  id: string;
  occurredAt: string;
  workspaceId: string;
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
};

export type MarginSnapshot = {
  revenue: number;
  cost: number;
  grossProfit: number;
  grossMargin: number;
  requests: number;
  errorRate: number;
  p95LatencyMs: number;
};

export type RoutingPolicy = {
  id: string;
  name: string;
  fromModel: string;
  toModel: string;
  feature: string;
  trafficShare: number;
  qualityFloor: number;
  expectedMonthlySavings: number;
  expectedMarginLift: number;
  risk: "low" | "medium" | "high";
};

export function summarize(events: UsageEvent[]): MarginSnapshot {
  const revenue = events.reduce((sum, event) => sum + event.revenueUsd, 0);
  const cost = events.reduce((sum, event) => sum + event.costUsd, 0);
  const grossProfit = revenue - cost;
  const sortedLatency = events
    .map((event) => event.latencyMs)
    .sort((a, b) => a - b);
  const p95Index = Math.max(0, Math.ceil(sortedLatency.length * 0.95) - 1);
  const errors = events.filter((event) => event.status === "error").length;

  return {
    revenue,
    cost,
    grossProfit,
    grossMargin: revenue === 0 ? 0 : (grossProfit / revenue) * 100,
    requests: events.length,
    errorRate: events.length === 0 ? 0 : (errors / events.length) * 100,
    p95LatencyMs: sortedLatency[p95Index] ?? 0,
  };
}

export function applyPolicy(
  events: UsageEvent[],
  policy: RoutingPolicy,
): UsageEvent[] {
  let matched = 0;
  const eligible = events.filter(
    (event) =>
      event.feature === policy.feature && event.model === policy.fromModel,
  ).length;
  const routeCount = Math.round(eligible * policy.trafficShare);

  return events.map((event) => {
    if (
      event.feature !== policy.feature ||
      event.model !== policy.fromModel ||
      matched >= routeCount
    ) {
      return event;
    }

    matched += 1;
    return {
      ...event,
      model: policy.toModel,
      provider: "Backboard Router",
      costUsd: event.costUsd * 0.32,
      latencyMs: Math.round(event.latencyMs * 0.71),
    };
  });
}

export function signEventPayload(payload: string, secret: string) {
  let hash = 2166136261;
  const value = `${secret}:${payload}`;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `fnv1a=${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

