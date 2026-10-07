import postgres from "postgres";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataPath = process.env.DATA_PATH || join(__dirname, "..", "..", "aleph-main-temp-extracted", "transformed-gate-da-basic.json");

const password = process.env.DB_PASSWORD;
if (!password) {
  console.error("DB_PASSWORD env var required");
  process.exit(1);
}

const sql = postgres({
  host: "aws-1-ap-southeast-1.pooler.supabase.com",
  port: 5432,
  database: "postgres",
  username: "postgres.bkqvieebmjuyqxlgfwlf",
  password,
  ssl: "require",
  max: 1,
});

const rawData = JSON.parse(readFileSync(dataPath, "utf8"));

function sanitizeValue(v) {
  if (v === undefined) return null;
  if (v === null) return null;
  if (Array.isArray(v)) return v.map(sanitizeValue);
  if (typeof v === "object") {
    const out = {};
    for (const [k, val] of Object.entries(v)) {
      out[k] = sanitizeValue(val);
    }
    return out;
  }
  return v;
}

function sanitize(rows) {
  if (!Array.isArray(rows)) return rows;
  return rows.map((row) => {
    const out = {};
    for (const [k, v] of Object.entries(row)) {
      out[k] = sanitizeValue(v);
    }
    return out;
  });
}

const data = {
  exams: sanitize(rawData.exams),
  courses: sanitize(rawData.courses),
  subjects: sanitize(rawData.subjects),
  chapters: sanitize(rawData.chapters),
  sections: sanitize(rawData.sections),
  tasks: sanitize(rawData.tasks),
  quizzes: sanitize(rawData.quizzes),
  quiz_questions: sanitize(rawData.quiz_questions),
  resources: sanitize(rawData.resources),
};

async function main() {
  await sql.begin(async (tx) => {
    console.log("Clearing existing content tables...");
    // Delete in reverse dependency order. Child tables cascade from parents.
    await tx`delete from quiz_questions`;
    await tx`delete from quizzes`;
    await tx`delete from tasks`;
    await tx`delete from sections`;
    await tx`delete from chapters`;
    await tx`delete from subjects`;
    await tx`delete from courses`;
    await tx`delete from exams`;
    await tx`delete from resources`;

    console.log("Inserting exams...");
    if (data.exams?.length) {
      try {
        await tx`insert into exams ${tx(data.exams, "id", "slug", "title", "description", "month", "year", "is_active", "metadata", "status", "source", "external_id")}`;
      } catch (e) {
        console.error("Exams insert failed:", e.message);
        console.error("First row:", JSON.stringify(data.exams[0]));
        throw e;
      }
    }

    console.log("Inserting courses...");
    if (data.courses?.length) {
      try {
        await tx`insert into courses ${tx(data.courses, "id", "exam_id", "slug", "title", "tagline", "description", "difficulty", "duration", "estimated_hours", "is_active", "metadata", "content_format", "access_tier", "status", "source", "external_id")}`;
      } catch (e) {
        console.error("Courses insert failed:", e.message);
        console.error("First row:", JSON.stringify(data.courses[0]));
        throw e;
      }
    }

    console.log("Inserting subjects...");
    if (data.subjects?.length) {
      await tx`insert into subjects ${tx(data.subjects, "id", "course_id", "slug", "title", "description", "order_index", "outcomes", "prerequisites", "weight_in_exam_percent", "is_active", "metadata", "content_format", "access_tier", "status", "source", "external_id")}`;
    }

    console.log("Inserting chapters...");
    if (data.chapters?.length) {
      await tx`insert into chapters ${tx(data.chapters, "id", "subject_id", "slug", "number", "title", "description", "estimated_minutes", "metadata", "access_tier", "status", "source", "external_id")}`;
    }

    console.log("Inserting sections...");
    if (data.sections?.length) {
      await tx`insert into sections ${tx(data.sections, "id", "chapter_id", "slug", "title", "type", "order_index", "estimated_minutes", "content", "reading_questions", "is_locked", "metadata", "content_format", "access_tier", "status", "source", "external_id")}`;
    }

    console.log("Inserting tasks...");
    if (data.tasks?.length) {
      await tx`insert into tasks ${tx(data.tasks, "id", "section_id", "title", "label", "statement", "answer", "solution", "hints", "difficulty", "estimated_minutes", "order_index", "concept_id", "concept_name", "tags", "metadata", "status", "source", "external_id")}`;
    }

    console.log("Inserting quizzes...");
    if (data.quizzes?.length) {
      await tx`insert into quizzes ${tx(data.quizzes, "id", "section_id", "passing_score", "time_limit_minutes", "metadata", "status", "source", "external_id")}`;
    }

    console.log("Inserting quiz questions...");
    if (data.quiz_questions?.length) {
      await tx`insert into quiz_questions ${tx(data.quiz_questions, "id", "quiz_id", "prompt", "format", "options", "correct_answer", "explanation", "difficulty", "gate_weight", "concept_id", "concept_name", "order_index", "metadata", "status", "source", "external_id")}`;
    }

    console.log("Inserting resources...");
    if (data.resources?.length) {
      await tx`insert into resources ${tx(data.resources, "exam_id", "course_id", "subject_id", "chapter_id", "title", "description", "url", "type", "tags", "order_index", "is_active", "metadata", "status", "source", "external_id")}`;
    }
  });

  console.log("Load complete.");
  console.log("  exams:", data.exams?.length);
  console.log("  courses:", data.courses?.length);
  console.log("  subjects:", data.subjects?.length);
  console.log("  chapters:", data.chapters?.length);
  console.log("  sections:", data.sections?.length);
  console.log("  tasks:", data.tasks?.length);
  console.log("  quizzes:", data.quizzes?.length);
  console.log("  quiz_questions:", data.quiz_questions?.length);
  console.log("  resources:", data.resources?.length);
}

main().catch((err) => {
  console.error("Load failed:", err.message);
  process.exit(1);
}).finally(async () => {
  await sql.end();
});
