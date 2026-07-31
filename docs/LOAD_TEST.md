# Load verification

## Harness

Run:

```bash
LOAD_TEST_URL=https://finference-ai.vercel.app npm run load:test
```

The harness:

1. creates an ephemeral workspace API key;
2. sends unique signed economic events with configurable concurrency;
3. verifies accepted requests were persisted in Neon Postgres;
4. revokes the key;
5. deletes synthetic load rows unless `LOAD_TEST_RETAIN=true`.

Default parameters:

- 100 requests
- concurrency 20
- 120 requests/minute per API key

## Production Vercel result

Verified on July 31, 2026 against
`https://finference-ai.vercel.app`:

| Result | Value |
| --- | ---: |
| Requests | 100 |
| Concurrency | 20 |
| Successful | 100 |
| Persisted | 100 |
| Failed | 0 |
| Throughput | 45.97 requests/second |
| p50 | 223.9 ms |
| p95 | 1,199.2 ms |
| p99 | 1,252.8 ms |
| Maximum | 1,287.7 ms |

## Local-to-Neon baseline

Verified on July 31, 2026 against the live Neon database through the local
Next.js server:

| Result | Value |
| --- | ---: |
| Requests | 100 |
| Successful | 100 |
| Persisted | 100 |
| Failed | 0 |
| Throughput | 20.74 requests/second |
| p50 | 771.0 ms |
| p95 | 1,720.9 ms |
| p99 | 1,737.5 ms |

These are bounded hackathon verifications, not claims of maximum system
capacity. Synthetic rows were removed after both runs.
