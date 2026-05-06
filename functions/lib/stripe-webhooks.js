"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripeWebhookHandler = void 0;
const stripe_1 = __importDefault(require("stripe"));
const db_1 = require("./db");
const stripeWebhookHandler = async (req, res) => {
    const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2023-10-16' });
    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!sig) {
        return res.status(400).send("Stripe signature is missing.");
    }
    if (!webhookSecret) {
        return res.status(400).send("Webhook secret is not configured.");
    }
    let event;
    const body = req.rawBody || req.body;
    try {
        event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    }
    catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    const eventId = event.id;
    const doc = await db_1.db.collection('stripe_events').doc(eventId).get();
    if (doc.exists) {
        return res.status(200).json({ status: "duplicate" });
    }
    switch (event.type) {
        case 'payment_intent.payment_failed':
            const paymentIntent = event.data.object;
            const newTransaction = await db_1.db.collection('transactions').add({
                status: 'FAILED',
                error_reason: paymentIntent.last_payment_error?.code,
                stripe_payment_id: paymentIntent.id
            });
            await db_1.db.collection('stripe_events').doc(eventId).set({
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
exports.stripeWebhookHandler = stripeWebhookHandler;
