
import { Request, Response } from "express";
import Stripe from "stripe";
import { db } from "./db";

export const stripeWebhookHandler = async (req: Request, res: Response) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2023-10-16' });
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig) {
    return res.status(400).send("Stripe signature is missing.");
  }

  if (!webhookSecret) {
    return res.status(400).send("Webhook secret is not configured.");
  }

  let event: Stripe.Event;
  const body = (req as any).rawBody || req.body;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const eventId = event.id;
  const doc = await db.collection('stripe_events').doc(eventId).get();

  if (doc.exists) {
    return res.status(200).json({ status: "duplicate" });
  }

  switch (event.type) {
    case 'payment_intent.payment_failed':
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const newTransaction = await db.collection('transactions').add({
        status: 'FAILED',
        error_reason: paymentIntent.last_payment_error?.code,
        stripe_payment_id: paymentIntent.id
      });
      await db.collection('stripe_events').doc(eventId).set({
        processed: true,
        type: event.type
      });
      return res.json({
          event_type: event.type,
          status: 'success',
          transactionId: newTransaction.id
      });
    default:
      // Unhandled event type
      break;
  }

  res.json({ received: true });
};
