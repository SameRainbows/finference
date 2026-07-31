# Finference

**The AI margin control plane.** Finference connects model cost to customer
revenue, finds margin leaks, proposes quality-bounded routing policies, and
turns AI usage into billable units with a complete audit trail.

Built as original work for **Galuxium Nexus V2 (2026)**.

[Live demo](https://finference-ai.vercel.app) ·
[Demo video](https://finference-ai.vercel.app/demo) ·
[Architecture](docs/ARCHITECTURE.md) ·
[Security model](docs/SECURITY.md) ·
[Devpost submission](docs/DEVPOST.md)

![Finference margin agent dashboard](public/screenshots/dashboard.png)

## Why this exists

AI SaaS businesses see ARR immediately but often discover inference COGS weeks
later in a blended provider invoice. That makes it hard to answer:

- Which customer and feature actually created this cost?
- Which routes are below the company’s gross-margin target?
- Can a cheaper model preserve the required quality and latency?
- Who approved a routing change, and what automatically rolls it back?
- How does raw provider usage become a transparent customer invoice?

Finference closes this loop in real time.

## Product workflow

1. **Observe** — Normalize cost, revenue, tokens, latency, model, feature, and
   customer into a signed economic event.
2. **Diagnose** — Calculate contribution margin at model, feature, customer,
   and workspace level.
3. **Recommend** — Use a persistent workspace thread and the Backboard adapter
   (when credentialed) to propose routing changes.
4. **Simulate** — Replay historical traffic and enforce quality, latency, and
   error-rate floors.
5. **Approve** — Require a human decision with bounded blast radius and
   deterministic rollback.
6. **Monetize** — Convert usage into customer-facing units and flush meters to
   Stripe.

## Live demo path

Two evaluation paths are available:

1. `/dashboard` is a credential-free product tour.
2. `/auth/sign-in` offers one-click judge access to a real authenticated
   workspace backed by Neon Postgres.
3. In `/app`, approve a proposed policy, reload to prove persistence, create a
   hashed ingestion API key, ingest a durable test event, and aggregate a meter
   batch.
4. Use **Reset judge workspace** to restore the repeatable evaluation scenario.
5. Review the $2,864/month opportunity: baseline cost is $13,751 on $28,500
   revenue (51.8% margin); the protected route lowers cost to $10,887 and raises
   margin to 61.8%.

## Architecture

```mermaid
flowchart LR
    SDK["Signed SDK / OTEL adapter"] -->|HMAC + idempotency| EDGE["Ingestion edge"]
    EDGE --> BUS["Partitioned event bus"]
    BUS --> LEDGER["Append-only cost ledger"]
    LEDGER --> MART["Margin materializations"]
    MART --> AGENT["Backboard margin agent"]
    AGENT --> SIM["Policy simulator"]
    SIM --> GATE["Human approval gate"]
    GATE --> ROUTER["Runtime model router"]
    ROUTER --> MONITOR["Quality + latency monitor"]
    MONITOR -->|rollback| ROUTER
    LEDGER --> METER["Usage meter"]
    METER --> STRIPE["Stripe Billing"]
    GATE --> AUDIT["Immutable audit evidence"]
```

The repository contains a deployable production MVP of this architecture:

- Next.js control plane and public product surface
- Managed Neon Auth sessions and tenant-scoped workspaces
- Neon Postgres ledger, policies, API keys, audit evidence, meters, and webhooks
- Strictly validated, HMAC-authenticated ingestion endpoint
- Hashed workspace API keys, persistent rate limits, and idempotency protection
- Provider-neutral economic event model
- Deterministic policy simulator and unit-economics engine
- Backboard REST adapter with durable workspace thread bindings
- Stripe Checkout, Billing Meter, webhook, and durable meter-flush adapters
- RBAC-gated policy approval with atomic state transitions
- Unit tests for finance, metering, signatures, rate limits, and policy states

### Deployment truth table

| Capability | Hosted status |
| --- | --- |
| Neon Postgres ledger | **Live** |
| Neon Auth + persistent sessions | **Live** |
| Workspace/API-key ingestion | **Live** |
| Policy approval + audit evidence | **Live** |
| Durable usage-meter aggregation | **Live** |
| Backboard external calls | Adapter-ready; requires a Backboard account key |
| Stripe Checkout/meter submission | Adapter-ready; requires Stripe credentials |

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for scaling, storage, and
failure-mode details.

## Economic event schema

```json
{
  "eventId": "evt_48291",
  "occurredAt": "2026-07-30T14:32:08.000Z",
  "workspaceId": "ws_aurora",
  "customerId": "cus_northstar",
  "feature": "support_copilot",
  "provider": "anthropic",
  "model": "claude-sonnet-4.5",
  "inputTokens": 1840,
  "outputTokens": 612,
  "latencyMs": 1284,
  "costUsd": 0.021,
  "revenueUsd": 0.049,
  "status": "ok"
}
```

The schema intentionally uses opaque customer IDs and does **not** require
prompts, completions, emails, or end-user PII.

## Tech stack

| Layer | Choice | Reason |
| --- | --- | --- |
| Web/control plane | Next.js 16, React 19, TypeScript | Server routes, static product pages, fast deployment |
| Design | Tailwind CSS 4, Lucide, Recharts | Consistent system and responsive data visualization |
| Database | Neon Postgres + Drizzle ORM | Durable multi-tenant economic ledger and indexed control-plane state |
| Authentication | Neon Auth | Managed user sessions and protected workspace routes |
| Validation | Zod | Boundary validation and explicit contracts |
| Agent memory | Backboard adapter | Persistent preferences and cross-run decision context when credentialed |
| Billing | Stripe Checkout + Billing Meters | Subscription and usage-based monetization adapter |
| Tests | Vitest + V8 coverage | Fast deterministic unit testing |
| Deployment | Vercel | Edge delivery, server functions, preview deployments |

## Local setup

Requirements: Node.js 20.19+, 22.13+, or 24+ and npm.

```bash
git clone https://github.com/SameRainbows/finference.git
cd finference
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

The public tour works without credentials. The persistent app requires Neon
Postgres/Auth. Backboard and Stripe credentials activate their external calls;
without them, the app preserves durable state and reports `adapter-ready`
instead of simulating a third-party success.

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_APP_URL` | Production | Canonical deployment URL |
| `DATABASE_URL` | Persistent app | Pooled Neon Postgres connection |
| `DATABASE_URL_UNPOOLED` | Migrations | Direct Neon Postgres connection |
| `NEON_AUTH_BASE_URL` | Persistent app | Managed Neon Auth endpoint |
| `NEON_AUTH_COOKIE_SECRET` | Persistent app | Session cookie encryption |
| `FINFERENCE_INGEST_SECRET` | Production | HMAC-SHA256 event authentication |
| `DEMO_USER_EMAIL` | Optional | One-click judge account |
| `DEMO_USER_PASSWORD` | Optional | Server-only judge credential |
| `BACKBOARD_API_KEY` | Optional | Live persistent-memory margin agent |
| `BACKBOARD_ASSISTANT_ID` | Optional | Reuse a configured FinOps assistant |
| `BACKBOARD_LLM_PROVIDER` | Optional | Backboard model provider |
| `BACKBOARD_MODEL_NAME` | Optional | Backboard model name |
| `STRIPE_SECRET_KEY` | Optional | Stripe test/live API key |
| `STRIPE_WEBHOOK_SECRET` | Optional | Signed Stripe webhook verification |

## Verification

```bash
npm run lint
npm run test:coverage
npm run db:check
npm run build
npm audit
```

The pure financial, metering, policy-state, and signature/rate-limit modules
currently report 95%+ statement coverage with enforced CI thresholds.

## API examples

### Health

```bash
curl http://localhost:3000/api/health
```

### Signed ingestion

```bash
BODY='{"eventId":"evt_demo_001","occurredAt":"2026-07-30T14:32:08.000Z","workspaceSlug":"your-workspace-slug","customerId":"cus_demo","feature":"support_copilot","provider":"anthropic","model":"claude-sonnet-4.5","inputTokens":1000,"outputTokens":400,"latencyMs":940,"costUsd":0.021,"revenueUsd":0.049,"status":"ok"}'
SIGNATURE="sha256=$(printf '%s' "$BODY" | openssl dgst -sha256 -hmac "$FINFERENCE_INGEST_SECRET" -hex | sed 's/^.* //')"
curl -X POST http://localhost:3000/api/ingest \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: evt_demo_001" \
  -H "X-Finference-Signature: $SIGNATURE" \
  -d "$BODY"
```

## Monetization

- **Growth — $49/month:** 1M events, margin explorer, Stripe meter exports.
- **Scale — $249/month:** 10M events, memory-backed agent, simulation,
  approvals, rollback, long-term evidence.
- **Enterprise:** annual platform fee plus usage, SSO/SCIM, dedicated region,
  custom retention, and data-warehouse export.

The product’s own billing adapter demonstrates the same monetization mechanics
it helps customers implement.

## Security and governance

- HMAC-SHA256 ingestion and timing-safe verification
- Idempotency keys and replay-safe handling
- Strict schema and bounded values at the public boundary
- Opaque customer identifiers; no prompt/completion requirement
- Tenant-scoped architecture and least-privilege approval model
- Human-in-the-loop policy deployment
- Quality, latency, and error-rate rollback conditions
- Server-only provider and billing secrets
- Append-only evidence model for changes and approvals

See [`docs/SECURITY.md`](docs/SECURITY.md).

## License

MIT. See [`LICENSE`](LICENSE).
