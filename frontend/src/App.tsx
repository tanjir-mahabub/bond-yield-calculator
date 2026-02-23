import { useState, useCallback } from 'react';
import type { FormEvent } from 'react';
import { useBondCalculator } from './hooks/useBondCalculator';
import type { BondInput } from './types/bond';
import { BondForm } from './components/BondForm';
import { MetricsGrid } from './components/MetricsGrid';
import { CashFlowTable } from './components/CashFlowTable';
import './index.css';

const DEFAULT_INPUT: BondInput = {
  faceValue: 1000,
  annualCouponRate: 5,
  marketPrice: 950,
  yearsToMaturity: 10,
  couponFrequency: 'semi-annual',
};

/**
 * App — root orchestrator only.
 * Owns form state and wires up the hook.
 * No formatting logic, no calculation logic, no detailed JSX.
 */
export default function App() {
  const [form, setForm] = useState<BondInput>(DEFAULT_INPUT);
  const { result, loading, error, calculate } = useBondCalculator();

  const handleChange = useCallback((field: keyof BondInput, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback((e: FormEvent) => {
    e.preventDefault();
    calculate(form);
  }, [calculate, form]);

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="wordmark">
            <span className="wordmark-main">BOND</span>
            <span className="wordmark-sub">yield calculator</span>
          </div>
          <p className="header-desc">Fixed Income Analytics · Cash Flow Projection · YTM Analysis</p>
        </div>
        <div className="ticker-strip" aria-hidden="true">
          <span>CURRENT YIELD</span><span>·</span>
          <span>YIELD TO MATURITY</span><span>·</span>
          <span>CASH FLOW SCHEDULE</span><span>·</span>
          <span>PREMIUM / DISCOUNT</span><span>·</span>
          <span>TOTAL INTEREST</span><span>·</span>
        </div>
      </header>

      <main className="main">
        <BondForm
          form={form}
          loading={loading}
          error={error}
          onChange={handleChange}
          onSubmit={handleSubmit}
        />
        {result && (
          <section className="results-section" aria-live="polite" aria-label="Calculation results">
            <MetricsGrid result={result} />
            <CashFlowTable schedule={result.cashFlowSchedule} />
          </section>
        )}
      </main>

      <footer className="footer">
        <span>Bond Yield Calculator</span>
        <span aria-hidden="true">·</span>
        <span>React + NestJS + TypeScript</span>
        <span aria-hidden="true">·</span>
        <span>YTM via Bisection Method</span>
      </footer>
    </div>
  );
}
