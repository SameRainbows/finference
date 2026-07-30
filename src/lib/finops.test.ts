import { describe, expect, it } from "vitest";
import { applyPolicy, signEventPayload, summarize } from "./finops";
import type { RoutingPolicy, UsageEvent } from "./finops";

const events: UsageEvent[] = [
  {
    id: "evt_1",
    occurredAt: "2026-07-30T10:00:00.000Z",
    workspaceId: "ws_1",
    customerId: "cus_1",
    feature: "Support copilot",
    provider: "Anthropic",
    model: "claude-sonnet-4.5",
    inputTokens: 100,
    outputTokens: 50,
    latencyMs: 1000,
    costUsd: 4,
    revenueUsd: 10,
    status: "ok",
  },
  {
    id: "evt_2",
    occurredAt: "2026-07-30T10:01:00.000Z",
    workspaceId: "ws_1",
    customerId: "cus_2",
    feature: "Support copilot",
    provider: "Anthropic",
    model: "claude-sonnet-4.5",
    inputTokens: 100,
    outputTokens: 50,
    latencyMs: 2000,
    costUsd: 4,
    revenueUsd: 10,
    status: "error",
  },
];

const policy: RoutingPolicy = {
  id: "pol_1",
  name: "Efficient support",
  fromModel: "claude-sonnet-4.5",
  toModel: "gemini-3-flash",
  feature: "Support copilot",
  trafficShare: 0.5,
  qualityFloor: 0.94,
  expectedMonthlySavings: 100,
  expectedMarginLift: 10,
  risk: "low",
};

describe("summarize", () => {
  it("calculates revenue, cost, margin, error rate, and p95 latency", () => {
    expect(summarize(events)).toEqual({
      revenue: 20,
      cost: 8,
      grossProfit: 12,
      grossMargin: 60,
      requests: 2,
      errorRate: 50,
      p95LatencyMs: 2000,
    });
  });

  it("handles an empty event window without NaN", () => {
    expect(summarize([])).toEqual({
      revenue: 0,
      cost: 0,
      grossProfit: 0,
      grossMargin: 0,
      requests: 0,
      errorRate: 0,
      p95LatencyMs: 0,
    });
  });
});

describe("applyPolicy", () => {
  it("routes only the configured share and reduces cost and latency", () => {
    const routed = applyPolicy(events, policy);
    expect(routed.filter((event) => event.model === "gemini-3-flash")).toHaveLength(
      1,
    );
    expect(routed[0].costUsd).toBeCloseTo(1.28);
    expect(routed[0].latencyMs).toBe(710);
    expect(routed[1]).toEqual(events[1]);
  });

  it("does not mutate source events", () => {
    applyPolicy(events, policy);
    expect(events[0].model).toBe("claude-sonnet-4.5");
    expect(events[0].costUsd).toBe(4);
  });
});

describe("signEventPayload", () => {
  it("is deterministic and secret-specific", () => {
    const first = signEventPayload('{"event":"x"}', "secret-a");
    expect(first).toBe(signEventPayload('{"event":"x"}', "secret-a"));
    expect(first).not.toBe(signEventPayload('{"event":"x"}', "secret-b"));
    expect(first).toMatch(/^fnv1a=[0-9a-f]{8}$/);
  });
});

