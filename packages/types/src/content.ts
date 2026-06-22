export type SectionType =
  | "read"
  | "concept"
  | "mechanic"
  | "integration"
  | "challenge"
  | "quiz"
  | "review"
  | "summary";

export type ProblemLabel =
  | "concept"
  | "mechanic"
  | "integration"
  | "challenge"
  | "isi";

export interface Problem {
  id: string;
  label: ProblemLabel;
  statement: string;
  answer: string;
  solution: string;
  hints?: string[];
  conceptId?: string;
  conceptName?: string;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  format: "mcq" | "msq" | "nat";
  options?: { id: string; text: string }[];
  correctAnswer: string;
  explanation: string;
  conceptId?: string;
  conceptName?: string;
}

export interface ReadingQuestion {
  question: string;
  hint: string;
}

export interface Section {
  id: string;
  slug: string;
  title: string;
  type: SectionType;
  estimatedMinutes: number;
  content: string;
  readingQuestions?: ReadingQuestion[];
  problems?: Problem[];
  quiz?: QuizQuestion[];
  isLocked?: boolean;
}

export interface Chapter {
  id: string;
  slug: string;
  number: number;
  title: string;
  description: string;
  sections: Section[];
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  exam: string;
  difficulty: string;
  duration: string;
  chapters: Chapter[];
  outcomes: string[];
  prerequisites: string[];
}
