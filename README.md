# Aleph

Aleph is an installable test-prep learning workspace. It is currently configured for a GATE DA learner workspace with exam tiers, a personalized Platinum learner plan, and early Basic GATE DA study material.

The app is a static Progressive Web App. It runs in the browser, stores workspace data locally with `localStorage`, and includes a small Vercel serverless endpoint for sending learner credentials by email.

## Product Shape

Aleph is organized around exams. The current exam is **GATE DA**.

GATE DA account types:

- Basic
- Advanced
- Premium
- Platinum

Priyanka's current workspace is a **GATE DA Platinum** plan. Her subjects, tasks, schedule, tests, feedback, and resources live inside that GATE DA workspace.

The current content build is **GATE DA Basic** material for:

```text
Subjects -> Probability -> Chapter 1: Probability Foundations
```

## Current Features

- Prototype sign-in for the current learner.
- GATE DA exam workspace with Basic, Advanced, Premium, and Platinum account types.
- Priyanka GATE DA Platinum enrollment and personalized plan.
- Dashboard summary for subjects, tasks, schedules, tests, feedback, and resources.
- Subject, schedule, test, feedback, and resource lists.
- Weekly task board with `To do`, `Completed`, and `Not completed` columns.
- Completion rule: a task can only move to `Completed` after `Done` is checked.
- GATE DA Basic Probability Chapter 1 content in an Open Math-style structure.
- Labelled practice problems with hidden worked solutions.
- Conceptual review prompts without solutions.
- JSON import/export for local workspace data.
- Reset button to regenerate the seeded workspace.
- Installable PWA shell with service-worker caching.

## Current Content

Priyanka's Platinum plan currently includes:

- Discrete Mathematics
- Data Structures and Algorithms
- Probability and Statistics

The GATE DA Basic content currently includes:

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

Prototype login:

```text
username: priyanka
password: l!pschitz
```

If the app appears stale after code changes, hard refresh the page. The service worker caches the app shell.

## Email Setup

Aleph can send the learner login email through a Vercel serverless function backed by Resend.

Required Vercel environment variables:

```text
RESEND_API_KEY=...
FROM_EMAIL=Aleph <onboarding@your-verified-domain.com>
```

If the email API is not configured, the app falls back to opening a prefilled mail draft in the user's email client.

## Verification

For JavaScript changes:

```bash
node --check app.js
node --check service-worker.js
```
