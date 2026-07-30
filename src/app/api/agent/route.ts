import { NextResponse } from "next/server";
import { z } from "zod";
import { runMarginAgent } from "@/lib/backboard";

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
    const result = await runMarginAgent(payload);
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

