import { z } from 'zod';

// Base schema for all Stripe events. It includes fields common to all events.
const stripeEventBaseSchema = z.object({
  id: z.string(),
  object: z.literal('event'),
  api_version: z.string(),
  created: z.number(),
  data: z.object({
    object: z.object({}).passthrough(), // The object that the event is about. `passthrough` allows unknown fields.
  }),
  livemode: z.boolean(),
  pending_webhooks: z.number(),
  request: z.object({
    id: z.string().nullable(),
    idempotency_key: z.string().nullable(),
  }),
  type: z.string(), // The type of event (e.g., 'checkout.session.completed')
});

// Specific schema for the 'checkout.session.completed' event
export const checkoutSessionCompletedSchema = stripeEventBaseSchema.extend({
  type: z.literal('checkout.session.completed'),
  data: z.object({
    object: z.object({
      id: z.string(),
      object: z.literal('checkout.session'),
      amount_total: z.number(),
      currency: z.string(),
      customer: z.string().nullable(),
      customer_details: z.object({
        email: z.string().email(),
        name: z.string().nullable(),
      }),
      metadata: z.object({
        reasoning_audit: z.string().optional()
      }).catchall(z.any()),
      payment_status: z.string(),
      status: z.string(),
    }),
  }),
});

// Specific schema for the 'customer.subscription.deleted' event
export const customerSubscriptionDeletedSchema = stripeEventBaseSchema.extend({
  type: z.literal('customer.subscription.deleted'),
  data: z.object({
    object: z.object({
      id: z.string(),
      object: z.literal('subscription'),
      customer: z.string(),
      // Add other relevant fields for the subscription object as needed
    }).passthrough(), // Allow other subscription fields
  }),
});

// A schema for the Reasoning Audit data that might be in the metadata
export const reasoningAuditSchema = z.object({
  reasoning: z.string(),
  userAction: z.string(),
  timestamp: z.string().datetime(),
});

// A comprehensive schema that can handle different event types using a union.
// This allows for type-safe handling of different webhook events.
export const stripeEventSchema = z.union([
  checkoutSessionCompletedSchema,
  customerSubscriptionDeletedSchema,
  // Add other specific event schemas here as they are implemented
  stripeEventBaseSchema, // Fallback for any other unhandled event types
]);