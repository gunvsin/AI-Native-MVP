
import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

/**
 * "The Drift Guard": A scheduled function that runs weekly to analyze
 * the AI's performance and log an intelligence report.
 * This turns our feedback data into a proactive monitoring tool.
 */
export const weeklyIntelligenceReport = onSchedule("every monday 09:00", async (event) => {
  logger.info("[Drift Guard] Generating weekly AI intelligence report...");

  try {
    const db = admin.firestore();
    const feedbackCollection = db.collection("ai_feedback_loop");

    // Get all corrections from the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const snapshot = await feedbackCollection.where("loggedAt", ">=", sevenDaysAgo).get();

    if (snapshot.empty) {
      logger.info("[Drift Guard] No new corrections in the last 7 days. Performance is stable.");
      return;
    }

    let totalCorrections = 0;
    const misclassificationCounts = new Map<string, number>();

    snapshot.forEach(doc => {
      totalCorrections++;
      const data = doc.data();
      const key = `${data.original_ai_prediction} -> ${data.user_correction}`;
      misclassificationCounts.set(key, (misclassificationCounts.get(key) || 0) + 1);
    });
    
    // Build the report object
    const report = {
        totalCorrectionsLastWeek: totalCorrections,
        misclassificationBreakdown: Object.fromEntries(misclassificationCounts.entries()),
    };
    
    // Log the report to the console. This can be evolved to send emails or push to a dashboard.
    logger.info("[Drift Guard] Weekly Intelligence Report:", report);

  } catch (error) {
    logger.error("[Drift Guard] Failed to generate weekly report:", error);
  }
});
