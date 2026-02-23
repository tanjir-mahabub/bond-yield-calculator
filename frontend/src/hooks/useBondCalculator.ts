import { useState, useCallback } from 'react';
import type { BondInput, BondResult } from '../types/bond';
import { calculateBond } from '../utils/api';

interface UseBondCalculatorReturn {
  result: BondResult | null;
  loading: boolean;
  error: string | null;
  calculate: (input: BondInput) => Promise<void>;
}

/**
 * useBondCalculator — encapsulates all API interaction state.
 * Components only see: result, loading, error, calculate().
 * If we swap fetch for axios or React Query later, only this file changes.
 */
export function useBondCalculator(): UseBondCalculatorReturn {
  const [result, setResult] = useState<BondResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculate = useCallback(async (input: BondInput) => {
    setLoading(true);
    setError(null);
    try {
      const data = await calculateBond(input);
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Calculation failed');
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return { result, loading, error, calculate };
}
