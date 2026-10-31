/* =====================================================================
   scripts/lib/icons.js — inline SVG icons (no icon library needed)
   All icons use currentColor, so they take the colour of their text.
   ===================================================================== */
"use strict";

const svg = (body, size = 18, extra = "") =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"${extra}>${body}</svg>`;

const filled = (body, size = 18) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">${body}</svg>`;

module.exports = {
  arrowRight: (s) => svg('<path d="M5 12h14M13 6l6 6-6 6"/>', s),
  external: (s = 15) => svg('<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>', s),
  download: (s) => svg('<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>', s),
  mail: (s) => svg('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>', s),
  pin: (s) => svg('<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>', s),
  check: (s = 16) => svg('<path d="m5 12.5 4.5 4.5L19 7.5"/>', s),
  chevronDown: (s = 16) => svg('<path d="m6 9 6 6 6-6"/>', s, ' class="chevron"'),
  play: (s) => svg('<rect x="3" y="4" width="18" height="14" rx="2"/><path d="m10 8.5 5 2.5-5 2.5z"/><path d="M8 21h8"/>', s),
  // roles
  chart: (s = 20) => svg('<path d="M4 20h16M7 16v-5M12 16V7M17 16v-8"/>', s),
  layers: (s = 20) => svg('<path d="m12 3 9 5-9 5-9-5 9-5z"/><path d="m3 13 9 5 9-5"/>', s),
  briefcase: (s = 20) => svg('<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18"/>', s),
  // skill groups
  search: (s = 20) => svg('<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>', s),
  dashboard: (s = 20) => svg('<rect x="3" y="3" width="8" height="9" rx="1.5"/><rect x="13" y="3" width="8" height="5" rx="1.5"/><rect x="13" y="10" width="8" height="11" rx="1.5"/><rect x="3" y="14" width="8" height="7" rx="1.5"/>', s),
  database: (s = 20) => svg('<ellipse cx="12" cy="5.5" rx="7.5" ry="2.5"/><path d="M4.5 5.5v13c0 1.4 3.4 2.5 7.5 2.5s7.5-1.1 7.5-2.5v-13M4.5 12c0 1.4 3.4 2.5 7.5 2.5s7.5-1.1 7.5-2.5"/>', s),
  target: (s = 20) => svg('<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="0.8" fill="currentColor"/>', s),
  // brands (simple, single-colour marks)
  linkedin: (s = 18) => filled('<path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.75h4v11H3zM9.5 9.75h3.8v1.5h.06c.53-1 1.83-2.06 3.77-2.06 4.03 0 4.77 2.65 4.77 6.1v5.46h-4v-4.84c0-1.15-.02-2.64-1.61-2.64-1.62 0-1.86 1.26-1.86 2.56v4.92h-4z"/>', s),
  github: (s = 18) => filled('<path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.6 9.6 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2z"/>', s),
  tableau: (s = 18) => filled('<path d="M11.2 2h1.6v3.2H16v1.6h-3.2V10h-1.6V6.8H8V5.2h3.2zM11.4 14h1.2v2.4H15v1.2h-2.4V20h-1.2v-2.4H9v-1.2h2.4zM4.4 8.6h1.2V11H8v1.2H5.6v2.4H4.4v-2.4H2V11h2.4zM18.4 8.6h1.2V11H22v1.2h-2.4v2.4h-1.2v-2.4H16V11h2.4zM6.2 3.8h.9v1.8h1.8v.9H7.1v1.8h-.9V6.5H4.4v-.9h1.8zM16.9 15.5h.9v1.8h1.8v.9h-1.8V20h-.9v-1.8h-1.8v-.9h1.8zM6.2 15.5h.9v1.8h1.8v.9H7.1V20h-.9v-1.8H4.4v-.9h1.8zM16.9 3.8h.9v1.8h1.8v.9h-1.8v1.8h-.9V6.5h-1.8v-.9h1.8z"/>', s),
};
