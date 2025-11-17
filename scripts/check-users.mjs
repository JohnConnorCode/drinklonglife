import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUsers() {
  console.log('🔍 Checking profiles table...\n');

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Error fetching profiles:', error);
    return;
  }

  if (!profiles || profiles.length === 0) {
    console.log('❌ NO PROFILES IN DATABASE');
    console.log('This is the problem! Your admin account should have a profile.\n');
    return;
  }

  console.log(`Found ${profiles.length} profiles:\n`);
  profiles.forEach((profile, idx) => {
    console.log(`${idx + 1}. ${profile.email || 'No email'}`);
    console.log(`   Name: ${profile.name || profile.full_name || 'No name'}`);
    console.log(`   ID: ${profile.id}`);
    console.log(`   Stripe: ${profile.stripe_customer_id || 'Not connected'}`);
    console.log(`   Created: ${profile.created_at}`);
    console.log('');
  });
}

checkUsers();
