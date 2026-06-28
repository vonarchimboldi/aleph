-- aleph v2 — concept graphs, material sets, predicted marks, achievements
-- Run after 0003_admin_rls.sql.

-- ---------------------------------------------------------------------------
-- Concept graphs (adaptive review per chapter)
-- ---------------------------------------------------------------------------
create table if not exists concept_graphs (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid references chapters(id) on delete cascade not null,
  slug text not null,
  title text not null,
  gate_weight text check (gate_weight in ('high', 'medium', 'low')) default 'medium',
  fallback_concepts text[] default '{}',
  fallback_difficulty_mix int[] default '{}',
  fallback_instruction text,
  stable_next_action text,
  created_at timestamptz default now(),
  unique (chapter_id, slug)
);

create table if not exists concept_nodes (
  id uuid primary key default gen_random_uuid(),
  graph_id uuid references concept_graphs(id) on delete cascade not null,
  concept_id text not null,
  label text not null,
  prereqs text[] default '{}',
  repair_material text,
  repair_material_path text,              -- optional MDX path for repair content
  gate_weight text check (gate_weight in ('high', 'medium', 'low')) default 'medium',
  created_at timestamptz default now(),
  unique (graph_id, concept_id)
);

-- ---------------------------------------------------------------------------
-- Material sets (standalone, shareable problem sets)
-- ---------------------------------------------------------------------------
create table if not exists material_sets (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid references subjects(id) on delete cascade not null,
  slug text not null,
  title text not null,
  subtitle text,
  core_pattern text,
  core_pattern_path text,                 -- optional MDX path for core pattern
  meta jsonb default '{}',
  answer_summary jsonb default '[]',
  is_active boolean default true,
  created_at timestamptz default now(),
  unique (subject_id, slug)
);

-- Tasks can optionally belong to a material set instead of a section
alter table tasks add column if not exists material_set_id uuid references material_sets(id) on delete cascade;
alter table tasks add column if not exists title text;
alter table tasks add column if not exists tags text[] default '{}';

-- ---------------------------------------------------------------------------
-- Predicted marks dashboard data
-- ---------------------------------------------------------------------------
create table if not exists predicted_marks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  subject_id uuid references subjects(id) on delete cascade not null,
  predicted_score int not null check (predicted_score between 0 and 100),
  confidence int not null check (confidence between 0 and 100),
  breakdown jsonb default '{}',           -- per-topic strengths / weights
  calculated_at timestamptz default now(),
  unique (user_id, subject_id)
);

-- ---------------------------------------------------------------------------
-- Gamification: achievements / badges
-- ---------------------------------------------------------------------------
create table if not exists achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  badge_key text not null,
  badge_name text not null,
  badge_description text,
  earned_at timestamptz default now(),
  unique (user_id, badge_key)
);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table concept_graphs enable row level security;
alter table concept_nodes enable row level security;
alter table material_sets enable row level security;
alter table predicted_marks enable row level security;
alter table achievements enable row level security;

-- Public read for content
create policy "Public read" on concept_graphs for select to anon, authenticated using (true);
create policy "Public read" on concept_nodes for select to anon, authenticated using (true);
create policy "Public read" on material_sets for select to anon, authenticated using (true);

-- Users own their insights and achievements
create policy "Users read own predicted marks" on predicted_marks for select to authenticated using (auth.uid() = user_id);
create policy "Users read own achievements" on achievements for select to authenticated using (auth.uid() = user_id);

-- Admin write policies reuse the public.is_admin() helper from 0003_admin_rls.sql
create policy "Admin write" on concept_graphs for insert to authenticated with check (public.is_admin());
create policy "Admin update" on concept_graphs for update to authenticated using (public.is_admin());
create policy "Admin delete" on concept_graphs for delete to authenticated using (public.is_admin());

create policy "Admin write" on concept_nodes for insert to authenticated with check (public.is_admin());
create policy "Admin update" on concept_nodes for update to authenticated using (public.is_admin());
create policy "Admin delete" on concept_nodes for delete to authenticated using (public.is_admin());

create policy "Admin write" on material_sets for insert to authenticated with check (public.is_admin());
create policy "Admin update" on material_sets for update to authenticated using (public.is_admin());
create policy "Admin delete" on material_sets for delete to authenticated using (public.is_admin());
