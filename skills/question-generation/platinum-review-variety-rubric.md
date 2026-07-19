# Platinum Review Quiz Variety Rubric

Use this rubric for Priyanka's Platinum review quizzes, especially Sunday and cumulative tests. It prevents quizzes from repeating the same six buckets, same first-step moves, or same trap patterns across weeks.

## Source Pool

Eligible review sources must be explicitly covered before the quiz date.

- Discrete Math: covered Platinum week blocks from CMU 21-228, MIT 6.1200J, and MIT 18.200.
- DSA: covered Platinum week blocks from Aho/Ullman FOCS and Cartesian.
- Probability and Statistics: covered Platinum PSB pattern sets and Sunday PSB reviews.
- Competition Math: covered Competition Math archive/roadmap material, especially last-year/algebra-track review sources already attached in Aleph:
  - `psets/week-01/june-01-competition-math-vietas-polynomials.html`
  - `psets/week-02/june-29-competition-math-identities-factoring.html`
  - `psets/week-03/july-06-competition-math-sequences-recurrences.html`

Do not add Competition Math geometry unless the plan explicitly changes; the current Competition Math track intentionally focuses on algebra and then number theory.

## Variety Dimensions

Score each dimension 0-2.

| Dimension | 0 | 1 | 2 |
| --- | --- | --- | --- |
| Concept rotation | Reuses almost the same topic buckets as the previous review. | Some topic rotation, but old buckets still dominate. | At least one-third of the quiz uses newly covered or previously under-tested concepts. |
| Skill diversity | Most questions ask for the same move, such as direct counting or simple tracing. | Includes several skills but with repeated setup style. | Mixes recognition, setup choice, trace/simulation, counterexample, invariant/proof, calculation, and transfer. |
| Reasoning-mode spread | Same reasoning mode dominates both MCQ and short answer. | MCQ and short-answer sections differ, but each section is internally repetitive. | Both sections include multiple reasoning modes: all-correct selection, construction, falsification, exact computation, proof sketch, and edge-case analysis. |
| Trap diversity | Reuses the same trap pattern repeatedly. | Has plausible traps but many are variants of the same mistake. | Rotates traps across overcounting, missed cases, converse errors, off-by-one, wrong invariant, algebra execution, and misread conditions. |
| Subject mix | Ignores an eligible subject without reason. | Includes the subject but only token or too-easy items. | Samples eligible subjects in proportion to current goals, recent feedback gaps, and review purpose. |
| Week-to-week novelty | Does not compare against previous review quizzes. | Mentions prior quizzes but does not change the item plan. | Metadata names repeated concepts and explains what was changed, added, reduced, or intentionally retained. |

Pass rule:

- Each dimension must score at least 1.
- Total must be at least 10/12 for ordinary weekly review.
- Total must be at least 11/12 for CMI/ISI/GATE-targeted review.
- Regenerate or replace questions if any topic group, skill family, trap family, or first-step pattern appears too often without a deliberate diagnostic reason.

## Required Quiz Metadata

Every generated Platinum review quiz should include:

```json
{
  "varietyRubricVersion": "platinum-review-variety-rubric-v1",
  "varietyPlan": {
    "priorQuizComparison": "",
    "newConceptFamilies": [],
    "retainedConceptFamilies": [],
    "reducedConceptFamilies": [],
    "skillFamilies": [],
    "reasoningModes": [],
    "trapFamilies": [],
    "competitionMathSources": [],
    "varietyScores": {
      "concept_rotation": 0,
      "skill_diversity": 0,
      "reasoning_mode_spread": 0,
      "trap_diversity": 0,
      "subject_mix": 0,
      "week_to_week_novelty": 0
    },
    "varietyPass": false
  }
}
```

## Generation Rules

- Before writing questions, compare against at least the previous two review quizzes when available.
- Keep deliberately retained topics only when they address a recent miss, prerequisite gap, or high-weight exam skill.
- When Competition Math is eligible, include algebra-pattern items that test transformation choice, not just expansion.
- Avoid repeating the same topic order. Rotate topic blocks and mix subjects inside the quiz when the format allows it.
- A 30-question review should usually include at least 8 distinct concept families, 6 skill families, 5 reasoning modes, and 6 trap families.
- If a review is subject-local, variety still applies inside that subject.
