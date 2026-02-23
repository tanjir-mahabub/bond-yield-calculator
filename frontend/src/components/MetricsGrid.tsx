import { memo } from 'react';
import { BondResult } from '../types/bond';
import { formatCurrency, formatPercent } from '../utils/format';

interface Props { result: BondResult; }

/**
 * MetricsGrid — four key bond metric cards.
 * memo(): re-renders only when result reference changes (new calculation).
 */
export const MetricsGrid = memo(function MetricsGrid({ result }: Props) {
  const { premiumOrDiscount, premiumDiscountAmount, premiumDiscountPercent } = result;

  const statusDesc = premiumOrDiscount === 'par'
    ? 'Trading at face value'
    : `${formatCurrency(premiumDiscountAmount)} (${formatPercent(premiumDiscountPercent, 2)}) ${
        premiumOrDiscount === 'premium' ? 'above' : 'below'
      } face value`;

  return (
    <div className="results-grid" role="list" aria-label="Bond metrics">
      <div className="metric-card metric-card--highlight" role="listitem">
        <div className="metric-label">Yield to Maturity</div>
        <div className="metric-value">{formatPercent(result.ytm, 4)}</div>
        <div className="metric-desc">Annualized total return if held to maturity</div>
      </div>

      <div className="metric-card" role="listitem">
        <div className="metric-label">Current Yield</div>
        <div className="metric-value">{formatPercent(result.currentYield, 4)}</div>
        <div className="metric-desc">Annual coupon ÷ market price</div>
      </div>

      <div className="metric-card" role="listitem">
        <div className="metric-label">Total Interest Earned</div>
        <div className="metric-value">{formatCurrency(result.totalInterestEarned)}</div>
        <div className="metric-desc">Sum of all coupon payments over life of bond</div>
      </div>

      <div className={`metric-card metric-card--${premiumOrDiscount}`} role="listitem">
        <div className="metric-label">Trading Status</div>
        <div className="metric-value metric-value--badge">
          <span className={`badge badge--${premiumOrDiscount}`}>
            {premiumOrDiscount.toUpperCase()}
          </span>
        </div>
        <div className="metric-desc">{statusDesc}</div>
      </div>
    </div>
  );
});
