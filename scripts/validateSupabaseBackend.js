const path = require('path');
require('dotenv').config();
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local'), override: true });

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

async function main() {
  const { createClient } = await import('@supabase/supabase-js');

  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.EXPO_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) throw new Error('Missing environment variable: SUPABASE_URL (or EXPO_PUBLIC_SUPABASE_URL)');
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;
  if (!supabaseServiceRoleKey) {
    throw new Error('Missing environment variable: SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SECRET_KEY)');
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  const mealsResult = await supabase.from('meals').select('id').limit(1);
  if (mealsResult.error) throw mealsResult.error;

  const summaryResult = await supabase.from('meal_rating_summary').select('meal_id, avg_rating, rating_count').limit(1);
  if (summaryResult.error) throw summaryResult.error;

  const profilesResult = await supabase.from('profiles').select('id').limit(1);
  if (profilesResult.error) throw profilesResult.error;

  process.stdout.write('Supabase backend validation passed (service role)\n');
}

main().catch((err) => {
  process.stderr.write(`${err?.stack ?? String(err)}\n`);
  process.exit(1);
});
