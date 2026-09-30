/* =====================================================================
   config.js  —  THE ONLY SETTINGS FILE YOU NEED TO EDIT
   ---------------------------------------------------------------------
   The website (js/script.js) AND the backup robot (scripts/sync.js)
   both read this file, so your IDs live in exactly one place.

   After editing: save, commit and push. That's it.
   ===================================================================== */

var SITE_CONFIG = {

  /* Your live website address, with a slash at the end.
     Used for the sitemap and for link previews on LinkedIn etc.
     If you later connect a custom domain, change it here too. */
  siteUrl: "https://junayedparves.github.io/",

  /* ------------------------------------------------------------------
     GOOGLE SHEET
     ------------------------------------------------------------------
     1) In Google Sheets: File → Share → Publish to web
        → choose "Entire document" + "Comma-separated values (.csv)" → Publish.
     2) Google shows a link like:
        https://docs.google.com/spreadsheets/d/e/2PACX-1vABC...xyz/pub?output=csv
        Copy ONLY the part between "/d/e/" and "/pub"  (it starts with 2PACX-)
        and paste it into publishedId below.
     3) Each tab has its own number called a "gid". Click a tab at the
        bottom of your sheet and look at the browser address bar:
        ...edit#gid=123456789   ← that number is the gid for that tab.
        The very first tab is usually 0.

     Leave publishedId empty ("") and the site simply uses the backup
     files in /data/ instead. The site always works, even before setup.
     ------------------------------------------------------------------ */
  sheet: {
    publishedId: "",          // e.g. "2PACX-1vABC...xyz"
    gids: {
      profile:    "0",
      skills:     "",
      experience: "",
      education:  "",
      projects:   "",
      books:      "",
      podcasts:   "",
      following:  ""
    }
  },

  /* ------------------------------------------------------------------
     CONTACT FORM (Formspree — free)
     Sign up at https://formspree.io → New form → copy the form ID.
     The form endpoint looks like https://formspree.io/f/xyzabcd
     → the ID is the last part: "xyzabcd".
     Leave empty and the form falls back to opening the visitor's email app.
     ------------------------------------------------------------------ */
  formspreeId: "",

  /* The project filter tabs, in the order they appear.
     A tab only shows if at least one visible project uses that category.
     The text must match the "category" column in the projects tab. */
  projectCategories: ["Power BI", "Web App", "Tableau", "GitHub"]
};

/* ---- Plumbing (no need to touch) ----
   Makes the settings available to the browser and to Node.js. */
if (typeof window !== "undefined") window.SITE_CONFIG = SITE_CONFIG;
if (typeof module !== "undefined") module.exports = SITE_CONFIG;
