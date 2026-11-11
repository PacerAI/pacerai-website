-- Purchase confirm screen (PAC-164 steps 2–3, 2026-11-11). Not applied to remote D1.
-- Legal name reuses pricing_requests.company.
-- Apply before deploying the Worker that writes these columns:
--   npx wrangler d1 execute pacerai-leads --remote --file=migrations/0006_orders.sql
--
-- D1/SQLite cannot change the DEFAULT of the existing status column. The Worker inserts
-- status = 'submitted' on every new order. Rows already stored stay as they were.

ALTER TABLE pricing_requests ADD COLUMN billing_email TEXT;
ALTER TABLE pricing_requests ADD COLUMN billing_street TEXT;
ALTER TABLE pricing_requests ADD COLUMN billing_city TEXT;
ALTER TABLE pricing_requests ADD COLUMN billing_region TEXT;
ALTER TABLE pricing_requests ADD COLUMN billing_postal TEXT;
ALTER TABLE pricing_requests ADD COLUMN billing_country TEXT;
ALTER TABLE pricing_requests ADD COLUMN po_number TEXT;
ALTER TABLE pricing_requests ADD COLUMN terms_accepted_at TEXT;  -- ISO UTC, when the Order Terms box was checked
