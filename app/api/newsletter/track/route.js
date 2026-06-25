import { after } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { TRACKABLE_HOSTS, incrementSendCounter } from '@/lib/newsletter-tracking'

// 1x1 transparent GIF
const PIXEL = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
)

const PIXEL_HEADERS = {
  'Content-Type': 'image/gif',
  'Cache-Control': 'no-store, no-cache, must-revalidate',
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const rid = searchParams.get('rid')
  const url = searchParams.get('url')

  // If there's a URL, this is a click - validate it first.
  // Strict hostname check: prevents open redirect via "https://mutomorro.com.attacker.tld/...".
  if (url) {
    let parsed
    try {
      parsed = new URL(url)
    } catch {
      return Response.redirect('https://mutomorro.com', 302)
    }
    if (!TRACKABLE_HOSTS.has(parsed.hostname) || (parsed.protocol !== 'https:' && parsed.protocol !== 'http:')) {
      return Response.redirect('https://mutomorro.com', 302)
    }
  }

  // No rid: nothing to record — return pixel or redirect.
  if (!rid) {
    if (url) return Response.redirect(url, 302)
    return new Response(PIXEL, { headers: PIXEL_HEADERS })
  }

  // Record AFTER the response is sent — never hold the connection. The open
  // storm is independent of send pacing (a 10k issue can yield thousands of
  // opens in one minute regardless of how slowly we sent), so a per-open DB
  // round trip in the request path is exactly the connection pressure we are
  // removing. (The old handler blocked up to 2s waiting on the write.)
  after(() => recordTracking(rid, url).catch(err => console.error('Tracking error:', err)))

  if (url) return Response.redirect(url, 302)
  return new Response(PIXEL, { headers: PIXEL_HEADERS })
}

async function recordTracking(rid, url) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const now = new Date().toISOString()

  // Record the open. Every pixel hit (and every click) implies an open.
  // mark_receipt enforces the claimed-floor (never advances a not-yet-sent row's
  // status out of 'claimed') and returns a row ONLY on the first open for this
  // recipient — so the aggregate counter is bumped once per recipient, not once
  // per event. `counted` is true only when the row is durably sent.
  const { data: openRows, error: openErr } = await supabase
    .rpc('mark_receipt', { p_recipient_id: rid, p_kind: 'opened', p_at: now })
  if (openErr) {
    console.error('track: mark_receipt(opened) failed:', openErr.message || openErr)
    return
  }
  const open = openRows?.[0]
  if (open?.counted) {
    await incrementSendCounter(supabase, open.send_id, 'total_opened')
  }

  if (!url) return

  // Record the click. The first-party pixel is the SINGLE source for clicks
  // (the Resend webhook ignores click events), so no double-count.
  const { data: clickRows, error: clickErr } = await supabase
    .rpc('mark_receipt', { p_recipient_id: rid, p_kind: 'clicked', p_at: now })
  if (clickErr) {
    console.error('track: mark_receipt(clicked) failed:', clickErr.message || clickErr)
    return
  }
  const click = clickRows?.[0]
  if (click?.counted) {
    await incrementSendCounter(supabase, click.send_id, 'total_clicked')
    await supabase.from('signals').insert({
      contact_id: click.contact_id,
      type: 'newsletter-click',
      strength: 'medium',
      metadata: { url },
    })
  }
}
