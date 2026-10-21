import { stripe } from "../stripe";
import config from "../config";
import { UserService } from "./user";
import { prisma } from "../prisma";

export const BillingService = {
  async createCheckoutSession(userId, planId) {
    const plan = config.stripe.plans[planId] || config.stripe.plans.default;
    if (!plan) throw new Error("Invalid plan selected");

    const appUrl = config.domain || config.auth.url || "https://www.pornmakes.com";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: plan.currency || "usd",
            product_data: {
              name: `PornMake - ${plan.name}`,
              description: `Purchase ${plan.credits} GPU compute credits for Wan 2.2 video rendering.`,
            },
            unit_amount: plan.price,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${appUrl}/pricing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/pricing?canceled=true`,
      metadata: { userId, credits: plan.credits.toString(), planId: planId || "default" },
    });

    return session.url;
  },

  async handleWebhook(body, signature) {
    const event = stripe.webhooks.constructEvent(body, signature, config.stripe.webhookSecret);
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      const credits = parseInt(session.metadata?.credits || "0", 10);
      const planId = session.metadata?.planId || "default";
      const amountTotal = session.amount_total || 0;

      if (userId && credits > 0) {
        // 1. Idempotency Check: if this stripe session has already been processed, skip gracefully
        const existingTx = await prisma.transaction.findUnique({
          where: { stripeSessionId: session.id },
        });

        if (existingTx) {
          console.log(`[STRIPE_WEBHOOK] Session ${session.id} already processed. Skipping duplicate grant.`);
          return { success: true, alreadyProcessed: true, userId, credits };
        }

        // 2. Atomic Transaction: Record transaction + Increment user credits
        await prisma.$transaction([
          prisma.transaction.create({
            data: {
              userId,
              type: "PURCHASE",
              amount: credits,
              price: amountTotal,
              currency: session.currency || "usd",
              stripeSessionId: session.id,
              status: "completed",
              metadata: JSON.stringify({
                planId,
                customerEmail: session.customer_details?.email,
                paymentStatus: session.payment_status,
              }),
            },
          }),
          prisma.user.update({
            where: { id: userId },
            data: {
              credits: { increment: credits },
            },
          }),
        ]);

        return { success: true, userId, credits, sessionId: session.id };
      }
    }
    return { success: false };
  }
};

export const createCheckoutSession = BillingService.createCheckoutSession.bind(BillingService);
export const handleWebhook = BillingService.handleWebhook.bind(BillingService);
export default BillingService;

