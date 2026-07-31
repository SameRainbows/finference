# Devpost submission draft

## Project name

Finference

## Links

- Live product: https://finference-ai.vercel.app
- Persistent judge workspace: https://finference-ai.vercel.app/auth/sign-in
- Demo video: https://finference-ai.vercel.app/demo
- Public repository: https://github.com/SameRainbows/finference

## Tagline

The AI margin control plane—observe, optimize, govern, and bill every inference.

## Inspiration

AI SaaS teams see revenue immediately, while inference COGS arrive later in a
blended provider invoice. A product can grow quickly while its best customer or
most popular feature quietly destroys gross margin. Existing observability
tools explain latency and errors; cost dashboards explain spend. Neither closes
the loop from a model request to customer revenue, a governed routing decision,
and a billable unit.

We built Finference to make AI unit economics operational rather than a
month-end spreadsheet.

## What it does

Finference converts every model request into a tenant-scoped economic event:
cost, attributed revenue, tokens, latency, feature, model, customer, and status.
It calculates contribution margin, identifies unprofitable routes, and proposes
a lower-cost alternative under explicit quality and latency constraints.

Before a policy can activate, Finference stores simulation evidence, limits the
traffic share, requires an authorized human, and records deterministic rollback
conditions. The same authoritative ledger becomes the source for usage billing.

The persistent judge flow is fully operational:

1. enter a real Neon Auth session;
2. open the Aurora Labs workspace persisted in Neon Postgres;
3. inspect a $2,864/month routing opportunity;
4. activate the policy through an RBAC-gated state transition;
5. reload and see the decision and audit evidence persist;
6. create a one-time workspace API key whose plaintext is never stored;
7. ingest a durable economic event;
8. aggregate new ledger events into an idempotent billing-meter batch.

The baseline is $28,500 revenue and $13,751 inference cost, or 51.8% gross
margin. The protected route lowers cost to $10,887, raises gross profit to
$17,613, and reaches 61.8% margin.

## How we built it

- Next.js 16, React 19, TypeScript, Tailwind CSS, and Recharts
- Neon Postgres with Drizzle ORM and versioned SQL migrations
- Neon Auth for managed sessions and protected workspace routes
- Workspace-scoped membership, API keys, events, policies, audit evidence,
  meter flushes, webhook events, and rate-limit buckets
- SHA-256 API-key digests, HMAC-SHA256 ingestion, timing-safe verification,
  Zod boundary validation, and Postgres idempotency constraints
- Atomic policy state transitions and owner/admin approval gates
- A deterministic unit-economics and policy-simulation engine
- Backboard assistant/thread integration with durable workspace bindings
- Stripe catalog, Checkout, Billing Meter, signed webhook, and meter-event
  adapters
- Vitest, ESLint, Drizzle schema checks, production builds, dependency audit,
  GitHub Actions, and a concurrent ingestion harness
- Vercel for the production application and Neon integration

## Architecture and scalability

Neon Postgres is the financial and control-plane authority. Every core row is
tenant-scoped. Composite indexes cover event identity, idempotency, time,
feature, customer, policy status, and meter watermarks. Database uniqueness,
not server memory, resolves concurrent duplicates.

The hosted app persists real auth sessions, policies, audit entries, API-key
digests, usage events, rate-limit counts, and meter batches. A verified
100-request / concurrency-20 run persisted all 100 events with zero failures.
The documented scale path introduces a partitioned event stream and ClickHouse
analytics while retaining Postgres as the billing authority.

## Enterprise governance and security

- Managed authentication and protected server routes
- Tenant foreign keys and role-aware privileged operations
- One-time API-key display with SHA-256-only storage
- HMAC authentication and timing-safe comparison
- Strict bounded event schemas
- Persistent per-credential rate limiting
- Database-enforced idempotency and replay-safe webhooks
- Human approval, evidence, traffic scope, and rollback predicates
- Server-only secrets and zero known dependency vulnerabilities
- No prompt/completion body or end-user PII required

We describe this as security-ready architecture, not as a formal compliance
certification.

## Monetization

Finference is itself a recurring-revenue SaaS:

- Growth: $49/month for 1M events and margin analytics
- Scale: $249/month for 10M events, policy simulation, approvals, and memory
- Enterprise: annual platform fee plus usage, SSO/SCIM, dedicated region,
  retention controls, and warehouse export
- Usage component: one economic unit per 1,000 metered tokens

The Stripe implementation creates monthly prices and a Billing Meter, starts
subscription Checkout, validates signed webhooks, provisions workspace billing
state, and submits durable meter events. The public deployment honestly reports
Stripe as `adapter-ready` until external Stripe credentials are installed; it
never simulates a successful payment.

## Backboard integration

Finference stores a Backboard assistant and thread binding per workspace and
sends margin context with memory enabled. This lets the agent remember accepted
quality floors, customer exceptions, operator risk preferences, and prior
decisions. Backboard stays outside the ingestion hot path.

The public deployment honestly reports Backboard as `adapter-ready` until a
Backboard account key is installed. The complete live path is present in the
repository without claiming an external call that did not happen.

## Challenges

The hardest problem was preventing “AI optimization” from becoming an unsafe
black box. Cost reduction is easy; preserving quality, proving the economics,
limiting blast radius, enforcing authorization, surviving concurrent requests,
and retaining billing-grade evidence required a full control loop.

We also separated the immutable event ledger from analytical projections so a
chart, model recommendation, or provider outage cannot rewrite source
economics.

## Accomplishments

- A real authenticated, persistent, multi-tenant product—not a static idea page
- Durable end-to-end state from ingestion through policy and billing
- Financially consistent margin math and a clear ROI narrative
- Secure workspace API keys and serverless-safe rate limiting
- Atomic policy governance and replay-safe provider webhooks
- Stripe and Backboard adapters that degrade truthfully when uncredentialed
- Public deployment, reproducible migrations, CI, tests, load evidence, and
  professional architecture/security documentation

## What we learned

AI FinOps becomes more useful when it connects cost to revenue. The correct
optimization target is contribution margin under a quality constraint—not the
cheapest token. We also learned that product credibility comes from the
unexciting details: identity, persistence, idempotency, permissions, webhook
replay handling, and honest capability reporting.

## What is next

1. OpenTelemetry and provider SDK auto-instrumentation
2. Online quality evaluators and canary traffic enforcement
3. Runtime policy distribution and automatic rollback execution
4. Stripe invoice previews and meter reconciliation UI
5. SSO/SCIM, regional residency, retention controls, and warehouse exports
6. Kafka/Redpanda ingestion and ClickHouse high-cardinality analytics

## Built with

next.js, react, typescript, tailwind-css, recharts, neon, postgresql, drizzle,
neon-auth, zod, backboard, stripe, vercel, vitest, github-actions
