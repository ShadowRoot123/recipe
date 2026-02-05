const fs = require('fs');
const path = require('path');
require('dotenv').config();
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local'), override: true });

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
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

  const mealsPath = path.join(__dirname, '..', 'src', 'jsons', 'meals.json');
  const raw = fs.readFileSync(mealsPath, 'utf8');
  const meals = JSON.parse(raw);

  const rows = meals.map((meal) => ({
    id: String(meal.external_id),
    name: meal.name,
    category: meal.category ?? null,
    area: meal.area ?? null,
    thumbnail_url: meal.thumbnail_url ?? null,
    instructions: meal.instructions ?? null,
    tags: meal.tags ?? null,
    youtube_url: meal.youtube_url ?? null,
    source_json: meal,
  }));

  const batchSize = 500;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const { error } = await supabase.from('meals').upsert(batch, { onConflict: 'id' });
    if (error) throw error;
  }

  process.stdout.write(`Seeded ${rows.length} meals into public.meals\n`);
}

main().catch((err) => {
  if (err?.message) {
    console.error('Error:', err.message);
    if (err.details) console.error('Details:', err.details);
    if (err.hint) console.error('Hint:', err.hint);
  }
  console.error('\nFull error:', err);
  process.exit(1);
});
