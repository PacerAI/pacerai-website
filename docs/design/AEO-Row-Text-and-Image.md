# AEO Row: Text and Image Layout

**Reusable layout component for use case sections, team pages, and any content that pairs a question/heading with explanatory text and a visual.**

---

## Visual Reference

```
┌──────────────────────────────────────────────────────────────────────────┐
│  EYEBROW TEXT (teal, uppercase, 11px)                                    │
│                                                                          │
│  H2 Heading (Cormorant Garamond, 28-44px)                               │
│                                                                          │
│  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  SPACER (16px)  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  │
│                                                                          │
│  ┌─────────────────────────────────┐  ┌──────────────────────────────┐  │
│  │ ┃ AEO Snippet (17px, 300)       │  │                              │  │
│  │ ┃ Teal left border (3px solid)  │  │        PRODUCT IMAGE         │  │
│  │ ┃ Gray text (#94A3B8)           │  │                              │  │
│  │                                  │  │   White bg, 10px radius,    │  │
│  │  Body Text (17px, 300)          │  │   8px padding, drop shadow   │  │
│  │  Gray text (#94A3B8)            │  │                              │  │
│  │  No left border                 │  │                              │  │
│  └─────────────────────────────────┘  └──────────────────────────────┘  │
│           60% width (3fr)                     40% width (2fr)           │
└──────────────────────────────────────────────────────────────────────────┘
```

**Reverse variant** (alternating rows): Image moves to left (40%), text moves to right (60%). Add class `reverse` to `.q-section-layout`. Reversed sections use a darker background (`--navy-mid`) with top/bottom borders.

---

## Structure

### Anatomy

| Element | Class | Purpose |
|---|---|---|
| **Section wrapper** | `.section` | Full-width container, 80px vertical padding |
| **Inner container** | `.section-inner` | Max-width 1280px, centered |
| **Eyebrow** | `.section-eyebrow` | Category label above the heading |
| **Heading** | `h2` | The question or topic |
| **Grid** | `.q-section-layout` | 2-column grid: 3fr (text) / 2fr (image) |
| **Text column** | `.q-content` | Contains AEO snippet + body text |
| **AEO snippet** | `p.aeo-snippet` | Featured-snippet-optimized paragraph with teal left border |
| **Body text** | `.question-body > p` | Supporting paragraph in lighter gray |
| **Image column** | `.q-visual` | Contains the product image |

### Variants

| Variant | Grid | Visual Position | Background | Use |
|---|---|---|---|---|
| **Standard** | `3fr 2fr` | Right | Default (`--navy`) | Odd-numbered sections |
| **Reverse** | `2fr 3fr` + `order: -1` on visual | Left | `--navy-mid` with borders | Even-numbered sections |

---

## HTML Template

### Standard (text left, image right)

```html
<section class="section" data-section="section-name">
  <div class="section-inner">
    <div class="section-eyebrow">EYEBROW TEXT</div>
    <h2>Question or heading text?</h2>
    <div class="q-section-layout">
      <div class="q-content">
        <p class="aeo-snippet">AEO-optimized answer paragraph. This should directly answer the heading question in 2-3 sentences. Targets featured snippets in search engines and AI answer engines.</p>
        <div class="question-body">
          <p>Supporting context paragraph. Explains why this matters, how Pacer AI addresses it, or what the business implication is. Lighter gray text.</p>
        </div>
      </div>
      <div class="q-visual">
        <img src="https://getpacerai.com/wp-content/uploads/2026/04/image-name.png" alt="Descriptive alt text">
      </div>
    </div>
  </div>
</section>
```

### Reverse (image left, text right)

```html
<section class="section" data-section="section-name" style="background:var(--navy-mid);border-top:1px solid var(--navy-border);border-bottom:1px solid var(--navy-border);">
  <div class="section-inner">
    <div class="section-eyebrow">EYEBROW TEXT</div>
    <h2>Question or heading text?</h2>
    <div class="q-section-layout reverse">
      <div class="q-content">
        <p class="aeo-snippet">AEO-optimized answer paragraph.</p>
        <div class="question-body">
          <p>Supporting context paragraph.</p>
        </div>
      </div>
      <div class="q-visual">
        <img src="https://getpacerai.com/wp-content/uploads/2026/04/image-name.png" alt="Descriptive alt text">
      </div>
    </div>
  </div>
</section>
```

---

## CSS Specification

### Text Style (Hero Subtitle Standard)

All body text on the site uses a single unified style matching the hero subtitle. The teal left border on the AEO snippet provides visual hierarchy — no color contrast between the two text blocks is needed.

```
┌─────────────────────────────────────────────┐
│ ┃  AEO Snippet text                         │  ← color: #94A3B8 (--text-mid), 17px, weight 300
│ ┃  Distinguished by teal left border,       │     Teal border = visual hierarchy
│ ┃  not by color difference.                 │
│                                             │
│    Body text below                          │  ← color: #94A3B8 (--text-mid), 17px, weight 300
│    Same color and weight as AEO snippet.    │     No border = supporting text
│    No left border.                          │
└─────────────────────────────────────────────┘
```

- **AEO snippet** (`p.aeo-snippet`): `color: var(--text-mid)` = `#94A3B8`, `font-size: 17px`, `font-weight: 300`, `line-height: 1.7`
- **Body text** (`p.question-body`): `color: var(--text-mid)` = `#94A3B8`, `font-size: 17px`, `font-weight: 300`, `line-height: 1.7`

This matches the hero subtitle (`.hero-sub`) — the canonical body text style for the entire site.

### Colors

| Token | Value | Usage |
|---|---|---|
| `--navy` | `#080E1C` | Default section background |
| `--navy-mid` | `#0F1729` | Reverse section background |
| `--navy-border` | `#1E2A45` | Section top/bottom borders |
| `--teal` | `#27899A` | Eyebrow text, AEO snippet left border |
| `--text-mid` | `#94A3B8` | AEO snippet text + body text (hero subtitle standard) |
| `--white` | `#FFFFFF` | H2 heading, image background |

### Typography

| Element | Font | Size | Weight | Line Height | Color |
|---|---|---|---|---|---|
| **Eyebrow** | DM Sans | 11px | 600 | — | `--teal` |
| **H2** | Cormorant Garamond | `clamp(28px, 4vw, 44px)` | 700 | 1.2 | `--white` |
| **AEO snippet** | DM Sans | 17px | 300 | 1.7 | `--text-mid` (#94A3B8) |
| **Body text** | DM Sans | 17px | 300 | 1.7 | `--text-mid` (#94A3B8) |

### Spacing

| Property | Desktop | Tablet (769-1024px) | Mobile (<768px) |
|---|---|---|---|
| Section padding | `80px 48px` | `80px 24px` | `60px 20px` |
| Section max-width | 1280px | 1280px | 100% |
| Grid gap | 48px | 48px | 32px |
| H2 → grid spacer | `16px` | `16px` | `12px` |
| AEO snippet margin | `24px 0` | `24px 0` | `24px 0` |
| Body text margin-top | 20px | 20px | 20px |
| Eyebrow margin-bottom | 12px | 12px | 12px |
| Eyebrow letter-spacing | 2.5px | 2.5px | 2.5px |

### Grid

| Layout | Desktop | Mobile |
|---|---|---|
| **Standard** | `grid-template-columns: 3fr 2fr` | `grid-template-columns: 1fr` |
| **Reverse** | `grid-template-columns: 2fr 3fr` | `grid-template-columns: 1fr` |
| **Reverse visual order** | `order: -1` (desktop) | `order: 0` (mobile — image below text) |

### AEO Snippet Border

```css
border-left: 3px solid var(--teal);  /* #27899A */
padding-left: 20px;
```

### Image Styling

```css
width: 100%;
height: auto;
max-height: 480px;
object-fit: contain;
display: block;
border-radius: 10px;
background: #fff;
padding: 8px;
box-shadow: 0 2px 12px rgba(0,0,0,0.15);
```

---

## CSS (Copy-Paste Ready)

```css
/* ─── AEO ROW: TEXT AND IMAGE ─── */

#pacerai-homepage .section {
  padding: 80px 48px;
}
#pacerai-homepage .section-inner {
  max-width: 1280px;
  margin: 0 auto;
}
#pacerai-homepage .section-eyebrow {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  color: var(--teal);
  margin-bottom: 12px;
}
#pacerai-homepage .q-section-layout {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 48px;
  align-items: start;
  margin-top: 16px;
}
#pacerai-homepage .q-section-layout.reverse {
  grid-template-columns: 2fr 3fr;
}
#pacerai-homepage .q-section-layout.reverse .q-visual {
  order: -1;
}
#pacerai-homepage .aeo-snippet {
  font-size: 17px;
  font-weight: 300;
  color: var(--text-mid);  /* #94A3B8 — hero subtitle standard */
  line-height: 1.7;
  margin: 24px 0 !important;  /* !important needed to override * reset */
  padding-left: 20px !important;  /* !important needed to override * reset */
  border-left: 3px solid var(--teal);
}
/* NOTE: Live HTML uses <p class="question-body"> not <div class="question-body"><p>.
   Use p.question-body selector, not .question-body p */
#pacerai-homepage p.question-body {
  margin-top: 20px !important;  /* !important needed to override * reset */
  font-size: 17px;
  font-weight: 300;
  color: var(--text-mid);  /* #94A3B8 — hero subtitle standard */
  line-height: 1.7;
}
#pacerai-homepage .q-visual:has(img) {
  background: transparent;
  border: none;
  overflow: visible;
}
#pacerai-homepage .q-visual img {
  width: 100%;
  height: auto;
  max-height: 480px;
  object-fit: contain;
  display: block;
  border-radius: 10px;
  background: #fff;
  padding: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.15);
}

/* Mobile */
@media (max-width: 768px) {
  #pacerai-homepage .section { padding: 60px 20px; }
  #pacerai-homepage .q-section-layout { grid-template-columns: 1fr; gap: 32px; }
  #pacerai-homepage .q-section-layout.reverse .q-visual { order: 0; }
}

/* Tablet */
@media (max-width: 1024px) and (min-width: 769px) {
  #pacerai-homepage .section { padding: 80px 24px; }
}
```

---

## WordPress.com Constraints (CRITICAL — Read Before Building)

When using this layout on WordPress.com:

1. **Use `data-section=` instead of `id=`** — WordPress strips `id` attributes
2. **Keep `<section>` tags** — they render correctly, don't replace with `<div>`
3. **Images must use full WordPress URLs** — not local `img/` paths
4. **No HTML comments** — remove before deploying
5. **Total page must stay under ~69K characters** — each AEO Row adds ~1.5-2K chars
6. **WordPress.com strips ALL inline `<script>` tags** — counter animations, smooth scroll, and mobile nav JS will NOT work. Use WPCode plugin for site-wide JS injection instead.
7. **`#pacerai-homepage *` universal reset zeros margin/padding** — use `!important` on any component-level margin or padding override (e.g., `.question-body`, `.aeo-snippet`)
8. **HTML structure matters for CSS selectors** — if the HTML uses `<p class="question-body">` (the element IS the tag), the CSS selector `.question-body p` will NOT match. Use `p.question-body` instead. Always verify selectors match the actual deployed HTML structure.
9. **Eyebrow + H2 must be OUTSIDE `.q-section-layout` grid** — if placed inside the grid's `.q-content` column, the image aligns with the eyebrow instead of sitting below the heading. Correct structure: `section-inner > eyebrow + h2 + q-section-layout > (q-content + q-visual)`
10. **Always verify CSS changes via browser DevTools** — WordPress caching and the universal reset can silently override your styles. After deploying, inspect the computed color/margin/padding on the live site to confirm they match your CSS.

---

## Usage Pattern (Zigzag)

Alternate standard and reverse rows for visual rhythm:

| Row | Layout | Background |
|---|---|---|
| 1 | Standard (text left, image right) | Default |
| 2 | Reverse (image left, text right) | `--navy-mid` + borders |
| 3 | Standard | Default |
| 4 | Reverse | `--navy-mid` + borders |

This creates a zigzag reading pattern that keeps the eye moving and prevents visual fatigue on long pages.
