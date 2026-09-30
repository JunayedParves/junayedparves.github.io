#!/usr/bin/env node
/* =====================================================================
   scripts/sync.js — copy your Google Sheet into /data/*.json
   ---------------------------------------------------------------------
   The GitHub Action (.github/workflows/sync-content.yml) runs this every
   day. It:
     1. downloads each tab of the published Google Sheet as CSV
     2. converts it to JSON and saves it as data/<tab>.json
     3. updates the <title>/description/share tags in index.html from the
        "profile" tab (between the SEO:START and SEO:END comments)
   If anything fails, NOTHING is written, so a Google hiccup can never
   wipe out your backup.

   Run it yourself (needs Node.js 18 or newer):
     node scripts/sync.js                   ← download from Google Sheets
     node scripts/sync.js --from-templates  ← use templates/*.csv instead
                                              (handy before the Sheet exists)
   No extra packages are needed.
   ===================================================================== */

"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const CONFIG = require(path.join(ROOT, "js", "config.js"));
const TABS = ["profile", "skills", "experience", "education", "projects", "books", "podcasts", "following"];
const FROM_TEMPLATES = process.argv.includes("--from-templates");

/* ---------- CSV → rows ----------
   Handles quoted cells ("like, this"), doubled quotes ("") and line
   breaks inside a cell, which is how Google Sheets exports CSV. */
function parseCsv(text) {
  text = text.replace(/^﻿/, ""); // remove a byte-order mark if present
  const rows = [];
  let row = [], cell = "", inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') inQuotes = false;
      else cell += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === ",") { row.push(cell); cell = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cell); rows.push(row); row = []; cell = "";
    } else cell += ch;
  }
  if (cell !== "" || row.length) { row.push(cell); rows.push(row); }

  // First row = headers. Turn every other row into { header: value }.
  const headers = (rows.shift() || []).map(h => h.trim().toLowerCase());
  return rows
    .map(cells => {
      const obj = {};
      headers.forEach((h, i) => { if (h) obj[h] = (cells[i] || "").trim(); });
      return obj;
    })
    .filter(obj => Object.values(obj).some(v => v !== "")); // drop blank rows
}

/* ---------- Get one tab's CSV text ---------- */
async function getCsv(tab) {
  if (FROM_TEMPLATES) {
    return fs.readFileSync(path.join(ROOT, "templates", tab + ".csv"), "utf8");
  }
  const sheet = CONFIG.sheet || {};
  const gid = sheet.gids && sheet.gids[tab];
  if (!sheet.publishedId) throw new Error("sheet.publishedId is empty in js/config.js");
  if (gid === undefined || gid === "") throw new Error(`No gid for tab "${tab}" in js/config.js`);

  const url = `https://docs.google.com/spreadsheets/d/e/${encodeURIComponent(sheet.publishedId)}` +
    `/pub?gid=${encodeURIComponent(gid)}&single=true&output=csv`;
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error(`"${tab}": Google answered HTTP ${res.status}`);
  const text = await res.text();
  if (/^\s*</.test(text)) throw new Error(`"${tab}": got a web page instead of CSV. Is the sheet published to the web?`);
  return text;
}

/* ---------- Rewrite the SEO block in index.html ---------- */
function escAttr(s) {
  return String(s || "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function updateSeo(profileRows) {
  const p = {};
  profileRows.forEach(r => { if (r.key) p[r.key.toLowerCase()] = r.value || ""; });
  if (!p.name) return false;

  const site = String(CONFIG.siteUrl || "").replace(/\/?$/, "/");
  const title = p.name + (p.role ? " · " + p.role : "");
  let description = p.bio || title;
  if (description.length > 160) description = description.slice(0, 157).replace(/\s+\S*$/, "") + "…";

  const block = [
    "<!-- SEO:START",
    "       This block is rewritten automatically by scripts/sync.js from the",
    '       "profile" tab of your Google Sheet (name, role, bio). You can edit it',
    "       by hand too, but the next sync will overwrite it. -->",
    `  <title>${escAttr(title)}</title>`,
    `  <meta name="description" content="${escAttr(description)}">`,
    `  <link rel="canonical" href="${escAttr(site)}">`,
    '  <meta property="og:type" content="website">',
    `  <meta property="og:url" content="${escAttr(site)}">`,
    `  <meta property="og:title" content="${escAttr(title)}">`,
    `  <meta property="og:description" content="${escAttr(description)}">`,
    `  <meta property="og:image" content="${escAttr(site)}assets/images/og-image.jpg">`,
    '  <meta name="twitter:card" content="summary_large_image">',
    "  <!-- SEO:END -->"
  ].join("\n");

  const file = path.join(ROOT, "index.html");
  const html = fs.readFileSync(file, "utf8");
  const updated = html.replace(/<!-- SEO:START[\s\S]*?<!-- SEO:END -->/, block);
  if (updated === html) return false;
  fs.writeFileSync(file, updated, "utf8");
  return true;
}

/* ---------- Main ---------- */
async function main() {
  // Sheet not set up yet → nothing to do (don't fail the daily Action)
  if (!FROM_TEMPLATES && !(CONFIG.sheet && CONFIG.sheet.publishedId)) {
    console.log("sheet.publishedId is empty in js/config.js, so there is nothing to sync yet. Skipping.");
    return;
  }

  console.log(FROM_TEMPLATES ? "Reading templates/*.csv …" : "Downloading tabs from Google Sheets …");

  // 1. Download everything first. If one tab fails, stop before writing anything.
  const results = {};
  for (const tab of TABS) {
    results[tab] = parseCsv(await getCsv(tab));
    console.log(`  ✓ ${tab.padEnd(11)} ${results[tab].length} rows`);
  }

  // 2. Save each tab as pretty JSON (one key per line → readable git diffs)
  fs.mkdirSync(path.join(ROOT, "data"), { recursive: true });
  for (const tab of TABS) {
    fs.writeFileSync(path.join(ROOT, "data", tab + ".json"), JSON.stringify(results[tab], null, 2) + "\n", "utf8");
  }
  console.log("Saved data/*.json");

  // 3. Keep the link-preview tags in index.html in sync with the profile tab
  if (updateSeo(results.profile)) console.log("Updated SEO tags in index.html");
}

main().catch(err => {
  console.error("\n✗ Sync failed: " + err.message);
  console.error("  Nothing was changed.");
  process.exit(1);
});
