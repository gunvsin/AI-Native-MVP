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
exports.weeklyIntelligenceReport = void 0;
const scheduler_1 = require("firebase-functions/v2/scheduler");
const admin = __importStar(require("firebase-admin"));
const logger = __importStar(require("firebase-functions/logger"));
/**
 * "The Drift Guard": A scheduled function that runs weekly to analyze
 * the AI's performance and log an intelligence report.
 * This turns our feedback data into a proactive monitoring tool.
 */
exports.weeklyIntelligenceReport = (0, scheduler_1.onSchedule)("every monday 09:00", async (event) => {
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
        const misclassificationCounts = new Map();
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
    }
    catch (error) {
        logger.error("[Drift Guard] Failed to generate weekly report:", error);
    }
});
