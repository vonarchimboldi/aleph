# Aleph Admin Panel

This is the content administration interface for the Aleph learning platform.

The customer-facing app lives in the separate `aleph_v2` repository. Both apps connect to the same Supabase project.

## Local development

```bash
npm install
npm run dev
```

Runs on http://localhost:3001.

## Environment variables

Copy the example file and fill in your Supabase credentials:

```bash
cp .env.local.example .env.local
```

Required:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Optional:

- `NEXT_PUBLIC_SITE_URL` (logout redirect fallback; defaults to localhost:3001)
- `SUPABASE_SERVICE_ROLE_KEY` (documented for future server-side operations — currently unused in code)

## Access control

The middleware and per-page checks admit roles `admin` **and** `instructor`,
but the database's write policies currently allow only `admin`
(`is_admin()`). In practice: give content editors role `admin` (SQL:
`update profiles set role='admin' where email='…'`) until instructor write
policies are added. See the caveats guide in the learner repo
(`aleph_v2/docs/guides/05-caveats-and-gotchas.md`).

## Documentation

The platform's operator/developer guides live in the learner repo:
`aleph_v2/docs/guides/` — start at `00-start-here.md`. The admin-specific
walkthrough is `03-admin-guide.md`.

## Legacy code

The previous vanilla JS app is archived in `legacy/` for reference during migration.
