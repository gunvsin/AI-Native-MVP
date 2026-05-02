import { onRequest } from "firebase-functions/v2/https";
import { app } from "./app";
import Stripe from "stripe";
import { getStripe } from "./init";
import { Request, Response } from "express";
import { stripeEventSchema, reasoningAuditSchema } from "./validation";
import { saveReasoningAudit } from "./feedback";

const stripeWebhookHandler = async (req: Request, res: Response) => {
  const stripe = getStripe();
  let event: Stripe.Event;

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("Stripe webhook secret is not configured.");
    res.status(500).send("Internal server error: Webhook secret not configured.");
    return;
  }

  const signature = req.headers["stripe-signature"] as string;

  if (!signature) {
    res.status(400).send("Webhook signature is missing.");
    return;
  }

  try {
    event = stripe.webhooks.constructEvent(
      (req as any).rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    console.log(`❌ Error verifying webhook signature: ${err.message}`);
    res.status(400).send("Webhook Error: Signature verification failed.");
    return;
  }

  const validationResult = stripeEventSchema.safeParse(event);

  if (!validationResult.success) {
    console.error("Zod validation failed:", validationResult.error);
    res.status(400).send("Invalid webhook payload.");
    return;
  }

  const validatedEvent = validationResult.data;

  switch (validatedEvent.type) {
    case "checkout.session.completed":
      const session = validatedEvent.data.object as Stripe.Checkout.Session;
      console.log("Checkout session completed:", session.id);

      const reasoningAuditString = session?.metadata?.reasoning_audit;
      if (reasoningAuditString && typeof reasoningAuditString === 'string') {
        try {
            const audit = reasoningAuditSchema.safeParse(JSON.parse(reasoningAuditString));
            if (audit.success) {
              console.log("Reasoning audit is valid:", audit.data);
              await saveReasoningAudit(audit.data);
            } else {
              console.error("Invalid reasoning audit:", audit.error);
            }
        } catch(e) {
            console.error('Error parsing reasoning_audit', e);
        }
      }
      break;

    case "customer.subscription.deleted":
      break;

    default:
      console.log(`Unhandled event type ${validatedEvent.type}`);
  }

  res.json({ received: true });
};

app.post("/stripe-webhook", stripeWebhookHandler);

export const api = onRequest(app);
