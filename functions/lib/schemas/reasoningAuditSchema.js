"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reasoningAuditSchema = exports.auditLogEntrySchema = void 0;
const zod_1 = require("zod");
// Defines the schema for a single entry in the reasoning audit log.
// This ensures data integrity for every audit record.
exports.auditLogEntrySchema = zod_1.z.object({
    id: zod_1.z.string(),
    transactionId: zod_1.z.string(),
    description: zod_1.z.string(),
    original_ai_prediction: zod_1.z.string(),
    user_correction: zod_1.z.string(),
    confidence_at_time: zod_1.z.number().min(0).max(1),
    reasoning: zod_1.z.string(),
    loggedAt: zod_1.z.string().datetime(),
});
// Defines the schema for the entire reasoning audit data structure.
// This validates the top-level object containing the array of logs.
exports.reasoningAuditSchema = zod_1.z.object({
    audit_logs: zod_1.z.array(exports.auditLogEntrySchema),
    status: zod_1.z.literal('success'),
});
