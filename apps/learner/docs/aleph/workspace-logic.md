# Aleph Workspace Logic

> **Extracted to:** `main-app/src/lib/workspace-logic.ts`

This document describes the **student-facing interaction rules** — how tasks are completed, sections are unlocked, quizzes are scored, and progress is tracked.

---

## 1. Task Completion Rules

### When Can a Task Be Completed?

A task is marked `completed` when:
1. The student submits an answer, **OR**
2. The student views the solution and explicitly marks it "I understood this"

### What Happens on Completion?

```
1. Task status → "completed"
2. WorkspaceState.completed_task_ids.push(task.id)
3. If all tasks in section completed → Section shows "Ready for Quiz"
```

### The "Not Completed" State

A task can be `not-completed` if:
- The student skips it (explicit "Skip" action)
- The student fails to solve it after N attempts (configurable, default 3)
- The student abandons the workspace mid-session

**Skipped tasks do NOT block quiz eligibility.** But they appear in review.

---

## 2. Section Unlock Algorithm

```typescript
function canUnlockSection(section: Section, state: WorkspaceState): boolean {
  // 1. If no prerequisite, it's always available
  if (!section.unlocks_after) return true;

  // 2. Find the prerequisite section
  const prereq = getSection(section.unlocks_after);

  // 3. Prerequisite must have a passed quiz
  const hasPassedQuiz = state.quiz_attempts.some(
    (a) => a.quiz_id === prereq.quiz_id && a.passed
  );

  return hasPassedQuiz;
}
```

### Unlock Chain

```
Read → Concept → Mechanic → Integration → Challenge → Quiz → Summary
   ↑       ↑          ↑            ↑           ↑        ↑
   └───────┴──────────┴────────────┴───────────┴────────┘
                    (sequential unlock)
```

A student **cannot** jump ahead. They must complete each section's quiz to proceed.

### Exception: Review Section

The `review` section appears **only if** the student fails the quiz. It does not block the quiz — rather, it must be completed **before** the quiz can be retaken.

```
Quiz (fail) → Review Quiz (mandatory) → Quiz (retry) → Summary
```

---

## 3. Quiz Scoring

### Attempt Structure

```typescript
interface QuizAttempt {
  id: string;
  user_id: string;
  quiz_id: string;
  score: number;       // Raw points earned
  max_score: number;   // Total possible
  passed: boolean;     // score >= passing_threshold
  answers: Record<string, number>; // question_id -> selected_option
  started_at: string;
  submitted_at: string;
}
```

### Passing Threshold

Default: **70%** of max score.

```typescript
const QUIZ_PASSING_THRESHOLD = 0.7;

function gradeQuiz(attempt: QuizAttempt): boolean {
  const percentage = attempt.score / attempt.max_score;
  return percentage >= QUIZ_PASSING_THRESHOLD;
}
```

### Quiz Attempt Limits

- **Unlimited attempts** for basic quizzes
- **Max 3 attempts** for challenge quizzes (configurable by account type)
- After each failure, a **Review Quiz** is generated

### Review Quiz Generation

```typescript
function generateReviewQuiz(failedAttempt: QuizAttempt): ReviewQuiz {
  // 1. Identify wrong answers
  const wrongQuestions = failedAttempt.answers
    .filter((answer, qid) => !isCorrect(qid, answer))
    .map((_, qid) => getQuestion(qid));

  // 2. Pull related concept problems
  const conceptProblems = wrongQuestions
    .flatMap((q) => getRelatedProblems(q.concept_id))
    .slice(0, 5); // Max 5 review problems

  // 3. Create review quiz
  return {
    id: generateId(),
    section_id: failedAttempt.section_id,
    triggered_by_attempt_id: failedAttempt.id,
    questions: conceptProblems,
    is_completed: false,
  };
}
```

---

## 4. Progress Tracking

### Enrollment-Level Progress

```typescript
function calculateEnrollmentProgress(enrollment: Enrollment): number {
  const subject = getSubject(enrollment.subject_id);
  const completedSections = subject.chapters
    .flatMap((c) => c.coreSections)
    .filter((s) => isSectionCompleted(s.id, enrollment.user_id))
    .length;

  return Math.round((completedSections / subject.total_sections) * 100);
}
```

Updated after every:
- Task completion
- Quiz submission
- Section unlock

### Chapter-Level Progress

```typescript
function calculateChapterProgress(
  chapter: Chapter,
  userId: string
): number {
  const completed = chapter.coreSections.filter(
    (s) => isSectionCompleted(s.id, userId)
  ).length;
  return Math.round((completed / chapter.coreSections.length) * 100);
}
```

### Section-Level Progress

```typescript
function calculateSectionProgress(
  section: Section,
  userId: string
): number {
  const completedTasks = section.tasks.filter(
    (t) => getTaskStatus(t.id, userId) === "completed"
  ).length;
  return Math.round((completedTasks / section.tasks.length) * 100);
}
```

---

## 5. Workspace State Persistence

The workspace is the **single source of truth** for a student's current session.

### Save Triggers

State is saved to Supabase after:
1. Every task completion (async, non-blocking)
2. Every quiz submission (sync, blocks UI)
3. Every 30 seconds of inactivity (debounced)
4. On `beforeunload` (best-effort)

### State Shape

```typescript
interface WorkspaceState {
  user_id: string;
  enrollment_id: string;
  current_section_id: string;
  current_task_index: number;       // 0-based index in current section
  completed_task_ids: string[];
  quiz_attempts: QuizAttempt[];
  review_quiz_attempts: ReviewQuiz[];
  last_active_at: string;           // ISO 8601
}
```

### Conflict Resolution

If a student uses multiple devices:
1. **Server wins** — last write timestamp takes precedence
2. **Merge strategy** — union of completed_task_ids, max of current_task_index
3. **Quiz attempts** — append, never overwrite

---

## 6. UI Feedback Rules

### Task Submission

| Action | Feedback |
|---|---|
| Correct answer | Green checkmark, brief "Correct!", auto-advance after 2s |
| Wrong answer | Red X, hint shown (if available), stay on task |
| View solution | Yellow warning: "This will mark the task as completed via reading" |
| Skip | Gray badge: "Skipped — will appear in review" |

### Quiz Submission

| Result | Feedback |
|---|---|
| Pass (≥70%) | "Section complete! Next section unlocked." + confetti (subtle) |
| Fail (<70%) | "Review needed. A custom review quiz has been generated." |
| Perfect (100%) | "Perfect score! + bonus XP" (if gamification enabled) |

### Section Unlock

When a section unlocks:
1. Sidebar item changes from locked 🔒 to unlocked →
2. Brief toast notification: "New section unlocked: [Section Name]"
3. Section title in sidebar gets a subtle pulse animation (one time)

---

## 7. Edge Cases

### Student Goes Back to a Previous Section
- Allowed. No restrictions on revisiting.
- Re-completing a task does not double-count.

### Student Closes Tab Mid-Quiz
- Quiz timer pauses (server-side).
- On return, student resumes from where they left off.
- If time expired while away, auto-submit with current answers.

### Network Failure During Save
- Retry up to 3 times with exponential backoff.
- If all fail, show warning: "Progress may not be saved. Check connection."
- Store pending saves in `localStorage` for retry on reconnect.

---

*See also:*
- [Data Models](data-models.md) — TypeScript types used here
- [Pedagogical Rules](pedagogical-rules.md) — Why these rules exist
- [Content Extraction](content-extraction.md) — What content powers the workspace
