export type MeterableEvent = {
  inputTokens: number;
  outputTokens: number;
};

export function createMeterWatermark(
  lastEvent: { occurredAt: Date; externalEventId: string } | null,
) {
  return lastEvent
    ? `${lastEvent.occurredAt.toISOString()}:${lastEvent.externalEventId}`
    : "empty";
}

export function calculateBillableUnits(
  events: MeterableEvent[],
  tokensPerUnit = 1_000,
) {
  if (!Number.isInteger(tokensPerUnit) || tokensPerUnit <= 0) {
    throw new Error("tokensPerUnit must be a positive integer");
  }
  const totalTokens = events.reduce(
    (sum, event) =>
      sum +
      Math.max(0, event.inputTokens) +
      Math.max(0, event.outputTokens),
    0,
  );
  return {
    totalTokens,
    units: totalTokens === 0 ? 0 : Math.ceil(totalTokens / tokensPerUnit),
  };
}

export function projectMargin(input: {
  revenue: number;
  cost: number;
  savings: number;
}) {
  const cost = Math.max(0, input.cost - input.savings);
  const grossProfit = input.revenue - cost;
  return {
    revenue: input.revenue,
    cost,
    grossProfit,
    grossMargin:
      input.revenue === 0 ? 0 : (grossProfit / input.revenue) * 100,
  };
}
