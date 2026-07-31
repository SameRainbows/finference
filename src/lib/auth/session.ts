import { auth } from "./server";
import type { SessionUser } from "@/db/services";

export async function getSessionUser(): Promise<SessionUser | null> {
  const { data } = await auth.getSession();
  const user = data?.user;
  if (!user?.id || !user.email) return null;
  return { id: user.id, email: user.email, name: user.name };
}

export async function requireSessionUser() {
  const user = await getSessionUser();
  if (!user) throw new Error("UNAUTHENTICATED");
  return user;
}
