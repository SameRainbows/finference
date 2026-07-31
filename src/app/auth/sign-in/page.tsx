import type { Metadata } from "next";
import Link from "next/link";
import { Database, ShieldCheck } from "lucide-react";
import { AuthForm } from "@/components/auth-form";
import { JudgeAccess } from "@/components/judge-access";
import { Logo } from "@/components/logo";
import { signInWithEmail } from "@/app/auth/actions";

export const metadata: Metadata = { title: "Sign in" };

export default function SignInPage() {
  return (
    <main className="grid-noise min-h-screen bg-[#080b0d] px-5 py-10 text-white">
      <div className="mx-auto max-w-md">
        <div className="flex justify-center">
          <Logo />
        </div>
        <section className="soft-shadow mt-10 rounded-2xl border border-white/9 bg-[#0c1013] p-6 sm:p-8">
          <div className="text-center">
            <h1 className="text-2xl font-medium tracking-[-0.035em]">
              Open your control plane
            </h1>
            <p className="mt-2 text-xs leading-5 text-white/38">
              Managed Neon Auth protects each tenant and persists sessions in
              Postgres.
            </p>
          </div>
          <AuthForm mode="sign-in" action={signInWithEmail} />
          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-white/7" />
            <span className="text-[9px] uppercase tracking-wider text-white/20">
              Hackathon access
            </span>
            <span className="h-px flex-1 bg-white/7" />
          </div>
          <JudgeAccess />
          <div className="mt-6 grid grid-cols-2 gap-2 text-[9px] text-white/30">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-3 w-3 text-[#c9ff3f]" />
              Secure sessions
            </span>
            <span className="flex items-center gap-1.5">
              <Database className="h-3 w-3 text-[#55e8cf]" />
              Durable workspace
            </span>
          </div>
        </section>
        <Link
          href="/dashboard"
          className="mt-6 block text-center text-[10px] text-white/28 hover:text-white/50"
        >
          Prefer no account? Open the credential-free demo.
        </Link>
      </div>
    </main>
  );
}

