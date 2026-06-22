# Aleph Admin App

The content administration interface for Aleph.

## Local development

```bash
npm install
npm run dev
```

Runs on http://localhost:3001.

## Environment variables

See `.env.local.example`.

## Notes

- Only users with `profiles.role = 'admin'` can access the admin interface.
- The middleware redirects unauthenticated users to `/login`.
