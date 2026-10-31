#!/usr/bin/env node
/* =====================================================================
   scripts/build.js — turns the content into the finished website
   ---------------------------------------------------------------------
   Reads:   data/*.json              (copied from the Google Sheet by sync.js)
            content/case-studies/*.json   (long-form case-study text)
            js/config.js             (site address, Formspree ID)
   Writes:  index.html               (homepage)
            projects/index.html      (all projects)
            projects/<slug>/index.html  (one page per case study)
            sitemap.xml

   Run it after changing content:   node scripts/build.js
   (scripts/sync.js runs it automatically, and so does the deploy workflow.)
   No packages to install: plain Node.js 18+.
   ===================================================================== */
"use strict";
const fs = require("fs");
const path = require("path");
const { ROOT, esc, md, bars, href, extAttrs, img, fileExists, badgeClass } = require("./lib/helpers");
const T = require("./lib/templates");
const icon = require("./lib/icons");

const CONFIG = require(path.join(ROOT, "js", "config.js"));
const SITE_URL = String(CONFIG.siteUrl || "/").replace(/\/?$/, "/");

/* ---------- load content ---------- */
const readJson = name => {
  const file = path.join(ROOT, "data", name + ".json");
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : [];
};
const shown = rows => rows
  .filter(r => !/^(false|no|0|n)$/i.test(String(r.show || "").trim()))
  .map((r, i) => ({ r, i }))
  .sort((a, b) => (parseFloat(a.r.order) || 9999) - (parseFloat(b.r.order) || 9999) || a.i - b.i)
  .map(x => x.r);
const truthy = v => /^(true|yes|1|y)$/i.test(String(v || "").trim());

const profile = {};
readJson("profile").forEach(r => { if (r.key) profile[r.key.trim().toLowerCase()] = (r.value || "").trim(); });

const projects = shown(readJson("projects")).map(p => ({ ...p, featured: truthy(p.featured), case_study: truthy(p.case_study) }));

const caseDir = path.join(ROOT, "content", "case-studies");
const caseContent = {};
if (fs.existsSync(caseDir)) {
  fs.readdirSync(caseDir).filter(f => f.endsWith(".json")).forEach(f => {
    const c = JSON.parse(fs.readFileSync(path.join(caseDir, f), "utf8"));
    caseContent[c.slug] = c;
  });
}
const caseStudies = projects.filter(p => p.case_study && caseContent[p.slug]);
projects.forEach(p => { if (p.case_study && !caseContent[p.slug]) { console.warn(`! No case-study content for "${p.slug}" — showing it as a gallery card.`); p.case_study = false; } });

const site = {
  url: SITE_URL,
  profile,
  projects,
  caseStudies,
  skills: shown(readJson("skills")),
  experience: shown(readJson("experience")),
  education: shown(readJson("education")),
  books: shown(readJson("books")),
  podcasts: shown(readJson("podcasts")),
  following: shown(readJson("following")),
  formspreeId: CONFIG.formspreeId || "",
};

/* ---------- structured data (schema.org) ---------- */
const person = {
  "@type": "Person",
  "@id": SITE_URL + "#person",
  name: profile.name,
  jobTitle: profile.role,
  description: profile.seo_description,
  url: SITE_URL,
  image: SITE_URL + profile.photo_url,
  email: "mailto:" + profile.email,
  address: { "@type": "PostalAddress", addressLocality: "Dhaka", addressCountry: "BD" },
  worksFor: profile.current_org ? { "@type": "Organization", name: profile.current_org } : undefined,
  alumniOf: [...new Set(site.education.filter(e => e.type !== "certification" && !/progress/i.test(e.status)).map(e => e.institution))]
    .map(name => ({ "@type": "CollegeOrUniversity", name })),
  knowsAbout: ["Business Intelligence", "Data Analysis", "Business Analysis", "Power BI", "DAX", "SQL", "Tableau", "Python", "Data Visualization", "Financial Analytics"],
  sameAs: [profile.linkedin, profile.github, profile.tableau].filter(Boolean),
};
const website = { "@type": "WebSite", "@id": SITE_URL + "#website", name: profile.name + " — Portfolio", url: SITE_URL, author: { "@id": SITE_URL + "#person" } };
const graph = items => ({ "@context": "https://schema.org", "@graph": items });
const breadcrumb = trail => ({
  "@type": "BreadcrumbList",
  itemListElement: trail.map(([name, url], i) => ({ "@type": "ListItem", position: i + 1, name, item: SITE_URL + url.replace(/^\//, "") })),
});

/* ---------- write helper ---------- */
const written = [];
function write(rel, html) {
  const file = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html, "utf8");
  written.push(rel);
}

/* ================================================================== */
/* Homepage                                                            */
/* ================================================================== */
site.page = "home";
write("index.html", T.page(site, {
  title: profile.seo_title,
  description: profile.seo_description,
  path: "/",
  jsonld: [graph([person, website])],
}, [T.hero(site), T.snapshot(site), T.featured(site), T.skills(site), T.experience(site), T.education(site), T.knowledge(site), T.contact(site)].join("\n"), { home: true }));

/* ================================================================== */
/* Projects page                                                       */
/* ================================================================== */
site.page = "projects";
const PROJECT_FILTERS = ["Power BI", "SQL", "Python", "Tableau", "Excel", "Business Analytics", "Predictive Analytics", "Web App"];
const gallery = projects.filter(p => !p.case_study);
const tableau = gallery.filter(p => p.category === "Tableau");
const otherGallery = gallery.filter(p => p.category !== "Tableau");
const block = (id, title, intro, items, compact) => items.length ? `
      <div data-filter-block>
        <h2 class="subsection-title">${esc(title)}</h2>
        <p class="subsection-intro">${md(intro)}</p>
        <ul class="project-grid" id="${id}">${items.map(p => T.projectCard(p, { compact, level: 3 })).join("")}
        </ul>
      </div>` : "";

write("projects/index.html", T.page(site, {
  title: `Projects & Case Studies | ${profile.name}, Data & BI Analyst`,
  description: `${caseStudies.length} documented case studies in Power BI, SQL, Python, Excel and Tableau: credit risk, supply chain, retail, pharmacy, e-commerce and churn analytics, plus Tableau Public dashboards.`,
  path: "/projects/",
  jsonld: [graph([
    { "@type": "CollectionPage", name: "Projects & case studies", url: SITE_URL + "projects/", author: { "@id": SITE_URL + "#person" },
      mainEntity: { "@type": "ItemList", itemListElement: caseStudies.map((p, i) => ({ "@type": "ListItem", position: i + 1, url: SITE_URL + "projects/" + p.slug + "/", name: p.title })) } },
    breadcrumb([["Home", "/"], ["Projects", "/projects/"]]),
    person,
  ])],
}, `
    <section class="page-header" aria-labelledby="page-title">
      <div class="container">
        <ol class="breadcrumb" aria-label="Breadcrumb"><li><a href="/">Home</a></li><li aria-current="page">Projects</li></ol>
        <p class="eyebrow">Portfolio</p>
        <h1 class="page-title" id="page-title">Projects & case studies</h1>
        <p class="page-lead">Business problems solved with Power BI, SQL, Python, Excel and Tableau. Every case study shows the question, the data, the method, the findings and the recommendation. Data is labelled <span class="badge badge-synthetic">Synthetic data</span> <span class="badge badge-practice">Practice data</span> or <span class="badge badge-public">Public data</span>; none of it is employer data.</p>
      </div>
    </section>
    <section class="section" style="padding-top:8px" aria-label="Project list">
      <div class="container">
        ${T.filterBar("all", ["cs-grid", "gallery-grid", "tableau-grid"], projects, PROJECT_FILTERS, "all-status")}
        <div data-filter-block>
          <h2 class="subsection-title" style="margin-top:8px">Case studies</h2>
          <p class="subsection-intro">End-to-end projects with a dedicated write-up.</p>
          <ul class="project-grid" id="cs-grid">${caseStudies.map(p => T.projectCard(p, { level: 3 })).join("")}
          </ul>
        </div>
        ${block("gallery-grid", "More projects", "Interactive dashboards and analyses with a live demo or repository.", otherGallery, true)}
        ${block("tableau-grid", "Tableau Public dashboards", "Interactive dashboards published on Tableau Public.", tableau, true)}
      </div>
    </section>`));

/* ================================================================== */
/* Case-study pages                                                    */
/* ================================================================== */
function caseSection(s, p, folder, c) {
  let h = `
          <section class="cs-section" id="${esc(s.id)}" aria-labelledby="${esc(s.id)}-h">
            <h2 id="${esc(s.id)}-h">${esc(s.title)}</h2>`;
  (s.paragraphs || []).forEach(t => { h += `\n            <p>${md(t)}</p>`; });
  if (s.list) h += `\n            <ul>${s.list.map(t => `<li>${md(t)}</li>`).join("")}</ul>`;
  if (s.findings) h += `\n            <ol class="cs-findings">${s.findings.map(t => `<li>${md(t)}</li>`).join("")}</ol>`;
  if (s.kpis) h += `
            <div class="table-wrap"><table class="kpi-table"><thead><tr><th scope="col">Metric</th><th scope="col">Definition</th></tr></thead><tbody>${s.kpis.map(([k, v]) => `<tr><td>${md(k)}</td><td>${md(v)}</td></tr>`).join("")}</tbody></table></div>`;
  if (s.table) h += `
            <div class="table-wrap"><table class="data-table"><thead><tr>${s.table.head.map(x => `<th scope="col">${esc(x)}</th>`).join("")}</tr></thead><tbody>${s.table.rows.map(r => `<tr>${r.map(x => `<td>${md(x)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
  if (s.gallery && c.gallery) {
    h += `
            <ul class="gallery">${c.gallery.map(g => {
              const src = `assets/images/projects/${folder}/${g.src}`;
              const alt = `${p.title}: ${g.caption}`;
              return `
              <li><figure>
                <button type="button" data-zoom="${esc(href(src))}" data-alt="${esc(alt)}" data-caption="${esc(g.caption)}" aria-label="Enlarge screenshot: ${esc(g.caption)}">${img(src, alt, { cls: "zoomable" })}</button>
                <figcaption>${esc(g.caption)}</figcaption>
              </figure></li>`; }).join("")}
            </ul>`;
  }
  if (s.after) h += `\n            <p style="margin-top:14px">${md(s.after)}</p>`;
  if (s.callout) h += `\n            <div class="cs-callout${s.callout_type === "warn" ? " warn" : ""}">${md(s.callout)}</div>`;
  return h + "\n          </section>";
}

caseStudies.forEach((p, index) => {
  const c = caseContent[p.slug];
  const folder = (p.image_url.match(/projects\/([^/]+)\//) || [])[1] || p.slug;
  const links = [];
  if (p.demo_url) links.push(`<a href="${esc(p.demo_url)}"${extAttrs(p.demo_url)}>Live demo ${icon.external()}<span>${esc(p.demo_url.replace(/^https?:\/\//, ""))}</span></a>`);
  if (p.repo_url) links.push(`<a href="${esc(p.repo_url)}"${extAttrs(p.repo_url)}>GitHub repository ${icon.external()}<span>${esc(p.repo_url.replace(/^https?:\/\//, ""))}</span></a>`);
  const sections = c.sections.slice();
  sections.push({ id: "links", title: "Repository & live demo", _links: true });
  const toc = sections.map(s => `<li><a href="#${esc(s.id)}">${esc(s.title.replace(/:.*$/, ""))}</a></li>`).join("");
  const body = sections.map(s => s._links
    ? `
          <section class="cs-section" id="links" aria-labelledby="links-h">
            <h2 id="links-h">Repository & live demo</h2>
            <p>${p.demo_url ? "Explore the working dashboard, or review the code and documentation." : "Review the full project, documentation and screenshots on GitHub."}</p>
            <div class="cs-links">${links.join("")}</div>
          </section>`
    : caseSection(s, p, folder, c)).join("\n");

  const prev = caseStudies[(index - 1 + caseStudies.length) % caseStudies.length];
  const next = caseStudies[(index + 1) % caseStudies.length];

  write(`projects/${p.slug}/index.html`, T.page(site, {
    title: `${p.title} | Case Study by ${profile.name}`,
    description: c.seo_description || p.summary,
    path: `/projects/${p.slug}/`,
    image: p.image_url,
    type: "article",
    jsonld: [graph([
      { "@type": "CreativeWork", name: p.title, headline: p.title, description: c.seo_description || p.summary, url: `${SITE_URL}projects/${p.slug}/`,
        image: SITE_URL + p.image_url, author: { "@id": SITE_URL + "#person" }, keywords: bars(p.tags).concat(bars(p.tools)).join(", "),
        about: p.industry, isBasedOn: p.repo_url || undefined },
      breadcrumb([["Home", "/"], ["Projects", "/projects/"], [p.title, `/projects/${p.slug}/`]]),
      person,
    ])],
  }, `
    <article>
      <header class="page-header cs-hero">
        <div class="container">
          <ol class="breadcrumb" aria-label="Breadcrumb"><li><a href="/">Home</a></li><li><a href="/projects/">Projects</a></li><li aria-current="page">${esc(p.title.split(":")[0])}</li></ol>
          <div class="cs-hero-meta"><span class="category">${esc(p.category)}</span>${p.data_note ? `<span class="badge ${badgeClass(p.data_note)}">${esc(p.data_note)}</span>` : ""}</div>
          <h1 class="page-title">${esc(p.title)}</h1>
          <p class="page-lead">${md(c.subtitle || p.summary)}</p>
          <div class="btn-row">
            ${p.demo_url ? `<a class="btn btn-primary" href="${esc(p.demo_url)}"${extAttrs(p.demo_url)}>${icon.play(17)} Open live demo<span class="visually-hidden"> (opens in a new tab)</span></a>` : ""}
            ${p.repo_url ? `<a class="btn btn-outline" href="${esc(p.repo_url)}"${extAttrs(p.repo_url)}>${icon.github(17)} View on GitHub<span class="visually-hidden"> (opens in a new tab)</span></a>` : ""}
          </div>
          <ul class="facts">${(c.facts || []).map(([k, v]) => `<li><span class="k">${esc(k)}</span><span class="v">${esc(v)}</span></li>`).join("")}</ul>
          ${fileExists(href(p.image_url)) ? `<div class="cs-cover">${img(p.image_url, p.image_alt || p.title, { eager: true })}</div>` : ""}
        </div>
      </header>
      <div class="section" style="padding-top:clamp(32px,5vw,56px)">
        <div class="container cs-layout">
          <nav class="toc" aria-label="On this page"><p class="toc-title">On this page</p><ol>${toc}</ol></nav>
          <div class="cs-content">${body}
            <nav class="cs-nav" aria-label="More case studies">
              <a href="/projects/${prev.slug}/"><span class="dir">← Previous</span><strong>${esc(prev.title.split(":")[0])}</strong></a>
              <a class="next" href="/projects/${next.slug}/"><span class="dir">Next →</span><strong>${esc(next.title.split(":")[0])}</strong></a>
            </nav>
          </div>
        </div>
      </div>
    </article>`, { lightbox: true }));
});

/* ================================================================== */
/* Sitemap                                                             */
/* ================================================================== */
const lastmod = /^\d{4}-\d{2}-\d{2}$/.test(profile.last_updated || "") ? profile.last_updated : new Date().toISOString().slice(0, 10);
const urls = ["", "projects/", ...caseStudies.map(p => `projects/${p.slug}/`)];
write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>
<!-- Generated by scripts/build.js -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u, i) => `  <url><loc>${SITE_URL}${u}</loc><lastmod>${lastmod}</lastmod><priority>${i === 0 ? "1.0" : i === 1 ? "0.9" : "0.8"}</priority></url>`).join("\n")}
</urlset>
`);

/* Remove pages of case studies that no longer exist */
const projDir = path.join(ROOT, "projects");
if (fs.existsSync(projDir)) {
  fs.readdirSync(projDir, { withFileTypes: true }).filter(d => d.isDirectory() && !caseStudies.some(p => p.slug === d.name))
    .forEach(d => { fs.rmSync(path.join(projDir, d.name), { recursive: true, force: true }); console.log("removed old page projects/" + d.name); });
}

console.log(`Built ${written.length} files: ${written.join(", ")}`);
