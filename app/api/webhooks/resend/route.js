import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

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
  const svixId = request.headers.get('svix-id')

  if (!emailId) {
    return new Response('OK', { status: 200 })
  }

  try {
    // Find the newsletter recipient by resend_id
    const { data: recipient } = await supabase
      .from('newsletter_recipients')
      .select('id, send_id, contact_id, status')
      .eq('resend_id', emailId)
      .single()

    // Not a newsletter email (could be transactional) - ignore gracefully
    if (!recipient) {
      return new Response('OK', { status: 200 })
    }

    // Idempotency: check if this svix-id was already processed
    // We use the recipient status as a proxy - don't downgrade status
    const statusOrder = ['queued', 'sent', 'delivered', 'opened', 'clicked']
    const eventStatusMap = {
      'email.delivered': 'delivered',
      'email.opened': 'opened',
      'email.clicked': 'clicked',
      'email.bounced': 'bounced',
      'email.complained': 'complained',
    }

    const newStatus = eventStatusMap[type]
    if (!newStatus) {
      return new Response('OK', { status: 200 })
    }

    // For progression events, don't downgrade (e.g. don't go from clicked back to opened)
    if (
      statusOrder.includes(recipient.status) &&
      statusOrder.includes(newStatus) &&
      statusOrder.indexOf(newStatus) <= statusOrder.indexOf(recipient.status)
    ) {
      // Already at this status or beyond - but still allow aggregate counter updates for opens/clicks
      if (type !== 'email.opened' && type !== 'email.clicked') {
        return new Response('OK', { status: 200 })
      }
    }

    const now = new Date().toISOString()

    if (type === 'email.delivered') {
      await supabase
        .from('newsletter_recipients')
        .update({ status: 'delivered', delivered_at: now })
        .eq('id', recipient.id)

      await supabase.rpc('increment_field', { row_id: recipient.send_id, field_name: 'total_delivered' })
        .then(() => {})
        .catch(() => {
          // Fallback: direct update
          return supabase
            .from('newsletter_sends')
            .select('total_delivered')
            .eq('id', recipient.send_id)
            .single()
            .then(({ data: send }) => {
              if (send) {
                return supabase
                  .from('newsletter_sends')
                  .update({ total_delivered: (send.total_delivered || 0) + 1 })
                  .eq('id', recipient.send_id)
              }
            })
        })

    } else if (type === 'email.opened') {
      // Only update recipient status if not already opened or clicked
      if (recipient.status !== 'opened' && recipient.status !== 'clicked') {
        await supabase
          .from('newsletter_recipients')
          .update({ status: 'opened', opened_at: now })
          .eq('id', recipient.id)
      }

      // Always increment aggregate counters (Resend sends one event per open)
      const { data: send } = await supabase
        .from('newsletter_sends')
        .select('total_opened')
        .eq('id', recipient.send_id)
        .single()

      if (send) {
        await supabase
          .from('newsletter_sends')
          .update({ total_opened: (send.total_opened || 0) + 1 })
          .eq('id', recipient.send_id)
      }

      await supabase
        .from('contacts')
        .select('newsletter_opens')
        .eq('id', recipient.contact_id)
        .single()
        .then(({ data: contact }) => {
          if (contact) {
            return supabase
              .from('contacts')
              .update({ newsletter_opens: (contact.newsletter_opens || 0) + 1 })
              .eq('id', recipient.contact_id)
          }
        })

    } else if (type === 'email.clicked') {
      if (recipient.status !== 'clicked') {
        await supabase
          .from('newsletter_recipients')
          .update({ status: 'clicked', clicked_at: now })
          .eq('id', recipient.id)
      }

      const { data: send } = await supabase
        .from('newsletter_sends')
        .select('total_clicked')
        .eq('id', recipient.send_id)
        .single()

      if (send) {
        await supabase
          .from('newsletter_sends')
          .update({ total_clicked: (send.total_clicked || 0) + 1 })
          .eq('id', recipient.send_id)
      }

      await supabase
        .from('contacts')
        .select('newsletter_clicks')
        .eq('id', recipient.contact_id)
        .single()
        .then(({ data: contact }) => {
          if (contact) {
            return supabase
              .from('contacts')
              .update({ newsletter_clicks: (contact.newsletter_clicks || 0) + 1 })
              .eq('id', recipient.contact_id)
          }
        })

      // Write a signal for click engagement
      await supabase
        .from('signals')
        .insert({
          contact_id: recipient.contact_id,
          type: 'newsletter-click',
          strength: 'medium',
        })

    } else if (type === 'email.bounced') {
      await supabase
        .from('newsletter_recipients')
        .update({ status: 'bounced', bounced_at: now })
        .eq('id', recipient.id)

      const { data: send } = await supabase
        .from('newsletter_sends')
        .select('total_bounced')
        .eq('id', recipient.send_id)
        .single()

      if (send) {
        await supabase
          .from('newsletter_sends')
          .update({ total_bounced: (send.total_bounced || 0) + 1 })
          .eq('id', recipient.send_id)
      }

      await supabase
        .from('contacts')
        .update({ newsletter_status: 'bounced' })
        .eq('id', recipient.contact_id)

    } else if (type === 'email.complained') {
      await supabase
        .from('newsletter_recipients')
        .update({ status: 'complained' })
        .eq('id', recipient.id)

      await supabase
        .from('contacts')
        .update({ newsletter_status: 'unsubscribed' })
        .eq('id', recipient.contact_id)
    }

    console.log(`Webhook processed: ${type} for ${emailId}`)
  } catch (err) {
    console.error('Webhook processing error:', err)
    // Still return 200 to prevent Resend retries
  }

  return new Response('OK', { status: 200 })
}
