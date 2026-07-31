import { NextResponse } from "next/server";
import { resetJudgeWorkspace } from "@/db/services";
import { requireSessionUser } from "@/lib/auth/session";

export async function POST() {
  try {
    const user = await requireSessionUser();
    await resetJudgeWorkspace(user);
    return NextResponse.json({ reset: true });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to reset judge workspace",
      },
      { status: 403 },
    );
  }
}
