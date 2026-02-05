## Supabase Backend Testing Checklist

### Prerequisites
- Supabase project created
- Migrations applied (SQL in `supabase/migrations/`)
- Environment variables set:
  - `EXPO_PUBLIC_SUPABASE_URL`
  - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_URL` (for scripts; optional if `EXPO_PUBLIC_SUPABASE_URL` is set)
  - `SUPABASE_SERVICE_ROLE_KEY` (legacy) or `SUPABASE_SECRET_KEY` (new API keys) for scripts

### Auth
- Sign up with email/password succeeds
- Login/logout works on device
- `profiles` row exists after sign up (created by trigger)

### Meals (seeded from JSON)
- `public.meals` contains rows after running `npm run seed:meals`
- App can still load meals locally from `src/jsons/meals.json` and uses the same `recipeId` values as `public.meals.id`

### Ratings
- Authenticated user can upsert rating for a meal
- Same user cannot create multiple ratings for the same meal (unique constraint)
- Average rating and count return expected values via `meal_rating_summary`

### Comments
- Authenticated user can upsert a comment for a meal
- User can only update/delete their own comment (RLS)
- Comments list shows public profile name

### RLS/Policies
- Anonymous read access works for:
  - `public.meals`
  - `public.meal_rating_summary`
  - `public.meal_comments` (read-only)
- Only authenticated users can insert/update/delete:
  - `public.meal_ratings`
  - `public.meal_comments`
- Authenticated user can update only their own `profiles` row

### Basic Script Validation (optional)
- Run `node scripts/validateSupabaseBackend.js`
- Verify it reports successful selects without errors
