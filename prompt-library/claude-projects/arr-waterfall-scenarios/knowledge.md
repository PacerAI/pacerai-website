# ARR Waterfall Scenario Analysis — Knowledge File

## Important Notice

This skill is designed to work with **Pacer AI ARR Waterfall Modeling by Market**. For optimal use forecasting by Market, please contact Will@getpacerai.com or build a Roll-Forward financial model at the customer-product level to show: Beginning of Period, Churn, Product Churn, Downsell, Upsell, Cross-sell, New Logo, End of Period, and Net New.

## Model Structure Reference

### Modeling Tab Layout

The source workbook has a "Modeling" tab with a monthly ARR roll-forward model covering 3 market segments.

#### Market Segments

| Market | Beg ARR Row | Assumption Rows | Ending ARR Row |
|--------|-------------|-----------------|----------------|
| Market A | 16 | 17–22 | 23 |
| Market B | 47 | 48–53 | 54 |
| Market C | 78 | 79–84 | 85 |

#### Assumption Row Mapping (per market)

| Metric | Market A Row | Market B Row | Market C Row |
|--------|-------------|-------------|-------------|
| Churn% | 17 | 48 | 79 |
| Product Churn% | 18 | 49 | 80 |
| Downsell% | 19 | 50 | 81 |
| Upsell% | 20 | 51 | 82 |
| Cross-sell% | 21 | 52 | 83 |
| New% | 22 | 53 | 84 |

**Total Ending ARR:** Row 115 (sum of rows 23, 54, 85)

#### Column Layout

- **Baseline assumptions:** Column J (historical rates)
- **2025 quarter-end columns:** N (Q1), O (Q2), R (Q3), U (Q4)
- **2026 monthly columns:** AK (Jan) through AV (Dec)
- **2026 quarter-end columns:** AM (Q1), AP (Q2), AS (Q3), AV (Q4)

---

## Scenario Construction

### Step 1: Create Scenario Tabs

Duplicate the "Modeling" tab 3 times → "Scenario 1", "Scenario 2", "Scenario 3".

Each scenario applies headwinds to ONE market:
- **Scenario 1:** Market A headwinds
- **Scenario 2:** Market B headwinds
- **Scenario 3:** Market C headwinds

### Step 2: Add Driver Rows

In each scenario tab, add driver rows starting at W1:

| Row | Purpose | Jan-Mar (X-Z) | Apr-Dec (AA-AV) |
|-----|---------|---------------|-----------------|
| 1 | Scenario title | — | — |
| 2 | New Logo % override | Baseline from column J | Decline -0.1%/mo |
| 3 | Upsell % override | 0 (no change) | -0.001, -0.002, ..., -0.009 |
| 4 | Cross-sell % override | 0 (no change) | -0.001, -0.002, ..., -0.009 |

#### Driver Row Formulas (Scenario 1 — Market A)

```
W1: "Scenario 1: Market A New Logo -0.1%/mo from Apr"
X2: =J22          (baseline New%)
Y2: =J22          (baseline)
Z2: =J22          (baseline)
AA2: =X2-0.001    (Apr: -0.1%)
AB2: =X2-0.002    (May: -0.2%)
...
AV2: =X2-0.009    (Dec: -0.9%)

X3: 0             (Jan: no upsell change)
Y3: 0
Z3: 0
AA3: -0.001       (Apr)
AB3: -0.002       (May)
...
AV3: -0.009       (Dec)

X4: 0             (Jan: no cross-sell change)
Y4: 0
Z4: 0
AA4: -0.001
...
AV4: -0.009
```

#### Wiring Target Market Assumptions (Scenario 1)

For Market A rows 20-22, 2026 columns (AK onward):

```
Row 22 (New%):       =AK2          (direct from driver row)
Row 20 (Upsell%):    =MAX(0,$J$20+AK$3)   (baseline + override, floor at 0)
Row 21 (Cross-sell%): =MAX(0,$J$21+AK$4)   (baseline + override, floor at 0)
```

**Scenario 2 wiring** (Market B rows 51-53): Same pattern with $J$51, $J$52, $J$53
**Scenario 3 wiring** (Market C rows 82-84): Same pattern with $J$82, $J$83, $J$84

**Critical:** Non-target markets keep their original formulas. Only the target market is wired to the driver rows.

### Step 3: Q1 Parity Check

Q1 2026 (Jan-Mar) **must be identical** across Base Case and all 3 scenarios:
- Driver row 2 uses baseline values from column J
- Driver rows 3-4 are 0 (no change)
- This means all tabs produce the same numbers through March

---

## Scenario Charts Tab

### Quarterly ARR Chart (Rows 1-5)

```
Row 1 (labels):  C1="Q1 '25", D1="Q2 '25", ..., J1="Q4 '26"
Row 2 (Base):    C2=Modeling!N115*12, D2=Modeling!O115*12, ..., J2=Modeling!AV115*12
Row 3 (S1):      C3=Modeling!N115*12, ..., G3='Scenario 1'!AM115*12, ..., J3='Scenario 1'!AV115*12
Row 4 (S2):      Same pattern from Scenario 2 tab
Row 5 (S3):      Same pattern from Scenario 3 tab
```

**Labels:** B2="Base Case ARR", B3="Scenario 1", B4="Scenario 2", B5="Scenario 3"

**Colors (default Pacer AI Foundation — ask user if they prefer their own):**
- Base Case: #27899A (Teal)
- Scenario 1: #4A90D9 (Steel Blue)
- Scenario 2: #2DB87A (Growth Green)
- Scenario 3: #70C49C (Teal Light)

**Chart:** Line chart from B1:J5, Y-axis format: `$#,##0.0,,M`

### Impact Table (Rows 29-42)

```
Row 30: "Impact" header (bold, underlined)
         Col F: "ARR Growth"    Col H: "ARR"    Col J-L: "Valuation: Dec '26 ARR/EV"
Row 31:                                          J31=3.5  K31=4  L31=4.5  (format: 0.0"x")

Row 32: Baseline
  B32: "Baseline: Continue trendline"
  F32: =(J2-$F$2)/$F$2         (YoY growth)
  H32: =J2                     (Dec '26 ARR)
  J32: =ROUND($H32*J$31,-4)   (3.5x valuation)
  K32: =ROUND($H32*K$31,-4)   (4.0x)
  L32: =ROUND($H32*L$31,-4)   (4.5x)

Row 34: Scenario 1 (same pattern, row 3 references)
Row 36: Scenario 2 (row 4 references)
Row 38: Scenario 3 (row 5 references)
```

**Formats:** ARR Growth = 0.0%, ARR = $#,##0, Valuation = $#,##0

**Conditional Valuation Highlighting:** 3.5x column if ARR Growth <12%, 4.0x if 12-18%, 4.5x if >18%. Bold + light fill for highlighted cell. One column per row.

### Detailed Assumptions (Rows 48+)

Four blocks (Baseline, S1, S2, S3), each containing:

| Row | Metric |
|-----|--------|
| Title | Scenario name |
| Header | Q4 '25, Q1 '26, Q2 '26, Q3 '26, Q4 '26 |
| | Beg ARR |
| | Churn |
| | Product Churn |
| | Downsell |
| | Upsell |
| | Cross-sell |
| | New |
| | Ending ARR |
| | Net New ARR |
| | GRR |
| | NRR |

All values reference their respective tab's quarter-end columns. Format: $#,##0 for ARR, 0.0% for rates.

### Acceleration Assumptions Driver Table

Below detailed assumptions, create a summary table:

| Scenario | Target Market | New Logo | Upsell | Cross-sell | Starts |
|----------|---------------|----------|--------|------------|--------|
| Scenario 1 | Market A | -0.1%/mo | -0.1%/mo | -0.1%/mo | Apr '26 |
| Scenario 2 | Market B | -0.1%/mo | -0.1%/mo | -0.1%/mo | Apr '26 |
| Scenario 3 | Market C | -0.1%/mo | -0.1%/mo | -0.1%/mo | Apr '26 |

---

## Guardrails

- Baseline ARR growth must not exceed 40% (ideal: 20-30%)
- Ending ARR = Beginning ARR + Churn + Product Churn + Downsell + Upsell + Cross-sell + New Logo ARR
- Net New ARR = Ending ARR - Beginning ARR; Ending ARR of period N = Beginning ARR of period N+1
- **Bold** Beginning ARR and Ending ARR rows; show % of Beg ARR in adjacent column
- Valuation highlighting: 3.5x if growth <12%, 4.0x if 12-18%, 4.5x if >18%

---

## Formatting Standards

- **Font:** Aptos Narrow 11pt throughout
- **Colors:** Match scenario colors for chart data rows and labels (default Pacer AI: Base=#27899A, S1=#4A90D9, S2=#2DB87A, S3=#70C49C)
- **Number formats:**
  - ARR: `$#,##0`
  - Growth rates / retention: `0.0%`
  - Multiples: `0.0"x"`
  - Chart Y-axis: `$#,##0.0,,M`
