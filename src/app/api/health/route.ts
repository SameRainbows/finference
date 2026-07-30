import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({
    status: "ok",
    service: "finference-control-plane",
    version: "1.0.0",
    integrations: {
      backboard: process.env.BACKBOARD_API_KEY ? "live" : "demo",
      stripe: process.env.STRIPE_SECRET_KEY ? "live" : "demo",
    },
    timestamp: new Date().toISOString(),
  });
}

