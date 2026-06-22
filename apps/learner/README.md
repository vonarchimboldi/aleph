# Aleph Learner App

The student-facing Next.js application for Aleph.

## Local development

```bash
npm install
npm run dev
```

Runs on http://localhost:3000.

## Environment variables

See `.env.local.example`.

## Notes

- This app reads course metadata from Supabase and reading content from `../../content/`.
- Static fallback content exists in `src/lib/courses/data.ts` for local development without Supabase.
