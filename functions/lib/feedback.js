"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveReasoningAudit = exports.getReasoningAudit = exports.logCorrection = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
const init_1 = require("./init");
const logger = __importStar(require("firebase-functions/logger"));
/**
 * Feedback Loop: Logs discrepancies between AI predictions and User corrections.
 * This data will be used for Phase V fine-tuning and prompt optimization.
 */
exports.logCorrection = (0, firestore_1.onDocumentUpdated)("transactions/{docId}", async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    // Guard against undefined data or missing analysis objects
    if (!before?.analysis || !after?.analysis) {
        return;
    }
    try {
        // Define the condition for a correction:
        // 1. The category was changed by the user.
        // 2. The item was previously analyzed by the AI (it has a confidence score).
        // 3. The item has been marked as 'reviewed' (needs_review is now false).
        const wasCorrected = before.analysis.category !== after.analysis.category &&
            'confidence_score' in before.analysis &&
            after.analysis.needs_review === false;
        if (wasCorrected) {
            logger.info(`[Feedback Loop] Correction detected for doc: ${event.params.docId}`);
            const correctionLog = {
                transactionId: event.params.docId,
                description: after.description,
                original_ai_prediction: before.analysis.category,
                user_correction: after.analysis.category,
                confidence_at_time: before.analysis.confidence_score,
                // --- FIX APPLIED ---
                // The AI's reasoning is now logged to enable the "Reasoning Audit".
                reasoning: before.analysis.reasoning || "N/A",
                loggedAt: init_1.admin.firestore.FieldValue.serverTimestamp(),
            };
            // Log the correction to a dedicated collection for analysis.
            await init_1.admin.firestore().collection("ai_feedback_loop").add(correctionLog);
            logger.info(`[Feedback Loop] Successfully logged correction for doc: ${event.params.docId}`);
        }
    }
    catch (error) {
        logger.error(`[Feedback Loop] Error processing document ${event.params.docId}:`, error);
    }
});
/**
 * Retrieves the reasoning audit data from the `ai_feedback_loop` collection.
 */
const getReasoningAudit = async () => {
    try {
        const snapshot = await init_1.admin
            .firestore()
            .collection("ai_feedback_loop")
            .orderBy("loggedAt", "desc")
            .limit(20)
            .get();
        if (snapshot.empty) {
            return { audit_logs: [], status: "success" };
        }
        const audit_logs = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
        return { audit_logs, status: "success" };
    }
    catch (error) {
        logger.error("[Reasoning Audit] Error fetching audit data:", error);
        return { audit_logs: [], status: "error", message: "Failed to fetch reasoning audit data." };
    }
};
exports.getReasoningAudit = getReasoningAudit;
/**
 * Saves a reasoning audit record from a Stripe webhook to Firestore.
 * @param auditData The validated reasoning audit data, conforming to reasoningAuditSchema.
 */
const saveReasoningAudit = async (auditData) => {
    try {
        const auditLog = {
            ...auditData,
            loggedAt: init_1.admin.firestore.FieldValue.serverTimestamp(),
        };
        await init_1.admin.firestore().collection("reasoning_audits").add(auditLog);
        logger.info(`[Reasoning Audit] Successfully saved reasoning audit for user action: ${auditData.userAction}`);
    }
    catch (error) {
        logger.error("[Reasoning Audit] Error saving reasoning audit:", error);
        // If the caller needs to handle failures, re-throwing the error is a good practice.
        // For this webhook, we'll log the error and continue.
    }
};
exports.saveReasoningAudit = saveReasoningAudit;
