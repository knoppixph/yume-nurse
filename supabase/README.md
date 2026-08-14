# Supabase

This folder contains the Phase 3 database work for NurseMate.

## Files

- `migrations/202608140001_phase_3_schema.sql` creates the core database schema.
- `seed.sql` loads the starter subjects, topics, flashcards, quiz questions, and answer options from the local MVP.

## Tables

- `profiles`
- `subjects`
- `topics`
- `flashcards`
- `flashcard_progress`
- `questions`
- `question_options`
- `quiz_attempts`
- `quiz_answers`
- `study_sessions`
- `study_materials`
- `study_streaks`
- `ai_generations`
- `user_settings`
- `favorites`

## Local Setup

Install the Supabase CLI, then initialize Supabase if the project has not been linked yet:

```powershell
supabase init
supabase start
supabase db reset
```

`supabase db reset` applies migrations and runs `supabase/seed.sql` against the local database.

## Linked Project Setup

For a hosted Supabase project:

```powershell
supabase login
supabase link --project-ref <project-ref>
supabase db push
```

To seed a hosted database, open the Supabase SQL editor and run `supabase/seed.sql`, or run it with your preferred SQL client against the project database.

## Phase Notes

- Phase 3 creates tables, constraints, indexes, foreign keys, and starter content.
- Phase 4 connects Supabase SSR auth helpers, protected routes, email/password auth, password reset, profile save/load, and student/admin role reads.
- Row Level Security policies are planned for Phase 11. Do not expose production tables through the app until policies have been applied and tested.
- Storage bucket creation for PDF uploads is planned for Phase 8.

## Auth Redirects

Add the auth callback route in Supabase Auth settings:

```text
http://localhost:3000/auth/callback
https://your-vercel-domain.vercel.app/auth/callback
```
