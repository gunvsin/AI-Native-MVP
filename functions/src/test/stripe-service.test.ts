
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Mock dependencies before importing the function file
const mockList = jest.fn();
const mockBatchSet = jest.fn();
const mockBatchCommit = jest.fn();

jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => {
    return {charges: { list: mockList } };
  });
});

jest.mock('firebase-admin', () => ({
    apps: [],
    initializeApp: jest.fn(),
    firestore: () => ({
        batch: () => ({
            set: mockBatchSet,
            commit: mockBatchCommit,
        }),
        collection: (collectionPath: string) => ({
            doc: (docPath: string) => ({
                // This mock needs to be dynamic to handle different doc paths in the loop
                path: `${collectionPath}/${docPath}`,
            }),
        })
    }),
}));

// Now import the function
import { importStripeChargesLogic } from '../index';

describe('importStripeChargesLogic', () => {

    beforeEach(() => {
        // Clear mocks before each test
        mockList.mockClear();
        mockBatchSet.mockClear();
        mockBatchCommit.mockClear();
    });

    it('should import charges for a customer and save to Firestore', async () => {
        // Arrange
        const fakeCharges = [
            { id: 'ch_123', amount: 1000, currency: 'usd' },
            { id: 'ch_456', amount: 2000, currency: 'usd' },
        ];
        mockList.mockImplementation(async function* () {
            for (const charge of fakeCharges) {
                yield charge;
            }
        });
        mockBatchCommit.mockResolvedValue(null); // Simulate successful commit

        // Act
        const result = await importStripeChargesLogic('cus_123');

        // Assert
        expect(result.success).toBe(true);
        expect(result.message).toBe('Successfully imported 2 charges for customer cus_123.');
        expect(mockList).toHaveBeenCalledWith({ customer: 'cus_123' });

        // Check that Firestore batch operations were called correctly for each charge
        expect(mockBatchSet).toHaveBeenCalledTimes(2);
        expect(mockBatchSet).toHaveBeenNthCalledWith(1, expect.objectContaining({ path: 'stripe_charges/ch_123' }), fakeCharges[0]);
        expect(mockBatchSet).toHaveBeenNthCalledWith(2, expect.objectContaining({ path: 'stripe_charges/ch_456' }), fakeCharges[1]);
        expect(mockBatchCommit).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if Stripe API call fails', async () => {
        // Arrange
        const errorMessage = 'Stripe API Error';
        mockList.mockImplementation(() => {
            throw new Error(errorMessage);
        });

        // Act & Assert
        await expect(importStripeChargesLogic('cus_123')).rejects.toThrow(errorMessage);
    });
});
