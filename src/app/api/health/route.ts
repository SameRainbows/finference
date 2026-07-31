import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db/client";

export const dynamic = "force-dynamic";

export async function GET() {
  const started = performance.now();
  let database: "live" | "unavailable" = "unavailable";
  try {
    await db.execute(sql`select 1 as healthy`);
    database = "live";
  } catch {
    database = "unavailable";
  }

  const required = {
    database,
    auth:
      process.env.NEON_AUTH_BASE_URL?.startsWith("https://")
        ? ("live" as const)
        : ("unavailable" as const),
  };
  const healthy = Object.values(required).every((value) => value === "live");

  return NextResponse.json(
    {
      status: healthy ? "ok" : "degraded",
      service: "finference-control-plane",
      version: "2.0.0",
      required,
      optional: {
        backboard: process.env.BACKBOARD_API_KEY ? "live" : "adapter-ready",
        stripe: process.env.STRIPE_SECRET_KEY ? "live" : "adapter-ready",
      },
      latencyMs: Math.round(performance.now() - started),
      timestamp: new Date().toISOString(),
    },
    {
      status: healthy ? 200 : 503,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
