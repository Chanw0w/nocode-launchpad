# AGENTS.md

## Project Overview

NoCode Launchpad is a Jekyll 4.3 static blog (affiliate marketing content for Base44/Wix). No backend server, no database — just Jekyll rendering Markdown/HTML into a static site.

## Local Development

The site is served via `docker compose -f docker-compose.base44.yml up -d` (port 3000).

- **Runtime:** Ruby 3.2 + Jekyll 4.3 (gems from `Gemfile`/`Gemfile.lock`, cached in a named volume).
- **Baseurl override:** `_config.yml` sets `baseurl: "/nocode-launchpad"` for GitHub Pages. The compose command passes `--baseurl ''` so the site serves at root `/` in the preview.
- **Live reload:** `--livereload --force_polling` (polling needed for bind-mount file watching).
- **No external credentials required** to boot. The `api/` directory contains Vercel serverless functions (Impact.com webhook) that are not part of local Jekyll serving. External integrations (Impact.com, Brevo, Buffer, GA4) are optional and not needed for the site to render.

## Key Structure

- `_layouts/` — `default.html` (site shell), `post.html` (blog post layout)
- `_includes/` — `header.html`, `footer.html` (shared partials)
- `_posts/` — Markdown blog posts
- `assets/` — CSS, JS, images, art
- All asset links use Jekyll's `relative_url` filter, so the baseurl override works cleanly.

## Verification

- `curl http://localhost:3000/` returns the rendered homepage.
- Individual posts are at `/<post-slug>/` (e.g., `/base44-review/`).
- The feed is at `/feed.xml`.
