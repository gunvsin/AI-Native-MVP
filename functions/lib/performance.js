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
exports.calculatePerformanceMetrics = void 0;
const scheduler_1 = require("firebase-functions/v2/scheduler");
const init_1 = require("./init");
const logger = __importStar(require("firebase-functions/logger"));
exports.calculatePerformanceMetrics = (0, scheduler_1.onSchedule)({ region: "australia-southeast1", schedule: "every 24 hours" }, async (event) => {
    try {
        logger.info("[Performance] Starting AI performance metrics calculation.");
        const now = new Date();
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        const snapshot = await init_1.admin
            .firestore()
            .collection("ai_feedback_loop")
            .where("loggedAt", ">=", yesterday)
            .where("loggedAt", "<", now)
            .get();
        const dailyCorrections = snapshot.size;
        const confidenceDistribution = {
            '0-25': 0,
            '25-50': 0,
            '50-75': 0,
            '75-100': 0,
        };
        if (!snapshot.empty) {
            snapshot.docs.forEach(doc => {
                const confidence = doc.data().confidence_at_time * 100;
                if (confidence >= 0 && confidence < 25) {
                    confidenceDistribution['0-25']++;
                }
                else if (confidence >= 25 && confidence < 50) {
                    confidenceDistribution['25-50']++;
                }
                else if (confidence >= 50 && confidence < 75) {
                    confidenceDistribution['50-75']++;
                }
                else if (confidence >= 75 && confidence <= 100) {
                    confidenceDistribution['75-100']++;
                }
            });
        }
        const metrics = {
            date: now.toISOString().split('T')[0], // YYYY-MM-DD
            dailyCorrections: dailyCorrections,
            confidenceDistributionOfCorrections: confidenceDistribution,
            lastCalculated: init_1.admin.firestore.FieldValue.serverTimestamp(),
        };
        await init_1.admin.firestore().collection("ai_performance_metrics").add(metrics);
        logger.info(`[Performance] Successfully calculated and stored AI performance metrics: ${dailyCorrections} corrections.`);
    }
    catch (error) {
        logger.error("[Performance] Error calculating AI performance metrics:", error);
    }
});
