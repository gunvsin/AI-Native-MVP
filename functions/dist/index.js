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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDatabase = exports.api = exports.handleStripeWebhook = exports.getTheme = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const https_1 = require("firebase-functions/v2/https");
const logger = __importStar(require("firebase-functions/logger"));
const admin = __importStar(require("firebase-admin"));
const zod_1 = require("zod");
const stripe_1 = __importDefault(require("stripe"));
const config_1 = require("./config"); // Correctly import the config object
const themeSchema_1 = require("./schemas/themeSchema");
const data_analysis_1 = require("./data-analysis");
const financialDataSchema_1 = require("./schemas/financialDataSchema");
const db_1 = require("./db");
// Initialize Firebase Admin SDK
admin.initializeApp();
// --- Express App for REST API ---
exports.app = (0, express_1.default)();
// Middleware to parse JSON bodies, with a verifier to capture the raw body for Stripe
exports.app.use(express_1.default.json({
    verify: (req, res, buf) => {
        req.rawBody = buf;
    }
}));
// Authentication middleware to verify Firebase ID tokens
const authenticate = async (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization || !authorization.startsWith('Bearer ')) {
        res.status(401).send('Unauthorized: No token provided.');
        return;
    }
    const idToken = authorization.split('Bearer ')[1];
    try {
        const decodedIdToken = await admin.auth().verifyIdToken(idToken);
        req.user = decodedIdToken;
        next();
    }
    catch (error) {
        logger.error('Error verifying Firebase ID token:', error);
        res.status(403).send('Forbidden: Invalid token.');
    }
};
const getTheme = (req, res) => {
    try {
        const validatedTheme = themeSchema_1.ThemeSchema.parse(themeSchema_1.DESIGN_PALETTE);
        res.json(validatedTheme);
    }
    catch (error) {
        logger.error('Theme validation failed:', error);
        res.status(500).send('Internal Server Error: Invalid theme configuration.');
    }
};
exports.getTheme = getTheme;
const fetchFinancialData = async () => {
    const snapshot = await db_1.db.collection('financialData').get();
    const records = [];
    snapshot.forEach(doc => {
        const data = doc.data();
        const record = financialDataSchema_1.FinancialRecordSchema.parse(data);
        records.push(record);
    });
    return records;
};
// Handler for financial summary
const getFinancialSummary = async (req, res) => {
    try {
        const records = await fetchFinancialData();
        if (records.length === 0) {
            res.status(404).json({ message: "No financial data available." });
            return;
        }
        const { totalRevenue, totalProfit } = (0, data_analysis_1.analyzeFinancialData)(records);
        const summaryData = {
            totalRevenue: totalRevenue,
            netIncome: totalProfit, // Assuming netIncome is totalProfit
            quarterlyGrowth: 5.2, // Placeholder for quarterly growth
        };
        res.json(summaryData);
    }
    catch (error) {
        logger.error('Error fetching or analyzing financial data:', error);
        res.status(500).send('Internal Server Error');
    }
};
// Public route for theme configuration
exports.app.get('/theme', exports.getTheme);
// Public route for financial summary
exports.app.get('/api/financial-summary', getFinancialSummary);
const handleStripeWebhook = async (req, res) => {
    // **FIX**: Use .value() to get the actual secret string.
    const stripeSecret = config_1.config.stripe.secret_key.value();
    const stripeWebhookSecret = config_1.config.stripe.webhook_secret.value();
    if (!stripeSecret || !stripeWebhookSecret) {
        logger.error('Stripe secrets are not configured. Ensure STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET are set.');
        res.status(500).send('Internal Server Error: Stripe configuration missing.');
        return;
    }
    const stripe = new stripe_1.default(stripeSecret, { apiVersion: '2023-10-16' });
    let event;
    try {
        const signature = req.headers['stripe-signature'];
        // **FIX**: Use the retrieved secret value for verification.
        event = stripe.webhooks.constructEvent(req.rawBody, signature, stripeWebhookSecret);
    }
    catch (error) {
        logger.error('Stripe webhook signature verification failed.', error);
        res.status(400).send(`Webhook Error: ${error.message}`);
        return;
    }
    const eventRef = db_1.db.collection('stripe_events').doc(event.id);
    const doc = await eventRef.get();
    if (doc.exists) {
        logger.warn(`Idempotency key match: Event ${event.id} already processed.`);
        res.status(200).send(`Event ${event.id} already processed.`);
        return;
    }
    const dataObject = event.data.object;
    const transactionsCollection = db_1.db.collection('transactions');
    let transactionId;
    let status;
    let amount;
    let errorReason = null;
    switch (event.type) {
        case 'payment_intent.succeeded':
            status = 'PAID';
            amount = dataObject.amount / 100;
            break;
        case 'payment_intent.payment_failed':
            status = 'FAILED';
            amount = dataObject.amount / 100;
            errorReason = dataObject.last_payment_error?.code || 'unknown_error';
            break;
        default:
            logger.warn(`Unhandled event type: ${event.type}`);
            res.status(200).send(`Unhandled event type: ${event.type}`);
            return;
    }
    try {
        const newTransactionRef = await transactionsCollection.add({
            stripe_payment_id: dataObject.id,
            user_id: dataObject.metadata.internal_user_id,
            order_id: dataObject.metadata.order_id,
            amount_total: amount,
            currency: dataObject.currency,
            status: status,
            created_at: admin.firestore.FieldValue.serverTimestamp(),
            processed_event_id: event.id,
            ...(errorReason && { error_reason: errorReason }),
        });
        transactionId = newTransactionRef.id;
        await eventRef.set({
            type: event.type,
            created_at: admin.firestore.Timestamp.fromMillis(event.created * 1000),
            data: event.data.object,
            processed: true,
        });
    }
    catch (error) {
        logger.error(`Failed to create transaction for event ${event.id}.`, error);
        res.status(500).send('Internal Server Error: Could not save transaction.');
        return;
    }
    res.status(200).send({ status: 'success', transactionId });
};
exports.handleStripeWebhook = handleStripeWebhook;
// Export the webhook with the secrets attached
exports.api = (0, https_1.onRequest)({ secrets: ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"] }, (req, res) => {
    // Route the request to the correct handler based on the URL
    if (req.path.startsWith("/api/stripe-webhook")) {
        return (0, exports.handleStripeWebhook)(req, res);
    }
    // You can add more routing logic here for other endpoints
    return (0, exports.app)(req, res); // Default to the Express app
});
// Protected route for financial data verification
exports.app.post('/api/verify', authenticate, async (req, res) => {
    const validationResult = financialDataSchema_1.FinancialDataSchema.safeParse(req.body.data);
    if (!validationResult.success) {
        res.status(400).json({
            message: 'Invalid data format.',
            errors: validationResult.error.flatten(),
        });
        return;
    }
    try {
        const analysisResult = (0, data_analysis_1.analyzeFinancialData)(validationResult.data);
        const uid = req.user.uid;
        const userAnalysisRef = db_1.db.collection('userAnalysis').doc(uid);
        await userAnalysisRef.set({ latestAnalysis: analysisResult, lastUpdated: new Date() }, { merge: true });
        res.status(200).json(analysisResult);
    }
    catch (error) {
        logger.error('Error during financial analysis or database operation:', error);
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).send(`Internal data processing error: ${error.message}`);
            return;
        }
        res.status(500).send('Internal Server Error');
    }
});
// --- Callable Functions ---
// Temporary function to seed the database
exports.seedDatabase = (0, https_1.onRequest)(async (req, res) => {
    const financialData = [
        { date: '2023-01-15', revenue: 5000, expenses: 1500 },
        { date: '2023-02-10', revenue: 5500, expenses: 1700 },
        { date: '2023-03-20', revenue: 6000, expenses: 1800 },
    ];
    try {
        for (const data of financialData) {
            await db_1.db.collection('financialData').add(data);
        }
        res.status(200).send('Database seeded successfully.');
    }
    catch (error) {
        logger.error('Error seeding database:', error);
        res.status(500).send('Error seeding database.');
    }
});
