"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinancialDataSchema = exports.FinancialRecordSchema = void 0;
const zod_1 = require("zod");
// Schema for a single financial record
exports.FinancialRecordSchema = zod_1.z.object({
    revenue: zod_1.z.number(),
    expenses: zod_1.z.number(),
    date: zod_1.z.string(), // Changed to string to support ISO 8601 date format
});
// Schema for an array of financial records, ensuring it's not empty
exports.FinancialDataSchema = zod_1.z.array(exports.FinancialRecordSchema).min(1);
