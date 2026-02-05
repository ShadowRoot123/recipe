alter table public.profiles enable row level security;
alter table public.meals enable row level security;
alter table public.meal_ratings enable row level security;
alter table public.meal_comments enable row level security;

grant usage on schema public to anon, authenticated;
grant select on public.meals to anon, authenticated;
grant select on public.meal_rating_summary to anon, authenticated;
grant select, insert, update, delete on public.meal_ratings to authenticated;
grant select, insert, update, delete on public.meal_comments to authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select on public.profiles to anon;

drop policy if exists profiles_select_public on public.profiles;
create policy profiles_select_public on public.profiles
for select
using (true);

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles
for insert to authenticated
with check (auth.uid() = id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
for update to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists meals_select_public on public.meals;
create policy meals_select_public on public.meals
for select
using (true);

drop policy if exists meal_ratings_select_public on public.meal_ratings;
create policy meal_ratings_select_public on public.meal_ratings
for select
using (true);

drop policy if exists meal_ratings_insert_own on public.meal_ratings;
create policy meal_ratings_insert_own on public.meal_ratings
for insert to authenticated
with check (auth.uid() = user_id);

drop policy if exists meal_ratings_update_own on public.meal_ratings;
create policy meal_ratings_update_own on public.meal_ratings
for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists meal_ratings_delete_own on public.meal_ratings;
create policy meal_ratings_delete_own on public.meal_ratings
for delete to authenticated
using (auth.uid() = user_id);

drop policy if exists meal_comments_select_public on public.meal_comments;
create policy meal_comments_select_public on public.meal_comments
for select
using (true);

drop policy if exists meal_comments_insert_own on public.meal_comments;
create policy meal_comments_insert_own on public.meal_comments
for insert to authenticated
with check (auth.uid() = user_id and is_deleted = false);

drop policy if exists meal_comments_update_own on public.meal_comments;
create policy meal_comments_update_own on public.meal_comments
for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists meal_comments_delete_own on public.meal_comments;
create policy meal_comments_delete_own on public.meal_comments
for delete to authenticated
using (auth.uid() = user_id);
