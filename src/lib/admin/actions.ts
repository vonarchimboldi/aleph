"use server";

import { revalidatePath } from "next/cache";
import fs from "fs";
import path from "path";
import { createClient } from "@/lib/supabase/server";
import type { SectionType, TaskLabel, QuestionFormat } from "./types";

const DSA_BASE_PATH = "/Users/akshat/Documents/Code/Personal/aleph-main-temp/DSA For GATE practice/month-01";

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

export async function createExam(formData: FormData) {
  const supabase = await createClient();
  const title = formData.get("title") as string;
  const month = parseInt(formData.get("month") as string) || null;
  const year = parseInt(formData.get("year") as string) || null;

  const { data, error } = await supabase
    .from("exams")
    .insert({
      slug: slugify(title),
      title,
      month,
      year,
    })
    .select("id")
    .single();

  if (error) throw error;
  revalidatePath("/courses");
  return data.id;
}

export async function createCourse(formData: FormData) {
  const supabase = await createClient();
  const title = formData.get("title") as string;

  const { data, error } = await supabase
    .from("courses")
    .insert({
      exam_id: formData.get("exam_id") as string,
      slug: slugify(title),
      title,
      tagline: (formData.get("tagline") as string) || null,
      description: (formData.get("description") as string) || null,
      difficulty: (formData.get("difficulty") as string) || null,
      duration: (formData.get("duration") as string) || null,
      estimated_hours: parseInt(formData.get("estimated_hours") as string) || 0,
    })
    .select("id")
    .single();

  if (error) throw error;
  revalidatePath("/courses");
  return data.id;
}

export async function createSubject(formData: FormData) {
  const supabase = await createClient();
  const title = formData.get("title") as string;

  const { data, error } = await supabase
    .from("subjects")
    .insert({
      course_id: formData.get("course_id") as string,
      slug: slugify(title),
      title,
      description: (formData.get("description") as string) || null,
      order_index: parseInt(formData.get("order_index") as string) || 0,
      outcomes: parseStringArray(formData.get("outcomes") as string),
      prerequisites: parseStringArray(formData.get("prerequisites") as string),
      weight_in_exam_percent: parseInt(formData.get("weight_in_exam_percent") as string) || 0,
    })
    .select("id")
    .single();

  if (error) throw error;
  revalidatePath(`/courses/${formData.get("course_id")}`);
  return data.id;
}

export async function createChapter(formData: FormData) {
  const supabase = await createClient();
  const title = formData.get("title") as string;

  const { data, error } = await supabase
    .from("chapters")
    .insert({
      subject_id: formData.get("subject_id") as string,
      slug: slugify(title),
      title,
      number: parseInt(formData.get("number") as string) || 1,
      description: (formData.get("description") as string) || null,
      estimated_minutes: parseInt(formData.get("estimated_minutes") as string) || 0,
    })
    .select("id")
    .single();

  if (error) throw error;
  revalidatePath(`/subjects/${formData.get("subject_id")}`);
  return data.id;
}

export async function createSection(formData: FormData) {
  const supabase = await createClient();
  const title = formData.get("title") as string;
  const type = formData.get("type") as SectionType;

  const { data, error } = await supabase
    .from("sections")
    .insert({
      chapter_id: formData.get("chapter_id") as string,
      slug: slugify(title),
      title,
      type,
      order_index: parseInt(formData.get("order_index") as string) || 0,
      estimated_minutes: parseInt(formData.get("estimated_minutes") as string) || 0,
      content: (formData.get("content") as string) || "",
      content_path: (formData.get("content_path") as string) || null,
      is_locked: formData.get("is_locked") === "on",
    })
    .select("id")
    .single();

  if (error) throw error;
  revalidatePath(`/chapters/${formData.get("chapter_id")}`);
  return data.id;
}

export async function createTask(formData: FormData) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      section_id: formData.get("section_id") as string,
      title: (formData.get("title") as string) || null,
      label: formData.get("label") as TaskLabel,
      statement: formData.get("statement") as string,
      answer: formData.get("answer") as string,
      solution: formData.get("solution") as string,
      hints: parseStringArray(formData.get("hints") as string),
      difficulty: parseInt(formData.get("difficulty") as string) || null,
      estimated_minutes: parseInt(formData.get("estimated_minutes") as string) || 0,
      concept_id: (formData.get("concept_id") as string) || null,
      concept_name: (formData.get("concept_name") as string) || null,
      tags: parseStringArray(formData.get("tags") as string),
      order_index: parseInt(formData.get("order_index") as string) || 0,
    })
    .select("id")
    .single();

  if (error) throw error;
  revalidatePath(`/sections/${formData.get("section_id")}`);
  return data.id;
}

export async function createQuizQuestion(formData: FormData) {
  const supabase = await createClient();
  const sectionId = formData.get("section_id") as string;

  // Ensure quiz exists for this section
  let { data: quiz } = await supabase
    .from("quizzes")
    .select("id")
    .eq("section_id", sectionId)
    .maybeSingle();

  if (!quiz) {
    const { data: newQuiz, error: quizError } = await supabase
      .from("quizzes")
      .insert({
        section_id: sectionId,
        passing_score: parseInt(formData.get("passing_score") as string) || 70,
        time_limit_minutes: parseInt(formData.get("time_limit_minutes") as string) || null,
      })
      .select("id")
      .single();
    if (quizError) throw quizError;
    quiz = newQuiz;
  }

  const { data, error } = await supabase
    .from("quiz_questions")
    .insert({
      quiz_id: quiz!.id,
      prompt: formData.get("prompt") as string,
      format: formData.get("format") as QuestionFormat,
      options: parseOptions(formData.get("options") as string),
      correct_answer: formData.get("correct_answer") as string,
      explanation: (formData.get("explanation") as string) || null,
      difficulty: parseInt(formData.get("difficulty") as string) || null,
      gate_weight: (formData.get("gate_weight") as string) || null,
      concept_id: (formData.get("concept_id") as string) || null,
      concept_name: (formData.get("concept_name") as string) || null,
      order_index: parseInt(formData.get("order_index") as string) || 0,
    })
    .select("id")
    .single();

  if (error) throw error;
  revalidatePath(`/sections/${sectionId}`);
  return data.id;
}

function parseStringArray(value: string | null): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseOptions(value: string | null): { id: string; text: string }[] {
  if (!value) return [];
  return value
    .split("\n")
    .map((line, idx) => ({
      id: String.fromCharCode(97 + idx),
      text: line.trim(),
    }))
    .filter((o) => o.text);
}


export async function enrollStudent(formData: FormData) {
  const supabase = await createClient();
  const userId = formData.get("user_id") as string;
  const subjectId = formData.get("subject_id") as string;

  const { error } = await supabase.from("enrollments").insert({
    user_id: userId,
    subject_id: subjectId,
    status: "active",
    progress_percentage: 0,
  });

  if (error) throw error;
  revalidatePath(`/students/${userId}`);
}

export async function unenrollStudent(formData: FormData) {
  const supabase = await createClient();
  const enrollmentId = formData.get("enrollment_id") as string;
  const userId = formData.get("user_id") as string;

  const { error } = await supabase.from("enrollments").delete().eq("id", enrollmentId);

  if (error) throw error;
  revalidatePath(`/students/${userId}`);
}

interface CourseBundlePayload {
  examChoice: "new" | string;
  examTitle?: string;
  examMonth?: string;
  examYear?: string;
  course: {
    title: string;
    tagline?: string;
    description?: string;
    difficulty?: string;
    duration?: string;
    estimated_hours?: string;
  };
  subject: {
    title: string;
    description?: string;
  };
  chapters: {
    title: string;
    slug?: string;
    description?: string;
    estimated_minutes?: number;
    sections: {
      title: string;
      slug?: string;
      type: SectionType;
      estimated_minutes?: number;
      content: string;
    }[];
  }[];
  isActive: boolean;
}

interface DsaSectionSpec {
  title: string;
  type: SectionType;
  file?: string;
  minutes?: number;
}

interface DsaChapterSpec {
  slug: string;
  title: string;
  number: number;
  sections: DsaSectionSpec[];
}

const dsaChapterSpecs: DsaChapterSpec[] = [
  {
    slug: "dsa-practice-month-1-overview",
    title: "Month 1 Overview",
    number: 14,
    sections: [
      { title: "Month 1 guided path", type: "read", file: "FOUR_WEEK_PATH.md" },
    ],
  },
  {
    slug: "dsa-practice-week-1-search-sort",
    title: "Week 1: Search & Sort",
    number: 15,
    sections: [
      { title: "Week 1 overview", type: "summary" },
      { title: "Day 1: Searching, Sorting, and the Power of Order", type: "read", file: "day-01-searching-sorting.md", minutes: 120 },
      { title: "Day 2: Binary Search and Boundaries", type: "read", file: "day-02-binary-search-boundaries.md", minutes: 120 },
      { title: "Day 2 brief", type: "summary", file: "day-02-brief.md" },
    ],
  },
  {
    slug: "dsa-practice-week-2-problem-ladder",
    title: "Week 2: Problem Ladder",
    number: 16,
    sections: [
      { title: "Week 2 rules", type: "read", file: "problem-ladder-week-2026-09-14.md" },
      { title: "Day 1 problem ladder", type: "challenge", file: "problem-ladder-day-01.md", minutes: 120 },
      { title: "Day 2 problem ladder", type: "challenge", file: "problem-ladder-day-02.md", minutes: 120 },
      { title: "Day 3 problem ladder", type: "challenge", file: "problem-ladder-day-03.md", minutes: 120 },
      { title: "Day 4 problem ladder", type: "challenge", file: "problem-ladder-day-04.md", minutes: 120 },
      { title: "Day 5 problem ladder", type: "challenge", file: "problem-ladder-day-05.md", minutes: 120 },
    ],
  },
  {
    slug: "dsa-practice-week-4-insight-ladder",
    title: "Week 4: Insight Ladder",
    number: 17,
    sections: [
      { title: "Week 4 rules", type: "read", file: "insight-ladder-week-2026-09-21.md" },
      { title: "Day 1 insight ladder", type: "challenge", file: "insight-ladder-day-01.md", minutes: 120 },
      { title: "Day 2 insight ladder", type: "challenge", file: "insight-ladder-day-02.md", minutes: 120 },
      { title: "Day 3 insight ladder", type: "challenge", file: "insight-ladder-day-03.md", minutes: 120 },
      { title: "Day 4 insight ladder", type: "challenge", file: "insight-ladder-day-04.md", minutes: 120 },
      { title: "Day 5 insight ladder", type: "challenge", file: "insight-ladder-day-05.md", minutes: 120 },
    ],
  },
];

export async function importDsaPracticeAction() {
  const supabase = await createClient();

  const { data: subject } = await supabase
    .from("subjects")
    .select("id")
    .eq("slug", "data-structures-and-algorithms")
    .single();

  if (!subject) {
    throw new Error("Subject 'data-structures-and-algorithms' not found");
  }

  // Idempotency: remove previously imported month-1 DSA practice chapters.
  const chapterSlugs = dsaChapterSpecs.map((c) => c.slug);
  const { data: existingChapters } = await supabase
    .from("chapters")
    .select("id")
    .eq("subject_id", subject.id)
    .in("slug", chapterSlugs);

  const existingIds = existingChapters?.map((c) => c.id) ?? [];
  if (existingIds.length > 0) {
    await supabase.from("chapters").delete().in("id", existingIds);
  }

  let chaptersCreated = 0;
  let sectionsCreated = 0;

  for (const chapterSpec of dsaChapterSpecs) {
    const { data: chapter, error: chapterError } = await supabase
      .from("chapters")
      .insert({
        subject_id: subject.id,
        slug: chapterSpec.slug,
        number: chapterSpec.number,
        title: chapterSpec.title,
        description: null,
        estimated_minutes: 0,
      })
      .select("id")
      .single();

    if (chapterError || !chapter) {
      throw chapterError ?? new Error(`Failed to create chapter ${chapterSpec.title}`);
    }

    chaptersCreated++;

    const sectionsPayload = [];
    for (let i = 0; i < chapterSpec.sections.length; i++) {
      const sec = chapterSpec.sections[i];
      let content = "";

      if (sec.file) {
        const filePath = path.join(DSA_BASE_PATH, sec.file);
        if (fs.existsSync(filePath)) {
          // Store raw markdown — the learner app renders it. Pre-rendering
          // here was double work and stored HTML that audits flagged.
          content = fs.readFileSync(filePath, "utf8");
        }
      }

      sectionsPayload.push({
        chapter_id: chapter.id,
        slug: slugify(sec.title),
        title: sec.title,
        type: sec.type,
        order_index: i,
        estimated_minutes: sec.minutes ?? 0,
        content,
        is_locked: false,
      });
    }

    if (sectionsPayload.length > 0) {
      const { error: sectionsError } = await supabase.from("sections").insert(sectionsPayload);
      if (sectionsError) throw sectionsError;
      sectionsCreated += sectionsPayload.length;
    }
  }

  revalidatePath("/courses");
  revalidatePath("/bulk-import/dsa-practice");
  return { chaptersCreated, sectionsCreated };
}

export async function uploadResourceAction(formData: FormData) {
  const supabase = await createClient();

  const file = formData.get("file") as File | null;
  const title = (formData.get("title") as string)?.trim();
  const type = (formData.get("type") as string) || "pdf";
  const description = (formData.get("description") as string)?.trim() || null;
  const courseId = (formData.get("course_id") as string) || null;
  const subjectId = (formData.get("subject_id") as string) || null;

  if (!file || file.size === 0) {
    throw new Error("A file is required");
  }
  if (!title) {
    throw new Error("Title is required");
  }

  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const path = `${Date.now()}-${crypto.randomUUID()}-${sanitizedName}`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("resources-public")
    .upload(path, file, { contentType: file.type || "application/octet-stream" });

  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage
    .from("resources-public")
    .getPublicUrl(uploadData.path);

  const { data, error } = await supabase
    .from("resources")
    .insert({
      title,
      description,
      url: urlData.publicUrl,
      type,
      course_id: courseId,
      subject_id: subjectId,
      order_index: parseInt(formData.get("order_index") as string) || 0,
      is_active: true,
    })
    .select("id")
    .single();

  if (error) throw error;

  revalidatePath("/resources");
  revalidatePath("/resources/new");
  return data.id as string;
}

export async function createCourseBundleAction(formData: FormData) {
  const supabase = await createClient();
  const payloadRaw = formData.get("payload") as string;

  if (!payloadRaw) {
    throw new Error("Missing bundle payload");
  }

  let payload: CourseBundlePayload;
  try {
    payload = JSON.parse(payloadRaw);
  } catch {
    throw new Error("Invalid bundle payload");
  }

  // Resolve exam id (create a new exam if requested)
  let examId = payload.examChoice;
  if (examId === "new") {
    const title = payload.examTitle?.trim();
    if (!title) {
      throw new Error("Exam title is required");
    }

    const { data: exam, error } = await supabase
      .from("exams")
      .insert({
        slug: slugify(title),
        title,
        month: payload.examMonth ? parseInt(payload.examMonth) : null,
        year: payload.examYear ? parseInt(payload.examYear) : null,
        is_active: true,
      })
      .select("id")
      .single();

    if (error) throw error;
    if (!exam) throw new Error("Failed to create exam");
    examId = exam.id;
  }

  const courseSlug = slugify(payload.course.title);
  const subjectSlug = slugify(payload.subject.title);

  const chaptersPayload = payload.chapters.map((chapter, chapterIdx) => ({
    slug: chapter.slug?.trim() || slugify(chapter.title),
    number: chapterIdx + 1,
    title: chapter.title.trim(),
    description: chapter.description?.trim() || null,
    estimated_minutes: chapter.estimated_minutes || 0,
    sections: chapter.sections.map((section, sectionIdx) => ({
      slug: section.slug?.trim() || slugify(section.title),
      title: section.title.trim(),
      type: section.type,
      order_index: sectionIdx,
      estimated_minutes: section.estimated_minutes || 0,
      content: section.content || "",
      is_locked: false,
    })),
  }));

  const { data: courseId, error } = await supabase.rpc("create_course_bundle", {
    p_exam_id: examId,
    p_course: {
      slug: courseSlug,
      title: payload.course.title.trim(),
      tagline: payload.course.tagline?.trim() || null,
      description: payload.course.description?.trim() || null,
      difficulty: payload.course.difficulty?.trim() || null,
      duration: payload.course.duration?.trim() || null,
      estimated_hours: parseInt(payload.course.estimated_hours || "0", 10) || 0,
      is_active: payload.isActive,
    },
    p_subject: {
      slug: subjectSlug,
      title: payload.subject.title.trim(),
      description: payload.subject.description?.trim() || null,
      order_index: 0,
      outcomes: [],
      prerequisites: [],
      weight_in_exam_percent: 0,
      is_active: payload.isActive,
    },
    p_chapters: chaptersPayload,
  });

  if (error) throw error;
  if (!courseId) throw new Error("Failed to create course bundle");

  revalidatePath("/courses");
  return courseId as string;
}

export async function assignEnrollmentAction(userId: string, subjectId: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("enrollments").insert({
    user_id: userId,
    subject_id: subjectId,
    status: "active",
    progress_percentage: 0,
  });

  if (error) throw error;
  revalidatePath(`/students/${userId}`);
}

export async function removeEnrollmentAction(enrollmentId: string, userId: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("enrollments").delete().eq("id", enrollmentId);

  if (error) throw error;
  revalidatePath(`/students/${userId}`);
}

export async function updateAccountTypeAction(userId: string, accountType: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({ account_type: accountType })
    .eq("id", userId);

  if (error) throw error;
  revalidatePath(`/students/${userId}`);
}
