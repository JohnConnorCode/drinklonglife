#!/usr/bin/env node
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const mode = process.argv[2] || 'test';

if (mode !== 'test' && mode !== 'production') {
  console.error('Usage: node scripts/switch-mode.mjs [test|production]');
  process.exit(1);
}

// First get the current record
const getUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/stripe_settings?limit=1`;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const getResponse = await fetch(getUrl, {
  headers: {
    'apikey': key,
    'Authorization': `Bearer ${key}`
  }
});

const records = await getResponse.json();
if (!records || records.length === 0) {
  console.error('No stripe_settings record found');
  process.exit(1);
}

const recordId = records[0].id;

// Now update it
const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/stripe_settings?id=eq.${recordId}`;

const response = await fetch(url, {
  method: 'PATCH',
  headers: {
    'apikey': key,
    'Authorization': `Bearer ${key}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  },
  body: JSON.stringify({
    mode,
    last_modified: new Date().toISOString(),
    modified_by: 'verification-test'
  })
});

if (!response.ok) {
  console.error('Failed to switch mode:', await response.text());
  process.exit(1);
}

const data = await response.json();
console.log(`✅ Switched to ${mode.toUpperCase()} mode`);
console.log(JSON.stringify(data, null, 2));
