import { NextResponse } from "next/server";
import { getPersistentDashboard } from "@/db/services";
import { requireSessionUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireSessionUser();
    const data = await getPersistentDashboard(user);
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Unable to load workspace" },
      { status: 500 },
    );
  }
}
