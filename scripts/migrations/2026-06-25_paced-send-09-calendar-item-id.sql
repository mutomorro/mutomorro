-- Paced-send rebuild — M9: link a send back to its content-calendar item
-- Date: 2026-06-25  ·  Follow-up to the paced-send cutover (charter Phase 5 deferred item)
--
-- WHY: the legacy synchronous runSend held `editorialItem` in memory and marked
-- the calendar item 'published' at the end of the send (route.js step 14). The
-- paced create-queue path snapshots content into newsletter_sends and hands off
-- to the drain cron, which only knows the send row — it has no calendar_item_id
-- to find, so editorial sends never flipped their calendar item to 'published'.
--
-- This adds that link. create-queue stamps calendar_item_id on the send row for
-- editorial sends; the drain's finalize() marks the calendar item published when
-- the send completes (see lib/newsletter-drain.js). Promo sends leave it null.
--
-- ADDITIVE AND REVERSIBLE: nullable column, ON DELETE SET NULL so deleting a
-- calendar item never blocks or cascades into the send history.

ALTER TABLE public.newsletter_sends
  ADD COLUMN IF NOT EXISTS calendar_item_id uuid
    REFERENCES public.calendar_items(id) ON DELETE SET NULL;

-- Lets finalize()/admin look up "which send published this calendar item" and
-- keeps the FK join cheap. Partial: only editorial sends carry the value.
CREATE INDEX IF NOT EXISTS idx_newsletter_sends_calendar_item_id
  ON public.newsletter_sends (calendar_item_id)
  WHERE calendar_item_id IS NOT NULL;

-- Rollback (manual):
--   DROP INDEX IF EXISTS idx_newsletter_sends_calendar_item_id;
--   ALTER TABLE public.newsletter_sends DROP COLUMN IF EXISTS calendar_item_id;
