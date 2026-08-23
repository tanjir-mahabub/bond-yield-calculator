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

export function downloadCsv<T extends object>(rows: T[]): void {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]) as Array<keyof T>;
  const csv = [headers.join(','), ...rows.map((row) => headers.map((header) => JSON.stringify(row[header])).join(','))].join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'bond-cash-flow-schedule.csv';
  link.click();
  URL.revokeObjectURL(url);
}
