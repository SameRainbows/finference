# Security and governance

## Threat model

Finference assumes economic events can be forged, duplicated, replayed,
malformed, or associated with the wrong tenant. It also assumes that routing
recommendations and billing operations can create financial harm if they are
not role-gated, idempotent, and auditable.

## Implemented controls

### Identity and tenant isolation

- Managed Neon Auth sessions protect `/app` and authenticated APIs.
- Every durable business record is scoped to a workspace.
- Membership roles are persisted in Postgres.
- Policy activation, API-key creation, and meter submission require owner or
  admin authority.

### Ingestion

- Workspace API keys are random and shown once.
- Only SHA-256 key digests and short prefixes are persisted.
- HMAC-SHA256 signatures are compared with a timing-safe primitive.
- Zod schemas bound field types, lengths, token counts, latency, and money.
- Postgres uniqueness constraints enforce event and idempotency identity.
- Per-credential rate-limit buckets survive serverless instance changes.

### Policy safety

- The agent proposes; an authorized human activates.
- Atomic state transitions prevent repeat approval races.
- Policy evidence includes quality, latency, sample size, and expected savings.
- Every activation records actor, target, policy scope, and rollback predicates.
- Terminal policies cannot be silently resurrected.

### Billing and webhooks

- Meter batches use deterministic source watermarks.
- Concurrent meter creation is resolved by a unique database constraint.
- Stripe webhooks require a valid Stripe signature before persistence.
- Webhook IDs are durable and claimed atomically to prevent replay processing.
- Failed webhook claims are released for provider retry.
- Stripe and Backboard secrets remain server-only.

## Data minimization

Required event data is operational and economic: model, tokens, latency, cost,
revenue, feature, opaque customer ID, and status. Prompt text, completion text,
emails, and end-user PII are not required and should not be sent.

## Secrets

Database, auth-cookie, ingestion, Backboard, Stripe, and judge-access
credentials are environment variables excluded from source control. Production
values are stored in Vercel's encrypted environment configuration.

The public health route exposes only capability states (`live`,
`adapter-ready`, or `unavailable`), never credential values.

## Dependency and delivery controls

- CI runs lint, unit tests, Drizzle schema checks, a production build, and
  `npm audit`.
- The verified dependency audit currently reports zero known vulnerabilities.
- Database migrations are versioned under `drizzle/`.
- The load harness uses an ephemeral API key and removes synthetic rows after
  verification.

## Compliance posture

The architecture supports controls commonly needed for SOC 2 readiness:
logical access, change evidence, tenant isolation, audit records, availability
checks, and secret management. Finference does **not** claim formal SOC 2,
HIPAA, PCI DSS, or GDPR certification. Formal certification would additionally
require organizational controls, retention policy, incident response, vendor
management, and independent assessment.
