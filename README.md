# pacerai-website

**Goal:** Pacer AI's public marketing surface — answers "what does Pacer AI sell and to whom?" Pacer AI is positioned as the **GTM Financial Modeling Agent** (built for CROs / Sales Leaders, CFOs secondary; "Revenue Modeling Agent" is a nav-label synonym) for recurring-revenue companies ($10M–$1B, often PE/sponsor-backed, including non-tech: payroll, healthcare, services). Authored as standalone HTML files with inline CSS, published as WordPress.com Pages via the REST API (no local dev server, no framework). Operator role is `repo-operator`; four named on-dispatch agents (`blog-post`, `ui-ux-pro-max`, `webdev-getpacerai`, `website-char-count`) own authoring, UX review, deploy, and SEO-character-bounds checks. Upstream seam: `pacerai-foundation` (brand, voice, ICP, pricing — auto-loaded into `CLAUDE.md` via four `@`-imports of `foundation/pricing/*.md` per spec #17). Downstream seam: WordPress REST API at `getpacerai.com` — every page lands as a WP Page with a tracked ID. Both lifecycles can coexist — domain content work in this repo runs under PDBRDD locally; cross-repo work follows SPIDRDD.

If you're opening this repo for the first time: read `AGENTS.md` (OS-pointer block points back to `pacerai-os/POLICY.md` for the work-mode gate), then `STATUS.md` for current state. Before deploying anything to WordPress, read `docs/deploy/runbook.md` and confirm `WP_BASE_URL`, `WP_USER`, `WP_APP_PASSWORD` are sourced via `source ~/.zshrc`.

---

## Quick Links

| What | Where | When to use |
|---|---|---|
| **Session brief** | [`CLAUDE.md`](CLAUDE.md) | First file any Claude session reads — operating mode, hard rules, this repo's role |
| **Agents pointer** | [`AGENTS.md`](AGENTS.md) | OS-pointer block — sends sessions to `pacerai-os` for POLICY + SPEC-STANDARD |
| **Current status** | [`STATUS.md`](STATUS.md) | What's active, what's blocked, last runs in this repo |
| **Current cadence** | [`CADENCE.md`](CADENCE.md) | What runs on a schedule here (agents, workflows) |
| **Ad hoc log** | [`AD-HOC-LOG.md`](AD-HOC-LOG.md) | Append-only — local edits with no cross-repo blast radius |
| **Deploy runbook** | [`docs/deploy/runbook.md`](docs/deploy/runbook.md) | Read before any REST API push to WordPress |
| **Page registry (canonical)** | [`CLAUDE.md`](CLAUDE.md#wordpress-page-registry) | WP ID → slug → source-file map; the source of truth for what pages exist |
| **Webpages metadata audit** | [`webpages-metadata.md`](webpages-metadata.md) | Yoast title / meta-desc / OG image status per page |
| **Build dashboard** | [`website-development-dash.html`](website-development-dash.html) | In-repo dashboard for site build progress |
| **Foundation submodule** | [`foundation/`](foundation/) | `pacerai-foundation` mounted as submodule — doctrine link, not copy |
| **Version** | [`VERSION`](VERSION) | Current semver (`3.0.0`). Releases are semver-tagged (`vX.Y.Z`) from v3.0.0 onward; see `docs/document/changelog.md` |

Note: `goals/` is now provisioned (`goals/aeo-ranking.md`; `foundation/goals/drift-checks.md`). `TASK-LOG.md` is added when the first goal-tracked dispatch lands.

**Palette:** as of **v3.0.x (LIVE)** the site is on the light **"Claude-bone"** palette (bone `#F5F4EF`) end to end — homepage, Resources hub, all 12 blog articles, Team, and Contact are all bone. Only legacy/redirected URLs remain on the retired dark theme. **Deploy state:** PR #20 is **merged and v3.0.0 tagged**; the go-live runbook is preserved at [`docs/deploy/v3-golive-plan.md`](docs/deploy/v3-golive-plan.md), post-deploy WP Admin steps (schema snippet + redirects) at [`docs/deploy/wp-admin-actions.md`](docs/deploy/wp-admin-actions.md).

---

## Commands

```bash
# Authoring + publishing (on-dispatch)
/webdev-getpacerai [action] [details]        # Web-dev skill — WP REST publication, template edits, batch deploys
/blog-post <topic>                           # Authors blog post per Pacer voice (foundation/brand/voice.yml)
/ui-ux-pro-max <component>                   # UI/UX review pass on a section, component, or full page
/website-char-count <file>                   # SEO-bounded character count check (Yoast titles, meta descriptions)

# Local validation + deploy (Python scripts)
python3 scripts/preview.py                                   # Local preview — strips WP scripts, injects WPCode CSS
python3 scripts/validate.py [<file>]                         # Char count, broken links, footer/nav consistency
python3 scripts/validate.py --strict                         # Strict-mode gate used by Pre-Publish Validation workflow
python3 scripts/deploy.py <wp_id|all> [--dry-run|--force]    # Deploy via WP REST API w/ validation + backup + verify
```

Skills live at [`.claude/skills/`](.claude/skills/) — one directory per slash command above. GitHub Actions wire two `@claude`-driven workflows (review on PR, mention-driven response) plus the `Pre-Publish Validation` gate that runs `validate.py --strict` on publishable artifacts.

---

## Operator / Agents

**Operator role:** `repo-operator` (per `AGENTS.md`). Whichever Claude session picks up a dispatch in this repo *is* the operator, acting under [`.claude/operator.md`](.claude/operator.md).

| Agent | Role | File | Invoked at | Status |
|---|---|---|---|---|
| `blog-post` | Authors blog posts for getpacerai.com per Pacer voice (`foundation/brand/voice.yml` + anti-AI-writing-style) | [`.claude/skills/blog-post/`](.claude/skills/blog-post/) | On-dispatch (`/blog-post <topic>`) | Built |
| `ui-ux-pro-max` | UI/UX review + refinement pass on site components, sections, or full pages | [`.claude/skills/ui-ux-pro-max/`](.claude/skills/ui-ux-pro-max/) | On-dispatch (`/ui-ux-pro-max <target>`) | Built |
| `webdev-getpacerai` | Web-dev skill — WordPress REST publication, template edits, batch deploys, page registry maintenance | [`.claude/skills/webdev-getpacerai/`](.claude/skills/webdev-getpacerai/) | On-dispatch (`/webdev-getpacerai [action]`) | Built |
| `website-char-count` | Character-count utility for SEO-bounded fields (Yoast title ≤ 60, meta desc ≤ 155) | [`.claude/skills/website-char-count/`](.claude/skills/website-char-count/) | On-dispatch (`/website-char-count <file>`) | Built |

Ike never edits files inside this repo on dispatch. The operator writes only inside this repo; cross-repo work requires a new dispatch from Ike; status returns via `STATUS.md`. The `webdev-getpacerai` skill is also symlinked at `~/.claude/skills/webdev-getpacerai` for cross-session availability — edits land here in-repo and the symlink resolves there.

---

## How This Repo Works

### File Tree

```
pacerai-website/
├── AGENTS.md                              # OS-pointer block (managed by pacerai-os spec #2)
├── README.md                              # This file
├── CLAUDE.md                              # Session brief — @-imports four foundation/pricing/*.md canons + page registry
├── STATUS.md                              # Current state (rewrite-not-append)
├── CADENCE.md                             # Static cadence config (v2.0)
├── AD-HOC-LOG.md                          # Append-only local edits
├── webpages-metadata.md                   # Yoast SEO metadata audit (per-page status)
├── website-development-dash.html          # In-repo build progress dashboard
├── src/                                   # Page source HTML (one dir per top-level URL segment)
│   ├── homepage/                          # Homepage (WP ID 25)
│   ├── blog/                              # Blog index + post templates + posts/
│   ├── platform/                          # Platform pages (overview)
│   ├── solutions/                         # Solution + transformation-package pages (7 pages)
│   ├── team/                              # Team page + about + contact
│   ├── footer/                            # Shared footer fragments
│   ├── nav-headers.html                   # Shared nav fragment
│   └── wpcode/                            # Externalized CSS injected via WPCode plugin
├── scripts/                               # preview.py + validate.py + deploy.py + build_seo_table.py (Python; WP REST API)
├── docs/                                  # PDBRDD documentation
│   ├── plan/                              # PRD, site tree, build prompts
│   ├── design/                            # HTML mockups
│   ├── build/                             # Architecture, technical decisions
│   ├── review/                            # QA checklist, known issues, backups
│   ├── document/                          # Changelog, internal documentation
│   └── deploy/                            # Deploy runbook
├── content-staging/                       # Pre-publication content drafts
├── prompt-library/                        # Reusable prompts (authoring + review)
├── img/                                   # Image assets
├── foundation/                            # pacerai-foundation submodule (doctrine link, not copy)
└── .claude/
    ├── operator.md                        # Operator config for this repo (repo-operator role)
    ├── settings.json + settings.local.json # Claude Code permissions + local overrides
    ├── rules/                             # Repo-local rule files
    ├── hooks/                             # PreToolUse / publish hooks
    └── skills/                            # 4 on-dispatch skills (blog-post, ui-ux-pro-max, webdev-getpacerai, website-char-count)
```

### Pre-publish validation flow (the gate)

```
HTML edit in src/<page>/...
    │
    ├── 1. Operator runs python3 scripts/validate.py [<file>]
    │       ├── Character count (Yoast title ≤ 60, meta desc ≤ 155)
    │       ├── Broken-link sweep
    │       └── Footer + nav consistency across pages
    ├── 2. PR opened → .github/workflows/pre-publish.yml triggers
    │       └── Cloud-side validate.py --strict on publishable artifacts (voice / foundation / HTML)
    ├── 3. Pre-Publish Validation must PASS before merge
    └── 4. After merge: /webdev-getpacerai deploy <wp_id|all>
            └── scripts/deploy.py → WP REST API → live at getpacerai.com → log to docs/document/changelog.md
```

```
Authoring flow (PDBRDD lifecycle, domain-local)
    │
    ├── 1. /blog-post <topic> OR /webdev-getpacerai build <slug> page
    │       └── Drafts HTML in src/<segment>/<page>.html per Pacer voice + brand constraints
    ├── 2. /ui-ux-pro-max <target> → review/refine the section or page
    ├── 3. /website-char-count <file> → confirm Yoast bounds
    └── 4. Pre-publish validation flow above takes over
```

### Pages registry

| Page | URL | WP ID | Source File |
|---|---|---|---|
| Home | https://getpacerai.com/ | 25 | `src/homepage/index-build.html` |
| Resources (hub, was "Blog") | https://getpacerai.com/resources/ | 230 | `src/blog/index-build.html` |
| ARR Snowball | https://getpacerai.com/solutions/arr-snowball-board-reporting/ | 372 | `src/solutions/arr-snowball.html` |
| Customer Data Cube | https://getpacerai.com/solutions/customer-data-cube/ | 373 | `src/solutions/customer-data-cube.html` |
| Exit Readiness | https://getpacerai.com/solutions/transaction-readiness/ | 554 | `src/solutions/transaction-readiness.html` |
| RevOps Transformation | https://getpacerai.com/solutions/revops-transformation-pkg/ | 651 | `src/solutions/revops-transformation-pkg.html` |
| GTM Transformation | https://getpacerai.com/solutions/gtm-transformation-pkg/ | 650 | `src/solutions/gtm-transformation-pkg.html` |
| FP&A Transformation | https://getpacerai.com/solutions/fpanda-transformation-pkg/ | 652 | `src/solutions/fpanda-transformation-pkg.html` |
| Team | https://getpacerai.com/team/ | 366 | `src/team/team-page.html` |
| Contact | https://getpacerai.com/contact/ | 375 | `src/team/contact.html` |

All 12 blog articles (bone + live under `/resources/`) plus slugs, parents, and placeholder/legacy pages live in the canonical registry in [`CLAUDE.md`](CLAUDE.md#wordpress-page-registry). Edit there on new-page creation, then mirror summary here. *(Platform Overview 371 and About 374 are now legacy — 301-redirected to homepage anchors.)*

---

## Data Dictionary

| File | Type | Governs | Updated by |
|---|---|---|---|
| `STATUS.md` | State | Active specs, goal_progress, last_runs (this repo) | Operator |
| `CADENCE.md` | Cadence | Agents / workflows / inputs / outputs (this repo) | Operator |
| `AD-HOC-LOG.md` | Log | One line per local edit | Anyone |
| `AGENTS.md` | Pointer | OS-pointer block (managed by `pacerai-os` spec #2); never edited locally | `pacerai-os` |
| `CLAUDE.md` | Doctrine | Session brief; `@`-imports four `foundation/pricing/*.md` canons; carries the canonical WordPress page registry | Will + Operator |
| `webpages-metadata.md` | Registry (reference) | Per-page Yoast title / meta-desc / OG image / index status | Operator |
| `src/<segment>/*.html` | Source | Page source HTML (one per WP Page) — deployed as `<!-- wp:html -->` blocks via REST API | `webdev-getpacerai` / `blog-post` |
| `src/nav-headers.html` + `src/footer/` | Source (shared) | Shared nav + footer fragments duplicated across all pages — change requires re-deploy of every page | `webdev-getpacerai` |
| `src/wpcode/wpcode-homepage-css.css` | Source (externalized) | Homepage CSS externalized to WPCode (page exceeds 68K inline limit) — update WPCode snippet in WP Admin on change | `webdev-getpacerai` |
| `scripts/deploy.py` | Tooling | WP REST API deploy with built-in validation + backup + verification | Operator |
| `scripts/validate.py` | Tooling | Char count + broken-link + footer/nav consistency; `--strict` is the Pre-Publish gate | Operator |
| `scripts/preview.py` | Tooling | Local preview server — strips WP scripts, injects WPCode CSS to simulate render | Operator |
| `docs/deploy/runbook.md` | Doctrine | Deploy procedure (backup, verify, batch) — read before any REST push | Operator |
| `docs/document/changelog.md` | Log | One row per deploy | Operator |
| `docs/review/checklist.md` + `Issues.md` | Doctrine | QA checklist + known-issue tracker | Operator |
| `content-staging/` | Source (draft) | Pre-publication content; promoted into `src/` once approved | `blog-post` / Operator |
| `prompt-library/` | Doctrine (reuse) | Reusable prompts for authoring + review | Operator |
| `foundation/` | Doctrine (submodule) | `pacerai-foundation` mounted read-only; brand, voice, ICP, pricing | `pacerai-foundation` (upstream) |

### Stack

| Layer | Tool |
|---|---|
| CMS | WordPress.com (hosted; no SSH/WP-CLI access) |
| Theme | Twenty Twenty-Four (overridden by inline CSS) |
| Deploy | WordPress REST API + Application Password (Python `requests`) |
| Build tooling | None — pure HTML/CSS, vanilla JS for mobile nav only |
| Version Control | GitHub (`PacerAI/pacerai-website`) |
| SEO | Yoast SEO (active plugin) |
| Analytics | Google Site Kit (GA4 + Search Console) |

---

## Fleet Position

Source of truth: `pacerai-os/contracts/data-fleet-registry.md`.

- **Role:** `marketing-surface`. Pacer AI's public-facing site; consumes brand + pricing doctrine from `pacerai-foundation` and renders it as the prospect-facing surface at getpacerai.com. Distinct from `gtm-execution` (outbound; private) and `content-production` (authoring upstream of distribution).
- **Submodule role:** `required-submodule`. `pacerai-foundation` is mounted at `./foundation/`; brand, voice, ICP, and pricing are consumed via the submodule mount plus four `@`-imports of `foundation/pricing/*.md` in `CLAUDE.md` (post-spec #17).
- **What this repo consumes from the fleet:** OS-pointer contracts (`agent-ike-repo-handoff.md`, `agent-repo-status.md`, `agent-repo-cadence.md`) for dispatch payload + STATUS/CADENCE shape; foundation doctrine (brand, voice, ICP, pricing) via the `foundation/` submodule and four `@`-imports of `foundation/pricing/*.md` in `CLAUDE.md`.
- **What the fleet consumes from this repo:** the live `getpacerai.com` surface itself (consumed by prospects via the public web, not by other fleet repos directly); `src/` page sources are the canonical authored copy upstream of WordPress publication.

---

## Risks

| Risk | Severity | Mitigation |
|---|---|---|
| `CLAUDE.md` is 328 lines — exceeds the 200-line guideline flagged by the architecture audit; carries the full WP page registry, deploy patterns, WordPress.com pitfalls, brand constraints, and operator rules in one file | Medium | Pre-existing risk tracked separately (out of spec #22 scope per Plan §10.4 / §11.11 watch-fors); a future Seed splits the page registry + WordPress pitfalls into sub-docs and leaves `CLAUDE.md` as the session brief proper |
| Yoast title + meta descriptions cannot be set via the WP REST API on WordPress.com — must be set manually in WP Admin per page | Medium | v3.0.x: all 21 indexed pages rebranded to the "GTM Financial Modeling Agent for CROs" message in WP Admin; per-page worklist at `docs/deploy/yoast-worklist.md`; Organization + Person schema added via a WPCode JSON-LD snippet (`docs/deploy/wp-admin-actions.md`). Excerpts remain a meta-desc fallback |
| Foundation submodule version pinning — `foundation/` was bumped on 2026-05-19 (ad hoc fleet wiring fix) and again on 2026-05-20 (spec #17 pricing-doctrine wire); a future foundation canonical edit landing without a coordinated submodule bump here could resolve the four `@`-imports against stale doctrine | Low | `foundation-waterfall audit` (in `pacerai-foundation`) detects drift across consumers; `pacerai-os/bin/check-foundation-wiring.sh` (registry-driven, spec #14) gates the wiring at the OS harness layer |
| WordPress.com silent-failure surface — `#pacerai-homepage *` margin/padding resets, inline `<script>` strip, theme-CSS overrides, WPCode footer line-break insertion into minified JS; failures are not erroring, just visually wrong post-deploy (documented in `CLAUDE.md` ## WordPress.com CSS/JS Pitfalls) | Low | Always verify computed styles via DevTools after deploy; non-minified JS in WPCode; deploy runbook (`docs/deploy/runbook.md`) carries verification step; `validate.py --strict` Pre-Publish gate catches some classes pre-merge |
| Homepage slug is `no-title` — pre-spec legacy, affects permalink; needs Will's review before change | Low | Tracked in `CLAUDE.md` ## Known Issues; no functional impact until a slug change is attempted |
| `last_runs: []` + `STATUS.md` baseline frozen at 2026-05-18 spec #2 wiring — no recorded skill dispatches since wiring; the four built skills exist but TASK-LOG.md history starts fresh post-wiring | Low | TASK-LOG.md will populate on first real dispatch; STATUS.md is rewrite-not-append so empty `last_runs:` reflects "no dispatch this sprint" honestly, not a defect |

---

## Dependencies

| This repo depends on | For |
|---|---|
| `pacerai-os/POLICY.md` | Work-mode gate (chore / task / spec / ad hoc) |
| `pacerai-os/SPEC-STANDARD.md` | SPDIRDD lifecycle when a spec is required |
| `pacerai-os/contracts/agent-ike-repo-handoff.md` | Spec dispatch payload shape |
| `pacerai-os/contracts/agent-repo-status.md` | STATUS.md schema |
| `pacerai-os/contracts/agent-repo-cadence.md` | CADENCE.md schema |
| `pacerai-foundation/` | Brand, voice, ICP, strategy, pricing — consumed via the `foundation/` submodule mount; `manifest.yml` referenced as the canonical doctrine inventory |
| `pacerai-foundation/pricing/*.md` (4 files) | Canonical pricing doctrine — `@`-imported into `CLAUDE.md` per spec #17 (funnel / portfolio / rationale / customer-maturity-mapping) |
| WordPress REST API @ `getpacerai.com` | Publication target (external; not a fleet repo but the canonical output surface) |

| Other repos depend on this | For |
|---|---|
| End prospects via getpacerai.com | The live marketing surface itself (CROs, Sales Leaders, RevOps, CFOs, PE Portfolio Ops at recurring-revenue companies $10M–$1B, often PE/sponsor-backed) |
| (none in fleet) | Website is downstream of doctrine and authoring; no fleet repo reads `src/` HTML programmatically |

Per `CADENCE.md` `outputs:`: `src/` (page source HTML) and the WordPress REST API at `getpacerai.com` are the two declared output surfaces.

---

## Schedules and Routines

| Routine | Cadence | Owner | Tool |
|---|---|---|---|
| `blog-post` | On-dispatch | Operator | `/blog-post` |
| `ui-ux-pro-max` | On-dispatch | Operator | `/ui-ux-pro-max` |
| `webdev-getpacerai` | On-dispatch | Operator | `/webdev-getpacerai` |
| `website-char-count` | On-dispatch | Operator | `/website-char-count` |
| Claude Code Review | On PR | GitHub Actions | `.github/workflows/claude-code-review.yml` |
| Claude Code | On `@claude` mention (issues, PRs, review comments) | GitHub Actions | `.github/workflows/claude.yml` |
| Pre-Publish Validation | On PR / push | GitHub Actions | `.github/workflows/pre-publish.yml` (`validate.py --strict` gate) |

No scheduled work in this repo — all skills are on-dispatch and all three workflows are PR/push-event-driven (`CADENCE.md` `sprints`, `cadence_files`, `scheduled_skills`, `loops` are all empty by design).

---

*Pacerai-website started March 9, 2026 with the PDBRDD scaffold for the homepage refresh ("init: PDBRDD scaffold for homepage refresh"); the v2 design landed the same day along with the Twenty Twenty-Four theme, BB removal, and full PDBRDD documentation. Folded into the OS-fleet shape on 2026-05-18 (spec #2 wiring) with an OS-pointer `AGENTS.md` block; the foundation submodule was bumped on 2026-05-19 (ad hoc fleet wiring fix) and again on 2026-05-20 with four `pricing/*.md` `@`-imports landing in `CLAUDE.md` per spec #17. On 2026-05-20 the README was rewritten to the fleet template per spec #22 (PR #4, post-canary lock). Both lifecycles can coexist — domain content work in this repo remains under PDBRDD locally; cross-repo work follows SPIDRDD.*
