/**
 * Cached Intl.NumberFormat instance.
 * Creating Intl formatters is expensive — reusing one instance
 * avoids that cost on every render.
 */
const USD_FORMATTER = new Intl.NumberFormat('en-US', {
  style:    'currency',
  currency: 'USD',
});

export function formatCurrency(value: number): string {
  return USD_FORMATTER.format(value);
}

export function formatPercent(value: number, decimals = 2): string {
  return `${value.toFixed(decimals)}%`;
}
