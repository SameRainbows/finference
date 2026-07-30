import type { Metadata } from "next";
import {
  BadgeCheck,
  DatabaseZap,
  Fingerprint,
  KeyRound,
  LockKeyhole,
  ScanEye,
  ShieldCheck,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Security",
  description:
    "Finference security, data governance, tenant isolation, and responsible automation controls.",
};

const controls = [
  {
    icon: Fingerprint,
    title: "Authenticated ingestion",
    copy: "HMAC-SHA256 signatures, idempotency keys, strict schemas, replay protection, and rate-limit boundaries.",
  },
  {
    icon: LockKeyhole,
    title: "Tenant isolation",
    copy: "Every economic event, policy, and audit record is workspace-scoped with least-privilege role enforcement.",
  },
  {
    icon: ScanEye,
    title: "Minimal data surface",
    copy: "Finference requires opaque customer identifiers—not prompts, completions, emails, or end-user PII.",
  },
  {
    icon: KeyRound,
    title: "Secret governance",
    copy: "Provider and billing credentials remain server-side, encrypted at rest, and are never included in telemetry.",
  },
  {
    icon: DatabaseZap,
    title: "Durable evidence",
    copy: "Append-only event and approval ledgers preserve who changed what, why, and under which simulation result.",
  },
  {
    icon: ShieldCheck,
    title: "Responsible automation",
    copy: "Human approvals, quality floors, blast-radius limits, continuous monitoring, and deterministic rollback.",
  },
];

export default function SecurityPage() {
  return (
    <main className="grid-noise min-h-screen bg-[#080b0d] text-white">
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-5 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <div className="text-xs uppercase tracking-[0.18em] text-[#55e8cf]">
            Enterprise governance
          </div>
          <h1 className="text-balance mt-5 text-5xl font-medium tracking-[-0.055em] sm:text-6xl">
            Margin intelligence without data exposure.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-sm leading-6 text-white/42">
            Finference is designed around economic metadata, not customer
            content. Automation is explainable, bounded, reversible, and
            attributable by default.
          </p>
        </div>

        <div className="mt-14 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {controls.map(({ icon: Icon, title, copy }) => (
            <section
              key={title}
              className="rounded-2xl border border-white/8 bg-[#0c1013] p-6"
            >
              <div className="grid h-9 w-9 place-items-center rounded-lg border border-[#55e8cf]/15 bg-[#55e8cf]/7">
                <Icon className="h-4 w-4 text-[#55e8cf]" />
              </div>
              <h2 className="mt-6 text-base font-medium">{title}</h2>
              <p className="mt-3 text-xs leading-5 text-white/38">{copy}</p>
            </section>
          ))}
        </div>

        <section className="mt-4 grid gap-4 rounded-2xl border border-[#c9ff3f]/14 bg-[#c9ff3f]/[0.03] p-6 sm:p-8 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium">
              <BadgeCheck className="h-4 w-4 text-[#c9ff3f]" />
              Compliance-ready architecture
            </div>
            <p className="mt-4 max-w-md text-xs leading-5 text-white/38">
              The control model maps naturally to SOC 2 security, availability,
              confidentiality, change-management, and logical-access evidence.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px] sm:grid-cols-3">
            {[
              "RBAC + approvals",
              "Encrypted secrets",
              "Immutable evidence",
              "Retention controls",
              "Health monitoring",
              "Incident rollback",
            ].map((item) => (
              <div
                key={item}
                className="rounded-lg border border-white/8 bg-black/10 px-3 py-3 text-white/48"
              >
                {item}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

