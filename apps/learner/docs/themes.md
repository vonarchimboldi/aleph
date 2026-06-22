# Aleph_v2 — Theme Reference

> **⚠️ READ-ONLY REFERENCE ⚠️**
> `themes/` are cloned templates for inspiration only. Do NOT modify, build, or install dependencies inside them. Copy what you need into `main-app/`.

---

## Project Structure

```
aleph_v2/
├── themes/          ← CLONED TEMPLATES — DO NOT TOUCH
│   ├── si-educational-nextjs
│   ├── sanity-blog
│   ├── tailadmin-dashboard
│   ├── vercel-auth-starter
│   ├── vercel-admin-dashboard
│   ├── nextjs-saas-starter
│   ├── landing-page-starter
│   ├── minifolio-portfolio
│   ├── bcms-blog-starter
│   ├── bcms-simple-blog-starter
│   └── bcms-ecommerce-starter
│
├── docs/            ← Architecture & design docs
├── main-app/        ← Actual application code
└── README.md
```

---

## How We Use Themes

We **do not mix themes**. Fumadocs is our primary UI framework for content pages. Themes are reference material only.

| Theme | What We Might Reference | Status |
|---|---|---|
| `si-educational-nextjs` | Landing page hero, course cards, nav patterns | Reference only |
| `tailadmin-dashboard` | Admin table UI, sidebar layout, charts | Reference only |
| `vercel-auth-starter` | Auth form validation patterns | Reference only |
| `landing-page-starter` | CTA sections, feature grids | Reference only |
| All others | Not applicable to our domain | Not used |

---

## Feature Matrix

| Theme | Auth | CMS | Admin UI | Dark Mode | App Router | Used? |
|---|---|---|---|---|---|---|
| si-educational-nextjs | ✅ | ❌ | ❌ | ✅ | ✅ | Reference |
| tailadmin-dashboard | ❌ | ❌ | ✅ | ✅ | ✅ | Reference |
| vercel-auth-starter | ✅ | ❌ | ❌ | ❌ | ✅ | Reference |
| landing-page-starter | ❌ | ❌ | ❌ | ❌ | ✅ | Reference |
| **Fumadocs** | ❌ | ✅ (MDX) | ❌ | ✅ | ✅ | **Primary** |
| All others | — | — | — | — | — | Not used |

---

## Pollution Prevention

- [ ] **NEVER** `cd themes/xxx && npm install`
- [ ] **NEVER** commit `node_modules` from any `themes/` subdirectory
- [ ] **NEVER** edit files inside `themes/`
- [ ] **ALWAYS** cherry-pick components, never copy entire themes

---

*Last updated: 2026-06-09*
*See: [ui.md](ui.md) for our actual design system, [architecture.md](architecture.md) for tech stack.*
