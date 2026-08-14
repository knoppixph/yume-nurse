-- NurseMate Phase 3 database schema.
-- RLS policies are intentionally left for Phase 11.

create extension if not exists pgcrypto;

do $$
begin
  create type public.user_role as enum ('student', 'admin');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.subject_accent as enum ('pink', 'purple', 'blue', 'teal', 'amber', 'rose');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.content_difficulty as enum ('easy', 'medium', 'hard');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.question_type as enum (
    'multiple_choice',
    'true_false',
    'select_all_that_apply',
    'identification',
    'prioritization',
    'patient_scenario'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.flashcard_due_label as enum ('due_now', 'today', 'tomorrow', 'later');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.flashcard_review_rating as enum ('again', 'hard', 'good', 'easy');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.study_activity_type as enum ('flashcards', 'quiz', 'review', 'materials', 'ai', 'timer', 'other');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.study_material_visibility as enum ('private', 'admin_library', 'public');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.ai_generation_type as enum ('chat', 'summary', 'flashcards', 'quiz_questions', 'key_terms', 'other');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.ai_generation_status as enum ('pending', 'completed', 'failed');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.favorite_target_type as enum ('subject', 'topic', 'flashcard', 'question');
exception
  when duplicate_object then null;
end $$;

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
  full_name text,
  display_name text,
  email text unique,
  year_level text,
  school text,
  profile_picture_url text,
  study_goal text,
  role public.user_role not null default 'student',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_email_format check (email is null or position('@' in email) > 1)
);

create table if not exists public.subjects (
  id text primary key,
  name text not null unique,
  description text not null,
  icon text not null,
  accent public.subject_accent not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.topics (
  subject_id text not null references public.subjects(id) on delete cascade,
  id text not null,
  name text not null,
  description text not null,
  starter_mastery smallint not null default 0,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (subject_id, id),
  constraint topics_starter_mastery_range check (starter_mastery between 0 and 100)
);

create table if not exists public.flashcards (
  id text primary key,
  subject_id text not null,
  topic_id text not null,
  front text not null,
  back text not null,
  explanation text not null,
  difficulty public.content_difficulty not null,
  tags text[] not null default '{}',
  source text,
  starter_due_label public.flashcard_due_label not null default 'later',
  starter_mastery smallint not null default 0,
  is_ai_generated boolean not null default false,
  created_by uuid references public.profiles(id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (subject_id, topic_id) references public.topics(subject_id, id) on delete cascade,
  constraint flashcards_starter_mastery_range check (starter_mastery between 0 and 100)
);

create table if not exists public.flashcard_progress (
  user_id uuid not null references public.profiles(id) on delete cascade,
  flashcard_id text not null references public.flashcards(id) on delete cascade,
  mastery smallint not null default 0,
  due_at timestamptz,
  last_rating public.flashcard_review_rating,
  last_reviewed_at timestamptz,
  review_count integer not null default 0,
  lapse_count integer not null default 0,
  interval_days integer not null default 0,
  ease_factor numeric(4, 2) not null default 2.50,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, flashcard_id),
  constraint flashcard_progress_mastery_range check (mastery between 0 and 100),
  constraint flashcard_progress_nonnegative_counts check (
    review_count >= 0 and lapse_count >= 0 and interval_days >= 0
  ),
  constraint flashcard_progress_ease_factor_positive check (ease_factor > 0)
);

create table if not exists public.questions (
  id text primary key,
  subject_id text not null,
  topic_id text not null,
  type public.question_type not null,
  prompt text not null,
  scenario_patient text,
  scenario_vitals text[] not null default '{}',
  scenario_assessment text,
  explanation text not null,
  difficulty public.content_difficulty not null,
  tags text[] not null default '{}',
  source text,
  accepted_answers text[] not null default '{}',
  is_ai_generated boolean not null default false,
  created_by uuid references public.profiles(id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (subject_id, topic_id) references public.topics(subject_id, id) on delete cascade,
  constraint questions_identification_answers check (
    type <> 'identification' or array_length(accepted_answers, 1) is not null
  )
);

create table if not exists public.question_options (
  id uuid primary key default gen_random_uuid(),
  question_id text not null references public.questions(id) on delete cascade,
  option_text text not null,
  is_correct boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (question_id, sort_order)
);

create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  subject_id text references public.subjects(id) on delete set null,
  topic_subject_id text,
  topic_id text,
  mode text not null default 'practice',
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  question_count integer not null default 0,
  correct_count integer not null default 0,
  score_percent numeric(5, 2),
  time_limit_seconds integer,
  duration_seconds integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (topic_subject_id, topic_id) references public.topics(subject_id, id) on delete set null,
  constraint quiz_attempts_topic_reference_complete check (
    (topic_subject_id is null and topic_id is null)
    or (topic_subject_id is not null and topic_id is not null)
  ),
  constraint quiz_attempts_topic_subject_matches check (
    topic_subject_id is null or subject_id is null or topic_subject_id = subject_id
  ),
  constraint quiz_attempts_counts_valid check (
    question_count >= 0 and correct_count >= 0 and correct_count <= question_count
  ),
  constraint quiz_attempts_score_range check (score_percent is null or score_percent between 0 and 100),
  constraint quiz_attempts_durations_valid check (
    (time_limit_seconds is null or time_limit_seconds > 0)
    and (duration_seconds is null or duration_seconds >= 0)
  )
);

create table if not exists public.quiz_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.quiz_attempts(id) on delete cascade,
  question_id text not null references public.questions(id) on delete restrict,
  selected_option_ids uuid[] not null default '{}',
  selected_answer_text text,
  selected_answer_values text[] not null default '{}',
  is_correct boolean not null default false,
  rationale_viewed boolean not null default false,
  elapsed_seconds integer,
  answered_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint quiz_answers_elapsed_valid check (elapsed_seconds is null or elapsed_seconds >= 0)
);

create table if not exists public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  activity_type public.study_activity_type not null,
  subject_id text references public.subjects(id) on delete set null,
  topic_subject_id text,
  topic_id text,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  duration_seconds integer not null default 0,
  questions_answered integer not null default 0,
  flashcards_reviewed integer not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (topic_subject_id, topic_id) references public.topics(subject_id, id) on delete set null,
  constraint study_sessions_topic_reference_complete check (
    (topic_subject_id is null and topic_id is null)
    or (topic_subject_id is not null and topic_id is not null)
  ),
  constraint study_sessions_topic_subject_matches check (
    topic_subject_id is null or subject_id is null or topic_subject_id = subject_id
  ),
  constraint study_sessions_duration_valid check (duration_seconds >= 0),
  constraint study_sessions_counts_valid check (questions_answered >= 0 and flashcards_reviewed >= 0),
  constraint study_sessions_time_order check (ended_at is null or ended_at >= started_at)
);

create table if not exists public.study_materials (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete cascade,
  uploaded_by uuid references public.profiles(id) on delete set null,
  subject_id text references public.subjects(id) on delete set null,
  topic_subject_id text,
  topic_id text,
  title text not null,
  file_name text not null,
  storage_bucket text not null default 'study-materials',
  storage_path text not null unique,
  mime_type text not null,
  file_size_bytes bigint not null,
  summary text,
  visibility public.study_material_visibility not null default 'private',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (topic_subject_id, topic_id) references public.topics(subject_id, id) on delete set null,
  constraint study_materials_topic_reference_complete check (
    (topic_subject_id is null and topic_id is null)
    or (topic_subject_id is not null and topic_id is not null)
  ),
  constraint study_materials_topic_subject_matches check (
    topic_subject_id is null or subject_id is null or topic_subject_id = subject_id
  ),
  constraint study_materials_file_size_positive check (file_size_bytes > 0),
  constraint study_materials_private_owner check (visibility <> 'private' or owner_id is not null)
);

create table if not exists public.study_streaks (
  user_id uuid not null references public.profiles(id) on delete cascade,
  streak_date date not null,
  sessions_count integer not null default 0,
  minutes_studied integer not null default 0,
  questions_answered integer not null default 0,
  flashcards_reviewed integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, streak_date),
  constraint study_streaks_counts_valid check (
    sessions_count >= 0
    and minutes_studied >= 0
    and questions_answered >= 0
    and flashcards_reviewed >= 0
  )
);

create table if not exists public.ai_generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  source_material_id uuid references public.study_materials(id) on delete set null,
  generation_type public.ai_generation_type not null,
  status public.ai_generation_status not null default 'completed',
  model text,
  prompt text,
  request_payload jsonb not null default '{}'::jsonb,
  output jsonb not null default '{}'::jsonb,
  error_message text,
  input_tokens integer,
  output_tokens integer,
  created_at timestamptz not null default now(),
  constraint ai_generations_token_counts_valid check (
    (input_tokens is null or input_tokens >= 0)
    and (output_tokens is null or output_tokens >= 0)
  )
);

create table if not exists public.user_settings (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  theme text not null default 'system',
  daily_goal_questions integer not null default 20,
  daily_goal_minutes integer not null default 25,
  study_minutes integer not null default 25,
  break_minutes integer not null default 5,
  notifications_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_settings_theme_valid check (theme in ('light', 'dark', 'system')),
  constraint user_settings_goals_positive check (
    daily_goal_questions > 0
    and daily_goal_minutes > 0
    and study_minutes > 0
    and break_minutes > 0
  )
);

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  target_type public.favorite_target_type not null,
  subject_id text references public.subjects(id) on delete cascade,
  topic_subject_id text,
  topic_id text,
  flashcard_id text references public.flashcards(id) on delete cascade,
  question_id text references public.questions(id) on delete cascade,
  created_at timestamptz not null default now(),
  foreign key (topic_subject_id, topic_id) references public.topics(subject_id, id) on delete cascade,
  constraint favorites_target_shape check (
    (
      target_type = 'subject'
      and subject_id is not null
      and topic_subject_id is null
      and topic_id is null
      and flashcard_id is null
      and question_id is null
    )
    or (
      target_type = 'topic'
      and subject_id is null
      and topic_subject_id is not null
      and topic_id is not null
      and flashcard_id is null
      and question_id is null
    )
    or (
      target_type = 'flashcard'
      and subject_id is null
      and topic_subject_id is null
      and topic_id is null
      and flashcard_id is not null
      and question_id is null
    )
    or (
      target_type = 'question'
      and subject_id is null
      and topic_subject_id is null
      and topic_id is null
      and flashcard_id is null
      and question_id is not null
    )
  )
);

create index if not exists topics_subject_id_idx on public.topics(subject_id);
create index if not exists flashcards_subject_topic_idx on public.flashcards(subject_id, topic_id);
create index if not exists flashcards_difficulty_idx on public.flashcards(difficulty);
create index if not exists flashcards_tags_idx on public.flashcards using gin(tags);
create index if not exists flashcard_progress_user_due_idx on public.flashcard_progress(user_id, due_at);
create index if not exists flashcard_progress_flashcard_idx on public.flashcard_progress(flashcard_id);
create index if not exists questions_subject_topic_idx on public.questions(subject_id, topic_id);
create index if not exists questions_type_idx on public.questions(type);
create index if not exists questions_difficulty_idx on public.questions(difficulty);
create index if not exists questions_tags_idx on public.questions using gin(tags);
create index if not exists question_options_question_id_idx on public.question_options(question_id);
create index if not exists quiz_attempts_user_created_idx on public.quiz_attempts(user_id, created_at desc);
create index if not exists quiz_attempts_subject_idx on public.quiz_attempts(subject_id);
create index if not exists quiz_answers_attempt_idx on public.quiz_answers(attempt_id);
create index if not exists quiz_answers_question_idx on public.quiz_answers(question_id);
create index if not exists study_sessions_user_started_idx on public.study_sessions(user_id, started_at desc);
create index if not exists study_sessions_subject_idx on public.study_sessions(subject_id);
create index if not exists study_materials_owner_created_idx on public.study_materials(owner_id, created_at desc);
create index if not exists study_materials_subject_idx on public.study_materials(subject_id);
create index if not exists study_streaks_user_date_idx on public.study_streaks(user_id, streak_date desc);
create index if not exists ai_generations_user_created_idx on public.ai_generations(user_id, created_at desc);
create index if not exists ai_generations_source_material_idx on public.ai_generations(source_material_id);

create unique index if not exists favorites_unique_subject_idx
  on public.favorites(user_id, subject_id)
  where target_type = 'subject';

create unique index if not exists favorites_unique_topic_idx
  on public.favorites(user_id, topic_subject_id, topic_id)
  where target_type = 'topic';

create unique index if not exists favorites_unique_flashcard_idx
  on public.favorites(user_id, flashcard_id)
  where target_type = 'flashcard';

create unique index if not exists favorites_unique_question_idx
  on public.favorites(user_id, question_id)
  where target_type = 'question';

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_subjects_updated_at on public.subjects;
create trigger set_subjects_updated_at
before update on public.subjects
for each row execute function public.set_updated_at();

drop trigger if exists set_topics_updated_at on public.topics;
create trigger set_topics_updated_at
before update on public.topics
for each row execute function public.set_updated_at();

drop trigger if exists set_flashcards_updated_at on public.flashcards;
create trigger set_flashcards_updated_at
before update on public.flashcards
for each row execute function public.set_updated_at();

drop trigger if exists set_flashcard_progress_updated_at on public.flashcard_progress;
create trigger set_flashcard_progress_updated_at
before update on public.flashcard_progress
for each row execute function public.set_updated_at();

drop trigger if exists set_questions_updated_at on public.questions;
create trigger set_questions_updated_at
before update on public.questions
for each row execute function public.set_updated_at();

drop trigger if exists set_quiz_attempts_updated_at on public.quiz_attempts;
create trigger set_quiz_attempts_updated_at
before update on public.quiz_attempts
for each row execute function public.set_updated_at();

drop trigger if exists set_study_sessions_updated_at on public.study_sessions;
create trigger set_study_sessions_updated_at
before update on public.study_sessions
for each row execute function public.set_updated_at();

drop trigger if exists set_study_materials_updated_at on public.study_materials;
create trigger set_study_materials_updated_at
before update on public.study_materials
for each row execute function public.set_updated_at();

drop trigger if exists set_study_streaks_updated_at on public.study_streaks;
create trigger set_study_streaks_updated_at
before update on public.study_streaks
for each row execute function public.set_updated_at();

drop trigger if exists set_user_settings_updated_at on public.user_settings;
create trigger set_user_settings_updated_at
before update on public.user_settings
for each row execute function public.set_updated_at();
