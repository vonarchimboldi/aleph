/**
 * Workspace Logic extracted from original Aleph project
 * Source: /Users/akshat/Documents/Code/Personal/aleph/app.js
 *
 * These are the rules and algorithms that govern the learner's workspace:
 * task board, section unlocks, quiz attempts, and progress tracking.
 */

import type { Task, TaskStatus, Section, Test, QuizAttempt, SectionUnlockState } from "./data-models";

// ─── TASK BOARD RULES ──────────────────────────────────────────

/**
 * A task can only move to "completed" if its `done` flag is true.
 * This prevents accidental completions.
 */
export function canCompleteTask(task: Task): boolean {
  return task.done === true;
}

/**
 * Transition a task to a new status. Returns the new task or null if invalid.
 */
export function transitionTaskStatus(
  task: Task,
  newStatus: TaskStatus
): Task | null {
  if (newStatus === "completed" && !task.done) {
    return null; // cannot complete without checking Done
  }
  return { ...task, status: newStatus, updatedAt: new Date().toISOString() };
}

/**
 * Get tasks grouped by status for the weekly board view.
 */
export function groupTasksByStatus(tasks: Task[]): Record<TaskStatus, Task[]> {
  const groups: Record<TaskStatus, Task[]> = {
    todo: [],
    completed: [],
    "not-completed": [],
  };
  for (const task of tasks) {
    groups[task.status].push(task);
  }
  return groups;
}

/**
 * Get tasks for a specific week.
 */
export function getTasksForWeek(tasks: Task[], week: number): Task[] {
  return tasks.filter((t) => t.week === week);
}

// ─── SECTION UNLOCK RULES ──────────────────────────────────────

/**
 * Determine if a section is locked based on the previous section's completion.
 * For Basic tier: a section is locked until the previous section's review quiz
 * has been attempted.
 */
export function computeSectionUnlockState(
  section: Section,
  allSections: Section[],
  tests: Test[],
  quizAttempts: QuizAttempt[],
  accountTypeId: string
): SectionUnlockState {
  // Non-basic plans have everything unlocked
  if (accountTypeId !== "gate-da-basic") {
    return {
      locked: false,
      previousSection: null,
      previousTest: null,
      previousAttempt: null,
    };
  }

  const index = allSections.findIndex((s) => s.id === section.id);
  if (index <= 0) {
    return {
      locked: false,
      previousSection: null,
      previousTest: null,
      previousAttempt: null,
    };
  }

  const previousSection = allSections[index - 1];
  const previousTest = tests.find((t) => t.sectionId === previousSection.id) || null;
  const previousAttempt = previousTest
    ? getLatestQuizAttempt(quizAttempts, previousTest.id)
    : null;

  const locked = !previousSection.reviewQuiz || !previousAttempt;

  return { locked, previousSection, previousTest, previousAttempt };
}

/**
 * Get the latest quiz attempt for a given test.
 */
export function getLatestQuizAttempt(
  attempts: QuizAttempt[],
  testId: string
): QuizAttempt | null {
  return (
    attempts
      .filter((a) => a.testId === testId)
      .sort((a, b) => a.date.localeCompare(b.date))
      .at(-1) || null
  );
}

// ─── QUIZ SCORING ──────────────────────────────────────────────

/**
 * Score a quiz attempt using concept-graph-aware scoring.
 * Target concepts and prerequisites are weighted.
 */
export function scoreQuizAttempt(attempt: QuizAttempt): {
  totalScore: number;
  conceptScores: Record<string, number>;
  missedConcepts: string[];
} {
  const conceptScores: Record<string, number> = {};
  const scoredConcepts = new Set<string>();
  let correctCount = 0;

  for (const answer of attempt.answers) {
    if (answer.isCorrect) {
      correctCount++;
      conceptScores[answer.targetConcept] =
        (conceptScores[answer.targetConcept] || 0) + 1;
      scoredConcepts.add(answer.targetConcept);
      for (const prereq of answer.prereqsUsed) {
        conceptScores[prereq] = (conceptScores[prereq] || 0) + 0.5;
        scoredConcepts.add(prereq);
      }
    }
  }

  const totalScore = attempt.answers.length > 0
    ? Math.round((correctCount / attempt.answers.length) * 100)
    : 0;

  const missedConcepts = Array.from(scoredConcepts).filter(
    (c) => (conceptScores[c] || 0) < 1
  );

  return { totalScore, conceptScores, missedConcepts };
}

// ─── PROGRESS TRACKING ─────────────────────────────────────────

/**
 * Compute overall subject progress as a percentage.
 */
export function computeSubjectProgress(
  sections: Section[],
  quizAttempts: QuizAttempt[],
  tests: Test[]
): number {
  if (sections.length === 0) return 0;

  let completedSections = 0;
  for (const section of sections) {
    const test = tests.find((t) => t.sectionId === section.id);
    const attempt = test ? getLatestQuizAttempt(quizAttempts, test.id) : null;
    if (attempt && attempt.score >= 60) {
      completedSections++;
    }
  }

  return Math.round((completedSections / sections.length) * 100);
}

/**
 * Compute weekly completion rate for a given week.
 */
export function computeWeeklyCompletion(tasks: Task[], week: number): number {
  const weekTasks = getTasksForWeek(tasks, week);
  if (weekTasks.length === 0) return 0;

  const completed = weekTasks.filter((t) => t.status === "completed").length;
  return Math.round((completed / weekTasks.length) * 100);
}

// ─── WORKSPACE IMPORT / EXPORT ─────────────────────────────────

/**
 * Export workspace state to a JSON blob for download.
 */
export function exportWorkspaceState(state: object): string {
  return JSON.stringify(state, null, 2);
}

/**
 * Import workspace state from a JSON string.
 * Returns null if invalid.
 */
export function importWorkspaceState(json: string): object | null {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

// ─── SEEDED WORKSPACE GENERATION ───────────────────────────────

/**
 * Build a canonical seeded workspace for a new user.
 * This ensures every learner starts with the same structured plan.
 */
export interface SeededWorkspaceConfig {
  startDate: string;
  endDate: string;
  subjects: string[];
  weeks: number;
}

export function buildSeededWorkspace(config: SeededWorkspaceConfig): {
  schedule: unknown[];
  tasks: unknown[];
  tests: unknown[];
  feedback: unknown[];
} {
  // This is a stub — the full implementation would generate
  // the weekly schedule, tasks, tests, and feedback entries
  // based on the original aleph's buildCoursePlan() logic.
  return {
    schedule: [],
    tasks: [],
    tests: [],
    feedback: [],
  };
}
