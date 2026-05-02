"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeFinancialData = exports.spreadAnalysis = void 0;
const financialDataSchema_js_1 = require("./schemas/financialDataSchema.js");
/**
 * Performs spread analysis on a given set of numerical data.
 * This is a helper function to calculate mean, standard deviation, and outliers.
 *
 * @param {number[]} data - An array of numbers to be analyzed.
 * @returns An object containing the list of outliers, the mean, and the standard deviation.
 */
const spreadAnalysis = (data) => {
    if (data.length === 0) {
        return { outliers: [], mean: 0, stdDev: 0 };
    }
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    // Using population standard deviation as the data represents the entire set for this analysis.
    const stdDev = Math.sqrt(data.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / data.length);
    const outliers = data.filter(x => Math.abs(x - mean) > 1.5 * stdDev);
    return { outliers, mean, stdDev };
};
exports.spreadAnalysis = spreadAnalysis;
/**
 * Analyzes a set of financial records to calculate aggregate metrics and identify profit outliers.
 * Conforms to the business logic required by the design specification.
 *
 * @param {FinancialRecord[]} records - An array of financial records.
 * @returns An object containing total revenue, expenses, profit, and a spread analysis of the profit.
 */
const analyzeFinancialData = (records) => {
    // Validate the input data against the schema to ensure integrity before processing.
    financialDataSchema_js_1.FinancialDataSchema.parse(records);
    let totalRevenue = 0;
    let totalExpenses = 0;
    const profits = [];
    for (const record of records) {
        totalRevenue += record.revenue;
        totalExpenses += record.expenses;
        profits.push(record.revenue - record.expenses);
    }
    const totalProfit = totalRevenue - totalExpenses;
    const profitAnalysis = (0, exports.spreadAnalysis)(profits);
    return {
        totalRevenue,
        totalExpenses,
        totalProfit,
        // The analysis is performed on the profit, as it's the key metric for volatility.
        profitAnalysis,
    };
};
exports.analyzeFinancialData = analyzeFinancialData;
