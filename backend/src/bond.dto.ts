import { IsNumber, IsEnum, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export enum CouponFrequency {
  ANNUAL      = 'annual',
  SEMI_ANNUAL = 'semi-annual',
}

/**
 * BondInputDto — validated request body for POST /api/bond/calculate
 *
 * @Transform on every numeric field: guards against clients sending
 * "1000" (string) instead of 1000 (number) — NestJS will coerce safely.
 *
 * forbidNonWhitelisted in main.ts + whitelist: true means any property
 * not declared here will be stripped / rejected automatically.
 */
export class BondInputDto {
  @IsNumber()
  @Min(0.01, { message: 'Face value must be greater than zero' })
  @Transform(({ value }) => parseFloat(value))
  faceValue: number;

  @IsNumber()
  @Min(0,   { message: 'Coupon rate cannot be negative' })
  @Max(100, { message: 'Coupon rate cannot exceed 100%' })
  @Transform(({ value }) => parseFloat(value))
  annualCouponRate: number;

  @IsNumber()
  @Min(0.01, { message: 'Market price must be greater than zero' })
  @Transform(({ value }) => parseFloat(value))
  marketPrice: number;

  @IsNumber()
  @Min(0.5, { message: 'Minimum maturity is 0.5 years (one period)' })
  @Max(100, { message: 'Maximum maturity is 100 years' })
  @Transform(({ value }) => parseFloat(value))
  yearsToMaturity: number;

  @IsEnum(CouponFrequency, {
    message: `couponFrequency must be one of: ${Object.values(CouponFrequency).join(', ')}`,
  })
  couponFrequency: CouponFrequency;
}

// Response types defined alongside the DTO so input/output shapes live together
export interface CashFlowPeriod {
  period:             number;
  paymentDate:        string;
  couponPayment:      number;
  cumulativeInterest: number;
  remainingPrincipal: number;
}

export interface BondCalculationResult {
  currentYield:           number;
  ytm:                    number;
  totalInterestEarned:    number;
  premiumOrDiscount:      'premium' | 'discount' | 'par';
  premiumDiscountAmount:  number;
  premiumDiscountPercent: number;
  cashFlowSchedule:       CashFlowPeriod[];
}
