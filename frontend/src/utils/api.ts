import { BondInput, BondResult } from '../types/bond';

/**
 * calculateBond — single API call wrapper.
 * Throws with a descriptive message on non-2xx so the hook
 * can set error state without parsing details everywhere.
 */
export async function calculateBond(input: BondInput): Promise<BondResult> {
  const response = await fetch('/api/bond/calculate', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      Array.isArray(error.message)
        ? error.message.join(', ')
        : error.message ?? `Request failed: ${response.status}`,
    );
  }

  return response.json();
}
