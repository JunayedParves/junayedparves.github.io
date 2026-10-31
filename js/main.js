/* =====================================================================
   main.js — small interactive pieces (all optional: the page works and
   every piece of content is readable without JavaScript)
     1. Knowledge Hub tabs (Books / Podcasts / People / Platforms)
     2. "Show more" shelves with a smooth height animation
     3. Lightbox for case-study screenshots
     4. Contact form (only rendered when a Formspree ID is configured)
   ===================================================================== */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. Tabs (keyboard: ← → Home End) ---------- */
  document.querySelectorAll("[role=tablist]").forEach(function (list) {
    var tabs = [].slice.call(list.querySelectorAll("[role=tab]"));
    function select(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
      });
      if (focus) tab.focus();
    }
    list.addEventListener("click", function (e) {
      var tab = e.target.closest("[role=tab]");
      if (tab) select(tab, false);
    });
    list.addEventListener("keydown", function (e) {
      var i = tabs.indexOf(document.activeElement);
      if (i < 0) return;
      var next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
      if (next === undefined) return;
      e.preventDefault();
      select(tabs[(next + tabs.length) % tabs.length], true);
    });
  });

  /* ---------- 2. "Show more" shelves ---------- */
  document.querySelectorAll("[data-shelf-toggle]").forEach(function (button) {
    var shelf = document.getElementById(button.getAttribute("aria-controls"));
    var label = button.querySelector(".label");
    var moreText = label.textContent;
    var extras = [].slice.call(shelf.querySelectorAll(".shelf-extra"));

    function animate(from, to, done) {
      if (reduceMotion || from === to) { done(); return; }
      shelf.style.height = from + "px";
      void shelf.offsetHeight;
      shelf.style.height = to + "px";
      var finished = false;
      var finish = function () { if (!finished) { finished = true; done(); } };
      shelf.addEventListener("transitionend", function onEnd(e) {
        if (e.target === shelf) { shelf.removeEventListener("transitionend", onEnd); finish(); }
      });
      setTimeout(finish, 700);
    }

    button.addEventListener("click", function () {
      var open = button.getAttribute("aria-expanded") === "true";
      var from = shelf.offsetHeight;
      if (!open) {
        extras.forEach(function (el) { el.hidden = false; });
        var to = shelf.scrollHeight;
        extras.forEach(function (el, i) {
          el.style.animationDelay = (i * 50) + "ms";
          el.classList.add("is-revealing");
          setTimeout(function () { el.classList.remove("is-revealing"); el.style.animationDelay = ""; }, i * 50 + 600);
        });
        animate(from, to, function () { shelf.style.height = ""; });
      } else {
        extras.forEach(function (el) { el.hidden = true; });
        var collapsed = shelf.offsetHeight;
        extras.forEach(function (el) { el.hidden = false; });
        animate(from, collapsed, function () {
          extras.forEach(function (el) { el.hidden = true; });
          shelf.style.height = "";
        });
      }
      button.setAttribute("aria-expanded", String(!open));
      label.textContent = open ? moreText : "Show less";
    });
  });

  /* ---------- 3. Lightbox ---------- */
  var dialog = document.getElementById("lightbox");
  if (dialog && typeof dialog.showModal === "function") {
    var img = dialog.querySelector("img");
    var caption = dialog.querySelector(".lightbox-caption");
    document.addEventListener("click", function (e) {
      var trigger = e.target.closest("[data-zoom]");
      if (!trigger) return;
      e.preventDefault();
      img.src = trigger.getAttribute("data-zoom");
      img.alt = trigger.getAttribute("data-alt") || "";
      caption.textContent = trigger.getAttribute("data-caption") || "";
      dialog.showModal();
    });
    dialog.addEventListener("click", function (e) {
      if (e.target === dialog || e.target.closest(".lightbox-close")) dialog.close();
    });
  }

  /* ---------- 4. Contact form (Formspree) ---------- */
  var form = document.querySelector("[data-contact-form]");
  if (form) {
    var status = form.querySelector(".form-status");
    var button = form.querySelector('button[type="submit"]');
    var say = function (msg, kind) { status.textContent = msg; status.className = "form-status " + (kind || ""); };
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { say("Please add your name, a valid email and a message.", "error"); form.reportValidity(); return; }
      if (form.elements._gotcha.value) { form.reset(); say("Thanks! Your message has been sent.", "ok"); return; }
      button.disabled = true;
      say("Sending…");
      fetch(form.action, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } })
        .then(function (res) {
          if (!res.ok) throw new Error("HTTP " + res.status);
          form.reset();
          say("Thanks! Your message has been sent. I'll reply soon.", "ok");
        })
        .catch(function () { say("Sorry, the message couldn't be sent. Please email me directly.", "error"); })
        .finally(function () { button.disabled = false; });
    });
  }
})();
