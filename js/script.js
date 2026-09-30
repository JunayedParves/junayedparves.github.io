/* =====================================================================
   script.js — loads your content and draws every section of the page
   ---------------------------------------------------------------------
   What happens when someone opens the site:
     1. For each tab (profile, skills, …) we try to download the CSV that
        Google Sheets publishes. If that fails (no internet to Google,
        sheet not published, IDs not set yet…) we load /data/<tab>.json.
     2. Rows where "show" is FALSE are dropped, the rest sorted by "order".
     3. Each section is drawn. A section with no rows is hidden, together
        with its link in the menu. Section numbers ("01 —", "02 —") and the
        alternating blue/navy backgrounds adjust automatically.

   You normally never need to edit this file. Your content lives in the
   Google Sheet; your settings live in js/config.js.
   ===================================================================== */

(function () {
  "use strict";

  var CONFIG = window.SITE_CONFIG || {};

  /* The sheet tabs we load (must match the tab names in the Sheet). */
  var TABS = ["profile", "skills", "experience", "education", "projects", "books", "podcasts", "following"];

  /* The page sections, top to bottom (used for numbering "01 —" etc.). */
  var SECTIONS = ["about", "skills", "experience", "education", "projects", "books", "podcasts", "following", "contact"];

  /* Text used when a key is missing or empty in the "profile" tab.
     To change any of these, add the key to your profile tab instead
     (e.g. key "skills_title", value "What I work with"). */
  var DEFAULTS = {
    about_label: "About me",
    skills_label: "Skills & tools",
    skills_title: "My analytics toolkit",
    skills_chips_label: "Also working with:",
    experience_label: "Experience",
    experience_title: "Where I've worked",
    education_label: "Education",
    education_title: "Education & certifications",
    projects_label: "Project showcase",
    projects_title: "Selected work",
    books_label: "Bookshelf",
    books_title: "Books I've read & reviewed",
    podcasts_label: "In my ears",
    podcasts_title: "Podcasts I listen to",
    following_label: "Staying current",
    following_title: "People & organizations I follow",
    contact_label: "Résumé & contact",
    contact_title: "Let's work together",
    resume_note: "One page, PDF."
  };

  var GOOGLE_TIMEOUT_MS = 8000; // give up on Google after 8 seconds and use the backup

  /* ===================================================================
     SMALL HELPERS
     =================================================================== */

  /* Make text safe to put inside HTML (stops "<" in your sheet breaking the page). */
  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  /* Turn a link from the sheet into a safe URL.
     - "https://…", "mailto:…" are kept as they are
     - "linkedin.com/in/me" becomes "https://linkedin.com/in/me"
     - "assets/images/me.jpg" or "/assets/images/me.jpg" stay as repo paths
     - anything dangerous (e.g. "javascript:") is removed */
  function safeUrl(value) {
    var url = String(value || "").trim();
    if (!url) return "";
    if (/^(https?:|mailto:|tel:)/i.test(url)) return url;
    if (/^[a-z][a-z0-9+.-]*:/i.test(url)) return ""; // other schemes: not allowed
    if (url.indexOf("//") === 0) return "https:" + url;
    if (/^[\w-]+(\.[\w-]+)+\//.test(url) || /^www\./i.test(url)) return "https://" + url; // bare domain
    return url.replace(/^\/+/, ""); // repo path (leading "/" removed so it also works in sub-folders)
  }

  /* Show a URL without "https://www." for display. */
  function prettyUrl(value) {
    return String(value || "").replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/+$/, "");
  }

  /* "M K Junayed Parves" → "MP" (used when there is no image). */
  function initialsOf(name) {
    var words = String(name || "").trim().split(/\s+/).filter(Boolean);
    if (!words.length) return "";
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  }

  /* Split "one | two | three" into ["one", "two", "three"]. */
  function splitBars(value) {
    return String(value || "").split("|").map(function (s) { return s.trim(); }).filter(Boolean);
  }

  function isExternal(url) { return /^https?:/i.test(url); }

  /* Extra attributes for links that open another website in a new tab. */
  function linkAttrs(url) {
    return isExternal(url) ? ' target="_blank" rel="noopener noreferrer"' : "";
  }

  /* Build an <img>, or a placeholder box if there's no image.
     options: alt, placeholder (text), initials (true = show big initials), eager (true = load immediately) */
  function imageHtml(src, options) {
    options = options || {};
    var url = safeUrl(src);
    var fallback = esc(options.placeholder || "");
    var fallbackClass = options.initials ? "img-ph initials" : "img-ph";
    if (!url) {
      return '<div class="' + fallbackClass + '" aria-hidden="true">' + fallback + "</div>";
    }
    return '<img src="' + esc(url) + '" alt="' + esc(options.alt || "") + '"' +
      (options.eager ? ' fetchpriority="high"' : ' loading="lazy"') +
      ' decoding="async" data-fallback="' + fallback + '" data-fallback-class="' + fallbackClass + '">';
  }

  /* If any image fails to load (wrong link, deleted file…), swap in the placeholder. */
  document.addEventListener("error", function (event) {
    var img = event.target;
    if (!img || img.tagName !== "IMG" || !img.hasAttribute("data-fallback")) return;
    var box = document.createElement("div");
    box.className = img.getAttribute("data-fallback-class") || "img-ph";
    box.setAttribute("aria-hidden", "true");
    box.textContent = img.getAttribute("data-fallback");
    img.replaceWith(box);
  }, true);

  /* Format "2026-09-30" as "30 Sep 2026". Other text is shown as-is. */
  function formatDate(value) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || "").trim());
    if (!m) return value;
    var d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  }

  /* ===================================================================
     LOADING DATA
     =================================================================== */

  /* The published CSV link for one tab, or "" if the Sheet isn't set up yet. */
  function sheetCsvUrl(tab) {
    var sheet = CONFIG.sheet || {};
    var gid = sheet.gids && sheet.gids[tab];
    if (!sheet.publishedId || gid === undefined || gid === "") return "";
    return "https://docs.google.com/spreadsheets/d/e/" + encodeURIComponent(sheet.publishedId) +
      "/pub?gid=" + encodeURIComponent(gid) + "&single=true&output=csv";
  }

  function fetchWithTimeout(url, ms) {
    var controller = "AbortController" in window ? new AbortController() : null;
    var timer = controller ? setTimeout(function () { controller.abort(); }, ms) : null;
    return fetch(url, { cache: "no-store", signal: controller ? controller.signal : undefined })
      .finally(function () { if (timer) clearTimeout(timer); });
  }

  /* Download one tab from Google Sheets and turn the CSV into a list of rows. */
  function loadFromSheet(tab) {
    var url = sheetCsvUrl(tab);
    if (!url) return Promise.reject(new Error("Sheet not configured"));
    if (typeof window.Papa === "undefined") return Promise.reject(new Error("PapaParse did not load"));

    return fetchWithTimeout(url, GOOGLE_TIMEOUT_MS)
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.text();
      })
      .then(function (text) {
        // If the sheet isn't published, Google sends a web page instead of CSV.
        if (/^\s*</.test(text)) throw new Error("Got a web page instead of CSV — is the sheet published?");
        var parsed = window.Papa.parse(text, {
          header: true,
          skipEmptyLines: "greedy",
          transformHeader: function (h) { return h.trim().toLowerCase(); }
        });
        return parsed.data;
      });
  }

  /* Load the backup copy from /data/<tab>.json (kept up to date by the GitHub Action). */
  function loadFromJson(tab) {
    return fetch("data/" + tab + ".json", { cache: "no-cache" }).then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    });
  }

  /* Try Google first, then the backup. Always resolves (with [] if both fail). */
  function loadTab(tab) {
    var source = sheetCsvUrl(tab) ? "Google Sheet" : "backup JSON";
    var attempt = sheetCsvUrl(tab)
      ? loadFromSheet(tab).catch(function (err) {
          console.warn("[portfolio] Google Sheet failed for '" + tab + "' (" + err.message + "). Using /data/" + tab + ".json");
          source = "backup JSON";
          return loadFromJson(tab);
        })
      : loadFromJson(tab);

    return attempt
      .then(function (rows) {
        console.info("[portfolio] " + tab + ": loaded from " + source);
        return cleanRows(Array.isArray(rows) ? rows : []);
      })
      .catch(function (err) {
        console.error("[portfolio] Could not load '" + tab + "': " + err.message);
        return [];
      });
  }

  /* Tidy the rows: trim text, lower-case column names, remove empty rows. */
  function cleanRows(rows) {
    return rows.map(function (row) {
      var clean = {};
      Object.keys(row || {}).forEach(function (key) {
        clean[String(key).trim().toLowerCase()] = String(row[key] == null ? "" : row[key]).trim();
      });
      return clean;
    }).filter(function (row) {
      return Object.keys(row).some(function (k) { return row[k] !== ""; });
    });
  }

  /* Keep rows where "show" is not FALSE / NO / 0, then sort by "order". */
  function visibleSorted(rows) {
    return rows
      .filter(function (row) { return !/^(false|no|0|n)$/i.test(row.show || ""); })
      .map(function (row, i) { return { row: row, i: i }; })
      .sort(function (a, b) {
        var oa = parseFloat(a.row.order), ob = parseFloat(b.row.order);
        if (isNaN(oa)) oa = Infinity;
        if (isNaN(ob)) ob = Infinity;
        return oa - ob || a.i - b.i; // same order → keep sheet order
      })
      .map(function (x) { return x.row; });
  }

  /* profile tab: rows of key | value → one object { name: "...", bio: "..." } */
  function toProfile(rows) {
    var profile = {};
    rows.forEach(function (row) {
      if (row.key) profile[row.key.toLowerCase()] = row.value || "";
    });
    return profile;
  }

  /* ===================================================================
     DRAWING EACH SECTION
     Each render function returns true if it drew something, false if
     there was nothing to show (so the section gets hidden).
     =================================================================== */

  var profile = {};

  function text(key) { return profile[key] || DEFAULTS[key] || ""; }

  function body(sectionId) {
    return document.querySelector("#" + sectionId + " [data-body]");
  }

  /* ---------- Profile, About, nav, footer, page title ---------- */
  function renderProfile() {
    var name = profile.name || "";

    document.querySelectorAll('[data-profile="name"]').forEach(function (el) { el.textContent = name; });
    document.querySelectorAll('[data-profile="initials"]').forEach(function (el) {
      el.textContent = profile.initials || initialsOf(name);
    });

    // Browser tab title + description (search engines that run JavaScript see these)
    if (name) document.title = name + (profile.role ? " · " + profile.role : "");
    var desc = document.querySelector('meta[name="description"]');
    if (desc && profile.bio) desc.setAttribute("content", profile.bio);

    // Headline: use "|" in the sheet to start a new line
    var headline = document.querySelector('[data-profile-html="headline"]');
    headline.innerHTML = splitBars(profile.headline || name).map(esc).join("<br>");

    document.querySelector('[data-profile="bio"]').textContent = profile.bio || "";

    // Three quick stats
    var stats = "";
    for (var i = 1; i <= 3; i++) {
      var value = profile["stat" + i + "_value"], label = profile["stat" + i + "_label"];
      if (value) stats += '<div class="stat"><dt>' + esc(label) + "</dt><dd>" + esc(value) + "</dd></div>";
    }
    var statsEl = document.querySelector("[data-stats]");
    statsEl.innerHTML = stats;
    statsEl.hidden = !stats;

    // Portrait photo
    document.querySelector("[data-portrait]").innerHTML = imageHtml(profile.photo_url, {
      alt: name ? "Portrait of " + name : "Portrait",
      placeholder: profile.initials || initialsOf(name) || "Photo",
      initials: true,
      eager: true
    });

    // "Download résumé" button in the About section
    var resume = safeUrl(profile.resume_url);
    var resumeBtn = document.querySelector("[data-resume-link]");
    if (resume) {
      resumeBtn.href = resume;
      if (isExternal(resume)) { resumeBtn.target = "_blank"; resumeBtn.rel = "noopener noreferrer"; }
      else resumeBtn.setAttribute("download", "");
    }

    renderResumeCard(resume);

    // Footer
    var year = new Date().getFullYear();
    document.querySelector("[data-footer-copy]").textContent =
      "© " + year + " " + name + " · Built with HTML & CSS, hosted on GitHub Pages";
    document.querySelector("[data-footer-updated]").textContent =
      profile.last_updated ? "Last updated: " + formatDate(profile.last_updated) : "";

    // Section titles and intros (label numbers are added later in finishSections)
    SECTIONS.forEach(function (id) {
      var section = document.getElementById(id);
      var title = section.querySelector('[data-field="title"]');
      var intro = section.querySelector('[data-field="intro"]');
      if (title) title.textContent = text(id + "_title");
      if (intro) intro.textContent = text(id + "_intro");
    });
  }

  /* ---------- Gold résumé card in the Contact section ---------- */
  function renderResumeCard(resume) {
    var email = profile.email || "";
    var linkedin = safeUrl(profile.linkedin);
    var github = safeUrl(profile.github);

    var contacts = "";
    if (email) contacts += '<li>Email: <a href="mailto:' + esc(email) + '">' + esc(email) + "</a></li>";
    if (linkedin) contacts += '<li>LinkedIn: <a href="' + esc(linkedin) + '"' + linkAttrs(linkedin) + ">" + esc(prettyUrl(linkedin)) + "</a></li>";
    if (github) contacts += '<li>GitHub: <a href="' + esc(github) + '"' + linkAttrs(github) + ">" + esc(prettyUrl(github)) + "</a></li>";

    var button = resume
      ? '<a class="btn btn-ink" href="' + esc(resume) + '"' + (isExternal(resume) ? linkAttrs(resume) : " download") + ">" +
          '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v12M6 11l6 6 6-6M4 20h16"/></svg>' +
          "Download PDF</a>"
      : "";

    document.querySelector("[data-resume-card]").innerHTML =
      '<div class="resume-head">' +
        '<svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/></svg>' +
        '<h3 class="resume-title">Download my résumé</h3>' +
        '<p class="resume-note">' + esc(text("resume_note")) + "</p>" +
      "</div>" +
      button +
      (contacts ? '<ul class="contact-list">' + contacts + "</ul>" : "");
  }

  /* ---------- Skills: tiles + chip row ---------- */
  function renderSkills(rows) {
    var tiles = rows.filter(function (r) { return (r.type || "tile").toLowerCase() !== "chip"; });
    var chips = rows.filter(function (r) { return (r.type || "").toLowerCase() === "chip"; });
    if (!tiles.length && !chips.length) return false;

    var html = "";
    if (tiles.length) {
      html += '<ul class="skills-grid" role="list">' + tiles.map(function (s) {
        return '<li class="skill-tile">' +
          '<div class="skill-icon">' + (s.icon_url
            ? imageHtml(s.icon_url, { alt: "", placeholder: initialsOf(s.name) })
            : '<span aria-hidden="true">' + esc(initialsOf(s.name)) + "</span>") + "</div>" +
          "<div>" +
            '<span class="skill-name">' + esc(s.name) + "</span>" +
            (s.detail ? '<span class="skill-detail">' + esc(s.detail) + "</span>" : "") +
          "</div>" +
        "</li>";
      }).join("") + "</ul>";
    }
    if (chips.length) {
      html += '<div class="chip-row">' +
        '<span class="chip-row-label">' + esc(text("skills_chips_label")) + "</span>" +
        "<ul>" + chips.map(function (c) {
          return '<li class="chip"' + (c.detail ? ' title="' + esc(c.detail) + '"' : "") + ">" + esc(c.name) + "</li>";
        }).join("") + "</ul></div>";
    }
    body("skills").innerHTML = html;
    return true;
  }

  /* ---------- Experience: vertical timeline ---------- */
  function renderExperience(rows) {
    if (!rows.length) return false;
    body("experience").innerHTML = '<ol class="timeline">' + rows.map(function (job) {
      var dates = [job.start, job.end || (job.start ? "Present" : "")].filter(Boolean).join(" — ");
      var org = [job.company, job.city].filter(Boolean).join(" · ");
      var bullets = splitBars(job.bullets);
      return '<li class="job">' +
        '<div class="job-top">' +
          '<h3 class="job-title">' + esc(job.title) + "</h3>" +
          (dates ? '<span class="job-dates">' + esc(dates) + "</span>" : "") +
        "</div>" +
        (org ? '<p class="job-org">' + esc(org) + "</p>" : "") +
        (bullets.length ? "<ul>" + bullets.map(function (b) { return "<li>" + esc(b) + "</li>"; }).join("") + "</ul>" : "") +
      "</li>";
    }).join("") + "</ol>";
    return true;
  }

  /* ---------- Education: degree cards + certification chips ---------- */
  function renderEducation(rows) {
    var isCert = function (r) { return /^cert/i.test(r.type || ""); };
    var degrees = rows.filter(function (r) { return !isCert(r); });
    var certs = rows.filter(isCert);
    if (!degrees.length && !certs.length) return false;

    var html = "";
    if (degrees.length) {
      html += '<ul class="degree-grid" role="list">' + degrees.map(function (d) {
        return '<li class="degree-card">' +
          (d.years ? '<span class="degree-years">' + esc(d.years) + "</span>" : "") +
          '<h3 class="degree-title">' + esc(d.title) + "</h3>" +
          (d.institution ? '<span class="degree-inst">' + esc(d.institution) + "</span>" : "") +
          (d.detail ? '<span class="degree-detail">' + esc(d.detail) + "</span>" : "") +
        "</li>";
      }).join("") + "</ul>";
    }
    if (certs.length) {
      html += '<div class="cert-row"><h3>Certifications</h3><ul>' + certs.map(function (c) {
        var tip = [c.institution, c.years, c.detail].filter(Boolean).join(" · ");
        return '<li class="chip chip-cream"' + (tip ? ' title="' + esc(tip) + '"' : "") + ">" + esc(c.title) +
          (c.institution ? '<span class="visually-hidden"> — ' + esc(c.institution) + "</span>" : "") + "</li>";
      }).join("") + "</ul></div>";
    }
    body("education").innerHTML = html;
    return true;
  }

  /* ---------- Projects: filter tabs + card grid ---------- */
  function renderProjects(rows) {
    if (!rows.length) return false;

    // Which categories actually have projects? (in the order set in config.js)
    var used = [];
    rows.forEach(function (p) { if (p.category && used.indexOf(p.category) === -1) used.push(p.category); });
    var order = (CONFIG.projectCategories || []).filter(function (c) { return used.indexOf(c) !== -1; });
    used.forEach(function (c) { if (order.indexOf(c) === -1) order.push(c); }); // extra categories go last

    body("projects").innerHTML = '<ul class="project-grid" role="list">' + rows.map(function (p) {
      var link = safeUrl(p.link_url);
      return '<li class="project-card" data-category="' + esc(p.category) + '">' +
        '<div class="project-thumb">' + imageHtml(p.image_url, {
          alt: "Screenshot of " + (p.title || "project"),
          placeholder: "[" + (p.category || "Project") + " preview]"
        }) + "</div>" +
        '<div class="project-body">' +
          (p.category ? '<span class="project-tag">' + esc(p.category) + "</span>" : "") +
          '<h3 class="project-title">' + esc(p.title) + "</h3>" +
          (p.description ? '<p class="project-desc">' + esc(p.description) + "</p>" : "") +
          (link ? '<a class="text-link" href="' + esc(link) + '"' + linkAttrs(link) + ">" +
            esc(p.link_label || "View project") + ' <span aria-hidden="true">→</span>' +
            '<span class="visually-hidden"> (' + esc(p.title) + ")</span></a>" : "") +
        "</div>" +
      "</li>";
    }).join("") + "</ul>";

    // Filter buttons (only if there are 2+ categories to choose between)
    var filters = document.querySelector("[data-filters]");
    if (order.length < 2) { filters.innerHTML = ""; return true; }

    filters.innerHTML = ["All"].concat(order).map(function (cat, i) {
      return '<button type="button" class="filter-btn" data-filter="' + esc(cat) + '" aria-pressed="' + (i === 0) + '">' + esc(cat) + "</button>";
    }).join("");

    filters.addEventListener("click", function (event) {
      var btn = event.target.closest(".filter-btn");
      if (!btn) return;
      var chosen = btn.getAttribute("data-filter");
      filters.querySelectorAll(".filter-btn").forEach(function (b) {
        b.setAttribute("aria-pressed", String(b === btn));
      });
      var shown = 0;
      document.querySelectorAll("#projects .project-card").forEach(function (card) {
        var match = chosen === "All" || card.getAttribute("data-category") === chosen;
        card.hidden = !match;
        if (match) shown++;
      });
      document.querySelector("[data-filter-status]").textContent =
        "Showing " + shown + " " + (chosen === "All" ? "" : chosen + " ") + "project" + (shown === 1 ? "" : "s");
    });
    return true;
  }

  /* ---------- Books ---------- */
  function renderBooks(rows) {
    if (!rows.length) return false;
    body("books").innerHTML = '<ul class="book-grid" role="list">' + rows.map(function (b) {
      var rating = Math.max(0, Math.min(5, Math.round(parseFloat(b.rating) || 0)));
      var stars = rating
        ? '<span class="stars" role="img" aria-label="Rated ' + rating + ' out of 5">' +
            "★★★★★".slice(0, rating) + "☆☆☆☆☆".slice(0, 5 - rating) + "</span>"
        : "";
      var summary = b.summary || b.review; // "review" = older column name, still supported
      var alt = "Cover of " + b.title + (b.author ? " by " + b.author : "");
      return '<li class="book">' +
        '<div class="book-cover">' + imageHtml(b.cover_url, { alt: alt, placeholder: b.title }) + "</div>" +
        '<div class="book-body">' +
          (b.category || b.status
            ? '<div class="book-meta">' +
                (b.category ? '<span class="book-category">' + esc(b.category) + "</span>" : "") +
                (b.status ? '<span class="book-status">' + esc(b.status) + "</span>" : "") +
              "</div>"
            : "") +
          '<h3 class="book-title">' + esc(b.title) + "</h3>" +
          (b.author ? '<span class="book-author">by ' + esc(b.author) + "</span>" : "") +
          stars +
          (summary ? '<p class="book-summary">' + esc(summary) + "</p>" : "") +
          (b.takeaway ? '<p class="book-takeaway"><span class="book-takeaway-label">Key takeaway</span>' + esc(b.takeaway) + "</p>" : "") +
        "</div>" +
      "</li>";
    }).join("") + "</ul>";
    return true;
  }

  /* ---------- Podcasts ---------- */
  function renderPodcasts(rows) {
    if (!rows.length) return false;
    body("podcasts").innerHTML = '<ul class="podcast-grid" role="list">' + rows.map(function (p) {
      var link = safeUrl(p.link_url);
      return '<li class="podcast">' +
        '<div class="podcast-cover">' + imageHtml(p.cover_url, { alt: "", placeholder: initialsOf(p.name), initials: true }) + "</div>" +
        '<div class="podcast-info">' +
          (p.category ? '<span class="podcast-category">' + esc(p.category) + "</span>" : "") +
          '<h3 class="podcast-name">' + esc(p.name) + "</h3>" +
          (p.host ? '<span class="podcast-host">Hosted by ' + esc(p.host) + "</span>" : "") +
          (p.why ? '<p class="podcast-why">' + esc(p.why) + "</p>" : "") +
          (link ? '<a class="text-link" href="' + esc(link) + '"' + linkAttrs(link) + ">Listen " +
            '<span aria-hidden="true">→</span><span class="visually-hidden"> to ' + esc(p.name) + "</span></a>" : "") +
        "</div>" +
      "</li>";
    }).join("") + "</ul>";
    return true;
  }

  /* ---------- People & organizations I follow ---------- */
  function renderFollowing(rows) {
    if (!rows.length) return false;
    body("following").innerHTML = '<ul class="follow-grid" role="list">' + rows.map(function (f) {
      var link = safeUrl(f.link_url);
      var inner =
        '<div class="follow-avatar">' + imageHtml(f.avatar_url, { alt: "", placeholder: initialsOf(f.name), initials: true }) + "</div>" +
        '<div class="follow-text">' +
          '<span class="follow-name">' + esc(f.name) + "</span>" +
          (f.role_org ? '<span class="follow-role">' + esc(f.role_org) + "</span>" : "") +
        "</div>" +
        (f.platform ? '<span class="follow-platform">' + esc(f.platform) + "</span>" : "");
      return "<li>" + (link
        ? '<a class="follow-card" href="' + esc(link) + '"' + linkAttrs(link) + ">" + inner + "</a>"
        : '<div class="follow-card">' + inner + "</div>") + "</li>";
    }).join("") + "</ul>";
    return true;
  }

  /* ===================================================================
     AFTER DRAWING: hide empty sections, number & colour the rest
     =================================================================== */
  function finishSections(hasContent) {
    var number = 0;
    SECTIONS.forEach(function (id) {
      var section = document.getElementById(id);
      var visible = hasContent[id] !== false;
      section.hidden = !visible;

      var navItem = document.querySelector('[data-nav="' + id + '"]');
      if (navItem) navItem.hidden = !visible;
      if (!visible) return;

      number++;
      section.classList.toggle("alt", number % 2 === 0); // every 2nd visible section = navy
      var label = section.querySelector('[data-field="label"]');
      if (label) label.textContent = (number < 10 ? "0" : "") + number + " — " + text(id + "_label");
    });
  }

  /* ===================================================================
     MOBILE MENU (hamburger)
     =================================================================== */
  function setupMenu() {
    var toggle = document.querySelector(".nav-toggle");
    var menu = document.getElementById("nav-menu");

    function setOpen(open) {
      toggle.setAttribute("aria-expanded", String(open));
      menu.classList.toggle("open", open);
    }
    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });
    menu.addEventListener("click", function (event) {   // close after choosing a link
      if (event.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && menu.classList.contains("open")) { setOpen(false); toggle.focus(); }
    });
    document.addEventListener("click", function (event) {
      if (!event.target.closest(".nav")) setOpen(false);
    });
  }

  /* ===================================================================
     CONTACT FORM (Formspree)
     =================================================================== */
  function setupContactForm() {
    var form = document.querySelector("[data-contact-form]");
    var status = document.querySelector("[data-form-status]");
    var button = form.querySelector('button[type="submit"]');

    function say(message, kind) {
      status.textContent = message;
      status.className = "form-status " + (kind || "");
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      // 1. Check the fields
      var firstBad = null;
      form.querySelectorAll("input[required], textarea[required]").forEach(function (field) {
        var ok = field.checkValidity();
        field.setAttribute("aria-invalid", String(!ok));
        if (!ok && !firstBad) firstBad = field;
      });
      if (firstBad) {
        say("Please fill in your name, a valid email and a message.", "error");
        firstBad.focus();
        return;
      }

      // 2. Spam bots fill the hidden field: pretend it worked and do nothing
      if (form.elements._gotcha.value) { form.reset(); say("Thanks! Your message has been sent.", "ok"); return; }

      // 3. No Formspree ID yet → open the visitor's email app instead
      if (!CONFIG.formspreeId) {
        if (!profile.email) { say("The contact form isn't set up yet.", "error"); return; }
        var subject = "Portfolio message from " + form.elements.name.value;
        var bodyText = form.elements.message.value + "\n\n— " + form.elements.name.value + " (" + form.elements.email.value + ")";
        window.location.href = "mailto:" + profile.email + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(bodyText);
        say("Opening your email app…", "ok");
        return;
      }

      // 4. Send to Formspree
      button.disabled = true;
      say("Sending…");
      fetch("https://formspree.io/f/" + encodeURIComponent(CONFIG.formspreeId), {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      })
        .then(function (res) {
          if (res.ok) {
            form.reset();
            say("Thanks! Your message has been sent. I'll get back to you soon.", "ok");
          } else {
            return res.json().then(function (data) {
              var msg = data && data.errors ? data.errors.map(function (e) { return e.message; }).join(", ") : "";
              throw new Error(msg || "Server error");
            });
          }
        })
        .catch(function (err) {
          say("Sorry, the message couldn't be sent (" + err.message + "). Please email me directly" +
            (profile.email ? " at " + profile.email : "") + ".", "error");
        })
        .finally(function () { button.disabled = false; });
    });
  }

  /* ===================================================================
     START
     =================================================================== */
  function start() {
    setupMenu();
    setupContactForm();

    // Load all tabs at the same time, then draw everything
    Promise.all(TABS.map(loadTab)).then(function (results) {
      var data = {};
      TABS.forEach(function (tab, i) { data[tab] = results[i]; });

      profile = toProfile(data.profile);
      renderProfile();

      var hasContent = {
        skills:     renderSkills(visibleSorted(data.skills)),
        experience: renderExperience(visibleSorted(data.experience)),
        education:  renderEducation(visibleSorted(data.education)),
        projects:   renderProjects(visibleSorted(data.projects)),
        books:      renderBooks(visibleSorted(data.books)),
        podcasts:   renderPodcasts(visibleSorted(data.podcasts)),
        following:  renderFollowing(visibleSorted(data.following))
      };
      finishSections(hasContent);
      document.body.classList.remove("is-loading");

      // If the page was opened with a #section link, jump there now that it has content
      if (location.hash) {
        var target = document.getElementById(location.hash.slice(1));
        if (target && !target.hidden) target.scrollIntoView();
      }
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
