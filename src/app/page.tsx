import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Braces,
  Check,
  CircleDollarSign,
  Gauge,
  GitBranch,
  LockKeyhole,
  MemoryStick,
  MousePointer2,
  Network,
  ShieldCheck,
  Sparkles,
  Waypoints,
} from "lucide-react";
import { Logo } from "@/components/logo";

const providers = ["OPENAI", "ANTHROPIC", "BACKBOARD", "GOOGLE", "STRIPE"];

const steps = [
  {
    number: "01",
    icon: Braces,
    title: "Observe every inference",
    copy: "One event schema normalizes tokens, latency, cost, customer, feature, and revenue across every AI provider.",
  },
  {
    number: "02",
    icon: Sparkles,
    title: "Find the margin leak",
    copy: "A memory-backed FinOps agent detects unprofitable cohorts and proposes quality-bounded routing policies.",
  },
  {
    number: "03",
    icon: GitBranch,
    title: "Approve with evidence",
    copy: "Simulate every policy against historical traffic. Nothing ships without a human, a quality floor, and an audit trail.",
  },
  {
    number: "04",
    icon: CircleDollarSign,
    title: "Meter and monetize",
    copy: "Convert model usage into customer-facing units and flush them to Stripe for transparent usage-based billing.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#07090c] text-[#f5f7f4]">
      <section className="grid-noise relative border-b border-white/8">
        <div className="pointer-events-none absolute left-[12%] top-0 h-[520px] w-[520px] rounded-full bg-[#c9ff3f]/7 blur-[140px]" />
        <div className="pointer-events-none absolute right-[8%] top-[20%] h-[420px] w-[420px] rounded-full bg-[#55e8cf]/6 blur-[160px]" />

        <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8">
          <Logo />
          <div className="hidden items-center gap-8 text-sm text-white/56 md:flex">
            <a className="transition hover:text-white" href="#product">
              Product
            </a>
            <a className="transition hover:text-white" href="#architecture">
              Architecture
            </a>
            <Link className="transition hover:text-white" href="/security">
              Security
            </Link>
            <Link className="transition hover:text-white" href="/demo">
              Demo
            </Link>
            <Link className="transition hover:text-white" href="/pricing">
              Pricing
            </Link>
          </div>
          <Link
            href="/dashboard"
            className="group flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-sm font-medium transition hover:border-white/25 hover:bg-white/[0.08]"
          >
            Open live demo
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </Link>
        </nav>

        <div className="relative z-10 mx-auto max-w-7xl px-5 pb-18 pt-18 text-center lg:px-8 lg:pb-28 lg:pt-24">
          <div className="mx-auto mb-7 inline-flex items-center gap-2 rounded-full border border-[#c9ff3f]/20 bg-[#c9ff3f]/7 px-3 py-1.5 text-xs font-medium text-[#d7ff70]">
            <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-[#c9ff3f]" />
            AI unit economics, continuously protected
          </div>
          <h1 className="text-balance mx-auto max-w-5xl text-[3.25rem] font-medium leading-[0.96] tracking-[-0.065em] sm:text-7xl lg:text-[6.5rem]">
            Your AI product should{" "}
            <span className="text-[#c9ff3f]">make money.</span>
          </h1>
          <p className="text-balance mx-auto mt-7 max-w-2xl text-base leading-7 text-white/52 sm:text-lg">
            Finference connects model cost to customer revenue, then safely
            routes, meters, and bills every inference—so growth improves margin
            instead of quietly destroying it.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/dashboard"
              className="group flex h-12 items-center gap-2 rounded-full bg-[#c9ff3f] px-6 text-sm font-semibold text-[#0a0d0b] transition hover:bg-[#d7ff70]"
            >
              Explore the control plane
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#architecture"
              className="flex h-12 items-center rounded-full border border-white/12 px-6 text-sm font-medium text-white/72 transition hover:border-white/25 hover:text-white"
            >
              See how it works
            </a>
          </div>

          <div className="relative mx-auto mt-16 max-w-6xl text-left lg:mt-20">
            <div className="absolute -inset-8 rounded-[2.5rem] bg-gradient-to-b from-[#c9ff3f]/10 to-transparent blur-3xl" />
            <div className="soft-shadow relative overflow-hidden rounded-2xl border border-white/12 bg-[#0b0f12]">
              <div className="flex items-center justify-between border-b border-white/8 px-4 py-3 sm:px-5">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#fb6f66]/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#f9c74f]/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#72d572]/80" />
                </div>
                <div className="font-mono text-[10px] tracking-[0.18em] text-white/28">
                  AURORA / PRODUCTION
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-[#c9ff3f]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#c9ff3f]" />
                  LIVE
                </div>
              </div>
              <div className="grid min-h-[520px] grid-cols-1 lg:grid-cols-[190px_1fr]">
                <div className="hidden border-r border-white/8 p-4 lg:block">
                  <div className="space-y-1 text-xs">
                    {["Overview", "Cost explorer", "Policies", "Metering"].map(
                      (item, index) => (
                        <div
                          key={item}
                          className={`rounded-lg px-3 py-2.5 ${
                            index === 0
                              ? "bg-white/[0.07] text-white"
                              : "text-white/38"
                          }`}
                        >
                          {item}
                        </div>
                      ),
                    )}
                  </div>
                  <div className="mt-8 rounded-xl border border-white/8 bg-white/[0.02] p-3">
                    <div className="text-[9px] uppercase tracking-[0.16em] text-white/28">
                      Connected
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-[11px] text-white/66">
                      <MemoryStick className="h-3.5 w-3.5 text-[#c9ff3f]" />
                      Backboard memory
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-[11px] text-white/66">
                      <CircleDollarSign className="h-3.5 w-3.5 text-[#55e8cf]" />
                      Stripe metering
                    </div>
                  </div>
                </div>
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.16em] text-white/30">
                        Gross margin / July
                      </div>
                      <div className="mt-1 text-3xl font-medium tracking-tight sm:text-4xl">
                        61.8%
                        <span className="ml-2 text-xs font-normal text-[#c9ff3f]">
                          +9.8 pts
                        </span>
                      </div>
                    </div>
                    <div className="rounded-full border border-[#c9ff3f]/20 bg-[#c9ff3f]/7 px-3 py-1.5 text-[10px] text-[#d7ff70]">
                      Margin guard active
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {[
                      ["AI revenue", "$28,500", "+18.4%"],
                      ["Inference cost", "$14,290", "-11.7%"],
                      ["Gross profit", "$17,613", "+31.2%"],
                      ["Meter accuracy", "99.98%", "healthy"],
                    ].map(([label, value, delta]) => (
                      <div
                        key={label}
                        className="rounded-xl border border-white/8 bg-white/[0.025] p-3.5"
                      >
                        <div className="text-[9px] text-white/34">{label}</div>
                        <div className="mt-2 text-lg font-medium">{value}</div>
                        <div className="mt-1 text-[9px] text-[#c9ff3f]">
                          {delta}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 grid gap-3 xl:grid-cols-[1.5fr_1fr]">
                    <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/70">
                          Revenue vs. model cost
                        </span>
                        <span className="font-mono text-[9px] text-white/30">
                          30D
                        </span>
                      </div>
                      <div className="relative mt-8 h-40 overflow-hidden">
                        <div className="absolute inset-x-0 top-0 border-t border-white/5" />
                        <div className="absolute inset-x-0 top-1/2 border-t border-white/5" />
                        <div className="absolute inset-x-0 bottom-0 border-t border-white/5" />
                        <svg
                          className="absolute inset-0 h-full w-full"
                          viewBox="0 0 600 160"
                          preserveAspectRatio="none"
                          aria-hidden="true"
                        >
                          <defs>
                            <linearGradient
                              id="area"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="0%"
                                stopColor="#c9ff3f"
                                stopOpacity=".18"
                              />
                              <stop
                                offset="100%"
                                stopColor="#c9ff3f"
                                stopOpacity="0"
                              />
                            </linearGradient>
                          </defs>
                          <path
                            d="M0,130 C70,126 82,104 140,106 C205,108 232,75 290,82 C360,91 380,49 445,58 C510,66 535,28 600,22 L600,160 L0,160 Z"
                            fill="url(#area)"
                          />
                          <path
                            d="M0,130 C70,126 82,104 140,106 C205,108 232,75 290,82 C360,91 380,49 445,58 C510,66 535,28 600,22"
                            fill="none"
                            stroke="#c9ff3f"
                            strokeWidth="2"
                          />
                          <path
                            d="M0,144 C70,138 92,125 150,129 C210,133 250,112 305,115 C365,118 400,95 463,101 C520,106 556,80 600,83"
                            fill="none"
                            stroke="#55e8cf"
                            strokeDasharray="4 5"
                            strokeWidth="1.5"
                            opacity=".75"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="acid-shadow rounded-xl border border-[#c9ff3f]/18 bg-[#c9ff3f]/[0.045] p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-medium">
                          <Sparkles className="h-3.5 w-3.5 text-[#c9ff3f]" />
                          Margin agent
                        </div>
                        <span className="rounded bg-[#c9ff3f]/10 px-1.5 py-0.5 text-[8px] uppercase tracking-wider text-[#c9ff3f]">
                          low risk
                        </span>
                      </div>
                      <p className="mt-4 text-xs leading-5 text-white/50">
                        Route 72% of low-complexity support traffic to the
                        efficient tier. Preserve premium routing for
                        escalations.
                      </p>
                      <div className="mt-4 flex items-end justify-between border-t border-white/8 pt-4">
                        <div>
                          <div className="text-[9px] text-white/30">
                            Projected savings
                          </div>
                          <div className="mt-1 text-xl font-medium text-[#c9ff3f]">
                            $2,864
                            <span className="text-[9px] font-normal text-white/30">
                              {" "}
                              / mo
                            </span>
                          </div>
                        </div>
                        <MousePointer2 className="h-4 w-4 text-white/30" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-9 gap-y-4 text-[10px] font-medium tracking-[0.18em] text-white/24">
            {providers.map((provider) => (
              <span key={provider}>{provider}</span>
            ))}
          </div>
        </div>
      </section>

      <section id="product" className="border-b border-white/8">
        <div className="mx-auto max-w-7xl px-5 py-24 lg:px-8 lg:py-32">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-[#c9ff3f]">
                The margin problem
              </div>
              <h2 className="text-balance mt-5 text-4xl font-medium leading-tight tracking-[-0.045em] sm:text-5xl">
                ARR is visible. AI COGS is not.
              </h2>
            </div>
            <div className="grid gap-5 text-base leading-7 text-white/48 sm:grid-cols-2">
              <p>
                AI teams ship across providers, models, agents, and features.
                The invoice arrives later—detached from the customer and
                product decision that created it.
              </p>
              <p>
                Finference closes that loop in real time. Every request becomes
                an economic event: cost, revenue, quality, and accountability
                in one ledger.
              </p>
            </div>
          </div>

          <div className="mt-16 grid gap-3 md:grid-cols-3">
            {[
              {
                icon: Gauge,
                stat: "43%",
                label: "margin leak exposed",
                copy: "Feature and customer-level unit economics, not blended cloud bills.",
              },
              {
                icon: Waypoints,
                stat: "< 60 sec",
                label: "to first event",
                copy: "Provider-neutral SDK and signed ingestion endpoint with idempotency.",
              },
              {
                icon: ShieldCheck,
                stat: "100%",
                label: "policy auditability",
                copy: "Simulation, quality floors, approvals, rollback, and immutable evidence.",
              },
            ].map(({ icon: Icon, stat, label, copy }) => (
              <div
                key={label}
                className="rounded-2xl border border-white/8 bg-[#0b0f12] p-6"
              >
                <Icon className="h-5 w-5 text-[#c9ff3f]" />
                <div className="mt-10 text-4xl font-medium tracking-tight">
                  {stat}
                </div>
                <div className="mt-1 text-sm text-white/70">{label}</div>
                <p className="mt-5 max-w-xs text-sm leading-6 text-white/36">
                  {copy}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="architecture" className="grid-noise border-b border-white/8">
        <div className="mx-auto max-w-7xl px-5 py-24 lg:px-8 lg:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="text-xs uppercase tracking-[0.18em] text-[#55e8cf]">
              Closed-loop AI FinOps
            </div>
            <h2 className="text-balance mt-5 text-4xl font-medium tracking-[-0.045em] sm:text-5xl">
              From raw token to protected revenue.
            </h2>
          </div>
          <div className="relative mt-16 grid gap-3 lg:grid-cols-4">
            <div className="absolute left-[12%] right-[12%] top-10 hidden border-t border-dashed border-white/12 lg:block" />
            {steps.map(({ number, icon: Icon, title, copy }) => (
              <div
                key={number}
                className="relative rounded-2xl border border-white/8 bg-[#0b0f12] p-6"
              >
                <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-[#101518]">
                  <Icon className="h-4 w-4 text-[#c9ff3f]" />
                </div>
                <div className="mt-10 font-mono text-[10px] text-white/25">
                  {number}
                </div>
                <h3 className="mt-3 text-lg font-medium">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/40">{copy}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="overflow-hidden rounded-2xl border border-white/8 bg-[#0b0f12] p-6 sm:p-8">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Network className="h-4 w-4 text-[#55e8cf]" />
                Production architecture
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-2 font-mono text-[10px] text-white/55">
                {[
                  "SIGNED SDK",
                  "EVENT BUS",
                  "COST LEDGER",
                  "MARGIN AGENT",
                  "POLICY ENGINE",
                  "STRIPE",
                ].map((item, index) => (
                  <div key={item} className="flex items-center gap-2">
                    <span className="rounded-lg border border-white/10 bg-white/[0.035] px-3 py-2">
                      {item}
                    </span>
                    {index < 5 && (
                      <ArrowRight className="h-3 w-3 text-white/18" />
                    )}
                  </div>
                ))}
              </div>
              <p className="mt-8 max-w-2xl text-sm leading-6 text-white/38">
                Multi-tenant isolation, append-only economic events, HMAC
                signatures, idempotency keys, role-gated approvals, encrypted
                secrets, and provider-failure fallbacks are first-class—not
                launch-week cleanup.
              </p>
            </div>
            <div className="rounded-2xl border border-[#c9ff3f]/15 bg-[#c9ff3f]/[0.04] p-6 sm:p-8">
              <div className="flex items-center gap-2 text-sm font-medium">
                <MemoryStick className="h-4 w-4 text-[#c9ff3f]" />
                Persistent decision memory
              </div>
              <p className="mt-5 text-sm leading-6 text-white/45">
                Built for Backboard memory. The agent remembers accepted quality
                thresholds, customer SLAs, past rollbacks, and operator
                preferences across optimization cycles.
              </p>
              <div className="mt-7 flex items-center gap-2 text-xs text-[#d7ff70]">
                <BadgeCheck className="h-4 w-4" />
                Not a stateless API wrapper
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/8">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-24 lg:grid-cols-2 lg:px-8 lg:py-32">
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-[#c9ff3f]">
              Governance by design
            </div>
            <h2 className="text-balance mt-5 text-4xl font-medium tracking-[-0.045em] sm:text-5xl">
              Automation without the black box.
            </h2>
            <p className="mt-6 max-w-xl text-base leading-7 text-white/46">
              Every recommendation carries its assumptions, projected economic
              impact, quality evidence, risk level, approver, and rollback
              condition.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                "Human approval gates",
                "Quality-floor enforcement",
                "Tenant-scoped RBAC",
                "Immutable audit trail",
                "PII-minimized events",
                "One-click rollback",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 text-sm text-white/65"
                >
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#c9ff3f]/10">
                    <Check className="h-3 w-3 text-[#c9ff3f]" />
                  </div>
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-white/8 bg-[#0b0f12] p-5 sm:p-7">
            <div className="flex items-center justify-between border-b border-white/8 pb-5">
              <div className="flex items-center gap-2 text-sm font-medium">
                <LockKeyhole className="h-4 w-4 text-[#55e8cf]" />
                Policy evidence
              </div>
              <span className="font-mono text-[9px] text-white/25">
                POL_MARGIN_01
              </span>
            </div>
            <div className="space-y-4 py-5 text-xs">
              {[
                ["Proposed by", "Margin Agent / Backboard thread 7b3f"],
                ["Traffic scope", "Support copilot · low complexity · 72%"],
                ["Quality floor", "94% semantic equivalence"],
                ["Expected impact", "+9.8 margin points · $2,864 / month"],
                ["Rollback", "quality < 94% or p95 latency > 1.2s"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="grid grid-cols-[110px_1fr] gap-4"
                >
                  <span className="text-white/28">{label}</span>
                  <span className="text-white/68">{value}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between border-t border-white/8 pt-5">
              <div className="flex items-center gap-2 text-[10px] text-[#c9ff3f]">
                <ShieldCheck className="h-3.5 w-3.5" />
                Simulation passed
              </div>
              <div className="rounded-lg bg-[#c9ff3f] px-4 py-2 text-xs font-semibold text-[#0a0d0b]">
                Approve policy
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#c9ff3f]/8 blur-[160px]" />
        <div className="relative mx-auto max-w-4xl px-5 py-28 text-center lg:py-36">
          <h2 className="text-balance text-4xl font-medium tracking-[-0.05em] sm:text-6xl">
            Make intelligence profitable by default.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-white/46">
            The live demo is preloaded with production-shaped traffic. Find the
            leak, inspect the agent&apos;s evidence, and approve a safer margin
            policy.
          </p>
          <Link
            href="/dashboard"
            className="group mx-auto mt-8 flex h-12 w-fit items-center gap-2 rounded-full bg-[#c9ff3f] px-6 text-sm font-semibold text-[#0a0d0b] transition hover:bg-[#d7ff70]"
          >
            Launch interactive demo
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/8">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 text-xs text-white/30 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <Logo compact />
          <span>
            Built for Galuxium Nexus V2 · Original hackathon work · 2026
          </span>
          <div className="flex gap-5">
            <Link href="/security" className="hover:text-white/60">
              Security
            </Link>
            <Link href="/pricing" className="hover:text-white/60">
              Pricing
            </Link>
            <Link href="/demo" className="hover:text-white/60">
              Demo
            </Link>
            <a
              href="https://github.com/SameRainbows/finference"
              className="hover:text-white/60"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
