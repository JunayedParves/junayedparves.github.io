# M K Junayed Parves — Data & BI Analyst Portfolio

The portfolio site at **https://junayedparves.github.io/**: a homepage, a projects page and
one detailed case-study page per flagship project. It's hosted free on **GitHub Pages**, and the
content is managed from a **Google Sheet**, so updating it needs no code.

- **Fast and crawlable:** plain HTML, CSS and a little vanilla JavaScript. Every page is
  pre-built, so recruiters and search engines see the full content without running scripts.
- **One content source:** the Sheet → `data/*.json` → the pages, rebuilt automatically.
- **Full history:** every content and design change is saved in git, so any version can be restored.
- **Accessible and responsive:** WCAG AA colour contrast, keyboard navigation, reduced-motion support,
  and layouts for desktop, tablet and phone.

> Why the projects were chosen, how they were scored and what is still missing:
> see [PORTFOLIO_AUDIT.md](PORTFOLIO_AUDIT.md).

---

## Contents

1. [How it works](#how-it-works)
2. [What's in this folder](#whats-in-this-folder)
3. [Test the site on your computer](#test-the-site-on-your-computer)
4. [Update your content](#update-your-content)
5. [Add a new project or case study](#add-a-new-project-or-case-study)
6. [Connect the Google Sheet (one-time)](#connect-the-google-sheet-one-time)
7. [Replace your photo or résumé](#replace-your-photo-or-résumé)
8. [Turn on the contact form (optional)](#turn-on-the-contact-form-optional)
9. [Connect a custom domain (later)](#connect-a-custom-domain-later)
10. [Deployment](#deployment)
11. [Releasing a new version (code/design changes)](#releasing-a-new-version-codedesign-changes)
12. [Rolling back](#rolling-back)
13. [SEO and accessibility notes](#seo-and-accessibility-notes)
14. [Alternative: manage content in Excel instead](#alternative-manage-content-in-excel-instead)
15. [Sheet reference (every tab and column)](#sheet-reference)
16. [Troubleshooting](#troubleshooting)

---

## How it works

```
 Google Sheet (you edit here)          content/case-studies/*.json (long-form case-study text)
        │  published as CSV                         │
        ▼                                           │
 scripts/sync.js  ──►  data/*.json  ──────────────► scripts/build.js ──►  index.html
 (daily at 08:00 Dhaka,                                               projects/index.html
  or "Run workflow")                                                  projects/<slug>/index.html
                                                                      sitemap.xml
        └──────── commits the changes ──► GitHub Pages deploys the site (≈1 minute)
```

- **Short, structured content** (profile, skills, experience, education, project cards, books,
  podcasts, people) lives in the **Google Sheet**.
- **Long-form case studies** live in `content/case-studies/<slug>.json`. They are too long for
  a spreadsheet cell.
- `scripts/build.js` turns both into finished HTML pages. Nobody needs to edit HTML by hand.

---

## What's in this folder

| Path | What it is | Do you edit it? |
|---|---|---|
| `index.html`, `projects/` | **Generated** pages | No: they are rebuilt from the content |
| `sitemap.xml` | **Generated** list of pages for search engines | No |
| `404.html` | "Page not found" page | Rarely |
| `css/variables.css` | Colours, fonts, spacing (the design system) | To restyle |
| `css/base.css`, `css/components.css`, `css/pages.css` | Layout, reusable components, page layouts + responsive rules | For design changes |
| `js/navigation.js` | Mobile menu, current-section highlight | No |
| `js/project-filter.js` | Project filter buttons | No |
| `js/main.js` | Knowledge Hub tabs, "show more", screenshot lightbox, contact form | No |
| `js/config.js` | **Settings:** site address, Google Sheet IDs, Formspree ID | Once |
| `data/*.json` | Content copied from the Sheet (or from `templates/`) | No, it's automatic |
| `templates/*.csv` | The content in spreadsheet form: import into Google Sheets, or edit directly | Until the Sheet is connected |
| `content/case-studies/*.json` | Case-study write-ups | When writing a case study |
| `scripts/sync.js` | Sheet → JSON, then runs the build | No |
| `scripts/build.js`, `scripts/lib/` | The page builder and its HTML templates | For layout changes |
| `assets/images/projects/<project>/` | `cover.jpg` (16:10) + numbered dashboard screenshots | When adding projects |
| `assets/images/` (other folders) | Portrait, logos, icons, book/podcast/people images, share image | When adding images |
| `assets/resume.pdf` | Your résumé | When it changes |
| `.github/workflows/` | `sync-content.yml` (daily content sync) and `deploy.yml` (publish) | No |
| `PORTFOLIO_AUDIT.md` | Project audit, scores and capability gaps | For reference |
| `CHANGELOG.md` | Version history | When releasing |

Local-only files (the design mockup, original PDF/PNG, source logos) are listed in `.gitignore`
and are never uploaded.

---

## Test the site on your computer

The pages are already built, so **VS Code + Live Server** shows them straight away:

1. Install **[Visual Studio Code](https://code.visualstudio.com/)** and the **Live Server** extension (by Ritwick Dey).
2. **File → Open Folder…** → this project folder.
3. Right-click `index.html` → **Open with Live Server**. The site opens at `http://127.0.0.1:5500/`.

**After changing content** (`templates/*.csv` or `content/case-studies/*.json`), rebuild the pages.
This needs [Node.js](https://nodejs.org) 18 or newer and nothing else:

```bash
node scripts/sync.js --from-templates
```

That command copies `templates/*.csv` into `data/` and rebuilds every page. If you only changed a
case study or a file in `data/`, this is enough:

```bash
node scripts/build.js
```

**Check phone size:** press `F12` in Chrome or Edge → the device icon (`Ctrl+Shift+M`) → "iPhone 12 Pro" (390 px).

*No VS Code?* Run `python -m http.server 5500` in this folder and open `http://localhost:5500`.

---

## Update your content

**With the Google Sheet connected:**

1. Edit the Sheet.
2. On GitHub → **Actions** → **Sync content from Google Sheet** → **Run workflow**.
   (Or do nothing: it runs automatically every day at 08:00 Dhaka time.)
3. About two minutes later the site is updated. The change is also saved in git history.

**Before the Sheet is connected:** edit `templates/*.csv` (Excel, Google Sheets or any text editor),
run `node scripts/sync.js --from-templates`, then commit and push.

Rules that apply to every tab:
- **Hide something** without deleting it: set `show` to `FALSE`.
- **Reorder:** change `order`. Lower numbers come first; decimals like `1.5` are fine.
- **Lists inside one cell:** separate items with `|`, e.g. in `experience → bullets`:
  `Built X dashboards | Cut report time by 30% | Automated 3 workflows`.
- **Images:** any `*_url` column accepts a full link (`https://…`) or a repo path (`assets/images/…`).
  Repo paths are better: they never break and they load faster.

---

## Add a new project or case study

**A gallery project** (card only, linking to a demo, repo or Tableau Public):
1. Save a screenshot as `assets/images/projects/<name>/cover.jpg` (or `.png`), ideally 1200 × 750.
2. Add a row to the `projects` tab with `case_study = FALSE` (see the [column reference](#sheet-reference)).

**A full case study:**
1. Put screenshots in `assets/images/projects/<folder>/`: `cover.jpg` (1200 × 750, 16:10) plus
   `01.jpg`, `02.jpg`… (max 1600 px wide). Keep each under ~250 KB; [squoosh.app](https://squoosh.app) can shrink them.
2. Add a row to the `projects` tab with a `slug` (e.g. `insurance-kpi-analytics`), `case_study = TRUE`,
   and `image_url = assets/images/projects/<folder>/cover.jpg`. Set `featured = TRUE` to show it on the homepage.
3. Copy any file in `content/case-studies/` to `content/case-studies/<slug>.json`, set `"slug"`, and
   rewrite the sections. Every section is optional; use only what fits the project. Section types:
   `paragraphs`, `list`, `findings` (numbered cards), `kpis` (metric/definition table), `table`
   (`head` + `rows`), `gallery: true` (shows the screenshots listed in `"gallery"`), `after` (text
   after a table), `callout` (+ `"callout_type": "warn"` for data notes).
4. Run `node scripts/build.js`. The page appears at `/projects/<slug>/`, and is added to the
   projects page, the filters and the sitemap automatically.

**House rules for case studies:** only use numbers from the project itself, label the data
(`Synthetic data`, `Practice data` or `Public data`), and never include employer data.

---

## Connect the Google Sheet (one-time)

1. **Create the Sheet:** [sheets.new](https://sheets.new) → **File → Import → Upload** →
   `templates/profile.csv` → "Replace current sheet", untick "Convert text to numbers, dates, and
   formulas" → rename the tab to **`profile`**. Repeat for every CSV in `templates/` with
   "Insert new sheet(s)", naming each tab exactly as its file: `skills`, `experience`, `education`,
   `projects`, `books`, `podcasts`, `following`.
2. **Publish:** **File → Share → Publish to web** → "Entire document" + "Comma-separated values
   (.csv)" → **Publish**. Copy the part of the link between `/d/e/` and `/pub` (it starts with `2PACX-`).
   Keep "Automatically republish when changes are made" ticked.
3. **Find each tab's gid:** click a tab and read the number after `#gid=` in the address bar.
4. **Paste them into `js/config.js`** (`publishedId` and the 8 `gids`), then commit and push.
5. **Run the first sync:** **Actions → Sync content from Google Sheet → Run workflow**.

> Publishing makes the Sheet readable by anyone with the link. That's fine, because it holds
> the same information as the public website, but keep private notes out of it.

---

## Replace your photo or résumé

- **Photo:** replace `assets/images/portrait.jpg` with the same file name. 4:5 works best (800 × 1000 px).
- **Résumé:** replace `assets/resume.pdf` with the same file name, and update `resume_note` in `profile`.
- **Share image:** `assets/images/og-image.jpg` (1200 × 630) is shown when the site is shared on LinkedIn.

Then commit and push. If LinkedIn still shows the old preview, use the
[LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/).

---

## Turn on the contact form (optional)

Without a Formspree ID **no form is shown**. Visitors use the Email button and contact links,
so there is never a form that silently fails. To add one:

1. Sign up free at [formspree.io](https://formspree.io) → **New form** → copy the ID from
   `https://formspree.io/f/<ID>`.
2. Put it in `js/config.js` → `formspreeId: "<ID>"`, then run `node scripts/build.js`, commit and push.
3. Send yourself a test message; confirm the first one from Formspree's email.

---

## Connect a custom domain (later)

1. Buy a domain. In its DNS, add four **A** records for `@` → `185.199.108.153`,
   `185.199.109.153`, `185.199.110.153`, `185.199.111.153`, and a **CNAME** `www` → `junayedparves.github.io`.
2. GitHub → **Settings → Pages → Custom domain** → enter it → **Save** → tick **Enforce HTTPS** when ready.
3. Change `siteUrl` in `js/config.js` and the sitemap line in `robots.txt`, run `node scripts/build.js`,
   then commit and push. Canonical URLs, share tags and the sitemap all follow `siteUrl`.

---

## Deployment

- **Every push to `main`** runs `.github/workflows/deploy.yml`: it rebuilds the pages with
  `node scripts/build.js` and publishes the repository to GitHub Pages (Settings → Pages →
  Source must be **GitHub Actions**).
- **Every day at 08:00 Dhaka time** (or on demand), `.github/workflows/sync-content.yml` copies
  the Sheet into `data/`, rebuilds the pages, and commits *only if something changed*
  (`content: sync from Google Sheet <date>`). The deploy runs right after.
- Workflow permissions must be **Read and write** (Settings → Actions → General).

---

## Releasing a new version (code/design changes)

Content goes through the Sheet. **Design and code changes** follow this routine, so the live site
is never half-changed. Versions follow `MAJOR.MINOR.PATCH` (see `CHANGELOG.md`): patch = small fix,
minor = new feature, major = redesign or a change to the Sheet's columns.

```bash
git checkout main
```
```bash
git pull
```
```bash
git checkout -b feature/my-change
```

Make the change, run `node scripts/build.js`, test with Live Server, and add a line under
`## [Unreleased]` in `CHANGELOG.md`. Then:

```bash
git add .
```
```bash
git commit -m "Describe the change"
```
```bash
git push -u origin feature/my-change
```

Open the pull request on GitHub (**Compare & pull request**), review **Files changed**, then
**Merge pull request**. The site deploys automatically. Finally, move the changelog notes under
a new version heading on `main` and tag it:

```bash
git checkout main
```
```bash
git pull
```
```bash
git tag -a v3.1.0 -m "v3.1.0: describe the release"
```
```bash
git push origin v3.1.0
```

---

## Rolling back

**Undo one change** (keeps history): copy the commit ID from GitHub's **Commits** page, then:

```bash
git revert <commit-id>
```
```bash
git push
```

For a content sync commit, also fix the value in the Sheet, or the next sync brings it back.

**Return to a whole earlier version** (e.g. `v2.2.0`, the last version before this redesign):

```bash
git checkout main
```
```bash
git restore --source v2.2.0 -- .
```
```bash
git commit -m "Roll back to v2.2.0"
```
```bash
git push
```

**Just look at an old version:** `git switch --detach v2.2.0`, open it with Live Server, then `git switch main`.

---

## SEO and accessibility notes

- Every page has a unique `<title>`, meta description, canonical URL, Open Graph and Twitter tags.
- **Structured data:** a `Person` and `WebSite` on the homepage, a `CollectionPage` on the projects
  page, and a `CreativeWork` + `BreadcrumbList` on each case study.
- `sitemap.xml` is regenerated on every build, and `robots.txt` points to it.
- One `<h1>` per page, a logical heading order, descriptive alt text on every screenshot,
  `width`/`height` on images (no layout shift), and lazy loading below the fold.
- Keyboard: a skip link, visible focus rings, arrow-key tabs, a lightbox that closes with `Esc`, and
  a mobile menu that closes with `Esc`. Animations are switched off for visitors who prefer reduced motion.

---

## Alternative: manage content in Excel instead

*(Explained only; this repo uses the Google Sheet.)*
Keep `data/content.xlsx` with the same tabs and headers as `templates/`, read it in `scripts/sync.js`
with the free [SheetJS `xlsx`](https://docs.sheetjs.com/) package
(`XLSX.utils.sheet_to_json(book.Sheets[tab], { defval: "", raw: false })`), and change
`sync-content.yml` to run on `push` when `data/content.xlsx` changes (adding `npm install xlsx`).
Every content edit then becomes: edit Excel → commit → push.

---

## Sheet reference

Every tab except `profile`: **`order`** = position (lower first); **`show`** = `TRUE`/`FALSE` (blank = TRUE).

### `profile` (key | value)

| key | Meaning |
|---|---|
| `name`, `initials`, `role` | Name, logo initials, main job title |
| `target_roles` | Roles shown in the hero, separated by `\|` |
| `headline` | Hero heading; wrap words in `*…*` to colour them |
| `hero_description`, `capabilities` | Hero text and the capability tags (`\|`-separated) |
| `current_role`, `current_org`, `location` | The "Currently" card on the photo |
| `photo_url`, `photo_alt`, `resume_url`, `resume_note` | Portrait, its alt text, résumé file and note |
| `email`, `linkedin`, `github`, `tableau` | Contact and profile links |
| `availability` | One sentence in the contact section |
| `seo_title`, `seo_description` | Homepage `<title>` and meta description (≤ 160 characters) |
| `stat1_value` … `stat4_detail` | Snapshot cards. `{case_studies}` in a value is replaced by the real count |
| `industries` | Industry chips, `\|`-separated |
| `role1_title`/`role1_text` … `role3_…` | The three "roles I fit" cards |
| `<section>_label`, `<section>_title`, `<section>_intro` | Headings for `snapshot`, `projects`, `skills`, `experience`, `education`, `knowledge`, `contact` |
| `books_visible`, `podcasts_visible`, `following_visible` | Items shown before "Show more" (default 5) |
| `last_updated` | Footer date and sitemap date (`YYYY-MM-DD`) |

### Other tabs

| Tab | Columns | Notes |
|---|---|---|
| `skills` | order, group, name, detail, icon_url, show | `group` = `Tools` (logo strip; needs `icon_url`) or a category card: `Data Analysis`, `Business Intelligence`, `Data Management`, `Business Analytics` (new names create new cards) |
| `experience` | order, title, company, city, start, end, bullets, tools, impact, logo_url, show | `bullets` and `tools` use `\|`; empty `end` = "Present"; `impact` = one line, only verified results |
| `education` | order, type, title, institution, years, detail, status, logo_url, show | `type` = `degree` or `certification`; `status` = `Completed` or `In progress` |
| `projects` | order, slug, title, category, tags, industry, summary, problem, outcome, tools, image_url, image_alt, data_note, repo_url, demo_url, link_url, link_label, featured, case_study, show | `tags` drive the filters (Power BI, SQL, Python, Tableau, Excel, Business Analytics, Predictive Analytics, Web App); `data_note` = Synthetic data / Practice data / Public data; `case_study = TRUE` needs `content/case-studies/<slug>.json` |
| `books` | order, title, author, cover_url, category, summary, takeaway, status, rating, show | Shown in the Knowledge Hub |
| `podcasts` | order, name, host, cover_url, why, link_url, category, show | Shown in the Knowledge Hub |
| `following` | order, group, name, role_org, avatar_url, image_alt, description, why, tags, link_label, link_url, image_credit, show | `group` = `people` or `platforms`; `image_credit` = `Photo: Name, licence \| https://source` |

**Adding a column** is harmless (it's ignored). **Renaming a column** breaks that field, so keep the headers exactly as above.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| A Sheet edit isn't on the site | Run **Actions → Sync content from Google Sheet → Run workflow**, or wait for the daily run. Google caches published CSVs for ~5 minutes. |
| Local change not showing | Run `node scripts/build.js` (or `node scripts/sync.js --from-templates` after editing a CSV), then `Ctrl+F5`. |
| A case study is missing | Its row needs `case_study = TRUE`, `show = TRUE`, and a matching `content/case-studies/<slug>.json`. The build prints a warning otherwise. |
| A project isn't under a filter | Its `tags` must contain the filter name exactly, e.g. `Power BI`. |
| Sync fails with "got a web page instead of CSV" | The Sheet isn't published, or a gid is wrong. |
| Sync fails with 403 | Settings → Actions → General → Workflow permissions → **Read and write**. |
| Site not updating after a push | Open the **Actions** tab for a red ✗; Settings → Pages → Source must be **GitHub Actions**. |
