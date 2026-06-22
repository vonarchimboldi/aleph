# Feedback Workflows — Methodology

> How Aleph generates structured, actionable feedback for Platinum submissions. Derived from the actual product (`app.js` + `api/generate-feedback.js`).

---

## Why Workflows?

Generic "correct / incorrect" feedback is useless for math exam prep. A **feedback workflow** bundles everything the system needs to diagnose a submission:

1. **Verdict taxonomy** — green / yellow / red
2. **Skill checklist** — what the learner must demonstrate
3. **Rubric** — how points map to observable actions
4. **Common issues** — known failure modes for the topic
5. **Default next drills** — repair problems when a skill is weak
6. **Prerequisite graph** — which underlying skills feed into each skill

The LLM uses the workflow as context. The output is a strict JSON report that feeds the adaptive planner.

---

## Base Workflow Shape

```ts
interface FeedbackWorkflow {
  id: string;                 // e.g. "feedback-workflow-indicators-v1"
  title: string;
  topic: string;
  promptUse: string;          // instructions for the LLM/author
  verdicts: Verdict[];
  skills: Skill[];
  rubric: RubricCriterion[];
  commonIssues: string[];
  defaultNextDrills: NextDrill[];
  prerequisiteGraph: PrerequisiteGraph;
}

interface Verdict {
  id: "green" | "yellow" | "red";
  label: string;
  description: string;
}

interface Skill {
  id: string;
  label: string;
}

interface RubricCriterion {
  criterion: string;
  points: number;
  cue: string;                // what to look for in the submission
}

interface NextDrill {
  skill: string;
  difficulty: "mechanics" | "application" | "hard";
  instruction: string;
}

interface PrerequisiteGraph {
  topic: string;
  skills: Record<string, {
    prereqs: string[];
    diagnostic: string;       // short prompt for a direct check
  }>;
  common: Record<string, {
    label: string;
    prereqs: string[];
    diagnostic: string;
  }>;
}
```

---

## Implemented Workflows

| Workflow ID | Topic | Where Used |
|-------------|-------|------------|
| `feedback-workflow-indicators-v1` | Method of Indicators | `june-01-indicators.html` |
| `feedback-workflow-conditional-expectation-v1` | Conditional Expectation & Tower Property | `june-02-conditional-expectation-tower.html` |
| `feedback-workflow-order-statistics-v1` | Order Statistics | `june-03-order-statistics.html` |
| `feedback-workflow-mle-estimation-v1` | MLE and Estimation | `june-04-mle-estimation.html` |
| `feedback-workflow-ump-np-v1` | UMP/NP Tests | `june-05-ump-np-tests.html` |
| `feedback-workflow-weekly-psb-review-v1` | Weekly PSB Review Quiz | `june-07-psb-review-quiz.html` |
| `feedback-workflow-competition-vieta-v1` | Vieta & Polynomials | `june-01-competition-math-vietas-polynomials.html` |

---

## Example: Method of Indicators

### Verdicts

| ID | Label | Meaning |
|----|-------|---------|
| `green` | Green | Correct or nearly correct; only small presentation fixes remain. |
| `yellow` | Yellow | Right main idea, but an execution or justification gap remains. |
| `red` | Red | Wrong setup or the core pattern was not recognized. |

### Skills

- `pattern-recognition` — Recognizes expected-count cue
- `indicator-definition` — Defines clean indicators
- `index-set-choice` — Chooses the right index set
- `linearity-of-expectation` — Uses linearity without independence
- `pair-products` — Handles pair products / variance
- `conditioning-bridge` — Conditions first when useful
- `final-interpretation` — States final answer clearly

### Rubric (10 points)

| Criterion | Points | Cue |
|-----------|--------|-----|
| Pattern recognition | 1 | Saw that the problem asks for an expected count. |
| Indicator setup | 3 | Defined one yes/no variable for the correct atomic object. |
| Probability computation | 2 | Computed each indicator probability or pair probability correctly. |
| Linearity / pair expansion | 2 | Used linearity, or used E[X²] / E[X(X-1)] correctly. |
| Final answer and justification | 2 | Gave a clean final expression and justified dependence/independence correctly. |

### Common Issues

- Used one indicator for the whole count instead of one per object.
- Chose the wrong index set.
- Assumed independence when only linearity was needed.
- Forgot overlapping-pair cases in a variance/second-moment problem.
- Computed the full distribution even though the expected count was enough.

### Default Next Drills

| Skill | Difficulty | Instruction |
|-------|------------|-------------|
| `indicator-definition` | mechanics | Rewrite the solution using one indicator per counted object before doing arithmetic. |
| `pair-products` | application | Do one second-moment problem and explicitly separate overlapping and non-overlapping pairs. |
| `conditioning-bridge` | application | Solve one problem where the count is easy only after conditioning on a random batch size. |

### Prerequisite Graph

```yaml
topic: Method of Indicators
skills:
  indicator-definition:
    prereqs: [counted-object, index-set-choice]
    diagnostic: Define indicators for a small count before computing expectation.
  linearity-of-expectation:
    prereqs: [indicator-definition, expectation-of-indicator]
    diagnostic: Compute E[sum Ii] without assuming independence.
  pair-products:
    prereqs: [joint-probability, overlap-cases, variance-expansion]
    diagnostic: Compute E[Ii Ij] for overlapping and non-overlapping pairs.
  conditioning-bridge:
    prereqs: [conditioning-choice, tower-property]
    diagnostic: Condition on a random batch size, then use indicators inside the conditional problem.
common:
  algebra-control:
    label: Algebra control
    prereqs: [signs-and-inequalities, simplification]
    diagnostic: Give a short algebra-only simplification that appears inside the topic.
  calculus-control:
    label: Calculus control
    prereqs: [derivatives, critical-points, boundary-checks]
    diagnostic: Optimize a one-variable expression and state whether the answer is interior or boundary.
  distribution-recognition:
    label: Distribution recognition
    prereqs: [pmf-pdf-support, cdf-tail-probability]
    diagnostic: Identify the distribution, support, and relevant tail/CDF from a short statement.
  written-justification:
    label: Written justification
    prereqs: [method-trigger, final-interpretation]
    diagnostic: Explain why the selected method applies before computing.
```

---

## LLM Prompt Design

The `/api/generate-feedback.js` endpoint sends the workflow plus the submitted solution to OpenAI.

**System prompt highlights:**

- "You are Aleph's mathematics feedback engine."
- "Generate student-facing feedback from the submitted solution and rubric."
- "Do not invent work the student did not do."
- "Separate conceptual gaps from execution mistakes."
- "Use the workflow prerequisite graph when provided; do not invent a prerequisite label if a supplied graph label applies."
- "For every non-green solution, produce concrete errorAnalysis, prerequisiteHypotheses, and diagnosticRecommendations."
- "Sunday diagnostics should confirm or falsify the prerequisite hypotheses using direct prerequisite checks and bridge problems."
- "Set adaptivePlanSignal ratios so they sum to roughly 1. Use repair/bridge weight when prerequisite gaps are likely."

**Output:** strict JSON schema enforced by OpenAI `json_schema` mode.

---

## From Feedback to Adaptive Plan

1. Student submits solution for a material page.
2. Frontend calls `/api/generate-feedback` with `{ materialTitle, workflow, solutionText }`.
3. LLM returns structured report.
4. Frontend stores report in `pattern_submissions` + updates local snapshot.
5. Snapshot syncs to `/api/platinum-progress`.
6. Sunday cron reads snapshot, extracts `feedbackPrerequisiteHypotheses` and `feedbackErrorAnalysis`.
7. Cron ranks hypotheses, builds Sunday diagnostic plan, and emits next-week pset allocation.

---

## Content Author Guidelines

When creating a new workflow:

1. **Keep rubrics additive.** Each criterion should be independently observable.
2. **Total points = 10.** Aligns with LLM score field.
3. **Skills are verbs or verb phrases.** They describe what the learner can do.
4. **Common issues come from real student work.** Watch 3-5 submissions before finalizing.
5. **Default drills are specific.** Not "practice more" but "do one second-moment problem and separate overlapping vs non-overlapping pairs."
6. **Prerequisite graph labels must match existing concept nodes.** This lets the dashboard link feedback to concept mastery.
7. **Version workflows.** Append `-v2` when iterating; do not mutate live workflows in place.

---

## Future Workflows to Add

The Platinum plan has placeholders for:

- Regression and OLS (`pattern-regression-ols`)
- Competition Math: identities, recurrences, inequalities, functional equations, complex numbers
- Discrete Mathematics: proof techniques, combinatorics, graph theory
- Data Structures and Algorithms: complexity, arrays, trees, graphs, DP

---

*Last updated: 2026-06-09*
*Source: `vonarchimboldi/aleph` main branch, `app.js` feedback workflow functions + `api/generate-feedback.js`*
