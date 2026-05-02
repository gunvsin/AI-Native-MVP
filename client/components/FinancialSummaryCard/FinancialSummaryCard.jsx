import React from 'react';
import './FinancialSummaryCard.css';

const FinancialSummaryCard = ({ summaryText }) => {
  return (
    <div className="financial-summary-card">
      <h3>Financial Summary</h3>
      <p>{summaryText}</p>
    </div>
  );
};

export default FinancialSummaryCard;
