import { app } from '../src/app'; // Corrected import path
import request from 'supertest';
import Stripe from 'stripe';

process.env.STRIPE_SECRET_KEY = 'sk_test_123';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_123';


// Mock the Stripe SDK to prevent actual API calls
jest.mock('stripe', () => {
  const originalStripe = jest.requireActual('stripe');
  const constructEvent = jest.fn();
  return {
    __esModule: true,
    default: jest.fn().mockImplementation((...args) => {
      const stripeInstance = new originalStripe(...args);
      stripeInstance.webhooks.constructEvent = constructEvent;
      return stripeInstance;
    }),
    webhooks: {
      constructEvent,
    },
  };
});

describe('Stripe Webhook Security', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 if the Stripe signature is missing', async () => {
    await request(app)
      .post('/stripe-webhook')
      .send({ type: 'payment_intent.succeeded' })
      .expect(400);
  });

  it('should return 400 if the Stripe signature is invalid', async () => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2023-10-16' });
    (stripe.webhooks.constructEvent as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid signature');
    });

    await request(app)
      .post('/stripe-webhook')
      .set('stripe-signature', 'invalid_signature')
      .send({ type: 'payment_intent.succeeded' })
      .expect(400);
  });

});
