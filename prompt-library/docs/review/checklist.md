# Prompt Library — QA Checklist

Use this checklist before any deployment or major change.

## Visual

- [ ] Dark theme: glass cards render correctly (backdrop-filter, teal borders)
- [ ] Light theme: solid white cards with navy top-border, no glassmorphism
- [ ] Featured (wide) cards span 2 columns on desktop
- [ ] Hero typed text animates at correct speed (45ms/char)
- [ ] Parallax orb moves on scroll (desktop only)
- [ ] No white cards on dark backgrounds
- [ ] No dark elements bleeding into light theme

## Responsive

- [ ] Desktop (1200px+): 3-column bento grid
- [ ] Tablet (769px–1024px): 2-column grid, wide cards span 2
- [ ] Mobile (≤768px): 1-column grid, all cards full-width
- [ ] Filter pills wrap gracefully on narrow screens
- [ ] Modal is scrollable on small screens

## Interactions

- [ ] Category filter pills: clicking filters cards correctly
- [ ] "All" filter shows all cards
- [ ] Card click opens modal with full prompt text
- [ ] Modal shows: title, category badge, tags, full prompt, variables, source
- [ ] Copy button on card works → "Copied!" feedback (2s)
- [ ] Copy button in modal works → "Copied!" feedback (2s)
- [ ] Modal closes via X button
- [ ] Modal closes via overlay click
- [ ] Modal closes via Escape key

## Accessibility

- [ ] `prefers-reduced-motion`: typed text appears instantly (no animation)
- [ ] `prefers-reduced-motion`: parallax disabled
- [ ] Focus states visible on interactive elements
- [ ] Color contrast meets WCAG AA for text on backgrounds
- [ ] Copy feedback is not color-only (text changes too)

## Data

- [ ] All prompts have required fields: id, title, category, tags, description, prompt, variables, source
- [ ] No duplicate prompt IDs
- [ ] Variables in prompt text match variables array
- [ ] Categories match the defined category registry

## Performance

- [ ] Page loads without console errors
- [ ] No external dependencies (self-contained HTML)
- [ ] Images/fonts load correctly (if any)
- [ ] Clipboard API fallback for HTTP (non-HTTPS) contexts

## Deployment (Public — WordPress)

- [ ] HTML validates (no unclosed tags)
- [ ] CSS scoped to avoid WordPress theme conflicts
- [ ] No `<html>`, `<head>`, `<body>` tags (WordPress injects these)
- [ ] WordPress REST API deploy succeeds
- [ ] Live page renders correctly on getpacerai.com

## Deployment (Client — Platform)

- [ ] React component builds without TypeScript errors
- [ ] Props interface matches data model
- [ ] Workspace scoping works (correct prompts for correct client)
- [ ] CRUD operations function correctly
