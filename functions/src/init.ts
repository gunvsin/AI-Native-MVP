
import * as admin from 'firebase-admin';
import Stripe from 'stripe';

// Initialize Firebase Admin SDK only once
if (!admin.apps.length) {
  admin.initializeApp();
}

let stripe: Stripe | null = null;

/**
 * Returns a singleton instance of the Stripe SDK.
 * @returns An instance of the Stripe SDK.
 */
export const getStripe = (): Stripe => {

    if (stripe) {
        return stripe;
    }

    stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: '2023-10-16',
    });

    return stripe;
};

// Export the initialized admin SDK
export { admin };
