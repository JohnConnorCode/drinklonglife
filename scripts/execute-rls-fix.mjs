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
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      db: { schema: 'public' }
    }
  }
);

console.log('Fixing RLS policies on profiles table...\n');

const sql = `
-- Drop problematic policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view profiles" ON profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;

-- Create simple, non-recursive policies
CREATE POLICY "Users can view their own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Service role has full access"
ON profiles FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
`;

// Execute using rpc if available, otherwise we'll need to use the SQL editor
try {
  const { data, error } = await supabase.rpc('exec', { sql });

  if (error) {
    console.error('Error executing SQL:', error);
    console.log('\n❌ Could not execute via RPC. Please run this SQL manually in Supabase SQL Editor:\n');
    console.log(sql);
  } else {
    console.log('✅ RLS policies fixed successfully!');
    console.log(data);
  }
} catch (e) {
  console.log('\n⚠️  RPC method not available. Please run this SQL in Supabase SQL Editor:\n');
  console.log(sql);
}
