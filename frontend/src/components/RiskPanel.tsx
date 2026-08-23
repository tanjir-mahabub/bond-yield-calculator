import { memo } from 'react';
import type { BondResult } from '../types/bond';
import { formatCurrency } from '../utils/format';

interface Props { result: BondResult; }

export const RiskPanel = memo(function RiskPanel({ result }: Props) {
  return <section className="analytics-card risk-card">
    <div className="analytics-heading"><div><span className="panel-kicker">Risk diagnostics</span><h2>Duration & convexity</h2></div><span>{result.periods} periods</span></div>
    <dl className="risk-list">
      <div><dt>Macaulay duration</dt><dd>{result.macaulayDuration.toFixed(3)} yrs</dd></div>
      <div><dt>Modified duration</dt><dd>{result.modifiedDuration.toFixed(3)} yrs</dd></div>
      <div><dt>Convexity</dt><dd>{result.convexity.toFixed(2)}</dd></div>
      <div><dt>Coupon per period</dt><dd>{formatCurrency(result.couponPayment)}</dd></div>
      <div><dt>Total cash received</dt><dd>{formatCurrency(result.totalCashReceived)}</dd></div>
      <div><dt>Net cash return</dt><dd className={result.netReturn >= 0 ? 'positive' : 'negative'}>{formatCurrency(result.netReturn)}</dd></div>
    </dl>
  </section>;
});
