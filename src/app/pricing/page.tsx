import type { Metadata } from "next";
import { Check } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { CheckoutButton } from "@/components/checkout-button";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Usage-aligned Finference pricing for AI products from first event to enterprise scale.",
};

const plans = [
  {
    name: "Growth",
    price: "$49",
    note: "for teams finding product-market fit",
    plan: "growth" as const,
    features: [
      "1 million economic events / month",
      "5 team members",
      "Provider cost normalization",
      "Customer and feature margin",
      "Stripe meter exports",
      "30-day retention",
    ],
  },
  {
    name: "Scale",
    price: "$249",
    note: "for AI products protecting margin",
    plan: "scale" as const,
    featured: true,
    features: [
      "10 million economic events / month",
      "Unlimited team members",
      "Backboard margin agent + memory",
      "Policy simulation and approvals",
      "Automated rollback guardrails",
      "365-day audit evidence",
    ],
  },
];

export default function PricingPage() {
  return (
    <main className="grid-noise min-h-screen bg-[#080b0d] text-white">
      <SiteHeader />
      <div className="mx-auto max-w-5xl px-5 py-20 text-center lg:px-8 lg:py-28">
        <div className="text-xs uppercase tracking-[0.18em] text-[#c9ff3f]">
          Transparent SaaS economics
        </div>
        <h1 className="text-balance mt-5 text-5xl font-medium tracking-[-0.055em] sm:text-6xl">
          Pricing that scales with protected margin.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-sm leading-6 text-white/42">
          Start in Stripe test mode. Every plan includes signed ingestion,
          deterministic metering, and complete data export.
        </p>

        <div className="mx-auto mt-14 grid max-w-4xl gap-4 text-left md:grid-cols-2">
          {plans.map((plan) => (
            <section
              key={plan.name}
              className={`rounded-2xl border p-6 sm:p-8 ${
                plan.featured
                  ? "acid-shadow border-[#c9ff3f]/20 bg-[#c9ff3f]/[0.04]"
                  : "border-white/8 bg-[#0c1013]"
              }`}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium">{plan.name}</h2>
                {plan.featured && (
                  <span className="rounded-md bg-[#c9ff3f]/10 px-2 py-1 text-[9px] uppercase tracking-wider text-[#d7ff70]">
                    most complete
                  </span>
                )}
              </div>
              <div className="mt-6 text-5xl font-medium tracking-[-0.05em]">
                {plan.price}
                <span className="ml-1 text-xs font-normal text-white/30">
                  / month
                </span>
              </div>
              <p className="mt-2 text-xs text-white/34">{plan.note}</p>
              <div className="mt-7 space-y-3 border-t border-white/8 pt-6">
                {plan.features.map((feature) => (
                  <div
                    key={feature}
                    className="flex items-center gap-2.5 text-xs text-white/58"
                  >
                    <Check className="h-3.5 w-3.5 text-[#c9ff3f]" />
                    {feature}
                  </div>
                ))}
              </div>
              <CheckoutButton
                plan={plan.plan}
                label={`Start ${plan.name} in test mode`}
              />
            </section>
          ))}
        </div>
        <p className="mt-8 text-[10px] text-white/24">
          Demo checkout never charges a card. Production configuration uses
          Stripe Checkout, signed webhooks, and usage meters.
        </p>
      </div>
    </main>
  );
}

