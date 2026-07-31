import { createHash, randomBytes } from "node:crypto";
import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required");

const baseUrl = process.env.LOAD_TEST_URL ?? "http://localhost:3000";
const requests = Number(process.env.LOAD_TEST_REQUESTS ?? 100);
const concurrency = Number(process.env.LOAD_TEST_CONCURRENCY ?? 20);
const sql = neon(databaseUrl);

const [workspace] =
  await sql`select id, slug from workspaces order by created_at asc limit 1`;
if (!workspace) throw new Error("Create a workspace before running load tests");

const key = `fin_live_${randomBytes(24).toString("base64url")}`;
const keyHash = createHash("sha256").update(key).digest("hex");
const prefix = key.slice(0, 14);
const [keyRecord] = await sql`
  insert into workspace_api_keys (workspace_id, name, prefix, key_hash)
  values (${workspace.id}, 'Ephemeral load test', ${prefix}, ${keyHash})
  returning id
`;

const latencies = [];
let succeeded = 0;
let failed = 0;
const startedAt = performance.now();
let next = 0;

async function worker(workerId) {
  while (next < requests) {
    const index = next++;
    const eventId = `evt_load_${Date.now()}_${workerId}_${index}`;
    const body = {
      eventId,
      occurredAt: new Date().toISOString(),
      customerId: `cus_load_${index % 20}`,
      feature: "Load verification",
      provider: "Load harness",
      model: "synthetic-model",
      inputTokens: 1_200 + (index % 800),
      outputTokens: 300 + (index % 200),
      latencyMs: 500 + (index % 300),
      costUsd: 0.006,
      revenueUsd: 0.049,
      status: "ok",
      metadata: { loadTest: true, sequence: index },
    };
    const requestStarted = performance.now();
    try {
      const response = await fetch(`${baseUrl}/api/ingest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Finference-Key": key,
          "Idempotency-Key": eventId,
        },
        body: JSON.stringify(body),
      });
      latencies.push(performance.now() - requestStarted);
      if (response.status === 202) succeeded += 1;
      else {
        failed += 1;
        await response.text();
      }
    } catch {
      latencies.push(performance.now() - requestStarted);
      failed += 1;
    }
  }
}

await Promise.all(
  Array.from({ length: concurrency }, (_, index) => worker(index)),
);
const durationMs = performance.now() - startedAt;

await sql`update workspace_api_keys set revoked_at=now() where id=${keyRecord.id}`;

latencies.sort((a, b) => a - b);
const percentile = (value) =>
  latencies[Math.min(latencies.length - 1, Math.ceil(latencies.length * value) - 1)] ??
  0;
const [persisted] = await sql`
  select count(*)::int as count
  from usage_events
  where metadata->>'loadTest' = 'true'
    and created_at >= now() - interval '15 minutes'
`;
if (process.env.LOAD_TEST_RETAIN !== "true") {
  await sql`
    delete from usage_events
    where metadata->>'loadTest' = 'true'
      and created_at >= now() - interval '15 minutes'
  `;
}

const result = {
  target: baseUrl,
  requests,
  concurrency,
  succeeded,
  failed,
  persisted: persisted.count,
  retained: process.env.LOAD_TEST_RETAIN === "true",
  durationMs: Number(durationMs.toFixed(1)),
  requestsPerSecond: Number((requests / (durationMs / 1_000)).toFixed(2)),
  latencyMs: {
    p50: Number(percentile(0.5).toFixed(1)),
    p95: Number(percentile(0.95).toFixed(1)),
    p99: Number(percentile(0.99).toFixed(1)),
    max: Number((latencies.at(-1) ?? 0).toFixed(1)),
  },
  rateLimit: "120 requests/minute per API key",
  verifiedAt: new Date().toISOString(),
};

console.log(JSON.stringify(result, null, 2));
if (failed > 0 || persisted < succeeded) process.exitCode = 1;
