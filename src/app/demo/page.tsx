import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock3, Code2, PlayCircle } from "lucide-react";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Product demo",
  description:
    "Watch the complete Finference product demo: detect an AI margin leak, inspect evidence, deploy a policy, and meter the result.",
};

export default function DemoPage() {
  return (
    <main className="grid-noise min-h-screen bg-[#080b0d] text-white">
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-5 py-14 lg:px-8 lg:py-20">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[#c9ff3f]">
              <PlayCircle className="h-4 w-4" />
              Technical keynote
            </div>
            <h1 className="text-balance mt-4 max-w-3xl text-4xl font-medium tracking-[-0.05em] sm:text-6xl">
              From margin leak to protected revenue.
            </h1>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/34">
            <Clock3 className="h-4 w-4" />
            3 minutes 7 seconds
          </div>
        </div>

        <div className="soft-shadow mt-10 overflow-hidden rounded-2xl border border-white/10 bg-black">
          <video
            className="aspect-video w-full"
            controls
            preload="metadata"
            poster="/screenshots/landing.png"
          >
            <source src="/finference-demo.mp4" type="video/mp4" />
            Your browser does not support HTML video.
          </video>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-[1fr_auto]">
          <div className="rounded-xl border border-white/8 bg-[#0c1013] p-5">
            <h2 className="text-sm font-medium">What the demo proves</h2>
            <p className="mt-2 max-w-3xl text-xs leading-5 text-white/38">
              Real Neon Auth and Postgres persistence, revenue-aware telemetry,
              governed policy activation, one-time API-key handling, durable
              event ingestion, audit evidence, and replay-safe billing meters.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row md:flex-col">
            <Link
              href="/auth/sign-in"
              className="flex h-11 items-center justify-center gap-2 rounded-lg bg-[#c9ff3f] px-5 text-xs font-semibold text-[#10130e]"
            >
              Enter persistent workspace
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <a
              href="https://github.com/SameRainbows/finference"
              className="flex h-11 items-center justify-center gap-2 rounded-lg border border-white/9 px-5 text-xs text-white/55"
            >
              <Code2 className="h-3.5 w-3.5" />
              Inspect the code
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
