# Aleph Content

This directory contains the authored learning content for the Aleph platform.

## Structure

```
content/
└── courses/
    └── {course-slug}/
        ├── _meta.json
        └── {chapter-slug}/
            ├── _meta.json
            └── {section-slug}.mdx
```

## File conventions

- Each MDX file represents one section.
- Frontmatter links the file to a database row via `section_id`.
- Math uses KaTeX delimiters:
  - Inline: `\( ... \)`
  - Display: `\[ ... \]`

## Example frontmatter

```mdx
---
section_id: sec-1-2
type: read
estimated_minutes: 20
---
```

## Authoring workflow

1. Create or edit an MDX file in the appropriate chapter directory.
2. Update the corresponding section metadata in the admin app or Supabase.
3. Commit the MDX file to Git.
4. Deploy triggers a rebuild; static pages are cached via Next.js.
