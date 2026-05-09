# Next Steps

## Next Session: Deploy and Share

- Create a GitHub repository for this project.
- Push the local repository to GitHub.
- Deploy the static PWA to a public host such as Cloudflare Pages, Netlify, Vercel, or GitHub Pages.
- Share the deployed URL with the first user.
- Verify the user can open the app, install it, view the schedule, open resources, and use the task board.

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
