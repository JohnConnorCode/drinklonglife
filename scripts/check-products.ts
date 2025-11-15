import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('id, name, slug, is_active, published_at')
    .order('display_order');

  if (error) {
    console.error('Error:', error);
  } else {
    console.log(`\nProducts in database: ${data.length}`);
    console.log(JSON.stringify(data, null, 2));
  }
}

checkProducts();
