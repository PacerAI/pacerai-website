# Order emails: set up and test

**For:** Will, setting up the email step of the `/pricing/` order capture and checking it end to end.
**Status (2026-10-20): working.**
- **Test.** Will's test at 14:21 UTC sent both emails from `orders@mail.getpacerai.com`, and Slack said "visitor sent, Will sent".
- **Domain.** `mail.getpacerai.com` is verified in Resend; its 4 DNS records were added through Auto configure.
- **Key.** The current `RESEND_API_KEY` was tested with curl before it was uploaded.

Use this doc again to rotate the key or rebuild the setup.

When a visitor clicks **Choose** on getpacerai.com/pricing/, they enter a work email in the order card and the
`pacer-demo-worker` sends two emails through Resend, from `orders@mail.getpacerai.com`:

| To | Subject | Reply goes to |
|---|---|---|
| The visitor | Your Pacer AI pricing summary: *package* | Will |
| will@getpacerai.com | Pricing request: *company*, *package*, *ACV* | The visitor |

Everything else about a request works without email: the database rows, the Slack post and the Apollo list.

---

## 1–2. Test the key, then upload that same value

Do these in one terminal. The key is read into a shell variable without being shown or written to your
history. The test and the upload then use the identical value, so a stale clipboard or a stray space can't
slip in.

1. In Resend → **API Keys**, create a key: **Sending access**, domain `mail.getpacerai.com`. Copy it; it
   starts with `re_`.
2. Read the key and test it. At the prompt, paste the key and press Enter:
   ```bash
   cd ~/Documents/pacerai/pacerai-website/infra/pacer-demo-worker
   read -s "RK?Paste the Resend key: "; echo
   curl -s https://api.resend.com/emails -H "Authorization: Bearer $RK" -H "Content-Type: application/json" \
     -d '{"from":"Pacer AI <orders@mail.getpacerai.com>","to":["will@getpacerai.com"],"subject":"Resend key test","text":"The key and domain work."}'; echo
   ```
   | You see | It means |
   |---|---|
   | `{"id":"…"}` | Key and domain both work, and a test email is on its way. Go to step 3. |
   | `"statusCode":403` and "not verified" | The key works but the domain isn't verified yet. You can still upload it (step 3). |
   | `"statusCode":401` / `"API key is invalid"` | Not a live key. It may be a deleted key or the wrong clipboard. Copy the new key again and repeat. |
3. Upload that same value to the Worker:
   ```bash
   printf %s "$RK" | npx wrangler secret put RESEND_API_KEY --env="" && unset RK
   ```
   The last line must read `Success! Uploaded secret RESEND_API_KEY`. Never put the key in the command itself:
   `wrangler secret put <key>` creates a secret *named* after the key (this happened on 2026-10-19).

## 3. Verify the sending domain

1. Resend → **Domains** → **Add domain** → `mail.getpacerai.com`. Resend lists 3 DNS records:
   - an MX record on `send.mail`;
   - an SPF TXT record on `send.mail`;
   - a DKIM TXT record on `resend._domainkey.mail`.
2. Add them at WordPress.com → **Upgrades → Domains → getpacerai.com → DNS records**, or paste them to Claude,
   who adds them for you. They sit only under `mail.`; your Google Workspace mail on `getpacerai.com` is
   untouched.
3. Back in Resend, click **Verify DNS records**. It usually turns **Verified** within minutes; allow up to an hour.
   Re-running the curl in step 1 should now return an `id`.

## 4. Test end to end

Use **Will@getpacerai.com only**. Any other address is a real lead: it lands on the Apollo list and counts in HQ.

1. In an incognito window, open getpacerai.com/pricing/, set the users or hours, and click **Choose**. Enter
   Will@getpacerai.com, pass the bot check, then click **Email me this summary**.
   - Incognito matters: Site Kit hides GA4 from logged-in admins.
2. Within a minute you should get **both** emails at will@getpacerai.com. Check spam the first time.
3. Slack **#website-leads** shows *Pricing request: …* with **Emails: visitor sent, Will sent**.
4. GA4 → Reports → Realtime shows `pricing_choose`, then `pricing_request`.
5. The database has the request:
   ```bash
   cd ~/Documents/pacerai/pacerai-website/infra/pacer-demo-worker && npx wrangler d1 execute pacerai-leads --remote \
     --command "SELECT created_at, email, plan, billing, monthly_total, annual_contract_value, status FROM pricing_requests ORDER BY created_at DESC LIMIT 5"
   ```

At most 3 requests per address in 10 minutes send email. Later ones are still saved, and Slack says
"repeat request within 10 minutes".

## What Slack's "Emails:" line means

| Slack says | Meaning | Fix |
|---|---|---|
| `visitor sent, Will sent` | Working | None |
| `not sent: no RESEND_API_KEY` | The Worker has no key | Step 2 |
| `failed (401…)` | Resend rejected the key (the 2026-10-14 test) | Steps 1 and 2 |
| `failed (403: … not verified)` | The domain isn't verified | Step 3 |
| `not sent: repeat request within 10 minutes` | Throttled | Wait 10 minutes |

## Where a request goes

| Place | What is kept |
|---|---|
| D1 `pacerai-leads` → `leads` | One row, `source = pricing`. Lead stamping and HQ count it as a website lead. |
| D1 `pacerai-leads` → `pricing_requests` | Package, billing, users, hour blocks, monthly total, ACV, Price Book version, attribution, `status` (`requested` → `quoted` → `paid`) |
| Apollo | The contact, on the list `Signal_CONTACT_Website_PricingRequest`, with no sequence |
| Slack #website-leads | The full summary, where they came from, and the email outcome |
| GA4 | `pricing_choose` (a step) and `pricing_request` (an outcome; mark it a key event after its first hit) |

Code: `infra/pacer-demo-worker/src/order.ts`. Design and tracking: `docs/design/tracking/web-tracking.md`.
