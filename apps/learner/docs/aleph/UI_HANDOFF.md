# Aleph UI Handoff

## What This App Is

Aleph is a prototype learning-management and test-prep app for structured exam preparation.

The current product is organized around exams and account tiers. The active exam is **GATE DA**, with Basic, Advanced, Premium, and Platinum tiers. The app currently supports prototype login, learner workspaces, subjects, schedules, task boards, resources, review quizzes, feedback records, and standalone daily material pages.

The app is static. Most data is seeded in `app.js` and stored in the browser with `localStorage`. There is a small Vercel serverless endpoint for sending email. This is not production authentication or production persistence yet.

Live site:

```text
https://aleph-alpha.io
```

Repository:

```text
git@github.com:vonarchimboldi/aleph.git
```

## How To Run Locally

From the repo root:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

Useful prototype accounts:

```text
designer / designer
basic / basic
priyanka / l!pschitz
```

Use `designer / designer` when checking locked course content, because the designer account can preview material that a learner account may not have unlocked.

## Product Principles

Aleph should feel like a serious learning workspace, not a marketing page.

Core principles:

- The first screen after login should help the learner act: continue current work, see pending tasks, review weak areas, and open the right material quickly.
- Content should be organized by exam, plan, subject, week, day, chapter, and material. Avoid giant single-page dropdown workflows.
- Learners should see one clear path: read material, solve problems, submit work, receive feedback, review weak concepts.
- Course designers/admins should be able to preview locked learner content without breaking learner gating.
- Review quizzes are diagnostic, not just scorekeeping. They must identify concept gaps, prerequisite gaps, and repair actions.
- Feedback should be useful: what was right, what was wrong, what concept failed, and what to do next.
- UI should be dense enough for repeated study work, but not visually cluttered.
- Math content should use clear typography, reliable diagrams, readable formulas, and mobile-safe layouts.
- Physical intuition matters, especially in Linear Algebra. Transformations, invariants, dimension, rank, nullity, eigenvectors, determinants, and projections should be shown visually wherever possible.

## Content Principles

Content generation follows these rules:

- Build concepts from concrete examples before abstraction.
- Use two or three running examples per chapter when possible.
- Teach the exam skill explicitly, not just the definition.
- Practice should progress from one concept, to two mixed concepts, to three mixed concepts.
- Quizzes do not need a fixed number of questions. They should test the necessary concepts well.
- Every review quiz question should have metadata for target concept, prerequisites, difficulty, confidence weight, and repair feedback.
- Dashboard and feedback surfaces should use quiz results to show learner strengths, weaknesses, and next actions.

## What Already Exists

Current major app surfaces:

- Login and local prototype accounts
- Exam and plan selection
- Dashboard
- Subjects
- Schedule
- Task board
- Tests/review quizzes
- Feedback
- Resources
- Settings/share/export

Current GATE DA Basic content:

- Probability Chapters 1-10
- Linear Algebra Chapter 1: Vector Spaces and Coordinates
- Linear Algebra Chapter 2: Linear Transformations and Matrices
- Graph-backed objective review quizzes for built chapters
- Labelled practice and worked solutions for built chapters
- Dashboard/feedback wiring for review quiz attempts

Current Priyanka Platinum content:

- Personalized Probability and Statistics weekly material
- Week 1 daily material pages
- Daily submission and feedback flow
- Email notification path for feedback
- Day 7 weekly ISI-style review quiz
- Competition Math material for Week 1 Day 1

Useful source files and directories:

```text
app.js
styles.css
index.html
service-worker.js
fresh-start.html
psets/
gate-da-papers/
scripts/verify-review-quizzes.mjs
scripts/judge-material-quality.mjs
NEXT_STEPS.md
AGENTS.md
```

## Current UI Priority

The next major work is UI cleanup.

Highest-priority areas:

- Improve the lesson-plan and schedule UI.
- Improve the task board for a larger multi-subject workload.
- Improve the learner dashboard.
- Clean up prototype auth/admin flows.
- Make textbook pages and problem-set pages more readable.
- Make diagrams and formulas first-class, reliable visual elements.

For the Platinum plan, the intended flow is:

```text
Week -> Day -> Material page -> Submit solutions -> Feedback page/email
```

For GATE DA Basic, the intended flow is:

```text
Subject -> Chapter -> Read material -> Practice -> Review quiz -> Feedback/dashboard repair actions
```

## Verification

For JavaScript/app changes:

```bash
node --check app.js
node --check service-worker.js
node scripts/verify-review-quizzes.mjs
node scripts/judge-material-quality.mjs
```

After app-shell changes, bump the app build string in `app.js`, update the script query in `index.html` and `fresh-start.html`, and bump the cache name in `service-worker.js`.

Current deployed build at the time this file was written:

```text
seeded-user-canonical-workspace-v73
```

## Notes For A UI Collaborator

Most app state, seeded content, rendering functions, and workflows are currently concentrated in `app.js`. This is not ideal long term, but it is the current prototype shape.

Before changing behavior, read `NEXT_STEPS.md` and check `git status --short`. Do not reset or overwrite unrelated local changes.

The current design goal is not to add more decoration. It is to make the existing learning workflow clearer, faster, and easier to trust.
