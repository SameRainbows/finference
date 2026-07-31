"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowRight, LoaderCircle, LockKeyhole } from "lucide-react";
import type { AuthState } from "@/app/auth/actions";

type AuthAction = (
  previous: AuthState,
  formData: FormData,
) => Promise<AuthState>;

export function AuthForm({
  mode,
  action,
}: {
  mode: "sign-in" | "sign-up";
  action: AuthAction;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  const signingUp = mode === "sign-up";

  return (
    <form action={formAction} className="mt-8 space-y-4">
      {signingUp && (
        <label className="block">
          <span className="text-[10px] uppercase tracking-[0.12em] text-white/32">
            Name
          </span>
          <input
            name="name"
            autoComplete="name"
            required
            className="mt-2 h-11 w-full rounded-lg border border-white/9 bg-white/[0.025] px-3 text-sm outline-none transition focus:border-[#c9ff3f]/45"
            placeholder="Maya Chen"
          />
        </label>
      )}
      <label className="block">
        <span className="text-[10px] uppercase tracking-[0.12em] text-white/32">
          Email
        </span>
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          className="mt-2 h-11 w-full rounded-lg border border-white/9 bg-white/[0.025] px-3 text-sm outline-none transition focus:border-[#c9ff3f]/45"
          placeholder="you@company.com"
        />
      </label>
      <label className="block">
        <span className="text-[10px] uppercase tracking-[0.12em] text-white/32">
          Password
        </span>
        <input
          name="password"
          type="password"
          minLength={10}
          autoComplete={signingUp ? "new-password" : "current-password"}
          required
          className="mt-2 h-11 w-full rounded-lg border border-white/9 bg-white/[0.025] px-3 text-sm outline-none transition focus:border-[#c9ff3f]/45"
          placeholder="10+ characters"
        />
      </label>
      {state?.error && (
        <div className="rounded-lg border border-[#ff7a70]/15 bg-[#ff7a70]/6 px-3 py-2 text-xs text-[#ff9b94]">
          {state.error}
        </div>
      )}
      <button
        disabled={pending}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#c9ff3f] text-xs font-semibold text-[#10130e] transition hover:bg-[#d7ff70] disabled:opacity-60"
      >
        {pending ? (
          <LoaderCircle className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <LockKeyhole className="h-3.5 w-3.5" />
            {signingUp ? "Create secure workspace" : "Sign in"}
            <ArrowRight className="h-3.5 w-3.5" />
          </>
        )}
      </button>
      <p className="text-center text-[10px] text-white/28">
        {signingUp ? "Already have a workspace?" : "New to Finference?"}{" "}
        <Link
          className="text-[#c9ff3f] hover:underline"
          href={signingUp ? "/auth/sign-in" : "/auth/sign-up"}
        >
          {signingUp ? "Sign in" : "Create one"}
        </Link>
      </p>
    </form>
  );
}

