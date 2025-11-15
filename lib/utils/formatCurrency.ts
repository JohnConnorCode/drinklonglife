/**
 * Format cents to USD currency string
 * @param cents - Amount in cents (e.g., 4800 = $48.00)
 * @returns Formatted currency string (e.g., "$48.00")
 */
export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

/**
 * Format cents to compact currency string (no decimals for whole dollars)
 * @param cents - Amount in cents
 * @returns Compact currency string (e.g., "$48" or "$48.50")
 */
export function formatCurrencyCompact(cents: number): string {
  const dollars = cents / 100;
  if (dollars % 1 === 0) {
    return `$${dollars.toFixed(0)}`;
  }
  return `$${dollars.toFixed(2)}`;
}
