# Junayed Parves — Data & BI Portfolio

A one-page portfolio website, hosted free on **GitHub Pages**, whose content you
manage from a **Google Sheet** — no code editing needed to update it.

- Plain HTML, CSS and JavaScript. No framework and no build step.
- Content comes from a published Google Sheet, with an automatic backup copy in `data/`.
- A GitHub Action saves the Sheet into the repo every day, so every change is kept in git history.
- Works on desktop, tablet and phone. Accessible and fast.

---

## Contents

1. [How it works (the big picture)](#how-it-works)
2. [What's in this folder](#whats-in-this-folder)
3. [Test the site on your computer](#test-the-site-on-your-computer)
4. [Step 1 — Create the GitHub repo and turn on GitHub Pages](#step-1--create-the-github-repo-and-turn-on-github-pages)
5. [Step 2 — Create the Google Sheet and publish it](#step-2--create-the-google-sheet-and-publish-it)
6. [Step 3 — Paste the IDs into config.js](#step-3--paste-the-ids-into-configjs)
7. [Step 4 — Update your content](#step-4--update-your-content)
8. [Step 5 — Replace your photo and résumé](#step-5--replace-your-photo-and-résumé)
9. [Step 6 — Set up the contact form (Formspree)](#step-6--set-up-the-contact-form-formspree)
10. [Step 7 — Connect a custom domain (later)](#step-7--connect-a-custom-domain-later)
11. [Automatic backups and content history](#automatic-backups-and-content-history)
12. [Releasing a new version (code/design changes)](#releasing-a-new-version-codedesign-changes)
13. [Rolling back](#rolling-back)
14. [Alternative: manage content in Excel instead](#alternative-manage-content-in-excel-instead)
15. [Sheet reference (every tab and column)](#sheet-reference)
16. [Troubleshooting](#troubleshooting)

---

## How it works

```
 Google Sheet (you edit here)
        │  "Publish to web" as CSV
        ▼
 Visitor opens the site ──► js/script.js downloads each tab ──► draws the page
                                   │
                                   └─ if Google fails ──► uses data/<tab>.json (backup)

 Every day at 08:00 Dhaka time:
 GitHub Action ──► downloads the Sheet ──► saves data/*.json ──► commits (only if changed) ──► redeploys
```

The site reads the Sheet **live**, so edits show up without touching GitHub.
The daily backup is your safety net and your content history.

---

## What's in this folder

| Path | What it is | Do you edit it? |
|---|---|---|
| `index.html` | Page skeleton. No personal text: everything is filled in from data. | Rarely |
| `404.html` | "Page not found" page | Rarely |
| `css/style.css` | All the styling. Colours and fonts are variables at the top. | For design changes |
| `js/config.js` | **Your settings**: Sheet ID, tab gids, Formspree ID, site URL | **Yes, once** |
| `js/script.js` | Loads the data and draws the sections | No |
| `data/*.json` | Backup copy of each Sheet tab (written by the Action) | No, it's automatic |
| `templates/*.csv` | Starter files to import into Google Sheets | Only once |
| `scripts/sync.js` | Sheet → JSON converter used by the Action | No |
| `assets/images/` | Photo, icons, share image, book covers… | When adding images |
| `assets/resume.pdf` | Your résumé | When it changes |
| `.github/workflows/` | The two GitHub Actions (sync and deploy) | No |
| `CHANGELOG.md` | List of code/design versions | When releasing |
| `favicon.svg`, `sitemap.xml`, `robots.txt` | Browser icon and search-engine files | If your domain changes |

The design mockup, `Linkedin.html` and the original PDF/PNG stay on your computer only.
They're listed in `.gitignore`, so they are never uploaded.

---

## Test the site on your computer

> ⚠️ Double-clicking `index.html` **won't work**. Browsers block pages opened as files
> from loading data. You need a tiny local web server. The easiest is VS Code + Live Server.

1. Install **[Visual Studio Code](https://code.visualstudio.com/)** (free).
2. Open VS Code → click the **Extensions** icon on the left (four little squares) →
   search **"Live Server"** (by Ritwick Dey) → **Install**.
3. **File → Open Folder…** → choose this project folder.
4. In the file list on the left, right-click `index.html` → **"Open with Live Server"**.
   Your browser opens at something like `http://127.0.0.1:5500/`.
5. Every time you save a file, the page reloads by itself.

**Check it on a phone size:** in Chrome/Edge press `F12` → click the phone/tablet icon at
the top-left of the panel (or `Ctrl+Shift+M`) → choose "iPhone 12 Pro" (390 px wide).

**See where the data came from:** in the same `F12` panel open the **Console** tab.
You'll see lines like `[portfolio] skills: loaded from Google Sheet` or `…from backup JSON`.

*No VS Code?* If Python is installed, open a terminal in this folder and run the command below.
Then visit `http://localhost:5500`.

```bash
python -m http.server 5500
```

---

## Step 1 — Create the GitHub repo and turn on GitHub Pages

### 1a. Create the repository
1. Sign in at [github.com](https://github.com) (your username is `junayedparves`).
2. Top-right **＋** → **New repository**.
3. **Repository name:** `junayedparves.github.io`
   *(Using exactly `<username>.github.io` makes the site live at `https://junayedparves.github.io/`.
   Any other name, e.g. `portfolio`, makes it live at `https://junayedparves.github.io/portfolio/`.
   Then update `siteUrl` in `js/config.js`, `sitemap.xml`, `robots.txt`, and the `/` paths in `404.html`.)*
4. Set it to **Public**, and **don't** tick "Add a README" (you already have one) → **Create repository**.

### 1b. Upload the files
Install [Git](https://git-scm.com/download/win) if you haven't already. Open a terminal in this project folder
(in VS Code: **Terminal → New Terminal**) and run these one at a time:

```bash
git init -b main
```

```bash
git add .
```

```bash
git commit -m "v1.0.0: first launch"
```

```bash
git remote add origin https://github.com/junayedparves/junayedparves.github.io.git
```

```bash
git push -u origin main
```

*(Prefer clicking to typing? [GitHub Desktop](https://desktop.github.com/) does the same:
**File → Add local repository** → pick this folder → **Publish repository**.)*

### 1c. Turn on GitHub Pages
1. On GitHub, open your repo → **Settings** (top tab, gear icon).
2. In the left sidebar click **Pages**.
3. Under **Build and deployment → Source**, pick **"GitHub Actions"** from the dropdown.
   (Not "Deploy from a branch".)
4. Click the **Actions** tab at the top. You'll see "Deploy to GitHub Pages" running with a yellow dot.
   When it turns into a green tick (about 1 minute), your site is live at
   **https://junayedparves.github.io/**. The green tick's page also shows the link.

### 1d. Allow the backup Action to save
**Settings → Actions → General** → scroll to **Workflow permissions** → choose
**"Read and write permissions"** → **Save**.

### 1e. Tag the first release

```bash
git tag -a v1.0.0 -m "First launch"
```

```bash
git push origin v1.0.0
```

---

## Step 2 — Create the Google Sheet and publish it

### 2a. Create the sheet with one tab per section
1. Go to [sheets.new](https://sheets.new) to create a blank sheet. Name it e.g. *"Portfolio content"*.
2. Import the first template: **File → Import → Upload** → drag in `templates/profile.csv`.
   - **Import location:** "Replace current sheet" (for the first one only)
   - **Separator type:** Detect automatically
   - **Untick** "Convert text to numbers, dates, and formulas"
   - → **Import data**
3. At the bottom, double-click the tab name (`Sheet1`) and rename it to exactly **`profile`**.
4. Repeat for every other template. This time choose **Import location: "Insert new sheet(s)"**.
   Rename each tab to match its file name exactly, in lowercase:
   `skills`, `experience`, `education`, `projects`, `books`, `podcasts`, `following`.

You should now have **8 tabs** along the bottom. Each has a first row of column headers like
`order | name | detail | …`. **Don't rename or delete the header row.**

> 💡 **Tip — tick boxes for `show`:** select the `show` column (except the header) →
> **Insert → Checkbox**. Ticked = shown on the site, unticked = hidden.

### 2b. Publish to the web as CSV
1. **File → Share → Publish to web**.
2. In the first dropdown keep **"Entire document"**. In the second, choose **"Comma-separated values (.csv)"**.
3. Click **Publish** → **OK**.
4. Google shows a link like
   `https://docs.google.com/spreadsheets/d/e/2PACX-1vQx…long…Zz/pub?output=csv`
   Copy the part **between `/d/e/` and `/pub`**. It starts with `2PACX-`. This is your **published ID**.
5. Make sure **"Automatically republish when changes are made"** is ticked
   (under "Published content & settings" at the bottom of that window).

> Publishing makes the Sheet's *contents* readable by anyone with the link. That's fine here,
> because it's the same information shown on your public website. Don't put private notes in this Sheet.

### 2c. Find each tab's "gid"
Click each tab at the bottom and look at the address bar. It ends with `#gid=` followed by a number:
`https://docs.google.com/spreadsheets/d/…/edit#gid=`**`1839204571`**.
Write down the number for all 8 tabs. The first tab is usually `0`.

---

## Step 3 — Paste the IDs into config.js

Open `js/config.js` and fill in the published ID and the 8 gids:

```js
sheet: {
  publishedId: "2PACX-1vQx...Zz",
  gids: {
    profile:    "0",
    skills:     "1839204571",
    experience: "20394857",
    ...
  }
},
```

Save, then test locally with Live Server. The Console should now say `loaded from Google Sheet`.
Then publish the change:

```bash
git add js/config.js
```

```bash
git commit -m "config: connect Google Sheet"
```

```bash
git push
```

Finally, create the first backup: on GitHub go to **Actions → "Sync content from Google Sheet" →
Run workflow → Run workflow**.

---

## Step 4 — Update your content

**Edit the Sheet → wait a few minutes → refresh the site.** That's it.

- Google refreshes the published CSV about every **5 minutes**, so changes aren't instant.
- **Hide something** without deleting it: set `show` to `FALSE` (or untick the checkbox).
- **Reorder:** change the numbers in `order`. Lower numbers come first; decimals like `1.5` are fine.
- **Line breaks / bullets:** separate items with `|`. For example, in `experience → bullets`:
  `Built X dashboards | Cut report time by 30% | Automated 3 workflows`.
  The same trick works in `profile → headline` to split it over lines.
- **Leave `end` empty** in `experience` to show "Present".
- **A whole section disappears** when its tab has no visible rows (e.g. Podcasts). The menu link
  goes too, and the section numbers ("01 —", "02 —") renumber themselves.
- **Section headings** (like "My analytics toolkit") come from the `profile` tab:
  `skills_title`, `skills_intro`, `skills_label`, and the same for `experience_`, `education_`,
  `projects_`, `books_`, `podcasts_`, `following_` and `contact_`. Leave one empty to use the default.
- **`last_updated`** (in `profile`) is shown in the footer. Use the format `2026-10-15`.

### Adding images
Any `*_url` column accepts either:
- a **full link**: `https://example.com/cover.jpg`, or
- a **file in this repo**: `assets/images/books/storytelling.jpg`

To add a file: put it in the right folder under `assets/images/` (`projects/`, `books/`,
`podcasts/`, `people/`), then commit and push. Keep images small: under ~300 KB each,
and about 1200 px wide for project screenshots. [squoosh.app](https://squoosh.app) is a free way to shrink them.
If an image is missing or its link breaks, the site shows a neat placeholder instead.

> **Your starter content:** the templates are filled with your real details from your résumé and
> LinkedIn page. Suggested items that still need your confirmation are included but **hidden** (`show = FALSE`):
> most books, all podcasts, all people you follow, and three planned projects.
> Tick the ones that are true for you and rewrite the review/"why" text in your own words.

---

## Step 5 — Replace your photo and résumé

**Photo:** replace `assets/images/portrait.jpg` with a new image, using the same file name.
A 4:5 portrait works best (e.g. 800 × 1000 px), under ~200 KB. Or put the new file anywhere and
change `photo_url` in the `profile` tab.

**Résumé:** replace `assets/resume.pdf` with your new PDF, using the same file name. Then update
`resume_note` in the `profile` tab (e.g. "Last updated Oct 2026").

**Share image:** `assets/images/og-image.jpg` (1200 × 630) is the picture LinkedIn/WhatsApp show
when someone shares your link. Replace it the same way if you want.

Then commit and push:

```bash
git add assets
```

```bash
git commit -m "content: new photo and résumé"
```

```bash
git push
```

---

## Step 6 — Set up the contact form (Formspree)

Until this is set up, the form opens the visitor's email app instead. That works, but it's less smooth.

1. Sign up free at [formspree.io](https://formspree.io) with the email where you want messages to arrive.
2. **+ New form** → name it "Portfolio" → **Create**.
3. You'll see an endpoint like `https://formspree.io/f/xyzabcd`. Copy the last part (`xyzabcd`).
4. Paste it in `js/config.js`:
   ```js
   formspreeId: "xyzabcd",
   ```
5. Commit and push. Then send yourself a test message from the live site.
   The first time, Formspree emails you to confirm; click the link in that email.

The free plan covers 50 messages a month. Spam bots are filtered by a hidden "honeypot" field.

---

## Step 7 — Connect a custom domain (later)

1. Buy a domain (e.g. from Namecheap, Cloudflare or Porkbun), such as `junayedparves.com`.
2. At your domain provider, open the **DNS** settings and add:
   - Four **A** records for `@` pointing to:
     `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - One **CNAME** record: name `www` → value `junayedparves.github.io`
3. On GitHub: **Settings → Pages → Custom domain** → type `junayedparves.com` → **Save**.
   Wait for the DNS check to pass (minutes to a few hours), then tick **Enforce HTTPS**.
4. Update the address in: `js/config.js` (`siteUrl`), `sitemap.xml`, `robots.txt`. Commit and push.

---

## Automatic backups and content history

`.github/workflows/sync-content.yml` runs **every day at 02:00 UTC** (08:00 in Dhaka):

1. downloads every tab as CSV → saves `data/<tab>.json`
2. updates the `<title>`, description and share tags in `index.html` from your `profile` tab
3. commits **only if something changed**, with the message `content: sync from Google Sheet 2026-10-15`
4. triggers a redeploy

**Run it now:** GitHub → **Actions** → "Sync content from Google Sheet" → **Run workflow**.

**See what changed and when:** GitHub → your repo → click **Commits** (or open `data/experience.json`
→ **History**). Each sync commit shows exactly which lines changed.

If the Sheet can't be reached, the sync stops **without changing anything**, so your backup is never wiped.

**Test the converter on your computer** (needs [Node.js](https://nodejs.org) 18+):

```bash
node scripts/sync.js
```

Or, before the Sheet exists, rebuild `data/` from the template CSVs:

```bash
node scripts/sync.js --from-templates
```

---

## Releasing a new version (code/design changes)

Content edits go through the Sheet. **Code and design changes** (CSS, HTML, JS) follow this routine,
so the live site is never half-changed and every version can be restored.

Version numbers follow `vMAJOR.MINOR.PATCH` (see `CHANGELOG.md`):
- **Patch** `v1.0.1`: small fix (a colour, a typo in code)
- **Minor** `v1.1.0`: new feature or section
- **Major** `v2.0.0`: redesign, or a change to the Sheet's columns

### The routine

**1. Start a branch from the latest main:**

```bash
git checkout main
```

```bash
git pull
```

```bash
git checkout -b feature/dark-footer
```

**2. Make your changes**, test with Live Server, and add a line under `## [Unreleased]` in `CHANGELOG.md`.

**3. Commit and push the branch:**

```bash
git add .
```

```bash
git commit -m "Make footer darker"
```

```bash
git push -u origin feature/dark-footer
```

**4. Open a Pull Request:** on GitHub a yellow banner appears → **Compare & pull request** →
check the "Files changed" tab → **Create pull request**.

**5. Merge:** click **Merge pull request** → **Confirm merge**. The deploy Action publishes the site automatically.

**6. Tag the release:** first move the `[Unreleased]` notes in `CHANGELOG.md` under a new heading,
e.g. `## [1.1.0] — 2026-11-02`, and commit that on main. Then:

```bash
git checkout main
```

```bash
git pull
```

```bash
git tag -a v1.1.0 -m "v1.1.0: darker footer"
```

```bash
git push origin v1.1.0
```

**7. (Optional) GitHub Release:** repo → **Releases** → **Draft a new release** → choose tag `v1.1.0` →
paste the changelog notes → **Publish release**.

---

## Rolling back

### Undo one bad change (safest, keeps history)
Find the commit on GitHub (**Commits** page) and copy its ID (e.g. `a1b2c3d`), then:

```bash
git revert a1b2c3d
```

```bash
git push
```

This creates a new commit that exactly undoes the old one, and the site redeploys.
Use the same method to undo a **content sync** commit. Remember to also fix the value in the Sheet,
otherwise the next sync brings it back.

### Go back to a whole earlier version (e.g. v1.0.0)
Make main's files match the old version, as a new commit (nothing is lost):

```bash
git checkout main
```

```bash
git restore --source v1.0.0 -- .
```

```bash
git commit -m "Roll back to v1.0.0"
```

```bash
git push
```

Include the content too, or not? The command above also restores `data/`. To keep today's content,
run `git restore --source main -- data index.html` before committing.

### Just look at an old version locally

```bash
git switch --detach v1.0.0
```

Open it with Live Server. Return with `git switch main`.

### Content-only rollback
Open the file on GitHub (e.g. `data/projects.json`) → **History** → open the version you want →
copy the values back into your Sheet.

---

## Alternative: manage content in Excel instead

*(Explained only; this repo implements the Google Sheet option.)*

If you'd rather keep content in an Excel file inside the repo:

1. Create `data/content.xlsx` with the **same 8 sheets and the same column headers** as the templates
   (in Excel: open each CSV and copy it into its own worksheet named `profile`, `skills`, …).
2. Replace the download step in `scripts/sync.js` with an Excel reader. For example, using the free
   [`xlsx` (SheetJS)](https://docs.sheetjs.com/) package:
   ```js
   const XLSX = require("xlsx");
   const book = XLSX.readFile("data/content.xlsx");
   for (const tab of TABS) {
     const rows = XLSX.utils.sheet_to_json(book.Sheets[tab], { defval: "", raw: false });
     fs.writeFileSync(`data/${tab}.json`, JSON.stringify(rows, null, 2) + "\n");
   }
   ```
3. Change `sync-content.yml` to run **on push** when the Excel file changes, instead of daily:
   ```yaml
   on:
     push:
       paths: ["data/content.xlsx"]
   ```
   Also add a step `npm install xlsx` before `node scripts/sync.js`.
4. Leave `publishedId` empty in `config.js` so the site reads `data/*.json` directly.

Your workflow would then be: edit the Excel file → commit and push → the Action converts it to JSON → the site updates.
The trade-off: every content edit needs a git push, whereas with Google Sheets you just type and refresh.

---

## Sheet reference

Every tab except `profile`: **`order`** = position (lower first). **`show`** = `TRUE`/`FALSE`
(blank counts as TRUE).

### `profile` — key | value

| key | Example / meaning |
|---|---|
| `name` | M K Junayed Parves |
| `initials` | JP (the logo badge; optional, otherwise made from your name) |
| `role` | Business Intelligence Analyst (used in the browser tab title and share preview) |
| `headline` | `Hi, I'm Junayed. \| I turn data into decisions.` (`\|` = new line) |
| `bio` | 2–3 sentences under the headline |
| `photo_url` | assets/images/portrait.jpg |
| `resume_url` | assets/resume.pdf |
| `email`, `linkedin`, `github`, `location` | Contact details shown in the gold card |
| `stat1_value` / `stat1_label` … `stat3_…` | The three quick stats (e.g. `4+` / `Years in BI & analytics`) |
| `last_updated` | 2026-09-30 (shown in the footer) |
| `<section>_label` | Small gold label, e.g. `skills_label` = "Skills & tools" (the number is added automatically) |
| `<section>_title` | Big heading, e.g. `projects_title` = "Selected work" |
| `<section>_intro` | One-line intro next to or under the heading (optional) |
| `skills_chips_label` | Text before the skill chips ("Also working with:") |
| `resume_note` | Text in the gold résumé card |

`<section>` is one of: `about` (label only), `skills`, `experience`, `education`, `projects`,
`books`, `podcasts`, `following`, `contact`.

### Other tabs

| Tab | Columns | Notes |
|---|---|---|
| `skills` | order, name, detail, icon_url, type, show | `type` = `tile` (big card with icon) or `chip` (small pill). Icons are in `assets/images/icons/` |
| `experience` | order, title, company, city, start, end, bullets, show | `bullets` separated by `\|`. Empty `end` = "Present" |
| `education` | order, type, title, institution, years, detail, show | `type` = `degree` (card) or `certification` (chip) |
| `projects` | order, title, category, description, image_url, link_url, link_label, show | `category` = Power BI, Web App, Tableau or GitHub (must match exactly). Filter tabs appear only for categories in use |
| `books` | order, title, author, cover_url, category, summary, takeaway, status, rating, show | `summary` ≈ 40–70 words. `takeaway` = one sentence (shown in a gold "Key takeaway" box). Optional: `status` (e.g. Read / Reading / Want to Read), `rating` 1–5 (stars). Covers live in `assets/images/books/` |
| `podcasts` | order, name, host, cover_url, why, link_url, category, show | `category` (optional) shows as a small gold label, e.g. "Data Visualization & Storytelling" |
| `following` | order, name, role_org, avatar_url, platform, link_url, show | `platform` = any label, e.g. LinkedIn, YouTube, Blog |

**Adding a column** doesn't break anything; the site simply ignores it.
**Renaming a column** does: keep the header names exactly as above.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Page shows grey boxes forever / nothing loads locally | You opened `index.html` directly. Use Live Server (see above). |
| Console says "Google Sheet failed … Using backup" | Check the `publishedId` and gids in `config.js`, and that the Sheet is still published (File → Share → Publish to web). |
| My Sheet edit isn't showing | Wait ~5 minutes (Google's cache), then hard-refresh with `Ctrl+F5`. |
| A section vanished | Its tab has no rows with `show` = TRUE, or the tab name is misspelled. |
| A project doesn't appear under a filter | Its `category` must match a filter name exactly, e.g. `Power BI` not `PowerBI`. |
| Sync Action fails with "permission denied" / 403 | Settings → Actions → General → Workflow permissions → **Read and write**. |
| Sync Action says "got a web page instead of CSV" | The Sheet isn't published to the web, or a gid is wrong. |
| Site isn't updating after a push | Check the **Actions** tab for a red ✗ and open it to read the error. Settings → Pages → Source must be "GitHub Actions". |
| LinkedIn shows an old preview | Paste your URL into the [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/) to refresh it. |
