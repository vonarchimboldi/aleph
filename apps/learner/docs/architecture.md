# aleph_v2 — System Architecture

> **Purpose:** How the system is wired together. Auth, data flow, routing, and third-party services.

---

## 1. Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Framework | Next.js 16 (App Router) | Server Components, SSG, future-proof |
| Language | TypeScript 5 | Type safety, DX |
| Styling | Tailwind CSS v4 | Zero-config, design tokens |
| UI Components | Fumadocs UI + custom | Docs layout, search, TOC out of the box |
| Auth | Supabase Auth | Built-in email/password, RLS, free tier |
| Database | Supabase Postgres | Managed, scales with auth |
| ORM | None (Supabase client) | Direct SQL + RLS, no abstraction layer needed yet |
| Icons | Lucide React | Tree-shakeable, consistent |
| Content | MDX (Fumadocs) | Markdown + React components for course material |

---

## 2. Auth Architecture

### How Supabase Auth Works

Supabase provides **two** user stores:

1. **`auth.users`** — Managed by Supabase Auth (in the `auth` schema)
   - Stores: email, encrypted password, confirmation status, metadata
   - **Not directly accessible** from the client or public schema
   - Created automatically on `signUp()`

2. **`public.profiles`** — Our application table (in the `public` schema)
   - Stores: `full_name`, `role`, `account_type`, `avatar_url`
   - **Accessible via Supabase client** with RLS
   - Must be created/updated manually after auth events

### User Signup Flow

```
User submits email + password
  → Supabase Auth creates auth.users row
    → Trigger (or callback) creates public.profiles row
      → Email confirmation sent
        → User clicks link → auth.users.confirmed_at set
          → User can now sign in
```

### Sync Strategy

**Option A: Database Trigger** (recommended)
```sql
-- Automatically create profile on auth.users insert
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (NEW.id, NEW.email, '', 'student');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

**Option B: Client-side on first load**
- After login, check if profile exists
- If not, create it with defaults
- Simpler but has a race condition window

We will use **Option A** (trigger) for reliability.

### Row Level Security (RLS)

Every `public` table must have RLS enabled:

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admins can read all profiles
CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

---

## 3. Data Flow

```
Browser
  │
  ├─► Next.js Server Component
  │     │
  │     ├─► Supabase (server client, service role)
  │     │     ├─► RLS check (bypassed by service role)
  │     │     └─► Returns data
  │     │
  │     └─► Render HTML → Stream to browser
  │
  └─► Client Component (interactive parts only)
        │
        ├─► Server Action / API Route
        │     │
        │     └─► Supabase (anon key, RLS enforced)
        │           ├─► RLS check (user must be owner)
        │           └─► Returns/updates data
        │
        └─► Local state (useState, useReducer)
```

### Key Rules
- **Server Components** fetch data with service role key (bypasses RLS for internal queries)
- **Client Components** NEVER touch the service role key
- **Server Actions** use the anon key — RLS protects data
- **API Routes** can use service role for admin operations

---

## 4. Route Architecture

### Route Groups

```
src/app/
├── layout.tsx              # Root layout (Navbar, fonts, dark mode)
├── page.tsx                # Landing page
├── globals.css             # Tailwind + Fumadocs CSS imports
│
├── (docs)/                 # Route group — separate root layout for docs
│   ├── layout.tsx          # Fumadocs RootProvider only
│   └── docs/
│       ├── layout.tsx      # DocsLayout (sidebar + nav)
│       └── [[...slug]]/
│           └── page.tsx    # Catch-all MDX docs pages
│
├── (app)/                  # Route group — main app pages
│   ├── login/
│   ├── signup/
│   ├── logout/
│   ├── dashboard/          # Subject-level overview (3 cards)
│   ├── learn/              # Learning workspace
│   │   ├── [subject]/      # Subject landing (chapter path)
│   │   │   └── page.tsx
│   │   ├── [subject]/[chapter]/   # Chapter page (section list)
│   │   │   └── page.tsx
│   │   └── [subject]/[chapter]/[section]/  # Section workspace
│   │       └── page.tsx
│   ├── quiz/               # Quiz taking interface
│   │   └── [quizId]/
│   ├── review/             # Review quiz interface
│   │   └── [reviewQuizId]/
│   ├── feedback/           # Feedback detail pages
│   │   └── [attemptId]/
│   └── settings/
│
├── api/                    # API routes
│   ├── search/             # Fumadocs search
│   │   └── route.ts
│   ├── quiz/               # Quiz submission
│   │   └── [quizId]/
│   │       └── submit/route.ts
│   ├── review-quiz/        # Review quiz generation
│   │   └── generate/route.ts
│   ├── feedback/           # Section/review quiz feedback
│   │   └── route.ts
│   ├── generate-feedback   # LLM structured feedback (Platinum)
│   │   └── route.ts
│   ├── platinum-progress   # Platinum snapshot sync
│   │   └── route.ts
│   └── cron/               # Vercel cron jobs
│       └── platinum-weekly-check
│           └── route.ts
│
└── components/
    ├── illustrations/      # SVG diagrams (FeedbackLoop, ParallelSubjects, etc.)
    ├── quiz/               # Quiz components
    │   ├── QuizPlayer.tsx
    │   ├── QuestionCard.tsx
    │   └── QuizTimer.tsx
    ├── feedback/           # Feedback components
    │   ├── FeedbackModal.tsx
    │   ├── ConceptBreakdown.tsx
    │   └── RepairAction.tsx
    ├── learn/              # Learning workspace components
    │   ├── ChapterPath.tsx       # Brilliant-style path
    │   ├── SectionWorkspace.tsx
    │   └── ProblemSet.tsx
    └── dashboard/          # Dashboard components
        ├── SubjectCard.tsx
        ├── ProgressChart.tsx
        └── StreakCounter.tsx
```

### Route Protection

Middleware (`middleware.ts`) handles:
- `/dashboard/*`, `/learn/*`, `/quiz/*`, `/review/*`, `/feedback/*` → redirect to `/login` if not authenticated
- `/login`, `/signup` → redirect to `/dashboard` if already authenticated
- Designer preview (`?preview=true`) → bypasses lock checks but does not mutate progress
- Session refresh on every request

---

## 5. Content Architecture

### MDX Content Flow

```
content/docs/              ← MDX source files
  ├── index.mdx
  ├── getting-started/
  │   └── installation.mdx
  └── ...

↓  fumadocs-mdx (build time)

.source/                   ← Generated TypeScript modules
  ├── server.ts            ← Server-side page tree + content
  ├── browser.ts           ← Client-side search data
  └── dynamic.ts           ← Dynamic imports

↓  next build

app/(docs)/docs/           ← Rendered with DocsLayout
```

### Course Content (Future)

Courses will follow the same pattern but with a separate content source:

```
content/learn/
  ├── probability/
  │   ├── meta.json        ← Section ordering
  │   ├── 01-combinatorics/
  │   │   ├── index.mdx    ← Reading material
  │   │   └── problems.mdx ← Problem set (embedded via custom component)
  │   └── ...
  └── linear-algebra/
      └── ...
```

---

## 6. State Management

| State Type | Solution | Example |
|---|---|---|
| Server state | Supabase + Server Components | Course list, user profile |
| Form state | React `useState` | Login form, settings form |
| UI state | React `useState` | Sidebar open/close, modal visible |
| Cross-component | URL params / Server Actions | Current section, filter state |
| Global client | React Context (lightweight) | Theme preference, auth session |

**NO Redux, Zustand, or Jotai unless** we hit genuine cross-component complexity.

---

## 6.5 Component Architecture (by Feature)

### Quiz System

```
QuizPlayer (container)
├── QuizTimer (client)
├── QuestionCard[] (client)
│   ├── QuestionPrompt (KaTeX)
│   ├── OptionList (MCQ/MSQ/NAT)
│   └── HintReveal (collapsible)
└── QuizSubmitButton (Server Action)
    └── onSubmit → API → quiz_attempts → FeedbackModal
```

### Feedback System

```
FeedbackModal (client, portal)
├── ConceptBreakdown (server)
│   ├── correct[] (green)
│   ├── partial[] (yellow)
│   └── incorrect[] (red)
├── RepairActionList (server)
│   └── RepairActionCard[]
│       ├── misconception text
│       ├── repair explanation
│       └── link to practice problems
└── NextActionButton
    ├── Pass → "Continue to next section"
    └── Fail → "Start review quiz"
```

### Learning Workspace

```
SectionWorkspace (server)
├── ReadingPanel (server, static MDX)
│   └── MaterialPageContent (KaTeX + diagrams)
├── ProblemSetPanel (client)
│   ├── ProblemCard[] (5-3-2 split)
│   │   ├── ProblemStatement
│   │   ├── AnswerInput
│   │   └── SolutionReveal (tracked)
│   └── AnswerSummary (bottom)
└── SectionQuizTrigger (client)
    └── onComplete → unlock next section
```

### Dashboard

```
DashboardPage (server)
├── SubjectCard[] (3 subjects)
│   ├── ProgressBar
│   ├── CurrentChapterBadge
│   └── ContinueButton
├── UpcomingReviewBanner (client)
│   └── countdown to next 15-day review
├── WeakConceptsList (server)
│   └── ConceptChip[] with repair links
└── StreakCounter (client)
    └── CalendarGrid (last 30 days)
```

---

## 7. Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...      # Server only, never client

# App
NEXT_PUBLIC_SITE_URL=http://localhost:3000   # Production: https://aleph.app
NEXT_PUBLIC_APP_VERSION=1.0.0              # Build stamp for cache busting

# Email (Resend)
RESEND_API_KEY=re_...
FROM_EMAIL="Aleph <onboarding@your-verified-domain.com>"

# LLM Feedback (OpenAI)
OPENAI_API_KEY=sk-...
OPENAI_FEEDBACK_MODEL=gpt-4.1-mini   # optional

# Platinum Progress Snapshots (Upstash KV)
KV_REST_API_URL=https://...upstash.io
KV_REST_API_TOKEN=...

# Platinum Weekly Cron
CRON_SECRET=...                      # optional; Bearer token for cron auth
PLATINUM_MONITOR_EMAIL=coach@example.com   # optional
```

`.env.local` is in `.gitignore`. Never commit it.

---

## 8. Deployment

### Vercel (target platform)

1. Connect GitHub repo to Vercel
2. Add environment variables in Vercel dashboard
3. Build command: `npm run build`
4. Output directory: `.next`

### Supabase (database + auth)

1. Project already created
2. RLS policies applied via SQL Editor or migrations
3. Auth settings: Email provider enabled, confirmations required

### Migration Strategy

Future migrations will use Supabase CLI:
```bash
supabase migration new create_profiles_table
supabase db push
```

---

## 8.5 Email System

The actual product uses **Resend** for 5 email types:

| Email Type | API Route | Trigger |
|------------|-----------|---------|
| Credential send | `POST /api/send-credentials` | New account created |
| Feedback ready | `POST /api/send-feedback` | Feedback generated for material |
| Overdue reminder | `POST /api/send-overdue` | Scheduled check for overdue tasks |
| Pace check | `POST /api/send-pace-reminder` | When behind pace (Platinum) |
| Platinum weekly report | Vercel cron `/api/cron/platinum-weekly-check` | Sundays 14:00 UTC |

**Env vars:**
```bash
RESEND_API_KEY=re_...
FROM_EMAIL="Aleph <onboarding@your-verified-domain.com>"
PLATINUM_MONITOR_EMAIL=coach@example.com   # optional; receives weekly report
CRON_SECRET=...                            # optional; authorizes cron requests
```

**Fallback:** If Resend not configured, opens `mailto:` draft with prefilled content.

**Schema addition:**
```sql
CREATE TABLE email_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  notification_type TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'pending',
  error_message TEXT
);
```

---

## 8.55 LLM Feedback & KV Storage

### LLM Feedback (`/api/generate-feedback`)

Platinum submissions are evaluated by an LLM (OpenAI `gpt-4.1-mini` by default) using a strict JSON schema.

**Request:**
```json
{
  "materialTitle": "June 7: Method of Indicators Pset",
  "materialContext": { ... },
  "workflow": { /* rubric + prerequisite graph */ },
  "solutionText": "...",
  "learnerName": "Priyanka"
}
```

**Response:**
```json
{
  "feedbackRecord": { /* verdict, score, errorAnalysis, prerequisiteHypotheses, adaptivePlanSignal, ... */ },
  "feedback": "GREEN - 8/10. Gap: indicator-definition. First issue: ...",
  "model": "gpt-4.1-mini"
}
```

**Env vars:**
```bash
OPENAI_API_KEY=sk-...
OPENAI_FEEDBACK_MODEL=gpt-4.1-mini   # optional
```

### KV Storage (`/api/platinum-progress`)

The browser syncs a compact Platinum snapshot to durable storage:

- **Production:** Upstash KV (`KV_REST_API_URL`, `KV_REST_API_TOKEN`)
- **Development:** in-memory fallback
- **Alternative:** store snapshot in `platinum_progress_snapshots` table

Snapshot shape mirrors the client state: due tasks, due materials, feedback verdicts, prerequisite hypotheses, and adaptive signals.

### Weekly Adaptive Cron (`/api/cron/platinum-weekly-check`)

Runs Sundays at 14:00 UTC (`0 14 * * 0`). It:

1. Loads the latest Platinum snapshot
2. Builds a weekly report (overdue, missing submissions, severe feedback)
3. Aggregates and ranks prerequisite hypotheses
4. Generates a Sunday diagnostic plan
5. Produces next-week problem-set allocation: `repair` / `bridge` / `target` / `cumulative`
6. Sends email to `PLATINUM_MONITOR_EMAIL` if configured

**Allocation rules:**
- No gaps: 5% / 15% / 65% / 15%
- Confirmed/high-priority gaps: 30% / 30% / 30% / 10%
- Suspected gaps: 20% / 30% / 40% / 10%

**Vercel config:**
```json
{
  "crons": [
    { "path": "/api/cron/platinum-weekly-check", "schedule": "0 14 * * 0" }
  ]
}
```

---

## 8.6 PWA & Offline

| Feature | Status | Implementation |
|---------|--------|----------------|
| Web Manifest | `manifest.webmanifest` | Name: "Learning Studio", theme: `#1f5f70` |
| Icons | SVG (192 + 512, maskable) | `icons/icon-192.svg`, `icons/icon-512.svg` |
| Service Worker | Scaffolded but disabled | Currently unregisters itself to prevent stale builds |
| Offline mode | Not implemented | Can be enabled post-launch |
| Fresh Start | `fresh-start.html` | Clears localStorage, SW, caches, redirects to `/` |

**Future offline strategy:**
- Cache static assets (JS, CSS, icons)
- Cache previously viewed material pages
- Queue quiz submissions when offline, sync on reconnect

---

## 8.7 Local Storage Migration

The prototype stores everything in `localStorage` under `learning-studio-data-v2`. Migration to Supabase:

```
1. User logs in to new app (Supabase Auth)
2. Check if localStorage has legacy data
3. Parse JSON → map to Supabase schema
4. Insert into profiles, enrollments, workspace_states, quiz_attempts
5. Clear localStorage after successful migration
6. Show "Your progress has been imported" toast
```

**Key mapping:**
| localStorage Field | Supabase Table |
|---|---|
| `user` | `profiles` |
| `subjects` | `enrollments` + `subjects` |
| `quizAttempts` | `quiz_attempts` |
| `tasks` | `workspace_states` |
| `feedback` | `feedback_records` |
| `patternSubmissions` | `task_attempts` |

---

## 8.8 Build Versioning

The actual product uses build stamps for cache busting:

```js
const COURSE_PLAN_VERSION = "seeded-user-canonical-workspace-v76";
```

**In Next.js:**
- Use `NEXT_PUBLIC_APP_VERSION` env var
- Append `?v=${version}` to JS/CSS imports in `index.html`
- Show version in footer or settings page
- Fresh-start page clears all caches when version changes

---

## 9. Decision Log

| Date | Decision | Context | Reversible? |
|---|---|---|---|
| 2026-06-09 | Supabase Auth over NextAuth.js | Simpler RLS, built-in Postgres, generous free tier | Hard |
| 2026-06-09 | Next.js 16 App Router | Server Components reduce client JS | Hard |
| 2026-06-09 | Tailwind CSS v4 | Zero-config, CSS variable tokens | Medium |
| 2026-06-09 | Fumadocs as content framework | Built-in MDX, search, TOC, dark mode | Medium |
| 2026-06-09 | No ORM (direct Supabase client) | RLS + typed client is enough for v1 | Easy |
| 2026-06-09 | No Redux/Zustand | React hooks + Server Components suffice | Easy |
| 2026-06-09 | OAuth disabled for MVP | Email/password only, social later | Easy |
| 2026-06-10 | Multi-exam platform (not just GATE DA) | GATE DA is one of many; ISI, CMI, IIT JAM, NBHM | Medium |
| 2026-06-10 | KaTeX over MathJax | Faster rendering, better React integration | Medium |
| 2026-06-10 | Separate review_quiz_attempts table | Review quizzes have different metadata (weak concepts, repair actions) than section quizzes | Hard |
| 2026-06-10 | Concept-based pass threshold | Not rigid percentage; must demonstrate all core concepts | Medium |
| 2026-06-10 | Mermaid diagrams in docs | Native GitHub rendering, no external tools | Easy |
| 2026-06-10 | Adopt product color palette (teal #1f5f70, blue #2457c5) | Real product uses these; zinc-only was our invention | Medium |
| 2026-06-10 | Keep verification scripts as Node scripts | Too complex to port to TypeScript; run via `npm run verify` | Easy |
| 2026-06-10 | Resend for email (not SendGrid/Postmark) | Actual product uses Resend; free tier generous | Easy |
| 2026-06-09 | Upstash KV for Platinum snapshots | Actual product uses KV_REST_API_URL/TOKEN; Postgres table as fallback | Medium |
| 2026-06-09 | OpenAI Responses API with strict JSON schema | Actual product uses `/v1/responses` + `json_schema` for feedback | Medium |
| 2026-06-09 | Feedback workflows in database | Content authors need to iterate rubrics without app deploys | Medium |
| 2026-06-09 | Vercel cron for weekly adaptive planning | Actual product schedules Sundays 14:00 UTC | Easy |

---

*Last updated: 2026-06-09*
*See also: [schema.md](schema.md) for database design, [ui.md](ui.md) for visual design.*
*See also: [schema.md](schema.md) for database design, [ui.md](ui.md) for visual design.*
