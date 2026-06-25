import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'
import { incrementSendCounter } from '@/lib/newsletter-tracking'

function verifySvixSignature(payload, headers, secret) {
  const msgId = headers.get('svix-id')
  const msgTimestamp = headers.get('svix-timestamp')
  const msgSignature = headers.get('svix-signature')

  if (!msgId || !msgTimestamp || !msgSignature) return false

  // Check timestamp (5 min tolerance)
  const now = Math.floor(Date.now() / 1000)
  if (Math.abs(now - parseInt(msgTimestamp)) > 300) return false

  // Remove 'whsec_' prefix and decode secret
  const secretBytes = Buffer.from(secret.replace('whsec_', ''), 'base64')

  // Compute expected signature
  const signedContent = `${msgId}.${msgTimestamp}.${payload}`
  const expectedSig = crypto
    .createHmac('sha256', secretBytes)
    .update(signedContent)
    .digest('base64')

  // Check against provided signatures
  for (const sig of msgSignature.split(' ')) {
    if (sig.startsWith('v1,') && sig.slice(3) === expectedSig) return true
  }
  return false
}

export async function POST(request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  // Read raw body for signature verification
  const rawBody = await request.text()

  // Verify webhook signature
  if (!verifySvixSignature(rawBody, request.headers, process.env.RESEND_WEBHOOK_SECRET)) {
    console.error('Webhook signature verification failed')
    return new Response('Unauthorized', { status: 401 })
  }

  const event = JSON.parse(rawBody)
  const { type, data } = event
  const emailId = data?.email_id

  if (!emailId) {
    return new Response('OK', { status: 200 })
  }

  // Opens and clicks are tracked first-party via the open pixel / click
  // redirect (the SINGLE source of truth for engagement). We deliberately
  // ignore Resend's email.opened / email.clicked here: it halves open-event
  // load on the shared DB during a send, and removes the double-count the old
  // handler produced (it bumped total_opened on every open event, ungated).
  const kindMap = {
    'email.delivered': 'delivered',
    'email.bounced': 'bounced',
    'email.complained': 'complained',
  }
  const kind = kindMap[type]
  if (!kind) {
    return new Response('OK', { status: 200 })
  }

  const now = new Date().toISOString()

  try {
    // One guarded round trip: stamps the timestamp, guards status against a
    // downgrade, and returns a row ONLY on the first such event for the
    // recipient (so the aggregate counter is bumped once). No row = a duplicate
    // event OR not a newsletter recipient.
    const { data: rows, error } = await supabase.rpc('mark_receipt_by_resend', {
      p_resend_id: emailId,
      p_kind: kind,
      p_at: now,
    })

    if (error) {
      console.error('Webhook mark_receipt_by_resend error:', error.message || error)
      return new Response('OK', { status: 200 })
    }

    const rec = rows?.[0]

    if (!rec) {
      // Not a (first-time) newsletter recipient event. It may be a transactional
      // confirmation/reminder email — reconcile delivery/bounce/complaint against
      // the contact so the double opt-in flow is not a delivery blind spot.
      // (A duplicate newsletter event also lands here and is a harmless no-op:
      // a newsletter resend_id never matches a contact's confirmation_email_id.)
      await handleConfirmationEmailEvent(supabase, emailId, type)
      return new Response('OK', { status: 200 })
    }

    if (kind === 'delivered') {
      await incrementSendCounter(supabase, rec.send_id, 'total_delivered')
    } else if (kind === 'bounced') {
      await incrementSendCounter(supabase, rec.send_id, 'total_bounced')
      await supabase
        .from('contacts')
        .update({ newsletter_status: 'bounced' })
        .eq('id', rec.contact_id)
    } else if (kind === 'complained') {
      await supabase
        .from('contacts')
        .update({ newsletter_status: 'unsubscribed' })
        .eq('id', rec.contact_id)
    }

    console.log(`Webhook processed: ${type} for ${emailId}`)
  } catch (err) {
    console.error('Webhook processing error:', err)
    // Still return 200 to prevent Resend retries
  }

  return new Response('OK', { status: 200 })
}

/**
 * Reconcile a Resend event against a confirmation/reminder email we sent,
 * matched by the message id stored on the contact (contacts.confirmation_email_id).
 * Gives the double opt-in flow the delivery telemetry the broadcast path
 * already had — previously these events were dropped on the floor.
 */
async function handleConfirmationEmailEvent(supabase, emailId, type) {
  const statusMap = {
    'email.delivered': 'delivered',
    'email.bounced': 'bounced',
    'email.complained': 'complained',
  }
  const status = statusMap[type]
  if (!status) return

  const { data: contact } = await supabase
    .from('contacts')
    .select('id, newsletter_status')
    .eq('confirmation_email_id', emailId)
    .single()

  if (!contact) return

  const updates = { confirmation_email_status: status }

  // A hard bounce or spam complaint on the confirmation email means it will
  // never be confirmed. Take them out of the pending pile so the reminder cron
  // stops chasing an address that can't receive — mirrors the broadcast path.
  if (contact.newsletter_status === 'pending_confirmation') {
    if (status === 'bounced') updates.newsletter_status = 'bounced'
    else if (status === 'complained') updates.newsletter_status = 'unsubscribed'
  }

  await supabase.from('contacts').update(updates).eq('id', contact.id)

  console.log(`Confirmation email ${status} reconciled for contact ${contact.id}`)
}
