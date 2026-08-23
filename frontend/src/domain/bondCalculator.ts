import type { BondInput, BondResult, CouponFrequency, YieldScenario } from '../types/bond';

const round = (value: number, decimals: number) => {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
};

const periodsPerYear = (frequency: CouponFrequency) =>
  frequency === 'quarterly' ? 4 : frequency === 'semi-annual' ? 2 : 1;

export function bondPresentValue(rate: number, coupon: number, face: number, periods: number) {
  let value = 0;
  for (let period = 1; period <= periods; period += 1) {
    value += coupon / (1 + rate) ** period;
  }
  return value + face / (1 + rate) ** periods;
}

export function solveYield(price: number, coupon: number, face: number, periods: number) {
  let low = -0.999999;
  let high = 10;
  let midpoint = 0;
  for (let iteration = 0; iteration < 240; iteration += 1) {
    midpoint = (low + high) / 2;
    const calculatedPrice = bondPresentValue(midpoint, coupon, face, periods);
    if (Math.abs(calculatedPrice - price) < 0.000001) break;
    if (calculatedPrice > price) low = midpoint;
    else high = midpoint;
  }
  return midpoint;
}

export function calculateBondLocally(input: BondInput): BondResult {
  const frequency = periodsPerYear(input.couponFrequency);
  const periods = Math.round(input.yearsToMaturity * frequency);
  const coupon = input.faceValue * input.annualCouponRate / 100 / frequency;
  const periodicYield = solveYield(input.marketPrice, coupon, input.faceValue, periods);
  const ytm = periodicYield * frequency * 100;
  let cumulativeInterest = 0;
  let weightedTime = 0;
  let convexityNumerator = 0;
  const months = 12 / frequency;
  const today = new Date();

  const cashFlowSchedule = Array.from({ length: periods }, (_, index) => {
    const period = index + 1;
    const principalPayment = period === periods ? input.faceValue : 0;
    const totalCashFlow = coupon + principalPayment;
    const presentValue = totalCashFlow / (1 + periodicYield) ** period;
    cumulativeInterest += coupon;
    weightedTime += period / frequency * presentValue;
    convexityNumerator += period * (period + 1) * totalCashFlow /
      (1 + periodicYield) ** (period + 2);
    const date = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + period * months, today.getUTCDate()));
    return {
      period,
      paymentDate: date.toISOString().slice(0, 10),
      couponPayment: round(coupon, 2),
      cumulativeInterest: round(cumulativeInterest, 2),
      remainingPrincipal: period === periods ? 0 : input.faceValue,
      principalPayment: round(principalPayment, 2),
      totalCashFlow: round(totalCashFlow, 2),
      presentValue: round(presentValue, 2),
    };
  });

  const macaulayDuration = weightedTime / input.marketPrice;
  const modifiedDuration = macaulayDuration / (1 + periodicYield);
  const convexity = convexityNumerator / (input.marketPrice * frequency ** 2);
  const difference = input.marketPrice - input.faceValue;
  const absoluteDifference = Math.abs(difference);
  const totalInterestEarned = coupon * periods;

  const yieldScenarios: YieldScenario[] = [-200, -100, -50, 0, 50, 100, 200].map((basisPoints) => {
    const scenarioYield = ytm + basisPoints / 100;
    const scenarioRate = Math.max(-0.99, scenarioYield / 100 / frequency);
    const estimatedPrice = bondPresentValue(scenarioRate, coupon, input.faceValue, periods);
    const priceChange = estimatedPrice - input.marketPrice;
    return {
      basisPoints,
      yield: round(scenarioYield, 4),
      estimatedPrice: round(estimatedPrice, 2),
      priceChange: round(priceChange, 2),
      priceChangePercent: round(priceChange / input.marketPrice * 100, 4),
    };
  });

  return {
    currentYield: round(input.faceValue * input.annualCouponRate / 100 / input.marketPrice * 100, 4),
    ytm: round(ytm, 4),
    totalInterestEarned: round(totalInterestEarned, 2),
    premiumOrDiscount: absoluteDifference < 0.01 ? 'par' : difference > 0 ? 'premium' : 'discount',
    premiumDiscountAmount: round(absoluteDifference, 2),
    premiumDiscountPercent: round(absoluteDifference / input.faceValue * 100, 4),
    couponPayment: round(coupon, 2),
    totalCashReceived: round(totalInterestEarned + input.faceValue, 2),
    netReturn: round(totalInterestEarned + input.faceValue - input.marketPrice, 2),
    effectiveAnnualYield: round(((1 + periodicYield) ** frequency - 1) * 100, 4),
    macaulayDuration: round(macaulayDuration, 4),
    modifiedDuration: round(modifiedDuration, 4),
    convexity: round(convexity, 4),
    dv01: round(modifiedDuration * input.marketPrice * 0.0001, 4),
    periods,
    cashFlowSchedule,
    yieldScenarios,
  };
}
