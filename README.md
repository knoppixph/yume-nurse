# Yume Nurse

Yume Nurse is a premium nursing reviewer web app. It includes a comprehensive nursing curriculum, interactive spaced repetition flashcards (SM-2), NCLEX & PNLE practice quizzes with clinical patient scenarios, Pomodoro focus timer, 5-tier gamification, NurseMate/Yume Nurse AI clinical tutor, and an Admin CMS.

## Current Phase

- Phase 0: Project setup
- Phase 1: MVP UI shell
- Phase 2: Local data MVP
- Phase 3: Supabase database schema and starter seed data
- Phase 4: Supabase authentication and profile setup

Storage, AI API calls, admin persistence, RLS, and deployment hardening are planned for later phases.

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Lucide icons
- Local TypeScript data for the MVP
- Planned: Supabase Auth, Supabase PostgreSQL, Supabase Storage, OpenAI API, Vercel

## Local Development

```powershell
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

## Checks

```powershell
pnpm lint
pnpm typecheck
pnpm build
```

## Environment Variables

Copy `.env.example` to `.env.local` when the backend phases begin.

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Never commit real secrets.

## Supabase Setup

Phase 3 database files live in `supabase/`:

- `supabase/migrations/202608140001_phase_3_schema.sql`
- `supabase/seed.sql`

Local setup with the Supabase CLI:

```powershell
supabase init
supabase start
supabase db reset
```

Hosted project setup:

```powershell
supabase login
supabase link --project-ref <project-ref>
supabase db push
```

Run `supabase/seed.sql` in the hosted project's SQL editor when you want to load the starter nursing subjects, flashcards, and quiz questions.

Phase 4 adds Supabase SSR auth helpers, protected app routes, email/password sign up and login, logout, forgot/reset password flows, and profile save/load.

In Supabase Auth settings, add these redirect URLs:

```text
http://localhost:3000/auth/callback
https://your-vercel-domain.vercel.app/auth/callback
```

Row Level Security policies are planned for Phase 11, so do not expose production tables through the app until policies are applied and tested.

## OpenAI Setup

Planned for Phase 9:

- Add an OpenAI API key to `.env.local`.
- Keep API calls server-side only.
- Label generated content as AI-generated.
- Include education-only safety messaging.

## Admin Setup

Planned for Phase 10:

- Add roles in the profiles table.
- Promote a user to `admin` through a controlled setup path.
- Protect admin routes with server-side checks.

## Deployment

Planned for Phase 12:

- Add production environment variables in Vercel.
- Run migrations before production use.
- Run `pnpm build` before deployment.
