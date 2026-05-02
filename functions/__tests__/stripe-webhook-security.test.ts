import Stripe from 'stripe';
import { app } from '../../src/app'; // Adjust the import path as needed
import * as request from 'supertest';

// Mock the Stripe SDK to prevent actual API calls
jest.mock('stripe', () => {
  const originalStripe = jest.requireActual('stripe');
  return {
    ...originalStripe,
    webhooks: {
      constructEvent: jest.fn(),
    },
  };
});

// A mock webhook secret for testing purposes
const MOCK_WEBHOOK_SECRET = 'whsec_test_secret';
process.env.STRIPE_WEBHOOK_SECRET = MOCK_WEBHOOK_SECRET;

describe('Stripe Webhook Security Audit', () => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-06-20' });

  it('should return a 400 Bad Request error if the Stripe signature is missing', async () => {
    const response = await request(app)
      .post('/api/stripe/webhooks')
      .send({ type: 'test.event' });

    expect(response.status).toBe(400);
  });

  it('should return a 400 Bad Request error if the Stripe signature is invalid', async () => {
    const payload = JSON.stringify({ type: 'test.event' }, null, 2);
    const timestamp = Math.floor(Date.now() / 1000);
    
    // Generate a signature with the WRONG secret
    const signature = stripe.webhooks.generateTestHeaderString({
      payload,
      timestamp,
      secret: 'whsec_invalid_secret',
    });

    (Stripe.webhooks.constructEvent as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid signature');
    });

    const response = await request(app)
      .post('/api/stripe/webhooks')
      .set('stripe-signature', signature)
      .type('json')
      .send(payload);

    expect(response.status).toBe(400);
  });

  it('should return a 200 OK for a valid signature and payload', async () => {
    const payload = JSON.stringify({ id: 'evt_test', object: 'event', type: 'test.event' });
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = stripe.webhooks.generateTestHeaderString({
      payload,
      timestamp,
      secret: MOCK_WEBHOOK_SECRET,
    });

    (Stripe.webhooks.constructEvent as jest.Mock).mockReturnValue({
      id: 'evt_test',
      object: 'event',
      type: 'test.event',
      data: { object: {} },
    } as any);

    const response = await request(app)
      .post('/api/stripe/webhooks')
      .set('stripe-signature', signature)
      .type('json')
      .send(payload);

    expect(response.status).toBe(200);
  });
});
