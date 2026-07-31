# Finference demo script

Target duration: 3:00–3:30.

## 0:00–0:20 — Problem and promise

Show the landing page.

> AI SaaS teams can see revenue today, but model costs arrive later in a
> blended invoice. Finference is the margin control plane that connects every
> inference to customer revenue, governs safer model routing, and converts the
> same ledger into billable usage.

## 0:20–0:42 — Real identity and persistence

Open `/auth/sign-in`, click **Enter persistent judge workspace**, and land in
`/app`.

> This is not a static concept page. The judge path creates a real Neon Auth
> session and opens Aurora Labs, a tenant-isolated workspace persisted in Neon
> Postgres.

## 0:42–1:10 — Unit economics

Show the headline metrics and chart.

> Aurora has twenty-eight thousand five hundred dollars in AI revenue and
> thirteen thousand seven hundred fifty-one dollars in inference cost: a
> 51.8-percent margin, below its 60-percent target. Finference attributes that
> gap to the support-copilot route rather than hiding it in a provider total.

## 1:10–1:42 — Evidence and governed activation

Show the recommendation, simulation evidence, quality floor, traffic share, and
rollback conditions. Click **Approve & deploy policy**.

> The recommendation moves bounded low-complexity traffic to a cheaper model,
> but only after replaying ninety-six thousand requests. Quality must remain
> above 94 percent, latency must stay below fifteen hundred milliseconds, and
> provider errors must remain below two percent. Only an owner or admin can
> activate the atomic proposed-to-active transition.

## 1:42–2:02 — Persistence proof

Reload `/app` and show the active policy and audit entry.

> Reloading proves the change is durable. The approver, policy scope, quality
> threshold, traffic share, and rollback predicates are retained as audit
> evidence. Protected cost is ten thousand eight hundred eighty-seven dollars,
> raising gross margin to 61.8 percent.

## 2:02–2:30 — API key and durable ingestion

Create an API key, briefly show the one-time key, then send a test event.

> Operators can issue a workspace ingestion key. The plaintext appears once;
> only its SHA-256 digest and prefix are stored. This test request passes schema
> validation, persistent rate limiting, and database idempotency before joining
> the authoritative economic ledger.

## 2:30–2:55 — Billing meter

Click the meter flush action and show the persisted batch.

> Finference aggregates new ledger events into economic units using a
> deterministic source watermark. The batch remains durable even if Stripe is
> unavailable, and the same flush ID becomes the replay-safe Stripe meter-event
> identifier when credentials are installed.

## 2:55–3:18 — Architecture and honest provider status

Show the integration status and optionally the repository architecture.

> Neon database and authentication are live. The repository also implements
> Backboard workspace threads with memory and Stripe Checkout, Billing Meters,
> signed webhooks, and provisioning. Those external adapters are reported
> honestly as adapter-ready until their account credentials are installed.

## 3:18–3:30 — Close

Return to the dashboard.

> Finference turns AI cost from a delayed surprise into a governed,
> revenue-aware operating loop: observe, optimize, approve, and bill.

After recording, click **Reset judge workspace** so every evaluator starts from
the same proposed-policy state.
