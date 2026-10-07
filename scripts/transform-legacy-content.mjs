import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { createHash } from "crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
const inputDir = join(__dirname, "..", "..", "aleph-main-temp-extracted");
const outputDir = join(__dirname, "..", "..", "aleph-main-temp-extracted");

const legacySections = JSON.parse(
  readFileSync(join(inputDir, "gateDaBasicSections.json"), "utf8")
);

// Stable namespace UUID for slug-based UUID generation.
const NAMESPACE_UUID = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";

function uuidv5(name, namespace = NAMESPACE_UUID) {
  const hash = createHash("sha1");
  const nsBytes = namespace.replace(/-/g, "").match(/.{2}/g).map((b) => parseInt(b, 16));
  hash.update(Buffer.from(nsBytes));
  hash.update(name);
  const digest = hash.digest();
  digest[6] = (digest[6] & 0x0f) | 0x50; // version 5
  digest[8] = (digest[8] & 0x3f) | 0x80; // variant
  return [
    digest.slice(0, 4).toString("hex"),
    digest.slice(4, 6).toString("hex"),
    digest.slice(6, 8).toString("hex"),
    digest.slice(8, 10).toString("hex"),
    digest.slice(10, 16).toString("hex"),
  ].join("-");
}

const SUBJECT_CONFIG = {
  Probability: {
    slug: "probability",
    title: "Probability & Statistics",
    description: "Build exam-ready intuition for GATE DA and beyond.",
    outcomes: [
      "Translate word problems into precise probability models",
      "Compute conditional probabilities and apply Bayes' rule",
      "Work with random variables, expectation, and variance",
      "Solve past GATE DA problems using first principles",
    ],
    prerequisites: ["High school algebra", "Basic calculus", "Comfort with set notation"],
    duration: "10 chapters · ~40 hours",
    estimated_hours: 40,
  },
  "Linear Algebra": {
    slug: "linear-algebra",
    title: "Linear Algebra",
    description: "Matrices, vector spaces, eigenvalues, and linear systems for GATE DA.",
    outcomes: [
      "Solve systems of linear equations",
      "Work with matrices and determinants",
      "Understand eigenvalues and eigenvectors",
      "Apply linear algebra to data science problems",
    ],
    prerequisites: ["High school algebra", "Basic calculus"],
    duration: "4 chapters · ~20 hours",
    estimated_hours: 20,
  },
  "Data Structures and Algorithms": {
    slug: "data-structures-and-algorithms",
    title: "Data Structures and Algorithms",
    description: "Core DSA concepts for GATE DA.",
    outcomes: [
      "Analyze algorithm complexity",
      "Use arrays, lists, stacks, queues, trees, and graphs",
      "Apply sorting and searching techniques",
      "Solve GATE DA DSA problems",
    ],
    prerequisites: ["Programming basics", "Discrete mathematics"],
    duration: "4 chapters · ~25 hours",
    estimated_hours: 25,
  },
  "Machine Learning": {
    slug: "machine-learning",
    title: "Machine Learning",
    description: "Foundations of machine learning for GATE DA.",
    outcomes: [
      "Identify data, model, and loss for ML problems",
      "Compute regression and classification metrics",
      "Understand linear models, trees, and kNN",
      "Diagnose underfitting and overfitting",
    ],
    prerequisites: ["Probability", "Linear algebra", "Basic calculus"],
    duration: "4 chapters · ~20 hours",
    estimated_hours: 20,
  },
};

// We need async import for crypto, so wrap main logic.
async function main() {
  const examId = await uuidv5("exam:gate-da");

  const exam = {
    id: examId,
    slug: "gate-da",
    title: "GATE DA",
    description: "Graduate Aptitude Test in Engineering - Data Science and Artificial Intelligence.",
    month: null,
    year: null,
    is_active: true,
    metadata: {},
    status: "published",
    source: "aleph-main-temp",
    external_id: "exam-gate-da",
  };

  const exams = [exam];
  const courses = [];
  const subjects = [];
  const chapters = [];
  const sections = [];
  const tasks = [];
  const quizzes = [];
  const quizQuestions = [];
  const resources = [];

  for (const [subjectName, config] of Object.entries(SUBJECT_CONFIG)) {
    const courseId = await uuidv5(`course:gate-da:${config.slug}`);
    const subjectId = await uuidv5(`subject:gate-da:${config.slug}`);

    courses.push({
      id: courseId,
      exam_id: examId,
      slug: config.slug,
      title: config.title,
      tagline: config.description,
      description: config.description,
      difficulty: "Beginner to Intermediate",
      duration: config.duration,
      estimated_hours: config.estimated_hours,
      is_active: true,
      metadata: {},
      content_format: "markdown",
      access_tier: "basic",
      status: "published",
      source: "aleph-main-temp",
      external_id: `course-gate-da-${config.slug}`,
    });

    subjects.push({
      id: subjectId,
      course_id: courseId,
      slug: config.slug,
      title: config.title,
      description: config.description,
      order_index: Object.keys(SUBJECT_CONFIG).indexOf(subjectName),
      outcomes: config.outcomes,
      prerequisites: config.prerequisites,
      weight_in_exam_percent: 0,
      is_active: true,
      metadata: {},
      content_format: "markdown",
      access_tier: "basic",
      status: "published",
      source: "aleph-main-temp",
      external_id: `subject-gate-da-${config.slug}`,
    });

    const subjectLegacySections = legacySections.filter((s) => s.subject === subjectName);

    for (const legacy of subjectLegacySections) {
    const chapterNumber = parseInt(legacy.chapter.replace(/[^0-9]/g, ""), 10) || 1;
    const chapterSlug = `ch${chapterNumber}-${slugify(legacy.title)}`;
    const chapterId = await uuidv5(`chapter:gate-da:${config.slug}:${chapterSlug}`);

    chapters.push({
      id: chapterId,
      subject_id: subjectId,
      slug: chapterSlug,
      number: chapterNumber,
      title: legacy.title,
      description: legacy.summary || null,
      estimated_minutes: 0,
      metadata: { legacyId: legacy.id },
      content_format: "markdown",
      access_tier: "basic",
      status: "published",
      source: "aleph-main-temp",
      external_id: legacy.id,
    });

    let orderIndex = 0;

    // 1. Section Preview
    if (legacy.sectionPreview || legacy.previewActivity || legacy.chapterIntro) {
      const content = [
        legacy.sectionPreview ? `## Section Preview\n\n${legacy.sectionPreview}` : "",
        legacy.previewActivity ? `## Preview Activity\n\n${legacy.previewActivity}` : "",
        Array.isArray(legacy.chapterIntro) ? `## Chapter Introduction\n\n${legacy.chapterIntro.join("\n\n")}` : "",
      ]
        .filter(Boolean)
        .join("\n\n");

      sections.push({
        id: await uuidv5(`section:gate-da:${config.slug}:${chapterSlug}:section-preview`),
        chapter_id: chapterId,
        slug: "section-preview",
        title: "Section Preview",
        type: "read",
        order_index: orderIndex++,
        estimated_minutes: 5,
        content,
        reading_questions: [],
        is_locked: false,
        metadata: {},
        content_format: "markdown",
        access_tier: "basic",
        status: "published",
        source: "aleph-main-temp",
        external_id: `${legacy.id}-section-preview`,
      });
    }

    // 2. Book sections → read sections
    if (Array.isArray(legacy.bookSections)) {
      for (const [idx, bs] of legacy.bookSections.entries()) {
        const bsSlug = slugify(bs.title) || `book-section-${idx + 1}`;
        const content = renderBookSection(bs);
        sections.push({
          id: await uuidv5(`section:gate-da:${config.slug}:${chapterSlug}:${bsSlug}`),
          chapter_id: chapterId,
          slug: bsSlug,
          title: bs.title,
          type: "read",
          order_index: orderIndex++,
          estimated_minutes: 15,
          content,
          reading_questions: [],
          is_locked: false,
          metadata: { bookSectionNumber: bs.number },
          content_format: "markdown",
          access_tier: "basic",
          status: "published",
          source: "aleph-main-temp",
          external_id: `${legacy.id}-book-section-${idx + 1}`,
        });
      }
    }

    // 3. Concepts → concept sections
    if (Array.isArray(legacy.concepts)) {
      const conceptContent = legacy.concepts
        .map((c) => `### ${c.name}\n\n${c.description}\n\n*Cue:* ${c.cue}`)
        .join("\n\n");
      sections.push({
        id: await uuidv5(`section:gate-da:${config.slug}:${chapterSlug}:core-concepts`),
        chapter_id: chapterId,
        slug: "core-concepts",
        title: "Core Concepts",
        type: "concept",
        order_index: orderIndex++,
        estimated_minutes: 10,
        content: `## Core Concepts\n\n${conceptContent}`,
        reading_questions: [],
        is_locked: false,
        metadata: { concepts: legacy.concepts },
        content_format: "markdown",
        access_tier: "basic",
        status: "published",
        source: "aleph-main-temp",
        external_id: `${legacy.id}-core-concepts`,
      });
    }

    // 4. Techniques → problem-solving techniques section
    if (Array.isArray(legacy.techniques)) {
      const techContent = legacy.techniques
        .map((t) => `### ${t.name}\n\n*When:* ${t.when}\n\n*Move:* ${t.move}`)
        .join("\n\n");
      sections.push({
        id: await uuidv5(`section:gate-da:${config.slug}:${chapterSlug}:problem-solving-techniques`),
        chapter_id: chapterId,
        slug: "problem-solving-techniques",
        title: "Problem-Solving Techniques",
        type: "read",
        order_index: orderIndex++,
        estimated_minutes: 15,
        content: `## Problem-Solving Techniques\n\n${techContent}`,
        reading_questions: [],
        is_locked: false,
        metadata: { techniques: legacy.techniques },
        content_format: "markdown",
        access_tier: "basic",
        status: "published",
        source: "aleph-main-temp",
        external_id: `${legacy.id}-problem-solving-techniques`,
      });
    }

    // 5. Practice problems → Labelled Practice section with tasks
    if (Array.isArray(legacy.practiceProblems) && legacy.practiceProblems.length > 0) {
      const practiceSectionId = await uuidv5(`section:gate-da:${config.slug}:${chapterSlug}:labelled-practice`);
      sections.push({
        id: practiceSectionId,
        chapter_id: chapterId,
        slug: "labelled-practice",
        title: "Labelled Practice",
        type: "mechanic",
        order_index: orderIndex++,
        estimated_minutes: 25,
        content: "## Practice problems\n\nSolve the problems below. Try each one before revealing the solution.",
        reading_questions: [],
        is_locked: false,
        metadata: {},
        content_format: "markdown",
        access_tier: "basic",
        status: "published",
        source: "aleph-main-temp",
        external_id: `${legacy.id}-labelled-practice`,
      });

      for (const [idx, p] of legacy.practiceProblems.entries()) {
        tasks.push({
          id: await uuidv5(`task:gate-da:${config.slug}:${chapterSlug}:${slugify(p.label || "")}-${idx}`),
          section_id: practiceSectionId,
          title: p.label || null,
          label: inferLabel(p.label),
          statement: p.prompt || "",
          answer: "See solution.",
          solution: p.solution || "",
          hints: [],
          difficulty: null,
          estimated_minutes: 0,
          order_index: idx,
          concept_id: p.concept ? slugify(p.concept) : null,
          concept_name: p.concept || null,
          tags: p.technique ? [p.technique] : [],
          metadata: { legacyDifficulty: p.difficulty },
          status: "published",
          source: "aleph-main-temp",
          external_id: `${legacy.id}-practice-${idx + 1}`,
        });
      }
    }

    // 6. Conceptual Review section
    if (Array.isArray(legacy.reviewPrompts) && legacy.reviewPrompts.length > 0) {
      const reviewContent = legacy.reviewPrompts.map((r, i) => `${i + 1}. ${r}`).join("\n");
      sections.push({
        id: await uuidv5(`section:gate-da:${config.slug}:${chapterSlug}:conceptual-review`),
        chapter_id: chapterId,
        slug: "conceptual-review",
        title: "Conceptual Review",
        type: "review",
        order_index: orderIndex++,
        estimated_minutes: 10,
        content: `## Quick review\n\n${reviewContent}`,
        reading_questions: [],
        is_locked: false,
        metadata: {},
        content_format: "markdown",
        access_tier: "basic",
        status: "published",
        source: "aleph-main-temp",
        external_id: `${legacy.id}-conceptual-review`,
      });
    }

    // 7. Review Quiz
    if (legacy.reviewQuiz && Array.isArray(legacy.reviewQuiz.questions)) {
      const quizSectionId = await uuidv5(`section:gate-da:${config.slug}:${chapterSlug}:section-quiz`);
      sections.push({
        id: quizSectionId,
        chapter_id: chapterId,
        slug: "section-quiz",
        title: "Section Quiz",
        type: "quiz",
        order_index: orderIndex++,
        estimated_minutes: 10,
        content: `## ${legacy.reviewQuiz.title || "Section quiz"}\n\n${legacy.reviewQuiz.instructions || "Answer all questions to unlock the next section."}`,
        reading_questions: [],
        is_locked: false,
        metadata: {},
        content_format: "markdown",
        access_tier: "basic",
        status: "published",
        source: "aleph-main-temp",
        external_id: `${legacy.id}-section-quiz`,
      });

      const quizId = await uuidv5(`quiz:gate-da:${config.slug}:${chapterSlug}:section-quiz`);
      quizzes.push({
        id: quizId,
        section_id: quizSectionId,
        passing_score: 70,
        time_limit_minutes: null,
        metadata: {},
        status: "published",
        source: "aleph-main-temp",
        external_id: `${legacy.id}-review-quiz`,
      });

      for (const [idx, q] of legacy.reviewQuiz.questions.entries()) {
        quizQuestions.push({
          id: await uuidv5(`quiz-question:gate-da:${config.slug}:${chapterSlug}:${q.id || idx}`),
          quiz_id: quizId,
          prompt: q.prompt || "",
          format: q.options && q.options.length > 0 ? "mcq" : "nat",
          options: q.options || [],
          correct_answer: q.answer || "",
          explanation: "",
          difficulty: q.difficulty || null,
          gate_weight: q.gateWeight || null,
          concept_id: q.targetConcept || null,
          concept_name: q.targetConcept || null,
          order_index: idx,
          metadata: { kind: q.kind, tags: q.tags, prereqsUsed: q.prereqsUsed },
          status: "published",
          source: "aleph-main-temp",
          external_id: q.id || `${legacy.id}-question-${idx + 1}`,
        });
      }
    }

    // 8. Chapter Summary
    if (Array.isArray(legacy.chapterSummary) && legacy.chapterSummary.length > 0) {
      sections.push({
        id: await uuidv5(`section:gate-da:${config.slug}:${chapterSlug}:chapter-summary`),
        chapter_id: chapterId,
        slug: "chapter-summary",
        title: "Chapter Summary",
        type: "summary",
        order_index: orderIndex++,
        estimated_minutes: 5,
        content: `## Summary\n\n${legacy.chapterSummary.map((s) => `- ${s}`).join("\n")}`,
        reading_questions: [],
        is_locked: false,
        metadata: {},
        content_format: "markdown",
        access_tier: "basic",
        status: "published",
        source: "aleph-main-temp",
        external_id: `${legacy.id}-chapter-summary`,
      });
    }
  }
}

  const output = {
    exams,
    courses,
    subjects,
    chapters,
    sections,
    tasks,
    quizzes,
    quiz_questions: quizQuestions,
    resources,
  };

  mkdirSync(outputDir, { recursive: true });
  writeFileSync(join(outputDir, "transformed-gate-da-basic.json"), JSON.stringify(output, null, 2));

  console.log("Transformation complete.");
  console.log("  exams:", exams.length);
  console.log("  courses:", courses.length);
  console.log("  subjects:", subjects.length);
  console.log("  chapters:", chapters.length);
  console.log("  sections:", sections.length);
  console.log("  tasks:", tasks.length);
  console.log("  quizzes:", quizzes.length);
  console.log("  quiz_questions:", quizQuestions.length);
  console.log("Output:", join(outputDir, "transformed-gate-da-basic.json"));
}

function slugify(text) {
  return String(text || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function renderBookSection(bs) {
  const parts = [];
  if (bs.number) parts.push(`## ${bs.number} ${bs.title}`);
  else parts.push(`## ${bs.title}`);

  if (Array.isArray(bs.paragraphs)) {
    parts.push(bs.paragraphs.join("\n\n"));
  }

  if (Array.isArray(bs.blocks)) {
    for (const block of bs.blocks) {
      if (block.type === "definition") {
        parts.push(`### Definition: ${block.title}\n\n${block.body}`);
      } else if (block.type === "example") {
        parts.push(`### Example: ${block.title}\n\n${block.body}`);
      } else if (block.type === "checkpoint") {
        parts.push(`### Checkpoint: ${block.title}\n\n${block.body}`);
      } else if (block.type === "principle") {
        parts.push(`### Principle: ${block.title}\n\n${block.body}`);
      } else if (block.type === "strategy") {
        parts.push(`### Strategy: ${block.title}\n\n${block.body}`);
      } else if (block.type === "warning") {
        parts.push(`### Warning: ${block.title}\n\n${block.body}`);
      } else {
        parts.push(`### ${block.title}\n\n${block.body}`);
      }
    }
  }

  return parts.filter(Boolean).join("\n\n");
}

function inferLabel(labelText) {
  if (!labelText) return "concept";
  const lower = labelText.toLowerCase();
  if (lower.includes("concept")) return "concept";
  if (lower.includes("mechanic")) return "mechanic";
  if (lower.includes("integration")) return "integration";
  if (lower.includes("challenge")) return "challenge";
  if (lower.includes("isi")) return "isi";
  return "concept";
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
