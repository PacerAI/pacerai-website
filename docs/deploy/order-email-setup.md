# Order emails: set up and test

**For:** Will, setting up the email step of the `/pricing/` order capture and checking it end to end.
**Status (2026-10-14):** Will's first test request saved correctly. It reached the database, Slack and Apollo,
but both emails failed with **401**: Resend rejected the API key. Fix steps 1 and 2, then do step 3.

When a visitor clicks **Choose** on getpacerai.com/pricing/, they enter a work email in the order card and the
`pacer-demo-worker` sends two emails through Resend, from `orders@mail.getpacerai.com`:

| To | Subject | Reply goes to |
|---|---|---|
| The visitor | Your Pacer AI pricing summary: *package* | Will |
| will@getpacerai.com | Pricing request: *company*, *package*, *ACV* | The visitor |

Everything else about a request works without email: the database rows, the Slack post and the Apollo list.

---

## 1. Get a working API key, and prove it before using it

1. In Resend → **API Keys**, create a key with **Sending access**. Copy the whole value; it starts with `re_`.
2. In your terminal, paste the key in place of `re_YOUR_KEY` and run:
   ```bash
   curl -s https://api.resend.com/emails \
     -H "Authorization: Bearer re_YOUR_KEY" -H "Content-Type: application/json" \
     -d '{"from":"Pacer AI <orders@mail.getpacerai.com>","to":["will@getpacerai.com"],"subject":"Resend test","text":"test"}'
   ```
   | You see | It means |
   |---|---|
   | `"statusCode":401` or `"API key is invalid"` | The key is wrong. Copy it again. |
   | `"statusCode":403` and "domain is not verified" | **The key works.** The domain isn't verified yet; that's step 3. |
   | `{"id":"…"}` | Key and domain both work, and a test email is on its way. |

   Never paste the key into chat, a file or a commit.

## 2. Put the key on the Worker

```bash
cd ~/Documents/pacerai/pacerai-website/infra/pacer-demo-worker && npx wrangler secret put RESEND_API_KEY
```

Paste the key at the prompt (it stays hidden) and press Enter. Use no quotes and no spaces. It takes effect at once;
no redeploy is needed.

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
