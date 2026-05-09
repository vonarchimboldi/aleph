# Next Steps

## Immediate: UI Cleanup

- Improve the lesson-plan and schedule UI:
  - make weeks easier to scan
  - keep each subject clearly separated inside a week
  - make Probability and Statistics daily problem sets readable without overwhelming the page
- Improve the task board:
  - add subject filters
  - make task tiles more compact
  - improve week navigation
  - preserve the rule that tasks can move to Completed only after Done is checked
- Improve the learner dashboard:
  - show the current week by subject
  - show pending tasks, Sunday tests, and not-completed work
  - surface upcoming review/spaced-review work clearly
- Clean up prototype auth/admin flows:
  - keep local login simple for testing
  - separate learner login from admin actions
  - make credential email/password flows clearer
- Attach real problem-set content:
  - use the organized ISI practice HTML files
  - map questions into the five Probability and Statistics themes
  - connect daily 5-problem sets to actual problems
- Deploy and verify:
  - push changes to GitHub
  - deploy to Vercel
  - verify `https://aleph-alpha.io` serves the latest build

## Completed

- Created the GitHub repository.
- Pushed the local repository to GitHub.
- Added prototype landing/auth for first-user review.
- Deployed the app to Vercel.
- Configured `https://aleph-alpha.io`.
- Added credential email sending through Resend.
- Added product catalog and personalized learner plan structure.
- Added Discrete Mathematics and Data Structures and Algorithms 13-week plans.
- Added Probability and Statistics 13-week plan with daily problem sets and Sunday tests.
- Organized ISI practice HTML files by theme.
- Disabled forced password change for the local prototype.
- Added `AGENTS.md` so future Codex sessions load project instructions from the repo.

## Before Sharing Widely

- Add a visible app version/update indicator so users know when a new build is available.
- Add an update prompt for the service worker so new deployments are easier to refresh.
- Decide whether exported JSON files are enough for early testing or whether user data should move to a backend immediately.
- Add basic privacy language explaining that the current prototype stores progress locally in the browser.

## Backend Phase

- Move user accounts to real authentication.
- Add persistent storage for subjects, schedules, resources, tasks, quizzes, attempts, and feedback.
- Model quiz questions, answer choices, attempts, scores, and mastery by topic.
- Add feedback and analytics from quiz performance.
- Add spaced-review generation from missed questions and weak topics.
