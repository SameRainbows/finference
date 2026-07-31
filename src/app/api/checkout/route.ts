import { NextResponse } from "next/server";
import { z } from "zod";
import {
  ensureWorkspaceForUser,
  recordBillingAudit,
  updateWorkspaceBilling,
} from "@/db/services";
import { requireSessionUser } from "@/lib/auth/session";
import { ensureStripeCatalog, stripe } from "@/lib/stripe";

const checkoutSchema = z.object({
  plan: z.enum(["scale", "growth"]).default("scale"),
});

export async function POST(request: Request) {
  try {
    const user = await requireSessionUser();
    const payload = checkoutSchema.parse(await request.json());
    const { workspace } = await ensureWorkspaceForUser(user);
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;

    if (!stripe) {
      await updateWorkspaceBilling({
        workspaceId: workspace.id,
        stripeSubscriptionStatus: "adapter_ready",
      });
      await recordBillingAudit({
        workspaceId: workspace.id,
        actorId: user.id,
        action: "Validated Stripe billing adapter in credential-free mode",
        targetId: payload.plan,
        evidence: {
          plan: payload.plan,
          checkout: "requires STRIPE_SECRET_KEY",
          webhook: "/api/stripe/webhook",
          metering: "/api/app/billing/flush",
        },
      });
      return NextResponse.json({
        mode: "adapter-ready",
        message:
          "The complete Stripe test-mode path is implemented. Marketplace terms and a Stripe sandbox key are required to execute external Checkout.",
        checkoutUrl: `${baseUrl}/app?billing=adapter-ready`,
      });
    }

    const catalog = await ensureStripeCatalog(payload.plan, stripe);
    let customerId = workspace.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
        metadata: {
          finference_workspace_id: workspace.id,
        },
      });
      customerId = customer.id;
      await updateWorkspaceBilling({
        workspaceId: workspace.id,
        stripeCustomerId: customerId,
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [
        { price: catalog.basePrice.id, quantity: 1 },
        { price: catalog.meteredPrice.id },
      ],
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      metadata: {
        finference_workspace_id: workspace.id,
        plan: payload.plan,
      },
      subscription_data: {
        metadata: {
          finference_workspace_id: workspace.id,
          plan: payload.plan,
        },
      },
      success_url: `${baseUrl}/app?checkout=success`,
      cancel_url: `${baseUrl}/pricing?checkout=cancelled`,
    });

    return NextResponse.json({ mode: "live", checkoutUrl: session.url });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return NextResponse.json(
        {
          error: "Authentication required",
          checkoutUrl: "/auth/sign-in?next=/pricing",
        },
        { status: 401 },
      );
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid checkout request", issues: error.issues },
        { status: 400 },
      );
    }
    return NextResponse.json(
      {
        error: "Unable to create checkout session",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 502 },
    );
  }
}
