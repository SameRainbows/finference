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
    : { channel: "msedge" }),
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
        position: fixed; z-index: 2147483647; left: 50%; bottom: 24px;
        transform: translateX(-50%); width: min(820px, calc(100vw - 48px));
        padding: 14px 18px; border-radius: 14px;
        border: 1px solid rgba(201,255,63,.28);
        background: rgba(9,12,15,.9); backdrop-filter: blur(18px);
        box-shadow: 0 18px 70px rgba(0,0,0,.45);
        color: white; font-family: Arial, sans-serif;
      `;
      overlay.innerHTML = `
        <div style="color:#c9ff3f;font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase">${title}</div>
        <div style="margin-top:5px;color:rgba(255,255,255,.72);font-size:14px;line-height:1.45">${body}</div>
      `;
      document.body.appendChild(overlay);
    },
    { title, body },
  );
}

async function smoothScroll(y, duration = 1800) {
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

await page.goto(baseUrl, {
  waitUntil: "networkidle",
});
await caption(
  "The problem",
  "AI revenue is visible immediately. Inference cost arrives later, disconnected from the customer and product decision that created it.",
);
await page.waitForTimeout(9000);

await smoothScroll(1180);
await caption(
  "One economic ledger",
  "Finference connects model cost to customer revenue at the feature, model, and customer level.",
);
await page.waitForTimeout(8500);

await smoothScroll(2450);
await caption(
  "Closed-loop AI FinOps",
  "Observe every request, find the margin leak, approve with evidence, then meter and monetize the result.",
);
await page.waitForTimeout(9000);

await page.goto(`${baseUrl}/dashboard`, {
  waitUntil: "networkidle",
});
await caption(
  "A production-shaped control plane",
  "Aurora has $28,500 in AI revenue—but inference cost is growing faster and gross margin has fallen below its 60% target.",
);
await page.waitForTimeout(9000);

await page.getByRole("button", { name: "Close", exact: true }).click();
await caption(
  "Unit economics in real time",
  "The dashboard links every model route to requests, cost, revenue, contribution margin, latency, and billable usage.",
);
await page.waitForTimeout(9000);
await smoothScroll(640);
await page.waitForTimeout(7000);

await smoothScroll(0, 900);
await page.getByText("View margin analysis").click();
await caption(
  "Integration-ready margin agent",
  "The public build uses deterministic demo memory; the included Backboard adapter activates persistent memory when credentials are configured.",
);
await page.waitForTimeout(9000);

const drawer = page.locator("aside").last();
await drawer.evaluate((element) => {
  element.scrollTo({ top: 500, behavior: "smooth" });
});
await caption(
  "Simulation before automation",
  "Historical traffic is replayed first. Quality, latency, escalation precision, and cost must all satisfy explicit guardrails.",
);
await page.waitForTimeout(9000);

await drawer.evaluate((element) => {
  element.scrollTo({ top: 1100, behavior: "smooth" });
});
await caption(
  "Explainable and reversible",
  "The policy has a bounded traffic share, a named approver, immutable evidence, and automatic rollback conditions.",
);
await page.waitForTimeout(9000);

await page.getByRole("button", { name: /Re-run simulation/ }).click();
await page.waitForTimeout(1800);
await page.getByRole("button", { name: /Approve & deploy policy/ }).click();
await caption(
  "Policy deployed",
  "A human approves the recommendation. Eligible traffic is rerouted while high-risk cohorts remain on the premium model.",
);
await page.waitForTimeout(8500);

await smoothScroll(520);
await caption(
  "Margin protected",
  "Inference cost falls to $14,290 and gross margin rises from 52% to 61.8%. The audit trail records the decision.",
);
await page.waitForTimeout(9000);

await smoothScroll(1200);
await caption(
  "Metered and monetized",
  "Signed, idempotent economic events power customer-level margin and Stripe usage billing from the same authoritative ledger.",
);
await page.waitForTimeout(8500);

await page.goto(`${baseUrl}/security`, {
  waitUntil: "networkidle",
});
await caption(
  "Governance by design",
  "HMAC authentication, tenant isolation, minimal data collection, human approvals, and deterministic rollback are first-class.",
);
await page.waitForTimeout(8000);

await page.goto(`${baseUrl}/pricing`, {
  waitUntil: "networkidle",
});
await caption(
  "A real SaaS business",
  "Finference ships with tiered subscription economics and a functional Stripe Checkout adapter for test and live modes.",
);
await page.waitForTimeout(7500);

await page.goto(baseUrl, {
  waitUntil: "networkidle",
});
await caption(
  "Finference",
  "Observe, optimize, govern, and bill every inference—so AI growth improves margin instead of quietly destroying it.",
);
await page.waitForTimeout(9000);

const video = page.video();
await context.close();
await browser.close();

console.log(await video.path());
