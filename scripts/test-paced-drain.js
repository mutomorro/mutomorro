/**
 * Paced-drain test harness (Phase 4 / PR-7).
 *
 * Runs the REAL drainOnce() against the live DB using self-cleaning SYNTHETIC
 * data (sentinel ids, issue_key 'zz-drain-test-*') and a MOCK Resend so no
 * emails leave. Exercises the exactly-once / no-skip / reclaim guarantees:
 *
 *   S1 clean drain + suppression skip        S2 concurrency A2 (two ticks)
 *   S3 partial batch B3                       S4 rate-limit B2
 *   S5 reclaim A1 (tick dies after claim)
 *
 * Usage: npx tsx scripts/test-paced-drain.js
 * Safe to re-run; cleans up before and after.
 */

import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'
import { drainOnce, reconcileSend } from '../lib/newsletter-drain.js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

const KEY_PREFIX = 'zz-drain-test'
const CID_LO = 999900000
const CID_HI = 999909999
const PROMO = {
  subject: 'ZZ Drain Test', previewText: 'test', headline: 'Hi [first name]',
  body: 'This is a synthetic test email body.', ctaText: 'Visit', ctaUrl: 'https://mutomorro.com',
}

// Stub render — the real renderEditorial/renderPromo are production-proven and
// pull in JSX templates that don't load outside Next; the harness exercises the
// drain ORCHESTRATION (claim/send/mark/reclaim) against the real RPCs.
const stubRender = async (_content, { email }) => ({
  html: '<p>zz test</p>',
  unsubscribeUrl: `https://mutomorro.com/api/unsubscribe?email=${encodeURIComponent(email)}`,
})

let cidSeq = CID_LO
let pass = 0, fail = 0
const check = (name, ok, detail = '') => {
  console.log(`${ok ? '  ✅' : '  ❌'} ${name}${detail ? ' — ' + detail : ''}`)
  ok ? pass++ : fail++
}

function mockResend({ behavior } = {}) {
  let calls = 0
  const sent = []
  return {
    stats: () => ({ calls, sent }),
    batch: {
      send: async (payloads, opts) => {
        calls++
        if (behavior === 'throw_once' && calls === 1) throw new Error('synthetic network error')
        if (behavior === 'rate_limit_once' && calls === 1) {
          return { data: null, error: { name: 'rate_limit_exceeded', message: 'rate', statusCode: 429 } }
        }
        const data = payloads.map((p, i) => {
          if (behavior === 'partial_once' && calls === 1 && i === payloads.length - 1) return { id: null }
          sent.push(p.to[0])
          return { id: `mock_${calls}_${i}` }
        })
        return { data: { data }, error: null }
      },
    },
    emails: { send: async () => ({ data: { id: 'mock' }, error: null }) },
  }
}

async function cleanup() {
  const { data: sends } = await supabase.from('newsletter_sends').select('id').like('issue_key', `${KEY_PREFIX}%`)
  const ids = (sends || []).map((s) => s.id)
  if (ids.length) await supabase.from('newsletter_recipients').delete().in('send_id', ids)
  await supabase.from('newsletter_sends').delete().like('issue_key', `${KEY_PREFIX}%`)
  await supabase.from('contacts').delete().like('signup_email', 'zzdrain-%@test.invalid')
}

/** Seed a draining send with N recipients. `statuses` = array of contacts'
 *  newsletter_status (length N). Returns { sendId, contactIds }. */
async function seed(key, statuses) {
  // contacts.id is GENERATED ALWAYS — let it auto-generate; pair back by email.
  const contactRows = statuses.map((ns) => ({
    first_name: 'ZZ', signup_email: `zzdrain-${cidSeq++}@test.invalid`, newsletter_status: ns,
  }))
  const { data: contacts, error: cErr } = await supabase.from('contacts')
    .insert(contactRows).select('id, signup_email')
  if (cErr) throw new Error('seed contacts: ' + cErr.message)

  const { data: send, error: sErr } = await supabase.from('newsletter_sends')
    .insert({ subject: PROMO.subject, issue_key: `${KEY_PREFIX}-${key}`, preview_text: PROMO.previewText, content_json: PROMO, status: 'draining', total_recipients: contacts.length })
    .select('id').single()
  if (sErr) throw new Error('seed send: ' + sErr.message)

  const recips = contacts.map((c) => ({ send_id: send.id, contact_id: c.id, email: c.signup_email, status: 'queued' }))
  const { error: rErr } = await supabase.from('newsletter_recipients').insert(recips)
  if (rErr) throw new Error('seed recipients: ' + rErr.message)
  return { sendId: send.id, contactIds: contacts.map((c) => c.id) }
}

async function recipientState(sendId) {
  const { data } = await supabase.from('newsletter_recipients').select('contact_id, status, resend_id').eq('send_id', sendId)
  const rows = data || []
  const sent = rows.filter((r) => r.resend_id)
  const dupByContact = {}
  for (const r of sent) dupByContact[r.contact_id] = (dupByContact[r.contact_id] || 0) + 1
  return {
    total: rows.length,
    sent: sent.length,
    skipped: rows.filter((r) => r.status === 'skipped').length,
    failed: rows.filter((r) => r.status === 'failed').length,
    queued: rows.filter((r) => r.status === 'queued').length,
    claimed: rows.filter((r) => r.status === 'claimed').length,
    dupContacts: Object.values(dupByContact).filter((n) => n > 1).length,
    distinctResend: new Set(sent.map((r) => r.resend_id)).size,
  }
}

async function drainToComplete(sendId, resend, opts = {}, maxTicks = 6) {
  let last
  for (let i = 0; i < maxTicks; i++) {
    last = await drainOnce(sendId, { supabase, resend, claimTimeoutS: 0, renderFn: stubRender, ...opts })
    if (last.status === 'complete' || last.status === 'paused_quota') break
  }
  return last
}

async function sendStatus(sendId) {
  const { data } = await supabase.from('newsletter_sends').select('status, total_sent, reconciled_at').eq('id', sendId).single()
  return data
}

async function run() {
  await cleanup()
  console.log('\n=== Paced-drain harness ===')

  // S1: clean drain + suppression skip (1 unsubscribed of 5)
  console.log('\nS1 clean drain + suppression')
  {
    const { sendId } = await seed('s1', ['active', 'confirmed', 'active', 'unsubscribed', 'active'])
    const resend = mockResend()
    const res = await drainToComplete(sendId, resend)
    const st = await recipientState(sendId)
    const ss = await sendStatus(sendId)
    check('send completed', res.status === 'complete', `status=${res.status}`)
    check('4 sent exactly once', st.sent === 4 && st.distinctResend === 4, `sent=${st.sent} distinct=${st.distinctResend}`)
    check('1 suppressed → skipped', st.skipped === 1, `skipped=${st.skipped}`)
    check('no duplicate contact', st.dupContacts === 0)
    check('total_sent derived = 4', ss.total_sent === 4, `total_sent=${ss.total_sent}, status=${ss.status}`)
    check('mock sent 4 emails', resend.stats().sent.length === 4, `mock=${resend.stats().sent.length}`)
    check('reconciled at finalize', ss.reconciled_at != null, `reconciled_at=${ss.reconciled_at ? 'set' : 'null'}`)
  }

  // S2: concurrency A2 — two ticks at once must not double-send
  console.log('\nS2 concurrency (two ticks, SKIP LOCKED)')
  {
    const { sendId } = await seed('s2', Array(12).fill('active'))
    const resend = mockResend()
    // Realistic CLAIM_TIMEOUT (default 300s) for the concurrent ticks: reclaim
    // must NOT re-queue a wave another tick is actively sending. (timeout=0 would
    // — that invariant is why CLAIM_TIMEOUT_S must exceed a tick's duration.)
    await Promise.all([
      drainOnce(sendId, { supabase, resend, renderFn: stubRender }),
      drainOnce(sendId, { supabase, resend, renderFn: stubRender }),
    ])
    await drainToComplete(sendId, resend) // finalize / mop up
    const st = await recipientState(sendId)
    check('12 sent exactly once', st.sent === 12 && st.distinctResend === 12, `sent=${st.sent} distinct=${st.distinctResend}`)
    check('no duplicate contact', st.dupContacts === 0, `dups=${st.dupContacts}`)
    check('mock no duplicate recipient', new Set(resend.stats().sent).size === resend.stats().sent.length, `mockSent=${resend.stats().sent.length}`)
  }

  // S3: partial batch B3 — one id dropped on first call stays claimable, sent later
  console.log('\nS3 partial batch')
  {
    const { sendId } = await seed('s3', Array(5).fill('active'))
    const resend = mockResend({ behavior: 'partial_once' })
    const res = await drainToComplete(sendId, resend)
    const st = await recipientState(sendId)
    check('send completed', res.status === 'complete', `status=${res.status}`)
    check('all 5 sent exactly once', st.sent === 5 && st.distinctResend === 5, `sent=${st.sent} distinct=${st.distinctResend}`)
    check('no duplicate contact', st.dupContacts === 0)
  }

  // S4: rate-limit B2 — first call 429, rows stay claimed, retried next tick
  console.log('\nS4 rate-limit')
  {
    const { sendId } = await seed('s4', Array(5).fill('active'))
    const resend = mockResend({ behavior: 'rate_limit_once' })
    const res = await drainToComplete(sendId, resend)
    const st = await recipientState(sendId)
    check('send completed', res.status === 'complete', `status=${res.status}`)
    check('all 5 sent exactly once', st.sent === 5 && st.distinctResend === 5, `sent=${st.sent} distinct=${st.distinctResend}`)
    check('no duplicate contact', st.dupContacts === 0)
  }

  // S5: reclaim A1 — a row left 'claimed' (resend_id NULL) is re-queued + sent
  console.log('\nS5 reclaim (tick died after claim)')
  {
    const { sendId, contactIds } = await seed('s5', Array(3).fill('active'))
    // Simulate a crashed tick: mark one recipient claimed with an old lease, no resend_id.
    await supabase.from('newsletter_recipients')
      .update({ status: 'claimed', claimed_at: new Date(Date.now() - 60_000).toISOString() })
      .eq('send_id', sendId).eq('contact_id', contactIds[0])
    const resend = mockResend()
    const res = await drainToComplete(sendId, resend)
    const st = await recipientState(sendId)
    check('send completed', res.status === 'complete', `status=${res.status}`)
    check('all 3 sent (claimed row reclaimed)', st.sent === 3 && st.distinctResend === 3, `sent=${st.sent}`)
    check('no duplicate contact', st.dupContacts === 0)
  }

  // S6: reconciliation catches a cross-batch dupe (one contact delivered in two
  // sibling sends of the same issue_key)
  console.log('\nS6 reconciliation (cross-batch dupe)')
  {
    const { data: cs } = await supabase.from('contacts')
      .insert([{ first_name: 'ZZ', signup_email: `zzdrain-${cidSeq++}@test.invalid`, newsletter_status: 'active' }])
      .select('id, signup_email')
    const c = cs[0]
    const mkSend = async (suffix) => {
      const { data: s } = await supabase.from('newsletter_sends')
        .insert({ subject: 'ZZ', issue_key: `${KEY_PREFIX}-s6`, preview_text: 't', content_json: PROMO, status: 'complete', total_recipients: 1 })
        .select('id').single()
      await supabase.from('newsletter_recipients')
        .insert({ send_id: s.id, contact_id: c.id, email: c.signup_email, status: 'sent', resend_id: `re_${suffix}` })
      return s.id
    }
    await mkSend('a')
    const sB = await mkSend('b')
    const rec = await reconcileSend(sB, { supabase, resend: mockResend() })
    check('reconcile flags cross-batch dupe', rec.ok === false && rec.dupContacts === 1, `ok=${rec.ok} dup=${rec.dupContacts} missing=${rec.missing}`)
  }

  await cleanup()
  console.log(`\n=== ${pass} passed, ${fail} failed ===\n`)
  process.exit(fail ? 1 : 0)
}

run().catch(async (e) => {
  console.error('Harness error:', e)
  try { await cleanup() } catch {}
  process.exit(1)
})
