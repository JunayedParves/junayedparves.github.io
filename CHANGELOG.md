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
