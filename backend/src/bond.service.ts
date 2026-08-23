import { Injectable } from '@nestjs/common';
import {
  BondInputDto,
  BondCalculationResult,
  CashFlowPeriod,
  CouponFrequency,
  YieldScenario,
} from './bond.dto';
import { bondPresentValue, calculateRiskMetrics, round, solveYTMBisection } from './math.utils';

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
    const periodsPerYear = this.getPeriodsPerYear(input.couponFrequency);
    const totalPeriods   = Math.round(input.yearsToMaturity * periodsPerYear);
    const couponPayment  = this.getCouponPayment(
      input.faceValue,
      input.annualCouponRate,
      periodsPerYear,
    );

    const periodicYield = solveYTMBisection(input.marketPrice, couponPayment, input.faceValue, totalPeriods);
    const nominalYtm = periodicYield * periodsPerYear * 100;
    const risk = calculateRiskMetrics(
      input.marketPrice,
      couponPayment,
      input.faceValue,
      totalPeriods,
      periodsPerYear,
      periodicYield,
    );
    const totalInterestEarned = couponPayment * totalPeriods;

    return {
      currentYield:        round(this.getCurrentYield(input.faceValue, input.annualCouponRate, input.marketPrice), 4),
      ytm:                 round(nominalYtm, 4),
      totalInterestEarned: round(totalInterestEarned, 2),
      couponPayment:       round(couponPayment, 2),
      totalCashReceived:   round(totalInterestEarned + input.faceValue, 2),
      netReturn:           round(totalInterestEarned + input.faceValue - input.marketPrice, 2),
      effectiveAnnualYield: round((Math.pow(1 + periodicYield, periodsPerYear) - 1) * 100, 4),
      macaulayDuration:    round(risk.macaulayDuration, 4),
      modifiedDuration:    round(risk.modifiedDuration, 4),
      convexity:           round(risk.convexity, 4),
      dv01:                round(risk.dv01, 4),
      periods:             totalPeriods,
      ...this.getPremiumDiscountInfo(input.faceValue, input.marketPrice),
      cashFlowSchedule:    this.buildCashFlowSchedule(input.faceValue, couponPayment, totalPeriods, periodsPerYear, periodicYield),
      yieldScenarios:      this.buildYieldScenarios(input.marketPrice, couponPayment, input.faceValue, totalPeriods, periodsPerYear, nominalYtm),
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

  private getPeriodsPerYear(frequency: CouponFrequency): number {
    return frequency === CouponFrequency.QUARTERLY
      ? 4
      : frequency === CouponFrequency.SEMI_ANNUAL ? 2 : 1;
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
    periodicYield: number,
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
        principalPayment:   period === totalPeriods ? faceValue : 0,
        totalCashFlow:      round(couponPayment + (period === totalPeriods ? faceValue : 0), 2),
        presentValue:       round((couponPayment + (period === totalPeriods ? faceValue : 0)) / Math.pow(1 + periodicYield, period), 2),
      };
    });
  }

  private buildYieldScenarios(
    marketPrice: number,
    couponPayment: number,
    faceValue: number,
    totalPeriods: number,
    periodsPerYear: number,
    nominalYtm: number,
  ): YieldScenario[] {
    return [-200, -100, -50, 0, 50, 100, 200].map((basisPoints) => {
      const annualYield = nominalYtm + basisPoints / 100;
      const periodicYield = Math.max(-0.99, annualYield / 100 / periodsPerYear);
      const estimatedPrice = bondPresentValue(periodicYield, couponPayment, faceValue, totalPeriods);
      const priceChange = estimatedPrice - marketPrice;
      return {
        basisPoints,
        yield: round(annualYield, 4),
        estimatedPrice: round(estimatedPrice, 2),
        priceChange: round(priceChange, 2),
        priceChangePercent: round((priceChange / marketPrice) * 100, 4),
      };
    });
  }
}
