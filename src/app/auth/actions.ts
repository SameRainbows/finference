"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";

export type AuthState = { error: string } | null;

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function signUpWithEmail(
  _previous: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = value(formData, "email").toLowerCase();
  const name = value(formData, "name");
  const password = value(formData, "password");

  if (!name || !email || password.length < 10) {
    return { error: "Use a name, valid email, and password of 10+ characters." };
  }

  const { error } = await auth.signUp.email({ email, name, password });
  if (error) {
    return { error: error.message || "Account creation failed." };
  }

  redirect("/app");
}

export async function signInWithEmail(
  _previous: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = value(formData, "email").toLowerCase();
  const password = value(formData, "password");
  const { error } = await auth.signIn.email({ email, password });

  if (error) {
    return { error: error.message || "Sign-in failed." };
  }

  redirect("/app");
}

export async function enterJudgeWorkspace(): Promise<void> {
  const email = process.env.DEMO_USER_EMAIL;
  const password = process.env.DEMO_USER_PASSWORD;
  if (!email || !password) {
    redirect("/auth/sign-up");
  }

  const signIn = await auth.signIn.email({ email, password });
  if (!signIn.error) {
    redirect("/app");
  }

  const signUp = await auth.signUp.email({
    email,
    password,
    name: "Nexus Judge",
  });
  if (signUp.error) {
    redirect("/auth/sign-in?error=demo-account");
  }

  redirect("/app");
}

export async function signOut(): Promise<void> {
  await auth.signOut();
  redirect("/");
}

