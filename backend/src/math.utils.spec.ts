import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { bondPresentValue, calculateRiskMetrics, round, solveYTMBisection } from './math.utils';

test('prices a par bond at its coupon rate', () => {
  const price = bondPresentValue(0.025, 25, 1000, 20);
  assert.equal(round(price, 2), 1000);
});

test('solves nominal YTM for a discount bond', () => {
  const periodic = solveYTMBisection(950, 25, 1000, 20);
  assert.ok(periodic * 2 * 100 > 5);
  assert.ok(Math.abs(bondPresentValue(periodic, 25, 1000, 20) - 950) < 0.001);
});

test('supports negative yields for extreme premium bonds', () => {
  const periodic = solveYTMBisection(1200, 0, 1000, 2);
  assert.ok(periodic < 0);
  assert.ok(Math.abs(bondPresentValue(periodic, 0, 1000, 2) - 1200) < 0.001);
});

test('returns positive duration, convexity and DV01', () => {
  const risk = calculateRiskMetrics(950, 25, 1000, 20, 2, 0.0279);
  assert.ok(risk.macaulayDuration > 0);
  assert.ok(risk.modifiedDuration > 0);
  assert.ok(risk.convexity > 0);
  assert.ok(risk.dv01 > 0);
});
