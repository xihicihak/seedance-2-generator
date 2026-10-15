import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { BillingService } from "@/lib/services/billing";

export async function POST(req) {
  try {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature") || headersList.get("Stripe-Signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
    }

    const result = await BillingService.handleWebhook(body, signature);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[STRIPE_WEBHOOK]", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
