import React from 'react';
import './Ledger.css';
import FinancialSummaryCard from '../FinancialSummaryCard/FinancialSummaryCard';

const Ledger = () => {
  return (
    <div className="ledger-container">
      <header className="ledger-header">
        <h1>Sovereign Ledger</h1>
      </header>
      <main className="ledger-main">
        <FinancialSummaryCard />
      </main>
      <footer className="ledger-footer">
        <p>© 2024 Sovereign Ledger. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Ledger;
