
import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import { admin } from "./init";
import * as logger from "firebase-functions/logger";
import { z } from 'zod';
import { reasoningAuditSchema } from './validation';

/**
 * Feedback Loop: Logs discrepancies between AI predictions and User corrections.
 * This data will be used for Phase V fine-tuning and prompt optimization.
 */
export const logCorrection = onDocumentUpdated("transactions/{docId}", async (event) => {
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
        loggedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      // Log the correction to a dedicated collection for analysis.
      await admin.firestore().collection("ai_feedback_loop").add(correctionLog);
      
      logger.info(`[Feedback Loop] Successfully logged correction for doc: ${event.params.docId}`);
    }
  } catch (error) {
    logger.error(`[Feedback Loop] Error processing document ${event.params.docId}:`, error);
  }
});

/**
 * Retrieves the reasoning audit data from the `ai_feedback_loop` collection.
 */
export const getReasoningAudit = async () => {
  try {
    const snapshot = await admin
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
  } catch (error) {
    logger.error("[Reasoning Audit] Error fetching audit data:", error);
    return { audit_logs: [], status: "error", message: "Failed to fetch reasoning audit data." };
  }
};

/**
 * Saves a reasoning audit record from a Stripe webhook to Firestore.
 * @param auditData The validated reasoning audit data, conforming to reasoningAuditSchema.
 */
export const saveReasoningAudit = async (auditData: z.infer<typeof reasoningAuditSchema>) => {
  try {
    const auditLog = {
      ...auditData,
      loggedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await admin.firestore().collection("reasoning_audits").add(auditLog);
    logger.info(`[Reasoning Audit] Successfully saved reasoning audit for user action: ${auditData.userAction}`);
  } catch (error) {
    logger.error("[Reasoning Audit] Error saving reasoning audit:", error);
    // If the caller needs to handle failures, re-throwing the error is a good practice.
    // For this webhook, we'll log the error and continue.
  }
};
