import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const outputDir = path.resolve("submission/raw-video");
const baseUrl = process.env.DEMO_BASE_URL ?? "https://finference-ai.vercel.app";
await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  ...(process.env.PLAYWRIGHT_CHROMIUM_PATH
    ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH }
    : {}),
});
const context = await browser.newContext({
  viewport: { width: 1280, height: 720 },
  recordVideo: {
    dir: outputDir,
    size: { width: 1280, height: 720 },
  },
});
const page = await context.newPage();

async function caption(title, body) {
  await page.evaluate(
    ({ title, body }) => {
      document.querySelector("#finference-demo-caption")?.remove();
      const overlay = document.createElement("div");
      overlay.id = "finference-demo-caption";
      overlay.style.cssText = `
        position: fixed; z-index: 2147483647; left: 50%; bottom: 20px;
        transform: translateX(-50%); width: min(820px, calc(100vw - 48px));
        padding: 13px 17px; border-radius: 14px;
        border: 1px solid rgba(201,255,63,.28);
        background: rgba(9,12,15,.91); backdrop-filter: blur(18px);
        box-shadow: 0 18px 70px rgba(0,0,0,.45);
        color: white; font-family: Arial, sans-serif;
      `;
      overlay.innerHTML = `
        <div style="color:#c9ff3f;font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase">${title}</div>
        <div style="margin-top:5px;color:rgba(255,255,255,.74);font-size:13px;line-height:1.45">${body}</div>
      `;
      document.body.appendChild(overlay);
    },
    { title, body },
  );
}

async function smoothScroll(y, duration = 1100) {
  await page.evaluate(
    ({ y, duration }) =>
      new Promise((resolve) => {
        const start = window.scrollY;
        const distance = y - start;
        const startTime = performance.now();
        const tick = (now) => {
          const progress = Math.min(1, (now - startTime) / duration);
          const eased = 1 - Math.pow(1 - progress, 3);
          window.scrollTo(0, start + distance * eased);
          if (progress < 1) requestAnimationFrame(tick);
          else resolve();
        };
        requestAnimationFrame(tick);
      }),
    { y, duration },
  );
}

await page.goto(baseUrl, { waitUntil: "networkidle" });
await caption(
  "AI margin control plane",
  "Connect every inference cost to customer revenue, govern safer routing, and meter usage from one authoritative ledger.",
);
await page.waitForTimeout(9000);

await page.goto(`${baseUrl}/auth/sign-in`, { waitUntil: "networkidle" });
await caption(
  "Real identity and persistence",
  "The judge path uses Neon Auth and opens a tenant-isolated workspace backed by live Neon Postgres.",
);
await page.waitForTimeout(6500);
await page
  .getByRole("button", { name: /Enter persistent judge workspace/i })
  .click();
await page.waitForURL("**/app", { timeout: 30_000 });
await page.waitForLoadState("networkidle");
await caption(
  "Aurora Labs · authenticated workspace",
  "Policies, audit evidence, API-key digests, events, rate limits, and meter batches persist across reloads and deployments.",
);
await page.waitForTimeout(9000);

await caption(
  "Revenue-aware unit economics",
  "$28,500 revenue and $13,751 inference cost produce 51.8% gross margin—below Aurora's 60% target.",
);
await page.waitForTimeout(11000);

await page.getByRole("button", { name: "Review recommendation" }).click();
await caption(
  "A bounded recommendation",
  "Route 72% of low-complexity support traffic to an efficient model while preserving premium handling for risky cohorts.",
);
await page.waitForTimeout(11000);

const drawer = page.locator("aside").last();
await drawer.evaluate((element) => {
  element.scrollTo({ top: 520, behavior: "smooth" });
});
await caption(
  "Simulation before activation",
  "96,221 historical requests retain 94.8% semantic quality while improving latency and escalation precision.",
);
await page.waitForTimeout(11500);

await drawer.evaluate((element) => {
  element.scrollTo({ top: 1080, behavior: "smooth" });
});
await caption(
  "Explainable and reversible",
  "Only an owner or admin can activate the atomic transition. Quality, latency, and provider-error predicates define rollback.",
);
await page.waitForTimeout(11500);

await page.getByRole("button", { name: /Approve & deploy policy/ }).click();
await page.getByText(/Policy persisted and activated/i).waitFor({
  timeout: 30_000,
});
await caption(
  "Policy persisted",
  "The human approval is written to Postgres with actor, scope, evidence, traffic share, and rollback conditions.",
);
await page.waitForTimeout(8500);

await page.reload({ waitUntil: "networkidle" });
await caption(
  "Reload proves durable state",
  "The policy remains active. Protected cost is $10,887, gross profit is $17,613, and margin reaches 61.8%.",
);
await page.waitForTimeout(11500);

await page.getByRole("button", { name: "API keys" }).click();
const keyCode = page.locator("code").filter({ hasText: /fin_live_/ });
await keyCode.waitFor({ state: "visible", timeout: 30_000 });
await keyCode.evaluate((element) => {
  element.textContent = "fin_live_••••••••••••••••••••••••••••";
});
await caption(
  "One-time workspace API key",
  "The plaintext is shown once. Finference stores only a SHA-256 digest, visible prefix, tenant, and revocation state.",
);
await page.waitForTimeout(10500);
await page.getByRole("button", { name: "Close API key" }).click();

await smoothScroll(690);
await page.getByRole("button", { name: "Send test event" }).click();
await page.getByText(/Durable event ingested/i).waitFor({ timeout: 30_000 });
await caption(
  "Durable economic event",
  "The request passes strict schema validation, persistent rate limiting, tenant authentication, and database idempotency.",
);
await page.waitForTimeout(10500);

await page.getByRole("button", { name: "Flush usage meter" }).click();
await page.getByText(/units aggregated/i).waitFor({ timeout: 30_000 });
await caption(
  "Replay-safe billing meter",
  "New ledger events become a watermarked meter batch that survives provider outages and maps directly to Stripe Billing.",
);
await page.waitForTimeout(11000);

await smoothScroll(1230);
await caption(
  "Operational evidence",
  "The governance feed now shows the real approval and API-key actions persisted by the authenticated workflow.",
);
await page.waitForTimeout(9500);

await page.goto(`${baseUrl}/security`, { waitUntil: "networkidle" });
await caption(
  "Enterprise governance",
  "Tenant isolation, one-way key storage, HMAC verification, human approval, data minimization, and replay-safe webhooks are first-class.",
);
await page.waitForTimeout(10500);

await page.goto(`${baseUrl}/pricing`, { waitUntil: "networkidle" });
await caption(
  "Monetization designed in",
  "Tiered subscriptions and usage-based economic units create a credible recurring-revenue business model.",
);
await page.waitForTimeout(9000);

await page.goto(`${baseUrl}/app`, { waitUntil: "networkidle" });
await caption(
  "Honest integration status",
  "Neon database and auth are live. Stripe and Backboard are complete adapters reported as adapter-ready until credentials are installed.",
);
await page.waitForTimeout(10500);

await page.getByRole("button", { name: "Reset judge workspace" }).click();
await page.waitForTimeout(2500);
await page.goto(baseUrl, { waitUntil: "networkidle" });
await caption(
  "Finference",
  "Observe, optimize, govern, and bill every inference—so AI growth improves margin instead of quietly destroying it.",
);
await page.waitForTimeout(9000);

const video = page.video();
await context.close();
await browser.close();

console.log(await video.path());
