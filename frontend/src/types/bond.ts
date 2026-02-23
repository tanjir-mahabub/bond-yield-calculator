export type CouponFrequency = 'annual' | 'semi-annual';

export interface BondInput {
  faceValue:        number;
  annualCouponRate: number;
  marketPrice:      number;
  yearsToMaturity:  number;
  couponFrequency:  CouponFrequency;
}

export interface CashFlowPeriod {
  period:             number;
  paymentDate:        string;
  couponPayment:      number;
  cumulativeInterest: number;
  remainingPrincipal: number;
}

export interface BondResult {
  currentYield:           number;
  ytm:                    number;
  totalInterestEarned:    number;
  premiumOrDiscount:      'premium' | 'discount' | 'par';
  premiumDiscountAmount:  number;
  premiumDiscountPercent: number;
  cashFlowSchedule:       CashFlowPeriod[];
}
