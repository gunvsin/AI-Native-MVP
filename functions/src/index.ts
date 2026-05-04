
import { onCall, onRequest, HttpsError } from "firebase-functions/v2/https";
import { getChargesWithBackoff } from './stripe-service';
import { admin } from './init'; // Import the initialized admin SDK
import { Stripe } from 'stripe';
import { runStripeEtl } from "./stripe_etl";

/**
 * The core logic for importing Stripe charges. Exported for testability.
 * @param customerId The ID of the Stripe customer.
 * @returns An object indicating the result of the operation.
 */
export const importStripeChargesLogic = async (customerId: string) => {
    console.log(`Importing charges for customer: ${customerId}`);
    const charges = await getChargesWithBackoff(customerId);
    console.log(`Found ${charges.length} charges to import.`);

    const db = admin.firestore();
    const batch = db.batch();

    const chargesCollection = db.collection('stripe_charges');

    charges.forEach((charge: Stripe.Charge) => {
        const docRef = chargesCollection.doc(charge.id);
        batch.set(docRef, charge);
    });

    await batch.commit();

    const message = `Successfully imported ${charges.length} charges for customer ${customerId}.`;
    console.log(message);
    return {
        success: true,
        message: message,
    };
};

/**
 * A callable Cloud Function to import Stripe charges for a customer into Firestore.
 */
export const importStripeCharges = onCall(async (request) => {
    const customerId = request.data.customerId;

    if (!customerId) {
        throw new HttpsError('invalid-argument', 'The function must be called with a "customerId" argument.');
    }

    try {
        return await importStripeChargesLogic(customerId);
    } catch (error: any) {
        console.error("Failed to import Stripe charges:", error);
        throw new HttpsError('internal', 'Failed to import Stripe charges.', error.message);
    }
});

export const runEtl = onRequest(async (request, response) => {
    try {
        await runStripeEtl();
        response.status(200).send({ success: true, message: "ETL process completed successfully." });
    } catch (error: any) {
        console.error("Failed to run ETL process:", error);
        response.status(500).send({ success: false, message: "Failed to run ETL process." });
    }
});
