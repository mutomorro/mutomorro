-- Add is_public to newsletter_sends + backfill historical rows.
-- Date: 2026-05-29
--
-- Context: launching a public newsletter archive at /newsletter. Every
-- newsletter_sends row now needs an explicit public/private flag.
--
-- Column shape:
--   is_public boolean NOT NULL DEFAULT true
--
-- Default 'true' is correct for *future* admin newsletter sends. The warm-up
-- script (scripts/send-warmup-manual.js) is changed in the same commit to
-- pass is_public=false explicitly.
--
-- Backfill rule (deviates from the brief — see inspect output below):
--
-- The brief said "earliest created_at row per issue_key stays public". For
-- the live data, that rule produces the wrong result on drift-v1:
--
--   inspect-newsletter-sends-duplicates.js shows:
--     - drift-v1: 3 rows. Earliest two are status='failed' (timeouts during
--       the first two send attempts). Only the THIRD row (created 09:48Z) is
--       status='complete' with 3625 sent — that is the actual canonical send.
--     - warmup-v1: 40 rows, every one a warm-up batch. None should be public.
--
-- Refined rule: the canonical row to keep public is the earliest
-- status='complete' row for issue_key='drift-v1'. Every other existing row
-- becomes private. This matches the brief's stated outcome ("first publicly
-- visible newsletter is the Drift edition") while handling the failed-retry
-- structure of drift-v1 cleanly.
--
-- Apply via Supabase MCP (matches existing migration workflow).

ALTER TABLE newsletter_sends
  ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT true;

COMMENT ON COLUMN newsletter_sends.is_public IS
  'Whether this send appears in the public /newsletter archive and sitemap. Defaults true for admin sends; the warm-up script writes false explicitly.';

-- Backfill: only the drift-v1 successful complete send stays public.
UPDATE newsletter_sends
SET is_public = false
WHERE id NOT IN (
  SELECT id FROM newsletter_sends
  WHERE issue_key = 'drift-v1' AND status = 'complete'
  ORDER BY created_at ASC
  LIMIT 1
);
