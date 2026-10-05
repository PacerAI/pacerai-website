# `src/` — how a page gets built and shipped

> **Related docs:** deploy detail → [`../docs/deploy/runbook.md`](../docs/deploy/runbook.md) · things only a browser can do →
> [`../docs/deploy/wp-admin-actions.md`](../docs/deploy/wp-admin-actions.md) · page registry →
> [`../CLAUDE.md`](../CLAUDE.md#wordpress-page-registry) · lead capture →
> [`../docs/lead-capture-architecture.md`](../docs/lead-capture-architecture.md) · pitfalls →
> [`../CLAUDE.md`](../CLAUDE.md) §"WordPress.com CSS/JS Pitfalls".

**Who this is for:** *"I need to add or change a page — what do I touch, in what order, and what will silently break?"*
The silent breakage is real: a malformed closing tag in one WPCode field once killed **every** script on the site.

There is no build step and no framework. Each file in `src/` is a complete, standalone HTML document with its CSS
inline, pushed into a WordPress Page by `scripts/deploy.py`. What looks like shared code — nav, footer, base CSS —
is **duplicated into every page file by hand**.

---

## Anatomy of a page

```html
<!-- wp:html -->
<style>
  /* 1. TT4 theme overrides — hide WP chrome, kill the 620px content clamp */
  /* 2. :root bone tokens                                                  */
  /* 3. page CSS, ALL scoped under #pacerai-homepage                       */
</style>
<div id="pacerai-homepage">   <!-- the ONE id WordPress won't strip -->
  <nav>…</nav>                <!-- copied from src/nav-headers.html   -->
  <section data-section="…">…</section>
  <footer>…</footer>          <!-- copied from src/footer/footer.html -->
</div>
<!-- /wp:html -->
```

The load-bearing override is `.wp-site-blocks .is-layout-constrained > :where(:not(.alignleft):not(.alignright):not(.alignfull)){max-width:none!important}`.
Without it the page renders clamped to ~620px and the sticky nav looks broken.

Use `data-section="name"` for anchors, not `id=` — WordPress strips every `id` except `#pacerai-homepage`
(`validate.py` warns on any other, and allows a `wp-` prefix for genuine anchor targets).

---

## Attaching the nav and the footer

Both live as canonical fragments. **Edit the fragment first, then copy it into every page file, then batch deploy.**

| Fragment | File | Notes |
|---|---|---|
| Nav | [`nav-headers.html`](nav-headers.html) | Two variants — **homepage** (in-page smooth scroll, `onclick="_s(...)"`) and **sub-page** (plain `/#section` hrefs). Pick by page type. |
| Footer | [`footer/footer.html`](footer/footer.html) | 4 columns: Product · Use Cases · Company · Resources. |

Both are scoped under `#pacerai-homepage` and assume the bone `:root` tokens — **a page must be on the bone palette
to adopt them.**

> **Which source wins when they disagree?** The fragments are canonical for *content* (what links exist, where they
> point). `src/homepage/index-build.html` is canonical for *chrome mechanics* — it carries the current TT4 overrides
> and the `position:fixed` nav, and some older page files predate those. So: take link structure from the fragment,
> take the surrounding CSS from the homepage. `src/team/contact.html` is the cautionary tale — it was cloned from a
> stale page and rendered clamped and narrow.

Changing either fragment means redeploying **every** page, not just one.

---

## WPCode snippets

Three snippets are installed in WP Admin → WPCode. Nothing else in the repo lists them, and the mapping is not
guessable from the WordPress UI.

| WP Admin location | Source file | State |
|---|---|---|
| Header & Footer → **Header** | `src/homepage/wpcode-homepage-css.css` | **Deliberately blank since v3.** The old 37K dark CSS lives in `docs/design/homepage/archive/` for rollback only. Leave it empty. |
| Header & Footer → **Footer** | [`wpcode/footer.js`](wpcode/footer.js) | Live. All site-wide JS: the lead-capture form handler, hero rotor, logo marquee, mobile nav. |
| Site Wide Header (HTML snippet) | pasted in [`../docs/deploy/wp-admin-actions.md`](../docs/deploy/wp-admin-actions.md) | Organization / Person JSON-LD. |

### Pasting `footer.js` safely

This is the highest-risk routine action in the repo. Three ways to break every script on the site:

1. **The wrapper.** `footer.js` is pure JS with no `<script>` tags. In the Header & Footer → Footer field, WPCode
   injects verbatim, so you **must** wrap it in opening and closing `<script>` tags or it renders as visible text.
   Alternatively create a WPCode **"JavaScript Snippet"**, which auto-wraps — then leave the tags off.
   `src/wpcode/footer.paste.txt` is the pre-wrapped version, ready for the Header & Footer field.
2. **No literal closing script tag inside the file.** Inside the wrapper it closes the block early. This is the exact
   bug that took the site's JS down: a stray `<script>` where `</script>` belonged → `Unexpected token <` → every
   footer script dead, silently.
3. **Never paste minified JS.** WordPress inserts line breaks mid-token (`set\nTimeout`, `el.tex\ntContent`). Use the
   non-minified file as-is.

**Verify after saving:** load any page, open the console, and check `document.querySelectorAll('.wp-cta-form').length`
matches the forms you expect, with no syntax error logged.
**Rollback:** `git show HEAD~1:src/wpcode/footer.js` and paste the previous version. There is no WordPress-side history.

### Why the homepage doesn't rely on the footer snippet

Because that outage happened. The homepage's animations were moved into an inline `<img src="//0" onerror="…">`
injector in `index-build.html`, which survives WordPress's `<script>` stripping and does not depend on WPCode being
healthy. They are guarded by `window.__paRotor` / `window.__paPipe` so they never double-run if the footer snippet is
later fixed.

**For new JS:** if it must work even when WPCode is broken, use the `<img onerror>` injector. Otherwise add a guarded
IIFE to `footer.js` — and note the capture-form handler lives there, so a broken footer snippet means **forms stop
submitting**.

*Superseded, do not edit:* `src/homepage/wpcode-typed-hero.js` and `src/solutions/wpcode-arr-snowball-form.js` both
duplicate live sections of `footer.js` with divergent content. `src/homepage/homepage-v2.css` is a byte-identical twin
of `wpcode-homepage-css.css`.

---

## Adding a new page

1. **Create** `src/<section>/<page>.html` — copy the chrome per the rules above.
2. **Create the WordPress page** and note its ID (see the runbook for the REST call).
3. **Register it in both places.** This is the step every other doc omits:
   - `scripts/deploy.py` → `PAGE_REGISTRY` (ID → source path) **and** `PAGE_NAMES` (ID → label)
   - `CLAUDE.md` → the page registry table

   A page registered only in `CLAUDE.md` is undeployable — `deploy.py` will not know it exists.
4. **Validate, deploy, verify** (below).
5. **Set the Yoast title + meta description in WP Admin.** They are not writable over the REST API on WordPress.com —
   the API accepts them and silently discards them. Worklist: `docs/deploy/yoast-worklist.md`.

---

## Validate, deploy, verify

```bash
source ~/.zshrc                                   # WP_BASE_URL, WP_USER, WP_APP_PASSWORD

python3 scripts/validate.py src/homepage/index-build.html   # one file
python3 scripts/validate.py                                 # everything

python3 scripts/preview.py                        # http://localhost:5500/src/... — simulates WP rendering

python3 scripts/deploy.py 25 --dry-run
python3 scripts/deploy.py 25                      # validates, backs up, pushes, verifies
python3 scripts/deploy.py all
```

`validate.py` checks character count (68K WordPress ceiling), stray `id=` attributes, HTML comments, local image
paths, nav/footer structure, voice lint, and foundation pricing facts.

**`--force` is expected for blog posts.** Their original prose carries banned-word debt that trips the voice lint;
`--force` skips validation. Do not reach for it on other pages — the pre-publish hook exists for a reason.

After deploying: curl the live URL for a 200, then append to `docs/document/changelog.md`.

---

## Where things live

| Path | What |
|---|---|
| `homepage/index-build.html` | Homepage, WP 25. The bone reference for chrome mechanics. |
| `blog/index-build.html` · `blog/posts/` | Resources hub (WP 230) and the articles. `post-template.html` seeds new ones. |
| `team/` · `demo-connect.html` · `research/` | Team (366), Contact (375), Demo Connect (983), and an **unregistered, undeployed** research page. |
| `solutions/` · `platform/` | Retired and 301-redirected. Kept for rollback — do not redeploy. |
| `nav-headers.html` · `footer/` | The canonical chrome fragments. |
| `wpcode/footer.js` | Source of truth for the WPCode Footer snippet. |
