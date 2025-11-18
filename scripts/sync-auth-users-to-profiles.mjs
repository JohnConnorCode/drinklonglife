#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

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

async function syncAuthUsersToProfiles() {
  console.log('🔍 Checking for auth users without profiles...\n');

  // Get all auth users
  const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers();

  if (authError) {
    console.error('❌ Error fetching auth users:', authError);
    return;
  }

  console.log(`Found ${authUsers.length} users in auth.users`);

  // Get all profiles
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, email');

  if (profilesError) {
    console.error('❌ Error fetching profiles:', profilesError);
    return;
  }

  console.log(`Found ${profiles.length} users in profiles table\n`);

  const profileIds = new Set(profiles.map(p => p.id));
  const missingProfiles = authUsers.filter(u => !profileIds.has(u.id));

  if (missingProfiles.length === 0) {
    console.log('✅ All auth users have profiles!');
    return;
  }

  console.log(`⚠️  Found ${missingProfiles.length} auth users without profiles:\n`);

  for (const user of missingProfiles) {
    console.log(`  - ${user.email} (${user.id})`);
  }

  console.log('\n📝 Creating missing profiles...\n');

  for (const user of missingProfiles) {
    const fullName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0];

    console.log(`  Creating profile for ${user.email}...`);
    console.log(`    ID: ${user.id}`);
    console.log(`    Full name: ${fullName}`);

    const { data, error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email,
        full_name: fullName
      })
      .select();

    if (insertError) {
      console.error(`  ❌ Failed:`, insertError);
    } else {
      console.log(`  ✅ Success!`);
    }
  }

  console.log('\n✅ Sync complete!');
}

syncAuthUsersToProfiles().then(() => {
  process.exit(0);
}).catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
