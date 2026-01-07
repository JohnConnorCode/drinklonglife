#!/usr/bin/env node
/**
 * Script to replace console.* calls with logger.* calls
 * Adds import if missing, replaces console.error/warn/log/info with logger equivalent
 */

import { readFileSync, writeFileSync } from 'fs';

const files = [
  'app/api/checkout/route.ts',
  'lib/stripe/product-sync.ts',
  'app/api/stripe/webhook/route.ts',
  'lib/stripe/config.ts',
  'app/api/admin/stripe-settings/route.ts',
  'app/(admin)/admin/products/ProductForm.tsx'
];

files.forEach(file => {
  const fullPath = `/Users/johnconnor/Documents/GitHub/DrinkLongLife/${file}`;

  try {
    let content = readFileSync(fullPath, 'utf8');

    // Check if logger import already exists
    const hasLoggerImport = content.includes("from '@/lib/logger'") || content.includes('from "@/lib/logger"');

    // Add logger import if missing (after first import statement)
    if (!hasLoggerImport && content.includes('console.')) {
      const lines = content.split('\n');
      let insertIndex = -1;

      // Find first import statement
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim().startsWith('import ')) {
          insertIndex = i + 1;
        }
        // Stop at first non-import line after imports
        if (insertIndex > 0 && !lines[i].trim().startsWith('import ') && lines[i].trim() !== '') {
          break;
        }
      }

      if (insertIndex > 0) {
        lines.splice(insertIndex, 0, "import { logger } from '@/lib/logger';");
        content = lines.join('\n');
      }
    }

    // Replace console.* calls with logger.*
    let modified = content
      .replace(/console\.error\(/g, 'logger.error(')
      .replace(/console\.warn\(/g, 'logger.warn(')
      .replace(/console\.log\(/g, 'logger.info(')
      .replace(/console\.info\(/g, 'logger.info(');

    if (modified !== content) {
      writeFileSync(fullPath, modified, 'utf8');
      console.log(`✅ Updated: ${file}`);
    } else {
      console.log(`ℹ️  No changes: ${file}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
  }
});

console.log('\n✅ Console logging replacement complete!');
