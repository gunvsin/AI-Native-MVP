
// Mock the entire init module to control the admin and db objects
jest.mock('../init', () => {
  const firestoreMock = {
    collection: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    get: jest.fn().mockResolvedValue({
      empty: false,
      docs: [
        {
          ref: {
            collection: jest.fn().mockReturnThis(),
            doc: jest.fn().mockReturnThis(),
            set: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    }),
  };
  return {
    admin: {
      initializeApp: jest.fn(),
      firestore: jest.fn(() => firestoreMock),
    },
    // Ensure getStripe is also mocked if it's used in the tested file
    getStripe: jest.fn(),
  };
});

import { handleStripeWebhook } from '../stripe-sync';
import Stripe from 'stripe';
import { admin } from '../init'; // This will be the mock from above

describe('handleStripeWebhook', () => {
  it('should process customer.subscription.updated event', async () => {
    const mockEvent: Stripe.Event = {
      id: 'evt_123',
      object: 'event',
      api_version: '2024-04-10',
      created: Date.now(),
      data: {
        object: {
          id: 'sub_123',
          object: 'subscription',
          customer: 'cus_123',
          status: 'active',
        } as Stripe.Subscription,
      },
      livemode: false,
      pending_webhooks: 0,
      request: { id: null, idempotency_key: null },
      type: 'customer.subscription.updated',
    };

    // Cast to access the jest.Mock functions
    const mockFirestore = admin.firestore() as any;

    await handleStripeWebhook(mockEvent);

    expect(mockFirestore.collection).toHaveBeenCalledWith('users');
    expect(mockFirestore.where).toHaveBeenCalledWith('stripeCustomerId', '==', 'cus_123');
    expect(mockFirestore.get).toHaveBeenCalled();
  });
});
