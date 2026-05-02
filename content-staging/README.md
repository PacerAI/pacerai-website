# Content Staging — GTM → Website Handoff

This directory is the handoff point between `pacerai-gtm` (content production) and `pacerai-website` (WordPress publishing).

## How it works

1. **GTM drafts content** in `pacerai-gtm/plays/content-gen/drafts/` and `pacerai-gtm/outputs/`
2. **Approved content is copied here** for website review and formatting
3. **Website team reviews, formats for WordPress**, and publishes via REST API
4. **Published content is removed** from staging (it lives in WordPress now)

## Directory Structure

```
content-staging/
├── blog/           # Blog posts ready for WordPress publish
├── solutions/      # Solution page updates
├── one-pagers/     # One-pager HTML for gated download
└── social/         # Social media assets (LinkedIn carousel images, etc.)
```

## Staging Workflow

1. Copy approved draft from `pacerai-gtm/` into the matching subdirectory
2. Format for WordPress (add meta tags, structured data, internal links)
3. Preview locally with `npm run dev`
4. Publish via WordPress REST API using deploy scripts
5. Delete the staged file after successful publish

## Rules

- **Never edit GTM drafts in place.** Copy to staging, then modify for WordPress
- **Every staged file needs metadata:** title, slug, category, publish date, meta description
- **Blog posts use the build template** at `src/blog/posts/` — follow the existing pattern
- **Voice compliance required** before publish — run the voice self-test from `foundation/brand/voice-profile.md` Section 9
