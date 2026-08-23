import type { BondInput, BondResult } from '../types/bond';
import { calculateBondLocally } from '../domain/bondCalculator';

const API_URL = import.meta.env.VITE_API_URL;

export async function calculateBond(input: BondInput): Promise<BondResult> {
  if (!API_URL) return calculateBondLocally(input);

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 6500);

  try {
    const response = await fetch(`${API_URL}/api/bond/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
      signal: controller.signal,
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
  } catch (error) {
    if (error instanceof TypeError || (error instanceof DOMException && error.name === 'AbortError')) {
      return calculateBondLocally(input);
    }
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}
