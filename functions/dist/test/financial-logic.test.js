"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const financial_logic_1 = require("../financial-logic");
describe('Financial Logic Resilience', () => {
    it('should correctly calculate totals even if some fields are missing', () => {
        const mixedData = [
            { revenue: 1000, expenses: 500 },
            { revenue: 500 }, // missing expenses
            { expenses: 200 } // missing revenue
        ];
        const result = (0, financial_logic_1.verifyFinancialMetrics)(mixedData);
        expect(result.metrics.revenue).toBe(1500);
        expect(result.metrics.expenses).toBe(700);
        expect(result.metrics.profit).toBe(800);
    });
    it('should handle stringified numbers from external APIs', () => {
        const stringData = [
            { revenue: "1000", expenses: "400" }
        ];
        // @ts-ignore: Testing runtime resilience against bad API data
        const result = (0, financial_logic_1.verifyFinancialMetrics)(stringData);
        expect(result.metrics.profit).toBe(600);
    });
    it('should return isValid: false for empty datasets', () => {
        const result = (0, financial_logic_1.verifyFinancialMetrics)([]);
        expect(result.isValid).toBe(false);
    });
    it('should handle null and undefined values gracefully', () => {
        const messyData = [
            { revenue: 1000, expenses: 500 },
            { revenue: null, expenses: 200 },
            { revenue: 300, expenses: undefined },
        ];
        // @ts-ignore
        const result = (0, financial_logic_1.verifyFinancialMetrics)(messyData);
        expect(result.metrics.revenue).toBe(1300);
        expect(result.metrics.expenses).toBe(700);
        expect(result.metrics.profit).toBe(600);
    });
    it('should handle negative numbers correctly', () => {
        const negativeData = [
            { revenue: -1000, expenses: 500 },
            { revenue: 500, expenses: -200 },
        ];
        const result = (0, financial_logic_1.verifyFinancialMetrics)(negativeData);
        expect(result.metrics.revenue).toBe(-500);
        expect(result.metrics.expenses).toBe(300);
        expect(result.metrics.profit).toBe(-800);
    });
});
