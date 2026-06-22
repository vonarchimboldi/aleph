# Aleph Data Models

> **Extracted to:** `main-app/src/lib/data-models.ts`

This document describes the core type system of the original aleph project, which has been ported to TypeScript for `aleph_v2`.

---

## Account & User

```typescript
type AccountType =
  | "gate-da-basic"
  | "gate-da-advanced"
  | "gate-da-premium"
  | "gate-da-platinum";

type UserRole = "student" | "instructor" | "admin";

interface User {
  id: string;           // UUID
  email: string;
  full_name: string;
  role: UserRole;
  account_type: AccountType;
  created_at: string;   // ISO 8601
  updated_at: string;
}
```

**Account types** define feature access:
- `basic` — Core problem sets, no quizzes
- `advanced` — + Quizzes, review quizzes
- `premium` — + Full concept graph, instructor notes
- `platinum` — + Everything, priority support

---

## Enrollment

```typescript
interface Enrollment {
  id: string;
  user_id: string;
  subject_id: string;
  enrolled_at: string;
  progress_percentage: number;  // 0-100
  current_section_id: string | null;
  status: "active" | "completed" | "paused";
}
```

A student **enrolls** in a **Subject** (e.g., "Probability & Statistics"). The enrollment tracks their overall progress.

---

## Subject

```typescript
interface Subject {
  id: string;
  slug: string;           // URL-safe identifier
  title: string;
  description: string;
  chapters: Chapter[];
  total_sections: number;
  total_tasks: number;
}
```

A Subject is the top-level course container. Example: "Probability & Statistics for GATE DA".

---

## Chapter

```typescript
interface Chapter {
  id: string;
  number: number;         // e.g., 5 for "Chapter 5"
  title: string;
  slug: string;
  purpose: string;        // Why this chapter exists
  prerequisites: string[]; // Chapter IDs that must be completed first
  coreSections: Section[];
  teachingNotes: string;
  practiceThemes: string[];
}
```

Example from the probability roadmap: "Chapter 5 — Combinatorics & Counting" with sections on Permutations, Combinations, Stars and Bars, etc.

---

## Section

```typescript
type SectionType =
  | "read"
  | "concept"
  | "mechanic"
  | "integration"
  | "challenge"
  | "quiz"
  | "review"
  | "summary";

interface Section {
  id: string;
  chapter_id: string;
  title: string;
  type: SectionType;
  order_index: number;    // Position within chapter
  tasks: Task[];
  is_locked: boolean;
  unlocks_after: string | null; // Section ID that must be completed first
}
```

The 8 standard section types (defined in `pedagogical-rules.ts`):
1. **Read** — Reading material / theory
2. **Concept** — Conceptual problems (5 in the P-Set)
3. **Mechanic** — Mechanical / procedural problems (part of the 5)
4. **Integration** — Multi-concept problems (3 in the P-Set)
5. **Challenge** — Difficult problems (2 in the P-Set)
6. **Quiz** — Section-end assessment
7. **Review** — Review quiz (appears after quiz failure)
8. **Summary** — Chapter summary / key takeaways

---

## Task

```typescript
type TaskStatus = "todo" | "completed" | "not-completed";
type ProblemLabel =
  | "concept"
  | "mechanic"
  | "integration"
  | "application"
  | "challenge"
  | "hidden"
  | "isi";

interface Task {
  id: string;
  section_id: string;
  title: string;
  problem_label: ProblemLabel;
  order_index: number;
  status: TaskStatus;
  explanation?: string;    // Detailed solution explanation
  hints?: string[];
  answer?: string;
  metadata: {
    difficulty: 1 | 2 | 3 | 4 | 5;
    estimated_time_minutes: number;
    source?: string;       // ISI, GATE, etc.
  };
}
```

A **Task** is a single problem or exercise. Tasks are grouped into Sections.

---

## Quiz & Attempt

```typescript
interface Quiz {
  id: string;
  section_id: string;
  title: string;
  questions: QuizQuestion[];
  passing_score: number;   // e.g., 70
  time_limit_minutes: number;
}

interface QuizQuestion {
  id: string;
  quiz_id: string;
  text: string;
  options: string[];
  correct_option_index: number;
  explanation: string;
}

interface QuizAttempt {
  id: string;
  user_id: string;
  quiz_id: string;
  score: number;
  max_score: number;
  passed: boolean;
  answers: Record<string, number>; // question_id -> selected_option_index
  started_at: string;
  submitted_at: string;
}
```

Quizzes gate progress. A student **must pass** the section quiz to unlock the next section.

---

## Review Quiz

```typescript
interface ReviewQuiz {
  id: string;
  section_id: string;
  triggered_by_attempt_id: string;
  questions: QuizQuestion[];
  is_completed: boolean;
}
```

If a student **fails** a quiz, a **Review Quiz** is generated. It must be completed before the main quiz can be retaken.

---

## Concept Graph

```typescript
interface ConceptGraph {
  id: string;
  subject_id: string;
  nodes: ConceptNode[];
  edges: ConceptEdge[];
}

interface ConceptNode {
  id: string;
  label: string;
  chapter_id: string;
  mastery_level: number;   // 0-100
}

interface ConceptEdge {
  from: string;            // ConceptNode ID
  to: string;              // ConceptNode ID
  type: "prerequisite" | "related";
}
```

The **Concept Graph** models knowledge dependencies. If a student struggles with concept B, the graph can identify that they need to review concept A (prerequisite).

---

## Problem (Legacy Format)

```typescript
interface Problem {
  id: string;
  title: string;
  statement: string;       // Full problem text, may include LaTeX
  label: ProblemLabel;
  solution: string;        // Step-by-step solution
  section_id: string;
  chapter_id: string;
  metadata: {
    difficulty: number;
    source?: string;
    year?: number;
    tags: string[];
  };
}
```

The original aleph used a `Problem` type that was closely tied to the P-Set JSON structure. In `aleph_v2`, this is being normalized into the `Task` type.

---

## Workspace State

```typescript
interface WorkspaceState {
  user_id: string;
  enrollment_id: string;
  current_section_id: string;
  current_task_ids: Record<string, string>; // label -> active task id
  completed_task_ids: string[];
  skipped_task_ids: string[];
  viewed_solution_task_ids: string[];
  last_active_at: string;
}
```

**Workspace State** tracks where the student is right now — current section, active tasks per label, what’s completed/skipped, and which solutions were viewed. This is saved to the database on every action.

---

## Supabase Table Mapping

| Model | Supabase Table | RLS Policy |
|---|---|---|
| `User` | `profiles` | Users read/update own; admins read all |
| `Enrollment` | `enrollments` | Users read/insert/update own |
| `Subject` | `subjects` | Public read |
| `Chapter` | `chapters` | Public read |
| `Section` | `sections` | Public read |
| `Task` | `tasks` | Public read |
| `Quiz` / `QuizQuestion` | `quizzes` / `quiz_questions` | Public read |
| `QuizAttempt` | `quiz_attempts` | Users read/insert own |
| `ReviewQuizAttempt` | `review_quiz_attempts` | Users read/insert own |
| `WorkspaceState` | `workspace_states` | Users read/insert/update own |
| `ConceptMastery` | `concept_mastery` | Users read own |
| `FeedbackRecord` / `FeedbackItem` | `feedback_records` / `feedback_items` | Users read own |
| `UserTask` | `user_tasks` | Users read/insert/update own |
| `Resource` | `resources` | Public read |

---

*See also:*
- [Pedagogical Rules](pedagogical-rules.md) — How problems are structured
- [Workspace Logic](workspace-logic.md) — How progress flows
- [Content Extraction](content-extraction.md) — What content was migrated
