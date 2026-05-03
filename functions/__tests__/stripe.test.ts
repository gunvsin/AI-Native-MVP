process.env.STRIPE_SECRET_KEY = 'sk_test_123';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_123';

import { stripeWebhookHandler } from '../src/stripe-webhooks';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';

const STRIPE_SECRET_KEY = 'sk_test_123';
const STRIPE_WEBHOOK_SECRET = 'whsec_test_123';

const mockAdd = jest.fn(() => Promise.resolve({ id: 'test_transaction_id' }));
const mockSet = jest.fn(() => Promise.resolve());
const mockGet = jest.fn(() => Promise.resolve({ exists: false }));

// Mock Firebase Admin SDK
jest.mock('firebase-admin', () => ({
  apps: [],
  initializeApp: jest.fn(),
  firestore: () => ({
    collection: (path: string) => ({
      doc: (docPath: string) => ({
        get: mockGet,
        set: mockSet,
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
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should process a payment_intent.payment_failed event and save to Firestore', async () => {
    mockGet.mockResolvedValue({ exists: false });

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
    } as any;

    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    } as any;

    await stripeWebhookHandler(req, res);

    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      event_type: 'payment_intent.payment_failed',
      transactionId: 'test_transaction_id',
    });

    expect(mockAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'FAILED',
        error_reason: 'card_declined',
        stripe_payment_id: 'pi_test_failed',
      })
    );

    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({
        processed: true,
        type: 'payment_intent.payment_failed',
      })
    );
  });

  it('should return 200 for a duplicate event', async () => {
    mockGet.mockResolvedValue({ exists: true });

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
    } as any;

    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    } as any;

    await stripeWebhookHandler(req, res);

    expect(res.json).toHaveBeenCalledWith({ status: 'duplicate' });
  });
});
