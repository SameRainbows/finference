import { NextResponse } from "next/server";
import {
  createMeterFlush,
  ensureWorkspaceForUser,
  recordBillingAudit,
  updateMeterFlush,
} from "@/db/services";
import { requireSessionUser } from "@/lib/auth/session";
import {
  ensureStripeCatalog,
  FINFERENCE_METER_EVENT,
  stripe,
} from "@/lib/stripe";

export async function POST() {
  try {
    const user = await requireSessionUser();
    const { workspace } = await ensureWorkspaceForUser(user);
    const flush = await createMeterFlush(user);

    if (flush.status !== "pending") {
      return NextResponse.json({ flush, duplicate: true });
    }

    if (!stripe || !workspace.stripeCustomerId) {
      const updated = await updateMeterFlush(flush.id, {
        status: "pending",
        errorMessage:
          "Stripe sandbox credentials or a Checkout customer are not configured.",
      });
      return NextResponse.json({
        mode: "adapter-ready",
        flush: updated,
        message:
          "Usage was durably aggregated. External Stripe submission awaits sandbox credentials.",
      });
    }

    await ensureStripeCatalog(
      workspace.plan === "growth" ? "growth" : "scale",
      stripe,
    );
    const meterEvent = await stripe.billing.meterEvents.create({
      event_name: FINFERENCE_METER_EVENT,
      identifier: flush.id,
      timestamp: Math.floor(flush.periodEnd.getTime() / 1_000),
      payload: {
        stripe_customer_id: workspace.stripeCustomerId,
        value: String(flush.billableUnits),
      },
    });
    const updated = await updateMeterFlush(flush.id, {
      status: "submitted",
      stripeMeterEventId: meterEvent.identifier,
      errorMessage: null,
    });
    await recordBillingAudit({
      workspaceId: workspace.id,
      actorId: user.id,
      action: "Submitted usage meter batch to Stripe",
      targetId: flush.id,
      evidence: {
        eventCount: flush.eventCount,
        billableUnits: flush.billableUnits,
        stripeMeterEventId: meterEvent.identifier,
      },
    });

    return NextResponse.json({ mode: "live", flush: updated });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to flush usage meter",
      },
      { status: 500 },
    );
  }
}

