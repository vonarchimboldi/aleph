export type SectionType =
  | "read"
  | "concept"
  | "mechanic"
  | "integration"
  | "challenge"
  | "quiz"
  | "review"
  | "summary";

export type TaskLabel =
  | "concept"
  | "mechanic"
  | "integration"
  | "challenge"
  | "isi";

export type QuestionFormat = "mcq" | "msq" | "nat";

export interface Exam {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  month: number | null;
  year: number | null;
  is_active: boolean;
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  tagline: string | null;
  description: string | null;
  difficulty: string | null;
  duration: string | null;
  estimated_hours: number;
  is_active: boolean;
  exam_id: string;
}

export interface Subject {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  order_index: number;
  outcomes: string[];
  prerequisites: string[];
  weight_in_exam_percent: number;
  is_active: boolean;
  course_id: string;
}

export interface Chapter {
  id: string;
  slug: string;
  number: number;
  title: string;
  description: string | null;
  estimated_minutes: number;
  subject_id: string;
}

export interface Section {
  id: string;
  slug: string;
  title: string;
  type: SectionType;
  order_index: number;
  estimated_minutes: number;
  content: string;
  content_path: string | null;
  reading_questions: { question: string; hint: string }[];
  is_locked: boolean;
  chapter_id: string;
}

export interface Task {
  id: string;
  section_id: string;
  title: string | null;
  label: TaskLabel;
  statement: string;
  answer: string;
  solution: string;
  hints: string[];
  difficulty: number | null;
  estimated_minutes: number;
  order_index: number;
  concept_id: string | null;
  concept_name: string | null;
  tags: string[];
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  prompt: string;
  format: QuestionFormat;
  options: { id: string; text: string }[];
  correct_answer: string;
  explanation: string | null;
  difficulty: number | null;
  gate_weight: string | null;
  concept_id: string | null;
  concept_name: string | null;
  order_index: number;
}

export interface Quiz {
  id: string;
  section_id: string;
  passing_score: number;
  time_limit_minutes: number | null;
}
