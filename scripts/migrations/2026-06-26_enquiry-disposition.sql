-- Enquiry disposition status on contact_submissions.
-- Date: 2026-06-26
--
-- Replaces the blunt `responded` boolean with a triage disposition so the inbox
-- can separate real leads from spam, dead-ends and noise. The app keeps `responded`
-- in sync (responded = status 'responded') so existing consumers stay correct.

ALTER TABLE public.contact_submissions
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'new';

UPDATE public.contact_submissions
  SET status = CASE WHEN responded THEN 'responded' ELSE 'new' END
  WHERE status = 'new';

ALTER TABLE public.contact_submissions DROP CONSTRAINT IF EXISTS contact_submissions_status_chk;
ALTER TABLE public.contact_submissions
  ADD CONSTRAINT contact_submissions_status_chk
  CHECK (status IN ('new', 'lead', 'responded', 'dismissed', 'spam'));

-- Rollback: ALTER TABLE public.contact_submissions DROP COLUMN status;
