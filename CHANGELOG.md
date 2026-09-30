# Changelog

All notable changes to the **code and design** of this site are listed here.
Content changes (edits in the Google Sheet) are not listed; they are saved
automatically as `content: sync from Google Sheet <date>` commits.

This project uses [Semantic Versioning](https://semver.org/):

- **MAJOR** (v**2**.0.0) — big redesign or a change that breaks the Sheet format
  (e.g. renamed columns you'd have to fix in the Sheet)
- **MINOR** (v1.**1**.0) — new feature or section, fully backwards compatible
- **PATCH** (v1.0.**1**) — small fixes: typos in code, styling tweaks, bug fixes

## [Unreleased]

- _Add changes here as you work. Move them under a new version when you release._

## [1.5.0] — 2026-10-01

### Changed
- About stats: "6 / Business units served" replaced with "Focus industries:
  Insurance, E-Commerce, F&B Operations". A stat value can now hold several
  lines (separate them with `|` in the Sheet); labels stay aligned.
- Experience & Education logos now sit directly on the blue (no cream tile).
  Logos with dark text (Green Delta, MetLife, Quantanite, ACCA) use light
  "reversed" versions so they stay readable; brand colours are unchanged.
  BUET's emblem keeps its white field. Logos are left-aligned.

## [1.4.0] — 2026-10-01

### Changed
- Section labels no longer show numbers ("01 — About me" → "About me") and are now
  a bold gold badge with a glowing dot, so each section heading stands out.
- Books section decluttered using the podcast card style: cover on the left, text on
  the right, 2 per row (1 on phones). Each card shows category, title, author and the
  Key takeaway; the longer summary is folded behind a "Read summary" toggle.

## [1.3.0] — 2026-10-01

### Changed
- "People & organizations I follow" rebuilt as a personal learning ecosystem:
  5 people and 4 platforms in two groups ("People I learn from" / "Platforms I
  learn from"), each card with an authentic photo or official logo, type,
  description, a "Why follow" box, topic tags and an external link.
  People have round photos (gold ring); platforms have square logos (cream ring).
- Experience: job dates now sit in their own column (always right-aligned on
  desktop, on their own line on phones).

### Added
- Company logos on each Experience entry and institution logos on each degree card,
  shown on a small cream tile. New optional `logo_url` column in the `experience`
  and `education` tabs. Logos live in `assets/images/logos/`.
- New `following` columns: `group`, `image_alt`, `description`, `why`, `tags`,
  `link_label`, `image_credit` (the old `platform` pill was removed).
- Photo credit line for images that require attribution (DJ Patil, CC BY-SA 4.0).

## [1.2.0] — 2026-09-30

### Changed
- Books section redesigned as a learning library: 10 books in cards (3 / 2 / 1 per row
  on desktop / tablet / phone) with authentic covers, category, summary and a
  "Key takeaway" box, plus a subtle hover effect.

### Added
- New optional `books` columns: `category`, `summary` (replaces `review`, which still
  works), `takeaway` and `status`.

## [1.1.0] — 2026-09-30

### Changed
- New deep sapphire blue colour scheme (`#0B2A6F` / `#081F55`, footer `#05163D`)
  with a soft blue glow behind the hero photo. Share image updated to match.

### Added
- Optional `category` column in the `podcasts` tab, shown as a small gold label.
- Podcast list: 8 shows with official cover art stored in `assets/images/podcasts/`.
- Real brand logos for the Excel, Power BI, SQL, Tableau and Python skill tiles
  (`assets/images/icons/*-logo.png`, cleaned to transparent 128px squares).

## [1.0.0] — 2026-09-30

First launch.

### Added
- One-page portfolio: About, Skills, Experience, Education, Projects (with
  filter tabs), Books, Podcasts, People I follow, Résumé & contact, footer.
- All content loaded from a published Google Sheet (one tab per section),
  with automatic fallback to `data/*.json`.
- `show` and `order` columns to hide and reorder anything from the Sheet.
- Empty sections hide themselves; section numbers and colours adjust.
- Loading skeletons, lazy-loaded images, image placeholders.
- Responsive layout (desktop, tablet, 390px phones) with hamburger menu.
- Contact form via Formspree (falls back to email if not configured).
- GitHub Actions: daily Sheet → JSON backup (`sync-content.yml`) and
  GitHub Pages deployment (`deploy.yml`).
- SEO: meta description, Open Graph share image, favicon, sitemap, robots.txt.
- Custom 404 page.
- Template CSVs for every Sheet tab in `templates/`.
