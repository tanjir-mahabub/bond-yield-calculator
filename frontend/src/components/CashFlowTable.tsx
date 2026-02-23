import { useState, memo } from 'react';
import type { CashFlowPeriod } from '../types/bond';
import { formatCurrency } from '../utils/format';

interface Props {
  schedule: CashFlowPeriod[];
  previewRows?: number;
}

/**
 * CashFlowTable — periodic bond cash flow schedule.
 * Owns its own showAll state so toggling rows does not re-render
 * sibling components (MetricsGrid stays frozen).
 */
export const CashFlowTable = memo(function CashFlowTable({ schedule, previewRows = 8 }: Props) {
  const [showAll, setShowAll] = useState(false);
  const visibleRows = showAll ? schedule : schedule.slice(0, previewRows);
  const lastPeriod = schedule.at(-1)?.period;

  return (
    <div className="schedule-section">
      <div className="schedule-header">
        <h2 className="section-title">Cash Flow Schedule</h2>
        <span className="period-count">{schedule.length} periods total</span>
      </div>

      <div className="table-wrap" role="region" aria-label="Cash flow schedule" tabIndex={0}>
        <table className="schedule-table">
          <thead>
            <tr>
              <th scope="col">Period</th>
              <th scope="col">Payment Date</th>
              <th scope="col">Coupon Payment</th>
              <th scope="col">Cumulative Interest</th>
              <th scope="col">Remaining Principal</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => (
              <tr key={row.period} className={row.period === lastPeriod ? 'row--final' : undefined}>
                <td className="td--period">{row.period}</td>
                <td className="td--date">{row.paymentDate}</td>
                <td>{formatCurrency(row.couponPayment)}</td>
                <td>{formatCurrency(row.cumulativeInterest)}</td>
                <td>
                  {row.remainingPrincipal === 0
                    ? <span className="returned">Returned</span>
                    : formatCurrency(row.remainingPrincipal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {schedule.length > previewRows && (
        <button className="show-more-btn"
          onClick={() => setShowAll((p) => !p)}
          aria-expanded={showAll}>
          {showAll ? 'Show less' : `Show all ${schedule.length} periods`}
        </button>
      )}
    </div>
  );
});
