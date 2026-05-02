"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatStripeAmount = exports.getSubscriptionsWithBackoff = void 0;
const init_1 = require("./init");
const MAX_RETRIES = 5;
const INITIAL_DELAY_MS = 100;
// Correctly import the Subscription type from the Stripe library
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
                console.warn(`Stripe API rate limit hit. Retrying in ${delay}ms...`);
                await new Promise(res => setTimeout(res, delay));
                delay *= 2;
                retries++;
            }
            else {
                throw err;
            }
        }
    }
    throw new Error('Stripe API request failed after maximum retries.');
};
exports.getSubscriptionsWithBackoff = getSubscriptionsWithBackoff;
const formatStripeAmount = (amount, currency) => {
    const amountInCents = amount ?? 0;
    const amountInMajorUnit = amountInCents / 100;
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency.toUpperCase(),
    }).format(amountInMajorUnit);
};
exports.formatStripeAmount = formatStripeAmount;
