# AGENTS.md

## Project Overview

NoCode Launchpad is a Jekyll 4.3 static blog (affiliate marketing content for Base44/Wix). No backend server, no database — just Jekyll rendering Markdown/HTML into a static site.

## Local Development

The site is served via `docker compose -f docker-compose.base44.yml up -d` (port 3000).

- **Runtime:** Ruby 3.3 + Jekyll 4.3 (gems from `Gemfile`/`Gemfile.lock`, cached in a named volume).
- **Bundler:** Gemfile.lock pins bundler 4.0.9; the compose command installs it explicitly (`gem install bundler -v 4.0.9`) before `bundle install`.
- **Baseurl override:** `_config.yml` sets `baseurl: "/nocode-launchpad"` for GitHub Pages. The compose command passes `--baseurl ''` so the site serves at root `/` in the preview.
- **Live reload disabled:** `--livereload` is NOT used. Jekyll's livereload script injects a `<script>` that tries to connect to port 35729, which is not exposed through the preview proxy — this causes the page to hang in `loading` state. The platform handles preview reloads itself.
- **File watching:** `--force_polling --incremental` (polling needed for bind-mount file watching).
- **No external credentials required** to boot. The `api/` directory contains Vercel serverless functions (Impact.com webhook) that are not part of local Jekyll serving.

## Key Structure

- `_layouts/` — `default.html` (site shell), `post.html` (blog post layout)
- `_includes/` — `header.html`, `footer.html` (shared partials)
- `_posts/` — Markdown blog posts
- `assets/` — CSS, JS, images (WebP + legacy formats)
- `social-ads/preview.html` — standalone ad preview page (excluded from sitemap)
- All asset links use Jekyll's `relative_url` filter, so the baseurl override works cleanly.

## Known Issues (pre-existing)

- Two blog posts (`2026-10-02-wix-vs-squarespace.md`, `2026-10-02-best-website-builders.md`) reference OG images (`/assets/images/wix-vs-squarespace.webp`, `/assets/images/best-website-builders.webp`) that were never created. These cause console errors but do not affect page rendering.

## Verification

- `curl http://localhost:3000/` returns the rendered homepage.
- Individual posts are at `/<post-slug>/` (e.g., `/base44-review/`).
- The feed is at `/feed.xml`.
- `social-ads/preview.html` is at `/social-ads/preview.html`.
