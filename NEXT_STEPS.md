# Next Steps

## Tomorrow: Deploy, Onboard, Verify Updates

- Deploy the current `main` branch from GitHub to a public host.
- Preferred deployment targets: Netlify, Vercel, or Cloudflare Pages.
- Confirm the deployed landing page loads.
- Onboard the first user:
  - username: `priyanka`
  - temporary password: `l!pschitz`
- Verify Priyanka can sign in and view:
  - grouped weekly schedule
  - Discrete Math and DSA resources
  - weekly task tiles
  - task movement rules
- Push a small visible change to GitHub.
- Confirm the deployed app updates after the host redeploys.
- Check whether the service worker requires a hard refresh or whether we need an in-app update prompt.

## Completed

- Created the GitHub repository.
- Pushed the local repository to GitHub.
- Added prototype landing/auth for first-user review.

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
