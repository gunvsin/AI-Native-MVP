import React from 'react';
import './FinancialSummaryCard.css';

const FinancialSummaryCard = ({ metrics = [] }) => {
  return (
    <div className="financial-summary-card">
      <h2>Financial Summary</h2>
      <dl>
        {metrics.map(({ label, value }) => {
          if (!label) return null; // Don't render if there's no label

          return (
            <React.Fragment key={label}>
              <dt>{label}:</dt>
              <dd>{value}</dd>
            </React.Fragment>
          );
        })}
      </dl>
    </div>
  );
};

export default FinancialSummaryCard;
