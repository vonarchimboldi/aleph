-- aleph v2 — next-actions, feedback, concept mastery, and resources
-- Run this in the Supabase SQL Editor after 0001_schema.sql.

-- ---------------------------------------------------------------------------
-- Concept mastery (strengths / weaknesses)
-- ---------------------------------------------------------------------------
create table if not exists concept_mastery (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  concept_id text not null,                 -- stable concept slug, e.g. "conditional-probability"
  concept_name text not null,               -- human label
  subject_id uuid references subjects(id) on delete cascade not null,
  strength float not null default 0 check (strength between 0 and 1),
  questions_attempted int not null default 0,
  questions_correct int not null default 0,
  last_reviewed_at timestamptz,
  next_review_at timestamptz,
  is_weak boolean generated always as (strength < 0.5) stored,
  updated_at timestamptz default now(),
  unique (user_id, concept_id, subject_id)
);

-- ---------------------------------------------------------------------------
-- Feedback records generated from quiz / review attempts
-- ---------------------------------------------------------------------------
create table if not exists feedback_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  quiz_attempt_id uuid references quiz_attempts(id) on delete cascade,
  review_attempt_id uuid references review_quiz_attempts(id) on delete cascade,
  title text not null,
  verdict text not null check (verdict in ('green', 'yellow', 'red')),
  overall_score_percent int check (overall_score_percent between 0 and 100),
  summary text,
  what_they_got_right text[] default '{}',
  still_not_understood text[] default '{}',
  correct_approach text[] default '{}',
  minimal_correction text,
  next_actions jsonb default '[]',          -- [{ type, section_id, task_id, reason }]
  raw_response text,                        -- optional LLM output for debugging
  created_at timestamptz default now()
);

create table if not exists feedback_items (
  id uuid primary key default gen_random_uuid(),
  feedback_record_id uuid references feedback_records(id) on delete cascade not null,
  concept_id text not null,
  concept_name text not null,
  status text not null check (status in ('correct', 'partial', 'incorrect')),
  misconception text,
  repair_action text,
  practice_task_ids uuid[] default '{}',
  order_index int not null default 0
);

-- ---------------------------------------------------------------------------
-- User tasks / next-actions
-- ---------------------------------------------------------------------------
create table if not exists user_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  enrollment_id uuid references enrollments(id) on delete cascade not null,
  type text not null check (type in ('problem', 'quiz', 'review', 'summary', 'spaced_review', 'repair')),
  section_id uuid references sections(id) on delete cascade not null,
  task_id uuid references tasks(id) on delete cascade,
  quiz_id uuid references quizzes(id) on delete cascade,
  review_attempt_id uuid references review_quiz_attempts(id) on delete cascade,
  title text not null,
  description text,
  priority int not null default 0,          -- higher = do first
  due_at timestamptz,
  status text not null default 'pending' check (status in ('pending', 'completed', 'skipped')),
  completed_at timestamptz,
  source text not null default 'auto' check (source in ('auto', 'manual')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_user_tasks_user_status_priority
  on user_tasks (user_id, status, priority desc, due_at);

-- ---------------------------------------------------------------------------
-- Resources (formula sheets, papers, videos, links)
-- ---------------------------------------------------------------------------
create table if not exists resources (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid references exams(id) on delete cascade,
  course_id uuid references courses(id) on delete cascade,
  subject_id uuid references subjects(id) on delete cascade,
  chapter_id uuid references chapters(id) on delete cascade,
  title text not null,
  description text,
  url text,
  type text not null check (type in ('video', 'pdf', 'article', 'link', 'cheatsheet')),
  tags text[] default '{}',
  order_index int not null default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table concept_mastery enable row level security;
alter table feedback_records enable row level security;
alter table feedback_items enable row level security;
alter table user_tasks enable row level security;
alter table resources enable row level security;

-- Users own their learning data; content tables are public read

-- Concept mastery
create policy "Users read own concept mastery" on concept_mastery
  for select to authenticated using (auth.uid() = user_id);

-- Feedback records
create policy "Users read own feedback records" on feedback_records
  for select to authenticated using (auth.uid() = user_id);

-- Feedback items (cascade read via feedback record ownership)
create policy "Users read own feedback items" on feedback_items
  for select to authenticated using (
    exists (
      select 1 from feedback_records fr
      where fr.id = feedback_items.feedback_record_id
      and fr.user_id = auth.uid()
    )
  );

-- User tasks / next-actions
create policy "Users read own tasks" on user_tasks
  for select to authenticated using (auth.uid() = user_id);
create policy "Users insert own tasks" on user_tasks
  for insert to authenticated with check (auth.uid() = user_id);
create policy "Users update own tasks" on user_tasks
  for update to authenticated using (auth.uid() = user_id);

-- Resources public read
create policy "Public read resources" on resources
  for select to anon, authenticated using (true);

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
drop trigger if exists update_user_tasks_updated_at on user_tasks;
create trigger update_user_tasks_updated_at
  before update on user_tasks
  for each row execute function public.update_updated_at_column();
