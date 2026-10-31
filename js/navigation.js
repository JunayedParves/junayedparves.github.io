/* =====================================================================
   navigation.js — mobile menu, header shadow on scroll, and highlighting
   the current section in the menu (homepage) or table of contents
   (case-study pages). No libraries.
   ===================================================================== */
(function () {
  "use strict";

  /* ---------- Mobile menu ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var menu = document.getElementById("nav-menu");
  if (toggle && menu) {
    var setOpen = function (open) {
      toggle.setAttribute("aria-expanded", String(open));
      menu.classList.toggle("open", open);
    };
    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });
    menu.addEventListener("click", function (event) {
      if (event.target.closest("a")) setOpen(false);       // close after choosing a link
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && menu.classList.contains("open")) { setOpen(false); toggle.focus(); }
    });
    document.addEventListener("click", function (event) {
      if (!event.target.closest(".nav")) setOpen(false);   // click outside closes it
    });
  }

  /* ---------- Header border once the page is scrolled ---------- */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () { header.classList.toggle("is-scrolled", window.scrollY > 8); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Highlight the section currently on screen ---------- */
  // Works for the homepage menu (links like "#projects") and the case-study
  // table of contents (links like "#findings").
  if (!("IntersectionObserver" in window)) return;
  var links = [].slice.call(document.querySelectorAll('.nav-menu a[href^="#"], .nav-menu a[href^="/#"], .toc a[href^="#"]'));
  var byId = {};
  links.forEach(function (link) {
    var id = link.getAttribute("href").split("#")[1];
    var target = id && document.getElementById(id);
    if (target) (byId[id] = byId[id] || []).push(link);
  });
  var ids = Object.keys(byId);
  if (!ids.length) return;

  var visible = {};
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) { visible[entry.target.id] = entry.isIntersecting; });
    var current = ids.filter(function (id) { return visible[id]; })[0];
    links.forEach(function (link) { link.removeAttribute("aria-current"); });
    if (current) byId[current].forEach(function (link) { link.setAttribute("aria-current", "true"); });
  }, { rootMargin: "-35% 0px -55% 0px" });
  ids.forEach(function (id) { observer.observe(document.getElementById(id)); });
})();
