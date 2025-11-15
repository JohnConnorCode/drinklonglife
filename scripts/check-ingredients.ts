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

async function check() {
  const { data: ingredients, error: ingError } = await supabase
    .from('ingredients')
    .select('count');
  
  const { data: prodIng, error: piError } = await supabase
    .from('product_ingredients')
    .select('count');

  console.log('Ingredients:', ingredients);
  console.log('Product-Ingredient links:', prodIng);
}

check();
