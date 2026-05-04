"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripeWebhookHandler = void 0;
const admin = __importStar(require("firebase-admin"));
const init_1 = require("./init");
const validation_1 = require("./validation");
const feedback_1 = require("./feedback");
if (!admin.apps.length) {
    admin.initializeApp();
}
const stripeWebhookHandler = async (req, res) => {
    const stripe = (0, init_1.getStripe)();
    const firestore = admin.firestore();
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
    const eventRef = firestore.collection('stripe_events').doc(validatedEvent.id);
    const doc = await eventRef.get();
    if (doc.exists) {
        console.log("Duplicate event received, ignoring.");
        res.status(200).json({ status: "duplicate" });
        return;
    }
    switch (validatedEvent.type) {
        case 'payment_intent.succeeded': {
            const pi = validatedEvent.data.object;
            const transactionsCollection = firestore.collection('transactions');
            const { id } = await transactionsCollection.add({
                status: 'COMPLETED',
                stripe_payment_id: pi.id,
            });
            await eventRef.set({ processed: true, type: validatedEvent.type });
            res.status(200).json({ status: 'success', event_type: validatedEvent.type, transactionId: id });
            return;
        }
        case 'payment_intent.payment_failed': {
            const pi = validatedEvent.data.object;
            const transactionsCollection = firestore.collection('transactions');
            const { id } = await transactionsCollection.add({
                status: 'FAILED',
                error_reason: pi.last_payment_error?.code,
                stripe_payment_id: pi.id,
            });
            await eventRef.set({ processed: true, type: validatedEvent.type });
            res.status(200).json({ status: 'success', event_type: validatedEvent.type, transactionId: id });
            return;
        }
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
exports.stripeWebhookHandler = stripeWebhookHandler;
