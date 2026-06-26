-- aleph v2 admin RLS policies
-- Run after 0002_next_actions_feedback.sql
-- These policies allow admin users to manage content through the admin app.

-- Helper function: check if the current user is an admin
-- Returns true when the authenticated user has profiles.role = 'admin'.
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
end;
$$ language plpgsql security definer;

-- ---------------------------------------------------------------------------
-- Admin write access to content tables
-- ---------------------------------------------------------------------------

-- Exams
alter policy "Public read" on exams for select to anon, authenticated using (true);
create policy "Admin write" on exams for insert to authenticated with check (public.is_admin());
create policy "Admin update" on exams for update to authenticated using (public.is_admin());
create policy "Admin delete" on exams for delete to authenticated using (public.is_admin());

-- Courses
alter policy "Public read" on courses for select to anon, authenticated using (true);
create policy "Admin write" on courses for insert to authenticated with check (public.is_admin());
create policy "Admin update" on courses for update to authenticated using (public.is_admin());
create policy "Admin delete" on courses for delete to authenticated using (public.is_admin());

-- Subjects
alter policy "Public read" on subjects for select to anon, authenticated using (true);
create policy "Admin write" on subjects for insert to authenticated with check (public.is_admin());
create policy "Admin update" on subjects for update to authenticated using (public.is_admin());
create policy "Admin delete" on subjects for delete to authenticated using (public.is_admin());

-- Chapters
alter policy "Public read" on chapters for select to anon, authenticated using (true);
create policy "Admin write" on chapters for insert to authenticated with check (public.is_admin());
create policy "Admin update" on chapters for update to authenticated using (public.is_admin());
create policy "Admin delete" on chapters for delete to authenticated using (public.is_admin());

-- Sections
alter policy "Public read" on sections for select to anon, authenticated using (true);
create policy "Admin write" on sections for insert to authenticated with check (public.is_admin());
create policy "Admin update" on sections for update to authenticated using (public.is_admin());
create policy "Admin delete" on sections for delete to authenticated using (public.is_admin());

-- Tasks
alter policy "Public read" on tasks for select to anon, authenticated using (true);
create policy "Admin write" on tasks for insert to authenticated with check (public.is_admin());
create policy "Admin update" on tasks for update to authenticated using (public.is_admin());
create policy "Admin delete" on tasks for delete to authenticated using (public.is_admin());

-- Quizzes
alter policy "Public read" on quizzes for select to anon, authenticated using (true);
create policy "Admin write" on quizzes for insert to authenticated with check (public.is_admin());
create policy "Admin update" on quizzes for update to authenticated using (public.is_admin());
create policy "Admin delete" on quizzes for delete to authenticated using (public.is_admin());

-- Quiz questions
alter policy "Public read" on quiz_questions for select to anon, authenticated using (true);
create policy "Admin write" on quiz_questions for insert to authenticated with check (public.is_admin());
create policy "Admin update" on quiz_questions for update to authenticated using (public.is_admin());
create policy "Admin delete" on quiz_questions for delete to authenticated using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Admin access to profiles
-- ---------------------------------------------------------------------------

create policy "Admin read all profiles" on profiles for select to authenticated using (public.is_admin());
create policy "Admin update all profiles" on profiles for update to authenticated using (public.is_admin());
