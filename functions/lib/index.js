"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runEtl = exports.importStripeCharges = exports.importStripeChargesLogic = void 0;
const https_1 = require("firebase-functions/v2/https");
const stripe_service_1 = require("./stripe-service");
const init_1 = require("./init"); // Import the initialized admin SDK
const stripe_etl_1 = require("./stripe_etl");
/**
 * The core logic for importing Stripe charges. Exported for testability.
 * @param customerId The ID of the Stripe customer.
 * @returns An object indicating the result of the operation.
 */
const importStripeChargesLogic = async (customerId) => {
    console.log(`Importing charges for customer: ${customerId}`);
    const charges = await (0, stripe_service_1.getChargesWithBackoff)(customerId);
    console.log(`Found ${charges.length} charges to import.`);
    const db = init_1.admin.firestore();
    const batch = db.batch();
    const chargesCollection = db.collection('stripe_charges');
    charges.forEach((charge) => {
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
exports.importStripeChargesLogic = importStripeChargesLogic;
/**
 * A callable Cloud Function to import Stripe charges for a customer into Firestore.
 */
exports.importStripeCharges = (0, https_1.onCall)(async (request) => {
    const customerId = request.data.customerId;
    if (!customerId) {
        throw new https_1.HttpsError('invalid-argument', 'The function must be called with a "customerId" argument.');
    }
    try {
        return await (0, exports.importStripeChargesLogic)(customerId);
    }
    catch (error) {
        console.error("Failed to import Stripe charges:", error);
        throw new https_1.HttpsError('internal', 'Failed to import Stripe charges.', error.message);
    }
});
exports.runEtl = (0, https_1.onRequest)(async (request, response) => {
    try {
        await (0, stripe_etl_1.runStripeEtl)();
        response.status(200).send({ success: true, message: "ETL process completed successfully." });
    }
    catch (error) {
        console.error("Failed to run ETL process:", error);
        response.status(500).send({ success: false, message: "Failed to run ETL process." });
    }
});
