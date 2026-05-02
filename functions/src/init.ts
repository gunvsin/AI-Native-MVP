import * as admin from "firebase-admin";
import Stripe from "stripe";

let stripe: Stripe | null = null;

admin.initializeApp();

export const getStripe = (): Stripe => {
    if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error("Stripe secret key is not configured.");
    }

    if (stripe) {
        return stripe;
    }

    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: "2023-10-16",
        typescript: true,
    });

    return stripe;
};

export { admin };
