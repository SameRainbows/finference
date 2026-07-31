import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { Logo } from "@/components/logo";
import { signUpWithEmail } from "@/app/auth/actions";

export const metadata: Metadata = { title: "Create workspace" };

export default function SignUpPage() {
  return (
    <main className="grid-noise min-h-screen bg-[#080b0d] px-5 py-10 text-white">
      <div className="mx-auto max-w-md">
        <div className="flex justify-center">
          <Logo />
        </div>
        <section className="soft-shadow mt-10 rounded-2xl border border-white/9 bg-[#0c1013] p-6 sm:p-8">
          <div className="text-center">
            <h1 className="text-2xl font-medium tracking-[-0.035em]">
              Create a real workspace
            </h1>
            <p className="mt-2 text-xs leading-5 text-white/38">
              Your account, policies, economic events, audit log, and meter
              state persist in serverless Postgres.
            </p>
          </div>
          <AuthForm mode="sign-up" action={signUpWithEmail} />
        </section>
        <Link
          href="/"
          className="mt-6 block text-center text-[10px] text-white/28 hover:text-white/50"
        >
          Return to product overview
        </Link>
      </div>
    </main>
  );
}

