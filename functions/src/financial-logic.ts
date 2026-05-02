
/**
 * Core Logic: Financial Data Verification
 * This function safely processes an array of financial data, handling "noisy" or
 * incomplete inputs gracefully without throwing errors. It is a pure function.
 *
 * @param data An array of objects, each potentially containing 'revenue' and 'expenses'.
 * @returns An object with validation status and calculated metrics.
 */
export const verifyFinancialMetrics = (data: any[]) => {
  const safeData = data || []; // Prevent null/undefined errors

  // Use reduce to safely sum financials, casting to Number and defaulting to 0
  const totals = safeData.reduce(
    (acc, curr) => ({
      revenue: acc.revenue + (Number(curr.revenue) || 0),
      expenses: acc.expenses + (Number(curr.expenses) || 0),
    }),
    { revenue: 0, expenses: 0 } // Initialize accumulator to prevent TS18048
  );

  const isValid = safeData.length > 0;

  return {
    isValid,
    metrics: {
      ...totals,
      profit: totals.revenue - totals.expenses,
    },
  };
};

/**
 * Generates a mock financial summary.
 * @returns A financial summary object.
 */
export const getFinancialSummary = () => {
  return {
    totalRevenue: 1200000, // in cents
    netIncome: 350000, // in cents
    quarterlyGrowth: 15,
  };
};
