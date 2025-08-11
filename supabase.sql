-- Enable extensions used for UUIDs (usually available by default on Supabase)
create extension if not exists "uuid-ossp";

-- Profiles table to attach roles to auth users
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin','student')) default 'student',
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;

-- Helper to check admin role
create or replace function public.is_admin(uid uuid)
returns boolean language sql stable as $$
  select exists (
    select 1 from public.profiles p where p.user_id = uid and p.role = 'admin'
  );
$$;

drop policy if exists profiles_select_self_or_admin on public.profiles;
create policy profiles_select_self_or_admin
on public.profiles for select to authenticated
using (user_id = auth.uid() or public.is_admin(auth.uid()));

drop policy if exists profiles_insert_self on public.profiles;
create policy profiles_insert_self
on public.profiles for insert to authenticated
with check (user_id = auth.uid());

drop policy if exists profiles_update_admin_only on public.profiles;
create policy profiles_update_admin_only
on public.profiles for update to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- Replace generic students with your actual table: ausbildung_main_engine
create table if not exists public.ausbildung_main_engine (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  email text unique,
  phone text,
  country text,
  created_at timestamptz default now()
);
alter table public.ausbildung_main_engine enable row level security;

drop policy if exists ame_select_self_or_admin on public.ausbildung_main_engine;
create policy ame_select_self_or_admin
on public.ausbildung_main_engine for select to authenticated
using (user_id = auth.uid() or public.is_admin(auth.uid()));

drop policy if exists ame_update_self_or_admin on public.ausbildung_main_engine;
create policy ame_update_self_or_admin
on public.ausbildung_main_engine for update to authenticated
using (user_id = auth.uid() or public.is_admin(auth.uid()))
with check (user_id = auth.uid() or public.is_admin(auth.uid()));

drop policy if exists ame_insert_self on public.ausbildung_main_engine;
create policy ame_insert_self
on public.ausbildung_main_engine for insert to authenticated
with check (user_id = auth.uid() or public.is_admin(auth.uid()));

-- Bewerbungen (applications)
create table if not exists public.bewerbungen (
  id uuid primary key default uuid_generate_v4(),
  student_user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  company text,
  status text check (status in ('draft','submitted','interview','offer','rejected')) default 'draft',
  agent_name text,
  created_at timestamptz default now()
);
create index if not exists idx_bewerbungen_student_user on public.bewerbungen(student_user_id);
alter table public.bewerbungen enable row level security;

drop policy if exists bewerbungen_crud_by_owner_or_admin on public.bewerbungen;
create policy bewerbungen_crud_by_owner_or_admin
on public.bewerbungen for all to authenticated
using (student_user_id = auth.uid() or public.is_admin(auth.uid()))
with check (student_user_id = auth.uid() or public.is_admin(auth.uid()));
