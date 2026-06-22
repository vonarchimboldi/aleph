# aleph — Use Cases & User Flows

> **Purpose:** A user-centered catalog of what learners, instructors, and admins can do in aleph, organized by category and subcategory. Each use case shows the trigger, step-by-step flow, and outcome.
>
> **Scope:** Covers Free/Basic/Platinum plans, multi-exam support (GATE DA, ISI, CMI, IIT JAM, NBHM), and the core learning-feedback-adaptation loop.

---

## How to Read This Document

| Field | Meaning |
|-------|---------|
| **UC-ID** | Unique use-case identifier |
| **Actor** | Who performs the action (Learner, Visitor, Instructor, Admin, System) |
| **Category / Subcategory** | Functional area |
| **Use Case** | Short title |
| **Trigger** | What starts the flow |
| **Flow** | Step-by-step sequence |
| **Outcome** | End state and what happens next |
| **Plan** | Free / Basic / Platinum / Admin |

---

## 1. Onboarding & Account Management

### 1.1 Discovery & Signup

| UC-ID | Actor | Category | Subcategory | Use Case | Trigger | Flow | Outcome | Plan |
|-------|-------|----------|-------------|----------|---------|------|---------|------|
| UC-01 | Visitor | Onboarding | Discovery | Browse landing page | Opens aleph site | 1. Visitor sees hero, exam badges, course stats, problem teaser.<br>2. Can interact with sample problem without login.<br>3. Clicks CTA to sign up. | Visitor understands product positioning and starts signup. | Free |
| UC-02 | Visitor | Onboarding | Signup | Create account with email | Clicks "Start free trial" | 1. Enters email, password, display name.<br>2. Selects target exam (GATE DA / ISI / CMI / IIT JAM / NBHM).<br>3. Chooses Free plan.<br>4. Submits; Supabase Auth creates user.<br>5. Trigger creates `profiles` row. | Account created; confirmation email sent. | Free |
| UC-03 | Visitor | Onboarding | Demo | Use demo shortcut | Clicks `?demo=basic` or `?demo=designer` | 1. System seeds hardcoded demo user.<br>2. Loads canonical plan for that role.<br>3. Redirects to dashboard. | Visitor experiences workspace without signup. | Free |
| UC-04 | Learner | Onboarding | Plan selection | Upgrade from Free to Basic/Platinum | Clicks "Upgrade" | 1. Sees plan comparison.<br>2. Selects plan.<br>3. Payment flow (deferred to Stripe).<br>4. `profiles.plan_id` updated.<br>5. Unlocks corresponding subjects/chapters. | Plan upgraded; new content accessible. | Basic / Platinum |

### 1.2 Authentication

| UC-ID | Actor | Category | Subcategory | Use Case | Trigger | Flow | Outcome | Plan |
|-------|-------|----------|-------------|----------|---------|------|---------|------|
| UC-05 | Learner | Account | Login | Sign in | Clicks "Sign in" | 1. Enters email + password.<br>2. Supabase validates.<br>3. Middleware sets session.<br>4. Redirects to `/dashboard`. | Logged in; dashboard loads. | All |
| UC-06 | Learner | Account | Security | Reset forgotten password | Clicks "Forgot password" | 1. Enters email.<br>2. Supabase sends reset link.<br>3. Clicks link → new password form.<br>4. Password updated. | Regains access. | All |
| UC-07 | Learner | Account | Profile | Update profile | Goes to Settings | 1. Edits name, avatar, preferred exam.<br>2. Saves; `profiles` updated. | Profile updated. | All |
| UC-08 | Learner | Account | Data | Export workspace data | Clicks "Export data" in Settings | 1. System compiles profile, enrollments, quiz attempts, task attempts, feedback records.<br>2. Downloads JSON file. | Learner has portable backup. | All |
| UC-09 | Learner | Account | Data | Import workspace data | Clicks "Import data" | 1. Uploads JSON.<br>2. System validates schema version.<br>3. Merges into Supabase tables.<br>4. Clears localStorage if migrating from prototype. | Progress restored from backup. | All |

---

## 2. Learning Workspace Navigation

### 2.1 Dashboard & Navigation

| UC-ID | Actor | Category | Subcategory | Use Case | Trigger | Flow | Outcome | Plan |
|-------|-------|----------|-------------|----------|---------|------|---------|------|
| UC-10 | Learner | Workspace | Dashboard | View subject overview | Logs in | 1. Dashboard shows 3 subject cards (Probability, Linear Algebra, Calculus).<br>2. Each card shows progress bar, current chapter, next action.<br>3. Shows streak counter and upcoming review banner. | Learner sees what to study next. | All |
| UC-11 | Learner | Workspace | Resume | Continue where left off | Clicks "Continue" on dashboard | 1. System reads `workspace_states`.<br>2. Redirects to `/learn/[subject]/[chapter]/[section]`.<br>3. Loads last viewed task. | Learner resumes exactly where they stopped. | All |
| UC-12 | Learner | Workspace | Navigation | Switch between 9 views | Clicks sidebar nav | 1. Clicks Dashboard / Subjects / Tasks / Schedule / Tests / Feedback / Resources / Share.<br>2. View changes; state preserved. | Learner navigates app shell. | All |
| UC-13 | Learner | Workspace | Tasks | Manage weekly task board | Opens Tasks view | 1. Sees To do / Completed / Not completed columns.<br>2. Drags or checks tasks.<br>3. Must mark "Done" before "Completed".<br>4. System updates `tasks` status. | Weekly plan stays current. | Basic / Platinum |

### 2.2 Subject & Chapter Flow

| UC-ID | Actor | Category | Subcategory | Use Case | Trigger | Flow | Outcome | Plan |
|-------|-------|----------|-------------|----------|---------|------|---------|------|
| UC-14 | Learner | Workspace | Subject view | View chapter path | Clicks a subject card | 1. Loads `/learn/[subject]`.<br>2. Renders chapter path (Brilliant-style nodes).<br>3. Completed = filled; current = highlighted; locked = dimmed. | Learner sees overall subject journey. | All |
| UC-15 | Learner | Workspace | Chapter view | View section list | Clicks a chapter | 1. Loads `/learn/[subject]/[chapter]`.<br>2. Lists sections with type badges.<br>3. Shows lock status per section. | Learner picks next section. | All |
| UC-16 | Learner | Workspace | Gating | Understand why a section is locked | Hovers locked section | 1. Tooltip shows required previous quiz score.<br>2. Links to prerequisite section. | Learner knows how to unlock. | All |
| UC-17 | Designer | Workspace | Preview | Preview locked content | Logs in as designer or uses `?preview=true` | 1. Gating UI bypassed.<br>2. Content visible.<br>3. Progress not mutated. | Content team reviews unpublished material. | Admin/Designer |

---

## 3. Content Consumption

### 3.1 Reading Material

| UC-ID | Actor | Category | Subcategory | Use Case | Trigger | Flow | Outcome | Plan |
|-------|-------|----------|-------------|----------|---------|------|---------|------|
| UC-18 | Learner | Content | Reading | Read a section | Clicks "Start" on a section | 1. Loads section workspace.<br>2. Shows preview activity.<br>3. Renders reading material with semantic blocks (Definition, Example, Checkpoint, Principle, Warning, Strategy).<br>4. KaTeX renders math. | Learner completes reading. | All |
| UC-19 | Learner | Content | Comprehension | Answer reading questions | After reading | 1. 2–3 reading questions appear.<br>2. Learner answers; gets hint/feedback.<br>3. Answers not graded, only for self-check. | Learner confirms comprehension before problems. | All |
| UC-20 | Learner | Content | Progress | Track reading progress | Scrolls reading panel | 1. Thin progress bar updates.<br>2. Completion stored in local state. | Learner sees how much remains. | All |

### 3.2 Problem Sets

| UC-ID | Actor | Category | Subcategory | Use Case | Trigger | Flow | Outcome | Plan |
|-------|-------|----------|-------------|----------|---------|------|---------|------|
| UC-21 | Learner | Content | Practice | Solve problems in 5-3-2 progression | Reaches problem set | 1. Sees 5 concept → 3 integration → 2 challenge/ISI problems.<br>2. Enters answer or selects option.<br>3. Submits; immediate correctness check.<br>4. System logs `task_attempts`. | Learner practices with increasing difficulty. | All |
| UC-22 | Learner | Content | Help | Reveal worked solution | Stuck on a problem | 1. Clicks "Show solution".<br>2. System records `solution_viewed_before_attempt`.<br>3. Renders collapsible worked solution. | Learner learns the method but mark is tracked. | All |
| UC-23 | Learner | Content | Concept tags | Explore concept-tagged problems | Clicks a concept chip | 1. Concept detail panel opens.<br>2. Shows related problems, mastery level, repair links. | Learner deep-dives on a concept. | All |
| UC-24 | Learner | Content | Mobile | Study on mobile | Opens section on phone | 1. Layout stacks reading above problems.<br>2. Long formulas scroll horizontally without body overflow. | Mobile learning works. | All |

---

## 4. Assessments & Quizzes

### 4.1 Section Quizzes

| UC-ID | Actor | Category | Subcategory | Use Case | Trigger | Flow | Outcome | Plan |
|-------|-------|----------|-------------|----------|---------|------|---------|------|
| UC-25 | Learner | Assessment | Section quiz | Take section-end quiz | Finishes section problems | 1. 3–5 MCQ/MSQ/NAT questions load.<br>2. Learner answers; optional timer.<br>3. Submits; system scores and checks concept coverage.<br>4. `quiz_attempts` row created. | Quiz completed; pass/fail determined. | All |
| UC-26 | System | Assessment | Pass logic | Determine section pass | Quiz submitted | 1. Compare answers to correct answers.<br>2. Checks whether all core concepts have at least one correct response.<br>3. If passed, unlocks next section. | Next section becomes available. | All |
| UC-27 | Learner | Assessment | Retry | Retake section quiz | Fails quiz | 1. Feedback modal shows weak concepts.<br>2. Retry button available (max attempts configurable).<br>3. New attempt scored. | Learner can retry until pass. | All |

### 4.2 Review & Adaptive Quizzes

| UC-ID | Actor | Category | Subcategory | Use Case | Trigger | Flow | Outcome | Plan |
|-------|-------|----------|-------------|----------|---------|------|---------|------|
| UC-28 | System | Assessment | Review quiz | Generate targeted review on failure | Section quiz failed | 1. System reads chapter concept graph.<br>2. Selects questions from missed concepts + prerequisites.<br>3. Creates `review_quizzes` row.<br>4. Presents review quiz. | Learner must pass review to proceed. | All |
| UC-29 | System | Assessment | Adaptive review | Generate 15-day cumulative review | Every 15 days | 1. Aggregates concept mastery across subjects.<br>2. Weak concepts get more questions; mastered get fewer.<br>3. High GATE-weight topics resurface.<br>4. Generates `review_quizzes` with due date. | Comprehensive adaptive review created. | Basic / Platinum |
| UC-30 | Learner | Assessment | Review quiz | Take adaptive cumulative review | Dashboard review banner clicked | 1. Mixed-subject quiz loads.<br>2. Submits; system updates concept mastery.<br>3. Feedback shows weak concepts and repair links. | Mastery data refreshed; next review scheduled. | Basic / Platinum |

---

## 5. Feedback & Repair

### 5.1 Standard Feedback

| UC-ID | Actor | Category | Subcategory | Use Case | Trigger | Flow | Outcome | Plan |
|-------|-------|----------|-------------|----------|---------|------|---------|------|
| UC-31 | Learner | Feedback | Quiz feedback | View quiz feedback | Submits quiz | 1. Feedback modal opens.<br>2. Per-question breakdown: green/yellow/red.<br>3. Wrong answers show concept, prerequisite, repair action.<br>4. Links to practice problems. | Learner knows exactly what to fix. | All |
| UC-32 | Learner | Feedback | Repair | Follow repair action | Clicks repair link | 1. Redirected to targeted practice problem or review material.<br>2. Solves problem; correctness logged.<br>3. Concept mastery updated. | Weak concept addressed. | All |

### 5.2 Platinum LLM Feedback

| UC-ID | Actor | Category | Subcategory | Use Case | Trigger | Flow | Outcome | Plan |
|-------|-------|----------|-------------|----------|---------|------|---------|------|
| UC-33 | Learner | Platinum | Submission | Submit written solution | Finishes Platinum problem set | 1. Uploads file or types solution.<br>2. `pattern_submissions` row created.<br>3. Frontend calls `/api/generate-feedback`. | Solution queued for LLM feedback. | Platinum |
| UC-34 | System | Platinum | LLM feedback | Generate structured feedback | Submission received | 1. Sends material context, workflow, solution to OpenAI.<br>2. Enforces strict JSON schema.<br>3. Parses verdict, score, error analysis, prerequisite hypotheses, adaptive signal.<br>4. Stores in `feedback_records` and `pattern_submissions`. | Structured feedback ready. | Platinum |
| UC-35 | Learner | Platinum | Feedback review | Read LLM feedback | Feedback ready notification | 1. Opens Feedback view.<br>2. Sees verdict, score, what they got right, gaps, minimal correction, next drill.<br>3. Clicks suggested next drill. | Learner understands exact gaps and next steps. | Platinum |

---

## 6. Adaptive Planning (Platinum)

| UC-ID | Actor | Category | Subcategory | Use Case | Trigger | Flow | Outcome | Plan |
|-------|-------|----------|-------------|----------|---------|------|---------|------|
| UC-36 | System | Platinum | Snapshot sync | Sync progress snapshot | Local progress changes | 1. Browser builds compact snapshot (tasks, materials, feedback state).<br>2. Debounced 1.5s.<br>3. POSTs to `/api/platinum-progress`.<br>4. Stored in KV or `platinum_progress_snapshots`. | Server has latest learner state. | Platinum |
| UC-37 | System | Platinum | Weekly check | Run Sunday adaptive cron | Sundays 14:00 UTC | 1. Reads latest snapshot.<br>2. Builds weekly report (overdue, missing submissions, severe feedback).<br>3. Aggregates and ranks prerequisite hypotheses.<br>4. Generates Sunday diagnostic plan.<br>5. Emits next-week pset mix (repair/bridge/target/cumulative).<br>6. Sends email to monitor. | Adaptive plan for next week created. | Platinum |
| UC-38 | Learner | Platinum | Sunday diagnostic | Take Sunday diagnostic quiz | Sunday task appears | 1. Short quiz with direct-check + bridge-check per hypothesis.<br>2. Submits; hypotheses confirmed or cleared.<br>3. `prerequisite_hypotheses` updated. | Adaptive plan adjusted based on evidence. | Platinum |
| UC-39 | Learner | Platinum | Adaptive pset | Receive next week's personalized problem set | Monday | 1. System generates pset using allocation ratios.<br>2. More repair/bridge problems if gaps confirmed.<br>3. Target topic reduced if prerequisites shaky. | Next week's material matches learner needs. | Platinum |

---

## 7. Gamification & Engagement

| UC-ID | Actor | Category | Subcategory | Use Case | Trigger | Flow | Outcome | Plan |
|-------|-------|----------|-------------|----------|---------|------|---------|------|
| UC-40 | System | Gamification | Points | Earn points | Learner solves problem/passes quiz | 1. `points_transactions` row created.<br>2. Trigger updates `user_points` total.<br>3. Free plan checks daily limit. | Points added; progress visible. | Free / Basic / Platinum |
| UC-41 | System | Gamification | Streaks | Maintain study streak | Daily activity logged | 1. `daily_activity` row updated.<br>2. If activity today and yesterday → streak +1.<br>3. Bonus points at 3/7/30 days. | Streak counter and bonuses applied. | All |
| UC-42 | Learner | Gamification | Leaderboard | View rankings | Opens leaderboard | 1. Shows daily / monthly / all-time tabs.<br>2. Ranks by points; top 3 and top 10 get bonus points. | Learner sees social standing. | Basic / Platinum |
| UC-43 | Learner | Gamification | Rewards | Claim reward | Visits rewards catalog | 1. Browses rewards (badges, goodies, feature unlocks).<br>2. Spends points; `user_rewards` row created.<br>3. Physical items go through claimed → fulfilled → shipped. | Reward claimed. | Basic / Platinum |

---

## 8. Instructor & Admin Operations

| UC-ID | Actor | Category | Subcategory | Use Case | Trigger | Flow | Outcome | Plan |
|-------|-------|----------|-------------|----------|---------|------|---------|------|
| UC-44 | Instructor | Admin | Content | Create new section | Uses content creation UI | 1. Enters title, type, reading material (MDX), problem set, concept tags.<br>2. Builds quiz with questions, options, repair feedback.<br>3. Publishes; rows inserted in `sections`, `tasks`, `quizzes`, `questions`. | New section live for learners. | Admin / Instructor |
| UC-45 | Instructor | Admin | Monitoring | View student progress table | Opens instructor dashboard | 1. Table shows students: last active, current chapter, quiz pass rate, weakest concepts.<br>2. Filterable by subject/plan. | Instructor identifies at-risk students. | Admin / Instructor |
| UC-46 | Instructor | Admin | Workflows | Edit feedback workflow | Opens workflow editor | 1. Edits verdicts, skills, rubric, common issues, default drills, prerequisite graph.<br>2. Saves new version in `feedback_workflows`. | LLM feedback rubric updated without deploy. | Admin / Instructor |
| UC-47 | Admin | Admin | Plans | Manage subscription plans | Opens plan admin | 1. Creates/edits `plans` row: slug, price, features, subject_access, daily_point_limit.<br>2. Changes apply immediately via RLS/feature checks. | New plan available for purchase. | Admin |
| UC-48 | Admin | Admin | Quality | Run material quality checks | Runs verification scripts | 1. `verify-material-pages.mjs` checks KaTeX, structure, 5-3-2 progression, banned phrases.<br>2. `judge-material-quality.mjs` scores pages.<br>3. Failures reported. | Content quality gate enforced. | Admin |

---

## 9. Data Portability & Settings

| UC-ID | Actor | Category | Subcategory | Use Case | Trigger | Flow | Outcome | Plan |
|-------|-------|----------|-------------|----------|---------|------|---------|------|
| UC-49 | Learner | Settings | Reset | Reset workspace | Clicks "Reset current data" | 1. Confirms destructive action.<br>2. Clears progress but keeps profile.<br>3. Regenerates canonical plan. | Fresh start with same account. | All |
| UC-50 | Learner | Settings | Fresh start | Clear all browser data | Visits `/fresh-start` | 1. Clears localStorage, sessionStorage, service worker, caches.<br>2. Redirects to `/`. | Browser state fully reset. | All |

---

## Summary by Category

| Category | Count | Key Flows |
|----------|-------|-----------|
| 1. Onboarding & Account | 9 | Landing, signup, demo, login, reset, export/import |
| 2. Learning Workspace | 8 | Dashboard, resume, 9-view nav, task board, chapter path, gating, preview |
| 3. Content Consumption | 7 | Reading, questions, problem sets, solutions, concept tags, mobile |
| 4. Assessments | 6 | Section quiz, pass logic, retry, review quiz, 15-day adaptive review |
| 5. Feedback & Repair | 5 | Quiz feedback, repair links, Platinum LLM feedback |
| 6. Adaptive Planning | 4 | Snapshot sync, weekly cron, Sunday diagnostic, adaptive pset |
| 7. Gamification | 4 | Points, streaks, leaderboard, rewards |
| 8. Instructor & Admin | 5 | Content creation, progress table, workflow editor, plans, quality checks |
| 9. Data & Settings | 2 | Reset workspace, fresh start |
| **Total** | **50** | |

---

## Cross-Category Core Flows

### Core Learning Loop (Free/Basic)

```
Login → Dashboard → Select subject → Chapter path → Section
  → Read material → Answer reading questions → Solve problem set
    → Take section quiz → Pass → Unlock next section
    → Fail → Review quiz → Pass → Unlock next section
```

### Platinum Feedback Loop

```
Study Platinum material → Submit written solution
  → /api/generate-feedback → Structured LLM report
    → Learner reads feedback → Does next drill
      → Progress syncs to /api/platinum-progress
        → Sunday cron → Diagnostic plan + next-week pset mix
          → Monday: adaptive problem set generated
```

### Adaptive Review Loop

```
Quiz/task attempts → Concept mastery updated
  → Every 15 days: cumulative review generated
    → Weak concepts repeat; mastered concepts skip
      → Review submitted → Mastery refreshed → Next review scheduled
```

---

*Last updated: 2026-06-09*
*See also: [requirements.md](requirements.md) for detailed feature specs, [schema.md](schema.md) for data model.*
