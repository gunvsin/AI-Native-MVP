'use client';
import Ledger from '../components/Ledger/Ledger';
import FinancialMetrics from '../components/FinancialMetrics/FinancialMetrics';

export default function Home() {
  return (
    <>
      <h1>Sovereign Financials</h1>
      <FinancialMetrics />
      <Ledger />
    </>
  );
}
