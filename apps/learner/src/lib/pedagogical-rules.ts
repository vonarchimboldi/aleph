/**
 * Pedagogical Rules extracted from original Aleph project
 * Sources:
 *   - /Users/akshat/Documents/Code/Personal/aleph/psets/MATERIAL_PAGE_STANDARD.md
 *   - /Users/akshat/Documents/Code/Personal/aleph/QUALITY_RUBRIC.md
 *   - /Users/akshat/Documents/Code/Personal/aleph/scripts/verify-material-pages.mjs
 *
 * These rules govern how educational content is structured, written, and verified.
 */

// ─── PROBLEM SET PROGRESSION (5-3-2) ───────────────────────────

export const PROBLEM_SET_PROGRESSION = {
  totalProblems: 10,
  sections: [
    {
      range: "Problems 1-5",
      labels: ["concept", "mechanic"] as const,
      purpose:
        "Concept builders and mechanics. Solidify the core pattern through repetition.",
    },
    {
      range: "Problems 6-8",
      labels: ["integration", "application"] as const,
      purpose:
        "Integration and application. Combine the pattern with other ideas.",
    },
    {
      range: "Problems 9-10",
      labels: ["challenge", "hidden", "isi"] as const,
      purpose:
        "Challenge, hidden-pattern, or past-year/ISI-style problems. Stretch the learner.",
    },
  ],
};

// ─── MATH FORMATTING RULES ─────────────────────────────────────

export const MATH_RULES = {
  inlineDelimiter: "\\( ... \\)",
  displayDelimiter: "\\[ ... \\]",
  bannedRawDollar: true, // do not use raw $...$
  indicatorCommand: "\\mathbf{1}",
  namedOperatorCommand: "\\operatorname{...}",
  longDisplayClasses: [".formula", ".math-block"],
};

// ─── EXPLANATION STYLE RULES ───────────────────────────────────

export const EXPLANATION_RULES = {
  targetAudience: "students who may not be native English speakers",
  sentenceStyle: "short, direct sentences",
  symbolPolicy: "define every new symbol before using it heavily",
  methodPolicy: "explain WHY a method is being used, not only WHAT calculation is done",
  bannedPhrases: ["clearly", "trivially", "by inspection", "it follows"],
  solutionRhythm: [
    "identify the useful pattern",
    "write the known quantities",
    "do the calculation",
    "state the final answer",
  ],
  problemStatementLength: "concise",
  solutionTone: "friendly and complete",
};

// ─── MATERIAL PAGE STRUCTURE ───────────────────────────────────

export const MATERIAL_PAGE_SECTIONS = [
  { id: "hero", required: true, elements: ["h1", ".sub", ".meta", ".math-fallback"] },
  { id: "core-pattern", required: true, class: "panel accent", contains: "theorem or core formula" },
  { id: "pattern-checklist", required: false, class: "panel", contains: "step-by-step checklist" },
  {
    id: "problems-1-5",
    required: true,
    class: "section-label",
    labels: PROBLEM_SET_PROGRESSION.sections[0].labels,
  },
  {
    id: "problems-6-8",
    required: true,
    class: "section-label",
    labels: PROBLEM_SET_PROGRESSION.sections[1].labels,
  },
  {
    id: "problems-9-10",
    required: true,
    class: "section-label",
    labels: PROBLEM_SET_PROGRESSION.sections[2].labels,
  },
  { id: "answer-summary", required: true, contains: "Answer Summary section" },
];

// ─── QUALITY RUBRIC (Standalone Pset Pages) ────────────────────

export const QUALITY_RUBRIC_PSET = {
  totalPoints: 100,
  dimensions: [
    {
      name: "Structure and workflow",
      points: 15,
      criteria:
        "Uses shared material-page shell, has problem cards, complete solutions, answer summary, and expected 5-3-2 progression for 10-problem sets.",
    },
    {
      name: "Progression and diagnostic design",
      points: 20,
      criteria:
        "Starts with concept/mechanics builders, moves to applications, then ends with challenge, hidden-pattern, or ISI-style problems. Problems are not repetitive.",
    },
    {
      name: "Solution completeness",
      points: 25,
      criteria:
        "Every solution identifies the method, sets up the quantities, performs the calculation, and states the final answer. Solutions are long enough to be useful without being padded.",
    },
    {
      name: "Mathematical communication",
      points: 15,
      criteria:
        "Math uses KaTeX delimiters, named operators are formatted, raw dollar math is avoided, and important formulas are displayed clearly.",
    },
    {
      name: "Learner accessibility",
      points: 10,
      criteria:
        "The page states the core pattern, uses direct language, defines symbols, and avoids terse proof phrases.",
    },
    {
      name: "Feedback readiness",
      points: 15,
      criteria:
        "Tags and problem labels make it possible to diagnose the learner's weakness after a submitted solution.",
    },
  ],
  passingGate: {
    minPageScore: 75,
    minAveragePsetScore: 80,
  },
};

// ─── QUALITY RUBRIC (Graph-Backed Review Quizzes) ──────────────

export const QUALITY_RUBRIC_QUIZ = {
  totalPoints: 100,
  dimensions: [
    {
      name: "Review workflow mechanics",
      points: 20,
      criteria:
        "Quiz has a concept graph, per-question metadata, target concepts, prerequisites, difficulty, GATE weight, and repair material.",
    },
    {
      name: "Diagnostic progression",
      points: 20,
      criteria:
        "Questions include direct checks and mixed-concept checks. A quiz may be short; the standard is progression, not a fixed question count.",
    },
    {
      name: "Concept coverage",
      points: 20,
      criteria:
        "Target concepts and prerequisite concepts are represented in the graph and match the chapter's important ideas.",
    },
    {
      name: "Feedback actionability",
      points: 20,
      criteria:
        "Graph nodes provide concrete repair material and next-quiz fallback rules.",
    },
    {
      name: "Question quality",
      points: 20,
      criteria:
        "Prompts are clear, options are distinct, answers are objective, and distractors represent plausible mistakes.",
    },
  ],
  passingGate: {
    minQuizScore: 75,
    minAverageQuizScore: 80,
  },
};

// ─── CHAPTER CONTENT STRUCTURE ─────────────────────────────────

export const CHAPTER_SECTION_ORDER = [
  "section-preview",
  "preview-activity",
  "core-ideas",
  "problem-solving-techniques",
  "reading-questions",
  "labelled-practice-problems",
  "conceptual-review",
  "chapter-summary",
] as const;

export type ChapterSectionKind = (typeof CHAPTER_SECTION_ORDER)[number];

export const CHAPTER_SECTION_DESCRIPTIONS: Record<ChapterSectionKind, string> = {
  "section-preview": "What the learner will know and be able to do by the end of the chapter.",
  "preview-activity": "A low-stakes warm-up problem that surfaces prior knowledge and curiosity.",
  "core-ideas": "The essential definitions, theorems, and formulas. No proofs unless they illuminate.",
  "problem-solving-techniques": "Named patterns and step-by-step methods for common problem types.",
  "reading-questions": "Short conceptual checks to verify understanding before practice.",
  "labelled-practice-problems": "10 problems in 5-3-2 progression with hidden worked solutions.",
  "conceptual-review": "Higher-level prompts without solutions. Forces synthesis.",
  "chapter-summary": "One-page recap of definitions, formulas, and problem-type map.",
};

// ─── VERIFICATION CHECKLIST ────────────────────────────────────

export const MATERIAL_VERIFICATION_CHECKS = [
  "KaTeX stylesheet and scripts included",
  "Shared material-page.css and material-page.js included",
  '<main class="wrap"> present',
  '<section class="hero"> with h1, .sub, .meta, .math-fallback',
  '.panel.accent for core pattern',
  '.section-label for each progression range',
  '10 problems with <article class="problem">',
  'Every problem has <details><summary>Solution</summary>',
  'Answer Summary section present',
  'No raw $...$ math (use \\( \\) or \\[ \\])',
  'No banned terse phrases (clearly, trivially, by inspection, it follows)',
  'No duplicate problem titles or statements across pages',
  'All local assets exist',
  'Page loads at desktop and mobile without horizontal body overflow',
];
