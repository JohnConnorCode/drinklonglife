#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createMissingProfiles() {
  console.log('🔍 Creating profiles for auth users...\n');

  // Execute raw SQL to create missing profiles
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: `
      INSERT INTO public.profiles (id, email, full_name)
      SELECT
        au.id,
        au.email,
        COALESCE(
          au.raw_user_meta_data->>'full_name',
          au.raw_user_meta_data->>'name',
          split_part(au.email, '@', 1)
        ) as full_name
      FROM auth.users au
      LEFT JOIN public.profiles p ON au.id = p.id
      WHERE p.id IS NULL
      RETURNING id, email, full_name;
    `
  });

  if (error) {
    console.error('RPC not available, trying direct insert...');

    // Fallback: Get auth users and create profiles one by one
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
      console.error('❌ Error:', authError);
      return;
    }

    const { data: profiles } = await supabase.from('profiles').select('id');
    const profileIds = new Set((profiles || []).map(p => p.id));

    for (const user of users) {
      if (!profileIds.has(user.id)) {
        console.log(`Creating profile for ${user.email}...`);

        // Simple insert
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([{
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email.split('@')[0]
          }]);

        if (insertError) {
          console.error(`  ❌ Error:`, insertError);
        } else {
          console.log(`  ✅ Created`);
        }
      }
    }
  } else {
    console.log('✅ Profiles created:', data);
  }

  // Show all profiles
  const { data: allProfiles } = await supabase
    .from('profiles')
    .select('id, email, full_name, created_at')
    .order('created_at', { ascending: false });

  console.log(`\n📊 Total profiles: ${allProfiles?.length || 0}\n`);
  allProfiles?.forEach(p => {
    console.log(`  - ${p.email} (${p.full_name || 'No name'})`);
  });
}

createMissingProfiles().then(() => {
  console.log('\n✅ Done!');
  process.exit(0);
}).catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
