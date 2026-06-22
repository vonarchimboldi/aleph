# Aleph

Monorepo for the Aleph exam-prep learning platform.

## Structure

```
aleph/
├── apps/
│   ├── learner/          # Next.js learner app (aleph.io)
│   └── admin/            # Next.js admin app (studio.aleph.io)
├── packages/
│   ├── types/            # Shared TypeScript types
│   └── supabase/         # Shared Supabase client utilities (planned)
├── content/              # MDX reading content
│   └── courses/
├── supabase/             # Supabase migrations and seed (in learner app for now)
├── legacy/               # Previous vanilla JS app and material
└── README.md
```

## Getting started

```bash
# Install dependencies for all workspaces
npm install

# Run learner app on http://localhost:3000
npm run dev:learner

# Run admin app on http://localhost:3001
npm run dev:admin
```

## Environment variables

Copy the example files in each app and fill in your Supabase credentials:

```bash
cp apps/learner/.env.local.example apps/learner/.env.local
cp apps/admin/.env.local.example apps/admin/.env.local
```

Required:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL`

Optional:

- `SUPABASE_SERVICE_ROLE_KEY` (for admin operations)

## Content authoring

Reading content lives in `content/courses/{course}/{chapter}/{section}.mdx`.
Structured content (problems, quizzes, concept graphs) lives in Supabase and is edited through the admin app.

## Legacy code

The previous vanilla JS app is archived in `legacy/` for reference during migration.
