import Stripe from 'stripe';
import { app } from '../src/app'; // Corrected import path
import request from 'supertest';

// Mock the Stripe SDK to prevent actual API calls
jest.mock('stripe', () => {
  const originalStripe = jest.requireActual('stripe');
  return {
    __esModule: true,
    default: jest.fn().mockImplementation((...args) => {
      return new originalStripe(...args);
    }),
    webhooks: {
      constructEvent: jest.fn(),
    },
  };
});

describe('Stripe Webhook Security', () => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2023-10-16' });

  it('should return 400 if the Stripe signature is missing', async () => {
    await request(app)
      .post('/stripe-webhook')
      .send({ type: 'payment_intent.succeeded' })
      .expect(400);
  });

  it('should return 400 if the Stripe signature is invalid', async () => {
    (stripe.webhooks.constructEvent as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid signature');
    });

    await request(app)
      .post('/stripe-webhook')
      .set('stripe-signature', 'invalid_signature')
      .send({ type: 'payment_intent.succeeded' })
      .expect(400);
  });

  // Add more tests for other security aspects, like payload inspection
});
