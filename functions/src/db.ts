import * as admin from 'firebase-admin';
import { FinancialRecordSchema } from './schemas/financialDataSchema';
import { z } from 'zod';

// Initialize Firebase Admin SDK
// This is a common practice to ensure it's initialized only once.
if (admin.apps.length === 0) {
  admin.initializeApp();
}

export const db = admin.firestore();

/**
 * Fetches financial data from Firestore.
 */
export const fetchFinancialData = async () => {
  const snapshot = await db.collection('financialData').get();
  const records: z.infer<typeof FinancialRecordSchema>[] = [];
  snapshot.forEach(doc => {
      const data = doc.data();
      // Ensure data is parsed and validated against the schema
      const record = FinancialRecordSchema.parse(data);
      records.push(record);
  });
  return records;
};
