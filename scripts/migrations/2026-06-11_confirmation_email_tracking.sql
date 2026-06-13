-- Track the Resend message id + delivery status of the double opt-in
-- confirmation/reminder email so bounces/complaints/deliveries become visible.
-- Previously these transactional sends had no telemetry: the Resend webhook
-- only reconciled newsletter broadcast rows (newsletter_recipients.resend_id),
-- so a confirmation email that bounced left the contact silently stuck in
-- pending_confirmation.
--
-- Applied 2026-06-11 via Supabase migration `add_confirmation_email_tracking`.

alter table public.contacts
  add column if not exists confirmation_email_id text,
  add column if not exists confirmation_email_status text,
  add column if not exists confirmation_email_sent_at timestamptz;

-- The webhook looks contacts up by Resend message id on each delivery event.
create index if not exists contacts_confirmation_email_id_idx
  on public.contacts (confirmation_email_id);
