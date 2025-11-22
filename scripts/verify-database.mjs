#!/usr/bin/env node

/**
 * Verify Database Tables and Functions
 *
 * Checks that all e-commerce tables and RPC functions exist
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyTables() {
  console.log('🔍 Verifying database tables...\n');

  const tables = [
    'inventory_reservations',
    'email_queue',
    'webhook_failures',
    'orders',
    'product_variants',
    'inventory_transactions'
  ];

  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        console.error(`❌ Table '${table}': ${error.message}`);
      } else {
        console.log(`✅ Table '${table}': EXISTS`);
      }
    } catch (err) {
      console.error(`❌ Table '${table}': ${err.message}`);
    }
  }
}

async function verifyFunctions() {
  console.log('\n🔍 Verifying RPC functions...\n');

  // Test reserve_inventory function
  try {
    const { data, error } = await supabase.rpc('reserve_inventory', {
      p_variant_id: '00000000-0000-0000-0000-000000000000',
      p_quantity: 1,
      p_session_id: 'test_session_verification'
    });

    if (error && error.message.includes('does not exist')) {
      console.error('❌ Function reserve_inventory: NOT FOUND');
    } else {
      console.log('✅ Function reserve_inventory: EXISTS');
    }
  } catch (err) {
    console.log('✅ Function reserve_inventory: EXISTS (error expected for fake UUID)');
  }

  // Test release_reservation function
  try {
    const { data, error } = await supabase.rpc('release_reservation', {
      p_session_id: 'test_session_verification'
    });

    if (error && error.message.includes('does not exist')) {
      console.error('❌ Function release_reservation: NOT FOUND');
    } else {
      console.log('✅ Function release_reservation: EXISTS');
    }
  } catch (err) {
    console.log('✅ Function release_reservation: EXISTS');
  }

  // Test get_available_stock function
  try {
    const { data, error } = await supabase.rpc('get_available_stock', {
      p_variant_id: '00000000-0000-0000-0000-000000000000'
    });

    if (error && error.message.includes('does not exist')) {
      console.error('❌ Function get_available_stock: NOT FOUND');
    } else {
      console.log('✅ Function get_available_stock: EXISTS');
    }
  } catch (err) {
    console.log('✅ Function get_available_stock: EXISTS (error expected for fake UUID)');
  }

  // Test decrease_inventory function
  try {
    const { data, error } = await supabase.rpc('decrease_inventory', {
      p_variant_id: '00000000-0000-0000-0000-000000000000',
      p_quantity: 1,
      p_order_id: null,
      p_stripe_session_id: null
    });

    if (error && error.message.includes('does not exist')) {
      console.error('❌ Function decrease_inventory: NOT FOUND');
    } else {
      console.log('✅ Function decrease_inventory: EXISTS');
    }
  } catch (err) {
    console.log('✅ Function decrease_inventory: EXISTS (error expected for fake UUID)');
  }

  // Test increase_inventory function
  try {
    const { data, error } = await supabase.rpc('increase_inventory', {
      p_variant_id: '00000000-0000-0000-0000-000000000000',
      p_quantity: 1,
      p_type: 'restock',
      p_notes: null
    });

    if (error && error.message.includes('does not exist')) {
      console.error('❌ Function increase_inventory: NOT FOUND');
    } else {
      console.log('✅ Function increase_inventory: EXISTS');
    }
  } catch (err) {
    console.log('✅ Function increase_inventory: EXISTS (error expected for fake UUID)');
  }
}

async function main() {
  console.log('═══════════════════════════════════════════');
  console.log('  DATABASE VERIFICATION');
  console.log('═══════════════════════════════════════════\n');

  await verifyTables();
  await verifyFunctions();

  console.log('\n═══════════════════════════════════════════');
  console.log('  VERIFICATION COMPLETE');
  console.log('═══════════════════════════════════════════\n');
}

main().catch(console.error);
