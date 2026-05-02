"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripeWebhookSchema = void 0;
const zod_1 = require("zod");
// A robust schema to validate the structure of incoming Stripe webhook events.
// This acts as a "Zero-Trust" gate, ensuring that even if a dependency is vulnerable,
// malformed payloads cannot reach the application logic.
// Define a schema for the 'last_payment_error' object found in failed payment intents.
const lastPaymentErrorSchema = zod_1.z.object({
    code: zod_1.z.string().optional(),
    message: zod_1.z.string(),
}).passthrough();
// Define a strict schema for the 'data.object' when the event is a failed payment intent.
const paymentIntentFailedObjectSchema = zod_1.z.object({
    id: zod_1.z.string().startsWith('pi_'),
    object: zod_1.z.literal('payment_intent'),
    amount: zod_1.z.number(),
    currency: zod_1.z.string(),
    last_payment_error: lastPaymentErrorSchema.nullable(),
    metadata: zod_1.z.record(zod_1.z.string()),
}).passthrough();
// Define a general schema for other payment intent objects (e.g., succeeded)
const paymentIntentDefaultObjectSchema = zod_1.z.object({
    id: zod_1.z.string().startsWith('pi_'),
    object: zod_1.z.literal('payment_intent'),
    metadata: zod_1.z.record(zod_1.z.string()),
}).passthrough();
// Define a schema for the generic 'data' object of a webhook.
const genericDataSchema = zod_1.z.object({
    object: zod_1.z.any(),
}).passthrough();
// Define a base schema for all Stripe webhook events.
const baseEventSchema = zod_1.z.object({
    id: zod_1.z.string().startsWith('evt_'),
    object: zod_1.z.literal('event'),
    api_version: zod_1.z.string(),
    created: zod_1.z.number(),
    livemode: zod_1.z.boolean(),
    pending_webhooks: zod_1.z.number(),
    request: zod_1.z.object({
        id: zod_1.z.string().nullable(),
        idempotency_key: zod_1.z.string().nullable(),
    }).passthrough(),
}).passthrough();
// Create specific schemas for each event type we want to handle with high security.
const paymentIntentFailedEventSchema = baseEventSchema.extend({
    type: zod_1.z.literal('payment_intent.payment_failed'),
    data: zod_1.z.object({
        object: paymentIntentFailedObjectSchema,
    }).passthrough(),
});
const paymentIntentSucceededEventSchema = baseEventSchema.extend({
    type: zod_1.z.literal('payment_intent.succeeded'),
    data: zod_1.z.object({
        object: paymentIntentDefaultObjectSchema,
    }).passthrough(),
});
// A fallback schema for any other event type.
const genericEventSchema = baseEventSchema.extend({
    type: zod_1.z.string(),
    data: genericDataSchema,
});
// Use a union of schemas. Zod will try them in order.
// This provides strict validation for the events we explicitly handle,
// while falling back to a generic schema for others.
exports.stripeWebhookSchema = zod_1.z.union([
    paymentIntentFailedEventSchema,
    paymentIntentSucceededEventSchema,
    genericEventSchema,
]);
