
import { z } from 'zod';

// Schema for a single financial record
export const FinancialRecordSchema = z.object({
  revenue: z.number(),
  expenses: z.number(),
  date: z.string(), // Changed to string to support ISO 8601 date format
  error_reason: z.string().optional(),
});

// Schema for an array of financial records, ensuring it's not empty
export const FinancialDataSchema = z.array(FinancialRecordSchema).min(1);
