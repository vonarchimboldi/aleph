"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { SectionType, TaskLabel, QuestionFormat } from "./types";

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
