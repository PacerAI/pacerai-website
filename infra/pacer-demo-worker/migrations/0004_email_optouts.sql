-- 0004_email_optouts — every address that asked to stop getting Pacer AI email. One list, one row per address.
--
-- Database: pacerai-leads, the same D1 database as `leads` and `pricing_requests`. Migrations 0001–0003 are kept in
-- pacerai-gtm/infra/whitepaper-worker/migrations/; this one is kept here, beside the Worker that owns the table
-- (pacer-demo-worker serves GET and POST /internal/optouts, src/optouts.ts). The number continues that sequence.
--
-- Nothing writes this table directly. Every write goes through POST /internal/optouts, with a source:
--   one_click  — the one-click unsubscribe in the Daily Pace Briefing (pacerai-platform-claude-native)
--   reply_stop — the nightly reply detector on Will's Mac, which reads "stop" / "unsubscribe" replies (pacerai-gtm)
--   manual     — added by hand
-- The briefing reads the whole list through GET /internal/optouts before it sends, and skips every address on it.
--
-- The first opt-out wins: a repeat POST for the same address changes nothing, so `source` and `created_at` record
-- the first request. The Worker has no delete route; taking an address off the list is a deliberate DELETE by hand.
--
-- Apply (production; needs Will's go):
--   cd infra/pacer-demo-worker && npx wrangler d1 execute pacerai-leads --remote --file migrations/0004_email_optouts.sql

CREATE TABLE IF NOT EXISTS email_optouts (
  email      TEXT PRIMARY KEY,   -- lower-cased by the Worker before it is written
  source     TEXT NOT NULL CHECK (source IN ('one_click', 'reply_stop', 'manual')),
  created_at TEXT NOT NULL,      -- ISO 8601 UTC, e.g. 2026-10-30T15:04:05.123Z (the same format as leads.created_at)
  detail     TEXT                -- optional note from the caller, e.g. the reply's message id or why it was added
);

CREATE INDEX IF NOT EXISTS idx_email_optouts_created ON email_optouts(created_at);
