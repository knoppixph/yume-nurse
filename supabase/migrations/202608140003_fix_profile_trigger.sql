-- Phase 11b: Fix profile auto-creation and RLS INSERT policies
-- Run this AFTER the first two migrations.

-- ============================================================
-- 1. Allow users to INSERT their own profile (needed on signup)
-- ============================================================
drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles
  for insert
  with check (auth.uid() = id);

-- ============================================================
-- 2. Database trigger: auto-create profile when a user signs up
--    This fires immediately after INSERT into auth.users,
--    so the profile always exists regardless of client-side code.
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  _full_name  text;
  _display    text;
begin
  _full_name  := coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1));
  _display    := coalesce(new.raw_user_meta_data->>'display_name', _full_name);

  insert into public.profiles (id, email, full_name, display_name, role)
  values (new.id, new.email, _full_name, _display, 'student')
  on conflict (id) do nothing;

  insert into public.user_settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- 3. Backfill: create profiles for any existing auth users
--    who signed up before this trigger existed.
-- ============================================================
insert into public.profiles (id, email, full_name, display_name, role)
select
  u.id,
  u.email,
  coalesce(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)),
  coalesce(u.raw_user_meta_data->>'display_name', u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)),
  'student'
from auth.users u
where not exists (
  select 1 from public.profiles p where p.id = u.id
)
on conflict (id) do nothing;

insert into public.user_settings (user_id)
select u.id
from auth.users u
where not exists (
  select 1 from public.user_settings s where s.user_id = u.id
)
on conflict (user_id) do nothing;

-- ============================================================
-- 4. Promote your account to admin
-- ============================================================
update public.profiles
set role = 'admin'
where email = 'juliusalas10@gmail.com';
