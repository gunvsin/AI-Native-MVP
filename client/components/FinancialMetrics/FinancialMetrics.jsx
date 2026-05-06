import React from 'react';
import FinancialSummaryCard from '../FinancialSummaryCard/FinancialSummaryCard';

const FinancialMetrics = () => {
  // In a real application, this data would be fetched from an API
  const metrics = [
    { label: 'MRR', value: '$50,000' },
    { label: 'LTV', value: '$1,200' },
    { label: 'Churn', value: '2.5%' },
  ];

  return <FinancialSummaryCard metrics={metrics} />;
};

export default FinancialMetrics;
