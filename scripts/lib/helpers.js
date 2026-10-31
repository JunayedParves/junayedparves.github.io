/* =====================================================================
   scripts/lib/helpers.js — small utilities shared by the page templates
   ===================================================================== */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "..");

/* Make text safe inside HTML. */
function esc(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

/* Tiny inline formatting for content text: **bold**, ***bold italic***, *italic*, `code`. */
function md(value) {
  return esc(value)
    .replace(/\*\*\*([^*]+)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

/* Strip the formatting marks (for meta descriptions and alt text). */
function plain(value) {
  return String(value || "").replace(/\*+/g, "").replace(/`/g, "");
}

/* "a | b | c" → ["a", "b", "c"] */
function bars(value) {
  return String(value || "").split("|").map(s => s.trim()).filter(Boolean);
}

/* Links: keep full URLs and mailto; turn repo paths into root-relative paths. */
function href(value) {
  const v = String(value || "").trim();
  if (!v) return "";
  if (/^(https?:|mailto:|tel:)/i.test(v)) return v;
  if (/^[a-z][a-z0-9+.-]*:/i.test(v)) return "";           // block other schemes
  return "/" + v.replace(/^\/+/, "");
}
const isExternal = url => /^https?:/i.test(url);
const extAttrs = url => (isExternal(url) ? ' target="_blank" rel="noopener noreferrer"' : "");

/* Read the pixel size of a local JPEG or PNG (for width/height attributes → no layout shift). */
const sizeCache = {};
function imageSize(webPath) {
  if (!webPath || isExternal(webPath)) return null;
  if (sizeCache[webPath] !== undefined) return sizeCache[webPath];
  const file = path.join(ROOT, webPath.replace(/^\/+/, ""));
  let size = null;
  try {
    const b = fs.readFileSync(file);
    if (b[0] === 0x89 && b[1] === 0x50) {                    // PNG
      size = { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
    } else if (b[0] === 0xff && b[1] === 0xd8) {             // JPEG: walk the segments to the SOF marker
      let i = 2;
      while (i < b.length) {
        if (b[i] !== 0xff) { i++; continue; }
        const marker = b[i + 1];
        const len = b.readUInt16BE(i + 2);
        if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
          size = { w: b.readUInt16BE(i + 7), h: b.readUInt16BE(i + 5) };
          break;
        }
        i += 2 + len;
      }
    }
  } catch (e) { size = null; }
  sizeCache[webPath] = size;
  return size;
}
const fileExists = webPath => !!webPath && !isExternal(webPath) && fs.existsSync(path.join(ROOT, webPath.replace(/^\/+/, "")));

/* <img> with lazy loading and intrinsic size. */
function img(src, alt, { eager = false, cls = "", sizes = "" } = {}) {
  const url = href(src);
  const s = imageSize(url);
  return `<img src="${esc(url)}" alt="${esc(plain(alt))}"` +
    (s ? ` width="${s.w}" height="${s.h}"` : "") +
    (cls ? ` class="${cls}"` : "") +
    (sizes ? ` sizes="${sizes}"` : "") +
    (eager ? ' fetchpriority="high"' : ' loading="lazy"') + ' decoding="async">';
}

/* "2026-10-31" → "31 October 2026" */
function longDate(value) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ""));
  if (!m) return value || "";
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return `${Number(m[3])} ${months[Number(m[2]) - 1]} ${m[1]}`;
}

function initials(name) {
  const w = String(name || "").trim().split(/\s+/);
  return w.length > 1 ? (w[0][0] + w[w.length - 1][0]).toUpperCase() : (w[0] || "?")[0].toUpperCase();
}

/* Data-type badge class from the data_note text */
function badgeClass(note) {
  const n = String(note || "").toLowerCase();
  if (n.includes("synthetic")) return "badge-synthetic";
  if (n.includes("public")) return "badge-public";
  return "badge-practice";
}

module.exports = { ROOT, esc, md, plain, bars, href, isExternal, extAttrs, imageSize, fileExists, img, longDate, initials, badgeClass };
