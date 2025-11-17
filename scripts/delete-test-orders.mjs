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

async function deleteTestOrders() {
  console.log('🔍 Finding test orders...\n');

  // Find all orders with test email addresses
  const { data: testOrders, error } = await supabase
    .from('orders')
    .select('id, customer_email, created_at')
    .or('customer_email.like.%@example.com,customer_email.like.%test%,customer_email.like.%webhook%');

  if (error) {
    console.error('❌ Error fetching orders:', error);
    return;
  }

  if (!testOrders || testOrders.length === 0) {
    console.log('✅ No test orders found in database');
    return;
  }

  console.log(`Found ${testOrders.length} test orders:\n`);
  testOrders.slice(0, 5).forEach((order, idx) => {
    console.log(`${idx + 1}. ${order.customer_email} (${order.id})`);
  });
  if (testOrders.length > 5) {
    console.log(`... and ${testOrders.length - 5} more`);
  }

  console.log(`\n🗑️  Deleting ${testOrders.length} test orders...\n`);

  const { error: deleteError } = await supabase
    .from('orders')
    .delete()
    .or('customer_email.like.%@example.com,customer_email.like.%test%,customer_email.like.%webhook%');

  if (deleteError) {
    console.error('❌ Error deleting orders:', deleteError);
    return;
  }

  console.log(`✅ Successfully deleted ${testOrders.length} test orders`);
  console.log('✅ Admin panel should now be clean!\n');
}

deleteTestOrders();
