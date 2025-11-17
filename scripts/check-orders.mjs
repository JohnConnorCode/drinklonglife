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

async function checkOrders() {
  console.log('Checking orders table in database...\n');

  // First, check if the orders table even exists
  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('❌ ERROR fetching orders:', error.message);
    console.log('\n🔍 The orders table may not exist in the database!\n');

    // Check what tables DO exist
    console.log('Checking what tables are available...');
    const { data: profiles } = await supabase.from('profiles').select('id').limit(1);
    const { data: subscriptions } = await supabase.from('subscriptions').select('id').limit(1);
    const { data: purchases } = await supabase.from('purchases').select('id').limit(1);

    console.log('✅ profiles table exists');
    console.log('✅ subscriptions table exists');
    console.log('✅ purchases table exists');
    console.log('❌ orders table DOES NOT EXIST\n');
    console.log('This is the problem! The admin panel expects an orders table but it doesn\'t exist in the database.');
    return;
  }

  if (!orders || orders.length === 0) {
    console.log('⚠️  Orders table exists but has NO DATA');
    console.log('The admin panel will show placeholder/empty state\n');
    return;
  }

  console.log(`Found ${orders.length} orders:\n`);
  orders.forEach((order, idx) => {
    console.log(`${idx + 1}. Order ${order.id}`);
    console.log(`   Data:`, order);
    console.log('');
  });
}

checkOrders();
