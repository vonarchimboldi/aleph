# aleph_v2 — Design System & UI Guidelines

> **Purpose:** A single source of truth for how aleph_v2 looks and feels. Every UI decision must be traceable to this document.

---

## 1. Philosophy

**Ruthless simplicity.** No gradients, no glassmorphism, no animated backgrounds, no "delight" for the sake of it. The learner's attention is the scarcest resource — the UI must never compete with the content.

**Inspiration:**
- [Educative.io](https://www.educative.io/) — clean reading experience, focus on content
- Fumadocs default theme — excellent docs navigation, typography, and dark mode
- Our own auth pages — minimal, functional, zero noise

**Anti-patterns (never do these):**
- Rainbow UI (multiple accent colors)
- Arbitrary Tailwind values like `w-[123px]`
- Inline `style={{}}` props
- Background images, gradients, or decorative SVGs
- More than one font family
- Animated entrances/transitions on page load

---

## 2. Color Palette

### Primary: Zinc (Grays)

| Token | Light | Dark | Usage |
|---|---|---|---|
| `bg-page` | `zinc-50` `#fafafa` | `zinc-950` `#09090b` | Page background |
| `bg-card` | `white` | `zinc-900` | Cards, panels, form backgrounds |
| `bg-input` | `white` | `zinc-900` | Input fields |
| `border` | `zinc-200` | `zinc-800` | All borders, dividers |
| `text-primary` | `zinc-900` | `zinc-50` | Headings, primary text |
| `text-secondary` | `zinc-600` | `zinc-400` | Body text, descriptions |
| `text-muted` | `zinc-500` | `zinc-500` | Placeholders, hints |
| `text-disabled` | `zinc-400` | `zinc-600` | Disabled buttons, coming soon |

### Accent: Teal + Blue (From Actual Product)

> **Updated after audit of main repo.** The real product at `aleph-alpha.io` uses a specific palette derived from `styles.css` and `material-page.css`:

| Token | Hex | Tailwind Equiv | Usage |
|---|---|---|---|
| Brand | `#1f5f70` | `teal-800` | Manifest theme, sidebar brand |
| Primary | `#2457c5` | `blue-700` | Primary buttons, links, accent |
| Secondary | `#16735f` | `teal-700` | Success states, secondary actions |
| Warn | `#9f681c` | `amber-700` | Warnings, overdue items |
| Hard | `#8f3248` | `rose-800` | Errors, incorrect answers |
| Soft | `#edf3ff` | `blue-50` | Light backgrounds, highlights |
| Code | `#f3f5fa` | `slate-100` | Code block backgrounds |

**Original decision:** Zinc-only was our initial choice. The real product uses the palette above. We can either:
1. **Adopt the product palette** (consistent with existing brand)
2. **Keep zinc-only** (cleaner, more modern)

**Recommendation:** Adopt the product palette for the learning workspace (it's what users of the real product expect), keep zinc for the marketing/landing page.

### Semantic Colors

| Purpose | Color | Dark Mode |
|---|---|---|
| Success | `green-600` | `green-400` |
| Error | `red-600` | `red-400` |
| Warning | `amber-600` | `amber-400` |
| Info | `blue-600` | `blue-400` |

Use these **only** for status indicators, alerts, and form validation. Never for decorative elements.

---

## 3. Typography

**Font:** Geist (Sans) + Geist Mono (Code)

Already configured in `layout.tsx` via `next/font/google`.

| Level | Size | Weight | Line Height | Letter Spacing | Usage |
|---|---|---|---|---|---|
| Display | `text-4xl` | `font-bold` | `leading-tight` | `tracking-tight` | Landing hero |
| H1 | `text-3xl` | `font-bold` | `leading-tight` | `tracking-tight` | Page titles |
| H2 | `text-2xl` | `font-bold` | `leading-tight` | `tracking-tight` | Section headings |
| H3 | `text-xl` | `font-semibold` | `leading-snug` | — | Sub-sections |
| H4 | `text-lg` | `font-semibold` | `leading-snug` | — | Card titles |
| Body | `text-base` | `font-normal` | `leading-relaxed` | — | Paragraphs |
| Small | `text-sm` | `font-normal` | `leading-normal` | — | Labels, captions |
| Tiny | `text-xs` | `font-medium` | `leading-normal` | `uppercase tracking-wider` | Badges, tags |
| Code | `text-sm` | `font-mono` | `leading-relaxed` | — | Code blocks, inline code |

### Rules
- **Never** use `font-serif` or any decorative font.
- **Never** use `italic` for emphasis. Use `font-semibold` instead.
- Code blocks: always `font-mono`, dark background (`zinc-900`), rounded corners.

---

## 4. Spacing

**Base unit:** `4px` (Tailwind's default)

### Common Patterns

| Pattern | Classes |
|---|---|
| Page padding | `px-4 py-12` mobile, `px-6` tablet, `px-8` desktop |
| Card padding | `p-6` |
| Card gap | `gap-4` |
| Section gap | `space-y-6` or `gap-6` |
| Form field gap | `space-y-4` |
| Max content width | `max-w-7xl` (1280px) for dashboards, `max-w-3xl` for reading |

---

## 5. Components

### 5.1 Button

**Primary (CTA):**
```
bg-zinc-900 text-white hover:bg-zinc-800
rounded-lg px-4 py-2.5 text-sm font-medium
dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200
transition
```

**Secondary:**
```
bg-white text-zinc-900 border border-zinc-200 hover:bg-zinc-50
rounded-lg px-4 py-2.5 text-sm font-medium
dark:bg-zinc-900 dark:text-white dark:border-zinc-800 dark:hover:bg-zinc-800
transition
```

**Disabled:**
```
opacity-50 cursor-not-allowed
```

**Ghost (tertiary):**
```
bg-transparent text-zinc-600 hover:bg-zinc-100
rounded-lg px-4 py-2.5 text-sm font-medium
dark:text-zinc-400 dark:hover:bg-zinc-800
transition
```

### 5.2 Input

```
block w-full rounded-lg border border-zinc-200 bg-white
py-2.5 pl-10 pr-3 text-sm text-zinc-900 placeholder-zinc-400
focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900
dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:placeholder-zinc-500
dark:focus:border-white dark:focus:ring-white
```

With icon: `pl-10` (icon on left). With toggle: `pr-10` (icon on right).

### 5.3 Card

```
rounded-xl border border-zinc-200 bg-white p-6
dark:border-zinc-800 dark:bg-zinc-900
```

No shadow by default. Add `shadow-sm` only when the card needs elevation (e.g., floating panels).

### 5.4 Alert / Error Message

```
rounded-lg bg-red-50 p-3 text-sm text-red-600
dark:bg-red-950/30 dark:text-red-400
```

### 5.5 Badge

```
inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5
text-xs font-medium text-zinc-800
dark:bg-zinc-800 dark:text-zinc-200
```

---

## 6. Layout Patterns

### 6.1 Auth Pages (Login / Signup)

- Centered card, `max-w-md`
- Icon in a rounded square above heading
- OAuth buttons first (if any), then divider, then email form
- "COMING SOON" in `text-[10px] uppercase tracking-widest` below disabled buttons
- Link to alternate auth action at bottom

### 6.2 Dashboard

- Sidebar + main content layout
- Sidebar: `w-64`, `border-r`, fixed position on desktop
- Main: `flex-1`, scrollable
- Mobile: sidebar becomes a slide-out drawer

### 6.3 Course Reader (Learn / Docs)

Use Fumadocs `DocsLayout`:
- Left sidebar: navigation tree
- Center: content area, `max-w-3xl` for reading comfort
- Right: table of contents (TOC) for current page
- Top: breadcrumb + page title

Content width should never exceed ~70 characters for readability.

### 6.4 Landing Page

- Minimal hero: large heading + subheading + CTA button
- No carousels, no auto-playing videos
- Feature grid: 2 cols mobile, 3 cols desktop
- Testimonials: simple cards, no quotes in giant decorative marks
- Footer: links grouped by category, minimal

---

## 7. Dark Mode

**Implementation:** `next-themes` (included in Fumadocs `RootProvider`)

**Classes:** Always use `dark:` variants. Never write separate dark stylesheets.

**Key mappings:**
- Light page bg (`zinc-50`) → Dark page bg (`zinc-950`)
- Light card bg (`white`) → Dark card bg (`zinc-900`)
- Light text (`zinc-900`) → Dark text (`zinc-50`)
- Light secondary text (`zinc-600`) → Dark secondary text (`zinc-400`)
- Light border (`zinc-200`) → Dark border (`zinc-800`)

---

## 8. Responsive Breakpoints

| Name | Width | Tailwind Prefix | Usage |
|---|---|---|---|
| Mobile | < 640px | (default) | Single column, full-width cards, stacked nav |
| Tablet | 640px+ | `sm:` | 2-column grids, side-by-side forms |
| Desktop | 1024px+ | `lg:` | Sidebar visible, 3-column grids, max-width containers |
| Wide | 1280px+ | `xl:` | Centered content with generous padding |

**Rule:** Design mobile first. Never write desktop-only layouts.

---

## 9. Animation & Motion

**Allowed:**
- Button hover color transitions (`transition`, `duration-150`)
- Form focus ring transitions
- Dropdown/menu open/close (subtle, `duration-200`)
- Page loading spinner

**Forbidden:**
- Page load animations (fade-in, slide-up)
- Parallax scrolling
- Animated backgrounds
- Bouncing elements
- Skeleton screens (use static placeholders instead)

> **Do we need animation expertise?** No. Fumadocs handles all the subtle motion we need (sidebar transitions, TOC highlighting). Our philosophy is "no animation."

---

## 10. Icons

**Source:** [Lucide React](https://lucide.dev/)

**Rules:**
- Use `h-4 w-4` inside buttons and inputs
- Use `h-5 w-5` for standalone icons
- Use `h-6 w-6` for feature/section icons
- Never use emojis as UI elements (use icons)
- Icons in buttons: always left of text, `gap-2`

---

## 11. Form Patterns

### Validation
- Show errors inline, below the field
- Error message: `text-sm text-red-600`
- Highlight input border: `border-red-500 focus:border-red-500 focus:ring-red-500`
- Never use browser default tooltips

### Submit Button
- Show loading spinner inside button during submission
- Disable button while loading
- Full width on mobile, `w-auto` on desktop

### Password Fields
- Always have show/hide toggle (Eye / EyeOff icons)
- Min length hint below field

---

## 12. Decision Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-06-09 | Zinc-only palette | Grays never clash. One accent color to be decided later. |
| 2026-06-09 | Geist font | Clean, modern, excellent legibility at all sizes. |
| 2026-06-09 | No animations | Learner attention is sacred. |
| 2026-06-09 | Fumadocs for docs/learn | Best-in-class docs UI, built-in search, TOC, dark mode. |
| 2026-06-09 | Lucide icons | Consistent, lightweight, tree-shakeable. |

---

*Last updated: 2026-06-10*
*Next review: When accent color is chosen or when new page types are added.*
