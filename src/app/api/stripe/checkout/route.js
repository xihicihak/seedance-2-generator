import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { BillingService } from "@/lib/services/billing";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const planId = body.planId || (body.credits >= 2000 ? "business" : body.credits >= 600 ? "pro" : body.credits >= 250 ? "standard" : "basic");
    const checkoutUrl = await BillingService.createCheckoutSession(session.user.id, planId);

    return NextResponse.json({ url: checkoutUrl });
  } catch (error) {
    console.error("[STRIPE_CHECKOUT]", error);
    return NextResponse.json({ error: error.message || "Failed to create checkout session" }, { status: 500 });
  }
}
