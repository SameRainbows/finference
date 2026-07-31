import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PersistentDashboard } from "@/components/persistent-dashboard";
import { getPersistentDashboard } from "@/db/services";
import { getSessionUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Persistent control plane",
  description:
    "Authenticated, durable AI margin workspace backed by Neon Postgres.",
};

export default async function AppPage() {
  const user = await getSessionUser();
  if (!user) redirect("/auth/sign-in");
  const data = await getPersistentDashboard(user);

  return <PersistentDashboard user={user} data={data} />;
}
