import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import {
  courses as staticCourses,
  getCourseBySlug as staticGetCourseBySlug,
  getSectionBySlug as staticGetSectionBySlug,
  getNextSection as staticGetNextSection,
  getPreviousSection as staticGetPreviousSection,
} from "@/lib/courses/data";
import type { Course, Chapter, Section, Problem, QuizQuestion } from "@/lib/courses/data";

// ---------------------------------------------------------------------------
// Fallback helpers
// ---------------------------------------------------------------------------

function hasSupabaseConfig() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

function handleError(err: unknown, label: string) {
  console.error(`[db] ${label} failed, using static fallback:`, err);
}

// ---------------------------------------------------------------------------
// DB row types (minimal)
// ---------------------------------------------------------------------------

type DbCourse = {
  id: string;
  slug: string;
  title: string;
  tagline?: string | null;
  duration?: string | null;
  difficulty?: string | null;
};

type DbSubject = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  order_index: number;
  outcomes: string[] | null;
  prerequisites: string[] | null;
  course: DbCourse | null;
  chapters: DbChapter[] | null;
};

type DbChapter = {
  id: string;
  slug: string;
  number: number;
  title: string;
  description: string | null;
  sections: DbSection[] | null;
};

type DbTask = {
  id: string;
  label: Problem["label"];
  statement: string;
  answer: string;
  solution: string;
  hints: string[] | null;
  order_index: number;
  concept_id: string | null;
  concept_name: string | null;
};

type DbQuizQuestion = {
  id: string;
  prompt: string;
  format: QuizQuestion["format"];
  options: { id: string; text: string }[] | null;
  correct_answer: string;
  explanation: string | null;
  order_index: number;
  concept_id: string | null;
  concept_name: string | null;
};

type DbQuiz = {
  id: string;
  passing_score: number;
  quiz_questions: DbQuizQuestion[] | null;
};

type DbSection = {
  id: string;
  slug: string;
  title: string;
  type: Section["type"];
  order_index: number;
  estimated_minutes: number;
  content: string;
  reading_questions: { question: string; hint: string }[] | null;
  is_locked: boolean;
  tasks: DbTask[] | null;
  quizzes: DbQuiz[] | null;
};

// ---------------------------------------------------------------------------
// Mapping
// ---------------------------------------------------------------------------

function mapQuizQuestion(q: DbQuizQuestion): QuizQuestion {
  return {
    id: q.id,
    prompt: q.prompt,
    format: q.format,
    options: q.options ?? undefined,
    correctAnswer: q.correct_answer,
    explanation: q.explanation ?? "",
    conceptId: q.concept_id ?? undefined,
    conceptName: q.concept_name ?? undefined,
  };
}

function mapTask(t: DbTask): Problem {
  return {
    id: t.id,
    label: t.label,
    statement: t.statement,
    answer: t.answer,
    solution: t.solution,
    hints: t.hints ?? undefined,
    conceptId: t.concept_id ?? undefined,
    conceptName: t.concept_name ?? undefined,
  };
}

function mapSection(s: DbSection): Section {
  const quiz = s.quizzes?.[0];
  return {
    id: s.id,
    slug: s.slug,
    title: s.title,
    type: s.type,
    estimatedMinutes: s.estimated_minutes,
    content: s.content,
    readingQuestions: s.reading_questions ?? undefined,
    problems: (s.tasks ?? [])
      .slice()
      .sort((a, b) => a.order_index - b.order_index)
      .map(mapTask),
    quiz: quiz
      ? quiz.quiz_questions
          ?.slice()
          .sort((a, b) => a.order_index - b.order_index)
          .map(mapQuizQuestion) ?? []
      : undefined,
    isLocked: s.is_locked,
  };
}

function mapChapter(ch: DbChapter): Chapter {
  return {
    id: ch.id,
    slug: ch.slug,
    number: ch.number,
    title: ch.title,
    description: ch.description ?? "",
    sections: (ch.sections ?? [])
      .slice()
      .sort((a, b) => a.order_index - b.order_index)
      .map(mapSection),
  };
}

function mapSubjectToCourse(row: DbSubject): Course {
  const courseMeta = row.course;
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    tagline: row.description ?? courseMeta?.tagline ?? row.title,
    exam: "GATE DA",
    difficulty: courseMeta?.difficulty ?? "Beginner to Intermediate",
    duration: courseMeta?.duration ?? "",
    chapters: (row.chapters ?? [])
      .slice()
      .sort((a, b) => a.number - b.number)
      .map(mapChapter),
    outcomes: row.outcomes ?? [],
    prerequisites: row.prerequisites ?? [],
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

async function _fetchCourses(): Promise<Course[]> {
  if (!hasSupabaseConfig()) return staticCourses;

  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("subjects")
      .select(
        `
        *,
        course:course_id (id, slug, title, tagline, duration, difficulty),
        chapters (*, sections (*, tasks (*), quizzes (*, quiz_questions (*))))
      `
      )
      .order("order_index");

    if (error) throw error;
    if (!data) return staticCourses;

    return data.map((row) => mapSubjectToCourse(row as DbSubject));
  } catch (err) {
    handleError(err, "getCourses");
    return staticCourses;
  }
}

async function _fetchCourseBySlug(slug: string): Promise<Course | null> {
  if (!hasSupabaseConfig()) return staticGetCourseBySlug(slug) ?? null;

  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("subjects")
      .select(
        `
        *,
        course:course_id (id, slug, title, tagline, duration, difficulty),
        chapters (*, sections (*, tasks (*), quizzes (*, quiz_questions (*))))
      `
      )
      .eq("slug", slug)
      .single();

    if (error) throw error;
    if (!data) return null;

    return mapSubjectToCourse(data as DbSubject);
  } catch (err) {
    handleError(err, `getCourseBySlug(${slug})`);
    return staticGetCourseBySlug(slug) ?? null;
  }
}

export const getCourses = unstable_cache(_fetchCourses, ["courses"], {
  tags: ["courses"],
});

export const getCourseBySlug = unstable_cache(
  _fetchCourseBySlug,
  ["course"],
  { tags: ["courses"] }
);

export async function getSectionBySlug(
  courseSlug: string,
  chapterSlug: string,
  sectionSlug: string
): Promise<{ course: Course; chapter: Chapter; section: Section } | null> {
  if (!hasSupabaseConfig()) {
    return staticGetSectionBySlug(courseSlug, chapterSlug, sectionSlug) ?? null;
  }

  const course = await getCourseBySlug(courseSlug);
  if (!course) return null;

  const chapter = course.chapters.find((ch) => ch.slug === chapterSlug);
  if (!chapter) return null;

  const section = chapter.sections.find((s) => s.slug === sectionSlug);
  if (!section) return null;

  return { course, chapter, section };
}

export async function getNextSection(
  courseSlug: string,
  chapterSlug: string,
  sectionSlug: string
): Promise<{ chapterSlug: string; sectionSlug: string; sectionId: string } | null> {
  const course = await getCourseBySlug(courseSlug);
  if (!course) return staticGetNextSection(courseSlug, chapterSlug, sectionSlug) ?? null;

  const chapter = course.chapters.find((ch) => ch.slug === chapterSlug);
  if (!chapter) return staticGetNextSection(courseSlug, chapterSlug, sectionSlug) ?? null;

  const sectionIndex = chapter.sections.findIndex((s) => s.slug === sectionSlug);
  if (sectionIndex === -1) return staticGetNextSection(courseSlug, chapterSlug, sectionSlug) ?? null;

  const nextInChapter = chapter.sections[sectionIndex + 1];
  if (nextInChapter) {
    return { chapterSlug: chapter.slug, sectionSlug: nextInChapter.slug, sectionId: nextInChapter.id };
  }

  const nextChapter = course.chapters.find((ch) => ch.number === chapter.number + 1);
  if (nextChapter && nextChapter.sections[0]) {
    return {
      chapterSlug: nextChapter.slug,
      sectionSlug: nextChapter.sections[0].slug,
      sectionId: nextChapter.sections[0].id,
    };
  }

  return null;
}

export async function getPreviousSection(
  courseSlug: string,
  chapterSlug: string,
  sectionSlug: string
): Promise<{ chapterSlug: string; sectionSlug: string; sectionId: string } | null> {
  const course = await getCourseBySlug(courseSlug);
  if (!course) return staticGetPreviousSection(courseSlug, chapterSlug, sectionSlug) ?? null;

  const chapter = course.chapters.find((ch) => ch.slug === chapterSlug);
  if (!chapter) return staticGetPreviousSection(courseSlug, chapterSlug, sectionSlug) ?? null;

  const sectionIndex = chapter.sections.findIndex((s) => s.slug === sectionSlug);
  if (sectionIndex === -1) return staticGetPreviousSection(courseSlug, chapterSlug, sectionSlug) ?? null;

  const prevInChapter = chapter.sections[sectionIndex - 1];
  if (prevInChapter) {
    return {
      chapterSlug: chapter.slug,
      sectionSlug: prevInChapter.slug,
      sectionId: prevInChapter.id,
    };
  }

  const prevChapter = course.chapters.find((ch) => ch.number === chapter.number - 1);
  if (prevChapter && prevChapter.sections[prevChapter.sections.length - 1]) {
    const last = prevChapter.sections[prevChapter.sections.length - 1];
    return { chapterSlug: prevChapter.slug, sectionSlug: last.slug, sectionId: last.id };
  }

  return null;
}
