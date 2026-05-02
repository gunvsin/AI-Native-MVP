"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const params_1 = require("firebase-functions/v2/params");
// Define the secret parameter for the Stripe webhook secret.
// This tells Firebase to inject the secret stored in Cloud Secret Manager.
const stripeWebhookSecret = (0, params_1.defineString)('STRIPE_WEBHOOK_SECRET');
// Define a secret for the Stripe API Key as well.
const stripeSecretKey = (0, params_1.defineString)('STRIPE_SECRET_KEY');
// Export a config object that can be used throughout your functions.
// The .value() method is used to retrieve the actual secret value at runtime.
exports.config = {
    stripe: {
        secret_key: stripeSecretKey,
        webhook_secret: stripeWebhookSecret,
    },
};
