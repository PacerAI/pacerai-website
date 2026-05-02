# PacerAI Prompt Library

Interactive, searchable prompt library for GTM teams. Curated AI prompts organized by category and use case. Intended to be published as a lead magnet on getpacerai.com.

## Quick start

Open `index.html` in a browser — no build step, no dependencies. All prompt data is inlined in the HTML (no fetch required, works on `file://`).

## Adding prompts

Prompt data is inlined in `index.html` inside the `const DATA = {...}` block. Also kept in `prompts.json` as the canonical data source for tooling/future use.

Each prompt has:
- `id` — unique slug
- `title` — card headline (displayed as a blue pill badge)
- `category` — matches a category `id`
- `tags` — array of searchable tags
- `source` — where the prompt came from (stored in data, not shown on cards)
- `summary` — 1-2 sentence description (shown on card)
- `prompt` — the full prompt text (shown in expanded modal)
- `variables` — array of placeholder names to fill in

When adding prompts, update both `prompts.json` and the inlined `DATA` in `index.html`.

## Structure

```
prompt-library/
├── index.html      # Self-contained interactive UI (inlined data + PacerAI brand)
├── prompts.json    # Canonical prompt data (JSON)
└── README.md
```

## Categories

| Category | Prompts | Source |
|----------|---------|--------|
| Product Marketing | 3 | Genesys Growth |

## Design

- **Brand**: PacerAI brand kit — navy background (#080E1C), teal accents (#27899A), Cormorant Garamond headings, DM Sans body, Inter UI labels
- **Cards**: White background, blue pill title badges, green tags, teal hover gradient
- **Modal**: Click card to expand — shows full prompt with copy button and variable chips

## Features

- Category filter buttons
- Full-text search (title, tags, summary)
- Click-to-expand prompt cards with modal overlay
- Copy-to-clipboard button
- Variable highlighting chips
- PacerAI branded dark theme with white cards
- Responsive layout
- No dependencies, no build step
