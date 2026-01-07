/**
 * Email Variable Substitution Utility
 *
 * Handles {{variable}} syntax in email templates with support for:
 * - Simple variables: {{variableName}}
 * - Nested objects: {{order.id}}
 * - Arrays with loops: {{#items}}...{{/items}}
 * - Conditionals: {{#if condition}}...{{/if}}
 * - Formatters: {{amount|currency}} or {{date|formatDate}}
 * - System partials: {{standardStyles}}, {{standardHeader}}, {{standardFooter}}
 */

type DataValue = string | number | boolean | null | undefined | DataObject | DataValue[];
interface DataObject {
  [key: string]: DataValue;
}

// Standard email partials - must match Edge function exactly
const STANDARD_STYLES = `
  /* Reset and base styles */
  body, table, td, p, a, li, blockquote {
    -webkit-text-size-adjust: 100%;
    -ms-text-size-adjust: 100%;
  }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    line-height: 1.6;
    color: #333333;
    margin: 0;
    padding: 0;
    background-color: #f5f5f5;
    width: 100% !important;
  }
  table {
    border-collapse: collapse;
    mso-table-lspace: 0pt;
    mso-table-rspace: 0pt;
  }
  img {
    border: 0;
    height: auto;
    line-height: 100%;
    outline: none;
    text-decoration: none;
    -ms-interpolation-mode: bicubic;
  }
  .email-wrapper {
    width: 100%;
    background-color: #f5f5f5;
    padding: 20px 0;
  }
  .email-container {
    max-width: 600px;
    margin: 0 auto;
    background: #ffffff;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
  .header {
    text-align: center;
    padding: 30px 20px;
    background-color: #22c55e;
    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
    color: #ffffff;
  }
  .logo {
    font-size: 28px;
    font-weight: bold;
    margin-bottom: 5px;
    color: #ffffff;
  }
  .tagline {
    font-size: 14px;
    opacity: 0.9;
    color: #ffffff;
  }
  .content {
    padding: 30px;
  }
  h1 {
    color: #1f2937;
    margin-top: 0;
    font-size: 24px;
    line-height: 1.3;
  }
  h2, h3 {
    color: #1f2937;
    margin-top: 0;
  }
  p {
    margin: 0 0 16px 0;
  }
  a {
    color: #22c55e;
    text-decoration: none;
  }
  .button {
    display: inline-block;
    background-color: #22c55e;
    color: #ffffff !important;
    padding: 14px 28px;
    text-decoration: none;
    border-radius: 8px;
    font-weight: 600;
    margin: 20px 0;
    text-align: center;
  }
  .button:hover {
    background-color: #16a34a;
  }
  .footer {
    text-align: center;
    padding: 20px;
    background-color: #f9fafb;
    border-top: 1px solid #e5e7eb;
    color: #6b7280;
    font-size: 13px;
  }
  .footer a {
    color: #22c55e;
    text-decoration: none;
  }
  .info-box {
    background-color: #f3f4f6;
    padding: 20px;
    border-radius: 8px;
    margin: 20px 0;
  }
  .highlight-box {
    background-color: #ecfdf5;
    border-left: 4px solid #22c55e;
    padding: 20px;
    border-radius: 0 8px 8px 0;
    margin: 20px 0;
  }
  .items-table {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
  }
  .items-table th, .items-table td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #e5e7eb;
  }
  .items-table th {
    background-color: #f9fafb;
    font-weight: 600;
    color: #374151;
  }
  @media only screen and (max-width: 600px) {
    .email-container {
      width: 100% !important;
      border-radius: 0;
    }
    .content {
      padding: 20px !important;
    }
    .button {
      display: block !important;
      width: 100% !important;
    }
  }
`;

const STANDARD_HEADER = `
<div class="header">
  <div class="logo">Long Life</div>
  <div class="tagline">Cold-Pressed Wellness</div>
</div>
`;

const STANDARD_FOOTER = `
<div class="footer">
  <div style="background-color: #ecfdf5; padding: 16px 20px; margin: 0 -20px 20px -20px; border-top: 2px solid #22c55e;">
    <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #166534;">Love Long Life? Become an Ambassador!</p>
    <p style="margin: 0 0 12px 0; font-size: 13px; color: #15803d;">Earn rewards when you share the wellness with friends.</p>
    <a href="https://drinklonglife.com/ambassador" style="display: inline-block; background-color: #22c55e; color: #ffffff; padding: 8px 20px; text-decoration: none; border-radius: 20px; font-size: 13px; font-weight: 600;">Join the Movement</a>
  </div>
  <p style="margin: 0 0 8px 0;">Questions? Contact us at <a href="mailto:support@drinklonglife.com" style="color: #22c55e;">support@drinklonglife.com</a></p>
  <p style="margin: 8px 0; font-size: 12px; color: #9ca3af;">
    Long Life, Inc.<br>
    Los Angeles, CA
  </p>
  <p style="margin-top: 15px; font-size: 11px; color: #9ca3af;">
    <a href="#" style="color: #6b7280; text-decoration: underline;">Unsubscribe</a> ·
    <a href="#" style="color: #6b7280; text-decoration: underline;">Email Preferences</a>
  </p>
</div>
`;

/**
 * Format a value using a formatter
 */
function applyFormatter(value: DataValue, formatter: string): string {
  if (value === null || value === undefined) {
    return '';
  }

  switch (formatter) {
    case 'currency':
      // Assumes value is in cents
      const amount = typeof value === 'number' ? value : parseFloat(String(value));
      return isNaN(amount) ? String(value) : `$${(amount / 100).toFixed(2)}`;

    case 'formatDate':
      const date = new Date(String(value));
      return isNaN(date.getTime())
        ? String(value)
        : date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    case 'formatDateTime':
      const dateTime = new Date(String(value));
      return isNaN(dateTime.getTime())
        ? String(value)
        : dateTime.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          });

    case 'uppercase':
      return String(value).toUpperCase();

    case 'lowercase':
      return String(value).toLowerCase();

    case 'capitalize':
      return String(value).charAt(0).toUpperCase() + String(value).slice(1);

    case 'number':
      const num = typeof value === 'number' ? value : parseFloat(String(value));
      return isNaN(num) ? String(value) : num.toLocaleString();

    case 'percent':
      const pct = typeof value === 'number' ? value : parseFloat(String(value));
      return isNaN(pct) ? String(value) : `${pct}%`;

    default:
      return String(value);
  }
}

/**
 * Get a nested value from an object using dot notation
 */
function getNestedValue(obj: DataObject, path: string): DataValue {
  const parts = path.split('.');
  let current: DataValue = obj;

  for (const part of parts) {
    if (current === null || current === undefined) {
      return undefined;
    }
    if (typeof current === 'object' && !Array.isArray(current)) {
      current = (current as DataObject)[part];
    } else {
      return undefined;
    }
  }

  return current;
}

/**
 * Process array loops: {{#items}}...{{/items}}
 */
function processLoops(template: string, data: DataObject): string {
  const loopRegex = /\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g;

  return template.replace(loopRegex, (_, arrayName, innerTemplate) => {
    const array = data[arrayName];

    if (!Array.isArray(array)) {
      return '';
    }

    return array
      .map((item, index) => {
        // Create context with item data and index
        const itemContext = typeof item === 'object' && item !== null ? { ...item, _index: index } : { _value: item, _index: index };
        return substituteVariables(innerTemplate, itemContext as DataObject);
      })
      .join('');
  });
}

/**
 * Process conditionals: {{#if condition}}...{{/if}} and {{#if condition}}...{{else}}...{{/if}}
 */
function processConditionals(template: string, data: DataObject): string {
  // Process if/else blocks
  const ifElseRegex = /\{\{#if (\w+(?:\.\w+)*)\}\}([\s\S]*?)\{\{else\}\}([\s\S]*?)\{\{\/if\}\}/g;
  template = template.replace(ifElseRegex, (_, condition, trueBlock, falseBlock) => {
    const value = getNestedValue(data, condition);
    return value ? trueBlock : falseBlock;
  });

  // Process simple if blocks
  const ifRegex = /\{\{#if (\w+(?:\.\w+)*)\}\}([\s\S]*?)\{\{\/if\}\}/g;
  template = template.replace(ifRegex, (_, condition, block) => {
    const value = getNestedValue(data, condition);
    return value ? block : '';
  });

  return template;
}

/**
 * Main function to substitute variables in a template
 */
export function substituteVariables(template: string, data: DataObject): string {
  // First, inject standard partials (DRY - defined once, used everywhere)
  let result = template
    .replace(/\{\{standardStyles\}\}/g, STANDARD_STYLES)
    .replace(/\{\{standardHeader\}\}/g, STANDARD_HEADER)
    .replace(/\{\{standardFooter\}\}/g, STANDARD_FOOTER);

  // Process loops
  result = processLoops(result, data);

  // Process conditionals
  result = processConditionals(result, data);

  // Process simple variables with optional formatters: {{variable|formatter}}
  const variableRegex = /\{\{(\w+(?:\.\w+)*)(?:\|(\w+))?\}\}/g;

  result = result.replace(variableRegex, (_, variablePath, formatter) => {
    const value = getNestedValue(data, variablePath);

    if (value === undefined || value === null) {
      return '';
    }

    if (formatter) {
      return applyFormatter(value, formatter);
    }

    return String(value);
  });

  return result;
}

/**
 * Extract all variable names from a template
 */
export function extractVariables(template: string): string[] {
  const variables = new Set<string>();

  // Simple variables
  const variableRegex = /\{\{(\w+(?:\.\w+)*)(?:\|\w+)?\}\}/g;
  let match;
  while ((match = variableRegex.exec(template)) !== null) {
    variables.add(match[1]);
  }

  // Loop variables
  const loopRegex = /\{\{#(\w+)\}\}/g;
  while ((match = loopRegex.exec(template)) !== null) {
    variables.add(match[1]);
  }

  // Conditional variables
  const condRegex = /\{\{#if (\w+(?:\.\w+)*)\}\}/g;
  while ((match = condRegex.exec(template)) !== null) {
    variables.add(match[1]);
  }

  return Array.from(variables);
}

/**
 * Generate sample data from a schema
 */
export function generateSampleData(schema: Record<string, any>): DataObject {
  const data: DataObject = {};

  for (const [key, type] of Object.entries(schema)) {
    if (typeof type === 'string') {
      switch (type) {
        case 'string':
          data[key] = `Sample ${key}`;
          break;
        case 'number':
          data[key] = 12345;
          break;
        case 'currency':
          data[key] = 4999; // $49.99 in cents
          break;
        case 'date':
          data[key] = new Date().toISOString();
          break;
        case 'boolean':
          data[key] = true;
          break;
        case 'email':
          data[key] = 'customer@example.com';
          break;
        default:
          data[key] = `[${key}]`;
      }
    } else if (Array.isArray(type)) {
      // Array type - generate sample array
      data[key] = [
        { name: 'Sample Item 1', quantity: 2, price: 2999 },
        { name: 'Sample Item 2', quantity: 1, price: 1999 },
      ];
    } else if (typeof type === 'object') {
      // Nested object - recurse
      data[key] = generateSampleData(type);
    }
  }

  return data;
}

/**
 * Validate a template against a schema
 */
export function validateTemplate(template: string, schema: Record<string, any>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const usedVariables = extractVariables(template);
  const schemaKeys = new Set(Object.keys(flattenSchema(schema)));

  for (const variable of usedVariables) {
    const rootKey = variable.split('.')[0];
    if (!schemaKeys.has(rootKey) && !['_index', '_value'].includes(rootKey)) {
      errors.push(`Variable "${variable}" is not defined in schema`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Flatten nested schema keys
 */
function flattenSchema(schema: Record<string, any>, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(schema)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'string') {
      result[key] = value;
    } else if (typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flattenSchema(value, fullKey));
      result[key] = 'object';
    } else {
      result[key] = 'array';
    }
  }

  return result;
}
