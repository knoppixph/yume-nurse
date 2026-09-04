-- NurseMate: Study Materials Storage bucket + RLS synchronization fixes
-- Ensures all nursing students/partners can view and share uploaded materials across accounts.

--------------------------------------------------------------------------------
-- 1. Create or update the study-materials Storage bucket (PUBLIC so all accounts can view)
--------------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'study-materials',
  'study-materials',
  true, -- public bucket allows all logged in users/devices to access shared study notes
  26214400, -- 25 MB limit
  array[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'text/markdown',
    'text/plain'
  ]
)
on conflict (id) do update set public = true;

--------------------------------------------------------------------------------
-- 1b. Seed standard nursing subjects so foreign key constraints succeed
--------------------------------------------------------------------------------
insert into public.subjects (id, name, description, icon, accent, sort_order)
values
  ('community-health-ph', 'Community Health Nursing (Philippines)', 'Public health nursing in the Philippines, Primary Health Care (LOI 949), 8 PHC elements, 4 A''s, BHW empowerment, and healthcare delivery levels.', 'Users', 'emerald', 5),
  ('fundamentals', 'Fundamentals of Nursing', 'Core bedside skills, safety habits, assessment basics, and the nursing process.', 'HeartPulse', 'pink', 10),
  ('anatomy-physiology', 'Anatomy and Physiology', 'Body systems, normal function, and clinically relevant relationships.', 'Activity', 'blue', 20),
  ('pharmacology', 'Pharmacology', 'Medication safety, classifications, dosage thinking, and nursing responsibilities.', 'Pill', 'purple', 30),
  ('medical-surgical', 'Medical-Surgical Nursing', 'Adult health conditions, priority assessment, and clinical decision-making.', 'Stethoscope', 'teal', 40),
  ('maternal-child', 'Maternal and Child Nursing', 'Pregnancy, newborn care, postpartum assessment, and family-centered teaching.', 'Baby', 'rose', 50),
  ('psychiatric', 'Psychiatric Nursing', 'Therapeutic communication, mental health assessment, crisis care, and safety.', 'Brain', 'amber', 60)
on conflict (id) do update
set
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  accent = excluded.accent,
  sort_order = excluded.sort_order,
  updated_at = now();

--------------------------------------------------------------------------------
-- 2. Fix RLS policies on public.study_materials table
--------------------------------------------------------------------------------
drop policy if exists "Users can view their own materials or public/admin library" on public.study_materials;
drop policy if exists "Users can manage their own study materials" on public.study_materials;
drop policy if exists "Users can insert their own study materials" on public.study_materials;
drop policy if exists "Users can update their own study materials" on public.study_materials;
drop policy if exists "Users can delete their own study materials" on public.study_materials;
drop policy if exists "Allow reading all shared study materials" on public.study_materials;

-- Allow all authenticated users to view shared study materials
create policy "Allow reading all shared study materials"
  on public.study_materials
  for select
  to authenticated
  using (
    visibility in ('public', 'admin_library')
    or auth.uid() = owner_id
    or public.is_admin()
  );

-- Allow authenticated users to insert their study materials
create policy "Users can insert their own study materials"
  on public.study_materials
  for insert
  to authenticated
  with check (
    auth.uid() = owner_id
    or owner_id is null
  );

-- Allow users to update their own study materials (or admins)
create policy "Users can update their own study materials"
  on public.study_materials
  for update
  to authenticated
  using (auth.uid() = owner_id or public.is_admin())
  with check (auth.uid() = owner_id or public.is_admin());

-- Allow users to delete their own study materials (or admins)
create policy "Users can delete their own study materials"
  on public.study_materials
  for delete
  to authenticated
  using (auth.uid() = owner_id or public.is_admin());

--------------------------------------------------------------------------------
-- 3. Storage RLS policies for study-materials bucket
--------------------------------------------------------------------------------
drop policy if exists "Users can upload to their own folder" on storage.objects;
drop policy if exists "Users can read their own files" on storage.objects;
drop policy if exists "Users can delete their own files" on storage.objects;
drop policy if exists "Allow reading study materials" on storage.objects;
drop policy if exists "Allow authenticated uploads to study materials" on storage.objects;
drop policy if exists "Allow owners to delete their files" on storage.objects;

-- Any authenticated user can upload to study-materials bucket
create policy "Allow authenticated uploads to study materials"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'study-materials');

-- Anyone can read study materials from this bucket
create policy "Allow reading study materials"
  on storage.objects
  for select
  using (bucket_id = 'study-materials');

-- Users can delete files they uploaded (or admin)
create policy "Allow owners to delete their files"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'study-materials'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
