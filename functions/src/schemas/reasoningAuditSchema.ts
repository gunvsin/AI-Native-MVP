
import { z } from 'zod';

// Defines the schema for a single entry in the reasoning audit log.
// This ensures data integrity for every audit record.
export const auditLogEntrySchema = z.object({
  id: z.string(),
  transactionId: z.string(),
  description: z.string(),
  original_ai_prediction: z.string(),
  user_correction: z.string(),
  confidence_at_time: z.number().min(0).max(1),
  reasoning: z.string(),
  loggedAt: z.string().datetime(),
});

// Defines the schema for the entire reasoning audit data structure.
// This validates the top-level object containing the array of logs.
export const reasoningAuditSchema = z.object({
  audit_logs: z.array(auditLogEntrySchema),
  status: z.literal('success'),
});

// Exporting the inferred types for use in the application code.
export type AuditLogEntry = z.infer<typeof auditLogEntrySchema>;
export type ReasoningAudit = z.infer<typeof reasoningAuditSchema>;
