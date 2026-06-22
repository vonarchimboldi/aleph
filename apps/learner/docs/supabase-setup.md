# Supabase Setup — Run This Later

> **Status:** NOT YET APPLIED. Run these SQL commands in your Supabase project when you're ready to add database tables.

---

## Why We're Waiting

Right now the app uses **email/password auth only** — no custom user data (roles, account types, etc.). The `profiles` table and related schema are designed but not created yet. This keeps deployment simple while we build the frontend.

When you need user roles, course enrollments, or progress tracking, come back here and run the SQL.

---

## Phase 1: Profiles (User Data)

Run in Supabase SQL Editor:

```sql
-- 1. Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'instructor', 'admin')),
  account_type TEXT NOT NULL DEFAULT 'gate-da-basic' CHECK (account_type IN ('gate-da-basic', 'gate-da-advanced', 'gate-da-premium', 'gate-da-platinum')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 3. RLS policies
CREATE POLICY "Users read own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins read all profiles"
  ON profiles FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- 4. INSERT trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, account_type)
  VALUES (NEW.id, NEW.email, '', 'student', 'gate-da-basic');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. INSERT trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. UPDATE trigger function (email sync)
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET email = NEW.email, updated_at = NOW()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. UPDATE trigger
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.email IS DISTINCT FROM NEW.email)
  EXECUTE FUNCTION public.handle_user_update();
```

**Verify:** Sign up a new user → check Table Editor → `profiles` → row should appear automatically.

---

## Phase 2: Course Content

Run when you have actual courses to serve:

```sql
-- Subjects (top-level courses)
CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  total_sections INT NOT NULL DEFAULT 0,
  total_tasks INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read subjects" ON subjects FOR SELECT USING (true);

-- Chapters
CREATE TABLE IF NOT EXISTS chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  number INT NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  purpose TEXT,
  prerequisites INT[] DEFAULT '{}',
  teaching_notes TEXT,
  practice_themes TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(subject_id, number)
);

ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read chapters" ON chapters FOR SELECT USING (true);
```

---

## Phase 3: Learning (Sections, Tasks, Quizzes)

Run when building the workspace and quiz system:

```sql
-- Sections
CREATE TYPE section_type AS ENUM (
  'read', 'concept', 'mechanic', 'integration',
  'challenge', 'quiz', 'review', 'summary'
);

CREATE TABLE IF NOT EXISTS sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type section_type NOT NULL,
  order_index INT NOT NULL,
  is_locked BOOLEAN DEFAULT true,
  unlocks_after UUID REFERENCES sections(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read sections" ON sections FOR SELECT USING (true);

-- Tasks (problems)
CREATE TYPE problem_label AS ENUM (
  'concept', 'mechanic', 'integration', 'application',
  'challenge', 'hidden', 'isi'
);

CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  problem_label problem_label NOT NULL DEFAULT 'concept',
  order_index INT NOT NULL,
  statement TEXT NOT NULL,
  explanation TEXT,
  hints TEXT[] DEFAULT '{}',
  answer TEXT,
  difficulty INT NOT NULL DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 5),
  estimated_time_minutes INT,
  source TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read tasks" ON tasks FOR SELECT USING (true);

-- Quizzes
CREATE TABLE IF NOT EXISTS quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  questions JSONB NOT NULL DEFAULT '[]',
  passing_score INT NOT NULL DEFAULT 70,
  time_limit_minutes INT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read quizzes" ON quizzes FOR SELECT USING (true);
```

---

## Phase 4: Progress Tracking

Run when building enrollments and the workspace:

```sql
-- Enrollments
CREATE TABLE IF NOT EXISTS enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  progress_percentage INT NOT NULL DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
  current_section_id UUID REFERENCES sections(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, subject_id)
);

ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own enrollments" ON enrollments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own enrollments" ON enrollments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own enrollments" ON enrollments FOR UPDATE USING (auth.uid() = user_id);

-- Quiz attempts
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  score INT NOT NULL,
  max_score INT NOT NULL,
  passed BOOLEAN NOT NULL,
  answers JSONB NOT NULL DEFAULT '{}',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own attempts" ON quiz_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own attempts" ON quiz_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Workspace states
CREATE TABLE IF NOT EXISTS workspace_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
  current_section_id UUID REFERENCES sections(id),
  current_task_index INT NOT NULL DEFAULT 0,
  completed_task_ids UUID[] DEFAULT '{}',
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, enrollment_id)
);

ALTER TABLE workspace_states ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own workspace" ON workspace_states FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own workspace" ON workspace_states FOR UPDATE USING (auth.uid() = user_id);
```

---

## Indexes

Run after all tables are created:

```sql
CREATE INDEX idx_subjects_slug ON subjects(slug);
CREATE INDEX idx_chapters_subject ON chapters(subject_id);
CREATE INDEX idx_sections_chapter_order ON sections(chapter_id, order_index);
CREATE INDEX idx_tasks_section_order ON tasks(section_id, order_index);
CREATE INDEX idx_quizzes_section ON quizzes(section_id);
CREATE INDEX idx_enrollments_user ON enrollments(user_id);
CREATE INDEX idx_quiz_attempts_user ON quiz_attempts(user_id);
CREATE INDEX idx_workspace_states_user ON workspace_states(user_id);
```

---

## Full Schema (One-Shot)

If you want to run everything at once, copy all four phases + indexes into the SQL Editor and run together. Just make sure you run **Phase 1 first** (profiles needs to exist before any user-linked tables).

---

*Last updated: 2026-06-09*
*See also: [schema.md](schema.md) for ER diagram and TypeScript mappings*
