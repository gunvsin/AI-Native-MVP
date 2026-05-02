"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const mockSet = jest.fn().mockResolvedValue(undefined);
const mockDoc = jest.fn(() => ({ set: mockSet }));
const mockCollection = jest.fn(() => ({ doc: mockDoc }));
const mockVerifyIdToken = jest.fn();
jest.mock('firebase-admin', () => ({
    initializeApp: jest.fn(),
    apps: ['mock-app'],
    auth: () => ({ verifyIdToken: mockVerifyIdToken }),
    firestore: Object.assign(() => ({ collection: mockCollection, settings: jest.fn() }), { FieldValue: { serverTimestamp: () => 'mock-timestamp' } }),
}));
jest.mock('firebase-functions', () => ({
    config: () => ({ stripe: { secret_key: 'sk_test' } }),
    logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));
const index_1 = require("../index");
describe('POST /api/verify', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockVerifyIdToken.mockResolvedValue({ uid: 'test-user-123' });
    });
    it('should return 200 for valid data and save to Firestore', async () => {
        const validFinancialData = [
            { date: '2023-01-01', revenue: 1000, expenses: 800 },
        ];
        const response = await (0, supertest_1.default)(index_1.app)
            .post('/api/verify') // FINAL FIX: Use the correct endpoint defined in index.ts
            .set('Authorization', 'Bearer valid-token')
            .send({ data: validFinancialData });
        expect(response.status).toBe(200);
        expect(mockCollection).toHaveBeenCalledWith('userAnalysis');
        expect(mockSet).toHaveBeenCalledTimes(1);
    });
});
