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
- Reorganize exam content:
  - keep exams as the top-level account/program container
  - show GATE DA account types as Basic, Advanced, Premium, and Platinum
  - keep Priyanka's customized learner workspace under GATE DA Platinum
  - build current GATE DA material under the Basic version
  - show GATE DA subjects inside the selected GATE DA account type
  - make Probability chapters follow the Open Math textbook structure
- Clean up prototype auth/admin flows:
  - keep local login simple for testing
  - separate learner login from admin actions
  - make credential email/password flows clearer
- Attach real problem-set content:
  - review the Probability Foundations pilot section in the app
  - build the remaining GATE DA Probability sections one at a time
  - later attach past exam PDFs and replace/annotate pilot problems with source citations
  - connect daily problem sets to the section practice and review flow
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
- Added exam containers and personalized learner plan structure.
- Added Discrete Mathematics and Data Structures and Algorithms 13-week plans.
- Added Probability and Statistics 13-week plan with daily problem sets and Sunday tests.
- Added a GATE DA Basic -> Probability -> Chapter 1 pilot section with labelled practice, worked solutions, conceptual review prompts, and Open Math-style reading/summary structure.
- Added Probability Chapter 2: Conditional Probability with textbook exposition, labelled practice, and objective review logging.
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
