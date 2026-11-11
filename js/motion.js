/* =====================================================================
   motion.js — the scroll and pointer animations (styles: css/motion.css)
     1. Scroll reveal: sections and cards rise in as they enter the screen
     2. Stat numbers count up
     3. Reading-progress bar under the header + the experience timeline fill
     4. A soft light that follows the pointer across cards
     5. The hero portrait leans slightly towards the pointer
   Everything here is decoration. If the visitor's device asks for reduced
   motion, or this file fails to load, the page is simply shown as it is.
   No libraries.
   ===================================================================== */
(function () {
  "use strict";

  window.__motion = true;                         // tells the <head> script that this file loaded
  var root = document.documentElement;
  var animate = root.classList.contains("anim");  // set in <head> only when motion is welcome
  var finePointer = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- 1. Scroll reveal ---------- */
  if (animate) {
    var items = [].slice.call(document.querySelectorAll("[data-reveal], [data-stagger] > *"));
    var STEP = 70, MAX_DELAY = 420;               // ms between neighbours, and the longest wait

    var revealer = new IntersectionObserver(function (entries) {
      var batch = [];
      entries.forEach(function (entry) {
        var el = entry.target;
        if (entry.isIntersecting) {
          batch.push(el);
        } else if (entry.boundingClientRect.bottom < 0) {
          el.classList.add("is-in");              // already scrolled past (e.g. page opened at #contact)
          el.style.setProperty("--d", "0ms");
          revealer.unobserve(el);
        }
      });
      // elements that arrive together come in one after another, in reading order
      batch.sort(function (a, b) {
        var ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
        return Math.abs(ra.top - rb.top) > 8 ? ra.top - rb.top : ra.left - rb.left;
      });
      batch.forEach(function (el, i) {
        el.style.setProperty("--d", Math.min(i * STEP, MAX_DELAY) + "ms");
        el.classList.add("is-in");
        revealer.unobserve(el);
      });
    }, { rootMargin: "0px 0px -7% 0px", threshold: 0.01 });

    items.forEach(function (el) { revealer.observe(el); });
  }

  /* ---------- 2. Count-up numbers ---------- */
  var counters = [].slice.call(document.querySelectorAll("[data-count]"));
  if (animate && counters.length) {
    var countUp = function (el) {
      var target = parseInt(el.getAttribute("data-count"), 10);
      if (!(target > 0)) return;
      var duration = Math.min(1600, 700 + target * 40), start = null;
      var tick = function (now) {
        if (start === null) start = now;
        var t = Math.min(1, (now - start) / duration);
        el.textContent = Math.round(target * (1 - Math.pow(1 - t, 3)));   // ease-out
        if (t < 1) requestAnimationFrame(tick);
      };
      el.textContent = "0";
      requestAnimationFrame(tick);
    };
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        counterObserver.unobserve(entry.target);
        countUp(entry.target);
      });
    }, { rootMargin: "0px 0px -7% 0px" });
    counters.forEach(function (el) { counterObserver.observe(el); });
  }

  /* ---------- 3. Progress bar + timeline fill ---------- */
  var bar = document.querySelector(".scroll-progress");
  var timeline = animate ? document.querySelector(".timeline") : null;
  var ticking = false;
  var update = function () {
    ticking = false;
    var vh = window.innerHeight;
    if (bar) {
      var max = root.scrollHeight - vh;
      bar.style.transform = "scaleX(" + (max > 0 ? Math.min(1, window.scrollY / max) : 0) + ")";
    }
    if (timeline) {
      var r = timeline.getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh) {            // fills up to 60% of the way down the screen
        var p = (vh * 0.6 - r.top) / r.height;
        timeline.style.setProperty("--progress", Math.max(0, Math.min(1, p)).toFixed(3));
      }
    }
  };
  var requestUpdate = function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  if (bar || timeline) {
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate, { passive: true });
    update();
  }

  /* ---------- 4. Pointer light on cards ---------- */
  if (finePointer) {
    document.addEventListener("pointermove", function (e) {
      var card = e.target.closest && e.target.closest(".card, .project-card, .mini-card");
      if (!card) return;
      var r = card.getBoundingClientRect();
      card.style.setProperty("--mx", (e.clientX - r.left) + "px");
      card.style.setProperty("--my", (e.clientY - r.top) + "px");
    }, { passive: true });
  }

  /* ---------- 5. Hero portrait tilt ---------- */
  var profile = document.querySelector(".hero-profile");
  if (animate && finePointer && profile) {
    var MAX_TILT = 5;                              // degrees
    profile.addEventListener("pointermove", function (e) {
      var r = profile.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      profile.style.setProperty("--ry", (x * 2 * MAX_TILT).toFixed(2) + "deg");
      profile.style.setProperty("--rx", (-y * 2 * MAX_TILT).toFixed(2) + "deg");
    });
    profile.addEventListener("pointerleave", function () {
      profile.style.setProperty("--rx", "0deg");
      profile.style.setProperty("--ry", "0deg");
    });
  }
})();
