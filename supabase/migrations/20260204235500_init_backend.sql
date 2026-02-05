create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', ''), null)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create table if not exists public.meals (
  id text primary key,
  name text not null,
  category text,
  area text,
  thumbnail_url text,
  instructions text,
  tags text,
  youtube_url text,
  source_json jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.meal_ratings (
  id uuid primary key default gen_random_uuid(),
  meal_id text not null references public.meals(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint meal_ratings_one_per_user unique (meal_id, user_id)
);

create trigger set_meal_ratings_updated_at
before update on public.meal_ratings
for each row execute procedure public.set_updated_at();

create index if not exists meal_ratings_meal_id_idx on public.meal_ratings(meal_id);

create table if not exists public.meal_comments (
  id uuid primary key default gen_random_uuid(),
  meal_id text not null references public.meals(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  is_deleted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint meal_comments_one_per_user unique (meal_id, user_id)
);

create trigger set_meal_comments_updated_at
before update on public.meal_comments
for each row execute procedure public.set_updated_at();

create index if not exists meal_comments_meal_id_created_at_idx on public.meal_comments(meal_id, created_at desc);

create or replace view public.meal_rating_summary as
select
  meal_id,
  round(avg(rating)::numeric, 2) as avg_rating,
  count(*)::int as rating_count
from public.meal_ratings
group by meal_id;
