#!/usr/bin/env node

/**
 * Check auth users and profiles using Supabase Management API
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: Missing Supabase credentials');
  process.exit(1);
}

console.log('🔍 Checking Supabase Auth users and profiles...\n');

// Check auth.users via service role
const authResponse = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
  headers: {
    'apikey': SUPABASE_SERVICE_ROLE_KEY,
    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
  },
});

if (!authResponse.ok) {
  console.error('❌ Failed to fetch auth users:', await authResponse.text());
  process.exit(1);
}

const { users } = await authResponse.json();

console.log(`📋 Found ${users?.length || 0} auth user(s):\n`);

if (users && users.length > 0) {
  users.forEach((user, index) => {
    console.log(`${index + 1}. Email: ${user.email || '(no email)'}`);
    console.log(`   User ID: ${user.id}`);
    console.log(`   Created: ${new Date(user.created_at).toLocaleString()}`);
    console.log(`   Last sign in: ${user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Never'}`);
    console.log('');
  });

  // Now check if profiles exist for these users
  console.log('📋 Checking if profiles exist for these users...\n');

  for (const user of users) {
    const profileCheck = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${user.id}&select=id,email,is_admin`, {
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
    });

    const profiles = await profileCheck.json();

    if (profiles && profiles.length > 0) {
      console.log(`✅ Profile exists for ${user.email}`);
      console.log(`   is_admin: ${profiles[0].is_admin || false}`);
    } else {
      console.log(`❌ NO profile for ${user.email} (ID: ${user.id})`);
      console.log(`   Action needed: Create profile for this user`);
    }
    console.log('');
  }
} else {
  console.log('⚠️  No auth users found - nobody has signed up yet!');
}
