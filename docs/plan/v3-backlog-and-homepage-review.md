# v3 Backlog + Homepage Review — 2026-07-22

## Backlog (tracked follow-ups)

- [ ] **Bone-convert inner pages:** `platform/overview.html` (371), `team/about.html` (374),
      `team/contact.html` (375) — same recipe as blog/team/posts (token remap + bone nav/footer +
      `/resources/` links). *(Requested by Will 2026-07-22.)*
- [ ] **Voice pass** — the 4 draft homepage sections (Case Studies, Integrations, Security, Value)
      and the blog **post bodies** (pre-existing banned words: journey, framework, often, leverage,
      utilize, dynamic, embrace… — block `validate.py --strict`). Editorial, Will-owned.
- [ ] **Deploy prep** (Will-gated, at launch): blank the WPCode Header CSS snippet; paste
      `src/wpcode/footer.js`; deploy `infra/pacer-demo-worker/`; upload `tahoe-bg.jpg`; set the
      `/solutions/*` + legacy `/pricing/` 301s; `deploy.py 25 230 366 …`; tag `v3.0.0`.

---

## Homepage review — recommendations

Reviewed the live preview (`docs/design/homepage/index-build-bone_v3_2026-07-22.html`). Current
section order: Hero → Proof → Demo → Steps → How It Works → **Value tiles** → **Use Cases** →
Case Studies → Integrations → Security → **Team** → **Value (ROI)** → **Pricing** → FAQ → CTA.

### 1. Section order (highest-leverage change)
The page shows the **solution before the problem**. The Use Cases section ("what CROs hire us to
fix", mined from 30 job descriptions) is the strongest problem-framing on the page but sits at
position ~7, *after* the demo, how-it-works, and value tiles. Landing pages convert better with
**tension first**: Hook → Problem → Solution → Proof → Business case → Trust → Team → Pricing.

Also: there are **two "value" sections** — the value *tiles* (Deterministic / Reconciled /
Board-grade) and the *Value* section (TCO / ROI / Time). Two things called "value" reads as
redundant.

**Recommended order:**
1. Hero → 2. Proof (logos/stats) → 3. **Use Cases (the problem)** → 4. Demo showcase →
5. How It Works → 6. Value tiles → *rename* **"Why it's different"** → 7. Case Studies →
8. **Value/ROI** → *rename* **"The business case"** → 9. Integrations + Security (trust) →
10. Team → 11. Pricing → 12. FAQ → 13. CTA. Add a **mid-page CTA** after Case Studies (only CTA
today is at the very bottom).

### 2. Use Cases — *keep, it's the best section*
The "we read 30 CRO/VP RevOps job descriptions, Jan–Jul 2026 … in their own words" + "X of 30
postings" is specific, credible, and differentiated. Two refinements:
- Each card is a **pure problem**. Add a one-line **"→ how Pacer fixes it"** per card (or a
  transition line into the demo), so it hands off to the solution instead of just listing pain.
- Move it up (see order). It's a hook, not a mid-page feature.

### 3. Team — too thin
A single sentence reads as an afterthought on a homepage. Cheap, high-credibility adds:
- **Will's headshot** (already in WP media) + 2–3 credibility chips (ex-PwC M&A · West Point ·
  $25B+ diligence) for a visual anchor.
- An **"advisory network" strip** (Veach.AI QoE · Weighbridge Tech DD · Inside Consulting ·
  Charlie Mike RevOps · Modern Revenue) — a real differentiator (you field an M&A-grade bench,
  not just software) and it's low-text. Links to `/team/`.
- One line of *why it matters*: "Built by the people who ran the diligence — not just the software."

### 4. Pricing — the copy is circular
"Pacer AI uses an alignment-based pricing model **to align** Pacer AI with its clients' goals" is a
tautology (aligns → to align) and lets no one self-qualify. Make it concrete:
- Say **what "alignment-based" means**: priced against value/scale (e.g. a share of revenue under
  management), **no seat licenses, no per-user fees** — "when you grow, we grow." (Straight from
  `foundation/pricing/…`: 10 bps LTM Rev / $7K floor; the FAQ already says "no seat licenses.")
- Add the **engagement shape** so a buyer knows the on-ramp: **Diagnostic → Data Cube → ongoing
  reporting.** Even without a number, structure builds trust. A "starts at" anchor would be stronger.
- Fix the **same tautology in the FAQ** pricing answer (keep the two consistent).

### 5. Value (TCO / ROI / Time) — sharpen with numbers
Generic today ("one engagement, not a team" / "at a fraction" / "days not months"). Use your own
proof:
- **TCO:** "Replaces a **$1M+ internal data team**, a BI stack, and Big 4 QoR fees" (your own CFO
  quote says $1M / 12 months).
- **ROI:** anchor to the Big 4 benchmark — "board-grade ARR intelligence at a fraction of a
  **$200–600K** Big 4 QoR" (per `product-pricing-portfolio.md`).
- **Time:** "Days, not a 6–12 month build — and **updated daily**" (ties to the "30 minutes, not
  30 hours" line).
- **Rename** the section header from "Value" → **"The business case"** / **"Why it pays off"** to
  distinguish it from the value *tiles*. Echo the $1M/12-month number from the case-study quote.

### 6. Anything else
- **ICP consistency:** the page addresses "Sales Leaders" (hero), "CROs and RevOps leaders" (use
  cases), and "CFOs / Operating Partners" (blog). Pick a **primary** ICP and lead with it
  consistently; name secondary audiences, don't co-headline them. *(Strategy call — Will's.)*
- **Draft sections** (Case Studies / Integrations / Security / Value) still need a content+voice
  pass: real case-study proof (2–3 outcomes/logos), integration **logos** (not just text),
  concrete security specifics.
- **Marquee:** "Brandwatch" shows twice in one viewport (the seamless-loop duplication) — add more
  logos or widen the gap so it doesn't read as a repeat.
- **Mobile pass** not yet reviewed — verify nav collapse + grid stacking on a phone width.
- **Demo caption:** add a one-liner under the showcase ("Pacer AI planning a number, live in
  Claude") so the iframe isn't unlabeled.
