import { NextResponse } from "next/server";
import { ensureWorkspaceForUser, insertUsageEvent } from "@/db/services";
import { requireSessionUser } from "@/lib/auth/session";

export async function POST() {
  try {
    const user = await requireSessionUser();
    const { workspace } = await ensureWorkspaceForUser(user);
    const eventId = `evt_live_${Date.now()}`;
    const result = await insertUsageEvent({
      workspaceId: workspace.id,
      externalEventId: eventId,
      idempotencyKey: eventId,
      occurredAt: new Date(),
      customerId: "cus_live_test",
      feature: "Support copilot",
      provider: "Finference SDK",
      model: "gemini-3-flash",
      inputTokens: 1_240,
      outputTokens: 438,
      latencyMs: 742,
      costUsd: 0.0064,
      revenueUsd: 0.049,
      status: "ok",
      metadata: { source: "authenticated-test-event" },
    });

    return NextResponse.json({
      eventId,
      duplicate: result.duplicate,
      persistedId: result.id,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Unable to persist test event" },
      { status: 500 },
    );
  }
}
