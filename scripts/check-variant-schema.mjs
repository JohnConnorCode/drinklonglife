#!/usr/bin/env node
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 CHECKING PRODUCT_VARIANTS SCHEMA\n');

// Get a sample variant to see all fields
const response = await fetch(`${SUPABASE_URL}/rest/v1/product_variants?limit=1`, {
  headers: {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
  },
});

const variants = await response.json();

if (variants && variants.length > 0) {
  console.log('Sample variant fields:');
  console.log(JSON.stringify(variants[0], null, 2));
} else {
  console.log('No variants found');
}
