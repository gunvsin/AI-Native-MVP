"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculatePerformanceMetrics = exports.stripeWebhook = exports.runEtl = exports.importStripeCharges = exports.importStripeChargesLogic = exports.saveReasoningAudit = exports.runStripeEtl = void 0;
const https_1 = require("firebase-functions/v2/https");
const stripe_service_1 = require("./stripe-service");
const init_1 = require("./init");
const logger = __importStar(require("firebase-functions/logger"));
const validation_1 = require("./validation");
const scheduler_1 = require("firebase-functions/v2/scheduler");
const transformChargesToFctTransactions = (charges) => {
    console.log('Transforming charges to fct_transactions format...');
    const transformedData = charges.map(charge => ({
        transaction_id: charge.id,
        date_id: charge.created,
        customer_id: typeof charge.customer === 'string' ? charge.customer : null,
        product_id: null,
        transaction_type: 'charge',
        amount: charge.amount / 100.0,
        currency: charge.currency,
        stripe_charge_id: charge.id,
        stripe_refund_id: null,
        stripe_payout_id: null,
        status: charge.status,
    }));
    console.log(`Successfully transformed ${transformedData.length} records.`);
    return transformedData;
};
const loadDataToWarehouse = (data, tableName) => {
    console.log(`Loading ${data.length} records into data warehouse table: ${tableName}...`);
    data.slice(0, 5).forEach(record => console.log(record));
    console.log('Data loading simulation complete.');
};
const runStripeEtl = async () => {
    const stripe = (0, init_1.getStripe)();
    console.log('Extracting all charges from Stripe...');
    try {
        const charges = [];
        for await (const charge of stripe.charges.list({ limit: 100 })) {
            charges.push(charge);
        }
        console.log(`Successfully extracted ${charges.length} charges.`);
        if (charges.length > 0) {
            const fct_transactions = transformChargesToFctTransactions(charges);
            loadDataToWarehouse(fct_transactions, 'fct_transactions');
        }
    }
    catch (err) {
        if (err.statusCode === 429) {
            console.error('Stripe API rate limit exceeded. In a real implementation, we would handle this with backoff and retry.');
        }
        else {
            console.error('An error occurred during the ETL process:', err);
        }
    }
};
exports.runStripeEtl = runStripeEtl;
// from feedback.ts
const saveReasoningAudit = async (auditData) => {
    try {
        const auditLog = {
            ...auditData,
            loggedAt: init_1.admin.firestore.FieldValue.serverTimestamp(),
        };
        await init_1.admin.firestore().collection("reasoning_audits").add(auditLog);
        logger.info(`[Reasoning Audit] Successfully saved reasoning audit for user action: ${auditData.userAction}`);
    }
    catch (error) {
        logger.error("[Reasoning Audit] Error saving reasoning audit:", error);
    }
};
exports.saveReasoningAudit = saveReasoningAudit;
// from index.ts
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
exports.importStripeCharges = (0, https_1.onCall)({ region: "australia-southeast1", secrets: ["STRIPE_SECRET_KEY"] }, async (request) => {
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
exports.runEtl = (0, https_1.onRequest)({ region: "australia-southeast1", secrets: ["STRIPE_SECRET_KEY"] }, async (request, response) => {
    try {
        await (0, exports.runStripeEtl)();
        response.status(200).send({ success: true, message: "ETL process completed successfully." });
    }
    catch (error) {
        console.error("Failed to run ETL process:", error);
        response.status(500).send({ success: false, message: "Failed to run ETL process." });
    }
});
if (!init_1.admin.apps.length) {
    init_1.admin.initializeApp();
}
exports.stripeWebhook = (0, https_1.onRequest)({ secrets: ["STRIPE_WEBHOOK_SECRET", "STRIPE_SECRET_KEY"], region: "australia-southeast1" }, async (req, res) => {
    const stripe = (0, init_1.getStripe)();
    const firestore = init_1.admin.firestore();
    let event;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
        console.error("Stripe webhook secret is not available in the environment.");
        res.status(500).send("Internal server error: Webhook secret not configured.");
        return;
    }
    const signature = req.headers["stripe-signature"];
    if (!signature) {
        res.status(400).send("Webhook signature is missing.");
        return;
    }
    try {
        event = stripe.webhooks.constructEvent(req.rawBody, signature, webhookSecret);
    }
    catch (err) {
        console.log(`❌ Error verifying webhook signature: ${err.message}`);
        res.status(400).send("Webhook Error: Signature verification failed.");
        return;
    }
    const validationResult = validation_1.stripeEventSchema.safeParse(event);
    if (!validationResult.success) {
        console.error("Zod validation failed:", validationResult.error);
        res.status(400).send("Invalid webhook payload.");
        return;
    }
    const validatedEvent = validationResult.data;
    const eventRef = firestore.collection('stripe_events').doc(validatedEvent.id);
    const doc = await eventRef.get();
    if (doc.exists) {
        console.log("Duplicate event received, ignoring.");
        res.status(200).json({ status: "duplicate" });
        return;
    }
    switch (validatedEvent.type) {
        case 'payment_intent.succeeded': {
            const pi = validatedEvent.data.object;
            const transactionsCollection = firestore.collection('transactions');
            const { id } = await transactionsCollection.add({
                status: 'COMPLETED',
                stripe_payment_id: pi.id,
            });
            await eventRef.set({ processed: true, type: validatedEvent.type });
            res.status(200).json({ status: 'success', event_type: validatedEvent.type, transactionId: id });
            return;
        }
        case 'payment_intent.payment_failed': {
            const pi = validatedEvent.data.object;
            const transactionsCollection = firestore.collection('transactions');
            const { id } = await transactionsCollection.add({
                status: 'FAILED',
                error_reason: pi.last_payment_error?.code,
                stripe_payment_id: pi.id,
            });
            await eventRef.set({ processed: true, type: validatedEvent.type });
            res.status(200).json({ status: 'success', event_type: validatedEvent.type, transactionId: id });
            return;
        }
        case "checkout.session.completed":
            const session = validatedEvent.data.object;
            console.log("Checkout session completed:", session.id);
            const reasoningAuditString = session?.metadata?.reasoning_audit;
            if (reasoningAuditString && typeof reasoningAuditString === 'string') {
                try {
                    const audit = validation_1.reasoningAuditSchema.safeParse(JSON.parse(reasoningAuditString));
                    if (audit.success) {
                        console.log("Reasoning audit is valid:", audit.data);
                        await (0, exports.saveReasoningAudit)(audit.data);
                    }
                    else {
                        console.error("Invalid reasoning audit:", audit.error);
                    }
                }
                catch (e) {
                    console.error('Error parsing reasoning_audit', e);
                }
            }
            break;
        case "customer.subscription.deleted":
            break;
        default:
            console.log(`Unhandled event type ${validatedEvent.type}`);
    }
    res.json({ received: true });
});
// from feedback.ts
// export const logCorrection = onDocumentUpdated({ region: "australia-southeast1", document: "transactions/{docId}" }, async (event) => {
//   const before = event.data?.before.data();
//   const after = event.data?.after.data();
// 
//   if (!before?.analysis || !after?.analysis) {
//     return;
//   }
// 
//   try {
//     const wasCorrected = before.analysis.category !== after.analysis.category &&
//                          'confidence_score' in before.analysis &&
//                          after.analysis.needs_review === false;
// 
//     if (wasCorrected) {
//       logger.info(`[Feedback Loop] Correction detected for doc: ${event.params.docId}`);
//       
//       const correctionLog = {
//         transactionId: event.params.docId,
//         description: after.description,
//         original_ai_prediction: before.analysis.category,
//         user_correction: after.analysis.category,
//         confidence_at_time: before.analysis.confidence_score,
//         reasoning: before.analysis.reasoning || "N/A", 
//         loggedAt: admin.firestore.FieldValue.serverTimestamp(),
//         corrected_by_user_id: after.analysis.reviewed_by_user_id || "UNKNOWN",
//         correction_reason: after.analysis.correction_reason || "N/A",
//       };
// 
//       await admin.firestore().collection("ai_feedback_loop").add(correctionLog);
//       
//       logger.info(`[Feedback Loop] Successfully logged correction for doc: ${event.params.docId}`);
//     }
//   } catch (error) {
//     logger.error(`[Feedback Loop] Error processing document ${event.params.docId}:`, error);
//   }
// });
// from performance.ts
exports.calculatePerformanceMetrics = (0, scheduler_1.onSchedule)({ region: "australia-southeast1", schedule: "every 24 hours" }, async (event) => {
    try {
        logger.info("[Performance] Starting AI performance metrics calculation.");
        const now = new Date();
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        const snapshot = await init_1.admin
            .firestore()
            .collection("ai_feedback_loop")
            .where("loggedAt", ">=", yesterday)
            .where("loggedAt", "<", now)
            .get();
        const dailyCorrections = snapshot.size;
        const confidenceDistribution = {
            '0-25': 0,
            '25-50': 0,
            '50-75': 0,
            '75-100': 0,
        };
        if (!snapshot.empty) {
            snapshot.docs.forEach(doc => {
                const confidence = doc.data().confidence_at_time * 100;
                if (confidence >= 0 && confidence < 25) {
                    confidenceDistribution['0-25']++;
                }
                else if (confidence >= 25 && confidence < 50) {
                    confidenceDistribution['25-50']++;
                }
                else if (confidence >= 50 && confidence < 75) {
                    confidenceDistribution['50-75']++;
                }
                else if (confidence >= 75 && confidence <= 100) {
                    confidenceDistribution['75-100']++;
                }
            });
        }
        const metrics = {
            date: now.toISOString().split('T')[0],
            dailyCorrections: dailyCorrections,
            confidenceDistributionOfCorrections: confidenceDistribution,
            lastCalculated: init_1.admin.firestore.FieldValue.serverTimestamp(),
        };
        await init_1.admin.firestore().collection("ai_performance_metrics").add(metrics);
        logger.info(`[Performance] Successfully calculated and stored AI performance metrics: ${dailyCorrections} corrections.`);
    }
    catch (error) {
        logger.error("[Performance] Error calculating AI performance metrics:", error);
    }
});
