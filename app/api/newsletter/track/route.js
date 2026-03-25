import { createClient } from '@supabase/supabase-js'

// 1x1 transparent GIF
const PIXEL = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
)

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const rid = searchParams.get('rid')
  const url = searchParams.get('url')

  // If there's a URL, this is a click - validate it first
  if (url) {
    // Only allow redirects to mutomorro.com (prevent open redirect)
    if (!url.startsWith('https://mutomorro.com')) {
      return Response.redirect('https://mutomorro.com', 302)
    }
  }

  // If no rid, return pixel or redirect gracefully
  if (!rid) {
    if (url) return Response.redirect(url, 302)
    return new Response(PIXEL, {
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    })
  }

  // Fire off tracking asynchronously - don't block the response
  const trackingPromise = recordTracking(rid, url)

  if (url) {
    // Click: redirect immediately, tracking runs in background
    trackingPromise.catch(err => console.error('Tracking error:', err))
    return Response.redirect(url, 302)
  }

  // Open: wait briefly for tracking, then return pixel
  // (Use waitUntil pattern if available, otherwise just don't block too long)
  try {
    await Promise.race([
      trackingPromise,
      new Promise(resolve => setTimeout(resolve, 2000)),
    ])
  } catch (err) {
    console.error('Tracking error:', err)
  }

  return new Response(PIXEL, {
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  })
}

async function recordTracking(rid, url) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const now = new Date().toISOString()

  // Look up the recipient
  const { data: recipient, error } = await supabase
    .from('newsletter_recipients')
    .select('id, send_id, contact_id, status, opened_at, clicked_at')
    .eq('id', rid)
    .single()

  if (error || !recipient) return

  const statusOrder = ['queued', 'pending', 'sent', 'delivered', 'opened', 'clicked']

  // --- Record open ---
  if (!recipient.opened_at) {
    // First open - set timestamp
    const openUpdate = { opened_at: now }
    // Only upgrade status if it won't downgrade
    if (statusOrder.indexOf('opened') > statusOrder.indexOf(recipient.status)) {
      openUpdate.status = 'opened'
    }
    await supabase
      .from('newsletter_recipients')
      .update(openUpdate)
      .eq('id', recipient.id)

    // Increment contact newsletter_opens
    const { data: contact } = await supabase
      .from('contacts')
      .select('newsletter_opens')
      .eq('id', recipient.contact_id)
      .single()

    if (contact) {
      await supabase
        .from('contacts')
        .update({ newsletter_opens: (contact.newsletter_opens || 0) + 1 })
        .eq('id', recipient.contact_id)
    }

    // Increment total_opened on the send record
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
  }

  // --- Record click (if url present) ---
  if (url && !recipient.clicked_at) {
    await supabase
      .from('newsletter_recipients')
      .update({ status: 'clicked', clicked_at: now })
      .eq('id', recipient.id)

    // Increment contact newsletter_clicks
    const { data: contact } = await supabase
      .from('contacts')
      .select('newsletter_clicks')
      .eq('id', recipient.contact_id)
      .single()

    if (contact) {
      await supabase
        .from('contacts')
        .update({ newsletter_clicks: (contact.newsletter_clicks || 0) + 1 })
        .eq('id', recipient.contact_id)
    }

    // Increment total_clicked on the send record
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

    // Write a signal
    await supabase
      .from('signals')
      .insert({
        contact_id: recipient.contact_id,
        type: 'newsletter-click',
        strength: 'medium',
        metadata: { url },
      })
  }
}
