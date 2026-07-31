import { NextResponse } from "next/server";
import { z } from "zod";
import {
  ensureWorkspaceForUser,
  updateBackboardState,
} from "@/db/services";
import { runMarginAgent } from "@/lib/backboard";
import { getSessionUser } from "@/lib/auth/session";

const requestSchema = z.object({
  currentMargin: z.number().min(-100).max(100),
  targetMargin: z.number().min(0).max(100),
  expensiveModel: z.string().min(1).max(120),
  candidateModel: z.string().min(1).max(120),
  expectedSavings: z.number().nonnegative(),
});

export async function POST(request: Request) {
  try {
    const payload = requestSchema.parse(await request.json());
    const user = await getSessionUser();
    const membership = user ? await ensureWorkspaceForUser(user) : null;
    const result = await runMarginAgent({
      ...payload,
      threadId: membership?.workspace.backboardThreadId,
      assistantId: membership?.workspace.backboardAssistantId,
    });

    if (user && membership && result.mode === "live") {
      await updateBackboardState({
        workspaceId: membership.workspace.id,
        threadId: result.threadId,
        actorId: user.id,
      });
    }
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid analysis payload", issues: error.issues },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        error: "Margin agent unavailable",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 502 },
    );
  }
}
