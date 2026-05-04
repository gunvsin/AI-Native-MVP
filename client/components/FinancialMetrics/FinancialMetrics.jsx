import React from 'react';
import FinancialSummaryCard from '../FinancialSummaryCard/FinancialSummaryCard';

const FinancialMetrics = () => {
  // In a real application, this data would be fetched from an API
  const metrics = {
    mrr: '50,000',
    ltv: '1,200',
    churn: '2.5%',
  };

  const summaryText = `MRR: $${metrics.mrr} | LTV: $${metrics.ltv} | Churn: ${metrics.churn}`;

  return <FinancialSummaryCard summaryText={summaryText} />;
};

export default FinancialMetrics;
