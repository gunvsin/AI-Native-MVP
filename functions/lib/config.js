"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
/**
 * Centralized configuration for the application.
 * This file provides a single source of truth for all environment-specific
 * settings, making it easier to manage and update configurations.
 */
const zod_1 = require("zod");
// Define a schema for the environment variables to ensure they are correctly set.
const EnvSchema = zod_1.z.object({
    STRIPE_SECRET_KEY: zod_1.z.string().min(1, 'Stripe secret key is not set.'),
    STRIPE_WEBHOOK_SECRET: zod_1.z
        .string()
        .min(1, 'Stripe webhook secret is not set.'),
});
// Validate environment variables at startup to catch configuration errors early.
const env = EnvSchema.parse(process.env);
exports.config = {
    stripe: {
        // Pin the Stripe API version to ensure consistency across environments.
        apiVersion: '2024-06-20',
        // The webhook secret is essential for verifying the authenticity of incoming webhooks.
        webhookSecret: env.STRIPE_WEBHOOK_SECRET,
    },
    firebase: {
    // Firebase-specific configurations can be added here.
    // For example: databaseURL, storageBucket, etc.
    },
    // You can add other configuration sections as your application grows.
    // For example, settings for logging, feature flags, or external APIs.
};
