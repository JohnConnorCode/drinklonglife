import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const migrationFile = process.argv[2];

if (!migrationFile) {
  console.error('Usage: node scripts/run-migration.mjs <migration-file>');
  process.exit(1);
}

const sql = readFileSync(join(__dirname, '..', migrationFile), 'utf-8');

// Split SQL by statement and execute each
const statements = sql
  .split(';')
  .map(s => s.trim())
  .filter(s => s && !s.startsWith('--'));

console.log(`Running ${statements.length} SQL statements from ${migrationFile}...`);

const supabase = createClient(supabaseUrl, supabaseKey);

for (let i = 0; i < statements.length; i++) {
  const statement = statements[i];
  console.log(`\n[${i + 1}/${statements.length}] Executing statement...`);

  const { error } = await supabase.rpc('exec_sql', { sql: statement });

  if (error) {
    console.error(`Error on statement ${i + 1}:`, error);
    console.error('Statement:', statement.substring(0, 100) + '...');
  } else {
    console.log(`✓ Statement ${i + 1} executed successfully`);
  }
}

console.log('\n✅ Migration complete!');
