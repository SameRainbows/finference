import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/"
      aria-label="Finference home"
      className={cn(
        "inline-flex items-center gap-2.5 font-medium tracking-[-0.03em]",
        compact ? "text-sm text-white/60" : "text-base text-white",
      )}
    >
      <span className="relative grid h-7 w-7 place-items-center rounded-lg border border-[#c9ff3f]/25 bg-[#c9ff3f]/8">
        <span className="absolute h-3.5 w-[2px] rotate-[28deg] rounded-full bg-[#c9ff3f]" />
        <span className="absolute h-3.5 w-[2px] -rotate-[28deg] rounded-full bg-[#55e8cf]" />
      </span>
      finference
    </Link>
  );
}
