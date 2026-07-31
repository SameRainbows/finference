import { NextResponse } from "next/server";
import { z } from "zod";
import { createWorkspaceApiKey } from "@/db/services";
import { requireSessionUser } from "@/lib/auth/session";

const schema = z.object({
  name: z.string().trim().min(1).max(80).default("Production"),
});

export async function POST(request: Request) {
  try {
    const user = await requireSessionUser();
    const payload = schema.parse(await request.json().catch(() => ({})));
    const apiKey = await createWorkspaceApiKey(user, payload.name);
    return NextResponse.json(apiKey, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create key" },
      { status: 400 },
    );
  }
}

