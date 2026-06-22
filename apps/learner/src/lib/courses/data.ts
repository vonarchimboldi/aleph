// ⚠️ TEMPORARY STATIC DATA FOR MVP
// This file exists only to build the UI before the database is connected.
// It will be deleted once courses, chapters, sections, tasks, and quizzes
// are stored in Supabase and fetched via the API.

import { umpNpTestsChapter } from "./umpNpTestsChapter";

export type SectionType =
  | "read"
  | "concept"
  | "mechanic"
  | "integration"
  | "challenge"
  | "quiz"
  | "review"
  | "summary";

export interface Problem {
  id: string;
  label: "concept" | "mechanic" | "integration" | "challenge" | "isi";
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

export interface Section {
  id: string;
  slug: string;
  title: string;
  type: SectionType;
  estimatedMinutes: number;
  content: string;
  readingQuestions?: { question: string; hint: string }[];
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
  conceptGraph?: import("./conceptGraphs").ConceptGraph;
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

export const probabilityCourse: Course = {
  id: "course-probability",
  slug: "probability",
  title: "Probability & Statistics",
  tagline: "Build exam-ready intuition for GATE DA and beyond.",
  exam: "GATE DA",
  difficulty: "Beginner to Intermediate",
  duration: "10 chapters · ~40 hours",
  outcomes: [
    "Translate word problems into precise probability models",
    "Compute conditional probabilities and apply Bayes' rule",
    "Work with random variables, expectation, and variance",
    "Solve past GATE DA problems using first principles",
  ],
  prerequisites: [
    "High school algebra",
    "Basic calculus (derivatives and integrals)",
    "Comfort with set notation",
  ],
  chapters: [
    {
      id: "chapter-1",
      slug: "ch1-probability-foundations",
      number: 1,
      title: "Probability Foundations",
      description: "Sample spaces, events, axioms, and counting.",
      sections: [
        {
          id: "sec-1-1",
          slug: "section-preview",
          title: "Section Preview",
          type: "read",
          estimatedMinutes: 5,
          content: `## What this section is about

This section introduces the building blocks of probability: sample spaces, events, and the three axioms that govern probability measures. We will also practice counting techniques that let us compute probabilities in finite sample spaces.

By the end you should be able to:
- Define a sample space and an event.
- Apply the axioms of probability.
- Use counting rules (permutations and combinations) to compute sizes of events.`,
          readingQuestions: [
            {
              question: "What is the difference between a sample space and an event?",
              hint: "A sample space is the set of all possible outcomes; an event is a subset of outcomes.",
            },
            {
              question: "Why must P(∅) = 0 follow from the axioms?",
              hint: "Use countable additivity with countably many disjoint copies of the empty set.",
            },
          ],
        },
        {
          id: "sec-1-2",
          slug: "core-ideas",
          title: "Core Ideas",
          type: "read",
          estimatedMinutes: 20,
          content: `## Sample spaces

A **sample space** \( \Omega \) is the set of all possible outcomes of a random experiment.

### Example
When rolling a fair six-sided die, \( \Omega = \{1,2,3,4,5,6\} \).

## Events

An **event** is a subset of the sample space.

## Axioms of probability

A probability measure \( P \) satisfies:
1. \( P(A) \geq 0 \) for every event \( A \).
2. \( P(\Omega) = 1 \).
3. For countably many disjoint events \( A_1, A_2, \dots \),
   \[
   P\left(\bigcup_{i=1}^{\infty} A_i\right) = \sum_{i=1}^{\infty} P(A_i).
   \]

## Counting

For a finite sample space with equally likely outcomes,
\[
P(A) = \frac{|A|}{|\Omega|}.
\]

Use permutations when order matters and combinations when it does not.`,
          readingQuestions: [
            {
              question: "If order matters, do you use permutations or combinations?",
              hint: "Permutations count ordered arrangements.",
            },
          ],
        },
        {
          id: "sec-1-3",
          slug: "problem-solving-techniques",
          title: "Problem-Solving Techniques",
          type: "read",
          estimatedMinutes: 15,
          content: `## Technique: Draw the sample space

For small experiments, list all outcomes and circle the event of interest.

## Technique: Use complements

\[
P(A^c) = 1 - P(A).
\]

Complements are useful when "at least one" is easier to compute as \( 1 - \) "none".

## Technique: Count in two ways

If a set can be described two different ways, the two counts must agree. This often reveals a combinatorial identity.`,
        },
        {
          id: "sec-1-4",
          slug: "labelled-practice",
          title: "Labelled Practice",
          type: "mechanic",
          estimatedMinutes: 25,
          content: `## Practice problems

Solve the problems below. Try each one before revealing the solution.`,
          problems: [
            {
              id: "p-1-1",
              label: "concept",
              statement: "A fair die is rolled. What is the probability that the outcome is even?",
              answer: "1/2",
              solution: "The event is \(\{2,4,6\}\). There are 3 favorable outcomes out of 6, so the probability is \(3/6 = 1/2\).",
              hints: ["List the even outcomes.", "Divide by the total number of outcomes."],
            },
            {
              id: "p-1-2",
              label: "mechanic",
              statement: "How many ways can 4 people be seated in a row of 4 chairs?",
              answer: "24",
              solution: "There are \(4! = 24\) permutations of 4 distinct people.",
              hints: ["Use the multiplication principle.", "There are 4 choices for the first seat, 3 for the second, etc."],
            },
            {
              id: "p-1-3",
              label: "integration",
              statement: "A 5-card hand is dealt from a standard 52-card deck. What is the probability that all 5 cards are hearts?",
              answer: "C(13,5)/C(52,5)",
              solution: "There are \(\binom{13}{5}\) ways to choose 5 hearts and \(\binom{52}{5}\) total 5-card hands. The probability is the ratio.",
              hints: ["Does order matter in a 5-card hand?", "Use combinations, not permutations."],
            },
            {
              id: "p-1-4",
              label: "challenge",
              statement: "In a class of 30 students, what is the probability that at least two share a birthday? (Ignore leap years.)",
              answer: "1 - (365!/335!)/365^30",
              solution: "Compute the complement: all 30 birthdays are distinct. The number of favorable outcomes for the complement is \(365 \\times 364 \\times \\cdots \\times 336\). Divide by \(365^{30}\) and subtract from 1.",
              hints: ["Use the complement rule.", "Count the number of ways to assign 30 distinct birthdays."],
            },
            {
              id: "p-1-5",
              label: "concept",
              statement: "If \(P(A) = 0.4\), \(P(B) = 0.5\), and \(A\) and \(B\) are disjoint, what is \(P(A \\cup B)\)?",
              answer: "0.9",
              solution: "For disjoint events, \(P(A \\cup B) = P(A) + P(B) = 0.4 + 0.5 = 0.9\).",
              hints: ["Recall the addition rule for disjoint events."],
            },
            {
              id: "p-1-6",
              label: "mechanic",
              statement: "A committee of 3 is chosen from 10 people. How many different committees are possible?",
              answer: "120",
              solution: "\(\binom{10}{3} = 120\).",
              hints: ["Order does not matter in a committee.", "Use combinations."],
            },
            {
              id: "p-1-7",
              label: "integration",
              statement: "Two fair dice are rolled. What is the probability that the sum is 7?",
              answer: "1/6",
              solution: "There are 6 outcomes that give sum 7: (1,6), (2,5), (3,4), (4,3), (5,2), (6,1). Out of 36 total outcomes, the probability is \(6/36 = 1/6\).",
              hints: ["List all pairs that sum to 7.", "There are 36 equally likely outcomes."],
            },
            {
              id: "p-1-8",
              label: "challenge",
              statement: "A bag contains 4 red and 6 blue balls. Three balls are drawn without replacement. What is the probability that the first is red and the next two are blue?",
              answer: "(4/10)*(6/9)*(5/8) = 1/6",
              solution: "Use conditional probability: \(P(R_1 B_2 B_3) = P(R_1) P(B_2|R_1) P(B_3|R_1 B_2) = \\frac{4}{10} \\cdot \\frac{6}{9} \\cdot \\frac{5}{8} = \\frac{1}{6}\).",
              hints: ["Use the multiplication rule for conditional probabilities.", "The composition of the bag changes after each draw."],
            },
            {
              id: "p-1-9",
              label: "concept",
              statement: "State the complement rule and give an example where it is useful.",
              answer: "P(A^c) = 1 - P(A)",
              solution: "The complement rule states \(P(A^c) = 1 - P(A)\). It is useful for 'at least one' problems, e.g. probability of at least one head in 10 flips is \(1 - (1/2)^{10}\).",
              hints: ["Think about when the complement is easier to count."],
            },
            {
              id: "p-1-10",
              label: "mechanic",
              statement: "How many 4-letter codes can be formed from the letters A, B, C, D, E if repetition is not allowed?",
              answer: "120",
              solution: "There are \(5 \\times 4 \\times 3 \\times 2 = 120\) such codes.",
              hints: ["Use the multiplication principle with decreasing choices."],
            },
          ],
        },
        {
          id: "sec-1-5",
          slug: "conceptual-review",
          title: "Conceptual Review",
          type: "review",
          estimatedMinutes: 10,
          content: `## Quick review

Before taking the section quiz, review these key ideas:
- Sample space vs event
- Probability axioms
- Counting with permutations and combinations
- Complement rule

## Self-check questions

1. Why is \(P(\Omega) = 1\) required?
2. What goes wrong if you use permutations to count a 5-card hand?
3. When should you compute a probability via its complement?`,
        },
        {
          id: "sec-1-6",
          slug: "section-quiz",
          title: "Section Quiz",
          type: "quiz",
          estimatedMinutes: 10,
          content: `## Section quiz

Answer all questions to unlock the next section.`,
          quiz: [
            {
              id: "q-1-1",
              prompt: "Which of the following is a valid probability measure?",
              format: "mcq",
              options: [
                { id: "a", text: "P(A) = -0.2 for some event A" },
                { id: "b", text: "P(Ω) = 0.5" },
                { id: "c", text: "P(A) = 0.7 and P(A^c) = 0.3" },
                { id: "d", text: "P(∅) = 1" },
              ],
              correctAnswer: "c",
              explanation: "Probabilities must be non-negative, P(Ω)=1, and P(∅)=0. Only option C satisfies all requirements.",
            },
            {
              id: "q-1-2",
              prompt: "A fair coin is flipped 3 times. What is the probability of getting exactly 2 heads?",
              format: "mcq",
              options: [
                { id: "a", text: "1/8" },
                { id: "b", text: "3/8" },
                { id: "c", text: "1/2" },
                { id: "d", text: "5/8" },
              ],
              correctAnswer: "b",
              explanation: "There are 8 equally likely outcomes. The favorable outcomes are HHT, HTH, THH, so the probability is 3/8.",
            },
            {
              id: "q-1-3",
              prompt: "How many ways can 5 people be arranged in a line?",
              format: "nat",
              correctAnswer: "120",
              explanation: "There are 5! = 120 permutations.",
            },
            {
              id: "q-1-4",
              prompt: "If P(A) = 0.3 and P(B) = 0.4, and A and B are disjoint, what is P(A ∪ B)?",
              format: "nat",
              correctAnswer: "0.7",
              explanation: "For disjoint events, P(A ∪ B) = P(A) + P(B) = 0.7.",
            },
          ],
        },
        {
          id: "sec-1-7",
          slug: "chapter-summary",
          title: "Chapter Summary",
          type: "summary",
          estimatedMinutes: 5,
          content: `## Summary

In this chapter you learned:
- How to define sample spaces and events.
- The three axioms of probability.
- How to count outcomes using permutations and combinations.
- How to use complements to simplify probability calculations.

## Next chapter

Chapter 2 introduces **conditional probability** and **Bayes' rule**, the tools for updating probabilities when new information arrives.`,
        },
      ],
    },
    umpNpTestsChapter,
  ],
};

export const courses: Course[] = [probabilityCourse];

export function getCourseBySlug(slug: string): Course | undefined {
  return courses.find((c) => c.slug === slug);
}

export function getSectionBySlug(
  courseSlug: string,
  chapterSlug: string,
  sectionSlug: string
): { course: Course; chapter: Chapter; section: Section; sectionIndex: number } | undefined {
  const course = getCourseBySlug(courseSlug);
  if (!course) return undefined;

  const chapter = course.chapters.find((ch) => ch.slug === chapterSlug);
  if (!chapter) return undefined;

  const sectionIndex = chapter.sections.findIndex((sec) => sec.slug === sectionSlug);
  if (sectionIndex === -1) return undefined;

  return { course, chapter, section: chapter.sections[sectionIndex], sectionIndex };
}

export function getNextSection(courseSlug: string, chapterSlug: string, sectionSlug: string) {
  const result = getSectionBySlug(courseSlug, chapterSlug, sectionSlug);
  if (!result) return undefined;
  const { course, chapter, sectionIndex } = result;
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
  return undefined;
}

export function getPreviousSection(courseSlug: string, chapterSlug: string, sectionSlug: string) {
  const result = getSectionBySlug(courseSlug, chapterSlug, sectionSlug);
  if (!result) return undefined;
  const { course, chapter, sectionIndex } = result;
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
    return {
      chapterSlug: prevChapter.slug,
      sectionSlug: prevChapter.sections[prevChapter.sections.length - 1].slug,
      sectionId: prevChapter.sections[prevChapter.sections.length - 1].id,
    };
  }
  return undefined;
}
