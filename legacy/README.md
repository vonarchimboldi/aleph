# legacy/ — the original static-HTML Aleph

This is a snapshot of the first version of Aleph: a vanilla-JS single-page
app (`app.js`, ~12k lines) with localStorage persistence, no auth, no
database. It is **not running anywhere and not maintained** — the product
was rebuilt as two Next.js apps:

| | Repo | Port |
|---|---|---|
| Learner app | `../aleph_v2` (remote `bitsgoan/aleph_v2`) | 3000 |
| Admin studio | this repo, branch `next` | 3001 |

## What was taken from here

- **Content** — the course material here (`psets/`, `gate-da-papers/`) was
  migrated into Supabase via the loader scripts, and the newer DSA content
  from the colleague's `main` branch (`DSA For GATE practice/`, present in
  the `aleph-main-temp` clone) was loaded via the admin import. Check
  `aleph_v2/docs/ROADMAP.md` for exactly what has been loaded.
- **Methodology** — the writing rules, rubrics, and exam analysis from this
  app live on in `aleph_v2/docs/content-intel/` (pedagogical rules, LA
  analysis, probability notes). Read those, not the files here.
- **Ideas** — the feature set was re-evaluated; see `aleph_v2/docs/ROADMAP.md`
  §6 for what was ported from the colleague's newer `main` branch and what
  was deliberately dropped.

## What is obsolete

Everything about *delivery*: `app.js`, `service-worker.js`, `styles.css`,
the HTML pset pages, the verification scripts documented in `UI_HANDOFF.md`,
and the localStorage data model. Do not copy patterns from this folder into
the Next.js apps; do not run these scripts against production data.

The three markdown files here (`UI_HANDOFF.md`, `QUALITY_RUBRIC.md`,
`probability_chapters_5_10_notes.md`) are kept verbatim as source material;
the maintained versions of the methodology are in
`aleph_v2/docs/content-intel/`.

> Last updated 2026-10-14.
> The original product README that lived here is preserved in git history
> (`git show d88cdd9^:legacy/README.md`) — it describes this static prototype
> when it was the live product (June 2026).
