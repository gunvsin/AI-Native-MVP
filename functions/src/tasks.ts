
import { onTaskDispatched } from "firebase-functions/v2/tasks";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

// Initialize the Gemini AI SDK
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Define the schema for the AI's output to ensure predictable results
const TransactionAnalysisSchema = z.object({
  category: z.enum(['SaaS', 'Travel', 'Utilities', 'Dining', 'Entertainment', 'Other']),
  confidence_score: z.number().min(0).max(1),
  is_subscription: z.boolean(),
  reasoning: z.string().max(150), // Brief explanation for the user
  summary_tagline: z.string().max(50), // 5-10 words is a good length
});

// Define the final schema for the data that will be stored in Firestore
const FirestoreAnalysisSchema = TransactionAnalysisSchema.extend({
  needs_review: z.boolean(),
});

/**
 * The AI Worker: Triggered by a task queue to analyze a transaction.
 * This function performs a "Dual-Write," updating the main transaction
 * document for UI performance and creating an immutable log in a sub-collection
 * for audit purposes.
 */
export const analyzeTransactionTask = onTaskDispatched(
  {
    retryConfig: { maxAttempts: 3, minBackoffSeconds: 60 },
    rateLimits: { maxConcurrentDispatches: 5 },
  },
  async (event) => {
    const { docId } = event.data;

    console.log(`[AI WORKER] Received task for document: ${docId}`);

    const firestore = getFirestore();
    const transactionRef = firestore.collection("transactions").doc(docId as string);
    
    try {
      const transactionDoc = await transactionRef.get();

      if (!transactionDoc.exists) {
        throw new Error(`Transaction document not found: ${docId}`);
      }

      const transactionData = transactionDoc.data();

      if (!transactionData) {
        throw new Error(`Transaction data is empty for document: ${docId}`);
      }

      // --- Few-Shot Learning: Retrieve recent corrections ---
      const feedbackSnapshot = await firestore.collection("ai_feedback_loop")
        .orderBy("loggedAt", "desc")
        .limit(3)
        .get();

      let fewShotExamples = "";
      if (!feedbackSnapshot.empty) {
        fewShotExamples = "Recent corrections (use these to improve accuracy):\n";
        feedbackSnapshot.docs.forEach(doc => {
          const correction = doc.data();
          fewShotExamples += `- Description: \"${correction.description}\", AI was: ${correction.original_ai_prediction}, User corrected to: ${correction.user_correction}\n`;
        });
      }
      
      // Configure the AI model to return JSON
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: { responseMimeType: "application/json" } 
      });

      const prompt = `
        You are a financial analyst specializing in transaction categorization.
        Analyze this transaction and return a JSON object that adheres to the provided schema.
        Explain your reasoning in 15 words or less, focusing on specific keywords identified in the transaction description.

        ${fewShotExamples}

        Transaction Description: ${transactionData.description || 'Unknown'}
        Amount: ${transactionData.amount_total} ${transactionData.currency}

        Schema:
        {
          "category": "'SaaS' | 'Travel' | 'Utilities' | 'Dining' | 'Entertainment' | 'Other'",
          "confidence_score": "number (0.0 to 1.0)",
          "is_subscription": "boolean",
          "reasoning": "string (15 words or less)",
          "summary_tagline": "string (5-word max description)"
        }
      `;
      
      const result = await model.generateContent(prompt);
      const analysisText = result.response.text();
      const analysisJson = JSON.parse(analysisText);

      // The "Zod Sentry" validates the AI's output against our schema
      const validatedAnalysis = TransactionAnalysisSchema.parse(analysisJson);

      // Implement the "Human-in-the-Loop" flag
      const needsReview = validatedAnalysis.confidence_score < 0.75;

      const finalAnalysisData: z.infer<typeof FirestoreAnalysisSchema> = {
        ...validatedAnalysis,
        needs_review: needsReview,
      };

      // --- Dual-Write Audit Trail ---
      // 1. Get a reference to the immutable log document.
      const logRef = transactionRef.collection("analysis_logs").doc();
      
      // 2. Create an atomic batch to ensure both writes succeed or fail together.
      const batch = firestore.batch();
      
      // 3. Update the main document for fast UI queries ("Hot State").
      batch.update(transactionRef, { analysis: finalAnalysisData });
      
      // 4. Set the immutable log with a server timestamp ("Flight Data Recorder").
      batch.set(logRef, {
        ...finalAnalysisData,
        loggedAt: FieldValue.serverTimestamp(),
      });
      
      // 5. Commit the atomic write.
      await batch.commit();

      console.log(`[AI WORKER] Successfully performed Dual-Write for document: ${docId}`);

    } catch (error) {
      console.error(`[AI WORKER] Failed to analyze document: ${docId}`, error);
      // The task will be retried automatically based on the retryConfig.
      throw error; 
    }
  }
);
