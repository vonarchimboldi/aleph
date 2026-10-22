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

Priyanka's Platinum Linear Algebra schedule runs October 1–November 30, 2026,
with eight Thursday–Wednesday weeks and a final November 26–30 block.
`platinum-linear-algebra.js` assigns M&M Chapters 1–6 at one chapter per week
through November 11, followed by consolidation. H&H Chapter 1 closes by
October 31; Chapter 2 begins November 1 and closes November 30. Week 5 has
separate October and November reading assignments to respect the month boundary.
The edition mapping (M&M 2018 / H&H fifth edition) awaits confirmation.

Open **Subjects → Linear Algebra** for readings, physical models, numerical
experiments, and separate practice/review submissions. Models include force
control, paraxial optics, sensor calibration, work, coupled springs, and
deformation. Bamberg & Sternberg informs the teaching approach; it is not an
additional assigned book. Selected Alexander Paulin Berkeley Math 54 (Spring 2022)
videos accompany Weeks 1–8, with Sunday viewing deadlines before experiments
and a physical-model checkpoint to include with practice. Week 9 is consolidation.
Each physical example now develops quantities, assumptions, equations, a small
worked example, physical interpretation, and model limitations. Gamma Digamma
videos from the supplied playlist are optional topic-matched suggestions.
The selections complement the books; GATE-specific coverage still needs explicit
practice on LU, partitioned/idempotent matrices, and quadratic forms.
The Tasks selector includes **Linear Algebra Week 1–9**; Schedule displays
their actual dates separately from the older plan's week numbering. Each
block has reading, experiment, practice, review, and feedback/recheck dates.
Study hours are unset. Earlier assignment uploads remain accessible separately
and do not count as submissions for the revised physical problems.
Feedback uses the existing upload/report flow. Learners or course designers
choose repairs and next-week adjustments from the report; automatic syllabus
rewriting is not implemented. Book exercise numbers must be selected from the
learner's edition and included with the submission.

Priyanka's Machine Learning schedule adapts all 17 lectures from Rebecca
Willett's Fall 2025 Mathematical Foundations of Machine Learning course into
eight weeks, October 1–November 25, 2026. The last correction is due November 26.
`platinum-machine-learning.js` links published lecture notes; videos remain
unassigned. Each week has a prerequisite bridge, readings, a computational
experiment, original practice questions, a review, and a 48-hour correction.
Open **Subjects → Machine Learning** for the eight blocks and 16 submission
slots; **Tasks** and **Schedule** keep ML and LA week numbers separate.
Assignments are Aleph adaptations, not official course homework.

For JavaScript changes:

```bash
node --check app.js
node --check service-worker.js
node --check platinum-linear-algebra.js
node scripts/verify-platinum-linear-algebra.mjs
node --check platinum-machine-learning.js
node scripts/verify-platinum-machine-learning.mjs
node scripts/verify-review-quizzes.mjs
node scripts/judge-material-quality.mjs
```
# DBMS exam pack

## Platinum mathematical diagnostic

`math-diagnostic/` publishes ten checked 60-minute sessions under the Platinum subject and resource lists. Learners see the current day's eight core questions and tutor-selected follow-ups. Reasoning/confidence/familiarity autosave to the diagnostic server, with a browser recovery copy. Submitting a finished day creates a server receipt and unlocks the next day. Learners can upload one PDF/image up to 3 MB per day and export or restore a backup. No deadlines or new scheduled tasks are invented. Existing study progress is preserved.

Reviewer/course-designer prototype roles can open `math-diagnostic/?mode=tutor&learner=LEARNER_ID` to select at most two follow-ups, use item-level scoring anchors, and download the administration, solutions and profile files. Keep later questions and answers out of the learner workflow. The day/role controls are UI controls under Aleph's existing local prototype authentication; static files are not a secure proctored-exam access boundary. Responses and tutor scoring sync through `/api/math-diagnostic` into the existing durable KV store. Drafts remain separate from the last submitted attempt. Confirmed submissions are also recorded in the Platinum submissions ledger. Optimistic revisions reject stale-device overwrites; conflicting browser copies are retained for resolution. Legacy completed browser records migrate when the learner reopens Aleph or the diagnostic; partial work migrates as drafts. Production rejects memory-only storage. No automatic numerical grading or overall ability score is claimed.

Run `node scripts/verify-diagnostic-sync.mjs` for server persistence, migration, upload, conflicts and offline handling. Use `ALEPH_DIAGNOSTIC_MEMORY=1` only for the local test server. Run `node scripts/verify-math-diagnostic.mjs` to check all ten daily PDFs, 80 distinct core items, solution-field separation, sequential release, backup validation, Platinum-only integration and progress migration. Source/review records remain in `/Users/abhinav/Platinum-Math-Diagnostic`. The test is author-reviewed/computation-checked, not psychometrically calibrated.

### Feedback after diagnostic submission

After a day is submitted, its workspace starts feedback in a separate request and polls for the saved report. Submission and next-day unlocking do not wait for generation. The report remains on the server and is available when the learner returns. Existing submitted days are eligible too. Each report assesses that day's submitted text and PDF/image, using the checked question rubric, and compares typed responses across all submitted days. A second model pass reviews the draft against the original evidence before publication. Repeated skills must be reconciled explicitly with question-level evidence from every participating day. It explicitly records the limits of its evidence; previous days' attachments are not silently treated as reviewed.

The teaching policy is to speak candidly to the learner, recognize demonstrated strengths, and use errors to explain the bigger mathematical picture. Reports contain question-by-question evidence, corrections and teaching; specific mathematical skills; higher-level habits of reasoning; evidence-backed cross-day patterns; one connected mathematical lesson with a worked example; and up to three next steps with success criteria. Unanswered items remain unassessed rather than proving a gap. Conflicting evidence calls for a check. AI tutor feedback is not a calibrated ability score or a claim of independent mastery.

`GET /api/math-diagnostic-feedback?learner=LEARNER_ID&day=1` returns not submitted, queued, generating, failed or ready. `POST` with `{learner,day}` starts one eligible report; answers, model instructions and rubrics are loaded on the server, not accepted from that request. A version hash includes all submitted snapshots and the teaching-policy version. Draft edits do not invalidate a report; resubmissions and newly submitted days do, so the cumulative picture is refreshed. An atomic lease prevents simultaneous generation; expired leases recover and failures back off. Failed jobs never become fabricated fallback feedback.

Submitted records plus the existing submissions ledger form a durable, discoverable queue. The daily `/api/cron/diagnostic-feedback` worker at 14:15 UTC processes up to three missing/stale reports even if the browser has closed, including older submissions. Opening a queued day starts an earlier attempt. The daily schedule is a recovery/backfill safety net, not a promise of immediate feedback; larger queues need additional worker runs or a higher-frequency schedule supported by the hosting plan. Configure `CRON_SECRET` to authenticate scheduled calls, as with the existing weekly-check worker. Generation uses the existing server `OPENAI_API_KEY` and optional `OPENAI_DIAGNOSTIC_FEEDBACK_MODEL`, falling back to `OPENAI_FEEDBACK_MODEL` and then the existing `gpt-4.1-mini` default. Tutor JSON files must be included in both function bundles, as configured in `vercel.json`.

Run `node scripts/verify-diagnostic-feedback.mjs` for submission-version isolation, retries, concurrency, cross-day refresh, backfill, attachment input, exact question coverage, output validation and safe rendering. Its model responses are test fixtures; it does not validate real model quality or use live learner records. The local test server routes the diagnostic feedback endpoint separately from `/api/math-diagnostic`.

The `gate-da-dbms/` library contains eight chapter PDFs, complete notes, an 80-problem practice book and a separate solutions guide. Both Basic and Platinum workspaces expose the library under Database Management and Warehousing and Resources. Existing task progress is preserved.

Run `node scripts/verify-dbms-pack.mjs` to check PDF downloads, account routing and progress migration. Source references and review limitations are included in the library metadata and notes.

DBMS sessions start at `gate-da-dbms/review.html`. Chapter 1 completion enables adaptive recall; further completed chapters enable questions on their concepts. The 43 reference entries cover all 40 recipes; they are trusted generation context, not the fixed review queue. `/api/dbms-review` uses the existing server-side OpenAI key to assess recent written answers, self-ratings and material feedback, generate three new targeted cards, then run a separate automated question/answer check. Incorrect reasoning must not be treated as mastery because it was self-rated Easy. The first session uses fresh diagnostic examples from completed chapters. Subsequent sessions combine due generated cards with three new cards, up to ten total. There is no silent fixed-deck fallback when generation fails.

Written responses and unfinished sessions survive reload. Learners can record chapter/card/problem feedback, export or restore a learner-specific backup including generated cards, and download their generated cards as an Anki TSV. Progress remains browser-local, but recent responses and feedback are sent to the AI service when generating a review. It does not automatically sync to the tutor or another device. AI checks and diagnoses are not formal verification or exam mastery scores. Run `node scripts/verify-dbms-review.mjs` and `node scripts/verify-dbms-adaptive.mjs` for scheduling, backup compatibility, evidence handling, scope and generator/checker tests. The adaptive tests mock model output; production service availability needs a separate live check.
