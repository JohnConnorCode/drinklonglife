#!/usr/bin/env node
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = 'jt.connor88@gmail.com';

console.log('🔍 Checking admin status for:', email, '\n');

// Check profile directly
const profileResponse = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=id,email,is_admin&email=eq.${encodeURIComponent(email)}`, {
  headers: {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
  },
});

const profiles = await profileResponse.json();

if (profiles && profiles.length > 0) {
  const profile = profiles[0];
  console.log('Profile:');
  console.log(`  ID: ${profile.id}`);
  console.log(`  Email: ${profile.email}`);
  console.log(`  is_admin: ${profile.is_admin}`);
  console.log('');

  if (profile.is_admin === true) {
    console.log('✅ User IS an admin');
    console.log('   Admin link should appear in dropdown\n');
  } else {
    console.log('❌ User is NOT an admin');
    console.log('   Admin link will NOT appear\n');
    console.log('To fix, run this SQL in Supabase:');
    console.log(`UPDATE profiles SET is_admin = true WHERE id = '${profile.id}';\n`);
  }
} else {
  console.log('❌ No profile found\n');
}
