import { admin } from './init';
import { getSubscriptionsWithBackoff } from './stripe-service';
import Stripe from 'stripe';
import { stripeEventSchema } from './validation';

const db = admin.firestore();

export const syncStripeData = async (userId: string) => {
  const userDocRef = db.collection('users').doc(userId);
  const userDoc = await userDocRef.get();

  if (!userDoc.exists) {
    throw new Error('User not found');
  }

  const stripeCustomerId = userDoc.data()?.stripeCustomerId;

  if (!stripeCustomerId) {
    throw new Error('Stripe customer ID not found for this user');
  }

  const subscriptions = await getSubscriptionsWithBackoff(stripeCustomerId);

  const batch = db.batch();
  for (const subscription of subscriptions) {
    const subscriptionDocRef = userDocRef.collection('subscriptions').doc(subscription.id);
    batch.set(subscriptionDocRef, subscription, { merge: true });
  }

  await batch.commit();
  console.log(`Successfully synced ${subscriptions.length} subscriptions for user ${userId}`);
};

export const handleStripeWebhook = async (event: Stripe.Event) => {
  const validationResult = stripeEventSchema.safeParse(event);

  if (!validationResult.success) {
    console.error('Stripe webhook validation failed:', validationResult.error);
    return;
  }

  const validatedEvent = validationResult.data;

  switch (validatedEvent.type) {
    case 'customer.subscription.updated':
    case 'customer.subscription.created': {
      const subscription = validatedEvent.data.object as unknown as Stripe.Subscription;
      const customerId = subscription.customer as string;

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
        const subscription = validatedEvent.data.object as unknown as Stripe.Subscription;
        const customerId = subscription.customer as string;
  
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
