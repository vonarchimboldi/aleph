# Aleph

Aleph is a web app for exam-prep learning workspaces. It is currently configured for GATE DA with Basic, Advanced, Premium, and Platinum plans. The active product work is the Basic GATE DA material.

The app is currently static. It runs in the browser, stores workspace data locally with `localStorage`, and includes a small Vercel serverless endpoint for sending learner credentials by email.

## Product Shape

Aleph is organized around exams. The current exam is **GATE DA**.

GATE DA account types:

- Basic
- Advanced
- Premium
- Platinum

Each GATE DA plan has plan-level surfaces for subjects, tasks, schedule, tests, feedback, resources, and share. Higher plans can add more support and personalization on top of the same base surfaces.

The current content build is **GATE DA Basic** material for:

```text
Subjects -> Probability -> Chapter 1: Probability Foundations
```

## Current Features

- Prototype sign-in for demo learners.
- GATE DA exam workspace with Basic, Advanced, Premium, and Platinum account types.
- GATE DA plan workspace surfaces.
- Dashboard summary for subjects, tasks, schedules, tests, feedback, and resources.
- Subject, schedule, test, feedback, and resource lists.
- Weekly task board with `To do`, `Completed`, and `Not completed` columns.
- Completion rule: a task can only move to `Completed` after `Done` is checked.
- GATE DA Basic Probability Chapter 1 content in an Open Math-style structure.
- Labelled practice problems with hidden worked solutions.
- Conceptual review prompts without solutions.
- JSON import/export for local workspace data.
- Reset button to regenerate the seeded workspace.
- Service-worker caching for the web app shell.

## Current Content

The GATE DA Basic plan currently includes:

- Probability, Chapter 1: Probability Foundations

Chapter 1 includes:

- Section Preview
- Preview Activity
- Core Ideas
- Problem-Solving Techniques
- Reading Questions
- Labelled Practice Problems
- Conceptual Review
- Chapter Summary

## Local Development

From the project directory:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

Demo credentials are not documented in the repository README. Use credentials provided by the project owner.

If the app appears stale after code changes, hard refresh the page. The service worker caches the app shell.

## Email Setup

Aleph can generate learner feedback through an LLM endpoint and send learner login, feedback, overdue, and Platinum pace-check email through Vercel serverless functions backed by Resend.

Required Vercel environment variables:

```text
RESEND_API_KEY=...
FROM_EMAIL=Aleph <onboarding@your-verified-domain.com>
OPENAI_API_KEY=...
```

Optional feedback model override:

```text
OPENAI_FEEDBACK_MODEL=gpt-4.1-mini
```

If the email API is not configured, the app falls back to opening a prefilled mail draft in the user's email client.

## Platinum Upload and Feedback Test Environment

Run the local Platinum test environment when you want to test solution upload, generated feedback rendering, and browser progress sync without calling OpenAI or Resend:

```bash
node scripts/platinum-test-server.mjs
```

Open:

```text
http://127.0.0.1:8765
```

Use the prototype login:

```text
username: platinum
password: platinum
```

Then open Subjects -> Probability and Statistics -> a pattern week, upload `test-fixtures/platinum-probability-solution.md` or a small PDF/image, and click "Generate AI feedback report." When `OPENAI_API_KEY` is set locally, the test server calls the real OpenAI feedback endpoint and renders a same-page narrative report, question cards, prerequisite hypotheses, Sunday diagnostics, and adaptive next-week signals. Feedback generation does not automatically send email. The local prototype persists uploaded submission status in `localStorage`; text/Markdown content is captured directly, and small PDF/image files are saved locally as browser data URLs for test continuity.

To force deterministic mock feedback instead of a real model call:

```bash
ALEPH_FEEDBACK_MODE=mock node scripts/platinum-test-server.mjs
```

## Platinum Weekly Cron

The Platinum learner browser syncs a compact progress snapshot to `/api/platinum-progress` whenever local progress changes. The feedback page calls `/api/generate-feedback`, which sends the material context, rubric, and learner solution text to the configured LLM and stores the generated structured report. Platinum subject pages reserve a subject-local weekly review quiz workflow every Sunday. The Tests tab reserves one cross-subject cumulative spaced-review workflow every other Sunday, covering all subjects and all material covered so far; quiz content generation is intentionally pending. The Vercel cron job at `/api/cron/platinum-weekly-check` runs weekly on Sunday at 14:00 UTC and evaluates:

- due task completion
- overdue and due-today work
- due material submissions
- feedback readiness and recent LLM-generated feedback summaries
- revision-risk signals from structured feedback
- prerequisite hypotheses from detailed error analysis
- Sunday diagnostic recommendations for confirming or falsifying weak prerequisites
- next-week adaptive problem-set mix across repair, bridge, target, and cumulative blocks

The feedback schema requires `errorAnalysis`, `prerequisiteHypotheses`, `diagnosticRecommendations`, and `adaptivePlanSignal`. The browser snapshot preserves those fields, and the weekly cron aggregates them into `report.adaptivePlan`. If Sunday review confirms a prerequisite gap, next week should allocate more repair and bridge problems before advancing the nominal target topic.

Before generating the next week's Platinum Probability and Statistics material, pull the latest stored feedback evidence locally:

```bash
node scripts/pull-platinum-feedback.mjs
```

The script reads `/api/platinum-progress` from production by default and writes `reports/platinum-feedback-YYYY-MM-DD.json`. Use that local artifact as the input for lesson generation. The next week's material should be expository pages with embedded questions: topic narrative, feedback-informed repair exposition, bridge explanations, target questions, and cumulative synthesis. Do not generate bare question lists.

Platinum Probability and Statistics feedback also requires `prerequisiteChecks`. For MLE, UMP/NP, and Regression/OLS, problem sets start with basics-first prerequisite ladders before target ISI-style work:

- MLE: support, joint density/product rule, log rules, parameter space, calculus, likelihood, optimizer, estimator quality.
- UMP/NP: null/alternative distributions, tail probabilities, likelihood ratio, size calibration, randomization, power, MLR/UMP.
- Regression/OLS: vectors, covariance/variance, matrix setup, normal equations, projection geometry, estimator interpretation, OLS identities.

Each feedback report marks prerequisites as secure, shaky, missing, or not checked, then supplies repair work and bridge work. The weekly Platinum cron includes those repair/bridge items in the next-week problem-set generation mix.

Required durable snapshot storage environment variables:

```text
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
```

Optional environment variables:

```text
CRON_SECRET=...
PLATINUM_MONITOR_EMAIL=...
```

If `PLATINUM_MONITOR_EMAIL` is set, the weekly report is sent there. Otherwise, the endpoint sends learner email only when action is needed. Without KV variables, local development uses in-memory storage only; production cron checks need KV.

## Verification

For JavaScript changes:

```bash
node --check app.js
node --check service-worker.js
node scripts/verify-review-quizzes.mjs
node scripts/judge-material-quality.mjs
```
