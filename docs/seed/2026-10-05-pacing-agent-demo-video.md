# Seed — Pacing Agent demo video ("pace" → "gap")

**Date:** 2026-10-05 · **Owner:** Will Sullivan · **Captured verbatim.** This is the parent of the plan to archive the
Planning Agent demo video and build the Pacing Agent one. Do not clean it up.

> **Related docs**
> **Role:** the Seed. **Upstream:** [`../../goals/email-capture.md`](../../goals/email-capture.md) ·
> **Downstream:** [`../design/demo-vids/README.md`](../design/demo-vids/README.md) ·
> [`../plan/2026-10-05-make-plan-messaging.md`](../plan/2026-10-05-make-plan-messaging.md) ·
> worker variants in [`../../infra/pacer-demo-worker/src/staging.ts`](../../infra/pacer-demo-worker/src/staging.ts).
> **Decisions taken while planning (2026-10-05):** one dummy dataset drives both the homepage "Why Pacer AI exists"
> chart and the video; chart titles stay exactly as the live MCP tool renders them (the tool is not changed); after
> staging review the pacing video replaces the planning video on the homepage.

---

Make a plan to save the existing video (html presentation) that runs on getpacerai.com and create a new one that shows a user type pace and gap into claude that is connected to pacer ai. For Conext my go to market motion is a product led growth motion where a user can access a free demo of my pacing agent which gets me their email address as they enter it to getpacerai.com/demo-connect where I will follow up with them with the intent of landing the user with Pacing Agent and cross-sell them Planning agent which the website getpacerai.com currently shows.

tasks:
- add this prompt to /Users/willsullivan/Documents/pacerai/pacerai-website/docs/seed
- Create docs/design/demo-vids
- create a:
"planning-agent_2026_10_04" which has the existing html presentation aka demo vid on the current live website where the demo starts with "

```
Help me build a plan to go from $100M ARR in 2025 to $150M ARR in 2027
PACER AI
I have your company financials.
Here’s our 3 step plan:
Set target ARR Growth rates
Breakout ARR Growth drivers of Upsell and Cross-sell
Conduct a bottoms-up build by market to Net New ARR targets
```

"

- create a "pacing-agent_2026_10_04" that needs to be made where a user types
Pace
and claude responds with pacer ai mcp tool /Users/willsullivan/Documents/pacerai/pacerai-platform-claude-native/mcp/pacer_intake_mcp/tools/pace
using dummy data for Sep 20th 2026 so it ties with the chart in the why pacer ai exists.
Pace show
chart Pace to Month - Sep 2026 (Day 20 of 31)
chart Pace to Quarter - Q3 2026 (Day 82 of 92)
chart Pace to Plan - Sep 2026

commentary similar to

```
As of September 20, 2026, the book is behind plan on all three horizons, and the cause is the same each time: thin expansion from existing customers. The source is the live Salesforce org.

Pacing summary

Horizon	Booked	Plan to date	Variance	Forecast landing	Target	Forecast shortfall
Month (day 20 of 30)	$64K	$89K	🔴 −$25K	$64K	$133K	−$69K
Q3 (day 82 of 92)	$241K	$356K	🔴 −$115K	$241K	$400K	−$159K
Year (cumulative ARR)	$7.9M	$8.1M	🔴 −$222K	$8.2M	$8.5M	−$327K

How to read this: "Plan to date" is the annual target spread evenly across the year and prorated to today. The target is $8.5M, which is 1.23× the $7.0M book at the start of the fiscal year, or $133K of net-new ARR per month. "Forecast landing" is booked ARR plus weighted open pipeline. The month and quarter forecasts match booked ARR, so nothing weighted is expected to close before those periods end.

The month: September

There was one new logo this month, worth $31K. The other $33K came from renewals. Of that, $20K came from a single account (100272, on Sept 20), so take that account out and the month is close to flat.

Account	Renews	Current ARR	Renewed Amount
100210	09-01	$38K	$39K (+$1K)
100166	09-04	$13K	$13K (+$0K)
100081	09-05	$25K	$30K (+$5K)
100125	09-05	$25K	$28K (+$3K)
100269	09-05	$12K	$13K (+$1K)
100082	09-09	$25K	$24K (−$1K)
100211	09-09	$13K	$15K (+$2K)
100270	09-10	$13K	$14K (+$1K)
100083	09-13	$63K	$66K (+$3K)
100126	09-15	$47K	$45K (−$2K)
100271	09-15	$13K	$13K (−$0K)
100272	09-20	$40K	$60K (+$20K)
New booking	Closed	Amount
100311	09-12	$31K

The quarter: Q3

Q3 has 10 days left and $159K of uncovered target. Nothing weighted in the pipeline closes before the quarter ends, so there is no realistic path to the $400K Q3 target. The more useful goal now is to take as much of the gap as possible into Q4 with deals already in motion.

The year: the Go-Get

The Go-Get is the forecast gap: the target minus booked ARR minus weighted open pipeline. It is $327K, and it is the number that actually needs closing. It differs from the $666K gap to target because that larger figure double-counts pipeline that is already in flight.

Year to date, new logos have brought in $779K of net-new ARR, while existing customers have added only $154K. That expansion figure is about 2% of the $7.0M starting book. In a 23% growth plan, existing customers usually carry much more of the weight. That makes expansion the larger lever for closing the gap.

Two motions can close the $327K:

Customer-base expansion: a list of accounts up for renewal, ranked by cross-sell and upsell potential.
New-logo acquisition: look-alike prospects plus warm re-entries through champions who have moved companies, scored against your closed-won deals.

I can pull either of those lists, or break the pace down by market, segment, vintage, or technographic.
```

Would you like to see details to help you close the gap? Just type "gap"

[create a spreadsheet]
-----

the user types
gap
Chart: Expansion Whitespace renewing Sep 2026

Text that similar to the follow but to close the gap for Sep 2026 as of Sep 20th

```
The two motions together could close the $327K gap, but only if nearly everything converts. Existing customers who renew this fiscal year have about $126K of room to buy more. The ten look-alike new prospects add up to $293K of indicative annual contract value, before any win rate is applied.

Motion 1: Customer-base expansion (accounts renewing in FY2026)

"White space" here is how much more an account could buy if it had every product, each at the same seat count as its main subscription. These are the top 12 accounts by that measure:

Account	White space	Under contract	White space as % of contract
100179	$15K	$27K	56%
100276	$15K	$41K	37%
100026	$15K	$36K	42%
100278	$12K	$30K	40%
100020	$11K	$31K	35%
100215	$10K	$33K	30%
100287	$9K	$33K	27%
100096	$9K	$19K	47%
100023	$8K	$49K	16%
100289	$8K	$21K	38%
100277	$7K	$15K	47%
100098	$7K	$64K	11%
Total	$126K	$399K	32%

How to read the last column: the higher the percentage, the more of that account is still left to sell. 100179, 100096 and 100277 can buy roughly half again what they pay today. 100098 is your biggest contract on the list but has the least room left.

Motion 2: New-logo acquisition

Pacer found two kinds of prospects:

Look-alikes: ten prospects that resemble your current customers, worth $293K of indicative annual contract value.
Moved champions: eight people who bought from you at a customer and have since moved to one of those prospects.

The second list is the more useful one: all eight champions now sit at one of those look-alike prospects. Those eight warm accounts are worth about $206K and should be worked first, because a past buyer opens the door:

Priority	Prospect	Indicative annual contract value	Warm contact
1	Silverlake Software	$29K	Casey Ivanov, Head of RevOps (ex-Riverstone)
1	Lakeside Technologies	$29K	Cameron Flores, VP Revenue (ex-Foxglove)
1	Harborview Industries	$29K	Jordan Okafor, VP Revenue (ex-Norwood)
2	Brightpath Analytics	$27K	Avery Cohen, VP Finance (ex-Hollowell)
3	Quarry Labs	$23K	Parker Lindqvist, Head of RevOps (ex-Maplewood)
3	Larkspur Analytics	$23K	Finley Lindqvist, VP Revenue (ex-Eastgate)
3	Ironclad Robotics	$23K	Casey Martin, Director of Finance (ex-Valemont)
3	Ironclad Data	$23K	Reese Lindqvist, Controller (ex-Copperfield)

Orchard Robotics and Maplewood Holdings ($29K each) are cold.

Where this leaves the $327K

Source	Gross potential	Share of the $327K
Expansion: top 12 renewing accounts	$126K	39%
New logos: 8 warm prospects	$206K	63%
New logos: 2 cold prospects	$58K	18%
Total	$390K	119%

All of these are gross figures with no win rate applied. At realistic conversion, these lists will not cover the full gap in the fiscal year's remaining ~3 months. Most of the $327K would then roll into FY2027 unless more accounts are added to both lists.

Start with the expansion conversations at the three accounts with the most room relative to their contracts. Run them alongside outreach to the four warm prospects where a former VP Revenue or Head of RevOps now works: Silverlake, Lakeside, Harborview and Quarry Labs. Those are the people who signed or championed the deal before.

I can add these lists as tabs in the workbook, or break the expansion list down by product so each rep knows what to pitch.
```
