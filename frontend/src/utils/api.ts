import type { BondInput, BondResult } from '../types/bond';

const API_URL = import.meta.env.VITE_API_URL;

export async function calculateBond(input: BondInput): Promise<BondResult> {
  const response = await fetch(`${API_URL}/api/bond/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
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