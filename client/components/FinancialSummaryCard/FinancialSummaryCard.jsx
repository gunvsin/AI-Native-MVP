      import React from 'react';
      import './FinancialSummaryCard.css';
      
      const FinancialSummaryCard = ({ summaryText = '' }) => {
        const metrics = (summaryText || '').split('|').map(metric => metric.trim());
        return (
          <div className="financial-summary-card">
            <h3>Financial Summary</h3>
            <dl>
             {metrics.map(metric => {
               const [label, value] = metric.split(':');
               return (
                 <React.Fragment key={label}>
                   <dt>{label}:</dt>
                   <dd>{value.trim()}</dd>
                 </React.Fragment>
               );
             })}
           </dl>
          </div>
        );
      };
      
      export default FinancialSummaryCard;