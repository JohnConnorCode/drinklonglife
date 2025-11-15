#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: join(__dirname, '..', '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('Querying all RLS policies on profiles table...\n');

// Use the REST API to query pg_policies view
const { data, error } = await supabase
  .from('pg_policies')
  .select('*')
  .eq('tablename', 'profiles');

if (error) {
  console.error('Error:', error);
  console.log('\nTrying alternative method...\n');

  // Try using rpc
  const { data: data2, error: error2 } = await supabase.rpc('get_policies');

  if (error2) {
    console.error('Also failed:', error2);
  } else {
    console.log('Policies:', JSON.stringify(data2, null, 2));
  }
} else {
  console.log('Current policies on profiles table:');
  console.log(JSON.stringify(data, null, 2));
}
