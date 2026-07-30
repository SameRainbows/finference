# Security and governance

## Threat model

Finference assumes economic events can be forged, duplicated, replayed,
malformed, or accidentally associated with the wrong tenant. It also assumes
that optimization recommendations can create financial or quality harm if
deployed without guardrails.

## Boundary controls

- HMAC-SHA256 signatures over the exact request body
- timing-safe signature comparison
- strict Zod schema validation and bounded field lengths
- idempotency keys and duplicate acknowledgement
- WAF/rate-limit boundary in the production topology
- opaque customer identifiers instead of prompt/completion content

## Data minimization

Required data is operational and economic: model, tokens, latency, cost,
revenue, feature, opaque customer ID, and status. Prompt and completion bodies
are not required and should not be sent.

## Access

Production roles:

- **Viewer:** metrics and read-only evidence
- **Analyst:** simulation and draft policies
- **Approver:** deploy and rollback within assigned workspace
- **Billing admin:** plan, meter, and invoice configuration
- **Owner:** membership, secrets, and organization policy

Privileged operations require recent authentication and are written to the
append-only audit ledger.

## Responsible automation

Every policy contains:

- explicit model and traffic scope,
- maximum traffic share,
- quality and latency floors,
- simulation dataset watermark,
- expected savings and confidence,
- named approver,
- automatic rollback conditions,
- immutable version identifier.

The agent proposes; a human disposes. Autonomous rollback is allowed because it
returns traffic to the previously approved safe version.

## Secrets

Backboard, Stripe, database, and signing credentials are server-only
environment variables. They are excluded from client bundles and telemetry.
Production environments should source them from the hosting platform’s
encrypted secret store with rotation and least-privilege keys.

## Privacy and compliance posture

The architecture supports SOC 2-aligned logical access, change management,
availability monitoring, and audit evidence. Regional deployment, configurable
retention, data export/deletion, and subprocessor documentation are required
before claiming formal certification or regulatory compliance.

