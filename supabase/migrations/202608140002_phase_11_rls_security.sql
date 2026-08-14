-- NurseMate Phase 11 - Row Level Security (RLS) & Access Control Policies

-- 1. Helper function to check if the authenticated user is an administrator
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

-- 2. Helper function to check if user owns a specific profile record
create or replace function public.is_owner(record_user_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select auth.uid() = record_user_id;
$$;

--------------------------------------------------------------------------------
-- PROFILES TABLE RLS
--------------------------------------------------------------------------------
alter table public.profiles enable row level security;

create policy "Users can view their own profile or admins can view all"
  on public.profiles
  for select
  using (
    auth.uid() = id
    or public.is_admin()
  );

create policy "Users can update their own profile"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    -- Prevent non-admins from self-elevating their role to admin
    and (
      role = (select p.role from public.profiles p where p.id = auth.uid())
      or public.is_admin()
    )
  );

create policy "Admins have full access to profiles"
  on public.profiles
  for all
  using (public.is_admin())
  with check (public.is_admin());

--------------------------------------------------------------------------------
-- USER SETTINGS TABLE RLS
--------------------------------------------------------------------------------
alter table public.user_settings enable row level security;

create policy "Users can view and manage their own settings"
  on public.user_settings
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

--------------------------------------------------------------------------------
-- CURRICULUM TABLES (Subjects, Topics, Flashcards, Questions, Options)
--------------------------------------------------------------------------------
alter table public.subjects enable row level security;
alter table public.topics enable row level security;
alter table public.flashcards enable row level security;
alter table public.questions enable row level security;
alter table public.question_options enable row level security;

-- Public/Student read access to active study curriculum
create policy "Anyone can read active subjects"
  on public.subjects
  for select
  using (is_active = true or public.is_admin());

create policy "Anyone can read active topics"
  on public.topics
  for select
  using (is_active = true or public.is_admin());

create policy "Anyone can read active flashcards"
  on public.flashcards
  for select
  using (is_active = true or public.is_admin());

create policy "Anyone can read active questions"
  on public.questions
  for select
  using (is_active = true or public.is_admin());

create policy "Anyone can read question options"
  on public.question_options
  for select
  using (true);

-- Admin-only write access to curriculum
create policy "Admins can manage subjects"
  on public.subjects
  for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can manage topics"
  on public.topics
  for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can manage flashcards"
  on public.flashcards
  for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can manage questions"
  on public.questions
  for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can manage question options"
  on public.question_options
  for all
  using (public.is_admin())
  with check (public.is_admin());

--------------------------------------------------------------------------------
-- STUDENT STUDY PROGRESS & ATTEMPTS TABLES
--------------------------------------------------------------------------------
alter table public.flashcard_progress enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.quiz_answers enable row level security;
alter table public.study_sessions enable row level security;
alter table public.study_streaks enable row level security;
alter table public.favorites enable row level security;

create policy "Users can view and manage their own flashcard progress"
  on public.flashcard_progress
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can view and manage their own quiz attempts"
  on public.quiz_attempts
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can view and manage their own quiz answers"
  on public.quiz_answers
  for all
  using (
    exists (
      select 1 from public.quiz_attempts a
      where a.id = quiz_answers.attempt_id
        and a.user_id = auth.uid()
    )
    or public.is_admin()
  )
  with check (
    exists (
      select 1 from public.quiz_attempts a
      where a.id = quiz_answers.attempt_id
        and a.user_id = auth.uid()
    )
  );

create policy "Users can view and manage their own study sessions"
  on public.study_sessions
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can view and manage their own study streaks"
  on public.study_streaks
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can view and manage their own favorites"
  on public.favorites
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

--------------------------------------------------------------------------------
-- STUDY MATERIALS & AI GENERATIONS TABLES
--------------------------------------------------------------------------------
alter table public.study_materials enable row level security;
alter table public.ai_generations enable row level security;

create policy "Users can view their own materials or public/admin library"
  on public.study_materials
  for select
  using (
    auth.uid() = user_id
    or visibility in ('public', 'admin_library')
    or public.is_admin()
  );

create policy "Users can manage their own study materials"
  on public.study_materials
  for all
  using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

create policy "Users can view and manage their own AI generations"
  on public.ai_generations
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
