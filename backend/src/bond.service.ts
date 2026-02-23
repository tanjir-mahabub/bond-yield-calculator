import { Injectable } from '@nestjs/common';
import {
  BondInputDto,
  BondCalculationResult,
  CashFlowPeriod,
  CouponFrequency,
} from './bond.dto';
import { round, solveYTMBisection } from './math.utils';

/**
 * BondService — domain logic layer.
 *
 * Single Responsibility: bond math only.
 * No HTTP knowledge, no validation logic, no persistence.
 *
 * Each private method has one named purpose so future additions
 * (duration, convexity, modified duration) slot in cleanly.
 */
@Injectable()
export class BondService {
  calculate(input: BondInputDto): BondCalculationResult {
    const periodsPerYear = input.couponFrequency === CouponFrequency.SEMI_ANNUAL ? 2 : 1;
    const totalPeriods   = Math.round(input.yearsToMaturity * periodsPerYear);
    const couponPayment  = this.getCouponPayment(
      input.faceValue,
      input.annualCouponRate,
      periodsPerYear,
    );

    return {
      currentYield:        round(this.getCurrentYield(input.faceValue, input.annualCouponRate, input.marketPrice), 4),
      ytm:                 round(this.getAnnualisedYTM(input.marketPrice, couponPayment, input.faceValue, totalPeriods, periodsPerYear), 4),
      totalInterestEarned: round(couponPayment * totalPeriods, 2),
      ...this.getPremiumDiscountInfo(input.faceValue, input.marketPrice),
      cashFlowSchedule:    this.buildCashFlowSchedule(input.faceValue, couponPayment, totalPeriods, periodsPerYear),
    };
  }

  // ─── Private methods ───────────────────────────────────────────────────

  private getCouponPayment(faceValue: number, annualCouponRate: number, periodsPerYear: number): number {
    return (faceValue * (annualCouponRate / 100)) / periodsPerYear;
  }

  /** Current Yield = annual coupon / market price — income return only */
  private getCurrentYield(faceValue: number, annualCouponRate: number, marketPrice: number): number {
    return ((faceValue * (annualCouponRate / 100)) / marketPrice) * 100;
  }

  private getAnnualisedYTM(
    marketPrice: number,
    couponPayment: number,
    faceValue: number,
    totalPeriods: number,
    periodsPerYear: number,
  ): number {
    const periodicRate = solveYTMBisection(marketPrice, couponPayment, faceValue, totalPeriods);
    return periodicRate * periodsPerYear * 100; // annualised %
  }

  private getPremiumDiscountInfo(
    faceValue: number,
    marketPrice: number,
  ): Pick<BondCalculationResult, 'premiumOrDiscount' | 'premiumDiscountAmount' | 'premiumDiscountPercent'> {
    const diff    = marketPrice - faceValue;
    const absDiff = Math.abs(diff);

    let premiumOrDiscount: 'premium' | 'discount' | 'par';
    if (absDiff < 0.01) premiumOrDiscount = 'par';
    else if (diff > 0)  premiumOrDiscount = 'premium';
    else                premiumOrDiscount = 'discount';

    return {
      premiumOrDiscount,
      premiumDiscountAmount:  round(absDiff, 2),
      premiumDiscountPercent: round((absDiff / faceValue) * 100, 4),
    };
  }

  /**
   * Build cash flow schedule using Array.from — functional, no mutation.
   * Final period sets remainingPrincipal = 0 (face value returned).
   */
  private buildCashFlowSchedule(
    faceValue: number,
    couponPayment: number,
    totalPeriods: number,
    periodsPerYear: number,
  ): CashFlowPeriod[] {
    const today           = new Date();
    const monthsPerPeriod = 12 / periodsPerYear;
    const roundedCoupon   = round(couponPayment, 2);
    let   cumulative      = 0;

    return Array.from({ length: totalPeriods }, (_, i) => {
      const period    = i + 1;
      cumulative     += couponPayment;
      const date      = new Date(today);
      date.setMonth(today.getMonth() + period * monthsPerPeriod);

      return {
        period,
        paymentDate:        date.toISOString().split('T')[0],
        couponPayment:      roundedCoupon,
        cumulativeInterest: round(cumulative, 2),
        remainingPrincipal: period === totalPeriods ? 0 : faceValue,
      };
    });
  }
}
