import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/logo";

export function SiteHeader() {
  return (
    <header className="border-b border-white/8 bg-[#080b0d]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Logo />
        <nav className="hidden items-center gap-7 text-xs text-white/44 sm:flex">
          <Link href="/#product" className="hover:text-white/70">
            Product
          </Link>
          <Link href="/security" className="hover:text-white/70">
            Security
          </Link>
          <Link href="/demo" className="hover:text-white/70">
            Demo video
          </Link>
          <Link href="/pricing" className="hover:text-white/70">
            Pricing
          </Link>
        </nav>
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 rounded-full bg-[#c9ff3f] px-4 py-2 text-xs font-semibold text-[#10130e]"
        >
          Live demo
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </header>
  );
}
