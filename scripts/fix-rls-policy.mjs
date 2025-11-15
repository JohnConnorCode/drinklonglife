#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local
config({ path: join(__dirname, '..', '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

console.log('Checking profiles table RLS policies...\n');

// First, try to query the table with service role (should bypass RLS)
const { data: testData, error: testError } = await supabase
  .from('profiles')
  .select('id, is_admin')
  .limit(1);

if (testError) {
  console.error('Error querying profiles table:', testError);
  console.log('\nThis confirms there is an RLS policy issue.');
} else {
  console.log('Service role can access profiles:', testData);
}

console.log('\n--- SQL to fix the infinite recursion ---\n');
console.log(`
-- Drop the problematic policy (if it exists)
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view profiles" ON profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON profiles;

-- Create a simple, non-recursive policy
CREATE POLICY "Users can view their own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow service role full access (for admin operations)
CREATE POLICY "Service role has full access"
ON profiles FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
`);

console.log('\nRun this SQL in Supabase SQL Editor to fix the issue.');
process.exit(0);
