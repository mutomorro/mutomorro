import crypto from 'crypto'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'
import { render } from '@react-email/components'
import { createElement } from 'react'
import NewsletterTemplate from '../../../../components/emails/newsletter-template.jsx'

function generateUnsubscribeUrl(email) {
  const token = crypto
    .createHmac('sha256', process.env.UNSUBSCRIBE_SECRET)
    .update(email)
    .digest('hex')
  return `https://mutomorro.com/api/unsubscribe?email=${encodeURIComponent(email)}&token=${token}`
}

export async function POST(request) {
  // Authenticate
  const authHeader = request.headers.get('authorization')
  if (!authHeader || authHeader !== `Bearer ${process.env.NEWSLETTER_SEND_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  try {
    const body = await request.json()
    const { action } = body

    if (action === 'create') {
      return await handleCreate(body, resend, supabase)
    } else if (action === 'resume') {
      return await handleResume(body, resend, supabase)
    } else {
      return Response.json({ error: 'Invalid action. Use "create" or "resume".' }, { status: 400 })
    }
  } catch (err) {
    console.error('Newsletter send error:', err)
    return Response.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}

async function checkDailyLimit(supabase, batchSize) {
  const todayStart = new Date()
  todayStart.setUTCHours(0, 0, 0, 0)

  const { count } = await supabase
    .from('newsletter_recipients')
    .select('*', { count: 'exact', head: true })
    .gte('sent_at', todayStart.toISOString())

  const sentToday = count || 0
  const DAILY_LIMIT = 110
  if (sentToday + batchSize > DAILY_LIMIT) {
    return {
      exceeded: true,
      sentToday,
      remaining: Math.max(0, DAILY_LIMIT - sentToday),
    }
  }
  return { exceeded: false, sentToday, remaining: DAILY_LIMIT - sentToday }
}

async function handleCreate(body, resend, supabase) {
  const {
    subject,
    title = '',
    previewText = '',
    date = '',
    leadText = '',
    sections,
    signoff = 'Until next month,',
    batchSize: rawBatchSize = 100,
    tierFilter,
    tagFilter,
    emailOverride,
  } = body

  if (!subject || !sections || !sections.length) {
    return Response.json({ error: 'subject and sections are required' }, { status: 400 })
  }

  const batchSize = Math.min(rawBatchSize, 100)

  // Check daily limit
  const limitCheck = await checkDailyLimit(supabase, batchSize)
  if (limitCheck.exceeded) {
    return Response.json({
      error: `Daily send limit would be exceeded. Sent today: ${limitCheck.sentToday}. Remaining: ${limitCheck.remaining}. Try again tomorrow or reduce batchSize to ${limitCheck.remaining}.`,
    }, { status: 429 })
  }

  // Render a "view in browser" version of the HTML with placeholder unsubscribe
  const viewInBrowserHtml = await render(
    createElement(NewsletterTemplate, {
      subject,
      title,
      previewText,
      date,
      leadText,
      sections,
      signoff,
      unsubscribeUrl: 'https://mutomorro.com',
      viewInBrowserUrl: '',
    })
  )

  // Create the newsletter_sends record
  const { data: send, error: sendError } = await supabase
    .from('newsletter_sends')
    .insert({
      subject,
      preview_text: previewText,
      content_json: body,
      html_body: viewInBrowserHtml,
      status: 'sending',
    })
    .select('id')
    .single()

  if (sendError) {
    console.error('Failed to create newsletter_sends record:', sendError)
    return Response.json({ error: 'Failed to create send record' }, { status: 500 })
  }

  const sendId = send.id

  // Query active contacts
  let contactsQuery = supabase
    .from('contacts')
    .select('id, signup_email, first_name')
    .eq('newsletter_status', 'active')
    .order('created_at', { ascending: true })

  if (tierFilter) {
    contactsQuery = contactsQuery.eq('tier', tierFilter)
  }

  if (tagFilter) {
    contactsQuery = contactsQuery.contains('tags', [tagFilter])
  }

  const { data: allContacts, error: contactsError } = await contactsQuery

  if (contactsError) {
    console.error('Failed to query contacts:', contactsError)
    return Response.json({ error: 'Failed to query contacts' }, { status: 500 })
  }

  // Update total_recipients
  await supabase
    .from('newsletter_sends')
    .update({ total_recipients: allContacts.length })
    .eq('id', sendId)

  // Take first batch
  const batch = allContacts.slice(0, batchSize)

  if (batch.length === 0) {
    await supabase
      .from('newsletter_sends')
      .update({ status: 'complete', completed_at: new Date().toISOString() })
      .eq('id', sendId)

    return Response.json({
      sendId,
      batchSent: 0,
      totalSent: 0,
      totalRecipients: 0,
      remaining: 0,
      status: 'complete',
    })
  }

  const result = await sendBatch({
    batch,
    sendId,
    subject,
    title,
    previewText,
    date,
    leadText,
    sections,
    signoff,
    emailOverride,
    resend,
    supabase,
  })

  const remaining = allContacts.length - result.batchSent
  const status = remaining === 0 ? 'complete' : 'sending'

  if (status === 'complete') {
    await supabase
      .from('newsletter_sends')
      .update({ status: 'complete', completed_at: new Date().toISOString() })
      .eq('id', sendId)
  }

  return Response.json({
    sendId,
    batchSent: result.batchSent,
    totalSent: result.batchSent,
    totalRecipients: allContacts.length,
    remaining,
    status,
    ...(emailOverride ? { testMode: true, emailOverride } : {}),
  })
}

async function handleResume(body, resend, supabase) {
  const { sendId, batchSize: rawBatchSize = 100, emailOverride } = body

  if (!sendId) {
    return Response.json({ error: 'sendId is required for resume' }, { status: 400 })
  }

  const batchSize = Math.min(rawBatchSize, 100)

  // Check daily limit
  const limitCheck = await checkDailyLimit(supabase, batchSize)
  if (limitCheck.exceeded) {
    return Response.json({
      error: `Daily send limit would be exceeded. Sent today: ${limitCheck.sentToday}. Remaining: ${limitCheck.remaining}. Try again tomorrow or reduce batchSize to ${limitCheck.remaining}.`,
    }, { status: 429 })
  }

  // Look up the send record
  const { data: send, error: sendError } = await supabase
    .from('newsletter_sends')
    .select('*')
    .eq('id', sendId)
    .single()

  if (sendError || !send) {
    return Response.json({ error: 'Send record not found' }, { status: 404 })
  }

  const contentJson = send.content_json
  const { subject, title = '', previewText = '', date = '', leadText = '', sections, signoff = 'Until next month,', tierFilter, tagFilter } = contentJson

  // Query active contacts
  let contactsQuery = supabase
    .from('contacts')
    .select('id, signup_email, first_name')
    .eq('newsletter_status', 'active')
    .order('created_at', { ascending: true })

  if (tierFilter) {
    contactsQuery = contactsQuery.eq('tier', tierFilter)
  }

  if (tagFilter) {
    contactsQuery = contactsQuery.contains('tags', [tagFilter])
  }

  const { data: allContacts, error: contactsError } = await contactsQuery

  if (contactsError) {
    return Response.json({ error: 'Failed to query contacts' }, { status: 500 })
  }

  // Get already-sent contact IDs
  const { data: alreadySent } = await supabase
    .from('newsletter_recipients')
    .select('contact_id')
    .eq('send_id', sendId)

  const sentContactIds = new Set((alreadySent || []).map(r => r.contact_id))
  const remainingContacts = allContacts.filter(c => !sentContactIds.has(c.id))

  // Take next batch
  const batch = remainingContacts.slice(0, batchSize)

  if (batch.length === 0) {
    await supabase
      .from('newsletter_sends')
      .update({ status: 'complete', completed_at: new Date().toISOString() })
      .eq('id', sendId)

    return Response.json({
      sendId,
      batchSent: 0,
      totalSent: send.total_sent || 0,
      totalRecipients: send.total_recipients,
      remaining: 0,
      status: 'complete',
    })
  }

  const result = await sendBatch({
    batch,
    sendId,
    subject,
    title,
    previewText,
    date,
    leadText,
    sections,
    signoff,
    emailOverride,
    resend,
    supabase,
  })

  const totalSent = (send.total_sent || 0) + result.batchSent
  const remaining = remainingContacts.length - result.batchSent
  const status = remaining === 0 ? 'complete' : 'sending'

  await supabase
    .from('newsletter_sends')
    .update({
      total_sent: totalSent,
      ...(status === 'complete' ? { status: 'complete', completed_at: new Date().toISOString() } : {}),
    })
    .eq('id', sendId)

  return Response.json({
    sendId,
    batchSent: result.batchSent,
    totalSent,
    totalRecipients: send.total_recipients,
    remaining,
    status,
    ...(emailOverride ? { testMode: true, emailOverride } : {}),
  })
}

async function sendBatch({ batch, sendId, subject, title, previewText, date, leadText, sections, signoff, emailOverride, resend, supabase }) {
  const viewInBrowserUrl = `https://mutomorro.com/newsletter/${sendId}`

  const now = new Date().toISOString()

  // Step 1: Create recipient records FIRST so we have IDs for tracking
  const recipientInserts = batch.map(contact => ({
    send_id: sendId,
    contact_id: contact.id,
    email: contact.signup_email,
    status: 'pending',
  }))

  const { data: insertedRecipients, error: insertError } = await supabase
    .from('newsletter_recipients')
    .insert(recipientInserts)
    .select('id, contact_id, email')

  if (insertError) {
    console.error('Failed to insert newsletter_recipients:', insertError)
    return { batchSent: 0 }
  }

  // Build a map from contact_id to recipient record (for the recipientId)
  const recipientMap = new Map()
  for (const r of insertedRecipients) {
    recipientMap.set(r.contact_id, r)
  }

  // Step 2: Render personalised HTML for each recipient (now with tracking)
  const emails = await Promise.all(
    batch.map(async (contact) => {
      const recipient = recipientMap.get(contact.id)
      const recipientId = recipient?.id || ''
      const unsubscribeUrl = generateUnsubscribeUrl(contact.signup_email)
      const rawName = contact.first_name?.trim()
      const firstName = rawName
        ? rawName.replace(/(^|[\s-])(\w)/g, (_, sep, c) => sep + c.toUpperCase())
        : ''
      const greeting = firstName ? `Hi ${firstName},` : 'Hi there,'
      const html = await render(
        createElement(NewsletterTemplate, {
          subject,
          title,
          previewText,
          date,
          leadText,
          greeting,
          sections,
          signoff,
          unsubscribeUrl,
          viewInBrowserUrl,
          recipientId,
        })
      )
      return {
        email: contact.signup_email,
        contactId: contact.id,
        recipientId,
        html,
        unsubscribeUrl,
      }
    })
  )

  // Step 3: Send via Resend
  const { data, error } = await resend.batch.send(
    emails.map(e => ({
      from: 'James from Mutomorro <hello@mutomorro.com>',
      to: [emailOverride || e.email],
      subject,
      html: e.html,
      headers: {
        'List-Unsubscribe': `<${e.unsubscribeUrl}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
      tags: [
        { name: 'newsletter_send_id', value: sendId },
        { name: 'type', value: 'newsletter' },
      ],
    }))
  )

  if (error) {
    console.error('Resend batch error:', error)
  }

  // Step 4: Update recipient records with Resend IDs
  let batchSent = 0
  const results = data?.data || data || []

  for (let i = 0; i < emails.length; i++) {
    const resendResult = Array.isArray(results) ? results[i] : null
    const resendId = resendResult?.id || null

    if (resendId) {
      batchSent++
      await supabase
        .from('newsletter_recipients')
        .update({ resend_id: resendId, status: 'sent', sent_at: now })
        .eq('id', emails[i].recipientId)
    }
  }

  // Update total_sent on the send record
  const { data: currentSend } = await supabase
    .from('newsletter_sends')
    .select('total_sent')
    .eq('id', sendId)
    .single()

  await supabase
    .from('newsletter_sends')
    .update({ total_sent: (currentSend?.total_sent || 0) + batchSent })
    .eq('id', sendId)

  return { batchSent }
}
