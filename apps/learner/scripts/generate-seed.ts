import { randomUUID } from "crypto";
import { writeFile } from "fs/promises";
import { courses } from "../src/lib/courses/data";

function escapeSql(value: unknown): string {
  if (value === null || value === undefined) return "null";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number") return String(value);
  if (Array.isArray(value)) {
    const items = value.map(escapeSql).join(",");
    return `array[${items}]::text[]`;
  }
  const str = String(value);
  return `'${str.replace(/'/g, "''").replace(/\\/g, "\\\\")}'`;
}

function jsonb(value: unknown): string {
  return `${escapeSql(JSON.stringify(value))}::jsonb`;
}

const examId = randomUUID();
const courseId = randomUUID();

const lines: string[] = [];
lines.push("-- Generated seed for aleph v2");
lines.push("-- Run after 0001_schema.sql");
lines.push("");
lines.push("begin;");
lines.push("");

lines.push(`insert into exams (id, slug, title, description) values (${escapeSql(examId)}, ${escapeSql("gate-da")}, ${escapeSql("GATE DA")}, ${escapeSql("Graduate Aptitude Test in Engineering - Data Science and Artificial Intelligence.")});`);

for (const course of courses) {
  lines.push(`\ninsert into courses (id, exam_id, slug, title, tagline, duration, difficulty) values (${escapeSql(courseId)}, ${escapeSql(examId)}, ${escapeSql(course.slug)}, ${escapeSql(course.title)}, ${escapeSql(course.tagline)}, ${escapeSql(course.duration)}, ${escapeSql(course.difficulty)});`);

  const subjectId = randomUUID();
  lines.push(`insert into subjects (id, course_id, slug, title, description, order_index, outcomes, prerequisites) values (${escapeSql(subjectId)}, ${escapeSql(courseId)}, ${escapeSql(course.slug)}, ${escapeSql(course.title)}, ${escapeSql(course.tagline)}, 0, ${escapeSql(course.outcomes)}, ${escapeSql(course.prerequisites)});`);

  for (const chapter of course.chapters) {
    const chapterId = randomUUID();
    lines.push(`insert into chapters (id, subject_id, slug, number, title, description) values (${escapeSql(chapterId)}, ${escapeSql(subjectId)}, ${escapeSql(chapter.slug)}, ${chapter.number}, ${escapeSql(chapter.title)}, ${escapeSql(chapter.description)});`);

    for (let sIdx = 0; sIdx < chapter.sections.length; sIdx++) {
      const section = chapter.sections[sIdx];
      const sectionId = randomUUID();
      lines.push(`insert into sections (id, chapter_id, slug, title, type, order_index, estimated_minutes, content, reading_questions, is_locked) values (${escapeSql(sectionId)}, ${escapeSql(chapterId)}, ${escapeSql(section.slug)}, ${escapeSql(section.title)}, ${escapeSql(section.type)}, ${sIdx}, ${section.estimatedMinutes}, ${escapeSql(section.content)}, ${jsonb(section.readingQuestions ?? [])}, ${section.isLocked ?? false});`);

      for (let tIdx = 0; tIdx < (section.problems?.length ?? 0); tIdx++) {
        const task = section.problems![tIdx];
        lines.push(`insert into tasks (id, section_id, label, statement, answer, solution, hints, order_index, concept_id, concept_name) values (${escapeSql(randomUUID())}, ${escapeSql(sectionId)}, ${escapeSql(task.label)}, ${escapeSql(task.statement)}, ${escapeSql(task.answer)}, ${escapeSql(task.solution)}, ${escapeSql(task.hints ?? [])}, ${tIdx}, ${escapeSql(task.conceptId ?? null)}, ${escapeSql(task.conceptName ?? null)});`);
      }

      if (section.quiz && section.quiz.length > 0) {
        const quizId = randomUUID();
        lines.push(`insert into quizzes (id, section_id, passing_score, time_limit_minutes) values (${escapeSql(quizId)}, ${escapeSql(sectionId)}, 70, null);`);

        for (let qIdx = 0; qIdx < section.quiz.length; qIdx++) {
          const q = section.quiz[qIdx];
          lines.push(`insert into quiz_questions (id, quiz_id, prompt, format, options, correct_answer, explanation, order_index, concept_id, concept_name) values (${escapeSql(randomUUID())}, ${escapeSql(quizId)}, ${escapeSql(q.prompt)}, ${escapeSql(q.format)}, ${jsonb(q.options ?? [])}, ${escapeSql(q.correctAnswer)}, ${escapeSql(q.explanation)}, ${qIdx}, ${escapeSql(q.conceptId ?? null)}, ${escapeSql(q.conceptName ?? null)});`);
        }
      }
    }
  }
}

lines.push("");
lines.push("commit;");
lines.push("");

async function main() {
  const seed = lines.join("\n");
  await writeFile("supabase/seed.sql", seed);
  console.log("Generated supabase/seed.sql");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
