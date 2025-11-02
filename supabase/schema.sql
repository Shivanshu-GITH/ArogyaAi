-- Tables required by the app

create table if not exists public.chat_history (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  bot_type text not null,
  message text not null,
  response text not null,
  created_at timestamp with time zone default now()
);

create table if not exists public.user_profiles (
  id text primary key,
  email text,
  full_name text,
  preferred_language text,
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table public.chat_history enable row level security;
alter table public.user_profiles enable row level security;

-- Basic RLS policies (adjust for your auth model)
-- For anon usage with a client-generated user_id, allow read/write by matching user_id
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'chat_history' and policyname = 'chat_history_insert_own'
  ) then
    create policy chat_history_insert_own on public.chat_history
      for insert with check (auth.uid()::text = user_id or auth.uid() is null);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'user_profiles' and policyname = 'user_profiles_insert_own'
  ) then
    create policy user_profiles_insert_own on public.user_profiles
      for insert with check (auth.uid()::text = id);
  end if;
end $$;

-- NOTE: With no auth configured, leaving out SELECT policies means reads are denied by default under RLS.
-- This allows inserts (write-only) but prevents clients from reading any rows without a backend.


