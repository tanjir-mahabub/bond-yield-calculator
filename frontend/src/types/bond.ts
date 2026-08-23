export type CouponFrequency = 'annual' | 'semi-annual' | 'quarterly';

export interface BondInput {
  faceValue: number;
  annualCouponRate: number;
  marketPrice: number;
  yearsToMaturity: number;
  couponFrequency: CouponFrequency;
}

export interface CashFlowPeriod {
  period: number;
  paymentDate: string;
  couponPayment: number;
  cumulativeInterest: number;
  remainingPrincipal: number;
  principalPayment: number;
  totalCashFlow: number;
  presentValue: number;
}

export interface YieldScenario {
  basisPoints: number;
  yield: number;
  estimatedPrice: number;
  priceChange: number;
  priceChangePercent: number;
}

export interface BondResult {
  currentYield: number;
  ytm: number;
  totalInterestEarned: number;
  premiumOrDiscount: 'premium' | 'discount' | 'par';
  premiumDiscountAmount: number;
  premiumDiscountPercent: number;
  cashFlowSchedule: CashFlowPeriod[];
  couponPayment: number;
  totalCashReceived: number;
  netReturn: number;
  effectiveAnnualYield: number;
  macaulayDuration: number;
  modifiedDuration: number;
  convexity: number;
  dv01: number;
  periods: number;
  yieldScenarios: YieldScenario[];
}
