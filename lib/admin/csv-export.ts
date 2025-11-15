/**
 * CSV Export Utilities
 * Export products and ingredients to CSV format
 */

export interface CSVRow {
  [key: string]: string | number | boolean | null;
}

/**
 * Convert array of objects to CSV string
 */
export function arrayToCSV(data: CSVRow[]): string {
  if (!data || data.length === 0) {
    return '';
  }

  // Get headers from first row
  const headers = Object.keys(data[0]);

  // Create header row
  const headerRow = headers.map(escapeCSVField).join(',');

  // Create data rows
  const dataRows = data.map((row) => {
    return headers.map((header) => {
      const value = row[header];
      return escapeCSVField(value);
    }).join(',');
  });

  return [headerRow, ...dataRows].join('\n');
}

/**
 * Escape CSV field (handle commas, quotes, newlines)
 */
function escapeCSVField(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }

  const stringValue = String(value);

  // If field contains comma, quote, or newline, wrap in quotes and escape quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

/**
 * Convert products to CSV format
 */
export function productsToCSV(products: any[]): string {
  const rows: CSVRow[] = products.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    tagline: product.tagline || '',
    label_color: product.label_color || '',
    function_list: Array.isArray(product.function_list) ? product.function_list.join(';') : '',
    best_for: Array.isArray(product.best_for) ? product.best_for.join(';') : '',
    image_url: product.image_url || '',
    stripe_product_id: product.stripe_product_id || '',
    is_featured: product.is_featured ? 'true' : 'false',
    is_active: product.is_active ? 'true' : 'false',
    display_order: product.display_order,
    published_at: product.published_at || '',
    created_at: product.created_at || '',
    updated_at: product.updated_at || '',
  }));

  return arrayToCSV(rows);
}

/**
 * Convert ingredients to CSV format
 */
export function ingredientsToCSV(ingredients: any[]): string {
  const rows: CSVRow[] = ingredients.map((ingredient) => ({
    id: ingredient.id,
    name: ingredient.name,
    type: ingredient.type || '',
    seasonality: ingredient.seasonality || '',
    nutritional_profile: ingredient.nutritional_profile || '',
    notes: ingredient.notes || '',
    image_url: ingredient.image_url || '',
    image_alt: ingredient.image_alt || '',
    created_at: ingredient.created_at || '',
    updated_at: ingredient.updated_at || '',
  }));

  return arrayToCSV(rows);
}

/**
 * Convert product variants to CSV format
 */
export function variantsToCSV(variants: any[]): string {
  const rows: CSVRow[] = variants.map((variant) => ({
    id: variant.id,
    product_id: variant.product_id,
    size_key: variant.size_key,
    label: variant.label,
    stripe_price_id: variant.stripe_price_id,
    is_default: variant.is_default ? 'true' : 'false',
    display_order: variant.display_order,
    is_active: variant.is_active ? 'true' : 'false',
    price_usd: variant.price_usd || '',
    sku: variant.sku || '',
    created_at: variant.created_at || '',
    updated_at: variant.updated_at || '',
  }));

  return arrayToCSV(rows);
}

/**
 * Generate a downloadable CSV file response
 */
export function createCSVDownload(csvContent: string, filename: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
