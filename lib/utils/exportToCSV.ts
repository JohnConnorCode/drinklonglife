/**
 * CSV Export Utility
 *
 * Converts data to CSV format and triggers browser download
 */

/**
 * Convert array of objects to CSV string
 * @param data - Array of objects to convert
 * @param headers - Optional custom headers (uses object keys if not provided)
 * @returns CSV string
 */
export function convertToCSV<T extends Record<string, any>>(
  data: T[],
  headers?: string[]
): string {
  if (data.length === 0) {
    return '';
  }

  // Use provided headers or extract from first object
  const csvHeaders = headers || Object.keys(data[0]);

  // Create header row
  const headerRow = csvHeaders.map(escapeCSVValue).join(',');

  // Create data rows
  const dataRows = data.map(item => {
    return csvHeaders.map(header => {
      const value = item[header];
      return escapeCSVValue(value);
    }).join(',');
  });

  return [headerRow, ...dataRows].join('\n');
}

/**
 * Escape a value for CSV format
 * Handles quotes, commas, and newlines
 */
function escapeCSVValue(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }

  const stringValue = String(value);

  // If value contains comma, quote, or newline, wrap in quotes and escape quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

/**
 * Trigger browser download of CSV file
 * @param data - Array of objects to export
 * @param filename - Name of file to download (without .csv extension)
 * @param headers - Optional custom headers
 */
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  headers?: string[]
): void {
  const csv = convertToCSV(data, headers);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up the URL object
  URL.revokeObjectURL(url);
}

/**
 * Format order data for CSV export
 * Helper function to prepare order data with proper formatting
 */
export function formatOrdersForCSV(orders: any[]): any[] {
  return orders.map(order => ({
    'Order ID': order.id,
    'Date': new Date(order.created_at).toLocaleString(),
    'Customer Email': order.customer_email || 'N/A',
    'Amount': `$${(order.amount_total / 100).toFixed(2)}`,
    'Status': order.status,
    'Payment Status': order.payment_status,
    'Stripe Session ID': order.stripe_session_id,
  }));
}
