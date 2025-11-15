#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://qjgenpwbaquqrvyrfsdo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqZ2VucHdiYXF1cXJ2eXJmc2RvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjk5NjQ4MiwiZXhwIjoyMDc4NTcyNDgyfQ.NnjPDj-24lOqa1xXyGOLwDowko3cpSUkBsFPhYCt9iM'
);

const tables = ['products', 'ingredients', 'product_variants', 'product_ingredients', 'purchases', 'subscriptions'];

console.log('Checking database tables...\n');

for (const table of tables) {
  const { data, error, count } = await supabase
    .from(table)
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.log(`❌ ${table}: ${error.message}`);
  } else {
    console.log(`✅ ${table}: exists (${count || 0} rows)`);
  }
}

// Check admin user
const { data: admin, error: adminError } = await supabase
  .from('profiles')
  .select('email, is_admin')
  .eq('email', 'jt.connor88@gmail.com')
  .single();

if (adminError) {
  console.log('\n❌ Admin user check failed:', adminError.message);
} else {
  console.log(`\n✅ Admin user: ${admin.email}, is_admin: ${admin.is_admin}`);
}
