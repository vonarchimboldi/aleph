# aleph — Design Direction

> **References:**
> - **Brilliant.org** — UI density, visual explanations, interactive problems, mobile-first layout, streaks/levels, progress rings, SVG diagrams, GIFs/animations.
> - **Codecademy** — Course structure: syllabus with lessons + projects + quizzes, clear skill progression, certificates, bite-sized content, hands-on practice.
> - **Educative** — Course player: left sidebar curriculum + main content area, chapter/section hierarchy.
>
> **Note:** This doc captures what to borrow, not what to copy pixel-for-pixel. We respect our own theme (teal #1f5f70, blue #2457c5).

---

## 1. Content Structure (from Codecademy)

A course is organized into **bite-sized units** that alternate explanation and practice:

```
Course
├── Chapter 1: Probability Foundations
│   ├── Section Preview (why this matters)
│   ├── Core Ideas (reading + visual blocks)
│   ├── Problem-Solving Techniques (patterns + strategies)
│   ├── Practice Problems (5 concept + 3 integration + 2 challenge)
│   ├── Conceptual Review (self-check)
│   ├── Section Quiz (gated assessment)
│   └── Chapter Summary
├── Chapter 2: Conditional Probability
│   └── ...
```

**Borrow:**
- Clear syllabus on preview page
- Each section has a single explicit learning objective
- Practice immediately follows concept
- Quiz at the end gates progress

---

## 2. Visual & Interactive Style (from Brilliant)

### 2.1 Problem-First Layout

Brilliant often shows the problem **before** the full explanation, letting the learner attempt first.

**Pattern for us:**
1. Short concept card (1–2 paragraphs + 1 diagram)
2. Interactive checkpoint problem
3. Feedback / explanation
4. Next concept or harder problem

### 2.2 Visual Explanations

Every concept should have a visual aid where possible:
- **SVG diagrams** for set operations, Venn diagrams, probability trees
- **Animated GIFs** or Lottie for complex transitions (optional post-MVP)
- **Interactive sliders** for parameters (post-MVP)
- **Color-coded steps** in worked solutions

### 2.3 Feedback is Immediate and Specific

- Instant check on practice problems
- Correct answer: brief positive reinforcement + "why this works"
- Wrong answer: specific hint, not just "try again"
- Solution reveal is tracked, not penalized

### 2.4 Progress & Motivation

- Progress ring/bar per chapter
- Section completion badges
- Streak counter (post-MVP)
- "You’re on a 3-day streak" nudges (post-MVP)

### 2.5 Mobile-First

- All layouts must work at 360px width
- Sidebar becomes bottom sheet / drawer on mobile
- Problem inputs are full-width and thumb-friendly
- Math must not overflow horizontally (scrollable formula containers)
- Tap targets ≥ 44×44px

---

## 3. Course Player UI Patterns

### Desktop

```
┌─────────────────────────────────────────────────────────────┐
│  Course title                    Progress  Avatar            │
├──────────────┬──────────────────────────────────────────────┤
│              │  Breadcrumb                                   │
│  Sidebar     │  Section title                                │
│  (chapters   │                                               │
│   + sections)│  [Reading content]                            │
│              │                                               │
│              │  [Reading questions]                          │
│              │                                               │
│              │  [Problem card]                               │
│              │  [Problem card]                               │
│              │                                               │
│              │  [Quiz]                                       │
│              │                                               │
│              │  [Prev] [Next]                                │
└──────────────┴──────────────────────────────────────────────┘
```

### Mobile

```
┌─────────────────────────────────────┐
│  ☰  Course title            Progress │
├─────────────────────────────────────┤
│  Breadcrumb                          │
│  Section title                       │
│                                      │
│  [Reading content]                   │
│  [Reading questions]                 │
│  [Problem card]                      │
│  [Quiz]                              │
│                                      │
│  [Prev] [Next]                       │
└─────────────────────────────────────┘
```

- Sidebar is hidden behind a hamburger menu that opens a drawer
- Bottom nav for prev/next is sticky or near bottom

---

## 4. Component Patterns

### Concept Card

A small, self-contained explanation block:
- Title
- 1–2 sentences
- Visual (SVG/diagram)
- Optional interactive element

### Checkpoint Problem

Inline problem inside reading material:
- Short prompt
- Input or MCQ
- Immediate feedback
- "Continue" button after correct

### Practice Problem Card

Larger card for problem sets:
- Difficulty badge
- Problem statement with KaTeX
- Answer input
- Check button
- Hint / Solution reveal

### Quiz Card

- 3–5 questions
- Clear progress dots
- Submit button
- Result summary
- Unlock next section on pass

---

## 5. Mobile Rules

1. **No horizontal body scroll.** Long equations scroll inside `.formula` containers.
2. **Sidebar becomes drawer.** Triggered by hamburger icon in top bar.
3. **Problem inputs stack.** Label above input on narrow screens.
4. **Buttons are full-width on mobile** where it makes sense (Check, Submit, Continue).
5. **Font sizes scale.** Use `clamp()` or Tailwind responsive prefixes.
6. **Touch targets.** All interactive elements at least 44px tall.
7. **Viewport height handling.** Use `dvh` units; avoid elements hidden by browser chrome.

---

## 6. Animation & Delight (post-MVP)

- Staggered entrance for problem cards
- Success checkmark animation on correct answer
- Progress bar transitions
- Subtle hover states on sidebar items
- Confetti or badge pop on chapter completion

---

## 7. What We Avoid

- Cluttered sidebars with too many items
- Tiny tap targets
- Plain walls of text without visual breaks
- Generic stock imagery
- Heavy animations that hurt performance

---

*Last updated: 2026-06-09*
*Next step: Apply mobile drawer sidebar and tighten spacing/typography on course player.*
