import { getStripe } from './init';
import type Stripe from 'stripe';

const MAX_RETRIES = 5;
const INITIAL_DELAY_MS = 100;

// Correctly import the Subscription type from the Stripe library
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
        console.warn(`Stripe API rate limit hit. Retrying in ${delay}ms...`);
        await new Promise(res => setTimeout(res, delay));
        delay *= 2;
        retries++;
      } else {
        throw err;
      }
    }
  }

  throw new Error('Stripe API request failed after maximum retries.');
};

export const formatStripeAmount = (amount: number | null | undefined, currency: string): string => {
  const amountInCents = amount ?? 0;
  const amountInMajorUnit = amountInCents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amountInMajorUnit);
};