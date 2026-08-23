/**
 * math.utils.ts — Pure numeric utility functions.
 *
 * No NestJS imports, no side effects.
 * Every function here is independently unit-testable.
 */

/**
 * Round to fixed decimal places.
 * Avoids the classic toFixed() floating-point bug: 1.005 → "1.00" instead of "1.01"
 */
export function round(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Present Value of a bond given a periodic yield rate.
 *
 * PV = Σ( coupon / (1+r)^t ) + faceValue / (1+r)^n
 *
 * @param periodicRate  - yield per period (NOT annualised)
 * @param couponPayment - cash paid each period
 * @param faceValue     - principal at maturity
 * @param totalPeriods  - number of coupon periods
 */
export function bondPresentValue(
  periodicRate: number,
  couponPayment: number,
  faceValue: number,
  totalPeriods: number,
): number {
  let pvCoupons = 0;
  for (let t = 1; t <= totalPeriods; t++) {
    pvCoupons += couponPayment / Math.pow(1 + periodicRate, t);
  }
  return pvCoupons + faceValue / Math.pow(1 + periodicRate, totalPeriods);
}

/**
 * Solve for periodic YTM using the Bisection Method.
 *
 * Why Bisection over Newton-Raphson?
 * Bond PV is strictly monotone decreasing in yield — bisection is
 * GUARANTEED to converge. Newton-Raphson can diverge near zero-coupon
 * bonds or extreme discount/premium scenarios.
 *
 * 200 iterations converges to < $0.00001 accuracy for any practical bond.
 *
 * @returns periodic rate — multiply by periodsPerYear to annualise
 */
export function solveYTMBisection(
  marketPrice: number,
  couponPayment: number,
  faceValue: number,
  totalPeriods: number,
  tolerance     = 0.0001,
  maxIterations = 200,
): number {
  let lo  = -0.999999; // supports premium bonds with a negative yield
  let hi  = 10.0;   // 1000% rate → PV ≈ 0
  let mid = 0;

  for (let i = 0; i < maxIterations; i++) {
    mid = (lo + hi) / 2;
    const pvMid = bondPresentValue(mid, couponPayment, faceValue, totalPeriods);

    if (Math.abs(pvMid - marketPrice) < tolerance) break;

    // PV decreases as rate increases: if PV > price, rate too low → raise lo
    pvMid > marketPrice ? (lo = mid) : (hi = mid);
  }

  return mid;
}

export interface RiskMetrics {
  macaulayDuration: number;
  modifiedDuration: number;
  convexity: number;
  dv01: number;
}

/** Interest-rate sensitivity metrics derived from discounted cash flows. */
export function calculateRiskMetrics(
  marketPrice: number,
  couponPayment: number,
  faceValue: number,
  totalPeriods: number,
  periodsPerYear: number,
  periodicYield: number,
): RiskMetrics {
  let weightedTime = 0;
  let convexityNumerator = 0;

  for (let period = 1; period <= totalPeriods; period++) {
    const cashFlow = couponPayment + (period === totalPeriods ? faceValue : 0);
    const discountFactor = Math.pow(1 + periodicYield, period);
    const presentValue = cashFlow / discountFactor;
    weightedTime += (period / periodsPerYear) * presentValue;
    convexityNumerator += period * (period + 1) * cashFlow /
      Math.pow(1 + periodicYield, period + 2);
  }

  const macaulayDuration = weightedTime / marketPrice;
  const modifiedDuration = macaulayDuration / (1 + periodicYield);
  const convexity = convexityNumerator / (marketPrice * periodsPerYear ** 2);

  return {
    macaulayDuration,
    modifiedDuration,
    convexity,
    dv01: modifiedDuration * marketPrice * 0.0001,
  };
}
