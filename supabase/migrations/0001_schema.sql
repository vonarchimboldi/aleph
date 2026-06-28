-- aleph v2 initial schema
-- Run this in the Supabase SQL Editor (new query → paste → run).

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------------------
-- Exams / Courses / Subjects / Chapters / Sections
-- ---------------------------------------------------------------------------
create table if not exists exams (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  month int check (month between 1 and 12),
  year int,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists courses (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  exam_id uuid references exams(id) on delete cascade,
  title text not null,
  tagline text,
  description text,
  difficulty text,
  duration text,
  estimated_hours int default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists subjects (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  course_id uuid references courses(id) on delete cascade,
  title text not null,
  description text,
  order_index int not null default 0,
  outcomes text[] default '{}',
  prerequisites text[] default '{}',
  weight_in_exam_percent int default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists chapters (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid references subjects(id) on delete cascade not null,
  slug text not null,
  number int not null,
  title text not null,
  description text,
  estimated_minutes int default 0,
  created_at timestamptz default now(),
  unique (subject_id, slug)
);

create table if not exists sections (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid references chapters(id) on delete cascade not null,
  slug text not null,
  title text not null,
  type text not null check (type in ('read', 'concept', 'mechanic', 'integration', 'challenge', 'quiz', 'review', 'summary')),
  order_index int not null default 0,
  estimated_minutes int default 0,
  content text default '',
  content_path text,                       -- optional path to MDX file, e.g. courses/probability/ch1/core-ideas.mdx
  reading_questions jsonb default '[]',
  is_locked boolean default false,
  created_at timestamptz default now(),
  unique (chapter_id, slug)
);

-- ---------------------------------------------------------------------------
-- Tasks (problems) and Quizzes
-- ---------------------------------------------------------------------------
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  section_id uuid references sections(id) on delete cascade not null,
  label text not null check (label in ('concept', 'mechanic', 'integration', 'challenge', 'isi')),
  statement text not null,
  answer text not null,
  solution text not null,
  hints text[] default '{}',
  difficulty int check (difficulty between 1 and 3),
  estimated_minutes int default 0,
  order_index int not null default 0,
  concept_id text,
  concept_name text,
  created_at timestamptz default now()
);

create table if not exists quizzes (
  id uuid primary key default gen_random_uuid(),
  section_id uuid references sections(id) on delete cascade not null,
  passing_score int not null default 70,
  time_limit_minutes int,
  created_at timestamptz default now(),
  unique (section_id)
);

create table if not exists quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid references quizzes(id) on delete cascade not null,
  prompt text not null,
  format text not null check (format in ('mcq', 'msq', 'nat')),
  options jsonb default '[]',
  correct_answer text not null,
  explanation text,
  difficulty int check (difficulty between 1 and 3),
  gate_weight text check (gate_weight in ('high', 'medium', 'low')),
  concept_id text,
  concept_name text,
  order_index int not null default 0,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- User profiles (extends Supabase Auth)
-- ---------------------------------------------------------------------------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'student',
  account_type text not null default 'gate-da-basic',
  xp int default 0,
  level int default 1,
  streak_days int default 0,
  last_active_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Enrollments and Workspace State
-- ---------------------------------------------------------------------------
create table if not exists enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  subject_id uuid references subjects(id) on delete cascade not null,
  status text not null default 'active' check (status in ('active', 'completed', 'paused')),
  progress_percentage int not null default 0 check (progress_percentage between 0 and 100),
  current_section_id uuid references sections(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, subject_id)
);

create table if not exists workspace_states (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  enrollment_id uuid references enrollments(id) on delete cascade not null,
  current_section_id uuid references sections(id) on delete set null,
  current_task_ids jsonb default '{}',
  completed_task_ids uuid[] default '{}',
  skipped_task_ids uuid[] default '{}',
  viewed_solution_task_ids uuid[] default '{}',
  updated_at timestamptz default now(),
  unique (user_id, enrollment_id)
);

create table if not exists quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  quiz_id uuid references quizzes(id) on delete cascade not null,
  score int not null default 0,
  max_score int not null default 0,
  passed boolean not null default false,
  answers jsonb default '{}',
  submitted_at timestamptz default now()
);

create table if not exists review_quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  section_id uuid references sections(id) on delete cascade not null,
  triggered_by_attempt_id uuid references quiz_attempts(id) on delete set null,
  score int not null default 0,
  max_score int not null default 0,
  passed boolean not null default false,
  answers jsonb default '{}',
  submitted_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table exams enable row level security;
alter table courses enable row level security;
alter table subjects enable row level security;
alter table chapters enable row level security;
alter table sections enable row level security;
alter table tasks enable row level security;
alter table quizzes enable row level security;
alter table quiz_questions enable row level security;
alter table profiles enable row level security;
alter table enrollments enable row level security;
alter table workspace_states enable row level security;
alter table quiz_attempts enable row level security;
alter table review_quiz_attempts enable row level security;

-- Content is public read
create policy "Public read" on exams for select to anon, authenticated using (true);
create policy "Public read" on courses for select to anon, authenticated using (true);
create policy "Public read" on subjects for select to anon, authenticated using (true);
create policy "Public read" on chapters for select to anon, authenticated using (true);
create policy "Public read" on sections for select to anon, authenticated using (true);
create policy "Public read" on tasks for select to anon, authenticated using (true);
create policy "Public read" on quizzes for select to anon, authenticated using (true);
create policy "Public read" on quiz_questions for select to anon, authenticated using (true);

-- Profiles: users own, admins see all
create policy "Users read own profile" on profiles for select to authenticated using (auth.uid() = id);
create policy "Users update own profile" on profiles for update to authenticated using (auth.uid() = id);

-- Enrollments: users own
create policy "Users read own enrollments" on enrollments for select to authenticated using (auth.uid() = user_id);
create policy "Users insert own enrollments" on enrollments for insert to authenticated with check (auth.uid() = user_id);
create policy "Users update own enrollments" on enrollments for update to authenticated using (auth.uid() = user_id);

-- Workspace state: users own
create policy "Users read own workspace" on workspace_states for select to authenticated using (auth.uid() = user_id);
create policy "Users insert own workspace" on workspace_states for insert to authenticated with check (auth.uid() = user_id);
create policy "Users update own workspace" on workspace_states for update to authenticated using (auth.uid() = user_id);

-- Quiz attempts: users own
create policy "Users read own attempts" on quiz_attempts for select to authenticated using (auth.uid() = user_id);
create policy "Users insert own attempts" on quiz_attempts for insert to authenticated with check (auth.uid() = user_id);

create policy "Users read own review attempts" on review_quiz_attempts for select to authenticated using (auth.uid() = user_id);
create policy "Users insert own review attempts" on review_quiz_attempts for insert to authenticated with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_profiles_updated_at on profiles;
create trigger update_profiles_updated_at
  before update on profiles
  for each row execute function public.update_updated_at_column();

drop trigger if exists update_enrollments_updated_at on enrollments;
create trigger update_enrollments_updated_at
  before update on enrollments
  for each row execute function public.update_updated_at_column();
