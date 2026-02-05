const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

async function verify() {
  const { createClient } = await import('@supabase/supabase-js');
  
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  
  if (!url || !key) {
    console.log('❌ Missing environment variables');
    process.exit(1);
  }
  
  const supabase = createClient(url, key);
  
  console.log('Checking meals table...\n');
  
  const { data, error, count } = await supabase
    .from('meals')
    .select('id, name', { count: 'exact' })
    .limit(5);
  
  if (error) {
    console.log('❌ Error:', error.message);
    process.exit(1);
  }
  
  console.log(`✅ Total meals in database: ${count}`);
  console.log('\nSample meals:');
  data.forEach(meal => {
    console.log(`  - ${meal.name} (ID: ${meal.id})`);
  });
  
  if (count > 0) {
    console.log('\n🎉 Seeding was successful!');
  } else {
    console.log('\n⚠️  No meals found. Seeding may have failed.');
  }
}

verify().catch(err => {
  console.log('Error:', err.message);
  process.exit(1);
});
