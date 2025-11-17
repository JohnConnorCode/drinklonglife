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

async function setAdmin() {
  const adminEmail = 'jt.connor88@gmail.com';

  console.log(`🔍 Finding user: ${adminEmail}...\n`);

  const { data: profile, error: fetchError } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', adminEmail)
    .single();

  if (fetchError || !profile) {
    console.error('❌ User not found:', fetchError);
    return;
  }

  console.log('Current profile:');
  console.log(JSON.stringify(profile, null, 2));
  console.log('');

  if (profile.is_admin === true) {
    console.log('✅ User is already an admin!');
    return;
  }

  console.log('🔧 Setting is_admin = true...\n');

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ is_admin: true })
    .eq('id', profile.id);

  if (updateError) {
    console.error('❌ Error setting admin:', updateError);
    return;
  }

  console.log('✅ Successfully set user as admin!');
  console.log('You should now be able to access admin features.');
}

setAdmin();
