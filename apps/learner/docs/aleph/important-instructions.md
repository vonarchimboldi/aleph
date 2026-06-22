# Aleph UI Review And Workflow Note

## Context

Aleph is a GATE DA learning workspace, not just a landing page. The core product loop is:

```text
Subjects in parallel -> Chapter/day material -> Practice -> Review quiz -> Feedback -> Adaptive cumulative review
```

The UI work should preserve the current course/content state while improving the learner experience. The current production app is:

```text
https://aleph-alpha.io
```

The main repository is:

```text
git@github.com:vonarchimboldi/aleph.git
```

## Current Product Direction

For GATE DA Basic, we recommend studying three subjects in parallel rather than treating one subject as a long serialized block.

Every 15 days, Aleph should generate an adaptive cumulative review quiz based on prior performance:

- Concepts the learner got wrong should appear more often.
- Concepts the learner got right should appear less often.
- High-weight exam topics should keep resurfacing even after correct answers.
- Feedback should identify weak concepts, prerequisite gaps, and next repair actions.

The current built content includes:

- Probability Chapters 1-10
- Linear Algebra Chapters 1-4
- Graph-backed objective review quizzes for built chapters
- Labelled practice problems and worked solutions
- Dashboard/feedback wiring for review attempts
- Priyanka Platinum weekly material pages and feedback flow

## Review Of The Aleph v2 Fork

Fork reviewed:

```text
https://aleph-v2.vercel.app/
```

### What Works

- The visual direction is much cleaner than the current prototype shell.
- Typography, spacing, neutral palette, and login/signup polish feel more production-grade.
- The main positioning is strong: "Know what you don't know. Then fix it."
- "Continuous feedback. No blind spots." is close to the real Aleph thesis.
- The sign-in/sign-up pages are a good visual baseline.

### What Needs Correction

- The fork currently behaves like a marketing site, not the actual learning workspace.
- The metadata still reads like a scaffold:

```text
title: aleph_v2 — Built for Scale
description: Next.js app with Supabase Auth, ready for Vercel deployment
```

- The copy is partially stale or inaccurate:
  - "Solve 10 problems" is too rigid. We explicitly allow one or two questions when that is the right pedagogical unit.
  - "70% to unlock the next section" is too blunt. We care about diagnostic prerequisite repair, not only score gates.
  - It does not mention three-subject parallel pacing.
  - It does not mention the 15-day adaptive cumulative review quiz.
  - Probability says "Chapters 5-10," but the Basic plan has Probability Chapters 1-10.
  - Linear Algebra says "Coming Soon," but Chapters 1-4 are built.
- The About page appears to use generic founder/instructor personas. If these are placeholders, remove them before sharing publicly. Fake or unverifiable bios are a trust risk.
- The hero graphic is attractive but abstract. It does not show the actual learner workflow, dashboard, material page, review quiz, or feedback experience.

## Recommended UI Direction

Use the fork's visual system as a starting point, but anchor it to the actual Aleph workflow.

The homepage/onboarding should say something closer to:

```text
Aleph is a GATE DA prep workspace that keeps Probability, Linear Algebra, and core exam skills moving in parallel. Every chapter has diagnostic review. Every 15 days, Aleph builds a cumulative quiz from your performance: weak concepts repeat more often, mastered concepts appear less often, and high-weight exam topics keep resurfacing.
```

The main visible product flow should be:

```text
Choose exam -> Choose plan -> Study subjects in parallel -> Open chapter/day material -> Solve practice -> Submit review quiz -> Read feedback -> Adaptive cumulative review
```

For GATE DA Basic:

```text
Subject -> Chapter -> Read material -> Practice -> Review quiz -> Feedback/dashboard repair actions
```

For Priyanka Platinum:

```text
Week -> Day -> Material page -> Submit solutions -> Feedback page/email
```

## UI Principles

- Build the actual learner workspace first, not a marketing-only landing page.
- Keep the interface quiet, serious, and study-oriented.
- Prioritize fast resumption: the dashboard should show what to do next.
- Make weeks, subjects, chapters, tasks, tests, and feedback easy to scan.
- Keep subjects independently paced. Do not serialize all content into one global week count.
- Make locked content understandable, but allow course designers/admins to preview it.
- Feedback should be informative, not just "correct/incorrect."
- Math pages must render formulas, diagrams, worked examples, and solutions reliably.
- Avoid decorative visuals that do not help the learner understand status, structure, or next action.
- Do not hard-code "10 problems" as a universal rule. Use the number of questions needed to test the concept well.

## Immediate UI Priorities

1. Dashboard
   - Show current subject progress.
   - Show next actions by subject.
   - Surface pending review quizzes and weak concepts.
   - Show 15-day cumulative review status once implemented.

2. Subject/Chapter Flow
   - Make `Subjects -> Chapter -> Material -> Practice -> Review Quiz -> Feedback` obvious.
   - Keep Probability and Linear Algebra visually separate.
   - Preserve subject-local pacing.

3. Schedule/Plan View
   - Roll work up by subject and week/day.
   - Avoid one giant dropdown or one long global week sequence.
   - Make it clear that multiple subjects can be active in the same calendar period.

4. Feedback UI
   - After quiz submission, show:
     - score
     - strong concepts
     - weak concepts
     - likely prerequisite breaks
     - recommended repair work
     - next quiz/review plan

5. Material Pages
   - Make textbook reading comfortable.
   - Make formulas and diagrams first-class.
   - Make worked examples easy to scan.
   - Keep practice and solutions structured.

## Copy Guidelines

Prefer concrete product language:

```text
Study three subjects in parallel.
Every 15 days, get an adaptive cumulative review quiz.
Missed concepts repeat more often.
Mastered concepts appear less often.
High-weight exam topics keep resurfacing.
Feedback tells you what to repair next.
```

Avoid vague or inaccurate claims:

```text
Built for scale.
Your teacher, available 24/7.
Solve 10 problems.
70% to unlock everything.
Coming soon: Linear Algebra.
Generic founder bios.
```

## Git Workflow

UI work should happen on a branch in the main repo, not in a separate long-lived repo.

Correct workflow:

```bash
git clone git@github.com:vonarchimboldi/aleph.git
cd aleph
git checkout -b ui-refresh
```

Commit work on that branch:

```bash
git add .
git commit -m "Improve learner workspace UI"
git push -u origin ui-refresh
```

Then open a pull request into `main`.

Why:

- We can review the exact diff against current Aleph.
- We avoid losing course/content changes.
- We keep Linear Algebra Chapters 1-4 and Probability Chapters 1-10 intact.
- Vercel can produce preview deployments for the branch/PR.
- We can decide what to merge instead of reconciling divergent repos later.

A separate repo is acceptable only as a throwaway visual prototype. Serious implementation should be ported into a branch on the main repo.

## Before Opening A PR

Run:

```bash
node --check app.js
node --check service-worker.js
node scripts/verify-review-quizzes.mjs
node scripts/judge-material-quality.mjs
```

If the app shell changes, update:

```text
COURSE_PLAN_VERSION in app.js
script query string in index.html
fresh-start.html build string
CACHE_NAME and app.js asset query in service-worker.js
```

Also verify locally:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

Useful prototype logins:

```text
designer / designer
basic / basic
priyanka / l!pschitz
```

Use `designer / designer` to preview locked course content.
