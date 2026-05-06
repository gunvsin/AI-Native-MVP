"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripeEventSchema = exports.reasoningAuditSchema = exports.customerSubscriptionDeletedSchema = exports.checkoutSessionCompletedSchema = void 0;
const zod_1 = require("zod");
// Base schema for all Stripe events. It includes fields common to all events.
const stripeEventBaseSchema = zod_1.z.object({
    id: zod_1.z.string(),
    object: zod_1.z.literal('event'),
    api_version: zod_1.z.string(),
    created: zod_1.z.number(),
    data: zod_1.z.object({
        object: zod_1.z.object({}).passthrough(), // The object that the event is about. `passthrough` allows unknown fields.
    }),
    livemode: zod_1.z.boolean(),
    pending_webhooks: zod_1.z.number(),
    request: zod_1.z.object({
        id: zod_1.z.string().nullable(),
        idempotency_key: zod_1.z.string().nullable(),
    }),
    type: zod_1.z.string(), // The type of event (e.g., 'checkout.session.completed')
});
// Specific schema for the 'checkout.session.completed' event
exports.checkoutSessionCompletedSchema = stripeEventBaseSchema.extend({
    type: zod_1.z.literal('checkout.session.completed'),
    data: zod_1.z.object({
        object: zod_1.z.object({
            id: zod_1.z.string(),
            object: zod_1.z.literal('checkout.session'),
            amount_total: zod_1.z.number(),
            currency: zod_1.z.string(),
            customer: zod_1.z.string().nullable(),
            customer_details: zod_1.z.object({
                email: zod_1.z.string().email(),
                name: zod_1.z.string().nullable(),
            }),
            metadata: zod_1.z.object({
                reasoning_audit: zod_1.z.string().optional()
            }).catchall(zod_1.z.any()),
            payment_status: zod_1.z.string(),
            status: zod_1.z.string(),
        }),
    }),
});
// Specific schema for the 'customer.subscription.deleted' event
exports.customerSubscriptionDeletedSchema = stripeEventBaseSchema.extend({
    type: zod_1.z.literal('customer.subscription.deleted'),
    data: zod_1.z.object({
        object: zod_1.z.object({
            id: zod_1.z.string(),
            object: zod_1.z.literal('subscription'),
            customer: zod_1.z.string(),
            // Add other relevant fields for the subscription object as needed
        }).passthrough(), // Allow other subscription fields
    }),
});
// A schema for the Reasoning Audit data that might be in the metadata
exports.reasoningAuditSchema = zod_1.z.object({
    reasoning: zod_1.z.string(),
    userAction: zod_1.z.string(),
    timestamp: zod_1.z.number(),
});
// A comprehensive schema that can handle different event types using a union.
// This allows for type-safe handling of different webhook events.
exports.stripeEventSchema = zod_1.z.union([
    exports.checkoutSessionCompletedSchema,
    exports.customerSubscriptionDeletedSchema,
    // Add other specific event schemas here as they are implemented
    stripeEventBaseSchema, // Fallback for any other unhandled event types
]);
