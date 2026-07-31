import { NextResponse } from "next/server";
import { z } from "zod";
import { approveRoutingPolicy } from "@/db/services";
import { requireSessionUser } from "@/lib/auth/session";

const schema = z.object({ policyId: z.uuid().optional() });

export async function POST(request: Request) {
  try {
    const user = await requireSessionUser();
    const payload = schema.parse(await request.json().catch(() => ({})));
    const policy = await approveRoutingPolicy(user, payload.policyId);
    return NextResponse.json({ policy });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid policy request", issues: error.issues },
        { status: 400 },
      );
    }
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to approve policy",
      },
      { status: 409 },
    );
  }
}
