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
- `NEXT_PUBLIC_SITE_URL`

Optional:

- `SUPABASE_SERVICE_ROLE_KEY` (for server-side admin operations)

## Access control

Only users with `profiles.role = 'admin'` can access the admin interface. The middleware redirects all other users to `/login`.

## Legacy code

The previous vanilla JS app is archived in `legacy/` for reference during migration.
