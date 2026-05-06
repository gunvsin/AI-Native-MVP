
import { Stripe } from 'stripe';
import { getStripe } from './init';

const MAX_RETRIES = 5;
const INITIAL_DELAY_MS = 100;

// and use it in the function signature.
export const getSubscriptionsWithBackoff = async (customerId: string): Promise<Stripe.Subscription[]> => {
    let retries = 0;
    let delay = INITIAL_DELAY_MS;
    const stripe = getStripe(); // Initialize Stripe SDK on demand

    while (retries < MAX_RETRIES) {
        try {
            const subscriptions: Stripe.Subscription[] = [];
            for await (const subscription of stripe.subscriptions.list({ customer: customerId })) {
                subscriptions.push(subscription);
            }
            return subscriptions;
        } catch (err: any) {
            if (err.statusCode === 429 && retries < MAX_RETRIES - 1) {
                console.warn(`Stripe API rate limit exceeded. Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2; // Exponential backoff
                retries++;
            } else {
                console.error("Failed to fetch subscriptions from Stripe:", err);
                throw err;
            }
        }
    }

    throw new Error("Failed to fetch subscriptions from Stripe after multiple retries.");
};

/**
 * Fetches all charges from Stripe for a given customer, with exponential backoff for rate limiting.
 * @param customerId The ID of the Stripe customer.
 * @returns A promise that resolves to an array of Stripe Charge objects.
 */
export const getChargesWithBackoff = async (customerId: string): Promise<Stripe.Charge[]> => {
    let retries = 0;
    let delay = INITIAL_DELAY_MS;
    const stripe = getStripe(); // Initialize Stripe SDK on demand

    while (retries < MAX_RETRIES) {
        try {
            const charges: Stripe.Charge[] = [];
            for await (const charge of stripe.charges.list({ customer: customerId })) {
                charges.push(charge);
            }
            return charges;
        } catch (err: any) {
            if (err.statusCode === 429 && retries < MAX_RETRIES - 1) {
                console.warn(`Stripe API rate limit exceeded. Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2; // Exponential backoff
                retries++;
            } else {
                console.error("Failed to fetch charges from Stripe:", err);
                throw err;
            }
        }
    }

    throw new Error("Failed to fetch charges from Stripe after multiple retries.");
};

// A helper function to format Stripe amounts (in cents) to a human-readable format.
export const formatStripeAmount = (amount: number, currency: string): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
    }).format(amount / 100);
};