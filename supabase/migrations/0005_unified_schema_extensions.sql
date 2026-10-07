-- Unified schema extensions for aleph (admin) + aleph_v2 (learner)
-- Run this in the Supabase SQL Editor.
-- It is idempotent: columns are added only if they do not exist.

-- ---------------------------------------------------------------------------
-- Extensibility columns on content tables
-- ---------------------------------------------------------------------------

-- exams
alter table if exists exams add column if not exists metadata jsonb default '{}';
alter table if exists exams add column if not exists status text default 'published' check (status in ('draft', 'published', 'archived'));
alter table if exists exams add column if not exists source text default 'manual';
alter table if exists exams add column if not exists external_id text;

-- courses
alter table if exists courses add column if not exists metadata jsonb default '{}';
alter table if exists courses add column if not exists content_format text default 'markdown' check (content_format in ('markdown', 'mdx', 'html', 'external_url'));
alter table if exists courses add column if not exists access_tier text default 'basic' check (access_tier in ('basic', 'advanced', 'premium', 'platinum'));
alter table if exists courses add column if not exists status text default 'published' check (status in ('draft', 'published', 'archived'));
alter table if exists courses add column if not exists source text default 'manual';
alter table if exists courses add column if not exists external_id text;

-- subjects
alter table if exists subjects add column if not exists metadata jsonb default '{}';
alter table if exists subjects add column if not exists content_format text default 'markdown' check (content_format in ('markdown', 'mdx', 'html', 'external_url'));
alter table if exists subjects add column if not exists access_tier text default 'basic' check (access_tier in ('basic', 'advanced', 'premium', 'platinum'));
alter table if exists subjects add column if not exists status text default 'published' check (status in ('draft', 'published', 'archived'));
alter table if exists subjects add column if not exists source text default 'manual';
alter table if exists subjects add column if not exists external_id text;

-- chapters
alter table if exists chapters add column if not exists metadata jsonb default '{}';
alter table if exists chapters add column if not exists content_format text default 'markdown' check (content_format in ('markdown', 'mdx', 'html', 'external_url'));
alter table if exists chapters add column if not exists access_tier text default 'basic' check (access_tier in ('basic', 'advanced', 'premium', 'platinum'));
alter table if exists chapters add column if not exists status text default 'published' check (status in ('draft', 'published', 'archived'));
alter table if exists chapters add column if not exists source text default 'manual';
alter table if exists chapters add column if not exists external_id text;

-- sections
alter table if exists sections add column if not exists metadata jsonb default '{}';
alter table if exists sections add column if not exists content_format text default 'markdown' check (content_format in ('markdown', 'mdx', 'html', 'external_url'));
alter table if exists sections add column if not exists access_tier text default 'basic' check (access_tier in ('basic', 'advanced', 'premium', 'platinum'));
alter table if exists sections add column if not exists status text default 'published' check (status in ('draft', 'published', 'archived'));
alter table if exists sections add column if not exists source text default 'manual';
alter table if exists sections add column if not exists external_id text;

-- tasks
alter table if exists tasks add column if not exists metadata jsonb default '{}';
alter table if exists tasks add column if not exists status text default 'published' check (status in ('draft', 'published', 'archived'));
alter table if exists tasks add column if not exists source text default 'manual';
alter table if exists tasks add column if not exists external_id text;

-- quizzes
alter table if exists quizzes add column if not exists metadata jsonb default '{}';
alter table if exists quizzes add column if not exists status text default 'published' check (status in ('draft', 'published', 'archived'));
alter table if exists quizzes add column if not exists source text default 'manual';
alter table if exists quizzes add column if not exists external_id text;

-- quiz_questions
alter table if exists quiz_questions add column if not exists metadata jsonb default '{}';
alter table if exists quiz_questions add column if not exists status text default 'published' check (status in ('draft', 'published', 'archived'));
alter table if exists quiz_questions add column if not exists source text default 'manual';
alter table if exists quiz_questions add column if not exists external_id text;

-- resources
alter table if exists resources add column if not exists metadata jsonb default '{}';
alter table if exists resources add column if not exists status text default 'published' check (status in ('draft', 'published', 'archived'));
alter table if exists resources add column if not exists source text default 'manual';
alter table if exists resources add column if not exists external_id text;

-- ---------------------------------------------------------------------------
-- Helper function: stable uuid from slug + namespace
-- ---------------------------------------------------------------------------

create or replace function public.uuid_from_slug(slug text, namespace uuid default '6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid)
returns uuid
language sql
immutable
as $$
  -- Use uuid v5 so the same slug always produces the same uuid.
  select uuid_generate_v5(namespace, slug);
$$;

-- ---------------------------------------------------------------------------
-- Helper function: check if current user is admin
-- ---------------------------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language plpgsql
security definer
as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- Admin write policies for content tables (if not already present)
-- ---------------------------------------------------------------------------

do $$
begin
  -- exams
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'exams' and policyname = 'Admin write') then
    create policy "Admin write" on exams for insert to authenticated with check (public.is_admin());
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'exams' and policyname = 'Admin update') then
    create policy "Admin update" on exams for update to authenticated using (public.is_admin());
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'exams' and policyname = 'Admin delete') then
    create policy "Admin delete" on exams for delete to authenticated using (public.is_admin());
  end if;

  -- courses
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'courses' and policyname = 'Admin write') then
    create policy "Admin write" on courses for insert to authenticated with check (public.is_admin());
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'courses' and policyname = 'Admin update') then
    create policy "Admin update" on courses for update to authenticated using (public.is_admin());
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'courses' and policyname = 'Admin delete') then
    create policy "Admin delete" on courses for delete to authenticated using (public.is_admin());
  end if;

  -- subjects
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'subjects' and policyname = 'Admin write') then
    create policy "Admin write" on subjects for insert to authenticated with check (public.is_admin());
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'subjects' and policyname = 'Admin update') then
    create policy "Admin update" on subjects for update to authenticated using (public.is_admin());
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'subjects' and policyname = 'Admin delete') then
    create policy "Admin delete" on subjects for delete to authenticated using (public.is_admin());
  end if;

  -- chapters
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'chapters' and policyname = 'Admin write') then
    create policy "Admin write" on chapters for insert to authenticated with check (public.is_admin());
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'chapters' and policyname = 'Admin update') then
    create policy "Admin update" on chapters for update to authenticated using (public.is_admin());
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'chapters' and policyname = 'Admin delete') then
    create policy "Admin delete" on chapters for delete to authenticated using (public.is_admin());
  end if;

  -- sections
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'sections' and policyname = 'Admin write') then
    create policy "Admin write" on sections for insert to authenticated with check (public.is_admin());
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'sections' and policyname = 'Admin update') then
    create policy "Admin update" on sections for update to authenticated using (public.is_admin());
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'sections' and policyname = 'Admin delete') then
    create policy "Admin delete" on sections for delete to authenticated using (public.is_admin());
  end if;

  -- tasks
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'tasks' and policyname = 'Admin write') then
    create policy "Admin write" on tasks for insert to authenticated with check (public.is_admin());
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'tasks' and policyname = 'Admin update') then
    create policy "Admin update" on tasks for update to authenticated using (public.is_admin());
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'tasks' and policyname = 'Admin delete') then
    create policy "Admin delete" on tasks for delete to authenticated using (public.is_admin());
  end if;

  -- quizzes
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'quizzes' and policyname = 'Admin write') then
    create policy "Admin write" on quizzes for insert to authenticated with check (public.is_admin());
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'quizzes' and policyname = 'Admin update') then
    create policy "Admin update" on quizzes for update to authenticated using (public.is_admin());
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'quizzes' and policyname = 'Admin delete') then
    create policy "Admin delete" on quizzes for delete to authenticated using (public.is_admin());
  end if;

  -- quiz_questions
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'quiz_questions' and policyname = 'Admin write') then
    create policy "Admin write" on quiz_questions for insert to authenticated with check (public.is_admin());
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'quiz_questions' and policyname = 'Admin update') then
    create policy "Admin update" on quiz_questions for update to authenticated using (public.is_admin());
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'quiz_questions' and policyname = 'Admin delete') then
    create policy "Admin delete" on quiz_questions for delete to authenticated using (public.is_admin());
  end if;

  -- resources
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'resources' and policyname = 'Admin write') then
    create policy "Admin write" on resources for insert to authenticated with check (public.is_admin());
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'resources' and policyname = 'Admin update') then
    create policy "Admin update" on resources for update to authenticated using (public.is_admin());
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'resources' and policyname = 'Admin delete') then
    create policy "Admin delete" on resources for delete to authenticated using (public.is_admin());
  end if;
end
$$;
