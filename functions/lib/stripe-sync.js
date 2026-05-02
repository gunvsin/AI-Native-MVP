"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleStripeWebhook = exports.syncStripeData = void 0;
const init_1 = require("./init");
const stripe_service_1 = require("./stripe-service");
const validation_1 = require("./validation");
const db = init_1.admin.firestore();
const syncStripeData = async (userId) => {
    const userDocRef = db.collection('users').doc(userId);
    const userDoc = await userDocRef.get();
    if (!userDoc.exists) {
        throw new Error('User not found');
    }
    const stripeCustomerId = userDoc.data()?.stripeCustomerId;
    if (!stripeCustomerId) {
        throw new Error('Stripe customer ID not found for this user');
    }
    const subscriptions = await (0, stripe_service_1.getSubscriptionsWithBackoff)(stripeCustomerId);
    const batch = db.batch();
    for (const subscription of subscriptions) {
        const subscriptionDocRef = userDocRef.collection('subscriptions').doc(subscription.id);
        batch.set(subscriptionDocRef, subscription, { merge: true });
    }
    await batch.commit();
    console.log(`Successfully synced ${subscriptions.length} subscriptions for user ${userId}`);
};
exports.syncStripeData = syncStripeData;
const handleStripeWebhook = async (event) => {
    const validationResult = validation_1.stripeEventSchema.safeParse(event);
    if (!validationResult.success) {
        console.error('Stripe webhook validation failed:', validationResult.error);
        return;
    }
    const validatedEvent = validationResult.data;
    switch (validatedEvent.type) {
        case 'customer.subscription.updated':
        case 'customer.subscription.created': {
            const subscription = validatedEvent.data.object;
            const customerId = subscription.customer;
            const userQuery = await db.collection('users').where('stripeCustomerId', '==', customerId).limit(1).get();
            if (userQuery.empty) {
                console.warn(`No user found for Stripe customer ID: ${customerId}`);
                return;
            }
            const userDoc = userQuery.docs[0];
            const subscriptionRef = userDoc.ref.collection('subscriptions').doc(subscription.id);
            await subscriptionRef.set(subscription, { merge: true });
            break;
        }
        case 'customer.subscription.deleted': {
            const subscription = validatedEvent.data.object;
            const customerId = subscription.customer;
            const userQuery = await db.collection('users').where('stripeCustomerId', '==', customerId).limit(1).get();
            if (userQuery.empty) {
                console.warn(`No user found for Stripe customer ID: ${customerId}`);
                return;
            }
            const userDoc = userQuery.docs[0];
            const subscriptionRef = userDoc.ref.collection('subscriptions').doc(subscription.id);
            await subscriptionRef.delete();
            break;
        }
        default:
            console.log(`Unhandled Stripe event type: ${validatedEvent.type}`);
    }
};
exports.handleStripeWebhook = handleStripeWebhook;
