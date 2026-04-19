
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, ...value] = line.split('=');
  if (key && value.length > 0) {
    env[key.trim()] = value.join('=').trim();
  }
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function runMigration() {
  const sql = fs.readFileSync('supabase/migrations/20260419133300_create_profiles.sql', 'utf8');
  console.log('Attempting to execute migration SQL...');
  
  // Try to use a common pattern for executing SQL via Supabase JS if enabled
  // If not, this will fail and we will know we NEED the MCP tool.
  const { data, error } = await supabase.rpc('exec_sql', { query_text: sql });
  
  if (error) {
    console.error('Failed to run SQL via RPC:', error.message);
    console.log('This confirms that arbitrary SQL execution is not enabled via the Service Role Key RPC.');
    console.log('I will now try to use the MCP tool directly.');
  } else {
    console.log('Migration successful via RPC.');
  }
}

runMigration();
