# Aleph Pedagogical Rules

> **Extracted to:** `main-app/src/lib/pedagogical-rules.ts`

This document captures the **instructional design system** of the original aleph project. These are not arbitrary style choices — they are pedagogical decisions about how students learn mathematics best.

---

## 1. The 5-3-2 Problem Progression

Every section's problem set (P-Set) contains exactly **10 problems** split into three tiers:

| Tier | Count | Type | Purpose |
|---|---|---|---|
| **Foundation** | 5 | Concept + Mechanic | Build procedural fluency |
| **Integration** | 3 | Multi-concept / Application | Connect ideas across topics |
| **Challenge** | 2 | Hard / ISI-level | Stretch understanding, exam prep |

### Why 10?

10 problems is the **minimum viable dose** for a single study session. Fewer = insufficient practice. More = cognitive overload and diminishing returns.

### Why 5-3-2?

The ratio ensures students spend most of their time on **foundational skills** (50%) while still getting enough **integration** (30%) and **challenge** (20%) to build robust understanding.

### Problem Labels

```typescript
type ProblemLabel =
  | "concept"      // Tests understanding of a definition/theorem
  | "mechanic"     // Tests procedural execution (calculate, derive)
  | "integration"  // Combines 2+ concepts
  | "application"  // Real-world or exam-style context
  | "challenge"    // Difficult, often ISI or advanced GATE
  | "hidden"       // Not shown in the list; revealed after attempts
  | "isi";         // Directly from ISI entrance exams
```

---

## 2. Chapter Section Order

Every chapter follows the same **8-section structure**:

```typescript
const CHAPTER_SECTION_ORDER = [
  "read",       // 1. Theory / reading material
  "concept",    // 2. Conceptual problems (part of the 5)
  "mechanic",   // 3. Procedural problems (part of the 5)
  "integration",// 4. Multi-concept problems (the 3)
  "challenge",  // 5. Hard problems (the 2)
  "quiz",       // 6. Section-end assessment
  "review",     // 7. Appears only if quiz failed
  "summary",    // 8. Key takeaways, formula recap
] as const;
```

This ordering is **deliberate**:
1. **Read first** — students must encounter theory before problems
2. **Concept before mechanic** — understanding before execution
3. **Integration after both** — only after single-concept fluency
4. **Challenge at the end** — when the mind is warmed up
5. **Quiz gates progress** — prevents hollow "completion"
6. **Review is conditional** — only for those who need it
7. **Summary for retention** — spaced repetition anchor

---

## 3. Quality Rubric — Problem Sets

Every P-Set is scored on 6 dimensions, 100 points total. Passing gate: **75/100** (or **80/100** for premium content).

| Dimension | Points | What It Measures |
|---|---|---|
| **Mathematical Rigor** | 20 | No hand-waving, all steps justified |
| **Clarity of Explanation** | 20 | A student can follow without help |
| **Progression Quality** | 15 | Problems build on each other logically |
| **Difficulty Calibration** | 15 | Easy ones are easy, hard ones are genuinely hard |
| **Solution Completeness** | 15 | No "left as exercise" without hints |
| ** pedagogical Value** | 15 | Each problem teaches something distinct |

### Quality Gates

```typescript
const QUALITY_RUBRIC_PSET = {
  total_points: 100,
  passing_gate_basic: 75,
  passing_gate_premium: 80,
  dimensions: [
    { name: "mathematical_rigor", weight: 20 },
    { name: "clarity", weight: 20 },
    { name: "progression", weight: 15 },
    { name: "calibration", weight: 15 },
    { name: "completeness", weight: 15 },
    { name: "pedagogical_value", weight: 15 },
  ],
};
```

**No P-Set ships without passing the gate.** This was enforced by a Python verification script in the original aleph.

---

## 4. Quality Rubric — Quizzes

Quizzes are scored on 5 dimensions, 100 points total. Passing gate: **75/100**.

| Dimension | Points | What It Measures |
|---|---|---|
| **Coverage** | 25 | Quiz tests all key concepts from the section |
| **Discrimination** | 20 | Good students pass, weak students fail |
| **Clarity** | 20 | Questions are unambiguous |
| **Time Appropriateness** | 20 | Can be completed in allotted time |
| **Explanation Quality** | 15 | Post-quiz explanations are instructive |

```typescript
const QUALITY_RUBRIC_QUIZ = {
  total_points: 100,
  passing_gate: 75,
  dimensions: [
    { name: "coverage", weight: 25 },
    { name: "discrimination", weight: 20 },
    { name: "clarity", weight: 20 },
    { name: "time", weight: 20 },
    { name: "explanations", weight: 15 },
  ],
};
```

---

## 5. Material Page Standard

This defines how **explanations** (solution write-ups) must be formatted.

### Structure
1. **Problem Restatement** — Full problem text, clearly set apart
2. **Approach** — High-level strategy before any calculation
3. **Step-by-Step Solution** — Numbered steps, each with justification
4. **Key Insight** — The "aha" moment, boxed or highlighted
5. **Common Pitfalls** — What students typically get wrong
6. **Related Concepts** — Links to prerequisite/relevant topics

### Banned Phrases

The following phrases are **forbidden** in explanations because they are intellectually lazy:

```typescript
const BANNED_PHRASES = [
  "clearly",
  "obviously",
  "trivially",
  "it is easy to see",
  "we simply",
  "just",
  "note that",          // unless actually noting something non-obvious
  "without loss of generality", // unless genuinely justified
];
```

**Rationale:** These phrases signal that the author skipped a step. A student who doesn't see it "clearly" feels stupid. Every step must be earned.

### Solution Rhythm

- **Short sentences.** One thought per sentence.
- **Active voice.** "We compute" not "It is computed."
- **Math and text interleaved.** Don't dump a page of equations with no narrative.
- **Check marks.** After solving, verify the answer satisfies constraints.

---

## 6. Explanation Rules

Beyond the Material Page Standard, explanations must follow these meta-rules:

### Completeness
- Every algebraic step shown
- Every substitution named
- Every limit/direction considered
- Boundary cases checked

### Accessibility
- Define notation before use
- Reference theorems by name and chapter
- Give intuition before formalism
- Use analogies sparingly but effectively

### Honesty
- If a step is tricky, say so
- If multiple approaches exist, mention them
- If the problem has a known trap, warn explicitly

---

## 7. Pedagogical Intent vs. Implementation

| Pedagogical Goal | Original Implementation | aleph_v2 Implementation |
|---|---|---|
| Structured problem sets | Hardcoded JSON arrays | Supabase `tasks` table |
| Quiz gating | JS boolean flags | Server-side validation + RLS |
| Progress tracking | `localStorage` | `workspace_states` table |
| Quality enforcement | Python script, manual review | CMS workflow + peer review |
| Content authoring | Hand-written JSON | MDX in Fumadocs + editor UI |

---

*See also:*
- [Data Models](data-models.md) — TypeScript types for these concepts
- [Workspace Logic](workspace-logic.md) — How rules execute in the UI
- [Content Extraction](content-extraction.md) — What actual content was migrated
