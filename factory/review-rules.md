# Review rules

What `/factory`'s reviewers check in this repo, on top of their own job. Most rules are here because they
have already cost something, and those say where they come from. The rest are plain good practice. Add to
this when something reaches `main`, or the live site, that a rule would have caught.

## Code

- **The spec is the source of truth.** If code and spec disagree, that's a finding, whichever is right.
- **Public prices match Price Book v2.0, and no other package appears.** The figures are the three
  seat licenses (Rep pacing, Manager pacing, SLT pacing and planning) and the services. Startup, Advisor,
  company-size bands, the small-team rate, the pilot program and Rep bulk rates are a finding on any page.
  A dollar amount that is not in `foundation/pricing/product-pricing-price-book.md` is a finding.
  `scripts/build_pricing.py` writes `/pricing/` and the Worker's `price-book.json` from that file.
  Publishing the page is still Will's: page 111 stays Draft and `/pricing/` still redirects until he says
  otherwise. (`CLAUDE.md` Pricing row, PAC-164)
- **Nav, footer and base CSS are duplicated across every page file.** A change to one of them that isn't
  applied to all of them ships a site that disagrees with itself. (`CLAUDE.md`, Critical Rules)
- **A page stays under the character limit.** `validate.py` caps at 67,000, a 1K buffer under WordPress's
  68K hard limit. A page over it fails to deploy, not to render.
- **Nothing in a diff deploys.** `scripts/deploy.py` writes to the live site and is run deliberately, by a
  person. A change that makes a build step, a check or a test call it is a finding.
- **`deploy.py` uses urllib's default HTTPS context.** Never pass a custom `SSLContext`, even
  `create_default_context()`: it drops the http/1.1 ALPN and changes the TLS fingerprint that
  WordPress.com's bot challenge keys on, which turned every deploy into a 403. (`CLAUDE.md`, 2026-10-05)
- **Yoast SEO fields are never touched from code.** They are not writable through the WordPress.com REST
  API, and `deploy.py` must not overwrite `yoast_head` or any SEO metadata field. Titles and meta
  descriptions are set in WP Admin, from `docs/deploy/yoast-worklist.md`. (`CLAUDE.md`, Critical Rules)
- **Footer JavaScript is fragile.** A malformed closing tag in the WPCode footer snippet once killed every
  footer-injected script site-wide — the hero rotor, the logo marquee, the pipeline numbers — silently.
  Homepage animations live in the inline `<img onerror>` injector and are guarded by `window.__paRotor` /
  `window.__paPipe` so they never double-run. Keep those guards. (`CLAUDE.md`, Known Issues)
- **The tear sheet is linked as `/tear-sheet/`, never as the PDF file.** The short link is a redirect so the
  PDF can be republished without editing pages. (`CLAUDE.md`, 2026-10-07)
- **Videos are generated, never hand-edited.**

## UI

- **Every page is bone.** `--bone:#F5F4EF`, surface `--surface:#FAFAF7`. The old dark navy `#080E1C`
  survives only on redirected legacy URLs. A new page or section in the dark palette is a finding.
- **The tokens are the palette.** `--navy:#1F3864 --teal:#2E7D74 --ink:#20242B --muted:#5F5A50
  --line:#E6E1D6`, teal accents `#2E7D74` / `#70C49C`. A hex value that isn't one of these needs a reason.
- **DM Sans for body and headings** (weight 800 for headings on the v3 homepage); Cormorant Garamond is
  legacy headings only.
- **Minimal and financial-professional.** No playful illustrations, no rounded pill buttons.
- **CTA language.** Primary is email capture: "Try the Demo Free", "Demo in Claude now", "Get the White
  Paper". Booking — "Talk to Will" — is secondary and lives on `/contact/`. "Talk to Sales" (Calendly) sits
  on `/pricing/`. **Never "Learn More".** (Will, 2026-10-14)
- **One primary action per screenful.** Two equally weighted CTAs competing in the same viewport is a
  finding on a page whose job is conversion.
- **Voice: confident, precise.** Never "leverage" or "utilize". The validator lints this against
  `foundation/brand/voice.yml`, so a change that makes the validator skip those rules is worse than a
  change that fails them.
- **The category term is "Daily Pacing Agent"** (since 2026-10-05; was "GTM Financial Modeling Agent").
  Positioning line: *helping sales leaders make plan with confidence*.

## Numbers

- **A published dollar figure is a Price Book v2.0 seat or service price.** See the Code rules. A figure
  that is not in the Price Book, or a package the book keeps off the site, is a finding.
- **A metric in a case study is cited, not summarised.** The claim names the period and what moved — "NRR
  101% to 105% over six months" — and nothing on the page rounds it in the buyer's favour.
- **No invented numbers.** A customer count, a percentage or a dollar figure a buyer could check has a
  source. An assumption is labelled as one, beside the number.
- **Whole dollars. A date is labelled, and a time says its zone.**

## Security

- **Nothing secret in the diff:** `.env` contents, WordPress application passwords, Cloudflare tokens,
  Apollo keys, connection strings.
- **No real person's name or email in a page, a fixture or a test.** Client data never enters this repo;
  the one name that belongs on the site is Will's own.
- **The demo Worker handles personal data.** Signups, orders and the opt-out list in
  `infra/pacer-demo-worker/` are live traffic. A change to who can read or write them, or to what is
  logged, needs naming in the brief.
- **An opt-out stays opted out.** A change that could re-add a suppressed address to a send is a finding.
- **Nothing recursive at the fleet root.** A build or deploy names its inputs and stages them; it never
  widens its scope to a parent folder, which once shipped five `.env` files in an image.
  (`first_principles.md` §4)
- **Unattended code makes no live writes.** Deploys, tear-sheet publishes and Worker promotions are Will's.
