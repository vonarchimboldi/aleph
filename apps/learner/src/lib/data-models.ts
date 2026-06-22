/**
 * Data Models extracted from original Aleph project
 * Source: /Users/akshat/Documents/Code/Personal/aleph/app.js
 *
 * These are the core entities for an educational / exam-prep platform.
 * All IDs use UUID strings (Supabase default).
 */

// ─── USER & AUTH ───────────────────────────────────────────────

export type AccountType =
  | "gate-da-basic"
  | "gate-da-advanced"
  | "gate-da-premium"
  | "gate-da-platinum";

export type UserRole = "student" | "instructor" | "admin";

export interface User {
  id: string;
  email: string;
  name: string;
  accountTypeId: AccountType;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

// ─── ENROLLMENT ────────────────────────────────────────────────

export interface Enrollment {
  id: string;
  userId: string;
  accountTypeId: AccountType;
  status: "active" | "paused" | "completed" | "cancelled";
  startedAt: string;
  expiresAt?: string;
}

// ─── SUBJECT ───────────────────────────────────────────────────

export interface Subject {
  id: string;
  accountTypeId: AccountType;
  lessonPlanId: string;
  title: string;
  date: string; // target completion date
  status: "Not started" | "In progress" | "Completed";
  details: string;
  updatedAt: string;
  // Plan-specific extensions
  patternWorkspaces?: PatternWorkspace[];
  materialWorkspaces?: MaterialWorkspace[];
}

// ─── SECTION (CHAPTER WITHIN SUBJECT) ──────────────────────────

export interface Section {
  id: string;
  subjectId: string;
  title: string;
  order: number;
  reviewQuiz?: ReviewQuiz;
  updatedAt: string;
}

export interface SectionUnlockState {
  locked: boolean;
  previousSection: Section | null;
  previousTest: Test | null;
  previousAttempt: QuizAttempt | null;
}

// ─── LESSON PLAN ───────────────────────────────────────────────

export interface LessonPlan {
  id: string;
  title: string;
  sections: Section[];
  schedule: ScheduleItem[];
}

// ─── SCHEDULE ──────────────────────────────────────────────────

export type ScheduleKind =
  | "Milestone"
  | "Problem set"
  | "Test"
  | "Assignment"
  | "Review"
  | "Spaced review"
  | "Lecture";

export interface ScheduleItem {
  id: string;
  title: string;
  week: number;
  subject: string;
  kind: ScheduleKind;
  date: string;
  details: string;
  updatedAt: string;
}

// ─── TASK (WEEKLY BOARD) ───────────────────────────────────────

export type TaskStatus = "todo" | "completed" | "not-completed";
export type TaskType =
  | "Problem set"
  | "Test"
  | "Lecture"
  | "Assignment"
  | "Review";

export interface Task {
  id: string;
  week: number;
  title: string;
  type: TaskType;
  date: string;
  scheduleId: string;
  status: TaskStatus;
  done: boolean; // must be true before status can become "completed"
  details: string;
  updatedAt: string;
}

// ─── TEST / QUIZ ───────────────────────────────────────────────

export interface Test {
  id: string;
  title: string;
  date: string;
  sectionId?: string;
  details: string;
  updatedAt: string;
}

export interface QuizAttempt {
  id: string;
  testId: string;
  userId: string;
  date: string;
  answers: QuizAnswer[];
  score: number;
}

export interface QuizAnswer {
  questionId: string;
  selectedOptionId: string;
  isCorrect: boolean;
  targetConcept: string;
  prereqsUsed: string[];
}

// ─── REVIEW QUIZ (CONCEPT GRAPH BACKED) ────────────────────────

export interface ReviewQuiz {
  id: string;
  sectionId: string;
  questions: Question[];
  conceptGraph: ConceptGraph;
}

export interface Question {
  id: string;
  kind: "multiple-choice" | "short-answer" | "proof";
  prompt: string;
  options?: QuestionOption[];
  correctOptionId?: string;
  metadata: QuestionMetadata;
}

export interface QuestionOption {
  id: string;
  text: string;
}

export interface QuestionMetadata {
  targetConcept: string;
  prereqsUsed: string[];
  difficulty: "easy" | "medium" | "hard";
  gateWeight: number; // 0-100 importance for GATE exam
}

export interface ConceptGraph {
  chapterId: string;
  nodes: Record<string, ConceptNode>;
  fallbackConcepts: string[];
  fallbackDifficultyMix: [number, number, number]; // easy, medium, hard counts
  fallbackInstruction: string;
  stableNextAction: string;
  repairMaterial: Record<string, RepairMaterial>;
}

export interface ConceptNode {
  label: string;
  prereqs: string[];
  mastered: boolean;
}

export interface RepairMaterial {
  conceptId: string;
  explanation: string;
  examples: string[];
  practiceProblems: string[];
}

// ─── FEEDBACK ──────────────────────────────────────────────────

export interface Feedback {
  id: string;
  title: string;
  date: string;
  details: string;
  updatedAt: string;
}

// ─── RESOURCE ──────────────────────────────────────────────────

export interface Resource {
  id: string;
  title: string;
  url: string;
  type: "video" | "pdf" | "article" | "link";
  subjectId?: string;
}

// ─── PATTERN WORKSPACE ─────────────────────────────────────────

export interface PatternWorkspace {
  id: string;
  patternId: string;
  title: string;
  description: string;
  checklist: string[];
  submissions: PatternSubmission[];
}

export interface PatternSubmission {
  id: string;
  patternId: string;
  userId: string;
  date: string;
  content: string;
  notes: string;
}

export interface MaterialWorkspace {
  id: string;
  materialId: string;
  title: string;
  problems: Problem[];
  answerSummary: AnswerSummaryItem[];
}

// ─── PROBLEM SET CONTENT ───────────────────────────────────────

export type ProblemLabel =
  | "concept"
  | "mechanic"
  | "integration"
  | "application"
  | "challenge"
  | "hidden"
  | "isi";

export interface Problem {
  id: string;
  number: number;
  title: string;
  statement: string; // supports KaTeX math
  labels: ProblemLabel[];
  tags: string[];
  estimatedMinutes: number;
  solution: string; // hidden by default, supports KaTeX
}

export interface AnswerSummaryItem {
  problemNumber: number;
  answer: string;
  method: string;
}

// ─── CHAPTER CONTENT STRUCTURE ─────────────────────────────────

export interface Chapter {
  id: string;
  subjectId: string;
  number: number;
  title: string;
  sections: ChapterSection[];
}

export interface ChapterSection {
  id: string;
  kind:
    | "section-preview"
    | "preview-activity"
    | "core-ideas"
    | "problem-solving-techniques"
    | "reading-questions"
    | "labelled-practice-problems"
    | "conceptual-review"
    | "chapter-summary";
  title: string;
  content: string; // markdown / html with KaTeX
  problems?: Problem[];
}

// ─── WORKSPACE STATE (CLIENT) ──────────────────────────────────

export interface WorkspaceState {
  user: User;
  subjects: Subject[];
  schedule: ScheduleItem[];
  tests: Test[];
  quizAttempts: QuizAttempt[];
  patternSubmissions: PatternSubmission[];
  feedback: Feedback[];
  resources: Resource[];
  tasks: Task[];
  accountTypes: AccountTypeConfig[];
  enrollments: Enrollment[];
  lessonPlans: LessonPlan[];
  gateDaSections: Section[];
  coursePlanVersion: string;
}

export interface AccountTypeConfig {
  id: AccountType;
  label: string;
  description: string;
  features: string[];
}
