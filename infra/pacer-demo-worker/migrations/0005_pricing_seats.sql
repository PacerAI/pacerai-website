-- Price Book v2.0 (2026-11-10, PAC-164): the /pricing/ order card sells seats, not packages.
-- The v1 NOT NULL columns stay and are still filled by src/order.ts:
--   plan = 'seats', pacer_users = Rep + Manager pacing seats, planning_users = SLT seats, hour_blocks = 0.
-- Apply to the shared D1 database before deploying the Worker:
--   npx wrangler d1 execute pacerai-leads --remote --file=migrations/0005_pricing_seats.sql
ALTER TABLE pricing_requests ADD COLUMN rep_seats INTEGER;
ALTER TABLE pricing_requests ADD COLUMN manager_seats INTEGER;
ALTER TABLE pricing_requests ADD COLUMN slt_seats INTEGER;
ALTER TABLE pricing_requests ADD COLUMN setup_fee INTEGER;   -- USD, one-time; 0 without an SLT seat
