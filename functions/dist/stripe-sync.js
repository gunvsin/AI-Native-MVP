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
exports.testStripeConnection = testStripeConnection;
exports.fetchStripeEvents = fetchStripeEvents;
exports.loadEventsIntoDB = loadEventsIntoDB;
exports.syncStripeEvents = syncStripeEvents;
const admin = __importStar(require("firebase-admin"));
const stripe_1 = __importDefault(require("stripe"));
const config_1 = require("./config");
// Initialize Firebase Admin SDK
if (!admin.apps.length) {
    admin.initializeApp();
}
const db = admin.firestore();
/**
 * A basic test function to verify the Stripe API connection.
 */
async function testStripeConnection() {
    if (!config_1.config.stripe.secret_key) {
        console.error('Stripe secret key is not configured.');
        return false;
    }
    const stripe = new stripe_1.default(config_1.config.stripe.secret_key, { apiVersion: '2023-10-16' });
    try {
        const account = await stripe.accounts.retrieve();
        console.log('Successfully connected to Stripe. Account ID:', account.id);
        return true;
    }
    catch (error) {
        console.error('Failed to connect to Stripe:', error);
        return false;
    }
}
const eventsCollection = db.collection('stripe_events');
/**
 * Fetches recent Stripe events, with support for pagination.
 */
async function fetchStripeEvents(eventTypes = [], limit = 100) {
    if (!config_1.config.stripe.secret_key) {
        console.error('Stripe secret key is not configured.');
        throw new Error('Stripe secret key is not configured.');
    }
    const stripe = new stripe_1.default(config_1.config.stripe.secret_key, { apiVersion: '2023-10-16' });
    console.log('Fetching Stripe events...');
    try {
        let hasMore = true;
        let startingAfter = undefined;
        const allEvents = [];
        while (hasMore) {
            const events = await stripe.events.list({
                limit,
                types: eventTypes.length > 0 ? eventTypes : undefined,
                starting_after: startingAfter,
            });
            if (events.data.length > 0) {
                allEvents.push(...events.data);
                startingAfter = events.data[events.data.length - 1].id;
                hasMore = events.has_more;
            }
            else {
                hasMore = false;
            }
        }
        console.log(`Successfully fetched ${allEvents.length} events from Stripe.`);
        return allEvents;
    }
    catch (error) {
        console.error('Error fetching Stripe events:', error);
        throw error;
    }
}
/**
 * Inserts fetched Stripe events into Firestore, ensuring idempotency.
 */
async function loadEventsIntoDB(events) {
    console.log(`Attempting to load ${events.length} events into the database...`);
    const batch = db.batch();
    let newEventsCount = 0;
    for (const event of events) {
        const eventRef = eventsCollection.doc(event.id);
        const doc = await eventRef.get();
        if (doc.exists) {
            console.log(`Skipping duplicate event: ${event.id}`);
            continue;
        }
        batch.set(eventRef, {
            type: event.type,
            created_at: admin.firestore.Timestamp.fromMillis(event.created * 1000),
            data: event.data.object,
        });
        newEventsCount++;
    }
    if (newEventsCount > 0) {
        try {
            await batch.commit();
            console.log(`Successfully inserted ${newEventsCount} new events into the database.`);
        }
        catch (error) {
            console.error('Error committing batch to Firestore:', error);
            throw error;
        }
    }
    else {
        console.log('No new events to insert.');
    }
}
/**
 * Main function to orchestrate fetching Stripe events and loading them into the database.
 */
async function syncStripeEvents() {
    try {
        if (!(await testStripeConnection())) {
            return;
        }
        const eventTypesToFetch = [
            'payment_intent.succeeded',
            'payment_intent.payment_failed',
            'customer.subscription.created',
        ];
        const events = await fetchStripeEvents(eventTypesToFetch);
        if (events.length > 0) {
            await loadEventsIntoDB(events);
        }
        console.log('Stripe event synchronization completed successfully.');
    }
    catch (error) {
        console.error('An error occurred during Stripe event synchronization:', error);
    }
}
