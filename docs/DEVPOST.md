# Devpost submission draft

## Project name

Finference

## Links

- Live product: https://finference-ai.vercel.app
- Demo video: https://finference-ai.vercel.app/demo
- Public repository: https://github.com/SameRainbows/finference

## Tagline

The AI margin control plane—observe, optimize, govern, and bill every inference.

## Inspiration

AI SaaS companies can see revenue in real time, but inference costs arrive later
as blended provider invoices. Teams scale usage without knowing which customer,
feature, or model route is profitable. We built Finference to make AI unit
economics operational—not a month-end spreadsheet.

## What it does

Finference turns every model request into an economic event containing cost,
revenue, tokens, latency, feature, and customer. It exposes contribution margin
at every useful level, detects unprofitable routes, and uses a
persistent-memory AI FinOps agent to propose safer alternatives.

Before a change reaches production, Finference replays historical traffic,
checks a quality floor, limits blast radius, requires human approval, and
defines automatic rollback conditions. The same ledger converts usage into
customer-facing units for Stripe billing.

The live demo starts with a support copilot at 52% margin. Judges can inspect a
$2,864/month recommendation, review evidence and rollback rules, approve it,
and watch gross margin rise to 61.8% while the audit trail updates.

## How we built it

- Next.js 16, React 19, TypeScript, and Tailwind CSS for the control plane
- Recharts for economic telemetry
- Zod for strict public-boundary validation
- HMAC-SHA256 and idempotency keys for safe event ingestion
- A deterministic policy simulator and unit-economics engine
- Backboard’s threads/messages API with persistent memory for the margin agent
- Stripe Checkout/Billing adapter for subscription and usage monetization
- Vitest for financial and routing-policy correctness
- Vercel for the production deployment

## Challenges

The hardest design problem was preventing “AI optimization” from becoming an
unsafe black box. Cost reduction alone is easy; preserving quality, explaining
the decision, limiting traffic, recording approval, and defining rollback
conditions required a full control loop.

We also separated the immutable financial ledger from analytical projections so
billing correctness does not depend on charts or eventual aggregates.

## Accomplishments

- A polished end-to-end workflow that materially changes live dashboard state
- A provider-neutral event model tied to both cost and revenue
- Persistent decision memory instead of a stateless LLM wrapper
- Human-governed model routing with offline simulation and automatic rollback
- Functional Stripe and Backboard adapters with safe credential-free demo modes
- Signed, idempotent ingestion and a documented scale-out topology
- Responsive product, pricing, security, tests, and reproducible deployment

## What we learned

AI FinOps becomes much more powerful when it is connected to revenue rather
than cost alone. The correct optimization target is contribution margin under a
quality constraint, not simply the cheapest token.

## What is next

1. OpenTelemetry and provider SDK auto-instrumentation
2. PostgreSQL/Kafka ledger and ClickHouse margin projections
3. Online quality evaluators and canary routing
4. Stripe meter reconciliation and invoice previews
5. SSO/SCIM, regional data residency, and warehouse exports
6. Customer-specific SLA and margin policies learned through Backboard memory

## Built with

next.js, react, typescript, tailwind-css, recharts, zod, backboard, stripe,
vercel, vitest
