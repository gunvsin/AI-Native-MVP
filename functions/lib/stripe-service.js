"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatStripeAmount = exports.getChargesWithBackoff = exports.getSubscriptionsWithBackoff = void 0;
const init_1 = require("./init");
const MAX_RETRIES = 5;
const INITIAL_DELAY_MS = 100;
// and use it in the function signature.
const getSubscriptionsWithBackoff = async (customerId) => {
    let retries = 0;
    let delay = INITIAL_DELAY_MS;
    const stripe = (0, init_1.getStripe)(); // Initialize Stripe SDK on demand
    while (retries < MAX_RETRIES) {
        try {
            const subscriptions = [];
            for await (const subscription of stripe.subscriptions.list({ customer: customerId })) {
                subscriptions.push(subscription);
            }
            return subscriptions;
        }
        catch (err) {
            if (err.statusCode === 429 && retries < MAX_RETRIES - 1) {
                console.warn(`Stripe API rate limit exceeded. Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2; // Exponential backoff
                retries++;
            }
            else {
                console.error("Failed to fetch subscriptions from Stripe:", err);
                throw err;
            }
        }
    }
    throw new Error("Failed to fetch subscriptions from Stripe after multiple retries.");
};
exports.getSubscriptionsWithBackoff = getSubscriptionsWithBackoff;
/**
 * Fetches all charges from Stripe for a given customer, with exponential backoff for rate limiting.
 * @param customerId The ID of the Stripe customer.
 * @returns A promise that resolves to an array of Stripe Charge objects.
 */
const getChargesWithBackoff = async (customerId) => {
    let retries = 0;
    let delay = INITIAL_DELAY_MS;
    const stripe = (0, init_1.getStripe)(); // Initialize Stripe SDK on demand
    while (retries < MAX_RETRIES) {
        try {
            const charges = [];
            for await (const charge of stripe.charges.list({ customer: customerId })) {
                charges.push(charge);
            }
            return charges;
        }
        catch (err) {
            if (err.statusCode === 429 && retries < MAX_RETRIES - 1) {
                console.warn(`Stripe API rate limit exceeded. Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2; // Exponential backoff
                retries++;
            }
            else {
                console.error("Failed to fetch charges from Stripe:", err);
                throw err;
            }
        }
    }
    throw new Error("Failed to fetch charges from Stripe after multiple retries.");
};
exports.getChargesWithBackoff = getChargesWithBackoff;
// A helper function to format Stripe amounts (in cents) to a human-readable format.
const formatStripeAmount = (amount, currency) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
    }).format(amount / 100);
};
exports.formatStripeAmount = formatStripeAmount;
