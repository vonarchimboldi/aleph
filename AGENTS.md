# AGENTS.md — aleph_v2

> **Mandatory reading before writing any code.** These rules override your default training patterns.

---

## 1. Project Context

**aleph_v2** is an educational platform for GATE DA exam preparation.

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS v4
- **Auth:** Supabase Auth (email/password)
- **Content:** Fumadocs (MDX)
- **Icons:** Lucide React
- **No ORM** — direct Supabase client with RLS

---

## 2. Behavioral Guidelines (Reduce LLM Mistakes)

> **Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

### 2.1 Think Before Coding

Don't assume. Don't hide confusion. Surface tradeoffs.

**Before implementing:**
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them — don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

### 2.2 Simplicity First

Minimum code that solves the problem. Nothing speculative.

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.
- Ask yourself: *"Would a senior engineer say this is overcomplicated?"* If yes, simplify.

### 2.3 Surgical Changes

Touch only what you must. Clean up only your own mess.

**When editing existing code:**
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it — don't delete it.

**When your changes create orphans:**
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

**The test:** Every changed line should trace directly to the user's request.

### 2.4 Goal-Driven Execution

Define success criteria. Loop until verified.

**Transform tasks into verifiable goals:**
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

**For multi-step tasks, state a brief plan:**
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

## 3. Graceful Error Handling (Non-Negotiable)

Every server component, API route, and middleware must handle failures without crashing the UI.

### 3.1 Server Components

```tsx
export default async function MyPage() {
  let data = null;
  let error = null;

  try {
    const supabase = await createClient();
    const { data: result } = await supabase.from("...").select();
    data = result;
  } catch (err) {
    console.error("[MyPage] Failed to fetch:", err);
    error = err;
  }

  if (error) {
    return <ErrorBanner message="Unable to load data. Please try again later." />;
  }

  return <Content data={data} />;
}
```

### 3.2 Middleware

```ts
export async function middleware(request: NextRequest) {
  try {
    // ... auth logic
  } catch (err) {
    console.error("[middleware] Error:", err);
    return NextResponse.next(); // Don't crash the site
  }
}
```

### 3.3 Environment Variables

NEVER throw during build because env vars are missing. The app must build and deploy without `.env.local`.

```ts
// BAD
const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
if (!url) throw new Error("Missing env var"); // ❌ breaks build

// GOOD
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
if (!url) {
  console.warn("[createClient] Supabase URL not set");
  // Return fallback or skip gracefully
}
```

### 3.4 Database Tables

Assume tables don't exist. Catch "relation does not exist" errors and return fallbacks.

```ts
try {
  const { data } = await supabase.from("profiles").select().single();
  return data;
} catch {
  // Table doesn't exist yet — return mock data
  return { id: user.id, role: "student", ... };
}
```

---

## 4. SOLID Principles (Reminders)

| Principle | Rule | Example Violation |
|---|---|---|
| **S**ingle Responsibility | One component = one job. | A page that fetches data, renders UI, AND handles form submission |
| **O**pen/Closed | Extend behavior without modifying existing code. | Adding a new button type by editing the base Button component |
| **L**iskov Substitution | Subtypes must be substitutable. | A `Button` variant that ignores `onClick` |
| **I**nterface Segregation | Don't force consumers to depend on what they don't use. | A `User` type with 20 fields when most pages need only 3 |
| **D**ependency Inversion | Depend on abstractions, not concrete implementations. | Direct `fetch()` calls in components instead of a data layer |

---

## 5. Project-Specific Rules

### 5.1 File & Folder Discipline
- ALL code lives in `src/`. No exceptions.
- Component naming: PascalCase for components, camelCase for utilities, kebab-case for file routes.
- One component per file. No `export const Helper = () =>` inside page files.
- Co-locate related files: `Component.tsx`, `Component.test.tsx`, `Component.types.ts` in same folder.
- **NO `any` types.** If you don't know the type, define it or use `unknown` with a guard.

### 5.2 Styling
- **Tailwind ONLY.** No inline `style={{}}` props except for dynamic values.
- No arbitrary values like `w-[123px]` unless absolutely necessary.
- Color palette: zinc (grays) + one accent color (TBD). No rainbow UI.
- Responsive first: Mobile → Tablet → Desktop.

### 5.3 Auth & Security
- **Supabase is the ONLY auth source.** No custom JWT, no localStorage tokens.
- Row Level Security (RLS) is mandatory on every Supabase table.
- Server Components for data fetching whenever possible.
- **NO secrets in client code.** Service role key stays in server actions / API routes only.

### 5.4 Edge Runtime
- Middleware runs on Edge. **NEVER use `@/` path aliases** in Edge files.
- Use relative imports in: `src/middleware.ts`, `src/app/**/route.ts`
- Server Components CAN use `@/` — they run in Node.js.

### 5.5 State Management
- Server state = Supabase + Server Components.
- Client state = React hooks (`useState`, `useReducer`).
- **NO Redux / Zustand / Jotai** unless cross-component state becomes genuinely complex.

### 5.6 Git
- Commit messages: `type: description` — e.g., `feat: add course enrollment`, `fix: login redirect`
- One feature per commit. No "wip" or "stuff" commits.
- Never commit `.env.local`.

---

## 6. Next.js 16 Specifics

> This is NOT the Next.js from training data. Read `node_modules/next/dist/docs/` if unsure.

- App Router only. No Pages Router.
- Server Components are default. Mark Client Components with `"use client"` only when needed.
- `cookies()` from `next/headers` is async: `const cookieStore = await cookies()`.
- `params` in pages is async: `const { slug } = await params`.

---

## 7. When to Ask vs. When to Act

| Situation | Action |
|---|---|
| User gives clear, specific instructions | Implement directly |
| Multiple valid approaches exist | Present 2–3 options with tradeoffs, let user choose |
| Something contradicts existing code | Ask before overwriting |
| You notice a potential bug outside the task | Mention it, don't fix it unless asked |
| You're unsure what "good" looks like | Ask for a reference or example |

---

## 8. Success Metrics

These guidelines are working if:
- Fewer unnecessary changes in diffs
- Fewer rewrites due to overcomplication
- Clarifying questions come BEFORE implementation rather than after mistakes
- The app builds and deploys even when external services (Supabase) are unavailable

---

*Last updated: 2026-06-09*
