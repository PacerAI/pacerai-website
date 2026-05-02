# Prompt Library — Architecture

## Data Model

### Prompt Schema (prompts.json)

```json
{
  "id": "unique-slug",
  "title": "Human-readable title",
  "category": "product-marketing",
  "tags": ["competitive-analysis", "positioning"],
  "description": "One-line summary for card display",
  "prompt": "Full prompt text with {{variable}} placeholders",
  "variables": ["variable_name"],
  "source": "Attribution string",
  "optimized": false,
  "requires_data_connection": false
}
```

**Field definitions:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string | Yes | URL-safe slug, unique across all prompts |
| `title` | string | Yes | Display title (max 60 chars) |
| `category` | string | Yes | One of: `product-marketing`, `arr-analysis`, `growth-metrics`, `board-reporting`, `data-quality`, `customer-success` |
| `tags` | string[] | Yes | 1-5 tags for secondary filtering |
| `description` | string | Yes | Card summary (max 120 chars) |
| `prompt` | string | Yes | Full prompt text. Variables as `{{name}}` |
| `variables` | string[] | Yes | List of variable names (can be empty `[]`) |
| `source` | string | Yes | Attribution (e.g., "Pacer AI", "Genesys Growth") |
| `optimized` | boolean | No | `true` for client-only prompts with meta-cognition |
| `requires_data_connection` | boolean | No | `true` if prompt references connected data |

### Category Registry

Categories are hard-coded in the brand component and prototype. To add a new category:

1. Add to `prompts.json` data
2. Update filter pill arrays in both `index.html` and brand component
3. Add matching CSS color if needed
4. Update this document

## Component Architecture

### Brand Component (Design Reference)

**File:** `/01_Foundation/brand/components/component-prompt-library.html`

Self-contained HTML file with inlined CSS and JavaScript. Demonstrates both dark and light themes in a single scrollable page.

**Sections:**
1. **Hero** — Typed text animation ("Paste from our prompt library..."), parallax orb, subtitle
2. **Filter row** — Category pills (All + 6 categories)
3. **Bento grid** — 3-column asymmetric layout with featured (wide) cards
4. **Modal overlay** — Full prompt text, tags, variables, copy button

**CSS architecture:**
- Dark container: `#pl-bento` — scoped ID selectors
- Light container: `#pl-bento-light` inside `.light-theme` wrapper
- Tokens: CSS custom properties from `:root` (shared across all brand components)
- Responsive: 1 col @ 768px, 2 col @ 1024px, 3 col @ desktop

**JavaScript:** Single IIFE with:
- Typed text animation × 2 (dark + light)
- Parallax orb × 2
- `renderFilters()` + `renderGrid()` for both themes
- `openModal()` / `closeModal()` + Escape key
- `copyPrompt()` / `copyPromptById()` — clipboard API + feedback

### Prototype (index.html)

Current standalone page with dark navy background. Loads `prompts.json` via fetch. Includes search input, category filter, modal, and copy-to-clipboard.

### Client Component (PromptLibrary.tsx)

React component at `/02_Platform/client-TDS/clientTDS-chat/src/components/PromptLibrary.tsx`. Currently basic — will be enhanced with:
- Bento grid layout matching brand component
- Workspace-scoped prompt loading via API
- CRUD operations for custom prompts
- Folder organization

## Integration Points

```
01_Foundation/brand/components/component-prompt-library.html
    ↓ (design reference for)
    ├── 04_GTM/prompt-library/index.html (public prototype)
    ├── 04_GTM/website-PacerAI/src/resources/prompt-library.html (public deploy)
    └── 02_Platform/client-TDS/.../PromptLibrary.tsx (client deploy)
```

## Copy-to-Clipboard Pattern

All deployment targets use the same clipboard pattern:

```javascript
async function copyPrompt(text, buttonEl) {
  await navigator.clipboard.writeText(text);
  buttonEl.textContent = 'Copied!';
  buttonEl.style.background = 'rgba(112,196,156,0.3)';
  setTimeout(() => {
    buttonEl.textContent = 'Copy Prompt';
    buttonEl.style.background = '';
  }, 2000);
}
```
