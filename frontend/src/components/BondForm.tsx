import { memo } from 'react';
import type { FormEvent } from 'react';
import type { BondInput, CouponFrequency } from '../types/bond';

interface Props {
  form: BondInput;
  loading: boolean;
  error: string | null;
  onChange: (field: keyof BondInput, value: string | number) => void;
  onSubmit: (e: FormEvent) => void;
}

/**
 * BondForm — controlled form for bond parameter inputs.
 * memo(): re-renders only when its own props change, NOT when parent
 * re-renders due to result state updates after a calculation.
 */
export const BondForm = memo(function BondForm({ form, loading, error, onChange, onSubmit }: Props) {
  return (
    <section className="input-section">
      <h2 className="section-title">Bond Parameters</h2>

      <form onSubmit={onSubmit} className="bond-form">
        <div className="field-group">
          <label className="field-label" htmlFor="faceValue">Face Value</label>
          <div className="input-wrap">
            <span className="input-prefix" aria-hidden="true">$</span>
            <input id="faceValue" type="number" className="field-input"
              value={form.faceValue} min={0.01} step="any" required
              onChange={(e) => onChange('faceValue', parseFloat(e.target.value))}
              aria-label="Face value in USD" />
          </div>
        </div>

        <div className="field-group">
          <label className="field-label" htmlFor="couponRate">Annual Coupon Rate</label>
          <div className="input-wrap">
            <input id="couponRate" type="number" className="field-input"
              value={form.annualCouponRate} min={0} max={100} step={0.01} required
              onChange={(e) => onChange('annualCouponRate', parseFloat(e.target.value))}
              aria-label="Annual coupon rate percentage" />
            <span className="input-suffix" aria-hidden="true">%</span>
          </div>
        </div>

        <div className="field-group">
          <label className="field-label" htmlFor="marketPrice">Market Price</label>
          <div className="input-wrap">
            <span className="input-prefix" aria-hidden="true">$</span>
            <input id="marketPrice" type="number" className="field-input"
              value={form.marketPrice} min={0.01} step="any" required
              onChange={(e) => onChange('marketPrice', parseFloat(e.target.value))}
              aria-label="Market price in USD" />
          </div>
        </div>

        <div className="field-group">
          <label className="field-label" htmlFor="yearsToMaturity">Years to Maturity</label>
          <div className="input-wrap">
            <input id="yearsToMaturity" type="number" className="field-input"
              value={form.yearsToMaturity} min={0.5} step={0.5} required
              onChange={(e) => onChange('yearsToMaturity', parseFloat(e.target.value))}
              aria-label="Years to maturity" />
            <span className="input-suffix" aria-hidden="true">yrs</span>
          </div>
        </div>

        <div className="field-group field-group--full">
          <span className="field-label" id="freq-label">Coupon Frequency</span>
          <div className="freq-toggle" role="group" aria-labelledby="freq-label">
            {(['annual', 'semi-annual'] as CouponFrequency[]).map((f) => (
              <button key={f} type="button"
                className={`freq-btn ${form.couponFrequency === f ? 'freq-btn--active' : ''}`}
                onClick={() => onChange('couponFrequency', f)}
                aria-pressed={form.couponFrequency === f}>
                {f === 'annual' ? 'Annual' : 'Semi-Annual'}
              </button>
            ))}
          </div>
        </div>

        <div className="field-group field-group--full">
          <button type="submit" className="calculate-btn" disabled={loading} aria-busy={loading}>
            {loading
              ? <span className="spinner" role="status" aria-label="Calculating…" />
              : (<><span>Calculate</span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg></>)
            }
          </button>
        </div>
      </form>

      {error && (
        <div className="error-banner" role="alert" aria-live="polite">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 5v3.5M8 11h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          {error}
        </div>
      )}
    </section>
  );
});
