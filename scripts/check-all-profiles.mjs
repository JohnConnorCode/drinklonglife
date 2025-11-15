#!/usr/bin/env node

/**
 * Check all profiles in the database to see what users exist
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

console.log('🔍 Checking all profiles in database...\n');

const { data: profiles, error } = await supabase
  .from('profiles')
  .select('id, email, is_admin, created_at')
  .order('created_at', { ascending: false });

if (error) {
  console.error('❌ Error fetching profiles:', error.message);
  process.exit(1);
}

if (!profiles || profiles.length === 0) {
  console.log('⚠️  No profiles found in database');
  console.log('   This means no users have signed up yet.');
  process.exit(1);
}

console.log(`Found ${profiles.length} profile(s):\n`);

profiles.forEach((profile, index) => {
  console.log(`${index + 1}. Email: ${profile.email || '(no email)'}`);
  console.log(`   User ID: ${profile.id}`);
  console.log(`   is_admin: ${profile.is_admin || false}`);
  console.log(`   Created: ${new Date(profile.created_at).toLocaleString()}`);
  console.log('');
});

const adminCount = profiles.filter(p => p.is_admin).length;
console.log(`\nAdmin users: ${adminCount}`);
