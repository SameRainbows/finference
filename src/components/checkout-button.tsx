"use client";

import { useState } from "react";
import { ArrowRight, LoaderCircle } from "lucide-react";

export function CheckoutButton({
  plan,
  label,
}: {
  plan: "scale" | "growth";
  label: string;
}) {
  const [loading, setLoading] = useState(false);

  async function checkout() {
    setLoading(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const result = (await response.json()) as { checkoutUrl?: string };
      if (result.checkoutUrl) window.location.href = result.checkoutUrl;
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={checkout}
      disabled={loading}
      className="mt-7 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#c9ff3f] text-xs font-semibold text-[#10130e] transition hover:bg-[#d7ff70] disabled:opacity-60"
    >
      {loading ? (
        <LoaderCircle className="h-4 w-4 animate-spin" />
      ) : (
        <>
          {label}
          <ArrowRight className="h-3.5 w-3.5" />
        </>
      )}
    </button>
  );
}

