/**
 * Centralized configuration for the application.
 * This file provides a single source of truth for all environment-specific
 * settings, making it easier to manage and update configurations.
 */
import { z } from 'zod';

// Define a schema for the environment variables to ensure they are correctly set.
const EnvSchema = z.object({
  STRIPE_SECRET_KEY: z.string().min(1, 'Stripe secret key is not set.'),
  STRIPE_WEBHOOK_SECRET: z
    .string()
    .min(1, 'Stripe webhook secret is not set.'),
});

// Validate environment variables at startup to catch configuration errors early.
const env = EnvSchema.parse(process.env);

export const config = {
  stripe: {
    // Pin the Stripe API version to ensure consistency across environments.
    apiVersion: '2024-06-20' as const,
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
