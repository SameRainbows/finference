import { NextResponse } from "next/server";
import type Stripe from "stripe";
import {
  markWebhookProcessed,
  recordBillingAudit,
  recordWebhook,
  updateWorkspaceBilling,
} from "@/db/services";
import { stripe } from "@/lib/stripe";

export async function POST(request: Request) {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Stripe webhook is not configured" },
      { status: 503 },
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const payload = await request.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const ledgerEntry = await recordWebhook({
    id: event.id,
    provider: "stripe",
    type: event.type,
    payload: event as unknown as Record<string, unknown>,
  });
  if (!ledgerEntry.shouldProcess) {
    return NextResponse.json({
      received: true,
      duplicate: ledgerEntry.duplicate,
    });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const workspaceId = session.metadata?.finference_workspace_id;
      if (workspaceId) {
        await updateWorkspaceBilling({
          workspaceId,
          stripeCustomerId:
            typeof session.customer === "string"
              ? session.customer
              : session.customer?.id,
          stripeSubscriptionId:
            typeof session.subscription === "string"
              ? session.subscription
              : session.subscription?.id,
          stripeSubscriptionStatus: "active",
        });
        await recordBillingAudit({
          workspaceId,
          actorId: "stripe-webhook",
          action: "Activated Stripe subscription",
          targetId: String(session.subscription),
          evidence: { eventId: event.id, mode: session.mode },
        });
      }
    }

    if (
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      const subscription = event.data.object as Stripe.Subscription;
      const workspaceId = subscription.metadata.finference_workspace_id;
      if (workspaceId) {
        await updateWorkspaceBilling({
          workspaceId,
          stripeCustomerId:
            typeof subscription.customer === "string"
              ? subscription.customer
              : subscription.customer.id,
          stripeSubscriptionId: subscription.id,
          stripeSubscriptionStatus: subscription.status,
        });
      }
    }

    await markWebhookProcessed(event.id);
    return NextResponse.json({ received: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Webhook processing failed";
    await markWebhookProcessed(event.id, message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
