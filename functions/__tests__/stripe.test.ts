import { handleStripeWebhook } from '../src/index';
import * as admin from 'firebase-admin';
import { https } from 'firebase-functions';
import Stripe from 'stripe';

const STRIPE_SECRET_KEY = 'sk_test_123';
const STRIPE_WEBHOOK_SECRET = 'whsec_test_123';

jest.mock('../src/config', () => ({
  __esModule: true,
  stripeConfig: {
    secret_key: {
      value: () => STRIPE_SECRET_KEY,
    },
    webhook_secret: {
      value: () => STRIPE_WEBHOOK_SECRET,
    },
  },
}));

const mockAdd = jest.fn(() => Promise.resolve({ id: 'test_transaction_id' }));

// Mock Firebase Admin SDK
jest.mock('firebase-admin', () => ({
  apps: [],
  initializeApp: jest.fn(),
  firestore: () => ({
    collection: (path: string) => ({
      doc: (docPath: string) => ({
        get: jest.fn(() => Promise.resolve({ exists: false })),
        set: jest.fn(() => Promise.resolve()),
      }),
      add: mockAdd,
    }),
  }),
}));

// Mock Firebase Functions logger
jest.mock('firebase-functions/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

describe('Stripe Webhook Handler', () => {
  let docSpy: jest.SpyInstance;

  afterEach(() => {
    jest.clearAllMocks();
    if (docSpy) {
      docSpy.mockRestore();
    }
  });

  it('should process a payment_intent.payment_failed event and save to Firestore', async () => {
    const firestore = admin.firestore();
    docSpy = jest.spyOn(firestore.collection('stripe_events'), 'doc');
    docSpy.mockReturnValue({
        get: jest.fn().mockResolvedValue({ exists: false }),
        set: jest.fn().mockResolvedValue(undefined),
    } as any);

    const mockEvent: Stripe.Event = {
      id: 'evt_test_failed_payment',
      object: 'event',
      api_version: '2023-10-16',
      created: Math.floor(Date.now() / 1000),
      livemode: false,
      pending_webhooks: 0,
      request: { id: null, idempotency_key: null },
      data: {
        object: {
          id: 'pi_test_failed',
          object: 'payment_intent',
          amount: 5000,
          currency: 'usd',
          last_payment_error: {
            code: 'card_declined',
            message: 'Your card was declined.',
          },
          metadata: {
            internal_user_id: 'user_123',
            order_id: 'order_456',
          },
        } as any,
      },
      type: 'payment_intent.payment_failed',
    };

    const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });
    const payloadString = JSON.stringify(mockEvent, null, 2);
    const signature = stripe.webhooks.generateTestHeaderString({
      payload: payloadString,
      secret: STRIPE_WEBHOOK_SECRET,
    });

    const req = {
      headers: { 'stripe-signature': signature },
      rawBody: Buffer.from(payloadString),
    } as unknown as https.Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    } as any;

    await handleStripeWebhook(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      status: 'success',
      event_type: 'payment_intent.payment_failed',
      transactionId: 'test_transaction_id',
    });

    const transactionsCollection = firestore.collection('transactions');
    const eventRef = firestore.collection('stripe_events').doc(mockEvent.id);

    expect(transactionsCollection.add).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'FAILED',
        error_reason: 'card_declined',
        stripe_payment_id: 'pi_test_failed',
      })
    );

    expect(eventRef.set).toHaveBeenCalledWith(
      expect.objectContaining({
        processed: true,
        type: 'payment_intent.payment_failed',
      })
    );
  });

  it('should return 200 for a duplicate event', async () => {
    const firestore = admin.firestore();
    docSpy = jest.spyOn(firestore.collection('stripe_events'), 'doc');
    docSpy.mockReturnValue({
        get: jest.fn().mockResolvedValue({ exists: true }),
        set: jest.fn().mockResolvedValue(undefined),
    } as any);

    const mockEvent: Stripe.Event = {
      id: 'evt_duplicate_event',
      object: 'event',
      api_version: '2023-10-16',
      created: Math.floor(Date.now() / 1000),
      livemode: false,
      pending_webhooks: 0,
      request: { id: null, idempotency_key: null },
      data: { object: {} as any },
      type: 'payment_intent.succeeded',
    };

    const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });
    const payloadString = JSON.stringify(mockEvent, null, 2);
    const signature = stripe.webhooks.generateTestHeaderString({
      payload: payloadString,
      secret: STRIPE_WEBHOOK_SECRET,
    });

    const req = {
      headers: { 'stripe-signature': signature },
      rawBody: Buffer.from(payloadString),
    } as unknown as https.Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    } as any;

    await handleStripeWebhook(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(`Event ${mockEvent.id} already processed.`);
    expect(mockAdd).not.toHaveBeenCalled();
  });
});
