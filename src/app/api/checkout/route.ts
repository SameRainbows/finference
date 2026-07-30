import { NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";

const checkoutSchema = z.object({
  plan: z.enum(["scale", "growth"]).default("scale"),
  email: z.email().optional(),
});

export async function POST(request: Request) {
  try {
    const payload = checkoutSchema.parse(await request.json());
    const secret = process.env.STRIPE_SECRET_KEY;
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;

    if (!secret) {
      return NextResponse.json({
        mode: "demo",
        message:
          "Stripe adapter is ready. Add STRIPE_SECRET_KEY and price IDs to create a real test-mode Checkout session.",
        checkoutUrl: `${baseUrl}/dashboard?checkout=demo&plan=${payload.plan}`,
      });
    }

    const stripe = new Stripe(secret);
    const priceId =
      payload.plan === "growth"
        ? process.env.STRIPE_GROWTH_PRICE_ID
        : process.env.STRIPE_SCALE_PRICE_ID;

    if (!priceId) {
      return NextResponse.json(
        { error: "Stripe price ID is not configured" },
        { status: 503 },
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: payload.email,
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      subscription_data: {
        metadata: {
          product: "finference",
          plan: payload.plan,
        },
      },
      success_url: `${baseUrl}/dashboard?checkout=success`,
      cancel_url: `${baseUrl}/pricing?checkout=cancelled`,
    });

    return NextResponse.json({ mode: "live", checkoutUrl: session.url });
  } catch (error) {
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

