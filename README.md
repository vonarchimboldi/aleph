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

Submitted records plus the existing submissions ledger form a durable, discoverable queue. The daily `/api/cron/diagnostic-feedback` worker at 14:15 UTC processes up to two missing/stale reports even if the browser has closed, including older submissions. New submissions take priority over refreshing older reports, so cumulative updates cannot starve the latest day. Opening a queued day starts an earlier attempt. The daily schedule is a recovery/backfill safety net, not a promise of immediate feedback; larger queues need additional worker runs or a higher-frequency schedule supported by the hosting plan. Configure `CRON_SECRET` to authenticate scheduled calls, as with the existing weekly-check worker. Generation uses the existing server `OPENAI_API_KEY` and optional `OPENAI_DIAGNOSTIC_FEEDBACK_MODEL`, falling back to `OPENAI_FEEDBACK_MODEL` and then the existing `gpt-4.1-mini` default. Tutor JSON files must be included in both function bundles, as configured in `vercel.json`.

Run `node scripts/verify-diagnostic-feedback.mjs` for submission-version isolation, retries, concurrency, cross-day refresh, backfill, attachment input, exact question coverage, output validation and safe rendering. Its model responses are test fixtures; it does not validate real model quality or use live learner records. The local test server routes the diagnostic feedback endpoint separately from `/api/math-diagnostic`.

### In-app feedback notifications

Ready diagnostic reports appear in a Notifications menu, an unread badge beside Feedback, a dashboard card with direct report links, and a diagnostic-report list in the Feedback view. The app checks when the learner signs in, returns to the tab or reconnects, and every 60 seconds while visible. Opening the menu or Feedback list does not mark anything read. The notification list contains report metadata and links, not answer text or report bodies. Existing ready reports are included automatically; queued, failed and obsolete reports are not announced as ready.

Read status is stored on the server for the learner and exact generated report version. A learner's report is acknowledged only when its heading is visible in a foreground tab and the current signed-in browser profile belongs to that learner. Tutor previews and anonymous/shared links do not acknowledge it. A regenerated report becomes unread again; delayed acknowledgements for an older version cannot clear its unread state. Switching accounts or signing out clears the previous learner's notification display and ignores late responses. These endpoints use the existing prototype learner-identity convention; they do not introduce authenticated accounts or replace the prototype's authorization model.

`GET /api/notifications?learner=LEARNER_ID` lists notifications without changing read state. `POST /api/notifications` with `{action:"read",learner,id,version}` acknowledges a current ready report version. Polling never starts model generation. `node scripts/verify-notifications.mjs` checks ready-only discovery, version-specific persistence, learner partitioning, stale acknowledgements, refresh deduplication and API validation using synthetic records. Browser checks should use synthetic accounts/responses: opening a real learner report in that learner's profile can consume a real unread notification. Use read-only metadata requests for production checks.

The `gate-da-dbms/` library contains eight chapter PDFs, complete notes, an 80-problem practice book and a separate solutions guide. Both Basic and Platinum workspaces expose the library under Database Management and Warehousing and Resources. Existing task progress is preserved.

Run `node scripts/verify-dbms-pack.mjs` to check PDF downloads, account routing and progress migration. Source references and review limitations are included in the library metadata and notes.

DBMS sessions start at `gate-da-dbms/review.html`. Chapter 1 completion enables adaptive recall; further completed chapters enable questions on their concepts. The 43 reference entries cover all 40 recipes; they are trusted generation context, not the fixed review queue. `/api/dbms-review` uses the existing server-side OpenAI key to assess recent written answers, self-ratings and material feedback, generate three new targeted cards, then run a separate automated question/answer check. Incorrect reasoning must not be treated as mastery because it was self-rated Easy. The first session uses fresh diagnostic examples from completed chapters. Subsequent sessions combine due generated cards with three new cards, up to ten total. There is no silent fixed-deck fallback when generation fails.

Written responses and unfinished sessions survive reload. Learners can record chapter/card/problem feedback, export or restore a learner-specific backup including generated cards, and download their generated cards as an Anki TSV. Progress remains browser-local, but recent responses and feedback are sent to the AI service when generating a review. It does not automatically sync to the tutor or another device. AI checks and diagnoses are not formal verification or exam mastery scores. Run `node scripts/verify-dbms-review.mjs` and `node scripts/verify-dbms-adaptive.mjs` for scheduling, backup compatibility, evidence handling, scope and generator/checker tests. The adaptive tests mock model output; production service availability needs a separate live check.

Reviewed diagnostic feedback can be published through POST `/api/math-diagnostic-feedback-review` with an Ed25519-signed JSON payload containing learner, day, expectedGeneratedAt, report and expiresAt (within five minutes). The verification key is in `api/_feedback-review-key.js`; the operator signing key stays outside the repository. The route validates exact question/cross-day coverage, rejects stale evidence/report versions, archives the previous record, uses revision-based compare-and-swap, and creates the normal feedback-ready notification. Run `node scripts/verify-reviewed-feedback.mjs` for signature/authorization checks. No learner reports or private signing keys belong in source control.

## Mathematics remediation

`/math-remedial/` provides ten 90-minute sessions (45 minutes foundations and 45 minutes diagnostic-led repair). The server requires all ten diagnostic submissions and then releases days sequentially after submission. Each day first records a short retrieval attempt before revealing teaching. Learner drafts, original retrieval attempts, submission snapshots and receipts are server-saved; PDF/image working files are limited to 3 MB. Failed saves preserve unsaved text in the current page. Submissions require tutor review; automatic feedback is not provided for this course.

`api/math-remedial.js` uses the existing diagnostic KV configuration and learner identity convention. This shares the prototype's identity limitations; it does not introduce stronger authentication. The public content module contains teaching and prompts only. Tutor answers, evidence and the four-pass review remain outside this repository in the private authoring workspace. `node scripts/verify-math-remedial.mjs` runs isolated synthetic persistence and release checks.

### Focused logic repair

`math-remedial/logic-repair.html` is a printable, paper-based supplement with two 45-minute replacement sessions on quantifiers, implication, proof and rational inequalities. It does not save or submit responses. The tutor key remains outside the repository. A learner-specific learning notice links to the worksheet; opening that notice acknowledges it, while diagnostic feedback retains its visible-report acknowledgement flow. Run `node scripts/verify-learning-notices.mjs` and `node scripts/verify-notifications.mjs` with isolated in-memory records.

## Daily assigned-material tracker

The Platinum dashboard has a server-backed list of dated material assignments. The reviewer views Priyanka's assignments; the learner views their own. Choose a published material, due day, and session length (default 90 minutes). Undated course material is not assigned automatically, and existing local task-board data is unchanged. Assignments can be completed, reopened, rescheduled, or cancelled. A server submission for the same learner/material, recorded after the assignment was created, also completes it. Reading a page or saving a local exercise attempt does not establish completion or mastery.

Assignment dates use `America/Toronto`. Unfinished work becomes overdue after its due day ends. Assignment and overdue notices appear in both learner and reviewer dashboard bells, with separate read markers. Completed/cancelled notices disappear. The daily cron `/api/cron/material-tracker` runs at 07:00 UTC (02:00 standard time / 03:00 daylight time in Toronto) and emails one digest of overdue assignments per learner per local check day, including unfinished earlier assignments. It works without an open browser. Due-today work is not emailed early.

Storage requires the configured KV service. Automatic email additionally requires `RESEND_API_KEY`, `FROM_EMAIL`, `CRON_SECRET`, and an enabled monitor-recipient configuration. The cron rejects requests without its bearer secret. The dashboard shows whether delivery is ready. Email is initially disabled; there is no fallback to emailing the learner. Recipient changes require a short-lived Ed25519 signature using the existing operator publisher key. The signed payload has `purpose: "aleph-material-tracker-config-v1"`, learner, expectedRevision, email, enabled, and an expiresAt timestamp within five minutes; POST the payload string/signature with action `configure` to `/api/material-tracker`. Private keys and full recipient addresses must stay out of the repository; ordinary tracker responses expose only a masked recipient.

KV revision checks prevent lost updates. Reminder workers claim a lease and use a frozen request body plus a provider idempotency key. A durable sent marker prevents repeated sends; failed deliveries can retry. Ambiguous delivery retries stop after 23 hours, and destination changes suspend an already-pending digest for review. Existing prototype sign-in is unchanged: learner identifiers are not authenticated server sessions, and dashboard role controls do not establish server authorization.

Verify with `node scripts/verify-material-tracker.mjs` (isolated in-memory storage and mock email; refuses live KV configuration). The local Platinum test server also serves the real tracker endpoint when `ALEPH_DIAGNOSTIC_MEMORY=1` is set.

### Review assignments: November 9–15, 2026

This week assigns Days 1–7 of Calculus Phase 1, the Skiena DSA review, and the DBMS review, with one 90-minute material from each subject per day. This is 21 assignments and 4½ study hours daily. `node scripts/assign-review-week.mjs` previews the exact week. `--apply` explicitly writes it to Priyanka's live tracker; reruns skip matching assignments and preserve completion. Importing the script has no network side effects. It stops if a material already has unfinished work assigned to another date.

The learner's mandatory-completion notification states the admin's escalation policy. It explicitly distinguishes that policy from implementation status: automatic email remains pending activation, and account locking requires admin action. No automatic account-lock rule is added by the notice.

## Two-week study and mentor workflow

The daily material tracker now contains a two-week study agreement. Activation proposes the existing assignments; it never fabricates learner acceptance, changes past deadlines, creates new curriculum content, or resets uploaded work. The learner explains the purpose, identifies a concrete first step and start cue, predicts understanding, estimates each assignment and checks the total against available time. An unanswered clarification question or a workload above stated capacity prevents plan acceptance. Past plans cannot be retroactively accepted.

The learner can report a question, unrealistic workload, exact blocker, or feedback need, including what was tried and what response is needed. Requests to move, reduce or cancel work remain pending until an authorized mentor approves or rejects them with feedback. Reduced sessions require an explicit reduced scope. Normal learner requests cannot silently edit deadlines or cancel assignments. Original plans, agreed commitments, requests, replies, work-log edits and reflection edits remain in server history. Approval after a deadline does not erase a missed commitment; a prior mathematics question alone is not treated as communication about missing the deadline.

Actual work logs record time and concrete work on each date. Manual completion during the trial requires a work log; receipt-based submission completion remains available. The evening reflection requires planned versus completed work, reasons for unfinished items, actual work, easy/hard aspects, evidence of understanding, a concrete next action, a specific feedback request and tomorrow's proposal. Self-assessed understanding is compared with the earlier prediction. Check-ins are separate from assignment completion, can be amended with retained versions, and remain labelled late when submitted after their day. Missing check-ins and estimated time exceeded generate dashboard reminders. Reporting difficulty does not impose an automatic penalty.

Mentors can respond to problem reports and daily reflections. The learner can record how feedback was used and what happened. Each Sunday preparation asks for evidence-based strengths and weaknesses, estimation lessons, the working relationship, and a realistic next-week proposal. Preparation does not assert that a conversation occurred; the mentor separately records feedback, duration and agreed next steps after the review. There is no automatic account lock or invented strike threshold. Repeated missed agreed commitments without prior communication are flagged for mentor review.

The reviewer dashboard shows reports, requests, reflections, timing and Sunday reviews. Mentor decisions require an additional signed, learner-scoped, one-day capability; a public prototype reviewer identity alone does not authorize decisions. Run `node scripts/study-admin.mjs --access-file` locally to create the private access file and load it in **Authorize mentor decisions**. The existing operator private key stays on disk and is never uploaded. `--start` explicitly activates the two-week pilot against the production API. Never commit access files. The underlying prototype learner sign-in remains unchanged and is not a verified server session; learner reports and self-assessed mastery are not independent evidence.

Assignment, agreement and feedback notices now pass through the notification client's same-origin material-link allowlist. Opening a workflow or assignment notice records its own read marker; it does not accept a plan, approve a request or complete work. The existing daily email job includes the previous day's study report when configured, even when all assignments are finished. Automatic sending still requires the server's scheduler secret and email configuration; dashboard notices work independently. No real email is sent by tests.

Run `node scripts/verify-study-workflow.mjs` for synthetic agreement, capacity, permission, immutable-history, reflection, late-change, Sunday review and feedback-loop checks. Existing tracker, notification and curriculum checks remain separate.
