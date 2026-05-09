# Aleph

Aleph is an installable learning-management workspace for structured independent study. The first prototype is built around a June-August learning plan for Priyanka, with weekly schedules, course resources, review quizzes, spaced review, and task tracking.

The app is currently a static Progressive Web App. It runs entirely in the browser and stores learner progress locally. This is enough for an early shareable demo, but production authentication, shared data, quiz attempts, feedback, and analytics will require a backend.

## Current Features

- Prototype landing page with local demo sign-in.
- Registered learner workspace for `priyanka`.
- Installable PWA shell with service-worker caching.
- Subject planning for:
  - Discrete Mathematics
  - Data Structures and Algorithms
  - Probability and Statistics placeholder
- Discrete Mathematics 13-week plan using:
  - CMU 21-228 Discrete Mathematics by Po-Shen Loh
  - MIT 6.1200J Mathematics for Computer Science, Spring 2024
  - MIT 18.200 Principles of Discrete Applied Mathematics, Spring 2024
- Data Structures and Algorithms 13-week plan using:
  - Aho/Ullman Foundations of Computer Science
  - Cartesian interactive DSA handbook
- Weekly schedule grouped by week and subject.
- Weekly task tiles for lectures, assignments, review quizzes, and spaced reviews.
- Task boards for `To do`, `Completed`, and `Not completed`.
- Completion rule: a task can only move to `Completed` after its `Done` checkbox is checked.
- Course resource links on the dashboard.
- JSON import/export for local workspace data.
- Reset button to regenerate the current course plan.

## Demo Credentials

```text
username: priyanka
password: l!pschitz
```

These credentials are for the local prototype only. They are not production authentication.

## Local Development

From the project directory:

```bash
python3 -m http.server 4180
```

Then open:

```text
http://127.0.0.1:4180/index.html
```

If the app appears stale after code changes, hard refresh the page. The service worker caches the app shell.

## Deployment Plan

The next deployment milestone is:

1. Deploy the current `main` branch to Netlify, Vercel, or Cloudflare Pages.
2. Share the deployed URL with Priyanka.
3. Verify sign-in, resources, schedule, and task boards.
4. Push a small visible change to GitHub.
5. Confirm the deployed app updates after redeploy.
6. Decide whether the service worker needs an in-app update prompt.

## Roadmap

### Near Term

- Deploy the app publicly.
- Onboard the first user.
- Add a visible app version/build indicator.
- Add an update-available prompt for service-worker refreshes.
- Improve schedule filtering by subject and week.
- Add richer resource metadata for readings, lectures, assignments, and problem sets.
- Add quiz placeholders for weekly review and spaced-review sessions.

### Backend Phase

- Replace local demo auth with real authentication.
- Add persistent database storage for users, subjects, plans, resources, tasks, quizzes, attempts, answers, and feedback.
- Add role support for learner/admin workflows.
- Store learner progress across devices.
- Add file/resource storage for PDFs, notes, and assignment materials.

### Quiz and Analytics Phase

- Build review quizzes inside the app.
- Track quiz attempts, answers, scores, and topic-level mastery.
- Generate feedback from quiz results.
- Create spaced-review queues from missed questions and weak topics.
- Add dashboards for progress, effort, mastery, and upcoming review load.

## Architecture Direction

For the prototype, Aleph is static:

```text
Browser PWA
  -> localStorage/sessionStorage
  -> JSON import/export
```

For the first production version, the likely architecture is:

```text
Frontend PWA
  -> Auth
  -> API/backend
  -> Postgres database
  -> Object storage for resources
```

Supabase is a strong candidate for the first backend because it provides authentication, Postgres, storage, and row-level security in one platform.
