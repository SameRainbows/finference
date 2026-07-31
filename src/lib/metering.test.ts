import { describe, expect, it } from "vitest";
import {
  calculateBillableUnits,
  createMeterWatermark,
  projectMargin,
} from "./metering";

describe("calculateBillableUnits", () => {
  it("rounds aggregate token usage up to the next economic unit", () => {
    expect(
      calculateBillableUnits([
        { inputTokens: 1_200, outputTokens: 300 },
        { inputTokens: 400, outputTokens: 100 },
      ]),
    ).toEqual({ totalTokens: 2_000, units: 2 });
    expect(
      calculateBillableUnits([{ inputTokens: 1_001, outputTokens: 0 }]),
    ).toEqual({ totalTokens: 1_001, units: 2 });
  });

  it("never bills negative or empty usage", () => {
    expect(
      calculateBillableUnits([{ inputTokens: -10, outputTokens: -20 }]),
    ).toEqual({ totalTokens: 0, units: 0 });
  });
});

describe("projectMargin", () => {
  it("keeps revenue, cost, profit, and margin mathematically consistent", () => {
    const result = projectMargin({
      revenue: 28_500,
      cost: 13_751,
      savings: 2_864,
    });
    expect(result.cost).toBe(10_887);
    expect(result.grossProfit).toBe(17_613);
    expect(result.grossMargin).toBeCloseTo(61.8, 1);
  });
});

describe("createMeterWatermark", () => {
  it("is deterministic for the same last persisted event", () => {
    const event = {
      occurredAt: new Date("2026-07-31T10:00:00.000Z"),
      externalEventId: "evt_123",
    };
    expect(createMeterWatermark(event)).toBe(
      "2026-07-31T10:00:00.000Z:evt_123",
    );
    expect(createMeterWatermark(event)).toBe(createMeterWatermark(event));
    expect(createMeterWatermark(null)).toBe("empty");
  });
});
