/* =====================================================================
   scripts/lib/templates.js — the HTML for every page and section
   ---------------------------------------------------------------------
   build.js calls these functions with the content from data/*.json and
   content/case-studies/*.json, and writes the finished pages.
   ===================================================================== */
"use strict";
const { esc, md, plain, bars, href, isExternal, extAttrs, img, fileExists, longDate, initials, badgeClass } = require("./helpers");
const icon = require("./icons");

const VERSION = "3.0.0"; // bump to make browsers fetch fresh CSS/JS after a release

/* ------------------------------------------------------------------ */
/* Layout                                                              */
/* ------------------------------------------------------------------ */

/* Navigation links: on the homepage they point to "#section", elsewhere to "/#section". */
const NAV = [
  ["about", "About"], ["projects", "Projects"], ["skills", "Skills"], ["experience", "Experience"],
  ["education", "Education"], ["knowledge", "Knowledge Hub"], ["contact", "Contact"],
];

function header(site, { home }) {
  const p = site.profile;
  const links = NAV.map(([id, label]) => {
    const target = id === "projects" && !home ? "/projects/" : (home ? "#" : "/#") + id;
    const current = !home && id === "projects" && site.page === "projects" ? ' aria-current="page"' : "";
    return `<li><a href="${target}"${current}>${label}</a></li>`;
  }).join("");
  return `
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header">
    <nav class="nav container" aria-label="Main">
      <a class="brand" href="/" aria-label="${esc(p.name)}, home">
        <span class="brand-mark" aria-hidden="true">${esc(p.initials || initials(p.name))}</span>
        <span class="brand-text"><span class="brand-name">${esc(p.name)}</span><span class="brand-role">${esc(p.role)}</span></span>
      </a>
      <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="nav-menu">
        <span class="visually-hidden">Menu</span><span class="nav-toggle-bar" aria-hidden="true"></span>
      </button>
      <ul class="nav-menu" id="nav-menu">
        ${links}
        <li><a class="btn btn-primary btn-small" href="${esc(href(p.resume_url))}" download>${icon.download(16)} Résumé</a></li>
      </ul>
    </nav>
  </header>`;
}

function footer(site) {
  const p = site.profile;
  const year = new Date().getFullYear();
  return `
  <footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div>
          <p class="footer-title">${esc(p.name)}</p>
          <p>${esc(bars(p.target_roles).join(" · "))}<br>${esc(p.location)}</p>
        </div>
        <div>
          <p class="footer-title">Explore</p>
          <ul class="footer-links">
            <li><a href="/projects/">All projects</a></li>
            <li><a href="/#experience">Experience</a></li>
            <li><a href="${esc(href(p.resume_url))}" download>Download résumé</a></li>
          </ul>
        </div>
        <div>
          <p class="footer-title">Connect</p>
          <ul class="footer-links">
            <li><a href="mailto:${esc(p.email)}">Email</a></li>
            <li><a href="${esc(p.linkedin)}"${extAttrs(p.linkedin)}>LinkedIn</a></li>
            <li><a href="${esc(p.github)}"${extAttrs(p.github)}>GitHub</a></li>
            <li><a href="${esc(p.tableau)}"${extAttrs(p.tableau)}>Tableau Public</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© ${year} ${esc(p.name)}</span>
        <span class="mono">Last updated: ${esc(longDate(p.last_updated))}</span>
        <a href="#top">Back to top ↑</a>
      </div>
    </div>
  </footer>`;
}

/* Full HTML document. meta = { title, description, path, image, jsonld[], type } */
function page(site, meta, body, { home = false, lightbox = false } = {}) {
  const url = site.url + meta.path.replace(/^\//, "");
  const image = site.url + (meta.image || "assets/images/og-image.jpg").replace(/^\//, "");
  const jsonld = (meta.jsonld || []).map(o =>
    `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, "\\u003c")}</script>`).join("\n  ");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(meta.title)}</title>
  <meta name="description" content="${esc(meta.description)}">
  <link rel="canonical" href="${esc(url)}">
  <meta name="author" content="${esc(site.profile.name)}">
  <meta property="og:type" content="${meta.type || "website"}">
  <meta property="og:site_name" content="${esc(site.profile.name)}">
  <meta property="og:title" content="${esc(meta.title)}">
  <meta property="og:description" content="${esc(meta.description)}">
  <meta property="og:url" content="${esc(url)}">
  <meta property="og:image" content="${esc(image)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(meta.title)}">
  <meta name="twitter:description" content="${esc(meta.description)}">
  <meta name="twitter:image" content="${esc(image)}">
  <meta name="theme-color" content="#0B1220">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap">
  <link rel="stylesheet" href="/css/variables.css?v=${VERSION}">
  <link rel="stylesheet" href="/css/base.css?v=${VERSION}">
  <link rel="stylesheet" href="/css/components.css?v=${VERSION}">
  <link rel="stylesheet" href="/css/pages.css?v=${VERSION}">
  <script defer src="/js/navigation.js?v=${VERSION}"></script>
  <script defer src="/js/project-filter.js?v=${VERSION}"></script>
  <script defer src="/js/main.js?v=${VERSION}"></script>
  ${jsonld}
</head>
<!-- This page is generated by scripts/build.js from data/*.json and content/.
     Edit the content there (or in the Google Sheet), not in this file. -->
<body id="top">
${header(site, { home })}
  <main id="main">
${body}
  </main>
${footer(site)}${lightbox ? `
  <dialog class="lightbox" id="lightbox" aria-label="Enlarged screenshot">
    <img src="" alt="">
    <div class="lightbox-bar"><span class="lightbox-caption"></span><button class="lightbox-close" type="button">Close</button></div>
  </dialog>` : ""}
</body>
</html>
`;
}

/* Section heading block */
function sectionHead(label, title, intro, { id, level = 2, extra = "" } = {}) {
  return `
      <div class="section-head">
        <div>
          ${label ? `<p class="eyebrow">${esc(label)}</p>` : ""}
          <h${level} class="section-title" id="${id}-title">${md(title)}</h${level}>
          ${intro ? `<p class="section-intro">${md(intro)}</p>` : ""}
        </div>
        ${extra}
      </div>`;
}

/* ------------------------------------------------------------------ */
/* Project card (homepage, projects page)                              */
/* ------------------------------------------------------------------ */
function projectUrl(p) {
  return p.case_study ? `/projects/${p.slug}/` : (p.demo_url || p.link_url || p.repo_url || "");
}

function projectCard(p, { compact = false, level = 3 } = {}) {
  const url = projectUrl(p);
  const tags = bars(p.tags);
  const tools = bars(p.tools).slice(0, compact ? 3 : 5);
  const media = fileExists(href(p.image_url))
    ? img(p.image_url, p.image_alt || p.title)
    : `<span class="project-placeholder">Dashboard preview coming soon</span>`;
  const titleLink = url ? `<a href="${esc(url)}"${p.case_study ? "" : extAttrs(url)}>${esc(p.title)}</a>` : esc(p.title);

  const links = [];
  if (p.case_study) links.push(`<a class="primary-link" href="/projects/${esc(p.slug)}/">Read case study ${icon.arrowRight(16)}</a>`);
  if (p.demo_url) links.push(`<a class="${p.case_study ? "secondary-link" : "primary-link"}" href="${esc(p.demo_url)}"${extAttrs(p.demo_url)}>Live demo ${icon.external(14)}<span class="visually-hidden"> (${esc(p.title)}, opens in a new tab)</span></a>`);
  if (p.link_url) links.push(`<a class="primary-link" href="${esc(p.link_url)}"${extAttrs(p.link_url)}>${esc(p.link_label || "View project")} ${icon.external(14)}<span class="visually-hidden"> (${esc(p.title)}, opens in a new tab)</span></a>`);
  if (p.repo_url) links.push(`<a class="secondary-link" href="${esc(p.repo_url)}"${extAttrs(p.repo_url)}>${icon.github(16)} GitHub<span class="visually-hidden"> repository for ${esc(p.title)} (opens in a new tab)</span></a>`);

  return `
        <li class="project-card${compact ? " is-compact" : ""}" data-tags="${esc(tags.join("|"))}">
          <div class="project-media">
            ${media}
            ${p.data_note ? `<span class="badge ${badgeClass(p.data_note)}">${esc(p.data_note)}</span>` : ""}
          </div>
          <div class="project-body">
            <p class="project-meta">${esc(p.category)}</p>
            <h${level} class="project-title">${titleLink}</h${level}>
            ${p.problem ? `<p class="project-problem"><b>Problem:</b> ${esc(p.problem)}</p>` : `<p class="project-problem">${esc(p.summary)}</p>`}
            ${p.outcome && !compact ? `<p class="project-outcome"><span class="label">Key outcome</span>${esc(p.outcome)}</p>` : ""}
            ${tools.length ? `<ul class="tags" aria-label="Tools">${tools.map(t => `<li class="tag">${esc(t)}</li>`).join("")}</ul>` : ""}
            ${links.length ? `<div class="project-links">${links.join("")}</div>` : ""}
          </div>
        </li>`;
}

/* Filter buttons for one or more grids. Only shows filters that have at least one project. */
function filterBar(id, gridIds, projects, filters, statusId) {
  const count = f => projects.filter(p => bars(p.tags).includes(f)).length;
  const used = filters.filter(f => count(f) > 0);
  if (used.length < 2) return "";
  return `
      <div class="filters" role="group" aria-label="Filter projects" data-filter-for="${gridIds.join(" ")}" data-status="${statusId}">
        <button type="button" class="filter-btn" data-filter="All" aria-pressed="true">All <span class="count">${projects.length}</span></button>
        ${used.map(f => `<button type="button" class="filter-btn" data-filter="${esc(f)}" aria-pressed="false">${esc(f)} <span class="count">${count(f)}</span></button>`).join("\n        ")}
      </div>
      <p class="visually-hidden" id="${statusId}" aria-live="polite"></p>`;
}

/* ------------------------------------------------------------------ */
/* Homepage sections                                                   */
/* ------------------------------------------------------------------ */
function hero(site) {
  const p = site.profile;
  const title = esc(p.headline).replace(/\*([^*]+)\*/g, '<span class="accent">$1</span>');
  return `
    <section class="hero" aria-labelledby="hero-title">
      <div class="container hero-grid">
        <div>
          <ul class="hero-roles" aria-label="Roles">${bars(p.target_roles).map(r => `<li>${esc(r)}</li>`).join("")}</ul>
          <h1 class="hero-title" id="hero-title">${title}</h1>
          <p class="hero-name"><strong>${esc(p.name)}</strong> <span>· ${esc(p.role)} · ${esc(p.location)}</span></p>
          <p class="hero-text">${esc(p.hero_description)}</p>
          <ul class="tags hero-caps" aria-label="Core technical capabilities">${bars(p.capabilities).map(c => `<li class="tag">${esc(c)}</li>`).join("")}</ul>
          <div class="btn-row">
            <a class="btn btn-primary" href="#projects">Explore projects ${icon.arrowRight(17)}</a>
            <a class="btn btn-outline" href="${esc(href(p.resume_url))}" download>${icon.download(17)} Download résumé</a>
          </div>
          <ul class="icon-links" aria-label="Profiles">
            <li><a class="icon-link" href="${esc(p.linkedin)}"${extAttrs(p.linkedin)}>${icon.linkedin()} LinkedIn</a></li>
            <li><a class="icon-link" href="${esc(p.github)}"${extAttrs(p.github)}>${icon.github()} GitHub</a></li>
            <li><a class="icon-link" href="${esc(p.tableau)}"${extAttrs(p.tableau)}>${icon.tableau()} Tableau Public</a></li>
          </ul>
        </div>
        <div class="hero-profile">
          <div class="hero-photo">
            ${img(p.photo_url, p.photo_alt || "Portrait of " + p.name, { eager: true })}
            <div class="hero-badge">
              <span class="now">Currently</span>
              <p class="what">${esc(p.current_role)}, ${esc(p.current_org)}</p>
              <p class="where">${icon.pin(13)} ${esc(p.location)}</p>
            </div>
          </div>
        </div>
      </div>
    </section>`;
}

function snapshot(site) {
  const p = site.profile;
  const stats = [1, 2, 3, 4].filter(i => p["stat" + i + "_value"]).map(i => {
    const value = String(p["stat" + i + "_value"]).replace("{case_studies}", site.caseStudies.length);
    const v = esc(value).replace(/\+$/, '<span class="unit">+</span>');
    return `
          <li class="card stat-card">
            <p class="stat-value">${v}</p>
            <p class="stat-label">${esc(p["stat" + i + "_label"])}</p>
            <p class="stat-detail">${esc(p["stat" + i + "_detail"] || "")}</p>
          </li>`;
  }).join("");
  const roleIcons = [icon.chart(), icon.layers(), icon.briefcase()];
  const roles = [1, 2, 3].filter(i => p["role" + i + "_title"]).map((i, n) => `
          <li class="card role-card">
            <span class="role-icon">${roleIcons[n]}</span>
            <h3 class="role-title">${esc(p["role" + i + "_title"])}</h3>
            <p class="role-text">${esc(p["role" + i + "_text"])}</p>
          </li>`).join("");
  return `
    <section class="section section-alt" id="about" aria-labelledby="about-title">
      <div class="container">
        ${sectionHead(p.snapshot_label, p.snapshot_title, p.snapshot_intro, { id: "about" })}
        <ul class="stat-grid">${stats}
        </ul>
        <ul class="role-grid" aria-label="Roles I am suited for">${roles}
        </ul>
        <div class="snapshot-industries">
          <span class="label">Industry exposure</span>
          ${bars(p.industries).map(i => `<span class="chip">${esc(i)}</span>`).join("")}
        </div>
      </div>
    </section>`;
}

const HOME_FILTERS = ["Power BI", "SQL", "Python", "Tableau", "Business Analytics", "Predictive Analytics"];

function featured(site) {
  const p = site.profile;
  const items = site.projects.filter(x => x.featured);
  return `
    <section class="section" id="projects" aria-labelledby="projects-title">
      <div class="container">
        ${sectionHead(p.projects_label, p.projects_title, p.projects_intro, { id: "projects" })}
        ${filterBar("home", ["featured-grid"], items, HOME_FILTERS, "featured-status")}
        <ul class="project-grid" id="featured-grid">${items.map(x => projectCard(x)).join("")}
        </ul>
        <div class="section-cta"><a class="btn btn-outline" href="/projects/">View all ${site.projects.length} projects ${icon.arrowRight(17)}</a></div>
      </div>
    </section>`;
}

function skills(site) {
  const p = site.profile;
  const groupIcons = { "Data Analysis": icon.search(), "Business Intelligence": icon.dashboard(), "Data Management": icon.database(), "Business Analytics": icon.target() };
  const tools = site.skills.filter(s => s.group === "Tools");
  const groups = [...new Set(site.skills.map(s => s.group).filter(g => g !== "Tools"))];
  return `
    <section class="section section-alt" id="skills" aria-labelledby="skills-title">
      <div class="container">
        ${sectionHead(p.skills_label, p.skills_title, p.skills_intro, { id: "skills" })}
        <ul class="tool-strip" aria-label="Main tools">${tools.map(t => `<li class="tool">${img(t.icon_url, "")}${esc(t.name)}</li>`).join("")}</ul>
        <ul class="skill-grid">${groups.map(g => `
          <li class="card skill-card">
            <div class="skill-card-head"><span class="skill-card-icon">${groupIcons[g] || icon.chart()}</span><h3 class="skill-card-title">${esc(g)}</h3></div>
            <ul class="skill-list">${site.skills.filter(s => s.group === g).map(s => `
              <li><span class="skill-name">${esc(s.name)}</span>${s.detail ? `<span class="skill-detail">${esc(s.detail)}</span>` : ""}</li>`).join("")}
            </ul>
          </li>`).join("")}
        </ul>
      </div>
    </section>`;
}

function experience(site) {
  const p = site.profile;
  return `
    <section class="section" id="experience" aria-labelledby="experience-title">
      <div class="container">
        ${sectionHead(p.experience_label, p.experience_title, p.experience_intro, { id: "experience" })}
        <ol class="timeline">${site.experience.map(j => {
          const dates = `${esc(j.start)} – ${esc(j.end || "Present")}`;
          return `
          <li class="job">
            <div class="job-mark">${j.logo_url ? img(j.logo_url, j.company + " logo") : ""}</div>
            <article class="card job-card">
              <div class="job-top"><h3 class="job-title">${esc(j.title)}</h3><span class="job-dates">${dates}</span></div>
              <p class="job-org">${esc(j.company)}${j.city ? ` · ${esc(j.city)}` : ""}</p>
              ${j.impact ? `<p class="job-impact"><b>Impact:</b> ${esc(j.impact)}</p>` : ""}
              <ul class="job-points">${bars(j.bullets).map(b => `<li>${esc(b)}</li>`).join("")}</ul>
              ${j.tools ? `<ul class="tags" aria-label="Tools and skills">${bars(j.tools).map(t => `<li class="tag">${esc(t)}</li>`).join("")}</ul>` : ""}
            </article>
          </li>`; }).join("")}
        </ol>
      </div>
    </section>`;
}

function education(site) {
  const p = site.profile;
  const degrees = site.education.filter(e => e.type !== "certification");
  const certs = site.education.filter(e => e.type === "certification");
  const card = e => `
              <li class="card edu-card">
                <span class="edu-logo">${e.logo_url ? img(e.logo_url, e.institution + " logo") : ""}</span>
                <div>
                  <p class="edu-title">${esc(e.title)}</p>
                  <p class="edu-inst">${esc(e.institution)}</p>
                  ${e.years ? `<p class="edu-years">${esc(e.years)}</p>` : ""}
                </div>
              </li>`;
  const done = degrees.filter(e => !/progress/i.test(e.status));
  const ongoing = degrees.filter(e => /progress/i.test(e.status));
  return `
    <section class="section section-alt" id="education" aria-labelledby="education-title">
      <div class="container">
        ${sectionHead(p.education_label, p.education_title, p.education_intro, { id: "education" })}
        <div class="edu-grid">
          <div>
            <h3 class="edu-col-title"><span class="dot" aria-hidden="true"></span>Completed</h3>
            <ul class="edu-list">${done.map(card).join("")}</ul>
          </div>
          <div>
            <h3 class="edu-col-title"><span class="dot progress" aria-hidden="true"></span>In progress</h3>
            <ul class="edu-list">${ongoing.map(card).join("")}</ul>
          </div>
        </div>
        ${certs.length ? `
        <div class="card cert-panel">
          <h3 class="edu-col-title" style="margin:0">Certifications</h3>
          <ul class="cert-list">${certs.map(c => `
            <li class="cert-item">${icon.check()}<div>${esc(c.title)}${c.institution ? `<span>${esc(c.institution)}</span>` : ""}</div></li>`).join("")}
          </ul>
        </div>` : ""}
      </div>
    </section>`;
}

/* Knowledge hub: four tabs of compact cards, each with a "show more" shelf */
function shelf(id, items, visible, noun, renderItem) {
  const more = items.length - visible;
  return `
          <div class="shelf" id="${id}">
            <ul class="mini-grid">${items.map((it, i) => renderItem(it, i >= visible)).join("")}
            </ul>
          </div>${more > 0 ? `
          <div class="shelf-toggle-row">
            <button type="button" class="btn btn-outline btn-small shelf-toggle" aria-expanded="false" aria-controls="${id}" data-shelf-toggle>
              <span class="label">Show ${more} more ${more === 1 ? noun : noun + "s"}</span>${icon.chevronDown()}
            </button>
          </div>` : ""}`;
}
const extra = hidden => (hidden ? ' class="shelf-extra" hidden' : "");

function knowledge(site) {
  const p = site.profile;
  const vis = k => Math.max(1, parseInt(p[k], 10) || 5);
  const book = (b, hidden) => `
              <li${extra(hidden)}><article class="mini-card">
                <div class="mini-cover">${img(b.cover_url, "Cover of " + b.title + (b.author ? " by " + b.author : ""))}</div>
                ${b.category ? `<p class="mini-kicker">${esc(b.category)}</p>` : ""}
                <h4 class="mini-title">${esc(b.title)}</h4>
                <p class="mini-meta">${esc(b.author)}</p>
                ${b.takeaway ? `<details class="mini-more"><summary>Takeaway</summary><p class="takeaway">${esc(b.takeaway)}</p>${b.summary ? `<p>${esc(b.summary)}</p>` : ""}</details>` : ""}
              </article></li>`;
  const podcast = (x, hidden) => `
              <li${extra(hidden)}><article class="mini-card">
                <div class="mini-cover square">${img(x.cover_url, "")}</div>
                ${x.category ? `<p class="mini-kicker">${esc(x.category)}</p>` : ""}
                <h4 class="mini-title">${esc(x.name)}</h4>
                <p class="mini-meta">${esc(x.host)}</p>
                ${x.why ? `<details class="mini-more"><summary>Why I listen</summary><p>${esc(x.why)}</p></details>` : ""}
                ${x.link_url ? `<a class="mini-link" href="${esc(x.link_url)}"${extAttrs(x.link_url)}>Listen ${icon.external(12)}<span class="visually-hidden"> to ${esc(x.name)} (opens in a new tab)</span></a>` : ""}
              </article></li>`;
  const follow = (f, hidden) => {
    const logo = /^(platform|org)/i.test(f.group || "");
    const credit = bars(f.image_credit);
    return `
              <li${extra(hidden)}><article class="mini-card is-centered">
                <div class="mini-avatar${logo ? " is-logo" : ""}">${img(f.avatar_url, f.image_alt || (logo ? f.name + " logo" : f.name))}</div>
                <h4 class="mini-title">${esc(f.name)}</h4>
                <p class="mini-meta">${esc(f.role_org)}</p>
                ${f.why ? `<details class="mini-more"><summary>Why follow</summary><p>${esc(f.why)}</p></details>` : ""}
                ${f.link_url ? `<a class="mini-link" href="${esc(f.link_url)}"${extAttrs(f.link_url)}>${esc(f.link_label || "Visit")} ${icon.external(12)}<span class="visually-hidden"> (${esc(f.name)}, opens in a new tab)</span></a>` : ""}
                ${credit[0] ? `<small class="photo-credit">${credit[1] ? `<a href="${esc(credit[1])}"${extAttrs(credit[1])}>${esc(credit[0])}</a>` : esc(credit[0])}</small>` : ""}
              </article></li>`;
  };
  const people = site.following.filter(f => !/^(platform|org)/i.test(f.group || ""));
  const platforms = site.following.filter(f => /^(platform|org)/i.test(f.group || ""));
  const tabs = [
    ["books", "Books", site.books, () => shelf("shelf-books", site.books, vis("books_visible"), "book", book)],
    ["podcasts", "Podcasts", site.podcasts, () => shelf("shelf-podcasts", site.podcasts, vis("podcasts_visible"), "podcast", podcast)],
    ["people", "People", people, () => shelf("shelf-people", people, vis("following_visible"), "person", follow)],
    ["platforms", "Platforms", platforms, () => shelf("shelf-platforms", platforms, vis("following_visible"), "platform", follow)],
  ].filter(t => t[2].length);
  return `
    <section class="section" id="knowledge" aria-labelledby="knowledge-title">
      <div class="container">
        ${sectionHead(p.knowledge_label, p.knowledge_title, p.knowledge_intro, { id: "knowledge" })}
        <div class="tabs" role="tablist" aria-label="Knowledge hub">${tabs.map((t, i) => `
          <button class="tab" role="tab" id="tab-${t[0]}" aria-controls="panel-${t[0]}" aria-selected="${i === 0}"${i ? ' tabindex="-1"' : ""}>${t[1]} <span class="count">${t[2].length}</span></button>`).join("")}
        </div>${tabs.map((t, i) => `
        <div class="tab-panel" role="tabpanel" id="panel-${t[0]}" aria-labelledby="tab-${t[0]}"${i ? " hidden" : ""}>${t[3]()}
        </div>`).join("")}
      </div>
    </section>`;
}

function contact(site) {
  const p = site.profile;
  const form = site.formspreeId ? `
          <form class="contact-form" action="https://formspree.io/f/${esc(site.formspreeId)}" method="POST" data-contact-form>
            <div class="field"><label for="cf-name">Name</label><input id="cf-name" name="name" autocomplete="name" required></div>
            <div class="field"><label for="cf-email">Email</label><input id="cf-email" name="email" type="email" autocomplete="email" required></div>
            <div class="field"><label for="cf-message">Message</label><textarea id="cf-message" name="message" required></textarea></div>
            <input class="honeypot" type="text" name="_gotcha" tabindex="-1" autocomplete="off" aria-hidden="true">
            <button class="btn btn-primary" type="submit">Send message</button>
            <p class="form-status" role="status" aria-live="polite"></p>
          </form>` : "";
  const item = (iconSvg, label, value, url) => `
              <li><a href="${esc(url)}"${extAttrs(url)}><span class="icon">${iconSvg}</span><span><span class="label">${label}</span><span class="value">${esc(value)}</span></span></a></li>`;
  const pretty = u => String(u).replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
  return `
    <section class="section section-alt" id="contact" aria-labelledby="contact-title">
      <div class="container">
        <div class="contact-panel">
          <div>
            <p class="eyebrow">${esc(p.contact_label)}</p>
            <h2 class="contact-title" id="contact-title">${esc(p.contact_title)}</h2>
            <p class="contact-text">${esc(p.availability)} ${esc(p.contact_intro)}</p>
            <div class="btn-row contact-actions">
              <a class="btn btn-primary" href="mailto:${esc(p.email)}">${icon.mail(17)} Email me</a>
              <a class="btn btn-outline" href="${esc(href(p.resume_url))}" download>${icon.download(17)} Download résumé <span class="visually-hidden">(PDF)</span></a>
            </div>${form}
          </div>
          <ul class="contact-list">
            ${item(icon.mail(20), "Email", p.email, "mailto:" + p.email)}
            ${item(icon.linkedin(20), "LinkedIn", pretty(p.linkedin), p.linkedin)}
            ${item(icon.github(20), "GitHub", pretty(p.github), p.github)}
            ${item(icon.tableau(20), "Tableau Public", "public.tableau.com/…/junayed.parves", p.tableau)}
            ${item(icon.download(20), "Résumé", p.resume_note || "PDF", href(p.resume_url))}
          </ul>
        </div>
      </div>
    </section>`;
}

module.exports = {
  VERSION, page, sectionHead, projectCard, projectUrl, filterBar,
  hero, snapshot, featured, skills, experience, education, knowledge, contact, HOME_FILTERS,
};
