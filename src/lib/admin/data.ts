import { createClient } from "@/lib/supabase/server";
import type { Exam, Course, Subject, Chapter, Section, Task, Quiz, QuizQuestion } from "./types";

export async function getExams(): Promise<Exam[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("exams")
    .select("*")
    .order("title");
  if (error) throw error;
  return data || [];
}

export async function getExamById(id: string): Promise<Exam | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("exams").select("*").eq("id", id).single();
  if (error) return null;
  return data;
}

export async function getCourses(): Promise<Course[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("courses")
    .select("*, exams!inner(title)")
    .order("title");
  if (error) throw error;
  return data || [];
}

export async function getCourseById(id: string): Promise<Course | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("courses").select("*").eq("id", id).single();
  if (error) return null;
  return data;
}

export async function getSubjectsByCourse(courseId: string): Promise<Subject[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subjects")
    .select("*")
    .eq("course_id", courseId)
    .order("order_index");
  if (error) throw error;
  return data || [];
}

export async function getSubjectById(id: string): Promise<Subject | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("subjects").select("*").eq("id", id).single();
  if (error) return null;
  return data;
}

export async function getChaptersBySubject(subjectId: string): Promise<Chapter[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("chapters")
    .select("*")
    .eq("subject_id", subjectId)
    .order("number");
  if (error) throw error;
  return data || [];
}

export async function getChapterById(id: string): Promise<Chapter | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("chapters").select("*").eq("id", id).single();
  if (error) return null;
  return data;
}

export async function getSectionsByChapter(chapterId: string): Promise<Section[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sections")
    .select("*")
    .eq("chapter_id", chapterId)
    .order("order_index");
  if (error) throw error;
  return data || [];
}

export async function getSectionById(id: string): Promise<Section | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("sections").select("*").eq("id", id).single();
  if (error) return null;
  return data;
}

export async function getTasksBySection(sectionId: string): Promise<Task[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("section_id", sectionId)
    .order("order_index");
  if (error) throw error;
  return data || [];
}

export async function getQuizBySection(sectionId: string): Promise<Quiz | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("quizzes")
    .select("*")
    .eq("section_id", sectionId)
    .maybeSingle();
  if (error) return null;
  return data;
}

export async function getQuizQuestions(quizId: string): Promise<QuizQuestion[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("quiz_questions")
    .select("*")
    .eq("quiz_id", quizId)
    .order("order_index");
  if (error) throw error;
  return data || [];
}
