# Project Overview — Pacer AI Website

**Sprint:** Website Build — P0 + P1 Pages
**Date:** March 2026 (updated 2026-03-10)
**Owner:** Will Sullivan, Founder — Pacer AI
**Status:** P1 Complete — Ongoing Expansion

---

## Goal

Build and maintain a multi-page marketing website for getpacerai.com that communicates Pacer AI's value proposition to PE-backed SaaS operators and converts visitors into demo requests.

## Problem Statement

The original homepage did not reflect Pacer AI's positioning as a board-level ARR intelligence platform. It lacked the financial-professional aesthetic and specific use case clarity needed to resonate with Operating Partners, CFOs, and RevOps leaders. Beyond the homepage, there were no dedicated pages for solutions, platform details, or company information.

## What Was Done

### P0: Homepage (2026-03-09)
- Full homepage redesign deployed via WordPress REST API
- New hero, ARR Snowball section, platform pillars, use cases, testimonial, CTA
- Removed Beaver Builder; switched to Twenty Twenty-Four with clean CSS overrides
- Added nav/footer HTML, full mobile responsive (hamburger nav, stacked layouts)
- Established REST API deploy workflow

### P1: Site Expansion (2026-03-10)
- Built and deployed 5 new pages to WordPress:
  - **Platform Overview** — architecture diagram, capability pillars, integrations
  - **ARR Snowball Board Reporting** — flagship use case with AEO, FAQ (JSON-LD), dashboard mockup
  - **Customer Data Cube** — 6-dimension grid, use cases, FAQ (JSON-LD), dashboard mockup
  - **About** — mission, founder bio, values, tech partners
  - **Contact** — form, Calendly, email, partnerships sidebar
- Created parent placeholder pages for URL hierarchy (Platform, Solutions, Company)
- Cross-linked all 7 pages (homepage, blog, platform, ARR snowball, customer data cube, about, contact)
- Fixed TT4 page title gap (`.wp-block-post-title, .wp-block-spacer { display: none }`)
- Updated blog page nav/footer with P1 cross-links
- Updated all documentation (CLAUDE.md, AGENTS.md, README.md, architecture, runbook, changelog)

## Success Criteria

- [x] Redesigned homepage live at getpacerai.com
- [x] Primary CTA ("Request a Demo") above the fold
- [x] ARR Snowball use case clearly featured as primary product story
- [x] Navigation with dropdowns (Platform, Solutions, Resources, Partners, Case Studies, Company)
- [x] Full footer with Platform, Use Cases, Comparisons, Company columns
- [x] Mobile-responsive with hamburger nav on phone viewports
- [x] Beaver Builder removed — clean Twenty Twenty-Four theme
- [x] REST API deploy workflow operational
- [x] Platform Overview page live
- [x] ARR Snowball Board Reporting page live (with FAQ schema markup)
- [x] Customer Data Cube page live (with FAQ schema markup)
- [x] About page live (with founder section)
- [x] Contact page live (with form and Calendly)
- [x] All pages cross-linked (nav, footer, content CTAs)
- [x] Blog page nav/footer updated with P1 links
- [ ] Lighthouse Performance score >= 85
- [ ] Lighthouse SEO score >= 90
- [ ] Yoast SEO metadata set for all pages
- [ ] SEO/AEO audit agent built

## Scope — In

- Homepage (`/`)
- Platform Overview (`/platform/overview/`)
- ARR Snowball (`/solutions/arr-snowball-board-reporting/`)
- Customer Data Cube (`/solutions/customer-data-cube/`)
- About (`/company/about/`)
- Contact (`/company/contact/`)
- Blog index (`/blog/`)
- Navigation and footer (shared across all pages)
- Mobile responsive design
- Deploy infrastructure (REST API)
- SEO/AEO optimization (planned)

## Scope — Out (for now)

- P2 pages (Virtual Data Room, Exit Readiness, industry pages, comparison pages)
- P3 pages (remaining use cases, platform sub-pages, resources)
- WordPress theme customization beyond CSS overrides
- Server-side changes (no SSH access on WordPress.com)

## Build Priority Reference

See `docs/plan/site-tree-and-build-prompts.md` for the full site tree (~45 planned pages) and build prompts.

| Priority | Pages | Status |
|----------|-------|--------|
| P0 | Homepage | Done |
| P1 | ARR Snowball, Customer Data Cube, Platform Overview, About, Contact | Done |
| P2 | Virtual Data Room, Exit Readiness, industry pages, comparison pages | Next |
| P3 | Remaining use cases, platform sub-pages, blog expansion, resources | Planned |
| P4 | Legal, careers, partners | Planned |

## Target Audience

| Persona | Title | Company Stage |
|---|---|---|
| Primary | Operating Partner | PE firm, 3-15 portfolio companies |
| Primary | CFO / VP Finance | $50M-$500M ARR SaaS |
| Secondary | Head of RevOps | $50M-$500M ARR SaaS |
| Secondary | CRO | Growth-stage SaaS |

## Design References

- Current design (v2): `docs/design/pacerai-homepage-v2_2026-03-09.html`
- Brand kit: `PacerAI/01_Foundation/pacer-ai-brand-kit.html`
- Original design (v1): `docs/design/pacerai-homepage_by_Claude_030526_1522.html`

## Timeline

| Phase | Owner | Status |
|---|---|---|
| Plan | Will | Done |
| Design | Claude (claude.ai) | Done — mockup approved |
| Build (P0) | Claude Code | Done — homepage live |
| Build (P1) | Claude Code | Done — 5 pages live |
| Review | Will | Done — visual review complete |
| Document | Claude Code | Done — all docs updated |
| Deploy (P0+P1) | Claude Code | Done — 7 pages live |
| Build (P2) | Claude Code | Next |
| Optimize | Claude Code | Planned — SEO/AEO, Lighthouse |
