# AGENTS.md

## Project Context

Aleph is a prototype learning-management and test-prep app. It currently supports a product catalog, prototype learner auth, a personalized lesson plan for Priyanka, course resources, weekly schedules, review quizzes, spaced review, feedback, and draggable/checkable task tiles.

The current app is static with a small Vercel serverless email endpoint. Data is seeded in `app.js` and stored locally in the browser with `localStorage`; this is not production authentication or production persistence.

## Session Startup

Before making changes in this repository:

1. Read `NEXT_STEPS.md`.
2. Check `git status --short`.
3. Inspect the relevant files before editing.
4. Preserve user changes. Do not reset or revert unrelated work.
5. Keep changes scoped to the user's current request.

Use `NEXT_STEPS.md` as the durable project backlog. If priorities change, update `NEXT_STEPS.md` in the same commit as the relevant project change when appropriate.

## Current Priorities

The next major priority is UI cleanup:

1. Improve the lesson-plan and schedule UI.
2. Improve the task board for the larger three-subject weekly workload.
3. Improve the learner dashboard.
4. Clean up prototype auth/admin flows.
5. Attach real problem-set content from the organized ISI practice files.
6. Deploy and verify the latest build on `https://aleph-alpha.io`.

## Local Development

Run the static app locally with:

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

The prototype currently disables forced password change so local testing can go directly into the learner workspace.

## Deployment

The GitHub remote is:

```text
git@github.com:vonarchimboldi/aleph.git
```

The production domain is:

```text
https://aleph-alpha.io
```

After app-shell changes, bump the service-worker cache name in `service-worker.js` so deployed clients refresh more reliably.

Verify deployment by checking that `https://aleph-alpha.io/app.js` contains the expected current plan/version string.

## Verification

For JavaScript-only changes, run:

```bash
node --check app.js
node --check service-worker.js
```

For deployment-related work, also verify:

```bash
curl -I https://aleph-alpha.io
```

