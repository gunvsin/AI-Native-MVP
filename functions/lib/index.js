"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
const https_1 = require("firebase-functions/v2/https");
const app_1 = require("./app");
const init_1 = require("./init");
const validation_1 = require("./validation");
const feedback_1 = require("./feedback");
const stripeWebhookHandler = async (req, res) => {
    const stripe = (0, init_1.getStripe)();
    let event;
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
        console.error("Stripe webhook secret is not configured.");
        res.status(500).send("Internal server error: Webhook secret not configured.");
        return;
    }
    const signature = req.headers["stripe-signature"];
    if (!signature) {
        res.status(400).send("Webhook signature is missing.");
        return;
    }
    try {
        event = stripe.webhooks.constructEvent(req.rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
    }
    catch (err) {
        console.log(`❌ Error verifying webhook signature: ${err.message}`);
        res.status(400).send("Webhook Error: Signature verification failed.");
        return;
    }
    const validationResult = validation_1.stripeEventSchema.safeParse(event);
    if (!validationResult.success) {
        console.error("Zod validation failed:", validationResult.error);
        res.status(400).send("Invalid webhook payload.");
        return;
    }
    const validatedEvent = validationResult.data;
    switch (validatedEvent.type) {
        case "checkout.session.completed":
            const session = validatedEvent.data.object;
            console.log("Checkout session completed:", session.id);
            const reasoningAuditString = session?.metadata?.reasoning_audit;
            if (reasoningAuditString && typeof reasoningAuditString === 'string') {
                try {
                    const audit = validation_1.reasoningAuditSchema.safeParse(JSON.parse(reasoningAuditString));
                    if (audit.success) {
                        console.log("Reasoning audit is valid:", audit.data);
                        await (0, feedback_1.saveReasoningAudit)(audit.data);
                    }
                    else {
                        console.error("Invalid reasoning audit:", audit.error);
                    }
                }
                catch (e) {
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
app_1.app.post("/stripe-webhook", stripeWebhookHandler);
exports.api = (0, https_1.onRequest)(app_1.app);
