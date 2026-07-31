import "server-only";
import Stripe from "stripe";

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

const planConfig = {
  growth: { amount: 4_900, name: "Finference Growth" },
  scale: { amount: 24_900, name: "Finference Scale" },
} as const;

export const FINFERENCE_METER_EVENT = "finference_economic_units";

async function getOrCreateMeter(client: Stripe) {
  const meters = await client.billing.meters.list({ limit: 100 });
  const existing = meters.data.find(
    (meter) => meter.event_name === FINFERENCE_METER_EVENT,
  );
  if (existing) return existing;

  return client.billing.meters.create({
    display_name: "Finference economic units",
    event_name: FINFERENCE_METER_EVENT,
    default_aggregation: { formula: "sum" },
    customer_mapping: {
      type: "by_id",
      event_payload_key: "stripe_customer_id",
    },
    value_settings: { event_payload_key: "value" },
  });
}

async function getOrCreatePrice(
  client: Stripe,
  input: {
    lookupKey: string;
    name: string;
    amount: number;
    meterId?: string;
  },
) {
  const existing = await client.prices.list({
    active: true,
    lookup_keys: [input.lookupKey],
    limit: 1,
  });
  if (existing.data[0]) return existing.data[0];

  return client.prices.create({
    currency: "usd",
    unit_amount: input.amount,
    lookup_key: input.lookupKey,
    product_data: {
      name: input.name,
      metadata: { product: "finference" },
    },
    recurring: input.meterId
      ? {
          interval: "month",
          usage_type: "metered",
          meter: input.meterId,
        }
      : { interval: "month", usage_type: "licensed" },
    metadata: {
      product: "finference",
      component: input.meterId ? "metered-usage" : "platform",
    },
  });
}

export async function ensureStripeCatalog(
  plan: keyof typeof planConfig,
  client = stripe,
) {
  if (!client) throw new Error("Stripe is not configured");
  const config = planConfig[plan];
  const meter = await getOrCreateMeter(client);
  const [basePrice, meteredPrice] = await Promise.all([
    getOrCreatePrice(client, {
      lookupKey: `finference_${plan}_monthly_v1`,
      name: config.name,
      amount: config.amount,
    }),
    getOrCreatePrice(client, {
      lookupKey: "finference_economic_units_v1",
      name: "Finference economic units",
      amount: 1,
      meterId: meter.id,
    }),
  ]);

  return { meter, basePrice, meteredPrice };
}

