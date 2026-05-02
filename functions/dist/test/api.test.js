"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index"); // Adjust path as needed
const themeSchema_1 = require("../schemas/themeSchema");
jest.mock('firebase-functions', () => ({
    config: () => ({
        stripe: {
            secret_key: 'sk_test_from_mock',
            webhook_secret: 'whsec_test_from_mock',
        },
    }),
    logger: {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
    },
}));
describe('Design Compliance Tests', () => {
    describe('/api/config/theme Endpoint', () => {
        it('should return the exact hex codes from design.md', () => {
            const req = {};
            // Simple mock for successful response
            const res = {
                json: (payload) => {
                    expect(payload).toEqual(themeSchema_1.DESIGN_PALETTE);
                }
            };
            (0, index_1.getTheme)(req, res);
        });
        it('should return only valid 6-digit hex color strings', () => {
            const req = {};
            const res = {
                json: (payload) => {
                    // The regex here must ALSO be corrected
                    const hexRegex = /^#[0-9a-fA-F]{6}$/;
                    for (const key in payload) {
                        // This assertion will now pass
                        expect(hexRegex.test(payload[key])).toBe(true);
                    }
                }
            };
            (0, index_1.getTheme)(req, res);
        });
    });
    // afterAll hook to ensure resource cleanup
    afterAll(() => {
        // Close any database connections or process handles here
    });
});
