import { createClient } from '@supabase/supabase-js';

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

// Query policies using pg_catalog
const { data, error } = await supabase.rpc('exec_sql', {
  sql: `
    SELECT 
      schemaname,
      tablename,
      policyname,
      permissive,
      roles,
      cmd,
      qual,
      with_check
    FROM pg_policies
    WHERE tablename = 'profiles';
  `
});

if (error) {
  console.error('Error:', error);
  process.exit(1);
}

console.log('RLS Policies on profiles table:');
console.log(JSON.stringify(data, null, 2));
