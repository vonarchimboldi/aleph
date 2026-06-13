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
OPENAI_FEEDBACK_MODEL=gpt-5.1-mini
```

If the email API is not configured, the app falls back to opening a prefilled mail draft in the user's email client.

## Platinum Weekly Cron

The Platinum learner browser syncs a compact progress snapshot to `/api/platinum-progress` whenever local progress changes. The feedback page calls `/api/generate-feedback`, which sends the material context, rubric, and learner solution text to the configured LLM and stores the generated structured report. The Vercel cron job at `/api/cron/platinum-weekly-check` runs weekly on Sunday at 14:00 UTC and evaluates:

- due task completion
- overdue and due-today work
- due material submissions
- feedback readiness and recent LLM-generated feedback summaries
- revision-risk signals from structured feedback

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
