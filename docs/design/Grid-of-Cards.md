# Grid of Cards Layout

**Reusable layout component for navigation grids — clickable cards with icons, text, and arrows. Used for use case questions, solution cards, feature grids, or any set of linked items.**

---

## Visual Reference

```
                        EYEBROW (teal, uppercase, centered)

          H2 Heading (Cormorant Garamond, centered)

          Description text (gray, centered, max-width 640px)

┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐
│  ┌────┐              │  │  ┌────┐              │  │  ┌────┐              │
│  │ 📈 │  icon box    │  │  │ 🚀 │              │  │  │ 🔄 │              │
│  └────┘              │  │  └────┘              │  │  └────┘              │
│                      │  │                      │  │                      │
│  Question text       │  │  Question text       │  │  Question text       │
│  (19px, bold, white) │  │                      │  │                      │
│                      │  │                      │  │                      │
│  →  (teal arrow)     │  │  →                   │  │  →                   │
└──────────────────────┘  └──────────────────────┘  └──────────────────────┘

┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐
│  ┌────┐              │  │  ┌────┐              │  │  ┌────┐              │
│  │ 🛡 │              │  │  │ 📊 │              │  │  │ 🎯 │              │
│  └────┘              │  │  └────┘              │  │  └────┘              │
│                      │  │                      │  │                      │
│  Question text       │  │  Question text       │  │  Question text       │
│                      │  │                      │  │                      │
│  →                   │  │  →                   │  │  →                   │
└──────────────────────┘  └──────────────────────┘  └──────────────────────┘

                    "See our solutions →" (teal link)
```

---

## Structure

### Anatomy

| Element | Class | Purpose |
|---|---|---|
| **Section wrapper** | `.section` | Full-width container, centered text |
| **Inner container** | `.section-inner` | Max-width 1280px, `text-align: center` |
| **Eyebrow** | `.section-eyebrow` | Category label (centered) |
| **Heading** | `h2` | Section title, may include `<em>` for italic accent |
| **Description** | `p` (inline styled) | Supporting text, 17px, gray, max-width 640px, centered |
| **Grid** | `.question-nav-grid` | 3-column responsive grid |
| **Card** | `a.question-nav-card` | Clickable glass-morphism card |
| **Icon** | `.q-icon` | Emoji in a rounded square container |
| **Text** | `.q-text` | Question or label text |
| **Arrow** | `.q-arrow` | Teal arrow indicator, animates on hover |
| **Bottom link** | `a` (inline styled) | Optional "See more" link below grid |

---

## HTML Template

```html
<section class="section" data-section="section-name">
  <div class="section-inner" style="text-align:center;">
    <div class="section-eyebrow" style="text-align:center;">EYEBROW</div>
    <h2>Heading text. <em>Italic accent.</em></h2>
    <p style="font-size:17px;color:var(--text-mid);max-width:640px;line-height:1.7;margin:18px auto 0;">
      Description paragraph centered below the heading.
    </p>

    <div class="question-nav-grid">
      <a href="#" data-scroll-to="target-1" class="question-nav-card">
        <div class="q-icon">&#128200;</div>
        <div class="q-text">Card label or question text</div>
        <div class="q-arrow">&rarr;</div>
      </a>
      <a href="#" data-scroll-to="target-2" class="question-nav-card">
        <div class="q-icon">&#128640;</div>
        <div class="q-text">Card label or question text</div>
        <div class="q-arrow">&rarr;</div>
      </a>
      <a href="#" data-scroll-to="target-3" class="question-nav-card">
        <div class="q-icon">&#128260;</div>
        <div class="q-text">Card label or question text</div>
        <div class="q-arrow">&rarr;</div>
      </a>
      <!-- Add more cards as needed — grid wraps automatically -->
    </div>

    <div style="margin-top:36px;">
      <a href="#" style="color:var(--teal);font-size:15px;font-weight:500;text-decoration:none;transition:color 0.2s;">
        See more &rarr;
      </a>
    </div>
  </div>
</section>
```

---

## CSS Specification

### Glass Morphism Effect

| Property | Value | Purpose |
|---|---|---|
| `background` | `rgba(15, 25, 41, 0.6)` | Semi-transparent dark blue |
| `backdrop-filter` | `blur(16px)` | Frosted glass blur |
| `-webkit-backdrop-filter` | `blur(16px)` | Safari support |
| `border` | `1px solid rgba(39, 137, 154, 0.15)` | Subtle teal border |
| `border` (hover) | `1px solid rgba(39, 137, 154, 0.35)` | Brighter teal on hover |
| `box-shadow` | `0 8px 32px rgba(0, 0, 0, 0.3)` | Depth shadow |
| `box-shadow` (hover) | `0 12px 48px rgba(0, 0, 0, 0.4), 0 0 30px rgba(39, 137, 154, 0.08)` | Elevated + teal glow |
| `border-radius` | `14px` | Rounded corners |

### Icon Container

| Property | Value |
|---|---|
| Size | `52px × 52px` |
| Font size | `28px` (emoji) |
| Background | `rgba(39, 137, 154, 0.08)` |
| Border | `1px solid rgba(39, 137, 154, 0.12)` |
| Border radius | `12px` |
| Display | `flex`, centered |

### Typography

| Element | Font | Size | Weight | Color | Line Height |
|---|---|---|---|---|---|
| **Eyebrow** | DM Sans | 11px | 600 | `--teal` (#27899A) | — |
| **H2** | Cormorant Garamond | `clamp(28px, 4vw, 44px)` | 700 | `--white` | 1.2 |
| **H2 `<em>`** | Cormorant Garamond | inherited | 700 | `--teal-light` (#70C49C) | — |
| **Description** | DM Sans | 17px | 400 | `--text-mid` (#94A3B8) | 1.7 |
| **Card text** | Cormorant Garamond | 19px | 700 | `--white` | 1.3 |
| **Arrow** | — | 14px | — | `--teal` (#27899A) | — |

### Grid

| Breakpoint | Columns | Gap |
|---|---|---|
| Desktop (>1024px) | `repeat(3, 1fr)` | 20px |
| Tablet (769–1024px) | `repeat(2, 1fr)` | 20px |
| Mobile (<768px) | `1fr` | 20px |

### Card Spacing

| Property | Value |
|---|---|
| Padding | `32px 28px` |
| Flex direction | `column` |
| Gap (between icon, text, arrow) | `12px` |
| Grid margin-top | `48px` |
| Arrow margin-top | `auto` (pushes to bottom) |

### Hover Transitions

| Element | Property | Duration | Effect |
|---|---|---|---|
| **Card** | `border-color, box-shadow, transform` | `0.3s` | Lifts 4px, border brightens, shadow deepens + glow |
| **Arrow** | `transform` | `0.2s` | Slides right 4px |

---

## CSS (Copy-Paste Ready)

```css
/* ─── GRID OF CARDS ─── */

#pacerai-homepage .question-nav-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 48px;
}

#pacerai-homepage .question-nav-card {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
  border-radius: 14px;
  padding: 32px 28px;
  text-decoration: none;
  cursor: pointer;
  transition: border-color 0.3s, box-shadow 0.3s, transform 0.3s;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

#pacerai-homepage .question-nav-card:hover {
  border-color: var(--glass-border-hover);
  box-shadow: var(--glass-shadow-hover), 0 0 30px rgba(39,137,154,0.08);
  transform: translateY(-4px);
}

#pacerai-homepage .question-nav-card .q-icon {
  font-size: 28px;
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(39,137,154,0.08);
  border: 1px solid rgba(39,137,154,0.12);
  border-radius: 12px;
}

#pacerai-homepage .question-nav-card .q-text {
  font-family: var(--font-heading);
  font-size: 19px;
  font-weight: 700;
  color: var(--white);
  line-height: 1.3;
}

#pacerai-homepage .question-nav-card .q-arrow {
  font-size: 14px;
  color: var(--teal);
  margin-top: auto;
  transition: transform 0.2s;
}

#pacerai-homepage .question-nav-card:hover .q-arrow {
  transform: translateX(4px);
}

/* Responsive */
@media (max-width: 1024px) and (min-width: 769px) {
  #pacerai-homepage .question-nav-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  #pacerai-homepage .question-nav-grid {
    grid-template-columns: 1fr;
  }
}
```

---

## WordPress.com Constraints

1. **Use `data-scroll-to=` on card links** instead of `href="#id"` — WordPress strips `id` attributes from targets
2. **Keep `<section>` tags** — they render correctly
3. **Emoji icons work** — no need to upload icon images
4. **Each card is ~200 chars** — a 6-card grid adds ~1.5K to page size
5. **No HTML comments** — remove before deploying

---

## Variations

### 3-card row (single row)
Set grid to `repeat(3, 1fr)` with only 3 cards — no wrapping.

### 4-card row
Use `repeat(4, 1fr)` for a tighter 4-across layout (e.g., solution categories).

### Cards without icons
Omit the `.q-icon` div — the card still works with just `.q-text` and `.q-arrow`.

### Cards with descriptions
Add a `<p>` element after `.q-text` for a short description:
```html
<a class="question-nav-card" ...>
  <div class="q-icon">&#128200;</div>
  <div class="q-text">Card Title</div>
  <p style="font-size:17px;font-weight:300;color:var(--text-mid);line-height:1.7;">Short description text.</p>
  <div class="q-arrow">&rarr;</div>
</a>
```
