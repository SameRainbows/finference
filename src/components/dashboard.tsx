"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Bell,
  Blocks,
  Bot,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  CircleGauge,
  Clock3,
  Code2,
  CreditCard,
  Database,
  FileClock,
  FlaskConical,
  Gauge,
  KeyRound,
  LayoutDashboard,
  Menu,
  Play,
  RotateCcw,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
  Waypoints,
  X,
  Zap,
} from "lucide-react";
import {
  auditEvents,
  modelRows,
  recommendedPolicy,
  usageEvents,
} from "@/lib/demo-data";
import { applyPolicy, summarize } from "@/lib/finops";
import { compact, money } from "@/lib/utils";
import { Logo } from "@/components/logo";
import { MarginChart } from "@/components/margin-chart";

const navItems = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Cost explorer", icon: CircleGauge },
  { label: "Model routes", icon: Waypoints },
  { label: "Policies", icon: ShieldCheck, badge: "1" },
  { label: "Metering", icon: CreditCard },
  { label: "Audit log", icon: FileClock },
];

const sampleEvent = `await finference.track({
  feature: "support_copilot",
  customerId: "cus_northstar",
  provider: response.provider,
  model: response.model,
  inputTokens: response.usage.input,
  outputTokens: response.usage.output,
  costUsd: response.usage.cost,
  revenueUsd: 0.049
});`;

export function Dashboard() {
  const [policyApplied, setPolicyApplied] = useState(false);
  const [agentOpen, setAgentOpen] = useState(true);
  const [mobileNav, setMobileNav] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [range, setRange] = useState("30 days");
  const [activeNav, setActiveNav] = useState("Overview");
  const [simulating, setSimulating] = useState(false);

  const currentEvents = useMemo(
    () =>
      policyApplied
        ? applyPolicy(usageEvents, recommendedPolicy)
        : usageEvents,
    [policyApplied],
  );
  const snapshot = useMemo(() => summarize(currentEvents), [currentEvents]);
  const baseline = useMemo(() => summarize(usageEvents), []);
  const displayMargin = policyApplied ? 61.8 : 52;
  const displayCost = policyApplied ? 14290 : 17154;
  const displayProfit = policyApplied ? 17613 : 14749;

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 3200);
  }

  function runSimulation() {
    setSimulating(true);
    window.setTimeout(() => {
      setSimulating(false);
      notify("Simulation complete · 94.8% quality retained");
    }, 1150);
  }

  function approvePolicy() {
    setPolicyApplied(true);
    setAgentOpen(false);
    notify("Policy deployed to 72% of eligible traffic");
  }

  return (
    <div className="min-h-screen bg-[#080b0d] text-[#f5f7f4]">
      <div className="flex min-h-screen">
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-[230px] flex-col border-r border-white/8 bg-[#090c0f] lg:flex">
          <div className="flex h-[68px] items-center border-b border-white/8 px-5">
            <Logo />
          </div>
          <div className="p-3">
            <button className="flex w-full items-center justify-between rounded-xl border border-white/8 bg-white/[0.025] px-3 py-2.5 text-left">
              <div className="flex items-center gap-2.5">
                <div className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-[#c9ff3f] to-[#55e8cf] text-[10px] font-bold text-[#0b0d0c]">
                  A
                </div>
                <div>
                  <div className="text-xs font-medium">Aurora Labs</div>
                  <div className="mt-0.5 text-[9px] text-white/30">
                    Scale plan
                  </div>
                </div>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-white/30" />
            </button>
          </div>
          <nav className="flex-1 px-3 pt-2">
            <div className="mb-2 px-3 text-[9px] uppercase tracking-[0.15em] text-white/20">
              Control plane
            </div>
            <div className="space-y-1">
              {navItems.map(({ label, icon: Icon, badge }) => (
                <button
                  key={label}
                  onClick={() => {
                    setActiveNav(label);
                    if (label === "Policies") setAgentOpen(true);
                    if (label !== "Overview" && label !== "Policies") {
                      notify(`${label} is represented in the live overview`);
                    }
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-xs transition ${
                    activeNav === label
                      ? "bg-white/[0.07] text-white"
                      : "text-white/38 hover:bg-white/[0.035] hover:text-white/70"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </span>
                  {badge && !policyApplied && (
                    <span className="grid h-4 w-4 place-items-center rounded-full bg-[#c9ff3f] text-[9px] font-bold text-[#10130e]">
                      {badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
            <div className="mb-2 mt-7 px-3 text-[9px] uppercase tracking-[0.15em] text-white/20">
              Workspace
            </div>
            <div className="space-y-1">
              {[
                { label: "Team", icon: Users },
                { label: "API keys", icon: KeyRound },
                { label: "Settings", icon: Settings },
              ].map(({ label, icon: Icon }) => (
                <button
                  key={label}
                  onClick={() => notify(`${label} settings are demo-safe`)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs text-white/38 transition hover:bg-white/[0.035] hover:text-white/70"
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>
          </nav>
          <div className="p-3">
            <div className="rounded-xl border border-white/8 bg-white/[0.02] p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-white/42">Monthly events</span>
                <span className="text-[9px] text-white/25">527k / 1m</span>
              </div>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/7">
                <div className="h-full w-[53%] rounded-full bg-[#c9ff3f]" />
              </div>
              <Link
                href="/pricing"
                className="mt-3 flex items-center gap-1 text-[10px] text-[#c9ff3f]"
              >
                Plan & billing
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </aside>

        {mobileNav && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm lg:hidden">
            <div className="h-full w-[280px] border-r border-white/10 bg-[#090c0f] p-4">
              <div className="flex items-center justify-between">
                <Logo />
                <button
                  aria-label="Close menu"
                  onClick={() => setMobileNav(false)}
                >
                  <X className="h-5 w-5 text-white/50" />
                </button>
              </div>
              <div className="mt-8 space-y-1">
                {navItems.map(({ label, icon: Icon }) => (
                  <button
                    key={label}
                    onClick={() => {
                      setActiveNav(label);
                      setMobileNav(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-white/60 hover:bg-white/5"
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="min-w-0 flex-1 lg:ml-[230px]">
          <header className="sticky top-0 z-30 flex h-[68px] items-center justify-between border-b border-white/8 bg-[#080b0d]/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                aria-label="Open menu"
                className="lg:hidden"
                onClick={() => setMobileNav(true)}
              >
                <Menu className="h-5 w-5 text-white/60" />
              </button>
              <div>
                <div className="text-sm font-medium">{activeNav}</div>
                <div className="mt-0.5 hidden items-center gap-1.5 text-[10px] text-white/27 sm:flex">
                  Interactive demo
                  <span>·</span>
                  <span className="text-[#c9ff3f]">
                    seeded dataset · APIs available
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => notify("Command search ready")}
                className="hidden h-9 items-center gap-2 rounded-lg border border-white/8 bg-white/[0.025] px-3 text-[11px] text-white/30 sm:flex"
              >
                <Search className="h-3.5 w-3.5" />
                Search
                <kbd className="ml-4 rounded border border-white/8 px-1.5 py-0.5 font-mono text-[8px]">
                  ⌘ K
                </kbd>
              </button>
              <button
                aria-label="Notifications"
                onClick={() => notify("No unresolved incidents")}
                className="grid h-9 w-9 place-items-center rounded-lg border border-white/8 bg-white/[0.025]"
              >
                <Bell className="h-3.5 w-3.5 text-white/46" />
              </button>
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#d4f3aa] text-[11px] font-semibold text-[#18200f]">
                MC
              </div>
            </div>
          </header>

          <main className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.15em] text-white/28">
                  <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-[#c9ff3f]" />
                  Live economic telemetry
                </div>
                <h1 className="mt-2 text-2xl font-medium tracking-[-0.035em] sm:text-3xl">
                  Good afternoon, Maya.
                </h1>
                <p className="mt-1.5 text-xs text-white/34">
                  Your AI margin is{" "}
                  <span className="text-[#c9ff3f]">
                    {policyApplied ? "protected" : "exposed"}
                  </span>
                  . One optimization is ready for review.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setRange((value) =>
                      value === "30 days" ? "7 days" : "30 days",
                    )
                  }
                  className="flex h-9 items-center gap-2 rounded-lg border border-white/8 bg-white/[0.025] px-3 text-[11px] text-white/55"
                >
                  <Clock3 className="h-3.5 w-3.5" />
                  Last {range}
                  <ChevronDown className="h-3 w-3 text-white/30" />
                </button>
                <button
                  onClick={() => notify("Dashboard refreshed")}
                  className="grid h-9 w-9 place-items-center rounded-lg border border-white/8 bg-white/[0.025]"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-white/46" />
                </button>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-2 xl:grid-cols-4">
              {[
                {
                  label: "AI revenue",
                  value: "$28,500",
                  delta: "+18.4%",
                  note: "vs. prior period",
                  positive: true,
                  icon: CircleDollarSign,
                },
                {
                  label: "Inference cost",
                  value: money(displayCost),
                  delta: policyApplied ? "-16.7%" : "+12.6%",
                  note: policyApplied ? "after routing" : "growing too fast",
                  positive: policyApplied,
                  icon: Database,
                },
                {
                  label: "Gross profit",
                  value: money(displayProfit),
                  delta: policyApplied ? "+31.2%" : "+8.1%",
                  note: "projected MRR",
                  positive: true,
                  icon: Gauge,
                },
                {
                  label: "Gross margin",
                  value: `${displayMargin.toFixed(1)}%`,
                  delta: policyApplied ? "+9.8 pts" : "-3.1 pts",
                  note: policyApplied ? "guard active" : "below 60% target",
                  positive: policyApplied,
                  icon: Activity,
                },
              ].map(
                ({
                  label,
                  value,
                  delta,
                  note,
                  positive,
                  icon: Icon,
                }) => (
                  <div
                    key={label}
                    className="rounded-xl border border-white/8 bg-[#0c1013] p-4 sm:p-5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-white/34">{label}</span>
                      <Icon className="h-3.5 w-3.5 text-white/22" />
                    </div>
                    <div className="mt-3 text-2xl font-medium tracking-[-0.03em] sm:text-3xl">
                      {value}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <span
                        className={`text-[10px] ${positive ? "text-[#c9ff3f]" : "text-[#ff7a70]"}`}
                      >
                        {delta}
                      </span>
                      <span className="text-[9px] text-white/24">{note}</span>
                    </div>
                  </div>
                ),
              )}
            </div>

            <div className="mt-3 grid gap-3 2xl:grid-cols-[1.55fr_0.75fr]">
              <section className="rounded-xl border border-white/8 bg-[#0c1013] p-4 sm:p-5">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <h2 className="text-sm font-medium">
                      Revenue & inference cost
                    </h2>
                    <p className="mt-1 text-[10px] text-white/28">
                      Economic performance across all AI features
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-[9px] text-white/40">
                    <span className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#c9ff3f]" />
                      Revenue
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#55e8cf]" />
                      {policyApplied ? "Protected cost" : "Model cost"}
                    </span>
                  </div>
                </div>
                <div className="mt-4 h-[270px]">
                  <MarginChart protectedMode={policyApplied} />
                </div>
                <div className="mt-1 flex flex-col justify-between gap-3 border-t border-white/7 pt-4 sm:flex-row sm:items-center">
                  <div className="flex gap-6">
                    <div>
                      <div className="text-[9px] text-white/26">
                        Current spread
                      </div>
                      <div className="mt-1 text-xs font-medium">
                        {money(displayProfit)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] text-white/26">
                        Target margin
                      </div>
                      <div className="mt-1 text-xs font-medium">60.0%</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setAgentOpen(true)}
                    className="flex items-center gap-1.5 text-[10px] text-[#c9ff3f]"
                  >
                    View margin analysis
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </section>

              <section
                className={`relative overflow-hidden rounded-xl border p-5 transition ${
                  policyApplied
                    ? "border-[#55e8cf]/18 bg-[#55e8cf]/[0.035]"
                    : "acid-shadow border-[#c9ff3f]/18 bg-[#c9ff3f]/[0.04]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {policyApplied ? (
                      <CheckCircle2 className="h-4 w-4 text-[#55e8cf]" />
                    ) : (
                      <Sparkles className="h-4 w-4 text-[#c9ff3f]" />
                    )}
                    <h2 className="text-sm font-medium">
                      {policyApplied ? "Policy active" : "Margin agent"}
                    </h2>
                  </div>
                  <span
                    className={`rounded-md px-2 py-1 text-[8px] uppercase tracking-[0.12em] ${
                      policyApplied
                        ? "bg-[#55e8cf]/10 text-[#7ff4df]"
                        : "bg-[#c9ff3f]/10 text-[#d7ff70]"
                    }`}
                  >
                    {policyApplied ? "monitored" : "low risk"}
                  </span>
                </div>
                <div className="mt-7">
                  <div className="text-[9px] uppercase tracking-[0.12em] text-white/26">
                    {policyApplied
                      ? "Realized monthly savings"
                      : "Opportunity detected"}
                  </div>
                  <div
                    className={`mt-2 text-3xl font-medium tracking-tight ${
                      policyApplied ? "text-[#55e8cf]" : "text-[#c9ff3f]"
                    }`}
                  >
                    $2,864
                    <span className="ml-1 text-[10px] font-normal text-white/28">
                      / month
                    </span>
                  </div>
                  <p className="mt-4 text-xs leading-5 text-white/42">
                    {policyApplied
                      ? "72% of low-complexity support traffic is now routed through the efficient tier. Quality remains above 94%."
                      : "Support copilot is over-provisioned. Route low-complexity turns through the efficient tier while preserving escalations."}
                  </p>
                </div>
                <div className="mt-6 space-y-2 border-t border-white/8 pt-5">
                  {[
                    ["Margin lift", policyApplied ? "+9.8 pts" : "9.8 pts"],
                    ["Quality floor", "94%"],
                    ["Traffic affected", "72%"],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="flex items-center justify-between text-[10px]"
                    >
                      <span className="text-white/28">{label}</span>
                      <span className="text-white/70">{value}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() =>
                    policyApplied ? notify("Policy is healthy") : setAgentOpen(true)
                  }
                  className={`mt-6 flex h-9 w-full items-center justify-center gap-2 rounded-lg text-[11px] font-semibold transition ${
                    policyApplied
                      ? "bg-[#55e8cf]/10 text-[#7ff4df] hover:bg-[#55e8cf]/15"
                      : "bg-[#c9ff3f] text-[#11150d] hover:bg-[#d7ff70]"
                  }`}
                >
                  {policyApplied ? (
                    <>
                      <BadgeCheck className="h-3.5 w-3.5" />
                      View monitoring
                    </>
                  ) : (
                    <>
                      Review recommendation
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </section>
            </div>

            <div className="mt-3 grid gap-3 xl:grid-cols-[1.35fr_0.65fr]">
              <section className="overflow-hidden rounded-xl border border-white/8 bg-[#0c1013]">
                <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
                  <div>
                    <h2 className="text-sm font-medium">Model economics</h2>
                    <p className="mt-1 text-[10px] text-white/27">
                      Cost and contribution margin by route
                    </p>
                  </div>
                  <button
                    onClick={() => notify("CSV export prepared")}
                    className="text-[10px] text-white/38 hover:text-white/70"
                  >
                    Export CSV
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px] border-collapse text-left">
                    <thead>
                      <tr className="border-b border-white/7 text-[9px] uppercase tracking-[0.1em] text-white/22">
                        <th className="px-5 py-3 font-normal">Route</th>
                        <th className="px-4 py-3 font-normal">Requests</th>
                        <th className="px-4 py-3 font-normal">Cost</th>
                        <th className="px-4 py-3 font-normal">Revenue</th>
                        <th className="px-4 py-3 font-normal">Margin</th>
                        <th className="px-4 py-3 font-normal">p95 latency</th>
                      </tr>
                    </thead>
                    <tbody>
                      {modelRows.map((row, index) => {
                        const routed =
                          policyApplied &&
                          row.model === "claude-sonnet-4.5";
                        const margin = routed ? 47.5 : row.margin;
                        const cost = routed ? 3268 : row.cost;
                        return (
                          <tr
                            key={row.model}
                            className="border-b border-white/6 text-[11px] last:border-0 hover:bg-white/[0.015]"
                          >
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-3">
                                <span
                                  className={`grid h-7 w-7 place-items-center rounded-lg text-[9px] font-semibold ${
                                    [
                                      "bg-[#7aa2ff]/10 text-[#9cb8ff]",
                                      "bg-[#ffb86b]/10 text-[#ffc183]",
                                      "bg-[#55e8cf]/10 text-[#77efd9]",
                                      "bg-[#c9ff3f]/10 text-[#d7ff70]",
                                    ][index]
                                  }`}
                                >
                                  {row.provider.slice(0, 1)}
                                </span>
                                <div>
                                  <div className="font-medium text-white/76">
                                    {row.model}
                                  </div>
                                  <div className="mt-0.5 text-[9px] text-white/25">
                                    {routed
                                      ? "Anthropic · optimized"
                                      : row.provider}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3.5 text-white/48">
                              {compact(row.requests)}
                            </td>
                            <td className="px-4 py-3.5 text-white/48">
                              {money(cost)}
                            </td>
                            <td className="px-4 py-3.5 text-white/48">
                              {money(row.revenue)}
                            </td>
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-2">
                                <div className="h-1 w-12 overflow-hidden rounded-full bg-white/7">
                                  <div
                                    className={`h-full rounded-full ${margin < 40 ? "bg-[#ff7a70]" : "bg-[#c9ff3f]"}`}
                                    style={{ width: `${Math.min(100, margin)}%` }}
                                  />
                                </div>
                                <span
                                  className={
                                    margin < 40
                                      ? "text-[#ff8c83]"
                                      : "text-white/55"
                                  }
                                >
                                  {margin.toFixed(1)}%
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3.5 text-white/36">
                              {routed ? "1,280" : row.latency.toLocaleString()} ms
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="rounded-xl border border-white/8 bg-[#0c1013] p-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-medium">Meter health</h2>
                  <span className="flex items-center gap-1.5 text-[9px] text-[#c9ff3f]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#c9ff3f]" />
                    healthy
                  </span>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-2">
                  {[
                    ["Events", "527.6k"],
                    ["Accuracy", "99.98%"],
                    ["Lag", "1.2s"],
                    ["Unbilled", "$0.00"],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-lg border border-white/7 bg-white/[0.018] p-3"
                    >
                      <div className="text-[9px] text-white/25">{label}</div>
                      <div className="mt-1.5 text-sm font-medium">{value}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-5 rounded-lg border border-white/7 bg-[#090c0e] p-3 font-mono text-[9px] leading-5 text-white/38">
                  <span className="text-[#c9ff3f]">POST</span> /v1/events
                  <br />
                  202 Accepted · evt_48291
                  <br />
                  idempotency: verified
                </div>
                <button
                  onClick={() => notify("Test event ingested · evt_demo_001")}
                  className="mt-4 flex items-center gap-1.5 text-[10px] text-[#55e8cf]"
                >
                  <Play className="h-3 w-3" />
                  Send test event
                </button>
              </section>
            </div>

            <div className="mt-3 grid gap-3 xl:grid-cols-[0.75fr_1.25fr]">
              <section className="rounded-xl border border-white/8 bg-[#0c1013] p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-medium">Quick integration</h2>
                    <p className="mt-1 text-[10px] text-white/27">
                      Provider-neutral TypeScript SDK
                    </p>
                  </div>
                  <Code2 className="h-4 w-4 text-white/25" />
                </div>
                <pre className="mt-5 overflow-x-auto rounded-lg border border-white/7 bg-[#080b0d] p-4 font-mono text-[9px] leading-5 text-white/46">
                  <code>{sampleEvent}</code>
                </pre>
                <div className="mt-4 flex items-center gap-2 text-[9px] text-white/28">
                  <Check className="h-3 w-3 text-[#c9ff3f]" />
                  HMAC signed · idempotent · PII minimized
                </div>
              </section>

              <section className="overflow-hidden rounded-xl border border-white/8 bg-[#0c1013]">
                <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
                  <div>
                    <h2 className="text-sm font-medium">
                      Governance activity
                    </h2>
                    <p className="mt-1 text-[10px] text-white/27">
                      Immutable operational evidence
                    </p>
                  </div>
                  <ShieldCheck className="h-4 w-4 text-[#55e8cf]" />
                </div>
                <div>
                  {(policyApplied
                    ? [
                        {
                          time: new Date().toLocaleTimeString([], {
                            hour12: false,
                          }),
                          actor: "Maya Chen",
                          action: "Approved routing policy",
                          target: "Support copilot · 72%",
                          status: "verified",
                        },
                        ...auditEvents,
                      ]
                    : auditEvents
                  )
                    .slice(0, 4)
                    .map((event) => (
                      <div
                        key={`${event.time}-${event.action}`}
                        className="grid grid-cols-[54px_1fr_auto] items-center gap-3 border-b border-white/6 px-5 py-3.5 last:border-0"
                      >
                        <span className="font-mono text-[9px] text-white/22">
                          {event.time}
                        </span>
                        <div>
                          <div className="text-[10px] text-white/62">
                            {event.action}
                          </div>
                          <div className="mt-0.5 text-[9px] text-white/24">
                            {event.actor} · {event.target}
                          </div>
                        </div>
                        <span
                          className={`hidden rounded-md px-2 py-1 text-[8px] sm:block ${
                            event.status === "verified"
                              ? "bg-[#55e8cf]/8 text-[#77efd9]"
                              : "bg-[#f9c74f]/8 text-[#f9d675]"
                          }`}
                        >
                          {event.status}
                        </span>
                      </div>
                    ))}
                </div>
              </section>
            </div>
          </main>
        </div>
      </div>

      {agentOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/52 backdrop-blur-[2px]">
          <button
            aria-label="Close recommendation"
            className="flex-1 cursor-default"
            onClick={() => setAgentOpen(false)}
          />
          <aside className="h-full w-full max-w-[520px] overflow-y-auto border-l border-white/10 bg-[#0b0f12] shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/8 bg-[#0b0f12]/95 px-5 py-4 backdrop-blur-xl sm:px-6">
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-lg border border-[#c9ff3f]/18 bg-[#c9ff3f]/7">
                  <Bot className="h-4 w-4 text-[#c9ff3f]" />
                </div>
                <div>
                  <div className="text-sm font-medium">Margin agent</div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-[9px] text-white/28">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#c9ff3f]" />
                    Backboard adapter · demo memory
                  </div>
                </div>
              </div>
              <button
                aria-label="Close"
                onClick={() => setAgentOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-lg border border-white/8"
              >
                <X className="h-4 w-4 text-white/40" />
              </button>
            </div>

            <div className="p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-[#f9c74f]/8 px-2 py-1 text-[8px] uppercase tracking-[0.12em] text-[#f9d675]">
                  approval required
                </span>
                <span className="font-mono text-[9px] text-white/22">
                  POL_MARGIN_01
                </span>
              </div>
              <h2 className="mt-5 text-2xl font-medium tracking-[-0.035em]">
                Protect support copilot margin
              </h2>
              <p className="mt-3 text-xs leading-5 text-white/42">
                Shift low-complexity support turns to a more efficient model
                while preserving the premium route for escalations, sentiment
                risk, and long-context requests.
              </p>

              <div className="mt-6 grid grid-cols-3 gap-2">
                {[
                  ["Savings", "$2,864/mo", "text-[#c9ff3f]"],
                  ["Margin lift", "+9.8 pts", "text-[#55e8cf]"],
                  ["Risk", "Low", "text-white"],
                ].map(([label, value, color]) => (
                  <div
                    key={label}
                    className="rounded-xl border border-white/8 bg-white/[0.02] p-3"
                  >
                    <div className="text-[9px] text-white/25">{label}</div>
                    <div className={`mt-2 text-sm font-medium ${color}`}>
                      {value}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-xl border border-white/8 bg-[#080b0d] p-4">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-white/35">Routing change</span>
                  <span className="text-white/24">72% of eligible traffic</span>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <div className="min-w-0 flex-1 rounded-lg border border-white/8 bg-white/[0.025] p-3">
                    <div className="text-[9px] text-white/24">From</div>
                    <div className="mt-1 truncate text-[11px] font-medium">
                      claude-sonnet-4.5
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-[#c9ff3f]" />
                  <div className="min-w-0 flex-1 rounded-lg border border-[#c9ff3f]/15 bg-[#c9ff3f]/[0.035] p-3">
                    <div className="text-[9px] text-white/24">To</div>
                    <div className="mt-1 truncate text-[11px] font-medium">
                      gemini-3-flash
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3 rounded-xl border border-white/8 bg-[#080b0d] p-4">
                <div className="flex items-center gap-2 text-[10px] font-medium">
                  <FlaskConical className="h-3.5 w-3.5 text-[#55e8cf]" />
                  Offline simulation
                </div>
                <div className="mt-4 space-y-3">
                  {[
                    ["Semantic quality", "94.8%", "94.0% floor"],
                    ["p95 latency", "1.28s", "1.60s before"],
                    ["Cost per resolved turn", "$0.018", "$0.041 before"],
                    ["Escalation precision", "97.1%", "96.4% before"],
                  ].map(([label, value, comparison]) => (
                    <div
                      key={label}
                      className="flex items-center justify-between text-[10px]"
                    >
                      <span className="text-white/28">{label}</span>
                      <span>
                        <span className="text-white/72">{value}</span>
                        <span className="ml-2 text-white/22">{comparison}</span>
                      </span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={runSimulation}
                  disabled={simulating}
                  className="relative mt-4 flex h-8 w-full items-center justify-center gap-2 overflow-hidden rounded-lg border border-white/8 text-[10px] text-white/55 hover:bg-white/[0.025]"
                >
                  {simulating ? (
                    <>
                      <span className="h-3 w-3 animate-spin rounded-full border border-white/20 border-t-[#c9ff3f]" />
                      Replaying 96,221 requests
                    </>
                  ) : (
                    <>
                      <Play className="h-3 w-3" />
                      Re-run simulation
                    </>
                  )}
                </button>
              </div>

              <div className="mt-3 rounded-xl border border-white/8 bg-[#080b0d] p-4">
                <div className="flex items-center gap-2 text-[10px] font-medium">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#c9ff3f]" />
                  Automatic rollback conditions
                </div>
                <div className="mt-3 space-y-2 text-[10px] text-white/36">
                  <div className="flex items-center gap-2">
                    <Check className="h-3 w-3 text-[#c9ff3f]" />
                    Quality falls below 94% over 500 requests
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-3 w-3 text-[#c9ff3f]" />
                    p95 latency exceeds 1.5 seconds for 5 minutes
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-3 w-3 text-[#c9ff3f]" />
                    Provider error rate exceeds 2%
                  </div>
                </div>
              </div>

              <div className="mt-3 rounded-xl border border-[#c9ff3f]/12 bg-[#c9ff3f]/[0.025] p-4">
                <div className="flex items-center gap-2 text-[10px] font-medium">
                  <Blocks className="h-3.5 w-3.5 text-[#c9ff3f]" />
                  Why this recommendation
                </div>
                <p className="mt-3 text-[10px] leading-5 text-white/36">
                  Based on 30 days of seeded traffic, 72% of support turns use
                  less than 8k context and require no tools. The live Backboard
                  adapter can persist accepted decisions when credentials are
                  configured. High-risk cohorts remain untouched.
                </p>
                <div className="mt-3 font-mono text-[8px] text-white/20">
                  memory://aurora/quality-preferences · thread 7b3f
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 border-t border-white/8 bg-[#0b0f12]/95 p-4 backdrop-blur-xl sm:px-6">
              {policyApplied ? (
                <div className="flex h-11 items-center justify-center gap-2 rounded-lg border border-[#55e8cf]/16 bg-[#55e8cf]/7 text-xs text-[#7ff4df]">
                  <BadgeCheck className="h-4 w-4" />
                  Policy is live and monitored
                </div>
              ) : (
                <div className="grid grid-cols-[0.65fr_1.35fr] gap-2">
                  <button
                    onClick={() => {
                      setAgentOpen(false);
                      notify("Recommendation dismissed for 24 hours");
                    }}
                    className="h-11 rounded-lg border border-white/9 text-xs text-white/48 hover:bg-white/[0.025]"
                  >
                    Dismiss
                  </button>
                  <button
                    onClick={approvePolicy}
                    className="flex h-11 items-center justify-center gap-2 rounded-lg bg-[#c9ff3f] text-xs font-semibold text-[#10130e] hover:bg-[#d7ff70]"
                  >
                    <Zap className="h-3.5 w-3.5" />
                    Approve & deploy policy
                  </button>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-5 left-1/2 z-[70] flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-[#151b1e] px-4 py-2.5 text-[11px] text-white/72 shadow-2xl">
          <CheckCircle2 className="h-3.5 w-3.5 text-[#c9ff3f]" />
          {toast}
        </div>
      )}

      <div className="sr-only" aria-live="polite">
        Current margin {snapshot.grossMargin.toFixed(1)} percent. Baseline margin{" "}
        {baseline.grossMargin.toFixed(1)} percent.
      </div>
    </div>
  );
}
