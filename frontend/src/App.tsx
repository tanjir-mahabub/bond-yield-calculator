import { useState, useCallback, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useBondCalculator } from './hooks/useBondCalculator';
import type { BondInput } from './types/bond';
import { BondForm } from './components/BondForm';
import { MetricsGrid } from './components/MetricsGrid';
import { CashFlowTable } from './components/CashFlowTable';
import { YieldCurveChart } from './components/YieldCurveChart';
import { RiskPanel } from './components/RiskPanel';
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
  const [theme, setTheme] = useState<'dark' | 'light'>(() =>
    window.localStorage.getItem('bond-theme') === 'light' ? 'light' : 'dark');
  const { result, loading, error, calculate } = useBondCalculator();

  useEffect(() => { calculate(DEFAULT_INPUT); }, [calculate]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem('bond-theme', theme);
  }, [theme]);

  const handleChange = useCallback((field: keyof BondInput, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback((e: FormEvent) => {
    e.preventDefault();
    calculate(form);
  }, [calculate, form]);

  const handlePreset = useCallback((preset: 'discount' | 'par' | 'premium' | 'zero') => {
    const next: Record<typeof preset, BondInput> = {
      discount: { faceValue: 1000, annualCouponRate: 5, marketPrice: 920, yearsToMaturity: 10, couponFrequency: 'semi-annual' },
      par: { faceValue: 1000, annualCouponRate: 5, marketPrice: 1000, yearsToMaturity: 10, couponFrequency: 'semi-annual' },
      premium: { faceValue: 1000, annualCouponRate: 6.5, marketPrice: 1090, yearsToMaturity: 7, couponFrequency: 'semi-annual' },
      zero: { faceValue: 1000, annualCouponRate: 0, marketPrice: 610, yearsToMaturity: 10, couponFrequency: 'annual' },
    };
    setForm(next[preset]);
    calculate(next[preset]);
  }, [calculate]);

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="wordmark">
            <span className="wordmark-main">BOND</span>
            <span className="wordmark-sub">yield calculator</span>
          </div>
          <div className="header-actions"><p className="header-desc">Fixed Income Analytics · Cash Flow Projection · Risk Analysis</p><button className="theme-toggle" type="button" onClick={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}>{theme === 'dark' ? '☼' : '◐'}</button></div>
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
          onPreset={handlePreset}
        />
        {result && (
          <section className="results-section" aria-live="polite" aria-label="Calculation results">
            <MetricsGrid result={result} />
            <div className="analytics-grid"><YieldCurveChart scenarios={result.yieldScenarios} /><RiskPanel result={result} /></div>
            <CashFlowTable schedule={result.cashFlowSchedule} />
          </section>
        )}
      </main>

      <footer className="footer">
        <span>Fixed Income Analytics Workbench</span>
        <span aria-hidden="true">·</span>
        <span>React + NestJS + TypeScript</span>
        <span aria-hidden="true">·</span>
        <span>YTM · Duration · Convexity · DV01</span>
        <span className="disclaimer">For educational analysis—not investment advice.</span>
      </footer>
    </div>
  );
}
